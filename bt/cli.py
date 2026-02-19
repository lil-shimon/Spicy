from __future__ import annotations

import argparse
import concurrent.futures
import csv
from datetime import datetime
from pathlib import Path

import yaml

from bt.core.types import Constraints, CostModel
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


def run_search(
    *,
    config_path: str,
    infile: str,
    top_n: int,
    out_csv: str,
    out_md: str,
    run_id: str | None,
    write_latest: bool,
) -> dict[str, str | int]:
    cfg = load_config(config_path)
    candles = load_candles(infile)

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
    ranked = rank_candidates(rows, top_n=top_n)
    resolved_run_id, run_dir = resolve_run_dir(out_csv, run_id)
    run_csv = str(run_dir / Path(out_csv).name)
    run_md = str(run_dir / Path(out_md).name)

    export_csv(ranked, run_csv)
    export_markdown(ranked, run_md, top_n=top_n)
    if write_latest:
        export_csv(ranked, out_csv)
        export_markdown(ranked, out_md, top_n=top_n)

    return {
        'rows': len(rows),
        'top': len(ranked),
        'run_id': resolved_run_id,
        'run_dir': str(run_dir),
        'run_csv': run_csv,
        'run_md': run_md,
    }


def run_oos(
    *,
    config_path: str,
    candidates_csv: str,
    oos_file: str,
    out_csv: str,
    out_md: str,
    run_id: str | None,
    write_latest: bool,
) -> dict[str, str | int]:
    cfg = load_config(config_path)
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

    with Path(candidates_csv).open() as f:
        candidates = [
            {k: float(v) if k not in {'accepted', 'overfit'} else v == 'True' for k, v in row.items()}
            for row in csv.DictReader(f)
        ]

    oos_candles = load_candles(oos_file)
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
    resolved_run_id, run_dir = resolve_run_dir(out_csv, run_id)
    run_csv = str(run_dir / Path(out_csv).name)
    run_md = str(run_dir / Path(out_md).name)

    export_csv(rows, run_csv)
    export_markdown(rows, run_md, top_n=len(rows))
    if write_latest:
        export_csv(rows, out_csv)
        export_markdown(rows, out_md, top_n=len(rows))

    return {
        'rows': len(rows),
        'accepted': sum(1 for r in rows if r['accepted']),
        'run_id': resolved_run_id,
        'run_dir': str(run_dir),
        'run_csv': run_csv,
        'run_md': run_md,
    }


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
    res = run_search(
        config_path=args.config,
        infile=args.infile,
        top_n=args.top_n,
        out_csv=args.out_csv,
        out_md=args.out_md,
        run_id=args.run_id,
        write_latest=True,
    )
    print(
        f'search_done rows={res["rows"]} top={res["top"]} '
        f'run_id={res["run_id"]} saved_run_dir={res["run_dir"]}',
    )


def cmd_oos(args: argparse.Namespace) -> None:
    res = run_oos(
        config_path=args.config,
        candidates_csv=args.candidates_csv,
        oos_file=args.oos_file,
        out_csv=args.out_csv,
        out_md=args.out_md,
        run_id=args.run_id,
        write_latest=True,
    )
    print(
        f'oos_done rows={res["rows"]} accepted={res["accepted"]} '
        f'run_id={res["run_id"]} saved_run_dir={res["run_dir"]}',
    )


def cmd_run(args: argparse.Namespace) -> None:
    search_res = run_search(
        config_path=args.config,
        infile=args.infile,
        top_n=args.top_n,
        out_csv=args.out_csv,
        out_md=args.out_md,
        run_id=args.run_id,
        write_latest=True,
    )
    oos_res = run_oos(
        config_path=args.config,
        candidates_csv=search_res['run_csv'],
        oos_file=args.oos_file,
        out_csv=args.oos_out_csv,
        out_md=args.oos_out_md,
        run_id=search_res['run_id'],
        write_latest=True,
    )
    print(
        f'run_done search_rows={search_res["rows"]} top={search_res["top"]} '
        f'oos_accepted={oos_res["accepted"]} run_id={search_res["run_id"]} '
        f'run_dir={search_res["run_dir"]}',
    )


def _run_batch_case(
    *,
    config_path: str,
    infile: str,
    oos_file: str,
    top_n: int,
    run_prefix: str,
    out_train_csv: str,
    out_train_md: str,
    out_oos_csv: str,
    out_oos_md: str,
) -> dict[str, str | int]:
    cfg_stem = Path(config_path).stem
    run_id = f'{run_prefix}__{cfg_stem}'
    search_res = run_search(
        config_path=config_path,
        infile=infile,
        top_n=top_n,
        out_csv=out_train_csv,
        out_md=out_train_md,
        run_id=run_id,
        write_latest=False,
    )
    oos_res = run_oos(
        config_path=config_path,
        candidates_csv=str(Path(search_res['run_csv'])),
        oos_file=oos_file,
        out_csv=out_oos_csv,
        out_md=out_oos_md,
        run_id=run_id,
        write_latest=False,
    )
    return {
        'config': config_path,
        'case': cfg_stem,
        'run_id': run_id,
        'run_dir': str(search_res['run_dir']),
        'search_rows': int(search_res['rows']),
        'search_top': int(search_res['top']),
        'oos_rows': int(oos_res['rows']),
        'oos_accepted': int(oos_res['accepted']),
    }


def cmd_batch(args: argparse.Namespace) -> None:
    config_dir = Path(args.config_dir)
    configs = sorted(config_dir.glob('*.yaml'))
    if not configs:
        raise RuntimeError(f'no yaml config found in: {config_dir}')

    run_prefix = args.run_prefix or f'batch_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
    print(
        f'batch_start cases={len(configs)} workers={args.workers} '
        f'run_prefix={run_prefix} config_dir={config_dir}',
    )

    futures: dict[concurrent.futures.Future[dict[str, str | int]], Path] = {}
    results: list[dict[str, str | int]] = []
    with concurrent.futures.ProcessPoolExecutor(max_workers=args.workers) as executor:
        for cfg in configs:
            fut = executor.submit(
                _run_batch_case,
                config_path=str(cfg),
                infile=args.infile,
                oos_file=args.oos_file,
                top_n=args.top_n,
                run_prefix=run_prefix,
                out_train_csv=args.out_csv,
                out_train_md=args.out_md,
                out_oos_csv=args.oos_out_csv,
                out_oos_md=args.oos_out_md,
            )
            futures[fut] = cfg

        for fut in concurrent.futures.as_completed(futures):
            cfg = futures[fut]
            try:
                res = fut.result()
            except Exception as e:
                print(f'batch_case_failed case={cfg.stem} config={cfg} error={e}')
                executor.shutdown(wait=False, cancel_futures=True)
                raise RuntimeError(f'batch aborted due to failure: case={cfg.stem}') from e
            results.append(res)
            print(
                f'batch_case_done case={res["case"]} run_id={res["run_id"]} '
                f'accepted={res["oos_accepted"]} run_dir={res["run_dir"]}',
            )

    total_accepted = sum(int(r['oos_accepted']) for r in results)
    print(
        f'batch_done cases={len(results)} total_accepted={total_accepted} '
        f'run_prefix={run_prefix} fixed_outputs_updated=False',
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

    p_run = sub.add_parser('run')
    p_run.add_argument('--config', default='bt/config/defaults.yaml')
    p_run.add_argument('--infile', default='bt/data/splits/train.csv')
    p_run.add_argument('--oos-file', default='bt/data/splits/oos.csv')
    p_run.add_argument('--top-n', type=int, default=10)
    p_run.add_argument('--out-csv', default='bt/results/train_top.csv')
    p_run.add_argument('--out-md', default='bt/results/train_top.md')
    p_run.add_argument('--oos-out-csv', default='bt/results/oos_eval.csv')
    p_run.add_argument('--oos-out-md', default='bt/results/oos_eval.md')
    p_run.add_argument('--run-id', default=None)
    p_run.set_defaults(func=cmd_run)

    p_batch = sub.add_parser('batch')
    p_batch.add_argument('--config-dir', required=True)
    p_batch.add_argument('--workers', type=int, default=4)
    p_batch.add_argument('--top-n', type=int, default=10)
    p_batch.add_argument('--infile', default='bt/data/splits/train.csv')
    p_batch.add_argument('--oos-file', default='bt/data/splits/oos.csv')
    p_batch.add_argument('--run-prefix', default=None)
    p_batch.add_argument('--out-csv', default='bt/results/train_top.csv')
    p_batch.add_argument('--out-md', default='bt/results/train_top.md')
    p_batch.add_argument('--oos-out-csv', default='bt/results/oos_eval.csv')
    p_batch.add_argument('--oos-out-md', default='bt/results/oos_eval.md')
    p_batch.set_defaults(func=cmd_batch)

    args = parser.parse_args()
    args.func(args)


if __name__ == '__main__':
    main()
