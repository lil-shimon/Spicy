/**
 * @module 三角アービトラージ利益計算
 * @context TSの calcTriangleArbitrage を Go に移植。
 *          純粋計算関数のみ。I/Oは行わない。
 */
package main

// OrderBook はbid/askの板情報を表す
type OrderBook struct {
	Bid float64
	Ask float64
}

// CalcParams は三角アービトラージ計算の入力パラメータ
type CalcParams struct {
	BuyBtcPair    OrderBook
	BuyTokenPair  OrderBook
	BuyStablePair OrderBook
	TakerFee      float64
}

// Detail は計算に使用した中間値を保持する
type Detail struct {
	BaseAsk  float64
	MidAsk   float64
	OutBid   float64
	TakerFee float64
	Epsilon  float64
}

// Result は三角アービトラージ計算の結果
type Result struct {
	Ok      bool
	UsdtIn  float64
	UsdtOut float64
	ROI     float64
	Detail  Detail
}

// Triangle は三角アービトラージの組み合わせを表す
type Triangle struct {
	Name string
	Base string
	Mid  string
	Out  string
}

const (
	// UsdtIn は基準入力（1USDTで倍率を見る）
	UsdtIn = 1.0
	// Epsilon は安全マージン 0.1%（手数料・微スリッページ吸収）
	Epsilon = 0.001
)

// CalcTriangleArbitrage は三角アービトラージの利益率を計算する
// @request TSの三角アービトラージ計算をGoに移植
// @context 純粋計算関数。baseAsk/midAsk/outBid <= 0 のガード付き。
func CalcTriangleArbitrage(params CalcParams) Result {
	baseAsk := params.BuyBtcPair.Ask
	midAsk := params.BuyTokenPair.Ask
	outBid := params.BuyStablePair.Bid

	detail := Detail{
		BaseAsk:  baseAsk,
		MidAsk:   midAsk,
		OutBid:   outBid,
		TakerFee: params.TakerFee,
		Epsilon:  Epsilon,
	}

	// ガード: 価格が0以下なら計算不可
	if baseAsk <= 0 || midAsk <= 0 || outBid <= 0 {
		return Result{Ok: false, UsdtIn: UsdtIn, UsdtOut: 0, ROI: -1, Detail: detail}
	}

	base := (UsdtIn / baseAsk) * (1 - params.TakerFee)
	mid := (base / midAsk) * (1 - params.TakerFee)
	out := mid * outBid * (1 - params.TakerFee)

	multiplier := out / UsdtIn
	roi := multiplier - 1

	ok := multiplier > 1+Epsilon

	return Result{Ok: ok, UsdtIn: UsdtIn, UsdtOut: out, ROI: roi, Detail: detail}
}
