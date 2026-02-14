/**
 * @module Discord メッセージフォーマット
 * @context 残高スナップショットと差分情報をDiscord向けMarkdown形式に整形する。
 *          初回実行（差分なし）と通常実行（差分あり）で出力形式を切り替える。
 */
package main

import (
	"fmt"
	"sort"
	"strings"
	"time"
)

// jstLocation はAsia/Tokyoタイムゾーン（JST）のロケーション
var jstLocation *time.Location

func init() {
	var err error
	jstLocation, err = time.LoadLocation("Asia/Tokyo")
	if err != nil {
		// フォールバック: UTC+9を固定オフセットで生成
		jstLocation = time.FixedZone("JST", 9*60*60)
	}
}

// FormatDiscordMessage は残高スナップショットと差分をDiscord通知用メッセージに整形する
// @request 残高情報と前回比差分をDiscord Markdownで見やすくフォーマットしたい
// @context isFirstRun=trueの場合は差分行を省略し「初回実行のため差分なし」を末尾に付記。
//
//	アセットはUSDT換算額の降順でソートし、大きい保有から表示する。
func FormatDiscordMessage(snapshot BalanceSnapshot, diff BalanceDiff, isFirstRun bool) string {
	var b strings.Builder

	separator := "━━━━━━━━━━━━━━━━━━━━"

	// ヘッダー
	b.WriteString("**[Heiter] MEXC ウォレット残高レポート**\n")
	b.WriteString(separator)
	b.WriteString("\n")

	// 合計USDT
	fmt.Fprintf(&b, "📊 合計: **%s USDT**\n", formatUSDT(snapshot.TotalUSDT))

	// 前回比（初回実行時は省略）
	if !isFirstRun {
		diffIcon := "📈"
		if diff.DiffTotal < 0 {
			diffIcon = "📉"
		}
		fmt.Fprintf(&b, "%s 前回比: %s USDT (%s%%)\n",
			diffIcon,
			formatSignedUSDT(diff.DiffTotal),
			formatSignedPercent(diff.DiffPercent),
		)
	}

	// アセット一覧（USDT換算額の降順ソート）
	sortedAssets := make([]AssetBalance, len(snapshot.Assets))
	copy(sortedAssets, snapshot.Assets)
	sort.Slice(sortedAssets, func(i, j int) bool {
		return sortedAssets[i].USDTValue > sortedAssets[j].USDTValue
	})

	// アセット差分をマップ化（高速ルックアップ用）
	diffMap := make(map[string]float64, len(diff.AssetDiffs))
	for _, ad := range diff.AssetDiffs {
		diffMap[ad.Asset] = ad.DiffUSDT
	}

	b.WriteString("\n📦 保有資産:\n")
	for _, asset := range sortedAssets {
		line := fmt.Sprintf("  %s: %s (%s USDT)",
			asset.Asset,
			formatQuantity(asset.Free),
			formatUSDT(asset.USDTValue),
		)

		// 差分あり（初回でない場合のみ表示）
		if !isFirstRun {
			if d, ok := diffMap[asset.Asset]; ok && d != 0 {
				line += fmt.Sprintf(" [%s]", formatSignedUSDT(d))
			}
		}

		b.WriteString(line)
		b.WriteString("\n")
	}

	// フッター
	b.WriteString(separator)
	b.WriteString("\n")

	// タイムスタンプ（JST）
	now := time.Now().In(jstLocation)
	fmt.Fprintf(&b, "🕐 %s\n", now.Format("2006-01-02 15:04 MST"))

	// 初回実行メッセージ
	if isFirstRun {
		b.WriteString("📝 初回実行のため差分なし\n")
	}

	return strings.TrimRight(b.String(), "\n")
}

// formatUSDT はUSDT金額をカンマ区切り・小数2桁でフォーマットする
// @context Goのfmt.Sprintfにはカンマ区切り書式がないため手動で挿入する
func formatUSDT(value float64) string {
	// 小数2桁で文字列化
	raw := fmt.Sprintf("%.2f", value)

	// 整数部と小数部を分割
	parts := strings.SplitN(raw, ".", 2)
	intPart := parts[0]
	decPart := parts[1]

	// 負数対応: マイナス記号を一旦退避
	negative := false
	if strings.HasPrefix(intPart, "-") {
		negative = true
		intPart = intPart[1:]
	}

	// 3桁ごとにカンマを挿入（右から左へ処理）
	var commaBuilder strings.Builder
	for i, c := range intPart {
		if i > 0 && (len(intPart)-i)%3 == 0 {
			commaBuilder.WriteByte(',')
		}
		commaBuilder.WriteRune(c)
	}

	result := commaBuilder.String() + "." + decPart
	if negative {
		result = "-" + result
	}
	return result
}

// formatSignedUSDT は符号付きUSDT金額をフォーマットする（+/-を必ず表示）
func formatSignedUSDT(value float64) string {
	formatted := formatUSDT(value)
	if value > 0 {
		return "+" + formatted
	}
	// 負の場合はformatUSDTが既に"-"を含む
	return formatted
}

// formatSignedPercent は符号付きパーセント値をフォーマットする（+/-を必ず表示）
func formatSignedPercent(value float64) string {
	if value > 0 {
		return fmt.Sprintf("+%.2f", value)
	}
	// 負の場合はfmt.Sprintfが"-"を付与する
	return fmt.Sprintf("%.2f", value)
}

// formatQuantity はアセット数量を末尾ゼロを除去してフォーマットする
// @context BTCは0.01500のように精度が重要だが、USDTは整数的な値が多い。
//
//	%gは指数表記になるケースがあるため、%.8fから末尾ゼロをトリムする方式を採用。
func formatQuantity(value float64) string {
	// 小数8桁まで出力し、末尾の不要なゼロを除去
	s := fmt.Sprintf("%.8f", value)
	s = strings.TrimRight(s, "0")
	s = strings.TrimRight(s, ".")
	return s
}
