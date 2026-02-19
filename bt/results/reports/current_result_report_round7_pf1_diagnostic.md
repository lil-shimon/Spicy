# 診断レポート（min_pf=1.0 再評価）

作成日: 2026-02-19
対象:

- config: `config/batch/step2/lr2_e_diag_pf1.yaml`
- candidates: `results/runs/step2_lr2_only__lr2_e/train_top.csv`
- result: `results/runs/step2_lr2e_diag_pf1_01/oos_eval.csv`

## 実行結果

- `oos_done rows=10 accepted=0`

## 観測

- 9/10行で `oos_return_pct=0.0`, `oos_max_dd_pct=0.0`, `oos_pf=1.0`, `overfit=False`
- それでも `accepted=False`

## 原因（コード確認）

`eval/overfit_check.py` の `accept_candidate` 判定が以下のため:

- `oos_return > min_return`（**厳密不等号**）
- `oos_dd <= max_dd`
- `oos_pf >= min_pf`

今回 `min_return=0.0` なので、`oos_return=0.0` は不合格。
このため PF を 1.0 に緩めても `accepted` が増えなかった。

## 重要ポイント

今回のボトルネックは PF 単体ではなく、

- `min_return` 判定が `>=` ではなく `>` であること
- かつ `oos_return` が 0 近傍に張り付いていること

## 次アクション候補

1. 診断目的で `min_oos_return_pct: -0.1` に一時変更して再評価
2. もしくは判定ロジックを `oos_return >= min_return` に変更する是非を検討
3. そのうえで PF と return の基準を本番向けに再設定
