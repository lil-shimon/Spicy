use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::connect_async;
use url::Url;

#[tokio::main]
async fn main() {
    let client = reqwest::Client::new();
    let resp: serde_json::Value = client
        .post("https://api.kucoin.com/api/v1/bullet-public")
        .send()
        .await
        .expect("Failed to send request token")
        .json()
        .await
        .expect("Failed to parse JSON");

    let token = resp["data"]["token"].as_str().expect("Token not found");
    let endpoint = resp["data"]["instanceServers"][0]["endpoint"].as_str().expect("Endpoint not found");
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

    write.send(tokio_tungstenite::tungstenite::Message::Text(sub.to_string())).await.expect("sub failed");
    println!("subscribed");

    while let Some(msg) = read.next().await {
        match msg {
            Ok(m) => println!("msg: {:?}", m),
            Err(e) => {
                eprintln!("error: {:?}",e);
                break;
            }
        }
    }
}
