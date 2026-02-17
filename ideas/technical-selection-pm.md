# 仮想通貨Botプロジェクト 技術選定（PM方針）

## 結論

初期フェーズは開発速度を最優先し、以下の2層構成を採用する。

- Backtest/Research: Python
- Live Trading/運用API: TypeScript

Rustは初期採用しない。運用上のボトルネックが顕在化した段階で、
執行系の一部を段階移行する。

## 採用アーキテクチャ

### 1. research（Python）

- 役割: バックテスト、パラメータ探索、特徴量検証
- 技術: `Python 3.12`, `polars`, `numpy`, `numba`, `vectorbt`（または独自event-driven）, `optuna`, `jupyter`
- 理由: 開発速度と検証速度が最速

### 2. live-trading/orchestrator（TypeScript）

- 役割: 本番執行、注文管理、ポジション管理、戦略ON/OFF、設定配信、通知
- 技術: `Node.js`, `TypeScript`, `Fastify`, `Zod`, `Pino`
- 理由: 初期の実装速度と運用改善サイクルを最大化できる

## データ基盤

- 時系列DB: `TimescaleDB (PostgreSQL)`
- キャッシュ/キュー: `Redis`
- 研究用分析: `Parquet + DuckDB`
- 共通スキーマ: `protobuf` または `JSON Schema`

## バックテスト方針（高速化重視）

- レイヤーA: ベクトル化高速BT（大量パラメータ探索）
- レイヤーB: イベント駆動BT（遅延・部分約定・手数料を再現）
- 運用: Aで候補抽出し、Bで壊れないもののみ本番候補化

## 実運用必須機能

- リスクエンジン分離（最大DD、日次損失、建玉上限、非常停止）
- 注文状態機械（`new -> open -> partial -> filled/canceled/rejected`）
- 冪等性（クライアント注文ID一意化）
- 観測性（`Prometheus + Grafana`、通知 `Discord/Slack`）

## 開発・品質

- モノレポ: `pnpm workspace + uv(or poetry)`
- CI: `GitHub Actions`（lint/typecheck/test/backtest-smoke）
- テスト: Python `pytest` / TS `vitest`
- 契約テスト: API/メッセージスキーマ互換性検証

## 4週間ロードマップ

1. Week 1: データ収集基盤、BT雛形、KPI定義
2. Week 2: グリッドBT（コスト込み）、Optuna探索
3. Week 3: TS実行エンジンMVP、ペーパー運用
4. Week 4: 極小額本番、監視/アラート、週次改善ループ

## Rust移行トリガー（将来）

以下のいずれかを継続的に満たす場合のみ、執行層のRust化を検討する。

- 約定遅延やイベント処理遅延がPnLに実害を与える
- プロセス安定性（クラッシュ/GC影響）が運用要件を満たさない
- 同時銘柄/同時戦略数の増加でTS実装の保守性が低下する
