/**
 * @module MEXC API テスト
 * @context signRequestは純粋関数のためユニットテスト可能。
 *          FetchAccountBalances/FetchTickerPricesはURLがハードコードされているため、
 *          httptestによるテストは不可。リファクタリングが必要。
 */
package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
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

// NOTE: FetchAccountBalances と FetchTickerPrices はURLが "https://api.mexc.com" に
// ハードコードされているため、net/http/httptest を使ったユニットテストができない。
// テスト可能にするには以下のいずれかのリファクタリングが必要:
//   - baseURL を引数またはConfig経由で注入可能にする
//   - *http.Client を引数として受け取る（カスタムTransportでリダイレクト可能）
//   - インターフェースを定義してHTTPクライアントを抽象化する
