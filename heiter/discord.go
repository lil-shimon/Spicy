// @module Discord Webhook通知
// @context MEXCウォレット残高モニターからDiscordへ通知を送信する。
//          既存TSプロジェクトと同じペイロード形式（{"content": "message"}）を使用。

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// discordPayload はDiscord Webhookに送信するJSONペイロード
type discordPayload struct {
	Content string `json:"content"`
}

// SendDiscordMessage はDiscord Webhookにメッセージを送信する
//
// @context Discord Webhookは成功時に200または204を返す。
//
//	TSプロジェクトと同じContent-Type: application/jsonで送信。
func SendDiscordMessage(webhookURL string, message string) error {
	payload := discordPayload{Content: message}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("JSONエンコードに失敗: %w", err)
	}

	resp, err := http.DefaultClient.Post(webhookURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("Discord Webhookへのリクエストに失敗: %w", err)
	}
	defer resp.Body.Close()

	// Discord Webhookは成功時に200または204を返す
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("Discord Webhookが異常ステータスを返却: %d", resp.StatusCode)
	}

	return nil
}
