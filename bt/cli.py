from __future__ import annotations

import argparse
import csv
from datetime import datetime
from pathlib import Path

import yaml

from bt.core.types import Candle, Constraints, CostModel
from bt.data.fetch_kucoin_ohlcv import fetch_ohlcv
from bt.eval.oos_eval import evaluate_oos
from bt.report.export_metrics import export_csv, export_markdown
from bt.search.candidate_ranker import rank_candidates
from bt.search.grid_search import load_candles, run_grid_search


def load_config(path: str) -> dict:
    with Path(path).open() as f:
        return yaml.safe_load(f)


def resolve_run_dir(out_csv_path: str, run_id: str | None) -> tuple[str, Path]:
    runs_base = Path(out_csv_path).parent / 'runs'
    runs_base.mkdir(parents=True, exist_ok=True)

    if run_id:
        run_dir = runs_base / run_id
        run_dir.mkdir(parents=True, exist_ok=True)
        return run_id, run_dir

    auto_run_id = datetime.now().strftime('%Y%m%d_%H%M%S')
    run_dir = runs_base / auto_run_id
    if run_dir.exists():
        raise RuntimeError(
            f'run_id collision: {auto_run_id} already exists. '
            'Please retry or pass --run-id explicitly.',
        )
    run_dir.mkdir(parents=True, exist_ok=False)
    return auto_run_id, run_dir


def cmd_fetch(args: argparse.Namespace) -> None:
    cfg = load_config(args.config)
    rows = fetch_ohlcv(
        args.symbol,
        cfg['timeframe'],
        args.since_ms,
        args.until_ms,
        progress=args.progress,
        timeout_ms=args.timeout_ms,
        max_retries=args.max_retries,
    )
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open('w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['ts', 'open', 'high', 'low', 'close', 'volume'])
        w.writerows(rows)
    print(f'fetched={len(rows)} saved={out}')


def cmd_search(args: argparse.Namespace) -> None:
    cfg = load_config(args.config)
    candles = load_candles(args.infile)

    constraints = Constraints(**cfg['constraints'])
    costs = cfg['costs']
    exec_cfg = cfg['execution']
    base_cost = CostModel(
        maker_fee_bps=costs['maker_fee_bps'],
        taker_fee_bps=costs['taker_fee_bps'],
        slippage_bps=costs['slippage_bps'],
        fill_failure_rate=0.0,
        use_taker=exec_cfg.get('use_taker', False),
    )

    gs = cfg['grid_search']
    rows = run_grid_search(
        candles=candles,
        levels=gs['levels_per_side'],
        ranges=gs['range_pcts'],
        leverages=gs['leverage_values'],
        order_sizes=gs['order_size_ratio_values'],
        failure_rates=exec_cfg['fill_failure_rates'],
        constraints=constraints,
        base_cost=base_cost,
        initial_equity=cfg['initial_equity'],
    )
    ranked = rank_candidates(rows, top_n=args.top_n)
    run_id, run_dir = resolve_run_dir(args.out_csv, args.run_id)
    run_csv = str(run_dir / Path(args.out_csv).name)
    run_md = str(run_dir / Path(args.out_md).name)

    export_csv(ranked, run_csv)
    export_markdown(ranked, run_md, top_n=args.top_n)
    export_csv(ranked, args.out_csv)
    export_markdown(ranked, args.out_md, top_n=args.top_n)
    print(f'search_done rows={len(rows)} top={len(ranked)} run_id={run_id} saved_run_dir={run_dir}')


def cmd_oos(args: argparse.Namespace) -> None:
    cfg = load_config(args.config)
    constraints = Constraints(**cfg['constraints'])
    costs = cfg['costs']
    exec_cfg = cfg['execution']
    base_cost = CostModel(
        maker_fee_bps=costs['maker_fee_bps'],
        taker_fee_bps=costs['taker_fee_bps'],
        slippage_bps=costs['slippage_bps'],
        fill_failure_rate=0.0,
        use_taker=exec_cfg.get('use_taker', False),
    )

    with Path(args.candidates_csv).open() as f:
        candidates = [
            {k: float(v) if k not in {'accepted', 'overfit'} else v == 'True' for k, v in row.items()}
            for row in csv.DictReader(f)
        ]

    oos_candles = load_candles(args.oos_file)
    ac = cfg['acceptance']
    rows = evaluate_oos(
        train_candidates=candidates,
        oos_candles=oos_candles,
        constraints=constraints,
        base_cost=base_cost,
        initial_equity=cfg['initial_equity'],
        min_return=ac['min_oos_return_pct'],
        max_dd=ac['max_oos_dd_pct'],
        min_pf=ac['min_pf'],
    )
    run_id, run_dir = resolve_run_dir(args.out_csv, args.run_id)
    run_csv = str(run_dir / Path(args.out_csv).name)
    run_md = str(run_dir / Path(args.out_md).name)

    export_csv(rows, run_csv)
    export_markdown(rows, run_md, top_n=len(rows))
    export_csv(rows, args.out_csv)
    export_markdown(rows, args.out_md, top_n=len(rows))
    print(
        f'oos_done rows={len(rows)} accepted={sum(1 for r in rows if r["accepted"]) } '
        f'run_id={run_id} saved_run_dir={run_dir}',
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest='cmd', required=True)

    p_fetch = sub.add_parser('fetch')
    p_fetch.add_argument('--config', default='bt/config/defaults.yaml')
    p_fetch.add_argument('--symbol', default='BTC/USDT:USDT')
    p_fetch.add_argument('--since-ms', type=int, required=True)
    p_fetch.add_argument('--until-ms', type=int, required=True)
    p_fetch.add_argument('--out', default='bt/data/raw/kucoin_ohlcv.csv')
    p_fetch.add_argument('--progress', action='store_true')
    p_fetch.add_argument('--timeout-ms', type=int, default=30_000)
    p_fetch.add_argument('--max-retries', type=int, default=5)
    p_fetch.set_defaults(func=cmd_fetch)

    p_search = sub.add_parser('search')
    p_search.add_argument('--config', default='bt/config/defaults.yaml')
    p_search.add_argument('--infile', default='bt/data/splits/train.csv')
    p_search.add_argument('--top-n', type=int, default=10)
    p_search.add_argument('--out-csv', default='bt/results/train_top.csv')
    p_search.add_argument('--out-md', default='bt/results/train_top.md')
    p_search.add_argument('--run-id', default=None)
    p_search.set_defaults(func=cmd_search)

    p_oos = sub.add_parser('oos')
    p_oos.add_argument('--config', default='bt/config/defaults.yaml')
    p_oos.add_argument('--candidates-csv', default='bt/results/train_top.csv')
    p_oos.add_argument('--oos-file', default='bt/data/splits/oos.csv')
    p_oos.add_argument('--out-csv', default='bt/results/oos_eval.csv')
    p_oos.add_argument('--out-md', default='bt/results/oos_eval.md')
    p_oos.add_argument('--run-id', default=None)
    p_oos.set_defaults(func=cmd_oos)

    args = parser.parse_args()
    args.func(args)


if __name__ == '__main__':
    main()
