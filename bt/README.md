# BT (KuCoin Grid)

詳細な実行手順（初心者向け）は `bt/BACKTEST_WORKFLOW.md` を参照してください。

## セットアップ

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r bt/requirements.txt
```

## 実行フロー

1. OHLCV取得

```bash
python -m bt.cli fetch --since-ms 1735689600000 --until-ms 1767225599000
```

- `1735689600000` = 2025-01-01 00:00:00 UTC
- `1767225599000` = 2025-12-31 23:59:59 UTC

進捗表示したい場合:

```bash
python -m bt.cli fetch --since-ms 1735689600000 --until-ms 1767225599000 --progress
```

タイムアウトが出る場合（推奨）:

```bash
python -m bt.cli fetch --since-ms 1735689600000 --until-ms 1767225599000 --progress --timeout-ms 60000 --max-retries 8
```

2. 整形

```bash
python -m bt.data.normalize --infile bt/data/raw/kucoin_ohlcv.csv --out bt/data/processed/kucoin_ohlcv_1m.csv
```

3. 分割（6:2:2）

```bash
python -m bt.data.split_dataset --infile bt/data/processed/kucoin_ohlcv_1m.csv --train 0.6 --validation 0.2 --outdir bt/data/splits
```

4. train探索

```bash
python -m bt.cli search
```

5. OOS評価

```bash
python -m bt.cli oos
```

## 結果保存（履歴保持）

- デフォルト実行（引数なし）でも、各実行で `bt/results/runs/YYYYMMDD_HHMMSS/` が自動作成され、結果が保存される
- 互換のため、`bt/results/train_top.csv` / `bt/results/oos_eval.csv` など固定パスも最新結果で更新される
- 実行ログに `run_id` と `saved_run_dir` が表示される
- 同一秒のディレクトリが既に存在する場合は衝突エラーで終了

通常は `--run-id` は不要。`search` と `oos` を同じ実行IDで束ねたいときだけ指定:

```bash
python -m bt.cli search --run-id my_run_001 ...
python -m bt.cli oos --run-id my_run_001 ...
```

## 仕様

- 銘柄: `BTCUSDTM`
- 粒度: `1m`
- 分割: `6:2:2`
- 探索: 本数 / レンジ / レバ / 注文サイズ / 約定失敗率（0,2,5%）
- 採用判定: OOSの `return`, `max_dd`, `pf`
