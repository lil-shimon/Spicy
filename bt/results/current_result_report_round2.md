# 現在結果の振り返りレポート（保守化設定・再実行分）

作成日: 2026-02-18
対象ファイル:

- `results/train_top.csv`
- `results/oos_eval.csv`
- `config/defaults.yaml`
- 比較元: `results/current_result_report.md`

## 結論

保守化設定に変更後の再実行でも、OOS採用は **0/10**（全件 `accepted=False`）。
ただし、前回比で OOS の悪化幅は有意に縮小しており、方向性としては改善。

## 今回の設定（変更後）

- `levels_per_side: [3, 4, 5, 6, 7]`
- `leverage_values: [1.0, 1.5, 2.0]`
- `order_size_ratio_values: [0.01, 0.02, 0.03]`
- `range_pcts: [0.005, 0.01, 0.015, 0.02]`（変更なし）

## OOS評価サマリ（今回, 10件）

- accepted: **0/10**
- oos_return_pct: **10/10 がマイナス**（-10839.24 〜 -6510.33）
- oos_max_dd_pct: **10/10 が閾値超過**（2092.17 〜 2305.01, 閾値 8.0）
- overfit: **10/10 が True**
- oos_pf: **全件 1.0 未満**（0.983788 〜 0.984315）

## Train上位の傾向（今回）

- `range_pct=0.02` が上位を占有
- `leverage=2.0` に集中
- `order_size_ratio=0.03` に集中（一部 0.02）
- `levels` は 5〜7 中心

## 前回との差分（比較）

前回（`results/current_result_report.md`）:

- oos_return_pct: -71590.7 〜 -45698.2
- oos_max_dd_pct: 2449.91 〜 2507.33
- oos_pf: 0.9835 〜 0.9838

今回:

- oos_return_pct: **-10839.24 〜 -6510.33**（大幅改善）
- oos_max_dd_pct: **2092.17 〜 2305.01**（改善）
- oos_pf: **0.983788 〜 0.984315**（微改善）

## 解釈

- `leverage/order_size/levels` を保守化した効果で、OOS崩れは縮小。
- ただし依然として `range_pct=0.02` に上位が偏り、OOSで負ける構造は継続。
- したがって、次の主調整軸は `range_pct` を小さい側へ寄せること。

## 次アクション（推奨）

1. `grid_search.range_pcts` を小さい側へ絞る（例: `[0.005, 0.01]`）
2. 同条件で `search` -> `oos` を再実行
3. それでも全滅なら診断目的で一時的に `min_pf: 1.0` へ緩和してボトルネック切り分け
