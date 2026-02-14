/**
 * @module MEXC API テスト
 * @context signRequestは純粋関数のためユニットテスト可能。
 *          FetchAccountBalances/FetchTickerPricesはConfig.MexcBaseURLを注入し、
 *          httptestでモックサーバーを使用してテストする。
 */
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// computeExpectedHMAC はテスト用にHMAC-SHA256を独立して計算する
// signRequestの実装と同じアルゴリズムだが、テストの期待値生成用として独立定義
func computeExpectedHMAC(message, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(message))
	return hex.EncodeToString(mac.Sum(nil))
}

func TestSignRequest_KnownInputOutput(t *testing.T) {
	queryString := "timestamp=1234567890000&recvWindow=5000"
	secret := "test-secret"

	// 期待値をテストヘルパーで独立計算
	expected := computeExpectedHMAC(queryString, secret)

	got := signRequest(queryString, secret)
	if got != expected {
		t.Errorf("signRequest(%q, %q) = %q, want %q", queryString, secret, got, expected)
	}

	// 署名はHMAC-SHA256の16進エンコードなので64文字（256ビット = 32バイト = 64ヘックス文字）
	if len(got) != 64 {
		t.Errorf("signature length = %d, want 64", len(got))
	}
}

func TestSignRequest_EmptyQueryString(t *testing.T) {
	secret := "test-secret"

	got := signRequest("", secret)

	// 空文字列でもHMAC-SHA256は有効な署名を生成する
	if got == "" {
		t.Error("signRequest with empty query string should return non-empty signature")
	}

	if len(got) != 64 {
		t.Errorf("signature length = %d, want 64", len(got))
	}

	expected := computeExpectedHMAC("", secret)
	if got != expected {
		t.Errorf("signRequest(%q, %q) = %q, want %q", "", secret, got, expected)
	}
}

func TestSignRequest_DifferentSecretsProduceDifferentSignatures(t *testing.T) {
	queryString := "timestamp=1234567890000&recvWindow=5000"

	sig1 := signRequest(queryString, "secret-one")
	sig2 := signRequest(queryString, "secret-two")

	if sig1 == sig2 {
		t.Errorf("different secrets should produce different signatures, both got %q", sig1)
	}
}

func TestSignRequest_Deterministic(t *testing.T) {
	queryString := "timestamp=1234567890000&recvWindow=5000"
	secret := "test-secret"

	// 同じ入力で複数回呼び出しても同じ結果を返すことを確認
	results := make([]string, 10)
	for i := 0; i < 10; i++ {
		results[i] = signRequest(queryString, secret)
	}

	for i := 1; i < len(results); i++ {
		if results[i] != results[0] {
			t.Errorf("signRequest is not deterministic: call 0 = %q, call %d = %q", results[0], i, results[i])
		}
	}
}

func TestFetchAccountBalances(t *testing.T) {
	tests := []struct {
		name           string
		mockStatusCode int
		mockBody       string
		wantLen        int
		wantFirstAsset string
		wantErr        string
	}{
		{
			name:           "正常レスポンス: 2資産を含む",
			mockStatusCode: 200,
			mockBody:       `{"balances":[{"asset":"BTC","free":"0.5","locked":"0.0"},{"asset":"USDT","free":"1000.0","locked":"50.0"}]}`,
			wantLen:        2,
			wantFirstAsset: "BTC",
			wantErr:        "",
		},
		{
			name:           "空のbalances配列",
			mockStatusCode: 200,
			mockBody:       `{"balances":[]}`,
			wantLen:        0,
			wantFirstAsset: "",
			wantErr:        "",
		},
		{
			name:           "APIエラー: 401 Unauthorized",
			mockStatusCode: 401,
			mockBody:       `{"msg":"Unauthorized"}`,
			wantLen:        0,
			wantFirstAsset: "",
			wantErr:        "異常ステータス",
		},
		{
			name:           "APIエラー: 500",
			mockStatusCode: 500,
			mockBody:       `{"msg":"Internal Server Error"}`,
			wantLen:        0,
			wantFirstAsset: "",
			wantErr:        "異常ステータス",
		},
		{
			name:           "不正なJSON",
			mockStatusCode: 200,
			mockBody:       `{invalid}`,
			wantLen:        0,
			wantFirstAsset: "",
			wantErr:        "JSON解析に失敗",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// リクエストヘッダーとクエリパラメータの検証
				if r.Header.Get("X-MEXC-APIKEY") == "" {
					t.Error("X-MEXC-APIKEY header is missing")
				}
				if r.URL.Query().Get("timestamp") == "" {
					t.Error("timestamp query parameter is missing")
				}
				if r.URL.Query().Get("signature") == "" {
					t.Error("signature query parameter is missing")
				}

				w.WriteHeader(tt.mockStatusCode)
				w.Write([]byte(tt.mockBody))
			}))
			defer server.Close()

			cfg := Config{
				MexcAPIKey:  "test-api-key",
				MexcSecret:  "test-secret",
				MexcBaseURL: server.URL,
			}

			balances, err := FetchAccountBalances(cfg)

			if tt.wantErr != "" {
				if err == nil {
					t.Fatalf("expected error containing %q, got nil", tt.wantErr)
				}
				if !strings.Contains(err.Error(), tt.wantErr) {
					t.Errorf("error = %q, want to contain %q", err.Error(), tt.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if len(balances) != tt.wantLen {
				t.Errorf("len(balances) = %d, want %d", len(balances), tt.wantLen)
			}

			if tt.wantFirstAsset != "" && len(balances) > 0 {
				if balances[0].Asset != tt.wantFirstAsset {
					t.Errorf("balances[0].Asset = %q, want %q", balances[0].Asset, tt.wantFirstAsset)
				}
			}
		})
	}
}

func TestFetchTickerPrices(t *testing.T) {
	tests := []struct {
		name           string
		mockStatusCode int
		mockBody       string
		wantLen        int
		wantBTCPrice   float64
		wantErr        string
	}{
		{
			name:           "正常レスポンス: 複数ティッカー",
			mockStatusCode: 200,
			mockBody:       `[{"symbol":"BTCUSDT","price":"50000.0"},{"symbol":"ETHUSDT","price":"3000.5"}]`,
			wantLen:        2,
			wantBTCPrice:   50000.0,
			wantErr:        "",
		},
		{
			name:           "空の配列",
			mockStatusCode: 200,
			mockBody:       `[]`,
			wantLen:        0,
			wantBTCPrice:   0,
			wantErr:        "",
		},
		{
			name:           "一部の価格が不正",
			mockStatusCode: 200,
			mockBody:       `[{"symbol":"BTCUSDT","price":"50000.0"},{"symbol":"INVALID","price":"not-a-number"}]`,
			wantLen:        1,
			wantBTCPrice:   50000.0,
			wantErr:        "",
		},
		{
			name:           "APIエラー: 500",
			mockStatusCode: 500,
			mockBody:       `{"msg":"Internal Server Error"}`,
			wantLen:        0,
			wantBTCPrice:   0,
			wantErr:        "異常ステータス",
		},
		{
			name:           "不正なJSON",
			mockStatusCode: 200,
			mockBody:       `[{invalid}]`,
			wantLen:        0,
			wantBTCPrice:   0,
			wantErr:        "JSON解析に失敗",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// パスの検証
				if r.URL.Path != "/api/v3/ticker/price" {
					t.Errorf("request path = %q, want %q", r.URL.Path, "/api/v3/ticker/price")
				}

				w.WriteHeader(tt.mockStatusCode)
				w.Write([]byte(tt.mockBody))
			}))
			defer server.Close()

			cfg := Config{
				MexcBaseURL: server.URL,
			}

			prices, err := FetchTickerPrices(cfg)

			if tt.wantErr != "" {
				if err == nil {
					t.Fatalf("expected error containing %q, got nil", tt.wantErr)
				}
				if !strings.Contains(err.Error(), tt.wantErr) {
					t.Errorf("error = %q, want to contain %q", err.Error(), tt.wantErr)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if len(prices) != tt.wantLen {
				t.Errorf("len(prices) = %d, want %d", len(prices), tt.wantLen)
			}

			if tt.wantBTCPrice > 0 {
				if price, ok := prices["BTCUSDT"]; !ok {
					t.Error("BTCUSDT not found in prices")
				} else if price != tt.wantBTCPrice {
					t.Errorf("prices[BTCUSDT] = %f, want %f", price, tt.wantBTCPrice)
				}
			}
		})
	}
}
