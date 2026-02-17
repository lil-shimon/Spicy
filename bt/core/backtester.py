from __future__ import annotations

from random import Random

from bt.core.constraints import round_price, round_qty, validate_order
from bt.core.execution_model import apply_slippage, fee_rate, should_fill
from bt.core.grid_strategy import build_grid_levels, should_recenter
from bt.core.types import Candle, Constraints, CostModel, GridParams, Metrics


def _max_dd_pct(equity_curve: list[float]) -> float:
    peak = equity_curve[0]
    max_dd = 0.0
    for v in equity_curve:
        if v > peak:
            peak = v
        dd = (peak - v) / peak if peak > 0 else 0.0
        if dd > max_dd:
            max_dd = dd
    return max_dd * 100.0


def run_backtest(
    candles: list[Candle],
    params: GridParams,
    constraints: Constraints,
    cost: CostModel,
    initial_equity: float,
    seed: int = 42,
) -> Metrics:
    if not candles:
        return Metrics(0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.0)

    rng = Random(seed)
    center_price = candles[0].close
    buys, sells = build_grid_levels(center_price, params)

    equity = initial_equity
    cash = initial_equity
    inventory = 0.0
    trades = 0
    wins = 0
    losses = 0
    gross_profit = 0.0
    gross_loss = 0.0
    equity_curve = [equity]

    for candle in candles:
        if should_recenter(candle, center_price, params):
            center_price = candle.close
            buys, sells = build_grid_levels(center_price, params)

        order_value = initial_equity * params.order_size_ratio * params.leverage
        raw_qty = order_value / max(candle.close, 1e-9)
        qty = round_qty(raw_qty, constraints.qty_step)
        if not validate_order(qty, params.leverage, constraints):
            equity_curve.append(equity)
            continue

        for p in buys:
            px = round_price(p, constraints.price_tick)
            if candle.low <= px and should_fill(cost, rng):
                fill_px = apply_slippage(px, 'buy', cost)
                fee = fill_px * qty * fee_rate(cost)
                cash -= fill_px * qty + fee
                inventory += qty
                trades += 1

        for p in sells:
            px = round_price(p, constraints.price_tick)
            if candle.high >= px and inventory >= qty and should_fill(cost, rng):
                fill_px = apply_slippage(px, 'sell', cost)
                fee = fill_px * qty * fee_rate(cost)
                proceeds = fill_px * qty - fee
                cash += proceeds
                inventory -= qty
                trades += 1

        mtm = cash + inventory * candle.close
        pnl_step = mtm - equity
        if pnl_step > 0:
            wins += 1
            gross_profit += pnl_step
        elif pnl_step < 0:
            losses += 1
            gross_loss += abs(pnl_step)

        equity = mtm
        equity_curve.append(equity)

    pnl = equity - initial_equity
    ret = (pnl / initial_equity) * 100.0
    dd = _max_dd_pct(equity_curve)
    pf = (gross_profit / gross_loss) if gross_loss > 0 else (1.0 if gross_profit == 0 else 999.0)
    win_rate = (wins / max(wins + losses, 1)) * 100.0
    return Metrics(trades, wins, losses, pnl, ret, dd, pf, win_rate)
