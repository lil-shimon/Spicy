/**
 * @module 価格リポジトリ
 * @context TSのPriceRepositoryをGoに移植。
 *          三角アービトラージで使うペア価格をインメモリ保存。
 *          goroutine安全のため sync.RWMutex を使用。
 */
package main

import "sync"

// PriceRepository はペア価格のインメモリストア
type PriceRepository struct {
	mu     sync.RWMutex
	prices map[string]OrderBook
}

// NewPriceRepository は新しいPriceRepositoryを生成する
func NewPriceRepository() *PriceRepository {
	return &PriceRepository{
		prices: make(map[string]OrderBook),
	}
}

// UpdatePrice は価格を更新し、変更があればtrueを返す
// @request 価格変動時のみアービトラージ計算をトリガーしたい
// @context TSでは symbol::exchange をキーにするが、eisenはKuCoinのみなのでsymbolだけで十分
func (pr *PriceRepository) UpdatePrice(symbol string, bid, ask float64) bool {
	pr.mu.Lock()
	defer pr.mu.Unlock()

	prev, exists := pr.prices[symbol]
	if exists && prev.Bid == bid && prev.Ask == ask {
		return false
	}

	pr.prices[symbol] = OrderBook{Bid: bid, Ask: ask}
	return true
}

// GetPrice は指定シンボルの価格を返す。存在しない場合はfalse
func (pr *PriceRepository) GetPrice(symbol string) (OrderBook, bool) {
	pr.mu.RLock()
	defer pr.mu.RUnlock()

	ob, exists := pr.prices[symbol]
	return ob, exists
}
