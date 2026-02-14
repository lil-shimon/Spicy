/**
 * @module 逆引きインデックス構築
 * @context 価格更新時に影響を受ける三角組み合わせを高速検索するため。
 *          TSのPriceServiceの逆引きロジックをGoに移植。
 */
package main

// BuildReverseIndex は各ペアがどの三角組み合わせで使われているかの逆引きを構築する
// @request 価格更新時に関連する三角だけ再計算したい
// @context "BTC-USDT"更新 → BTC系8三角のみ再計算。全18三角を毎回計算するのは無駄
func BuildReverseIndex(triangles []Triangle) map[string][]int {
	index := make(map[string][]int)

	for i, tri := range triangles {
		for _, pair := range []string{tri.Base, tri.Mid, tri.Out} {
			index[pair] = append(index[pair], i)
		}
	}

	return index
}
