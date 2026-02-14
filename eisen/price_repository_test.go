package main

import "testing"

func TestPriceRepository(t *testing.T) {
	t.Run("新規追加は変更あり", func(t *testing.T) {
		repo := NewPriceRepository()
		changed := repo.UpdatePrice("BTC-USDT", 100.0, 101.0)
		if !changed {
			t.Error("新規追加なのにfalseが返された")
		}

		ob, exists := repo.GetPrice("BTC-USDT")
		if !exists {
			t.Fatal("存在するはずのペアが見つからない")
		}
		if ob.Bid != 100.0 || ob.Ask != 101.0 {
			t.Errorf("Bid=%f, Ask=%f, want Bid=100.0, Ask=101.0", ob.Bid, ob.Ask)
		}
	})

	t.Run("同じ価格は変更なし", func(t *testing.T) {
		repo := NewPriceRepository()
		repo.UpdatePrice("BTC-USDT", 100.0, 101.0)
		changed := repo.UpdatePrice("BTC-USDT", 100.0, 101.0)
		if changed {
			t.Error("同じ価格なのにtrueが返された")
		}
	})

	t.Run("bid変更は変更あり", func(t *testing.T) {
		repo := NewPriceRepository()
		repo.UpdatePrice("BTC-USDT", 100.0, 101.0)
		changed := repo.UpdatePrice("BTC-USDT", 99.0, 101.0)
		if !changed {
			t.Error("bid変更なのにfalseが返された")
		}
	})

	t.Run("ask変更は変更あり", func(t *testing.T) {
		repo := NewPriceRepository()
		repo.UpdatePrice("BTC-USDT", 100.0, 101.0)
		changed := repo.UpdatePrice("BTC-USDT", 100.0, 102.0)
		if !changed {
			t.Error("ask変更なのにfalseが返された")
		}
	})

	t.Run("存在しないペア", func(t *testing.T) {
		repo := NewPriceRepository()
		_, exists := repo.GetPrice("NONEXISTENT")
		if exists {
			t.Error("存在しないペアにtrueが返された")
		}
	})

	t.Run("複数ペア独立管理", func(t *testing.T) {
		repo := NewPriceRepository()
		repo.UpdatePrice("BTC-USDT", 100.0, 101.0)
		repo.UpdatePrice("ETH-USDT", 200.0, 201.0)

		btc, _ := repo.GetPrice("BTC-USDT")
		eth, _ := repo.GetPrice("ETH-USDT")

		if btc.Bid != 100.0 || btc.Ask != 101.0 {
			t.Errorf("BTC: Bid=%f, Ask=%f, want Bid=100.0, Ask=101.0", btc.Bid, btc.Ask)
		}
		if eth.Bid != 200.0 || eth.Ask != 201.0 {
			t.Errorf("ETH: Bid=%f, Ask=%f, want Bid=200.0, Ask=201.0", eth.Bid, eth.Ask)
		}
	})
}
