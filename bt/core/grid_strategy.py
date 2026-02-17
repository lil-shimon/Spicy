from __future__ import annotations

from bt.core.types import Candle, GridParams


def build_grid_levels(center_price: float, params: GridParams) -> tuple[list[float], list[float]]:
    # Equal spaced grid within configured range.
    step = (center_price * params.range_pct) / max(params.levels_per_side, 1)
    buys = [center_price - step * i for i in range(1, params.levels_per_side + 1)]
    sells = [center_price + step * i for i in range(1, params.levels_per_side + 1)]
    return buys, sells


def should_recenter(candle: Candle, center_price: float, params: GridParams) -> bool:
    return abs(candle.close - center_price) / center_price > params.range_pct
