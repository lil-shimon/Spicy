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
    regime_mask: list[bool] | None = None,
) -> Metrics:
    if not candles:
        return Metrics(0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.0)

    rng = Random(seed)
    center_price = candles[0].close
    buys, sells = build_grid_levels(center_price, params)
    grid_spacing = (center_price * params.range_pct) / max(params.levels_per_side, 1)
    active_buys: set[float] = set(buys)
    active_sells: set[float] = set(sells)

    equity = initial_equity
    cash = initial_equity
    inventory = 0.0
    trades = 0
    wins = 0
    losses = 0
    gross_profit = 0.0
    gross_loss = 0.0
    buy_stack: list[float] = []   # FIFO: buy約定時のfill_pxを積む
    equity_curve = [equity]
    # トレンド移行検知用: 前キャンドルがレンジ相場だったか
    # regime_maskがNoneの場合は常にレンジ扱い（従来動作と同じ）
    prev_ranging = True

    for i, candle in enumerate(candles):
        is_ranging = regime_mask is None or regime_mask[i]

        if not is_ranging:
            # トレンド移行の最初のキャンドル: オープンポジションを全決済する
            # @context レンジ→トレンド移行時にMTMが更新されないバグを修正。
            #          inventory保有のまま続くと含み損益が equity_curve に反映されないため、
            #          移行キャンドルのcloseで強制決済してcashに確定させる。
            if prev_ranging and inventory > 0:
                order_value = initial_equity * params.order_size_ratio * params.leverage
                raw_qty = order_value / max(candle.close, 1e-9)
                qty = round_qty(raw_qty, constraints.qty_step)
                for buy_px in buy_stack:
                    exit_px = apply_slippage(candle.close, 'sell', cost)
                    exit_fee = exit_px * qty * fee_rate(cost)
                    forced_proceeds = exit_px * qty - exit_fee
                    cash += forced_proceeds
                    trade_pnl = forced_proceeds - (buy_px * qty + buy_px * qty * fee_rate(cost))
                    trades += 1
                    if trade_pnl > 0:
                        wins += 1
                        gross_profit += trade_pnl
                    else:
                        losses += 1
                        gross_loss += abs(trade_pnl)
                buy_stack.clear()
                inventory = 0.0
                center_price = candle.close
                buys, sells = build_grid_levels(center_price, params)
                active_buys = set(buys)
                active_sells = set(sells)
                grid_spacing = (center_price * params.range_pct) / max(params.levels_per_side, 1)

            # トレンド中: inventory=0なのでMTMはcashのみ
            equity = cash
            equity_curve.append(equity)
            prev_ranging = False
            continue

        prev_ranging = True

        order_value = initial_equity * params.order_size_ratio * params.leverage
        raw_qty = order_value / max(candle.close, 1e-9)
        qty = round_qty(raw_qty, constraints.qty_step)
        if should_recenter(candle, center_price, params):
            for buy_px in buy_stack:
                exit_px = apply_slippage(candle.close, 'sell', cost)
                exit_fee = exit_px * qty * fee_rate(cost)
                forced_proceeds = exit_px * qty - exit_fee
                cash += forced_proceeds
                trade_pnl = forced_proceeds - (buy_px * qty + buy_px * qty * fee_rate(cost))
                trades += 1
                if trade_pnl > 0:
                    wins += 1
                    gross_profit += trade_pnl
                else:
                    losses += 1
                    gross_loss += abs(trade_pnl)
            buy_stack.clear()
            inventory = 0.0
            center_price = candle.close
            buys, sells = build_grid_levels(center_price, params)
            active_buys = set(buys)
            active_sells = set(sells)
            grid_spacing = (center_price * params.range_pct) / max(params.levels_per_side, 1)

        if not validate_order(qty, params.leverage, constraints):
            equity_curve.append(equity)
            continue

        for p in list(active_buys):
            px = round_price(p, constraints.price_tick)
            if candle.low <= px and should_fill(cost, rng):
                fill_px = apply_slippage(px, 'buy', cost)
                fee = fill_px * qty * fee_rate(cost)
                cash -= fill_px * qty + fee
                inventory += qty
                buy_stack.append(fill_px)
                active_buys.discard(p)
                active_sells.add(round_price(p + grid_spacing, constraints.price_tick))

        for p in list(active_sells):
            px = round_price(p, constraints.price_tick)
            if candle.high >= px and inventory >= qty and should_fill(cost, rng):
                fill_px = apply_slippage(px, 'sell', cost)
                fee = fill_px * qty * fee_rate(cost)
                proceeds = fill_px * qty - fee
                cash += proceeds
                inventory -= qty
                trades += 1
                active_sells.discard(p)
                active_buys.add(round_price(p - grid_spacing, constraints.price_tick))
                if buy_stack:
                    buy_px = buy_stack.pop(0)
                    trade_pnl = proceeds - (buy_px * qty + buy_px * qty * fee_rate(cost))
                    if trade_pnl > 0:
                        wins += 1
                        gross_profit += trade_pnl
                    else:
                        losses += 1
                        gross_loss += abs(trade_pnl)

        mtm = cash + inventory * candle.close
        equity = mtm
        equity_curve.append(equity)

    pnl = equity - initial_equity
    ret = (pnl / initial_equity) * 100.0
    dd = _max_dd_pct(equity_curve)
    pf = (gross_profit / gross_loss) if gross_loss > 0 else (1.0 if gross_profit == 0 else 999.0)
    win_rate = (wins / max(wins + losses, 1)) * 100.0
    return Metrics(trades, wins, losses, pnl, ret, dd, pf, win_rate)
