use futures_util::{SinkExt, StreamExt};
use std::{collections::HashMap, pin};
use tokio::select;
use tokio_tungstenite::connect_async;
use url::Url;

#[derive(serde::Deserialize, Debug)]
struct SnapshotResp {
    code: String,
    data: SnapshotData,
}

#[derive(serde::Deserialize, Debug)]
struct SnapshotData {
    // Vec<[price, size]> = [string, string][]
    asks: Vec<[String; 2]>,
    bids: Vec<[String; 2]>,
    sequence: String,
    time: u64,
}

struct OrderBookState {
    asks: HashMap<String, String>,
    bids: HashMap<String, String>,
    last_sequence: String,
}

#[derive(serde::Deserialize, Debug)]
struct L2Message {
    data: Option<L2Data>,
}

#[derive(serde::Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct L2Data {
    changes: L2Changes,
    sequence_start: u64,
    sequence_end: u64,
    symbol: String,
    time: u64,
}

#[derive(serde::Deserialize, Debug)]
struct L2Changes {
    // price, size, sequence
    asks: Vec<[String; 3]>,
    bids: Vec<[String; 3]>,
}

fn build_orderbook(
    snapshot: &SnapshotResp,
) -> (HashMap<String, String>, HashMap<String, String>, u64) {
    let mut asks = HashMap::new();
    for ask in &snapshot.data.asks {
        asks.insert(ask[0].clone(), ask[1].clone());
    }

    let mut bids = HashMap::new();
    for bid in &snapshot.data.bids {
        bids.insert(bid[0].clone(), bid[1].clone());
    }

    let last_sequence: u64 = snapshot.data.sequence.parse().expect("Invalid sequence");
    (asks, bids, last_sequence)
}

struct KucoinConfig {
    token: String,
    endpoint: String,
    ping_interval: u64
}

async fn fetch_kucoin_config(client: &reqwest::Client) -> KucoinConfig {
    let token_endpoint = "https://api.kucoin.com/api/v1/bullet-public";
    let resp: serde_json::Value = client
        .post(token_endpoint)
        .send()
        .await
        .expect("Failed to send request token")
        .json()
        .await
        .expect("Failed to parse JSON");

    let token = resp["data"]["token"].as_str().expect("Token not found");
    let endpoint = resp["data"]["instanceServers"][0]["endpoint"]
        .as_str()
        .expect("Endpoint not found");

    let ping_interval = resp["data"]["instanceServers"][0]["pingInterval"]
        .as_u64()
        .unwrap_or(18_000);

    KucoinConfig {
        token: token.to_string(),
        endpoint: endpoint.to_string(),
        ping_interval
    }
}

// TODO: 現在の問題点
// 1. スナップショット取得 → WS接続の順序のため、間のメッセージが抜ける
// 2. 本来はWS接続後にメッセージをバッファしつつ、並列でスナップショットを取得すべき
//    - tokio::spawn + mpsc チャネルで実装
//    - バッファ内の seq > snapshot.sequence のメッセージだけ適用
// 3. changesをHashMapに反映する処理が未実装（size=="0"でremove, それ以外はinsert）
// 4. gap検出: last_sequence + 1 < sequence_start の場合の処理
#[tokio::main]
async fn main() {
    let snapshot_endpoint =
        "https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=BTC-USDT";
    let client = reqwest::Client::new();
    let snapshot_resp: SnapshotResp = client
        .get(snapshot_endpoint)
        .send()
        .await
        .expect("Failed to send request snapshot")
        .json()
        .await
        .expect("Failed to parse JSON snapshot");
    println!("snapshot: {:?}", snapshot_resp.data);

    let (mut asks, mut bids, mut last_sequence) = build_orderbook(&snapshot_resp);

    let config = fetch_kucoin_config(&client).await;


    let ping_interval = config.ping_interval * 4 / 5;
    println!("ping_interval: {:?}", ping_interval);

    let url = Url::parse(&format!("{}?token={}", config.endpoint, config.token)).unwrap();
    let (ws_stream, _) = connect_async(url).await.expect("Failed to connect");
    println!("connected");

    let (mut write, mut read) = ws_stream.split();

    let sub = serde_json::json!({
        "id": "probe-1",
        "type": "subscribe",
        "topic": "/market/level2:BTC-USDT",
        "response": true
    });

    write
        .send(tokio_tungstenite::tungstenite::Message::Text(
            sub.to_string(),
        ))
        .await
        .expect("sub failed");
    println!("subscribed");

    let ping_task = async {
        let mut interval = tokio::time::interval(std::time::Duration::from_millis(ping_interval));
        interval.tick().await;

        let mut count = 0;

        loop {
            interval.tick().await;
            count += 1;
            let ping = serde_json::json!({
                "id": format!("ping-{}", count),
                "type": "ping"
            });

            if write
                .send(tokio_tungstenite::tungstenite::Message::Text(
                    ping.to_string(),
                ))
                .await
                .is_err()
            {
                eprintln!("ping send failed");
                break;
            }

            println!("ping sent: {:?}", count);
        }
    };

    let recv_task = async {
        while let Some(msg) = read.next().await {
            match msg {
                Ok(m) => {
                    if let tokio_tungstenite::tungstenite::Message::Text(t) = m {
                        if let Ok(msg) = serde_json::from_str::<L2Message>(&t) {
                            if let Some(data) = msg.data {
                                let sequence_start = data.sequence_start;
                                println!("last_sequence: {:?}", last_sequence);
                                println!("sequence_start: {:?}", sequence_start);

                                if sequence_start == last_sequence {
                                    println!("same");
                                }

                                if sequence_start > last_sequence {
                                    // TODO: ここでchangesをasks/bids HashMapに反映する
                                    // - data.changes.asks/bids を回して insert/remove
                                    // - size == "0" → remove, それ以外 → insert
                                    // TODO: last_sequence は sequence_end で更新すべき
                                    last_sequence = sequence_start;
                                    println!("updated: {}", last_sequence);
                                }

                                if sequence_start < last_sequence {
                                    println!("older");
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("error: {:?}", e);
                    break;
                }
            }
        }
    };

    select! {
        _ = ping_task => println!("ping died"),
        _ = recv_task => println!("recv died"),
    }

    println!("disconnected");
}
