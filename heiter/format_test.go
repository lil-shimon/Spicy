package main

import (
	"strings"
	"testing"
)

func Test_formatUSDT(t *testing.T) {
	tests := []struct {
		name     string
		value    float64
		expected string
	}{
		{"千の位カンマ区切り", 1234.56, "1,234.56"},
		{"1未満の値", 0.50, "0.50"},
		{"百万の位カンマ区切り", 1000000.00, "1,000,000.00"},
		{"カンマなしの2桁", 99.99, "99.99"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatUSDT(tt.value)
			if got != tt.expected {
				t.Errorf("formatUSDT(%v) = %q, want %q", tt.value, got, tt.expected)
			}
		})
	}
}

func Test_formatSignedUSDT(t *testing.T) {
	tests := []struct {
		name     string
		value    float64
		expected string
	}{
		{"正の値にプラス記号", 12.34, "+12.34"},
		{"負の値にマイナス記号", -5.00, "-5.00"},
		{"ゼロは符号なし", 0.00, "0.00"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatSignedUSDT(tt.value)
			if got != tt.expected {
				t.Errorf("formatSignedUSDT(%v) = %q, want %q", tt.value, got, tt.expected)
			}
		})
	}
}

func Test_formatSignedPercent(t *testing.T) {
	tests := []struct {
		name     string
		value    float64
		expected string
	}{
		{"正の値にプラス記号", 1.5, "+1.50"},
		{"負の値にマイナス記号", -2.3, "-2.30"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatSignedPercent(tt.value)
			if got != tt.expected {
				t.Errorf("formatSignedPercent(%v) = %q, want %q", tt.value, got, tt.expected)
			}
		})
	}
}

func Test_formatQuantity(t *testing.T) {
	tests := []struct {
		name     string
		value    float64
		expected string
	}{
		{"小数3桁の末尾ゼロ除去", 0.015, "0.015"},
		{"整数値の小数点除去", 1.0, "1"},
		{"小数2桁", 84.56, "84.56"},
		{"小数8桁の精度保持", 0.00000001, "0.00000001"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := formatQuantity(tt.value)
			if got != tt.expected {
				t.Errorf("formatQuantity(%v) = %q, want %q", tt.value, got, tt.expected)
			}
		})
	}
}

func TestFormatDiscordMessage_FirstRun(t *testing.T) {
	snapshot := BalanceSnapshot{
		Timestamp: "2025-01-01T00:00:00Z",
		TotalUSDT: 1000.00,
		Assets: []AssetBalance{
			{Asset: "BTC", Free: 0.015, Locked: 0, USDTValue: 600.00},
			{Asset: "ETH", Free: 1.0, Locked: 0, USDTValue: 400.00},
		},
	}
	diff := BalanceDiff{}

	got := FormatDiscordMessage(snapshot, diff, true)

	mustContain := []string{
		"[Heiter]",
		"合計",
		"保有資産",
		"初回実行のため差分なし",
	}
	for _, s := range mustContain {
		if !strings.Contains(got, s) {
			t.Errorf("初回実行メッセージに %q が含まれていない\n出力:\n%s", s, got)
		}
	}

	if strings.Contains(got, "前回比") {
		t.Errorf("初回実行メッセージに「前回比」が含まれてはいけない\n出力:\n%s", got)
	}
}

func TestFormatDiscordMessage_NormalRun(t *testing.T) {
	snapshot := BalanceSnapshot{
		Timestamp: "2025-01-01T01:00:00Z",
		TotalUSDT: 1050.00,
		Assets: []AssetBalance{
			{Asset: "BTC", Free: 0.015, Locked: 0, USDTValue: 630.00},
			{Asset: "ETH", Free: 1.0, Locked: 0, USDTValue: 420.00},
		},
	}
	diff := BalanceDiff{
		PreviousTotal: 1000.00,
		CurrentTotal:  1050.00,
		DiffTotal:     50.00,
		DiffPercent:   5.00,
		AssetDiffs: []AssetDiff{
			{Asset: "BTC", PrevUSDT: 600.00, CurrUSDT: 630.00, DiffUSDT: 30.00},
			{Asset: "ETH", PrevUSDT: 400.00, CurrUSDT: 420.00, DiffUSDT: 20.00},
		},
	}

	got := FormatDiscordMessage(snapshot, diff, false)

	mustContain := []string{
		"[Heiter]",
		"合計",
		"保有資産",
		"前回比",
		"[+",
	}
	for _, s := range mustContain {
		if !strings.Contains(got, s) {
			t.Errorf("通常実行メッセージに %q が含まれていない\n出力:\n%s", s, got)
		}
	}

	if strings.Contains(got, "初回実行のため差分なし") {
		t.Errorf("通常実行メッセージに「初回実行のため差分なし」が含まれてはいけない\n出力:\n%s", got)
	}
}

func TestFormatDiscordMessage_NegativeDiff(t *testing.T) {
	snapshot := BalanceSnapshot{
		Timestamp: "2025-01-01T02:00:00Z",
		TotalUSDT: 950.00,
		Assets: []AssetBalance{
			{Asset: "BTC", Free: 0.014, Locked: 0, USDTValue: 560.00},
			{Asset: "ETH", Free: 1.0, Locked: 0, USDTValue: 390.00},
		},
	}
	diff := BalanceDiff{
		PreviousTotal: 1000.00,
		CurrentTotal:  950.00,
		DiffTotal:     -50.00,
		DiffPercent:   -5.00,
		AssetDiffs: []AssetDiff{
			{Asset: "BTC", PrevUSDT: 600.00, CurrUSDT: 560.00, DiffUSDT: -40.00},
			{Asset: "ETH", PrevUSDT: 400.00, CurrUSDT: 390.00, DiffUSDT: -10.00},
		},
	}

	got := FormatDiscordMessage(snapshot, diff, false)

	if !strings.Contains(got, "[-") {
		t.Errorf("マイナス差分メッセージに \"[-\" が含まれていない\n出力:\n%s", got)
	}
}

func Test_formatQuantity_Zero(t *testing.T) {
	got := formatQuantity(0.0)
	if got != "0" {
		t.Errorf("formatQuantity(0.0) = %q, want %q", got, "0")
	}
}

func Test_formatUSDT_Zero(t *testing.T) {
	got := formatUSDT(0.0)
	if got != "0.00" {
		t.Errorf("formatUSDT(0.0) = %q, want %q", got, "0.00")
	}
}

func Test_formatUSDT_Negative(t *testing.T) {
	got := formatUSDT(-1234.56)
	if got != "-1,234.56" {
		t.Errorf("formatUSDT(-1234.56) = %q, want %q", got, "-1,234.56")
	}
}

func TestFormatDiscordMessage_EmptyAssets(t *testing.T) {
	snapshot := BalanceSnapshot{
		Timestamp: "2026-02-13T09:00:00+09:00",
		TotalUSDT: 0,
		Assets:    []AssetBalance{},
	}
	diff := BalanceDiff{
		CurrentTotal: 0,
		AssetDiffs:   []AssetDiff{},
	}
	msg := FormatDiscordMessage(snapshot, diff, true)
	if !strings.Contains(msg, "[Heiter]") {
		t.Error("message should contain [Heiter]")
	}
	if !strings.Contains(msg, "0.00 USDT") {
		t.Error("message should contain 0.00 USDT")
	}
	if !strings.Contains(msg, "保有資産") {
		t.Error("message should contain 保有資産")
	}
}
