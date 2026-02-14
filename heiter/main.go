/**
 * @module Heiter - MEXC ウォレット残高モニター
 * @context MEXCの資産状況をUSDT換算で取得し、前回との差分をDiscordに通知するCLIツール。
 *          cronで毎日実行する運用を想定。
 */
package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"
)

func run() error {
	// 1. 設定読み込み
	cfg, err := LoadConfig()
	if err != nil {
		return fmt.Errorf("設定読み込み失敗: %w", err)
	}

	// 2. MEXC口座残高を取得
	rawBalances, err := FetchAccountBalances(cfg)
	if err != nil {
		return fmt.Errorf("残高取得失敗: %w", err)
	}

	// 3. Free > 0 または Locked > 0 の資産のみ抽出
	type parsedBalance struct {
		Asset  string
		Free   float64
		Locked float64
	}
	var nonZero []parsedBalance
	for _, b := range rawBalances {
		free, errF := strconv.ParseFloat(b.Free, 64)
		if errF != nil {
			log.Printf("警告: %s の Free パース失敗: %v", b.Asset, errF)
			continue
		}
		locked, errL := strconv.ParseFloat(b.Locked, 64)
		if errL != nil {
			log.Printf("警告: %s の Locked パース失敗: %v", b.Asset, errL)
			continue
		}
		if free > 0 || locked > 0 {
			nonZero = append(nonZero, parsedBalance{Asset: b.Asset, Free: free, Locked: locked})
		}
	}

	// 4. ティッカー価格を取得
	prices, err := FetchTickerPrices()
	if err != nil {
		return fmt.Errorf("ティッカー価格取得失敗: %w", err)
	}

	// 5. 各資産のUSDT換算額を計算
	var assets []AssetBalance
	for _, b := range nonZero {
		var price float64
		if b.Asset == "USDT" {
			// USDTそのものは1:1
			price = 1.0
		} else {
			// "{ASSET}USDT" ペアで価格を検索
			ticker := b.Asset + "USDT"
			p, ok := prices[ticker]
			if !ok {
				log.Printf("警告: %s のUSDTペアが見つかりません（スキップ）", b.Asset)
				continue
			}
			price = p
		}

		usdtValue := b.Free * price
		if b.Locked > 0 {
			usdtValue += b.Locked * price
		}

		assets = append(assets, AssetBalance{
			Asset:     b.Asset,
			Free:      b.Free,
			Locked:    b.Locked,
			USDTValue: usdtValue,
		})
	}

	// 6. 合計USDT額を算出
	var totalUSDT float64
	for _, a := range assets {
		totalUSDT += a.USDTValue
	}

	// 7. スナップショット作成
	snapshot := BalanceSnapshot{
		Timestamp: time.Now().Format(time.RFC3339),
		TotalUSDT: totalUSDT,
		Assets:    assets,
	}

	// 8. 前回のスナップショットを読み込み
	prev, err := LoadPreviousBalance(cfg.DataFilePath)
	if err != nil {
		return fmt.Errorf("前回データ読み込み失敗: %w", err)
	}

	// 9. 差分計算
	diff := CalcBalanceDiff(prev, snapshot)

	// 10. 初回実行判定
	isFirstRun := prev == nil

	// 11. Discord通知メッセージ作成
	message := FormatDiscordMessage(snapshot, diff, isFirstRun)

	// 12. Discord送信
	if err := SendDiscordMessage(cfg.DiscordWebhookURL, message); err != nil {
		return fmt.Errorf("discord送信失敗: %w", err)
	}

	// 13. 現在のスナップショットを保存
	if err := SaveCurrentBalance(cfg.DataFilePath, snapshot); err != nil {
		return fmt.Errorf("データ保存失敗: %w", err)
	}

	// 14. 完了ログ
	log.Printf("Heiter: 残高レポートをDiscordに送信しました")
	return nil
}

func main() {
	if err := run(); err != nil {
		log.Printf("エラー: %v", err)
		// ベストエフォートでDiscordにエラー通知
		webhookURL := os.Getenv("DISCORD_WEBHOOK_URL")
		if webhookURL != "" {
			_ = SendDiscordMessage(webhookURL, fmt.Sprintf("**[Heiter] エラー**\n%v", err))
		}
		os.Exit(1)
	}
}
