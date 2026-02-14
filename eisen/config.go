/**
 * @module 環境変数設定読み込み
 * @context Discord Webhook URLを環境変数から取得。
 *          godotenvで.envを自動読み込みする。
 */
package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config はアプリケーション設定を保持する
type Config struct {
	DiscordWebhookURL string
}

// LoadConfig は環境変数からConfigを生成する
// @request 環境変数からDiscord設定を読み込む
// @context 親プロジェクトの.envにDISCORD_WEBHOOK_URLが定義済み
func LoadConfig() (Config, error) {
	if err := godotenv.Load(); err != nil {
		log.Println("警告: .envファイルが見つかりません。環境変数が直接設定されていることを期待します")
	}

	webhookURL := os.Getenv("DISCORD_WEBHOOK_URL")
	if webhookURL == "" {
		return Config{}, fmt.Errorf("DISCORD_WEBHOOK_URL が設定されていません")
	}

	return Config{
		DiscordWebhookURL: webhookURL,
	}, nil
}
