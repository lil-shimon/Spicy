from __future__ import annotations

from random import Random

from bt.core.types import CostModel


def should_fill(cost: CostModel, rng: Random) -> bool:
    return rng.random() >= cost.fill_failure_rate


def apply_slippage(price: float, side: str, cost: CostModel) -> float:
    slippage = cost.slippage_bps / 10_000.0
    if side == 'buy':
        return price * (1.0 + slippage)
    return price * (1.0 - slippage)


def fee_rate(cost: CostModel) -> float:
    bps = cost.taker_fee_bps if cost.use_taker else cost.maker_fee_bps
    return bps / 10_000.0
