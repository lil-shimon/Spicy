/**
 * @module 三角アービトラージ定数定義
 * @context TSの constant.ts を Go に移植。
 *          18組の三角アービトラージ組み合わせと全ペアリスト。
 */
package main

// Triangles は三角アービトラージの全組み合わせ
var Triangles = []Triangle{
	{Name: "DOGE", Base: "BTC-USDT", Mid: "DOGE-BTC", Out: "DOGE-USDT"},
	{Name: "ADA", Base: "BTC-USDT", Mid: "ADA-BTC", Out: "ADA-USDT"},
	{Name: "ETH", Base: "BTC-USDT", Mid: "ETH-BTC", Out: "ETH-USDT"},
	{Name: "XMR", Base: "BTC-USDT", Mid: "XMR-BTC", Out: "XMR-USDT"},
	{Name: "XRP", Base: "BTC-USDT", Mid: "XRP-BTC", Out: "XRP-USDT"},
	{Name: "LTC", Base: "BTC-USDT", Mid: "LTC-BTC", Out: "LTC-USDT"},
	{Name: "KCS", Base: "BTC-USDT", Mid: "KCS-BTC", Out: "KCS-USDT"},
	{Name: "DOT", Base: "BTC-USDT", Mid: "DOT-BTC", Out: "DOT-USDT"},
	{Name: "XRP", Base: "ETH-USDT", Mid: "XRP-ETH", Out: "XRP-USDT"},
	{Name: "LTC", Base: "ETH-USDT", Mid: "LTC-ETH", Out: "LTC-USDT"},
	{Name: "SOL", Base: "KCS-USDT", Mid: "SOL-KCS", Out: "SOL-USDT"},
	{Name: "XRP", Base: "KCS-USDT", Mid: "XRP-KCS", Out: "XRP-USDT"},
	{Name: "SUI", Base: "KCS-USDT", Mid: "SUI-KCS", Out: "SUI-USDT"},
	{Name: "ADA", Base: "KCS-USDT", Mid: "ADA-KCS", Out: "ADA-USDT"},
	{Name: "HYPE", Base: "KCS-USDT", Mid: "HYPE-KCS", Out: "HYPE-USDT"},
	{Name: "DOGE", Base: "KCS-USDT", Mid: "DOGE-KCS", Out: "DOGE-USDT"},
	{Name: "PEPE", Base: "KCS-USDT", Mid: "PEPE-KCS", Out: "PEPE-USDT"},
	{Name: "LTC", Base: "KCS-USDT", Mid: "LTC-KCS", Out: "LTC-USDT"},
}

// AllPairs は全三角組み合わせから重複を排除した全ペアリストを返す
func AllPairs() []string {
	seen := make(map[string]bool)
	var pairs []string

	for _, tri := range Triangles {
		for _, p := range []string{tri.Base, tri.Mid, tri.Out} {
			if !seen[p] {
				seen[p] = true
				pairs = append(pairs, p)
			}
		}
	}

	return pairs
}
