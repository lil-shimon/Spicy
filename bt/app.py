from __future__ import annotations

"""
@module BT Results Viewer
@context BTシステムの結果をブラウザで確認するためのStreamlitアプリ。
         CLIでのCSV/Markdown確認の代替として、視覚的なデータ確認を実現。
"""

from pathlib import Path

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
# 3ページをradioで切り替え。ページ数が少ないためselectboxより直感的なradioを採用。
page = st.sidebar.radio(
    "ページ選択",
    ["📊 最新結果", "📁 実行履歴", "📝 分析レポート"],
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
