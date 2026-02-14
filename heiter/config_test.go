package main

import (
	"strings"
	"testing"
)

func TestLoadConfig(t *testing.T) {
	// 全テストケースで使用する環境変数キー
	envKeys := []string{"MEXC_API_KEY", "MEXC_SECRET", "DISCORD_WEBHOOK_URL", "HEITER_DATA_FILE", "MEXC_BASE_URL"}

	tests := []struct {
		name            string
		envVars         map[string]string
		wantErr         bool
		errContains     string
		wantDataFile    string
		wantAPIKey      string
		wantSecret      string
		wantWebhookURL  string
		wantMexcBaseURL string
	}{
		{
			name: "全必須変数が設定済み",
			envVars: map[string]string{
				"MEXC_API_KEY":        "test-api-key",
				"MEXC_SECRET":         "test-secret",
				"DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/test",
			},
			wantErr:         false,
			wantAPIKey:      "test-api-key",
			wantSecret:      "test-secret",
			wantWebhookURL:  "https://discord.com/api/webhooks/test",
			wantDataFile:    "data/balance.json",
			wantMexcBaseURL: "https://api.mexc.com",
		},
		{
			name: "MEXC_API_KEYが未設定",
			envVars: map[string]string{
				"MEXC_SECRET":         "test-secret",
				"DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/test",
			},
			wantErr:     true,
			errContains: "MEXC_API_KEY",
		},
		{
			name: "MEXC_SECRETが未設定",
			envVars: map[string]string{
				"MEXC_API_KEY":        "test-api-key",
				"DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/test",
			},
			wantErr:     true,
			errContains: "MEXC_SECRET",
		},
		{
			name: "DISCORD_WEBHOOK_URLが未設定",
			envVars: map[string]string{
				"MEXC_API_KEY": "test-api-key",
				"MEXC_SECRET":  "test-secret",
			},
			wantErr:     true,
			errContains: "DISCORD_WEBHOOK_URL",
		},
		{
			name: "DataFilePathのデフォルト値",
			envVars: map[string]string{
				"MEXC_API_KEY":        "test-api-key",
				"MEXC_SECRET":         "test-secret",
				"DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/test",
			},
			wantErr:         false,
			wantDataFile:    "data/balance.json",
			wantMexcBaseURL: "https://api.mexc.com",
		},
		{
			name: "DataFilePathのカスタム値",
			envVars: map[string]string{
				"MEXC_API_KEY":        "test-api-key",
				"MEXC_SECRET":         "test-secret",
				"DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/test",
				"HEITER_DATA_FILE":    "/custom/path.json",
			},
			wantErr:         false,
			wantDataFile:    "/custom/path.json",
			wantMexcBaseURL: "https://api.mexc.com",
		},
		{
			name: "MexcBaseURLのデフォルト値",
			envVars: map[string]string{
				"MEXC_API_KEY":        "test-api-key",
				"MEXC_SECRET":         "test-secret",
				"DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/test",
			},
			wantErr:         false,
			wantMexcBaseURL: "https://api.mexc.com",
		},
		{
			name: "MexcBaseURLのカスタム値",
			envVars: map[string]string{
				"MEXC_API_KEY":        "test-api-key",
				"MEXC_SECRET":         "test-secret",
				"DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/test",
				"MEXC_BASE_URL":       "https://testnet-api.mexc.com",
			},
			wantErr:         false,
			wantMexcBaseURL: "https://testnet-api.mexc.com",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// godotenv.Load()が実.envから読み込んだ値をクリア
			for _, key := range envKeys {
				t.Setenv(key, "")
			}

			// テストケースで指定された環境変数を設定
			for key, value := range tt.envVars {
				t.Setenv(key, value)
			}

			cfg, err := LoadConfig()

			if tt.wantErr {
				if err == nil {
					t.Fatal("エラーを期待したが、nilが返された")
				}
				if !strings.Contains(err.Error(), tt.errContains) {
					t.Errorf("エラーメッセージに %q が含まれることを期待したが、実際は %q", tt.errContains, err.Error())
				}
				return
			}

			if err != nil {
				t.Fatalf("エラーを期待しなかったが、エラーが返された: %v", err)
			}

			if tt.wantAPIKey != "" && cfg.MexcAPIKey != tt.wantAPIKey {
				t.Errorf("MexcAPIKey = %q, want %q", cfg.MexcAPIKey, tt.wantAPIKey)
			}
			if tt.wantSecret != "" && cfg.MexcSecret != tt.wantSecret {
				t.Errorf("MexcSecret = %q, want %q", cfg.MexcSecret, tt.wantSecret)
			}
			if tt.wantWebhookURL != "" && cfg.DiscordWebhookURL != tt.wantWebhookURL {
				t.Errorf("DiscordWebhookURL = %q, want %q", cfg.DiscordWebhookURL, tt.wantWebhookURL)
			}
			if tt.wantDataFile != "" && cfg.DataFilePath != tt.wantDataFile {
				t.Errorf("DataFilePath = %q, want %q", cfg.DataFilePath, tt.wantDataFile)
			}
			if tt.wantMexcBaseURL != "" && cfg.MexcBaseURL != tt.wantMexcBaseURL {
				t.Errorf("MexcBaseURL = %q, want %q", cfg.MexcBaseURL, tt.wantMexcBaseURL)
			}
		})
	}
}
