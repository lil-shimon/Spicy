use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::connect_async;
use url::Url;

#[tokio::main]
async fn main() {
    let url = Url::parse("wss://ws-api-spot.kucoin.com/?token=TODO").unwrap();
    let (ws_stream, _) = connect_async(url).await.expect("Failed to connect");
    println!("connected");
}
