from __future__ import annotations

from pathlib import Path


def try_plot_placeholder(out_path: str) -> None:
    # Placeholder to keep initial scope small. Real plotting can be added with matplotlib later.
    p = Path(out_path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text('plot placeholder\n')
