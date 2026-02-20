# バックテスト実行ガイド（初心者向け）

このドキュメントは、`OHLCVデータ取得が終わった後` に何をすればよいかを、
コマンド順でまとめたものです。

## ゴール

- trainデータで候補ロジックを探す
- OOSデータで再評価して、過学習を避ける
- 採用候補を `bt/results/` に残す

## 事前準備

リポジトリ直下で実行する。

```bash
cd /Users/shimonlil/study/spicy
source bt/.venv/bin/activate
```

## 全体フロー

1. データ整形
2. データ分割（train/validation/OOS）
3. trainで探索
4. OOSで評価
5. 結果確認と採用候補の選定

---

## 1. データ整形

```bash
python -m bt.data.normalize \
  --infile bt/data/raw/kucoin_ohlcv.csv \
  --out bt/data/processed/kucoin_ohlcv_1m.csv
```

確認ポイント:

- `normalized=...` が表示される
- `bt/data/processed/kucoin_ohlcv_1m.csv` が生成される

## 2. データ分割（6:2:2）

```bash
python -m bt.data.split_dataset \
  --infile bt/data/processed/kucoin_ohlcv_1m.csv \
  --train 0.6 \
  --validation 0.2 \
  --outdir bt/data/splits
```

確認ポイント:

- `train=... validation=... oos=...` が表示される
- `bt/data/splits/train.csv`
- `bt/data/splits/validation.csv`
- `bt/data/splits/oos.csv`

## 3. trainで探索（本数・レンジ・レバ・失敗率）

```bash
python -m bt.cli search \
  --infile bt/data/splits/train.csv \
  --out-csv bt/results/train_top.csv \
  --out-md bt/results/train_top.md
```

確認ポイント:

- `search_done rows=... top=...` が表示される
- `bt/results/train_top.md` に上位候補が出る

ここでは「学習期間で良さそうな候補」を見つけるだけ。
まだ採用確定しない。

## 4. OOSで再評価（最重要）

```bash
python -m bt.cli oos \
  --candidates-csv bt/results/train_top.csv \
  --oos-file bt/data/splits/oos.csv \
  --out-csv bt/results/oos_eval.csv \
  --out-md bt/results/oos_eval.md
```

確認ポイント:

- `oos_done rows=... accepted=...` が表示される
- `bt/results/oos_eval.md` に `accepted` 列が出る

`accepted=True` の候補を優先する。

## 並列バッチ検証（複数設定を一括）

```bash
python -m bt.cli batch --config-dir bt/config/batch/step2
```

ポイント:

- 指定ディレクトリ配下の `*.yaml` を対象に、各設定で `search -> oos` を並列実行
- デフォルト並列数は 4（必要なら `--workers` を指定）
- 出力は `bt/results/runs/<run_id>/` のみ更新
- 競合回避のため、batch実行中は固定ファイル（`bt/results/train_top.csv` / `bt/results/oos_eval.csv`）を更新しない
- どれか1設定で失敗すると batch 全体を即時停止
- 推奨: `config/batch/step1`, `config/batch/step2` のようにケースを分割し、再実行範囲を絞る

## 5. 結果の見方（最小）

### 結果の保存先（履歴保持）

- 各コマンド実行時に `bt/results/runs/YYYYMMDD_HHMMSS/` が作成される
- `search` は `train_top.csv` / `train_top.md` を run ディレクトリへ保存
- `oos` は `oos_eval.csv` / `oos_eval.md` を run ディレクトリへ保存
- 互換のため固定パス (`bt/results/train_top.csv`, `bt/results/oos_eval.csv` など) も最新結果で更新

補足:

- 実行ログに `run_id=...` と `saved_run_dir=...` が出る
- 同一秒の run ディレクトリが既に存在する場合は衝突エラーで終了
- 任意で `--run-id` を指定して保存先を固定できる

```bash
python -m bt.cli search --run-id my_run_001 ...
python -m bt.cli oos --run-id my_run_001 ...
```

### まず見る列

- `oos_return_pct` : OOSリターン（プラスが望ましい）
- `oos_max_dd_pct` : OOS最大DD（小さいほど安全）
- `oos_pf` : Profit Factor（1.0超で損益比が有利）
- `accepted` : 採用判定
- `overfit` : 過学習疑い

### 採用の基本ルール

- `accepted=True`
- `overfit=False`
- 候補が複数ある場合は `oos_max_dd_pct` が小さいものを優先

## うまくいかない時の対処

### A. 候補が全部 `accepted=False`

- 探索範囲を少し狭める/変える（本数、レンジ、注文サイズ）
- コスト想定（手数料/スリッページ）を見直す
- 期間を変えて再検証

### B. トレード回数が極端に少ない

- `range_pcts` を広げる
- `levels_per_side` を増やす

### D. OOS の `oos_return=0.0, oos_pf=1.0` なのに `accepted=False`

**これは「損益ゼロ」ではなく「OOS でトレードが1件も発生していない」状態。**

原因: `order_size_ratio × initial_equity / BTC価格 < min_order_qty` になると、
`validate_order` が全 candle で False を返し、注文処理がすべてスキップされる。

```
例: order_size_ratio=0.008, initial_equity=10000
    → 注文額 = 80 USD
    → qty = floor(80 / BTC_price / 0.001) * 0.001

    BTC = $80,000 → qty = 0.001 ✅（ちょうど最小）
    BTC = $80,001 → qty = 0.000 ❌（全candle スキップ）
```

この状態は「戦略が機能した」証拠ではなく「シミュレーションが空振りした」状態なので、
`accepted=False` は正しい挙動。`> vs >=` のコード変更は不要。

**対処**: `order_size_ratio` を上げるか、BTC価格帯に合わせた最小サイズを確認する。

### C. DDが大きすぎる

- `leverage_values` を下げる
- `order_size_ratio_values` を下げる
- 本数を減らして在庫偏りを軽減

## 推奨の反復サイクル

1. 探索
2. OOS評価
3. 上位3候補だけ条件を微調整
4. 再探索

この4ステップを短く回す。

## 注意

- train成績が良くても、OOSで崩れる候補は採用しない
- まずは「利益最大」より「OOSで壊れない」候補を選ぶ
- 本番実装は、OOS通過ロジックのみ進める

---

## 現在の探索状況（Phase A: range_pct 拡大）

### 背景

- `range_pct=0.01`（1%固定）では全パラメータで train PF < 1.0
- 原因: 1%幅のグリッドがトレンド相場で在庫偏りを起こしやすい
- `order_size_ratio=0.008` は BTC > $80,000 で `min_order_qty` を下回り、OOSトレードゼロになる（価格クリフ）

### Phase A の目的

固定 `range_pct` を広げて、PF > 1.0 を達成できる幅があるかを確認する。

### 設定ファイル（`bt/config/batch/step3/`）

| ファイル   | range_pct | 目的                     |
| ---------- | --------- | ------------------------ |
| lr3_a.yaml | 0.015     | 1%より少し広い基準ライン |
| lr3_b.yaml | 0.020     | 2%幅の評価               |
| lr3_c.yaml | 0.025     | 2.5%幅の評価             |

- `order_size_ratio`: [0.012, 0.015]（価格クリフ対策: BTC $100K でも min_order_qty 通過）
- `leverage`: 1.0 固定（リスク抑制）
- `levels_per_side`: [2, 3, 4]

### 実行コマンド

```bash
python -m bt.cli batch --config-dir bt/config/batch/step3
```

### 次フェーズ

Phase A で PF > 1.0 の range_pct 帯が確認できたら、
その帯を基準に ATR連動の動的 range_pct（Phase B）を設計する。
