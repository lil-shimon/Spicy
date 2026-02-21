from __future__ import annotations

import csv
import itertools
from pathlib import Path

from bt.core.backtester import run_backtest
from bt.core.regime_filter import compute_regime_mask
from bt.core.types import Candle, Constraints, CostModel, GridParams


def load_candles(path: str) -> list[Candle]:
    with Path(path).open() as f:
        rows = list(csv.DictReader(f))
    return [
        Candle(
            ts=int(r['ts']),
            open=float(r['open']),
            high=float(r['high']),
            low=float(r['low']),
            close=float(r['close']),
            volume=float(r['volume']),
        )
        for r in rows
    ]


def run_grid_search(
    candles: list[Candle],
    levels: list[int],
    ranges: list[float],
    leverages: list[float],
    order_sizes: list[float],
    failure_rates: list[float],
    constraints: Constraints,
    base_cost: CostModel,
    initial_equity: float,
    regime_cfg: dict | None = None,
) -> list[dict[str, float]]:
    # regime_maskをループ前に1回だけ計算（全パラメータ組み合わせで共通）
    regime_mask = None
    if regime_cfg and regime_cfg.get("enabled"):
        regime_mask = compute_regime_mask(
            candles,
            lookback_days=regime_cfg["lookback_days"],
            er_threshold=regime_cfg["er_threshold"],
        )

    results: list[dict[str, float]] = []
    for lv, rg, lev, osz, fr in itertools.product(levels, ranges, leverages, order_sizes, failure_rates):
        params = GridParams(levels_per_side=lv, range_pct=rg, leverage=lev, order_size_ratio=osz)
        cost = CostModel(
            maker_fee_bps=base_cost.maker_fee_bps,
            taker_fee_bps=base_cost.taker_fee_bps,
            slippage_bps=base_cost.slippage_bps,
            fill_failure_rate=fr,
            use_taker=base_cost.use_taker,
        )
        m = run_backtest(candles, params, constraints, cost, initial_equity, regime_mask=regime_mask)
        results.append(
            {
                'levels': lv,
                'range_pct': rg,
                'leverage': lev,
                'order_size_ratio': osz,
                'fill_failure_rate': fr,
                'trades': m.trades,
                'return_pct': m.return_pct,
                'max_dd_pct': m.max_dd_pct,
                'pf': m.profit_factor,
                'win_rate': m.win_rate,
            }
        )
    return results
