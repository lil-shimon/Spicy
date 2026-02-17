# BT (KuCoin Grid)

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
python -m bt.cli search --infile bt/data/splits/train.csv --out-csv bt/results/train_top.csv --out-md bt/results/train_top.md
```

5. OOS評価

```bash
python -m bt.cli oos --candidates-csv bt/results/train_top.csv --oos-file bt/data/splits/oos.csv --out-csv bt/results/oos_eval.csv --out-md bt/results/oos_eval.md
```

## 仕様

- 銘柄: `BTCUSDTM`
- 粒度: `1m`
- 分割: `6:2:2`
- 探索: 本数 / レンジ / レバ / 注文サイズ / 約定失敗率（0,2,5%）
- 採用判定: OOSの `return`, `max_dd`, `pf`
