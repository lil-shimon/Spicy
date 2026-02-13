/**
 * @module JSON ファイルストレージ
 * @context 残高スナップショットをJSONファイルに永続化し、前回実行時との差分比較を可能にする。
 *          初回実行時はファイル未存在を正常ケースとして扱い、nil を返す。
 */
package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
)

// AssetBalance は個別資産の残高情報を保持する
type AssetBalance struct {
	Asset     string  `json:"asset"`
	Free      float64 `json:"free"`
	Locked    float64 `json:"locked"`
	USDTValue float64 `json:"usdt_value"`
}

// BalanceSnapshot はある時点の全資産スナップショットを保持する
type BalanceSnapshot struct {
	Timestamp string         `json:"timestamp"`
	TotalUSDT float64        `json:"total_usdt"`
	Assets    []AssetBalance `json:"assets"`
}

// LoadPreviousBalance はJSONファイルから前回の残高スナップショットを読み込む
// @request 前回実行時の残高と比較するため、保存済みスナップショットを読み込む
// @context 初回実行時はファイルが存在しないため、(nil, nil) を返してエラーとしない。
//
//	それ以外の読み込みエラーはラップして返す。
func LoadPreviousBalance(filePath string) (*BalanceSnapshot, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		// 初回実行時: ファイル未存在は正常ケース
		if errors.Is(err, os.ErrNotExist) {
			return nil, nil
		}
		return nil, fmt.Errorf("残高ファイルの読み込みに失敗: %w", err)
	}

	var snapshot BalanceSnapshot
	if err := json.Unmarshal(data, &snapshot); err != nil {
		return nil, fmt.Errorf("残高JSONのパースに失敗: %w", err)
	}

	return &snapshot, nil
}

// SaveCurrentBalance は残高スナップショットをJSONファイルに保存する
// @request 今回の残高を次回比較用に永続化する
// @context 親ディレクトリが存在しない場合は自動作成する。
//
//	json.MarshalIndent で2スペースインデントにし、手動確認しやすくする。
func SaveCurrentBalance(filePath string, snapshot BalanceSnapshot) error {
	data, err := json.MarshalIndent(snapshot, "", "  ")
	if err != nil {
		return fmt.Errorf("残高のJSON変換に失敗: %w", err)
	}

	// 親ディレクトリが未作成の場合に備える
	dir := filepath.Dir(filePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("ディレクトリの作成に失敗 (%s): %w", dir, err)
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("残高ファイルの書き込みに失敗: %w", err)
	}

	return nil
}
