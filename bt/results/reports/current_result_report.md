# 現在結果の振り返りレポート

作成日: 2026-02-18
対象ファイル:

- `results/train_top.csv`
- `results/oos_eval.csv`
- `config/defaults.yaml`

## 結論

現行の探索結果では、OOS採用条件を満たす候補は 0 件。
主因は単一ではなく、`oos_return_pct`・`oos_max_dd_pct`・`overfit`・`oos_pf` が同時に不合格。

## OOS評価サマリ（10件）

- accepted: 0/10（全件 `False`）
- oos_return_pct: 10/10 がマイナス（範囲: -71590.7 〜 -45698.2）
- oos_max_dd_pct: 10/10 が閾値超過（閾値 8.0 に対し、2449.91 〜 2507.33）
- overfit: 10/10 が `True`
- oos_pf: 全件 1.05 未満（約 0.9835〜0.9838）

## train上位候補の偏り

`results/train_top.csv` の上位10件は、ほぼ以下の同型パラメータに集中。

- `range_pct = 0.02`（10/10）
- `leverage = 3.0`（10/10）
- `order_size_ratio = 0.08`（10/10）
- `levels` は 7〜10 に集中

## 現在の採用閾値（config/defaults.yaml）

- `min_oos_return_pct: 0.0`
- `max_oos_dd_pct: 8.0`
- `min_pf: 1.05`

## 所見

Trainで上位化した候補が、OOSでコスト・ドローダウン耐性を満たせず崩れる構図。
探索が高レバ・大きめ発注比率側に偏っており、過学習とOOS劣化が同時発生している。

## 次アクション（メモ）

- 探索を保守側へ寄せる
  - `order_size_ratio_values`: 0.01, 0.02, 0.03
  - `leverage_values`: 1.0, 1.5, 2.0
  - `levels_per_side`: 3〜7
- 再実行後、同レポート形式で差分比較
