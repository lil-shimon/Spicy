from __future__ import annotations


def is_overfit(train_return: float, oos_return: float, tolerance_drop_pct: float = 50.0) -> bool:
    if train_return <= 0:
        return oos_return <= train_return
    drop = (train_return - oos_return) / max(train_return, 1e-9) * 100.0
    return drop > tolerance_drop_pct


def accept_candidate(oos_return: float, oos_dd: float, oos_pf: float, min_return: float, max_dd: float, min_pf: float) -> bool:
    return oos_return > min_return and oos_dd <= max_dd and oos_pf >= min_pf
