/**
 * @module 残高差分計算
 * @context 前回スナップショットと今回スナップショットを比較し、USDT換算の差分を算出する。
 *          純粋な計算関数のみ。I/Oは行わない。
 */
package main

// BalanceDiff は前回と今回の残高差分を表す
type BalanceDiff struct {
	PreviousTotal float64
	CurrentTotal  float64
	DiffTotal     float64
	DiffPercent   float64
	AssetDiffs    []AssetDiff
}

// AssetDiff は個別アセットのUSDT換算差分を表す
type AssetDiff struct {
	Asset    string
	PrevUSDT float64
	CurrUSDT float64
	DiffUSDT float64
}

// CalcBalanceDiff は前回と今回のスナップショットからUSDT換算の差分を計算する
// @request 前回との残高差分をUSDT換算で算出し、変動のあるアセットのみ抽出したい
// @context prev=nilは初回実行を意味する。ダスト（0.01 USDT未満）かつ変動なしのアセットは除外して
//
//	通知のノイズを減らす。
func CalcBalanceDiff(prev *BalanceSnapshot, curr BalanceSnapshot) BalanceDiff {
	if prev == nil {
		return BalanceDiff{
			PreviousTotal: 0,
			CurrentTotal:  curr.TotalUSDT,
			DiffTotal:     0,
			DiffPercent:   0,
			AssetDiffs:    []AssetDiff{},
		}
	}

	diffTotal := curr.TotalUSDT - prev.TotalUSDT

	// ゼロ除算ガード: 前回残高が0の場合はパーセント算出不可
	var diffPercent float64
	if prev.TotalUSDT != 0 {
		diffPercent = (diffTotal / prev.TotalUSDT) * 100
	}

	// 前回アセットをマップ化して高速ルックアップ
	prevMap := make(map[string]float64, len(prev.Assets))
	for _, a := range prev.Assets {
		prevMap[a.Asset] = a.USDTValue
	}

	var assetDiffs []AssetDiff
	for _, a := range curr.Assets {
		prevUSDT := prevMap[a.Asset]
		diffUSDT := a.USDTValue - prevUSDT

		// ダスト除外: 変動なし かつ 0.01 USDT未満のアセットはスキップ
		if diffUSDT == 0 && a.USDTValue <= 0.01 {
			continue
		}

		assetDiffs = append(assetDiffs, AssetDiff{
			Asset:    a.Asset,
			PrevUSDT: prevUSDT,
			CurrUSDT: a.USDTValue,
			DiffUSDT: diffUSDT,
		})
	}

	// nilスライス回避: 全アセットがフィルタされた場合も空スライスを返す
	if assetDiffs == nil {
		assetDiffs = []AssetDiff{}
	}

	return BalanceDiff{
		PreviousTotal: prev.TotalUSDT,
		CurrentTotal:  curr.TotalUSDT,
		DiffTotal:     diffTotal,
		DiffPercent:   diffPercent,
		AssetDiffs:    assetDiffs,
	}
}
