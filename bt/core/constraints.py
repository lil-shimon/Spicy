from __future__ import annotations

from math import floor

from bt.core.types import Constraints


def round_price(price: float, tick: float) -> float:
    if tick <= 0:
        return price
    return floor(price / tick) * tick


def round_qty(qty: float, step: float) -> float:
    if step <= 0:
        return qty
    return floor(qty / step) * step


def validate_order(qty: float, leverage: float, constraints: Constraints) -> bool:
    if qty < constraints.min_order_qty:
        return False
    if leverage > constraints.max_leverage:
        return False
    return True
