package main

import (
	"strings"
	"testing"
)

func TestLoadConfig(t *testing.T) {
	envKeys := []string{"DISCORD_WEBHOOK_URL"}

	tests := []struct {
		name           string
		envVars        map[string]string
		wantErr        bool
		errContains    string
		wantWebhookURL string
	}{
		{
			name: "全必須変数が設定済み",
			envVars: map[string]string{
				"DISCORD_WEBHOOK_URL": "https://discord.com/api/webhooks/test",
			},
			wantErr:        false,
			wantWebhookURL: "https://discord.com/api/webhooks/test",
		},
		{
			name:        "DISCORD_WEBHOOK_URLが未設定",
			envVars:     map[string]string{},
			wantErr:     true,
			errContains: "DISCORD_WEBHOOK_URL",
		},
		{
			name: "空文字列は未設定扱い",
			envVars: map[string]string{
				"DISCORD_WEBHOOK_URL": "",
			},
			wantErr:     true,
			errContains: "DISCORD_WEBHOOK_URL",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			for _, key := range envKeys {
				t.Setenv(key, "")
			}

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

			if tt.wantWebhookURL != "" && cfg.DiscordWebhookURL != tt.wantWebhookURL {
				t.Errorf("DiscordWebhookURL = %q, want %q", cfg.DiscordWebhookURL, tt.wantWebhookURL)
			}
		})
	}
}
