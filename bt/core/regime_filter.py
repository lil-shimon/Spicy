"""
@module Regime Filter（レンジ/トレンド判定）
@context グリッド戦略はレンジ相場でのみ機能する。
         Efficiency Ratio(ER)を使って各キャンドル時点の市場レジームを判定し、
         トレンド相場ではグリッドを停止するためのマスクを生成する。
"""
from __future__ import annotations

import datetime
from bt.core.types import Candle


def compute_regime_mask(
    candles: list[Candle],
    lookback_days: int = 10,
    er_threshold: float = 0.3,
    ma_lookback_days: int = 20,
) -> list[bool]:
    """
    各キャンドル時点のレンジ/トレンド判定マスクを返す。
    @request トレンド相場でグリッドを停止するフィルターを追加したい
    @context Efficiency Ratio = 正味変化 / 全変化の絶対値合計。
             ER≈0はチョッピー（レンジ）、ER≈1は一方向（トレンド）。
             1分足→日次closeに変換してER計算後、1分足タイムスタンプにマッピングする。
             - lookback_days=10 はKaufman本人の推奨値（1995年 "Smarter Trading"）。クリプト市場では7〜10が推奨される傾向。
             - er_threshold=0.3 はトレンド/ノイズの足切りとして文献引用頻度が最も高い値（TrendSpider, StrategyQuantなど）。
             - 【MA方向性フィルター追加】ERは「トレンドの強度」は測れるが「上昇か下落か」の方向性を示さない。
               緩やかな下落トレンドではERが低いままグリッドが稼働し続ける問題があった。
               MAフィルター（close >= MA）を追加することで方向性を判定する。
               is_ranging = (ER < threshold) AND (close >= MA) の両方OKのときのみグリッド稼働。
             - ma_lookback_days=20 はトレンド判定で最も広く使われる期間（約1ヶ月）。
               MAデータ不足期間（先頭ma_lookback_days-1日）はMA条件を免除し稼働扱いとする。
    """
    if not candles:
        return []

    # 1. candle.ts（Unixミリ秒）を日付に変換し、日次close辞書を生成
    #    各日の最後のキャンドルのcloseを採用
    daily_close: dict[datetime.date, float] = {}
    for candle in candles:
        day = datetime.date.fromtimestamp(candle.ts / 1000)
        # 同じ日の後続キャンドルで上書き → 最後のキャンドルが残る
        daily_close[day] = candle.close

    # 2. 日付順にソート
    sorted_days = sorted(daily_close.keys())
    closes = [daily_close[d] for d in sorted_days]

    # 3. 各日のMA計算（ma_lookback_days日の単純移動平均）
    #    データ不足期間（先頭ma_lookback_days-1日）はNone
    daily_ma: dict[datetime.date, float | None] = {}
    for idx, day in enumerate(sorted_days):
        if idx < ma_lookback_days - 1:
            daily_ma[day] = None
        else:
            daily_ma[day] = sum(closes[idx - ma_lookback_days + 1: idx + 1]) / ma_lookback_days

    # 4. 各日のER値を計算し、MAフィルターと組み合わせて判定
    daily_ranging: dict[datetime.date, bool] = {}
    for idx, day in enumerate(sorted_days):
        if idx < lookback_days:
            # lookback_days分に満たない先頭期間はTrue（稼働）
            daily_ranging[day] = True
            continue

        # ER = abs(close_today - close_N_days_ago) / sum(abs(close[i] - close[i-1]))
        net_change = abs(closes[idx] - closes[idx - lookback_days])
        total_change = sum(
            abs(closes[i] - closes[i - 1])
            for i in range(idx - lookback_days + 1, idx + 1)
        )

        if total_change == 0:
            # 値動きなし → レンジ扱い
            er = 0.0
        else:
            er = net_change / total_change

        # MAデータ不足時はMA条件を免除（先頭期間は方向性フィルターなし）
        ma = daily_ma[day]
        ma_ok = (ma is None) or (closes[idx] >= ma)

        # ER < threshold かつ close >= MA → True（レンジ = 稼働OK）
        daily_ranging[day] = (er < er_threshold) and ma_ok

    # 5. 各candle.tsの日付をキーにlist[bool]を生成
    mask: list[bool] = []
    for candle in candles:
        day = datetime.date.fromtimestamp(candle.ts / 1000)
        mask.append(daily_ranging[day])

    return mask
