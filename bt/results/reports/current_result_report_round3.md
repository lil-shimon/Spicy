# 現在結果の振り返りレポート（range狭小化検証）

作成日: 2026-02-18
対象run:

- search: `results/runs/20260218_171452/train_top.csv`
- oos: `results/runs/20260218_171706/oos_eval.csv`

比較元:

- `results/current_result_report_round2.md`

## 結論

`range_pcts` を狭小化（`[0.005, 0.01]`）して再検証したが、採用候補は **0/10**（全件 `accepted=False`）。
ただし、OOSリターンの悪化幅は前回より縮小。反面、`range_pct=0.005` を含む候補で OOS DD が大きく悪化するケースが発生。

## 今回のOOSサマリ（10件）

- accepted: **0/10**
- oos_return_pct: **10/10 がマイナス**（`-8544.07` 〜 `-3410.12`）
- oos_max_dd_pct: **10/10 が閾値8.0超過**（`2104.63` 〜 `12044.29`）
- overfit: **10/10 が True**
- oos_pf: **全件 1.0 未満**（`0.980752` 〜 `0.988785`）

## train上位の傾向

- `range_pct=0.01` が主（8/10）
- `range_pct=0.005` も一部上位入り（2/10）
- `leverage=2.0`, `order_size_ratio=0.03` に集中

## 前回（round2）との比較

round2:

- oos_return_pct: `-10839.24` 〜 `-6510.33`
- oos_max_dd_pct: `2092.17` 〜 `2305.01`
- oos_pf: `0.983788` 〜 `0.984315`

今回:

- oos_return_pct: **`-8544.07` 〜 `-3410.12`（改善）**
- oos_max_dd_pct: **`2104.63` 〜 `12044.29`（上限は悪化）**
- oos_pf: **`0.980752` 〜 `0.988785`（分散拡大）**

## 解釈

- `range_pct=0.02` を外した効果で、OOS損失幅は縮小した候補が増えた。
- ただし `range_pct=0.005` は今回のデータでは DD を悪化させる可能性が高い。
- 次の検証は `range_pct=0.01` 単独に固定して、`0.005` の悪影響を切り分けるのが妥当。

## 次アクション

1. `grid_search.range_pcts` を `[0.01]` に固定
2. `search -> oos` を同一 `--run-id` で再実行
3. 依然全滅なら、診断目的で一時的に `min_pf: 1.0` を適用してボトルネック切り分け
