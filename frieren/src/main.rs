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
    let url = Url::parse("wss://ws-api-spot.kucoin.com/?token=TODO").unwrap();
    let (ws_stream, _) = connect_async(url).await.expect("Failed to connect");
    println!("connected");
}
