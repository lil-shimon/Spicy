package main

import (
	"reflect"
	"testing"
)

func TestBuildReverseIndex(t *testing.T) {
	t.Run("全三角で逆引き構築", func(t *testing.T) {
		index := BuildReverseIndex(Triangles)

		// BTC-USDT は最初の8三角(index 0-7)で使われる
		wantBTC := []int{0, 1, 2, 3, 4, 5, 6, 7}
		if got := index["BTC-USDT"]; !reflect.DeepEqual(got, wantBTC) {
			t.Errorf("BTC-USDT = %v, want %v", got, wantBTC)
		}

		// DOGE-BTC は index 0 のみ
		wantDOGE := []int{0}
		if got := index["DOGE-BTC"]; !reflect.DeepEqual(got, wantDOGE) {
			t.Errorf("DOGE-BTC = %v, want %v", got, wantDOGE)
		}

		// KCS-USDT は index 10-17
		wantKCS := []int{10, 11, 12, 13, 14, 15, 16, 17}
		if got := index["KCS-USDT"]; !reflect.DeepEqual(got, wantKCS) {
			t.Errorf("KCS-USDT = %v, want %v", got, wantKCS)
		}

		// 全ペアがカバーされている
		allPairs := AllPairs()
		for _, pair := range allPairs {
			if _, exists := index[pair]; !exists {
				t.Errorf("ペア %q がインデックスに存在しない", pair)
			}
		}
	})

	t.Run("単一三角", func(t *testing.T) {
		single := []Triangle{
			{Name: "TEST", Base: "A-B", Mid: "C-A", Out: "C-B"},
		}
		index := BuildReverseIndex(single)

		for _, pair := range []string{"A-B", "C-A", "C-B"} {
			want := []int{0}
			if got := index[pair]; !reflect.DeepEqual(got, want) {
				t.Errorf("%s = %v, want %v", pair, got, want)
			}
		}
	})

	t.Run("空スライス", func(t *testing.T) {
		index := BuildReverseIndex([]Triangle{})
		if len(index) != 0 {
			t.Errorf("空スライスなのにlen=%d", len(index))
		}
	})

	t.Run("共有ペアの重複", func(t *testing.T) {
		shared := []Triangle{
			{Name: "T1", Base: "BTC-USDT", Mid: "X-BTC", Out: "X-USDT"},
			{Name: "T2", Base: "BTC-USDT", Mid: "Y-BTC", Out: "Y-USDT"},
		}
		index := BuildReverseIndex(shared)

		want := []int{0, 1}
		if got := index["BTC-USDT"]; !reflect.DeepEqual(got, want) {
			t.Errorf("BTC-USDT = %v, want %v", got, want)
		}
	})
}
