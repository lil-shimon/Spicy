package main

import (
	"encoding/json"
	"math"
	"os"
	"path/filepath"
	"testing"
)

func TestLoadPreviousBalance_FileNotFound(t *testing.T) {
	dir := t.TempDir()
	filePath := filepath.Join(dir, "nonexistent.json")

	snapshot, err := LoadPreviousBalance(filePath)

	if err != nil {
		t.Fatalf("expected nil error for missing file, got: %v", err)
	}
	if snapshot != nil {
		t.Fatalf("expected nil snapshot for missing file, got: %+v", snapshot)
	}
}

func TestLoadPreviousBalance_ValidJSON(t *testing.T) {
	dir := t.TempDir()
	filePath := filepath.Join(dir, "balance.json")

	data := `{
		"timestamp": "2025-01-15T10:30:00Z",
		"total_usdt": 1234.567,
		"assets": [
			{"asset": "BTC", "free": 0.5, "locked": 0.1, "usdt_value": 1000.0},
			{"asset": "ETH", "free": 2.0, "locked": 0.0, "usdt_value": 234.567}
		]
	}`
	if err := os.WriteFile(filePath, []byte(data), 0644); err != nil {
		t.Fatalf("failed to write test file: %v", err)
	}

	snapshot, err := LoadPreviousBalance(filePath)

	if err != nil {
		t.Fatalf("expected nil error, got: %v", err)
	}
	if snapshot == nil {
		t.Fatal("expected non-nil snapshot")
	}
	if snapshot.Timestamp != "2025-01-15T10:30:00Z" {
		t.Errorf("expected timestamp '2025-01-15T10:30:00Z', got '%s'", snapshot.Timestamp)
	}
	if math.Abs(snapshot.TotalUSDT-1234.567) > 0.001 {
		t.Errorf("expected total_usdt 1234.567, got %f", snapshot.TotalUSDT)
	}
	if len(snapshot.Assets) != 2 {
		t.Fatalf("expected 2 assets, got %d", len(snapshot.Assets))
	}
	if snapshot.Assets[0].Asset != "BTC" {
		t.Errorf("expected first asset 'BTC', got '%s'", snapshot.Assets[0].Asset)
	}
	if math.Abs(snapshot.Assets[0].Free-0.5) > 0.001 {
		t.Errorf("expected BTC free 0.5, got %f", snapshot.Assets[0].Free)
	}
	if math.Abs(snapshot.Assets[0].Locked-0.1) > 0.001 {
		t.Errorf("expected BTC locked 0.1, got %f", snapshot.Assets[0].Locked)
	}
	if math.Abs(snapshot.Assets[0].USDTValue-1000.0) > 0.001 {
		t.Errorf("expected BTC usdt_value 1000.0, got %f", snapshot.Assets[0].USDTValue)
	}
}

func TestLoadPreviousBalance_InvalidJSON(t *testing.T) {
	dir := t.TempDir()
	filePath := filepath.Join(dir, "balance.json")

	if err := os.WriteFile(filePath, []byte("not valid json!!!"), 0644); err != nil {
		t.Fatalf("failed to write test file: %v", err)
	}

	snapshot, err := LoadPreviousBalance(filePath)

	if err == nil {
		t.Fatal("expected error for invalid JSON, got nil")
	}
	if snapshot != nil {
		t.Errorf("expected nil snapshot for invalid JSON, got: %+v", snapshot)
	}
}

func TestSaveCurrentBalance_CreatesFileAndParentDirs(t *testing.T) {
	dir := t.TempDir()
	filePath := filepath.Join(dir, "nested", "subdir", "balance.json")

	snapshot := BalanceSnapshot{
		Timestamp: "2025-01-15T12:00:00Z",
		TotalUSDT: 500.0,
		Assets: []AssetBalance{
			{Asset: "USDT", Free: 500.0, Locked: 0.0, USDTValue: 500.0},
		},
	}

	if err := SaveCurrentBalance(filePath, snapshot); err != nil {
		t.Fatalf("expected nil error, got: %v", err)
	}

	// ファイルの存在確認
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		t.Fatal("expected file to exist after save")
	}

	// 保存内容が有効なJSONか確認
	data, err := os.ReadFile(filePath)
	if err != nil {
		t.Fatalf("failed to read saved file: %v", err)
	}

	var loaded BalanceSnapshot
	if err := json.Unmarshal(data, &loaded); err != nil {
		t.Fatalf("saved content is not valid JSON: %v", err)
	}

	if loaded.Timestamp != "2025-01-15T12:00:00Z" {
		t.Errorf("expected timestamp '2025-01-15T12:00:00Z', got '%s'", loaded.Timestamp)
	}
	if math.Abs(loaded.TotalUSDT-500.0) > 0.001 {
		t.Errorf("expected total_usdt 500.0, got %f", loaded.TotalUSDT)
	}
}

func TestSaveAndLoadRoundTrip(t *testing.T) {
	dir := t.TempDir()
	filePath := filepath.Join(dir, "balance.json")

	original := BalanceSnapshot{
		Timestamp: "2025-02-01T08:00:00Z",
		TotalUSDT: 9876.543,
		Assets: []AssetBalance{
			{Asset: "BTC", Free: 1.23, Locked: 0.45, USDTValue: 6000.0},
			{Asset: "ETH", Free: 10.5, Locked: 2.3, USDTValue: 3000.0},
			{Asset: "SOL", Free: 100.0, Locked: 0.0, USDTValue: 876.543},
		},
	}

	if err := SaveCurrentBalance(filePath, original); err != nil {
		t.Fatalf("save failed: %v", err)
	}

	loaded, err := LoadPreviousBalance(filePath)
	if err != nil {
		t.Fatalf("load failed: %v", err)
	}
	if loaded == nil {
		t.Fatal("expected non-nil snapshot after round-trip")
	}

	// Timestamp
	if loaded.Timestamp != original.Timestamp {
		t.Errorf("timestamp mismatch: expected '%s', got '%s'", original.Timestamp, loaded.Timestamp)
	}

	// TotalUSDT
	if math.Abs(loaded.TotalUSDT-original.TotalUSDT) > 0.001 {
		t.Errorf("total_usdt mismatch: expected %f, got %f", original.TotalUSDT, loaded.TotalUSDT)
	}

	// Assets count
	if len(loaded.Assets) != len(original.Assets) {
		t.Fatalf("assets count mismatch: expected %d, got %d", len(original.Assets), len(loaded.Assets))
	}

	// 各アセットのフィールドを検証
	for i, orig := range original.Assets {
		got := loaded.Assets[i]
		if got.Asset != orig.Asset {
			t.Errorf("asset[%d] name mismatch: expected '%s', got '%s'", i, orig.Asset, got.Asset)
		}
		if math.Abs(got.Free-orig.Free) > 0.001 {
			t.Errorf("asset[%d] free mismatch: expected %f, got %f", i, orig.Free, got.Free)
		}
		if math.Abs(got.Locked-orig.Locked) > 0.001 {
			t.Errorf("asset[%d] locked mismatch: expected %f, got %f", i, orig.Locked, got.Locked)
		}
		if math.Abs(got.USDTValue-orig.USDTValue) > 0.001 {
			t.Errorf("asset[%d] usdt_value mismatch: expected %f, got %f", i, orig.USDTValue, got.USDTValue)
		}
	}
}
