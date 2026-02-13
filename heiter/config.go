/**
 * @module 環境変数設定読み込み
 * @context MEXC APIキー、Discord Webhook URL等を環境変数から取得。
 *          godotenvで親プロジェクトの.envを自動読み込みする。
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
	MexcAPIKey        string
	MexcSecret        string
	DiscordWebhookURL string
	DataFilePath      string
}

// LoadConfig は環境変数からConfigを生成する
// @request 環境変数からMEXC/Discord設定を読み込む
// @context 親プロジェクトの.envにMEXC_API_KEY, MEXC_SECRET, DISCORD_WEBHOOK_URLが定義済み
func LoadConfig() (Config, error) {
	// 親プロジェクトの.envを優先的に読み込み、なければカレントの.envを試行
	// .envが見つからなくても環境変数が直接設定されている場合があるためfatalにしない
	if err := godotenv.Load("../.env"); err != nil {
		if err := godotenv.Load(); err != nil {
			log.Println("警告: .envファイルが見つかりません。環境変数が直接設定されていることを期待します")
		}
	}

	apiKey := os.Getenv("MEXC_API_KEY")
	if apiKey == "" {
		return Config{}, fmt.Errorf("MEXC_API_KEY が設定されていません")
	}

	secret := os.Getenv("MEXC_SECRET")
	if secret == "" {
		return Config{}, fmt.Errorf("MEXC_SECRET が設定されていません")
	}

	webhookURL := os.Getenv("DISCORD_WEBHOOK_URL")
	if webhookURL == "" {
		return Config{}, fmt.Errorf("DISCORD_WEBHOOK_URL が設定されていません")
	}

	dataFile := os.Getenv("HEITER_DATA_FILE")
	if dataFile == "" {
		dataFile = "data/balance.json"
	}

	return Config{
		MexcAPIKey:        apiKey,
		MexcSecret:        secret,
		DiscordWebhookURL: webhookURL,
		DataFilePath:      dataFile,
	}, nil
}
