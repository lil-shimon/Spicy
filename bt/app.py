from __future__ import annotations

"""
@module BT Results Viewer
@context BTシステムの結果をブラウザで確認するためのStreamlitアプリ。
         CLIでのCSV/Markdown確認の代替として、視覚的なデータ確認を実現。
"""

from pathlib import Path

import altair as alt
import pandas as pd
import streamlit as st

# app.pyはbt/ディレクトリに配置されるため、__file__の親をベースとする
BASE_DIR = Path(__file__).parent
RESULTS_DIR = BASE_DIR / "results"

st.set_page_config(page_title="BT Viewer", layout="wide")
st.title("🔍 BT Results Viewer")


def load_csv(path: Path) -> pd.DataFrame | None:
    """
    CSVファイルを読み込む。ファイルが存在しない場合はNoneを返す。
    @context ファイル不存在ケースを呼び出し元で統一的に処理するためNone返却を採用。
    """
    if not path.exists():
        return None
    return pd.read_csv(path)


def style_train_top(df: pd.DataFrame) -> pd.io.formats.style.Styler:
    """
    train_top.csv用のスタイラーを返す。
    max_dd_pct > 100 の行を赤背景でハイライト。
    @context 最大ドローダウンが100%を超える場合は資産全損リスクがあるため、
             視覚的に警告として赤背景を適用する。
    """
    # 数値を小数点2桁に丸める
    df = df.round(2)

    def highlight_max_dd(row: pd.Series) -> list[str]:
        # max_dd_pctカラムが存在し、値が100を超える行を赤背景にする
        if "max_dd_pct" in row.index and row["max_dd_pct"] > 100:
            return ["background-color: #ffcccc"] * len(row)
        return [""] * len(row)

    return df.style.apply(highlight_max_dd, axis=1)


def style_oos_eval(df: pd.DataFrame) -> pd.io.formats.style.Styler:
    """
    oos_eval.csv用のスタイラーを返す。
    accepted=True を緑、overfit=True を赤でハイライト。
    @context accepted/overfitの2状態を色分けすることで、
             合格/過学習を一目で判別できるようにする。
             overfitが優先（両方Trueの場合は赤）。
    """
    # 数値を小数点2桁に丸める
    df = df.round(2)

    def highlight_oos(row: pd.Series) -> list[str]:
        # overfit=Trueが優先で赤背景
        if "overfit" in row.index and row.get("overfit") is True:
            return ["background-color: #ffcccc"] * len(row)
        # accepted=Trueなら緑背景
        if "accepted" in row.index and row.get("accepted") is True:
            return ["background-color: #ccffcc"] * len(row)
        return [""] * len(row)

    return df.style.apply(highlight_oos, axis=1)


def show_csv_pair(run_dir: Path) -> None:
    """
    指定ディレクトリの train_top.csv と oos_eval.csv を並べて表示する。
    @context Page1・Page2で同じ表示ロジックを使うため共通関数として切り出し。
    """
    train_path = run_dir / "train_top.csv"
    oos_path = run_dir / "oos_eval.csv"

    st.subheader("train_top.csv")
    train_df = load_csv(train_path)
    if train_df is None:
        st.warning(f"ファイルが見つかりません: {train_path}")
    else:
        st.dataframe(style_train_top(train_df), use_container_width=True)

    st.subheader("oos_eval.csv")
    oos_df = load_csv(oos_path)
    if oos_df is None:
        st.warning(f"ファイルが見つかりません: {oos_path}")
    else:
        st.dataframe(style_oos_eval(oos_df), use_container_width=True)


# --- サイドバーナビゲーション ---
# 4ページをradioで切り替え。ページ数が少ないためselectboxより直感的なradioを採用。
page = st.sidebar.radio(
    "ページ選択",
    ["📊 最新結果", "📁 実行履歴", "📝 分析レポート", "📈 市場分析"],
)

# ============================================================
# Page 1: 最新結果
# ============================================================
if page == "📊 最新結果":
    st.header("📊 最新結果")
    # resultsディレクトリ直下のCSVを最新結果として表示する
    show_csv_pair(RESULTS_DIR)

# ============================================================
# Page 2: 実行履歴
# ============================================================
elif page == "📁 実行履歴":
    st.header("📁 実行履歴")

    runs_dir = RESULTS_DIR / "runs"

    # runsディレクトリが存在しない、またはサブディレクトリが空の場合はinfo表示
    if not runs_dir.exists():
        st.info("実行履歴がありません")
    else:
        # サブディレクトリのみを取得（ファイルは除外）
        run_dirs = sorted([d for d in runs_dir.iterdir() if d.is_dir()])

        if not run_dirs:
            st.info("実行履歴がありません")
        else:
            # run名のリストをselectboxで選択させる
            run_names = [d.name for d in run_dirs]
            selected_run = st.selectbox("Runを選択", run_names)

            if selected_run:
                selected_dir = runs_dir / selected_run
                show_csv_pair(selected_dir)

# ============================================================
# Page 3: 分析レポート
# ============================================================
elif page == "📝 分析レポート":
    st.header("📝 分析レポート")

    reports_dir = RESULTS_DIR / "reports"

    # reportsディレクトリが存在しない、または*.mdファイルが空の場合はinfo表示
    if not reports_dir.exists():
        st.info("レポートが見つかりません")
    else:
        md_files = sorted(reports_dir.glob("*.md"))

        if not md_files:
            st.info("レポートが見つかりません")
        else:
            # レポートファイル名をselectboxで選択させる
            report_names = [f.name for f in md_files]
            selected_report = st.selectbox("レポートを選択", report_names)

            if selected_report:
                report_path = reports_dir / selected_report
                # st.markdownでMarkdownをレンダリング表示
                content = report_path.read_text(encoding="utf-8")
                st.markdown(content)

# ============================================================
# Page 4: 市場分析
# ============================================================
elif page == "📈 市場分析":
    """
    @request train/validation/OOSの各期間でBTCの価格特性を可視化・分析したい
    @context 相場環境（レンジ/トレンド）をバックテスト期間ごとに把握することで、
             策略の適用条件や過学習リスクを直感的に評価する目的で追加。
             1分足→日足リサンプルでメモリ効率を確保しつつPlotlyがない環境に対応し
             Altair（venv組み込み済み）で描画する。
    """
    st.header("📈 市場分析")

    SPLITS_DIR = BASE_DIR / "data" / "splits"

    # --- データ読み込み ---
    @st.cache_data
    def load_splits() -> dict[str, pd.DataFrame]:
        """
        train / validation / OOS の1分足CSVを読み込みdatetimeインデックスに変換する。
        @context 大容量（計50万行超）のため st.cache_data でキャッシュし再描画コストを削減。
                 tsはUnixミリ秒なのでunit="ms"を指定。
        """
        result: dict[str, pd.DataFrame] = {}
        for label, fname in [("train", "train.csv"), ("validation", "validation.csv"), ("OOS", "oos.csv")]:
            path = SPLITS_DIR / fname
            if path.exists():
                df = pd.read_csv(path)
                # Unixミリ秒 → UTC datetime → インデックス化
                df["datetime"] = pd.to_datetime(df["ts"], unit="ms", utc=True)
                df = df.set_index("datetime").sort_index()
                result[label] = df
        return result

    splits = load_splits()

    if not splits:
        st.warning(f"データファイルが見つかりません: {SPLITS_DIR}")
        st.stop()

    # --- 日足リサンプル ---
    # @context st.cache_dataはdict[str, DataFrame]のハッシュ計算が不安定なため、
    #          ラベル単位でキャッシュしてからまとめる方式にする。
    @st.cache_data
    def resample_single_daily(df: pd.DataFrame) -> pd.DataFrame:
        """
        単一DataFrameを1分足 → 日足（OHLCV）にリサンプルする。
        @context ラベル単位でキャッシュすることでdict引数ハッシュの不安定さを回避。
        """
        return df[["open", "high", "low", "close", "volume"]].resample("1D").agg({
            "open": "first",
            "high": "max",
            "low": "min",
            "close": "last",
            "volume": "sum",
        }).dropna()

    daily_splits: dict[str, pd.DataFrame] = {
        label: resample_single_daily(df) for label, df in splits.items()
    }

    # ============================================================
    # ① 期間サマリーテーブル
    # ============================================================
    st.subheader("① 期間サマリー")

    def calc_summary(label: str, df_min: pd.DataFrame, df_day: pd.DataFrame) -> dict:
        """
        各期間のサマリー統計を計算する。
        @context 価格レンジ幅・実現ボラ・ATR・方向性を一表にまとめ、
                 レンジ/トレンド判別の定量根拠を提示する。
        """
        start_date = df_day.index.min().strftime("%Y-%m-%d")
        end_date = df_day.index.max().strftime("%Y-%m-%d")
        n_days = len(df_day)
        open_price = float(df_day["open"].iloc[0])
        close_price = float(df_day["close"].iloc[-1])
        high_price = float(df_day["high"].max())
        low_price = float(df_day["low"].min())

        # 価格レンジ幅(%) = (最高値 - 最安値) / 最安値 * 100
        price_range_pct = (high_price - low_price) / low_price * 100

        # 実現ボラ: 日次closeリターンのstd * 100
        daily_returns = df_day["close"].pct_change().dropna()
        realized_vol = float(daily_returns.std() * 100)

        # ATR: 日足 (high - low) の平均
        atr_mean = float((df_day["high"] - df_day["low"]).mean())

        # 方向性（騰落率%）= (終値 - 始値) / 始値 * 100
        direction_pct = (close_price - open_price) / open_price * 100

        return {
            "期間": label,
            "開始日": start_date,
            "終了日": end_date,
            "日数": n_days,
            "始値": f"{open_price:,.0f}",
            "終値": f"{close_price:,.0f}",
            "高値": f"{high_price:,.0f}",
            "安値": f"{low_price:,.0f}",
            "価格レンジ幅(%)": round(price_range_pct, 2),
            "実現ボラ(日次std%)": round(realized_vol, 3),
            "ATR(平均)": round(atr_mean, 0),
            "方向性(騰落率%)": round(direction_pct, 2),
        }

    summary_rows = []
    for label in ["train", "validation", "OOS"]:
        if label in splits and label in daily_splits:
            summary_rows.append(calc_summary(label, splits[label], daily_splits[label]))

    if summary_rows:
        summary_df = pd.DataFrame(summary_rows).set_index("期間")
        st.dataframe(summary_df, use_container_width=True)

    # ============================================================
    # ② 価格チャート（日足）: train=青, validation=オレンジ, OOS=赤
    # ============================================================
    st.subheader("② 価格チャート（日足）")

    # 各期間のデータに period ラベルを付けて結合する
    # @context Altairはlong-format推奨のため期間カラムを付与して concat する
    COLOR_MAP = {"train": "#4C78A8", "validation": "#F58518", "OOS": "#E45756"}

    chart_frames = []
    for label, df_day in daily_splits.items():
        tmp = df_day[["close"]].reset_index().copy()
        tmp.columns = ["datetime", "close"]
        tmp["period"] = label
        chart_frames.append(tmp)

    if chart_frames:
        chart_df = pd.concat(chart_frames).sort_values("datetime")
        # datetimeをナイーブにしてAltairの警告を回避
        chart_df["datetime"] = chart_df["datetime"].dt.tz_localize(None)

        # 期間境界の縦線用データ（各期間の開始日）
        boundary_dates = []
        for label, df_day in daily_splits.items():
            boundary_dates.append({
                "datetime": df_day.index.min().tz_localize(None),
                "period": label,
            })
        boundary_df = pd.DataFrame(boundary_dates)

        # 折れ線チャート: close価格を期間ごとに色分け
        line = (
            alt.Chart(chart_df)
            .mark_line(strokeWidth=1.5)
            .encode(
                x=alt.X("datetime:T", title="日付"),
                y=alt.Y("close:Q", title="終値 (USDT)", scale=alt.Scale(zero=False)),
                color=alt.Color(
                    "period:N",
                    scale=alt.Scale(
                        domain=list(COLOR_MAP.keys()),
                        range=list(COLOR_MAP.values()),
                    ),
                    legend=alt.Legend(title="期間"),
                ),
                tooltip=["datetime:T", "close:Q", "period:N"],
            )
        )

        # 縦線: 各期間の開始日に境界線を引く
        rules = (
            alt.Chart(boundary_df)
            .mark_rule(strokeDash=[4, 4], strokeWidth=1, opacity=0.6)
            .encode(
                x="datetime:T",
                color=alt.Color(
                    "period:N",
                    scale=alt.Scale(
                        domain=list(COLOR_MAP.keys()),
                        range=list(COLOR_MAP.values()),
                    ),
                ),
            )
        )

        price_chart = (line + rules).properties(height=350, title="BTC 日足終値（期間別）")
        st.altair_chart(price_chart, use_container_width=True)

    # ============================================================
    # ③ ボラティリティ推移（週足ベース）
    # ============================================================
    st.subheader("③ ボラティリティ推移（週足ベース）")

    @st.cache_data
    def calc_weekly_vol_single(df_day: pd.DataFrame, label: str) -> pd.DataFrame:
        """
        単一期間の週次実現ボラを計算する。
        @context ラベル単位でキャッシュしdict引数ハッシュ問題を回避。
                 日足リターンを週ごとに集約することで1分足直接集計より高速。
        """
        daily_ret = df_day["close"].pct_change().dropna()
        weekly_vol = daily_ret.resample("1W").std() * 100
        tmp = weekly_vol.reset_index()
        tmp.columns = ["datetime", "vol_pct"]
        tmp["period"] = label
        return tmp

    vol_rows = []
    for label, df_day in daily_splits.items():
        vol_rows.append(calc_weekly_vol_single(df_day, label))

    if vol_rows:
        vol_df = pd.concat(vol_rows).dropna().sort_values("datetime")
        vol_df["datetime"] = vol_df["datetime"].dt.tz_localize(None)
    else:
        vol_df = pd.DataFrame()

    if not vol_df.empty:
        vol_chart = (
            alt.Chart(vol_df)
            .mark_line(strokeWidth=1.5, point=alt.OverlayMarkDef(size=30))
            .encode(
                x=alt.X("datetime:T", title="週"),
                y=alt.Y("vol_pct:Q", title="実現ボラ (週次, %)"),
                color=alt.Color(
                    "period:N",
                    scale=alt.Scale(
                        domain=list(COLOR_MAP.keys()),
                        range=list(COLOR_MAP.values()),
                    ),
                    legend=alt.Legend(title="期間"),
                ),
                tooltip=["datetime:T", alt.Tooltip("vol_pct:Q", format=".3f"), "period:N"],
            )
            .properties(height=300, title="週次実現ボラティリティ推移（期間別）")
        )
        st.altair_chart(vol_chart, use_container_width=True)
