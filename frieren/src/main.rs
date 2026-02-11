use futures_util::{SinkExt, StreamExt};
use std::collections::HashMap;
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
    sequenceStart: u64,
    sequenceEnd: u64,
    symbol: String,
    time: u64,
}

#[derive(serde::Deserialize, Debug)]
struct L2Changes {
    // price, size, sequence
    asks: Vec<[String; 3]>,
    bids: Vec<[String; 3]>,
}

#[tokio::main]
async fn main() {
    let snapshot_endpoint =
        "https://api.kucoin.com/api/v1/market/orderbook/level2_20?symbol=BTC-USDT";
    let token_endpoint = "https://api.kucoin.com/api/v1/bullet-public";
    let client = reqwest::Client::new();
    let resp: serde_json::Value = client
        .post(token_endpoint)
        .send()
        .await
        .expect("Failed to send request token")
        .json()
        .await
        .expect("Failed to parse JSON");

    let snapshot_resp: SnapshotResp = client
        .get(snapshot_endpoint)
        .send()
        .await
        .expect("Failed to send request snapshot")
        .json()
        .await
        .expect("Failed to parse JSON snapshot");
    println!("snapshot: {:?}", snapshot_resp.data);

    let asks_resp = snapshot_resp.data.asks;
    let mut asks = HashMap::new();
    println!("=== asks (top 5) ===");
    for ask in asks_resp.iter().take(5) {
        println!("  {} @ {}", ask[1], ask[0]);
    }

    for ask in &asks_resp {
        asks.insert(ask[0].clone(), ask[1].clone());
    }

    println!("=== bids (top 5) ===");
    let bid_resp = snapshot_resp.data.bids;
    let mut bids = HashMap::new();

    for bid in bid_resp.iter().take(5) {
        println!("  {} @ {}", bid[1], bid[0]);
    }

    for bid in &bid_resp {
        bids.insert(bid[0].clone(), bid[1].clone());
    }

    println!("sequence: {}", snapshot_resp.data.sequence);

    let token = resp["data"]["token"].as_str().expect("Token not found");
    let endpoint = resp["data"]["instanceServers"][0]["endpoint"]
        .as_str()
        .expect("Endpoint not found");

    let ping_interval = resp["data"]["instanceServers"][0]["pingInterval"]
        .as_u64()
        .unwrap_or(18_000);
    println!("ping_interval: {:?}", ping_interval);

    let ping_interval = ping_interval * 4 / 5;
    println!("ping_interval: {:?}", ping_interval);

    let ping_timeout = resp["data"]["instanceServers"][0]["pingTimeout"]
        .as_u64()
        .unwrap();
    println!("ping_timeout: {:?}", ping_timeout);

    let url = Url::parse(&format!("{}?token={}", endpoint, token)).unwrap();
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

    let last_sequence: u64 = snapshot_resp
        .data
        .sequence
        .parse()
        .expect("invalid sequence");

    let recv_task = async {
        while let Some(msg) = read.next().await {
            match msg {
                Ok(m) => {
                    if let tokio_tungstenite::tungstenite::Message::Text(t) = m {
                        if let Ok(msg) = serde_json::from_str::<L2Message>(&t) {
                            if let Some(data) = msg.data {
                                let sequence_start = data.sequenceStart;
                                println!("sequence_start: {:?}", sequence_start);

                                if (sequence_start + 1 == last_sequence) {
                                    println!("same");
                                }

                                if (sequence_start + 1 >= last_sequence) {
                                    println!("newer");
                                }

                                if (sequence_start + 1 <= last_sequence) {
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
