from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Candle:
    ts: int
    open: float
    high: float
    low: float
    close: float
    volume: float


@dataclass(frozen=True)
class GridParams:
    levels_per_side: int
    range_pct: float
    leverage: float
    order_size_ratio: float


@dataclass(frozen=True)
class Constraints:
    min_order_qty: float
    price_tick: float
    qty_step: float
    max_leverage: float


@dataclass(frozen=True)
class CostModel:
    maker_fee_bps: float
    taker_fee_bps: float
    slippage_bps: float
    fill_failure_rate: float
    use_taker: bool


@dataclass
class Metrics:
    trades: int
    wins: int
    losses: int
    pnl: float
    return_pct: float
    max_dd_pct: float
    profit_factor: float
    win_rate: float
