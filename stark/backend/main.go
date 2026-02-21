// KuCoin WSからローソク足を受信し、フロントのWebSocketクライアントにリアルタイム配信する。

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// トークン取得APIのレスポンス構造
type TokenResponse struct {
	Data struct {
		Token           string `json:"token"`
		InstanceServers []struct {
			Endpoint string `json:"endpoint"`
		} `json:"instanceServers"`
	} `json:"data"`
}

// WebSocketで受け取るメッセージの構造
type WSMessage struct {
	Type    string     `json:"type"`
	Topic   string     `json:"topic"`
	Subject string     `json:"subject"`
	Data    CandleData `json:"data"`
}

// ローソク足データのフィールド
// candles配列: [時刻(unix秒), open, close, high, low, volume, turnover]
type CandleData struct {
	Symbol  string   `json:"symbol"`
	Candles []string `json:"candles"`
	Time    int64    `json:"time"`
}

// フロントに送るローソク足データ（Lightweight Charts互換フォーマット）
type Candle struct {
	Time   int64   `json:"time"`
	Open   float64 `json:"open"`
	High   float64 `json:"high"`
	Low    float64 `json:"low"`
	Close  float64 `json:"close"`
	Volume float64 `json:"volume"`
}

// フロントのWebSocketクライアントを管理するHub
type Hub struct {
	clients   map[*websocket.Conn]bool
	mu        sync.Mutex
	broadcast chan []byte
}

// ローカル開発のためOriginチェックをスキップ
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// newHub はHubを初期化して返す
func newHub() *Hub {
	return &Hub{
		clients:   make(map[*websocket.Conn]bool),
		broadcast: make(chan []byte, 256),
	}
}

// run はbroadcastチャンネルを監視し、接続中の全フロントクライアントにデータを送信する（goroutineで呼び出す）
func (h *Hub) run() {
	for msg := range h.broadcast {
		h.mu.Lock()
		for conn := range h.clients {
			if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				log.Printf("クライアントへの送信失敗: %v", err)
				conn.Close()
				delete(h.clients, conn)
			}
		}
		h.mu.Unlock()
	}
}

// serveWS はHTTPリクエストをWebSocketにアップグレードし、クライアントをHubに登録する
func (h *Hub) serveWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WSアップグレード失敗: %v", err)
		return
	}
	h.mu.Lock()
	h.clients[conn] = true
	h.mu.Unlock()
	log.Printf("フロントクライアント接続: %s", conn.RemoteAddr())

	// 切断検知のために読み取りループを維持する
	go func() {
		defer func() {
			h.mu.Lock()
			delete(h.clients, conn)
			h.mu.Unlock()
			conn.Close()
			log.Printf("フロントクライアント切断: %s", conn.RemoteAddr())
		}()
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				break
			}
		}
	}()
}

// KuCoin Public Bullet APIからWebSocket接続用のトークンとエンドポイントを取得する
func getToken() (token string, endpoint string, err error) {
	resp, err := http.Post(
		"https://api.kucoin.com/api/v1/bullet-public",
		"application/json",
		bytes.NewBuffer([]byte{}),
	)
	if err != nil {
		return "", "", fmt.Errorf("トークン取得リクエスト失敗: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", fmt.Errorf("レスポンス読み込み失敗: %w", err)
	}

	var tokenResp TokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", "", fmt.Errorf("レスポンスパース失敗: %w", err)
	}

	if len(tokenResp.Data.InstanceServers) == 0 {
		return "", "", fmt.Errorf("インスタンスサーバーが見つかりません")
	}

	return tokenResp.Data.Token, tokenResp.Data.InstanceServers[0].Endpoint, nil
}

// 18秒ごとにpingを送信してWebSocket接続を維持する（goroutineで呼び出す）
func pingLoop(conn *websocket.Conn) {
	ticker := time.NewTicker(18 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		ping := map[string]string{
			"id":   "ping",
			"type": "ping",
		}
		if err := conn.WriteJSON(ping); err != nil {
			log.Printf("ping送信失敗: %v", err)
			return
		}
	}
}

func main() {
	hub := newHub()
	go hub.run()

	// フロント向けWebSocketエンドポイントを登録
	http.HandleFunc("/ws", hub.serveWS)
	go http.ListenAndServe(":8080", nil)
	log.Println("HTTPサーバー起動: :8080")

	// トークンとエンドポイントを取得
	token, endpoint, err := getToken()
	if err != nil {
		log.Fatal(err)
	}

	// WebSocket接続URL組み立て
	wsURL := fmt.Sprintf("%s?token=%s", endpoint, token)
	log.Printf("WebSocket接続中: %s", endpoint)

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, nil)
	if err != nil {
		log.Fatalf("WebSocket接続失敗: %v", err)
	}
	defer conn.Close()

	// subscribeメッセージ送信
	subscribeMsg := map[string]interface{}{
		"id":             "1",
		"type":           "subscribe",
		"topic":          "/market/candles:BTC-USDT_1min",
		"privateChannel": false,
		"response":       true,
	}
	if err := conn.WriteJSON(subscribeMsg); err != nil {
		log.Fatalf("subscribe送信失敗: %v", err)
	}
	log.Println("BTC-USDT 1min ローソク足の受信を開始します...")

	// 18秒ごとのping送信をバックグラウンドで実行
	go pingLoop(conn)

	// メッセージ受信ループ
	for {
		_, rawMsg, err := conn.ReadMessage()
		if err != nil {
			log.Fatalf("メッセージ受信失敗: %v", err)
		}

		var msg WSMessage
		if err := json.Unmarshal(rawMsg, &msg); err != nil {
			log.Printf("メッセージパース失敗: %v", err)
			continue
		}

		// ローソク足更新メッセージのみ処理する
		if msg.Type != "message" || msg.Subject != "trade.candles.update" {
			continue
		}

		candles := msg.Data.Candles
		// candles配列が不完全な場合はスキップ
		if len(candles) < 7 {
			continue
		}

		// unix秒をtime.Timeに変換
		unixSec, _ := strconv.ParseInt(candles[0], 10, 64)
		t := time.Unix(unixSec, 0).Local()

		// 各OHLCVをfloatでパース（表示用）
		open, _   := strconv.ParseFloat(candles[1], 64)
		close_, _ := strconv.ParseFloat(candles[2], 64)
		high, _   := strconv.ParseFloat(candles[3], 64)
		low, _    := strconv.ParseFloat(candles[4], 64)
		volume, _ := strconv.ParseFloat(candles[5], 64)

		fmt.Printf(
			"[CANDLE] %s 1min | O:%.2f H:%.2f L:%.2f C:%.2f V:%.2f | %s\n",
			msg.Data.Symbol,
			open, high, low, close_, volume,
			t.Format("2006-01-02 15:04:05"),
		)

		// パースしたローソク足データをJSONにしてフロントに配信
		candle := Candle{
			Time:   unixSec,
			Open:   open,
			High:   high,
			Low:    low,
			Close:  close_,
			Volume: volume,
		}
		if candleJSON, err := json.Marshal(candle); err == nil {
			select {
			case hub.broadcast <- candleJSON:
			default:
				// バッファが詰まっている場合はスキップ
			}
		}
	}
}
