from __future__ import annotations

import csv
from pathlib import Path


def export_csv(rows: list[dict[str, float | bool]], out_path: str) -> None:
    p = Path(out_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    if not rows:
        return
    fieldnames = list(rows[0].keys())
    with p.open('w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)


def export_markdown(rows: list[dict[str, float | bool]], out_path: str, top_n: int = 10) -> None:
    p = Path(out_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    head = rows[:top_n]
    if not head:
        p.write_text('# Result\n\nNo rows\n')
        return

    cols = list(head[0].keys())
    lines = ['# BT Result', '', '| ' + ' | '.join(cols) + ' |', '| ' + ' | '.join(['---'] * len(cols)) + ' |']
    for r in head:
        lines.append('| ' + ' | '.join(str(r[c]) for c in cols) + ' |')
    p.write_text('\n'.join(lines) + '\n')
