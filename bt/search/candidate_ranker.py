from __future__ import annotations


def rank_candidates(rows: list[dict[str, float]], top_n: int = 10) -> list[dict[str, float]]:
    scored = sorted(
        rows,
        key=lambda r: (r['return_pct'] - 0.5 * r['max_dd_pct'], r['pf'], r['win_rate']),
        reverse=True,
    )
    return scored[:top_n]
