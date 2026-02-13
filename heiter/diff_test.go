package main

import (
	"math"
	"testing"
)

func almostEqual(a, b, epsilon float64) bool {
	return math.Abs(a-b) < epsilon
}

const eps = 0.001

func TestCalcBalanceDiff(t *testing.T) {
	tests := []struct {
		name           string
		prev           *BalanceSnapshot
		curr           BalanceSnapshot
		wantPrevTotal  float64
		wantCurrTotal  float64
		wantDiffTotal  float64
		wantDiffPct    float64
		wantAssetDiffs []AssetDiff
	}{
		{
			name: "First run (prev=nil): DiffTotal=0, DiffPercent=0, empty AssetDiffs",
			prev: nil,
			curr: BalanceSnapshot{
				Timestamp: "2025-01-01T00:00:00Z",
				TotalUSDT: 1000.0,
				Assets: []AssetBalance{
					{Asset: "BTC", Free: 0.01, Locked: 0, USDTValue: 500.0},
					{Asset: "ETH", Free: 1.0, Locked: 0, USDTValue: 500.0},
				},
			},
			wantPrevTotal:  0,
			wantCurrTotal:  1000.0,
			wantDiffTotal:  0,
			wantDiffPct:    0,
			wantAssetDiffs: []AssetDiff{},
		},
		{
			name: "Normal diff: positive and negative changes across assets",
			prev: &BalanceSnapshot{
				Timestamp: "2025-01-01T00:00:00Z",
				TotalUSDT: 1000.0,
				Assets: []AssetBalance{
					{Asset: "BTC", Free: 0.01, Locked: 0, USDTValue: 500.0},
					{Asset: "ETH", Free: 1.0, Locked: 0, USDTValue: 300.0},
					{Asset: "SOL", Free: 10.0, Locked: 0, USDTValue: 200.0},
				},
			},
			curr: BalanceSnapshot{
				Timestamp: "2025-01-01T01:00:00Z",
				TotalUSDT: 1050.0,
				Assets: []AssetBalance{
					{Asset: "BTC", Free: 0.012, Locked: 0, USDTValue: 600.0},
					{Asset: "ETH", Free: 0.8, Locked: 0, USDTValue: 250.0},
					{Asset: "SOL", Free: 10.0, Locked: 0, USDTValue: 200.0},
				},
			},
			wantPrevTotal: 1000.0,
			wantCurrTotal: 1050.0,
			wantDiffTotal: 50.0,
			wantDiffPct:   5.0,
			wantAssetDiffs: []AssetDiff{
				{Asset: "BTC", PrevUSDT: 500.0, CurrUSDT: 600.0, DiffUSDT: 100.0},
				{Asset: "ETH", PrevUSDT: 300.0, CurrUSDT: 250.0, DiffUSDT: -50.0},
				{Asset: "SOL", PrevUSDT: 200.0, CurrUSDT: 200.0, DiffUSDT: 0.0},
			},
		},
		{
			name: "Zero division guard: prev.TotalUSDT=0 should not panic",
			prev: &BalanceSnapshot{
				Timestamp: "2025-01-01T00:00:00Z",
				TotalUSDT: 0,
				Assets:    []AssetBalance{},
			},
			curr: BalanceSnapshot{
				Timestamp: "2025-01-01T01:00:00Z",
				TotalUSDT: 500.0,
				Assets: []AssetBalance{
					{Asset: "BTC", Free: 0.005, Locked: 0, USDTValue: 500.0},
				},
			},
			wantPrevTotal: 0,
			wantCurrTotal: 500.0,
			wantDiffTotal: 500.0,
			wantDiffPct:   0,
			wantAssetDiffs: []AssetDiff{
				{Asset: "BTC", PrevUSDT: 0, CurrUSDT: 500.0, DiffUSDT: 500.0},
			},
		},
		{
			name: "Dust exclusion: asset with CurrUSDT<=0.01 and DiffUSDT==0 is excluded",
			prev: &BalanceSnapshot{
				Timestamp: "2025-01-01T00:00:00Z",
				TotalUSDT: 1000.0,
				Assets: []AssetBalance{
					{Asset: "BTC", Free: 0.01, Locked: 0, USDTValue: 500.0},
					{Asset: "SHIB", Free: 100.0, Locked: 0, USDTValue: 0.005},
				},
			},
			curr: BalanceSnapshot{
				Timestamp: "2025-01-01T01:00:00Z",
				TotalUSDT: 1100.0,
				Assets: []AssetBalance{
					{Asset: "BTC", Free: 0.012, Locked: 0, USDTValue: 600.0},
					{Asset: "SHIB", Free: 100.0, Locked: 0, USDTValue: 0.005},
				},
			},
			wantPrevTotal: 1000.0,
			wantCurrTotal: 1100.0,
			wantDiffTotal: 100.0,
			wantDiffPct:   10.0,
			wantAssetDiffs: []AssetDiff{
				{Asset: "BTC", PrevUSDT: 500.0, CurrUSDT: 600.0, DiffUSDT: 100.0},
			},
		},
		{
			name: "All assets filtered: when all current assets are dust with no change, AssetDiffs is empty not nil",
			prev: &BalanceSnapshot{
				Timestamp: "2025-01-01T00:00:00Z",
				TotalUSDT: 0.02,
				Assets: []AssetBalance{
					{Asset: "SHIB", Free: 100.0, Locked: 0, USDTValue: 0.005},
					{Asset: "DOGE", Free: 50.0, Locked: 0, USDTValue: 0.01},
				},
			},
			curr: BalanceSnapshot{
				Timestamp: "2025-01-01T01:00:00Z",
				TotalUSDT: 0.02,
				Assets: []AssetBalance{
					{Asset: "SHIB", Free: 100.0, Locked: 0, USDTValue: 0.005},
					{Asset: "DOGE", Free: 50.0, Locked: 0, USDTValue: 0.01},
				},
			},
			wantPrevTotal:  0.02,
			wantCurrTotal:  0.02,
			wantDiffTotal:  0,
			wantDiffPct:    0,
			wantAssetDiffs: []AssetDiff{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := CalcBalanceDiff(tt.prev, tt.curr)

			if !almostEqual(got.PreviousTotal, tt.wantPrevTotal, eps) {
				t.Errorf("PreviousTotal = %f, want %f", got.PreviousTotal, tt.wantPrevTotal)
			}
			if !almostEqual(got.CurrentTotal, tt.wantCurrTotal, eps) {
				t.Errorf("CurrentTotal = %f, want %f", got.CurrentTotal, tt.wantCurrTotal)
			}
			if !almostEqual(got.DiffTotal, tt.wantDiffTotal, eps) {
				t.Errorf("DiffTotal = %f, want %f", got.DiffTotal, tt.wantDiffTotal)
			}
			if !almostEqual(got.DiffPercent, tt.wantDiffPct, eps) {
				t.Errorf("DiffPercent = %f, want %f", got.DiffPercent, tt.wantDiffPct)
			}

			if got.AssetDiffs == nil {
				t.Fatal("AssetDiffs should not be nil, expected empty slice")
			}

			if len(got.AssetDiffs) != len(tt.wantAssetDiffs) {
				t.Fatalf("AssetDiffs length = %d, want %d", len(got.AssetDiffs), len(tt.wantAssetDiffs))
			}

			for i, wantAD := range tt.wantAssetDiffs {
				gotAD := got.AssetDiffs[i]
				if gotAD.Asset != wantAD.Asset {
					t.Errorf("AssetDiffs[%d].Asset = %q, want %q", i, gotAD.Asset, wantAD.Asset)
				}
				if !almostEqual(gotAD.PrevUSDT, wantAD.PrevUSDT, eps) {
					t.Errorf("AssetDiffs[%d].PrevUSDT = %f, want %f", i, gotAD.PrevUSDT, wantAD.PrevUSDT)
				}
				if !almostEqual(gotAD.CurrUSDT, wantAD.CurrUSDT, eps) {
					t.Errorf("AssetDiffs[%d].CurrUSDT = %f, want %f", i, gotAD.CurrUSDT, wantAD.CurrUSDT)
				}
				if !almostEqual(gotAD.DiffUSDT, wantAD.DiffUSDT, eps) {
					t.Errorf("AssetDiffs[%d].DiffUSDT = %f, want %f", i, gotAD.DiffUSDT, wantAD.DiffUSDT)
				}
			}
		})
	}
}
