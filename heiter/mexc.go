/**
 * @module MEXC API統合
 * @context MEXC取引所のREST APIを使用してアカウント残高とティッカー価格を取得する。
 *          認証にはHMAC-SHA256署名を使用。外部ライブラリは使用せず標準ライブラリのみ。
 */
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"
)

// AccountResponse はMEXCアカウントAPIのレスポンス構造体
type AccountResponse struct {
	Balances []AccountBalance `json:"balances"`
}

// AccountBalance は個別資産の残高情報
type AccountBalance struct {
	Asset  string `json:"asset"`
	Free   string `json:"free"`
	Locked string `json:"locked"`
}

// TickerPrice はティッカー価格のレスポンス構造体
type TickerPrice struct {
	Symbol string `json:"symbol"`
	Price  string `json:"price"`
}

// signRequest はHMAC-SHA256でクエリ文字列に署名する
// @context MEXC APIの認証仕様に準拠。秘密鍵でクエリ文字列全体を署名し、
//
//	signature パラメータとして付与する方式。
func signRequest(queryString, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(queryString))
	return hex.EncodeToString(mac.Sum(nil))
}

// FetchAccountBalances はMEXCアカウントの全資産残高を取得する
// @request MEXCのウォレット残高をAPI経由で取得する
// @context GET /api/v3/account はtimestamp+signatureによる認証が必須。
//
//	recvWindow=5000でタイムスタンプの許容誤差を5秒に設定。
func FetchAccountBalances(cfg Config) ([]AccountBalance, error) {
	timestamp := time.Now().UnixMilli()
	queryString := fmt.Sprintf("timestamp=%d&recvWindow=5000", timestamp)

	signature := signRequest(queryString, cfg.MexcSecret)
	queryString = fmt.Sprintf("%s&signature=%s", queryString, signature)

	url := fmt.Sprintf("https://api.mexc.com/api/v3/account?%s", queryString)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("アカウントAPIリクエスト作成に失敗: %w", err)
	}
	req.Header.Set("X-MEXC-APIKEY", cfg.MexcAPIKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("アカウントAPIリクエスト送信に失敗: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("アカウントAPIレスポンス読み取りに失敗: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("アカウントAPI異常ステータス %d: %s", resp.StatusCode, string(body))
	}

	var accountResp AccountResponse
	if err := json.Unmarshal(body, &accountResp); err != nil {
		return nil, fmt.Errorf("アカウントAPIレスポンスのJSON解析に失敗: %w", err)
	}

	return accountResp.Balances, nil
}

// FetchTickerPrices は全ティッカーの現在価格を取得する
// @request USDT換算のために全通貨ペアの価格情報を取得する
// @context 公開エンドポイントのため認証不要。パラメータなしで全ティッカーを一括取得し、
//
//	symbol -> price のマップとして返す。
func FetchTickerPrices() (map[string]float64, error) {
	url := "https://api.mexc.com/api/v3/ticker/price"

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("ティッカーAPIリクエスト送信に失敗: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("ティッカーAPIレスポンス読み取りに失敗: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ティッカーAPI異常ステータス %d: %s", resp.StatusCode, string(body))
	}

	var tickers []TickerPrice
	if err := json.Unmarshal(body, &tickers); err != nil {
		return nil, fmt.Errorf("ティッカーAPIレスポンスのJSON解析に失敗: %w", err)
	}

	prices := make(map[string]float64, len(tickers))
	for _, t := range tickers {
		price, err := strconv.ParseFloat(t.Price, 64)
		if err != nil {
			// 解析不能な価格はスキップ（デリスト中の通貨ペア等）
			continue
		}
		prices[t.Symbol] = price
	}

	return prices, nil
}
