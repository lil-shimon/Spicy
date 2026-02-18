# 次アクション根拠と実行戦略

作成日: 2026-02-18
対象データ:

- `results/train_top.csv`
- `results/oos_eval.csv`
- `config/defaults.yaml`

## 1. 現状診断（事実ベース）

`results/oos_eval.csv`（10件）より:

- 採用件数: **0/10**（全件 `accepted=False`）
- `oos_return_pct`: **10/10で負**（-71590.7 〜 -45698.2）
- `oos_max_dd_pct`: **10/10で閾値超過**（2449.91 〜 2507.33、閾値 8.0）
- `overfit`: **10/10で True**
- `oos_pf`: **全件 1.05未満**（約 0.9835〜0.9838）

`results/train_top.csv`（上位10件）より:

- `range_pct=0.02` が 10/10
- `leverage=3.0` が 10/10
- `order_size_ratio=0.08` が 10/10
- `levels` は 7〜10 に集中

## 2. 次アクションの根拠

### 根拠A: 探索が「攻め側パラメータ」に偏っている

Train上位が `leverage=3.0` と `order_size_ratio=0.08` に完全集中。
この構成は約定回数・ポジション量が大きくなり、コストと逆行時の損失増幅を受けやすい。

### 根拠B: OOSで全評価軸が同時悪化

`oos_return`、`dd`、`pf`、`overfit` が同時に不合格。
単純な閾値調整ではなく、まず探索領域そのものを保守側へ移す必要がある。

### 根拠C: 閾値緩和の前に「ボトルネック構造」の再確認が必要

現状は `max_oos_dd_pct` を極端に超過しており、`oos_return` も負。
この段階で閾値を緩めると、実運用耐性のない設定を採用するリスクが高い。

## 3. 戦略（実行順）

## フェーズ1: 探索空間を保守化（本命）

`config/defaults.yaml` の `grid_search` を以下へ調整:

- `order_size_ratio_values: [0.01, 0.02, 0.03]`
- `leverage_values: [1.0, 1.5, 2.0]`
- `levels_per_side: [3, 4, 5, 6, 7]`

狙い:

- 取引量とリスクを下げ、ドローダウン耐性を改善
- OOSでのPFとリターンの崩れを軽減
- 過学習の出やすい高負荷設定を探索上位から外す

## フェーズ2: 同条件で再探索・再評価

実行コマンド:

```bash
python -m bt.cli search --infile bt/data/splits/train.csv --out-csv bt/results/train_top.csv --out-md bt/results/train_top.md
python -m bt.cli oos --candidates-csv bt/results/train_top.csv --oos-file bt/data/splits/oos.csv --out-csv bt/results/oos_eval.csv --out-md bt/results/oos_eval.md
```

判定ポイント:

- `accepted` が 1件以上出るか
- `oos_return_pct >= 0` を満たす候補が増えるか
- `oos_max_dd_pct` が閾値に近づくか
- `overfit=True` 比率が下がるか

## フェーズ3: 診断目的の閾値緩和（限定的）

フェーズ2でも全滅の場合のみ、**一時的に**緩和してボトルネックを特定:

- `min_pf: 1.0`（診断用）
- 必要なら `max_oos_dd_pct` を段階的に緩和（例: 8.0 -> 12.0 -> 15.0）

注意:

- 緩和設定は採用確定用ではなく原因切り分け用
- ボトルネック特定後は必ず元の基準へ戻して再評価

## 4. 代替戦略（フェーズ1で改善が弱い場合）

- `range_pct` を狭める方向（例: 0.005, 0.01）を優先
- `fill_failure_rate` ごとの差分を確認し、約定依存性が高い候補を除外
- 探索上位抽出ロジックを「train高収益偏重」から「DD/PF重み付き」へ変更検討

## 5. 提案する意思決定ルール

次回実行後、以下でGo/No-Goを判断:

- Go: `accepted >= 1` かつ `overfit=False` を含む
- Hold: `accepted=0` だが `oos_return` と `oos_dd` が有意改善
- No-Go: 指標が横ばい/悪化（探索空間または評価設計を再定義）

## 6. 要約

現在は「閾値が厳しすぎる」のではなく、
**探索上位が高リスク側に偏ってOOSで崩れる構造**が主因。
したがって最短ルートは、まず探索空間を保守化し、
その後に必要最小限の診断緩和でボトルネックを確定する手順。
