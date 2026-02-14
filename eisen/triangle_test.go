package main

import (
	"math"
	"testing"
)

func almostEqual(a, b, epsilon float64) bool {
	return math.Abs(a-b) < epsilon
}

const eps = 0.001

func TestCalcTriangleArbitrage(t *testing.T) {
	defaultParams := CalcParams{
		BuyBtcPair:    OrderBook{Bid: 1, Ask: 1},
		BuyTokenPair:  OrderBook{Bid: 1, Ask: 1},
		BuyStablePair: OrderBook{Bid: 1, Ask: 1},
		TakerFee:      0.001,
	}

	tests := []struct {
		name       string
		params     CalcParams
		wantOk     bool
		wantROI    float64
		wantUsdtOut float64
		checkDetail func(t *testing.T, d Detail)
	}{
		{
			name: "takerFee passthrough",
			params: CalcParams{
				BuyBtcPair:    defaultParams.BuyBtcPair,
				BuyTokenPair:  defaultParams.BuyTokenPair,
				BuyStablePair: defaultParams.BuyStablePair,
				TakerFee:      0.1,
			},
			wantOk:     false,
			checkDetail: func(t *testing.T, d Detail) {
				if !almostEqual(d.TakerFee, 0.1, eps) {
					t.Errorf("TakerFee = %f, want 0.1", d.TakerFee)
				}
			},
		},
		{
			name: "baseAsk=0 returns false",
			params: CalcParams{
				BuyBtcPair:    OrderBook{Bid: 1, Ask: 0},
				BuyTokenPair:  defaultParams.BuyTokenPair,
				BuyStablePair: defaultParams.BuyStablePair,
				TakerFee:      defaultParams.TakerFee,
			},
			wantOk:      false,
			wantROI:     -1,
			wantUsdtOut: 0,
		},
		{
			name: "midAsk=0 returns false",
			params: CalcParams{
				BuyBtcPair:    defaultParams.BuyBtcPair,
				BuyTokenPair:  OrderBook{Bid: 1, Ask: 0},
				BuyStablePair: defaultParams.BuyStablePair,
				TakerFee:      defaultParams.TakerFee,
			},
			wantOk:      false,
			wantROI:     -1,
			wantUsdtOut: 0,
		},
		{
			name: "outBid=0 returns false",
			params: CalcParams{
				BuyBtcPair:    defaultParams.BuyBtcPair,
				BuyTokenPair:  defaultParams.BuyTokenPair,
				BuyStablePair: OrderBook{Bid: 0, Ask: 1},
				TakerFee:      defaultParams.TakerFee,
			},
			wantOk:      false,
			wantROI:     -1,
			wantUsdtOut: 0,
		},
		{
			name: "baseAsk=-1 returns false",
			params: CalcParams{
				BuyBtcPair:    OrderBook{Bid: 1, Ask: -1},
				BuyTokenPair:  defaultParams.BuyTokenPair,
				BuyStablePair: defaultParams.BuyStablePair,
				TakerFee:      defaultParams.TakerFee,
			},
			wantOk:      false,
			wantROI:     -1,
			wantUsdtOut: 0,
		},
		{
			name: "midAsk=-1 returns false",
			params: CalcParams{
				BuyBtcPair:    defaultParams.BuyBtcPair,
				BuyTokenPair:  OrderBook{Bid: 1, Ask: -1},
				BuyStablePair: defaultParams.BuyStablePair,
				TakerFee:      defaultParams.TakerFee,
			},
			wantOk:      false,
			wantROI:     -1,
			wantUsdtOut: 0,
		},
		{
			name: "outBid=-1 returns false",
			params: CalcParams{
				BuyBtcPair:    defaultParams.BuyBtcPair,
				BuyTokenPair:  defaultParams.BuyTokenPair,
				BuyStablePair: OrderBook{Bid: -1, Ask: 1},
				TakerFee:      defaultParams.TakerFee,
			},
			wantOk:      false,
			wantROI:     -1,
			wantUsdtOut: 0,
		},
		{
			name: "profitable returns true",
			params: CalcParams{
				BuyBtcPair:    OrderBook{Bid: 1, Ask: 1},
				BuyTokenPair:  OrderBook{Bid: 1, Ask: 2},
				BuyStablePair: OrderBook{Bid: 3, Ask: 1},
				TakerFee:      defaultParams.TakerFee,
			},
			wantOk: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CalcTriangleArbitrage(tt.params)

			if got.Ok != tt.wantOk {
				t.Errorf("Ok = %v, want %v", got.Ok, tt.wantOk)
			}

			// ゼロ値ガード: wantROIが設定されている場合のみチェック
			if tt.wantROI != 0 && !almostEqual(got.ROI, tt.wantROI, eps) {
				t.Errorf("ROI = %f, want %f", got.ROI, tt.wantROI)
			}

			if tt.wantUsdtOut != 0 || tt.wantROI == -1 {
				if !almostEqual(got.UsdtOut, tt.wantUsdtOut, eps) {
					t.Errorf("UsdtOut = %f, want %f", got.UsdtOut, tt.wantUsdtOut)
				}
			}

			// profitable ケース: UsdtOut > 1 であること
			if tt.wantOk && got.UsdtOut <= 1 {
				t.Errorf("UsdtOut = %f, expected > 1 for profitable case", got.UsdtOut)
			}

			if tt.checkDetail != nil {
				tt.checkDetail(t, got.Detail)
			}
		})
	}
}
