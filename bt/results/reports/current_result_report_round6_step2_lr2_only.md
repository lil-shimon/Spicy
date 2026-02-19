# 現在結果の振り返りレポート（step2_lr2_only 集計）

作成日: 2026-02-19
対象run:

- `results/runs/step2_lr2_only__lr2_a`
- `results/runs/step2_lr2_only__lr2_b`
- `results/runs/step2_lr2_only__lr2_c`
- `results/runs/step2_lr2_only__lr2_d`
- `results/runs/step2_lr2_only__lr2_e`

## 総括

- 全ケース `accepted=0`
- ただし `lr2_e` が突出して改善（ほぼ合格域に接近）
- 現在の最大ボトルネックは `min_pf=1.05`

## ケース別サマリ

- lr2_a: ret_avg=-126.69, dd_avg=174.13, pf_avg=0.984525, overfit_true=9/9
- lr2_b: ret_avg=-165.50, dd_avg=225.38, pf_avg=0.984752, overfit_true=6/6
- lr2_c: ret_avg=-248.96, dd_avg=332.69, pf_avg=0.984785, overfit_true=6/6
- lr2_d: ret_avg=-179.99, dd_avg=200.78, pf_avg=0.981759, overfit_true=10/10
- lr2_e: ret_avg=-4.87, dd_avg=7.06, pf_avg=0.998384, overfit_true=1/10

## 採用条件の通過数（件数）

- lr2_a: return>=0 0, dd<=8 0, pf>=1.05 0, overfit=False 0
- lr2_b: return>=0 0, dd<=8 0, pf>=1.05 0, overfit=False 0
- lr2_c: return>=0 0, dd<=8 0, pf>=1.05 0, overfit=False 0
- lr2_d: return>=0 0, dd<=8 0, pf>=1.05 0, overfit=False 0
- lr2_e: return>=0 9, dd<=8 9, pf>=1.05 0, overfit=False 9

## 解釈

- `lr2_e` は return/DD/overfit の3条件で 9/10 通過。
- 失格の主因は `pf>=1.05` 条件で、ここだけ全件未達。
- したがって現フェーズは、戦略崩壊ではなく採用閾値（特にPF）の適合性確認フェーズ。

## 次アクション

1. 診断目的で `min_pf: 1.0` に一時緩和し、`lr2_e` の採用件数を確認
2. 同時に `lr2_e` 周辺（`order_size_ratio 0.007~0.01`）を追加探索し、PFを1.0超へ押し上げられるか検証
3. 診断後は本番基準へ戻して再判定
