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

4. train探索 → OOS評価（一括実行）

```bash
python -m bt.cli run
```

- `search` → `oos` を1コマンドで直列実行する
- 結果は `bt/results/runs/YYYYMMDD_HHMMSS/` に自動保存

個別に実行したい場合:

```bash
python -m bt.cli search   # train探索のみ
python -m bt.cli oos      # OOS評価のみ（search後に実行）
```

5. 並列バッチ実行（複数config）

```bash
python -m bt.cli batch --config-dir bt/config/batch/step2
```

- 指定ディレクトリ配下の `*.yaml` を検出して `search -> oos` を並列実行
- デフォルト並列数は `4`（`--workers` で変更可能）
- 出力は各runディレクトリ（`bt/results/runs/<run_id>/`）へ保存
- `batch` 実行時は固定ファイル（`bt/results/train_top.csv`, `bt/results/oos_eval.csv`）は更新しない
- 推奨: `bt/config/batch/step1`, `bt/config/batch/step2` のように実験セットごとに分割し、再実行の無駄を防ぐ

## 結果保存（履歴保持）

- デフォルト実行（引数なし）でも、各実行で `bt/results/runs/YYYYMMDD_HHMMSS/` が自動作成され、結果が保存される
- 互換のため、`bt/results/train_top.csv` / `bt/results/oos_eval.csv` など固定パスも最新結果で更新される
- 実行ログに `run_id` と `saved_run_dir` が表示される
- 同一秒のディレクトリが既に存在する場合は衝突エラーで終了

通常は `--run-id` は不要。同一IDで束ねたいときだけ指定:

```bash
python -m bt.cli run --run-id my_run_001 ...
```

## 仕様

- 銘柄: `BTCUSDTM`
- 粒度: `1m`
- 分割: `6:2:2`
- 探索: 本数 / レンジ / レバ / 注文サイズ / 約定失敗率（0,2,5%）
- 採用判定: OOSの `return`, `max_dd`, `pf`

## ビューアー起動

```bash
source bt/.venv/bin/activate
streamlit run bt/app.py
```

ブラウザで `http://localhost:8501` が自動的に開きます。

## バグ管理・修正方針

### ファイル構成

```
bt/bug.md              # 発見したバグ・改善点の一覧（概要とステータス）
bt/bugfix/
  BUG-01-xxx.md        # バグごとの詳細ドキュメント
  BUG-02-xxx.md
  ...
```

### 各ドキュメントの内容

- **現状**: 問題のあるコードと何が起きているか
- **あるべき姿**: 正しい動作の説明と具体例
- **修正方針**: どう直すか（実装の方向性）
- **ステータス**: 現状把握 / 修正実装 / 動作確認

### フロー

1. `bug.md` でバグを一覧管理し、対応方針（する/しない/後回し）を決める
2. 対応するバグは `bugfix/BUG-XX-xxx.md` を作成して詳細を詰める
3. 修正完了後は `bug.md` と各ドキュメントのステータスを更新する
