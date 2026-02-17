from __future__ import annotations

from bt.core.backtester import run_backtest
from bt.core.types import Candle, Constraints, CostModel, GridParams
from bt.eval.overfit_check import accept_candidate, is_overfit


def evaluate_oos(
    train_candidates: list[dict[str, float]],
    oos_candles: list[Candle],
    constraints: Constraints,
    base_cost: CostModel,
    initial_equity: float,
    min_return: float,
    max_dd: float,
    min_pf: float,
) -> list[dict[str, float | bool]]:
    out: list[dict[str, float | bool]] = []
    for c in train_candidates:
        params = GridParams(
            levels_per_side=int(c['levels']),
            range_pct=float(c['range_pct']),
            leverage=float(c['leverage']),
            order_size_ratio=float(c['order_size_ratio']),
        )
        cost = CostModel(
            maker_fee_bps=base_cost.maker_fee_bps,
            taker_fee_bps=base_cost.taker_fee_bps,
            slippage_bps=base_cost.slippage_bps,
            fill_failure_rate=float(c['fill_failure_rate']),
            use_taker=base_cost.use_taker,
        )
        m = run_backtest(oos_candles, params, constraints, cost, initial_equity)
        overfit = is_overfit(float(c['return_pct']), m.return_pct)
        accepted = accept_candidate(m.return_pct, m.max_dd_pct, m.profit_factor, min_return, max_dd, min_pf)
        row: dict[str, float | bool] = dict(c)
        row.update(
            {
                'oos_return_pct': m.return_pct,
                'oos_max_dd_pct': m.max_dd_pct,
                'oos_pf': m.profit_factor,
                'overfit': overfit,
                'accepted': accepted and not overfit,
            }
        )
        out.append(row)
    return out
