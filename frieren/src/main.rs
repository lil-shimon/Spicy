use futures_util::{SinkExt, StreamExt};
use tokio::select;
use tokio_tungstenite::connect_async;
use url::Url;

#[tokio::main]
async fn main() {
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
        "topic": "/market/ticker:BTC-USDT",
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

        loop {
            interval.tick().await;
            let ping = serde_json::json!({
                "id": "ping",
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

            println!("________________________ping sent_______________________");
        }
    };

    select! {
        _ = ping_task => println!("ping died"),
    }

    while let Some(msg) = read.next().await {
        match msg {
            Ok(m) => println!("msg: {:?}", m),
            Err(e) => {
                eprintln!("error: {:?}", e);
                break;
            }
        }
    }
}
