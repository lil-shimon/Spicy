# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

TypeScriptで構築された仮想通貨取引ボット。3つの主要モジュールで構成：

1. **アービトラージボット** - 取引所間の価格差を利用した取引
2. **マーケットメイキング（現物）** - MEXC現物市場での両建て取引
3. **マーケットメイキング（先物）** - KuCoin先物市場でのメイカー取引

## 開発コマンド

**重要：pnpmのみを使用（package.jsonで強制）**

```bash
# 基本コマンド
pnpm install              # 依存関係インストール
pnpm build               # TypeScriptビルド
pnpm test                # テスト実行
pnpm test path/to/file.spec.ts  # 単一テスト実行
pnpm lint                # ESLint実行
pnpm typecheck           # 型チェック実行
pnpm format              # Prettier実行

# ボット実行
pnpm dev                 # アービトラージボット
pnpm dirty-work          # マーケットメイキング（現物）

pnpm demo                # デモモード
pnpm api                 # APIサーバー（開発）

# PM2管理
pnpm start:server        # PM2でボット起動
pnpm start:api           # PM2でAPI起動
pnpm log:server          # ボットログ表示
pnpm log:api             # APIログ表示
pnpm restart             # ボット再起動
pnpm restart:api         # API再起動
```

## アーキテクチャ

### 3つのメインモジュール

#### 1. アービトラージ（src/index.ts, src/bot.ts）

- 30秒間隔で取引所間の価格差を監視
- Bybit、MEXC、KuCoinのオーダーブックを分析
- スリッページとテイカー手数料を考慮した利益計算
- 利益閾値0.5%以上で通知、MEXC自動注文対応

#### 2. マーケットメイキング現物（src/dirty-work/）

- MEXC現物市場での両建て注文
- 30秒タイムアウトで注文管理
- インベントリとP&L追跡
- CSVでの取引記録

### コーディングパターン

**関数型プログラミング（クロージャーパターン）を採用**

- クラスは使用せず、`createXxxService`、`createXxxManager`形式でエクスポート
- 例：`src/dirty-work/services/`

### 主要ディレクトリ構造

```
src/
├── clients/           # 取引所APIクライアント（ccxtラッパー）
├── core/              # コア計算ロジック（利益率、手数料）
├── constants/         # 定数定義（TAKER_FEES、MAKER_FEES_FUTURES等）
├── logic/             # ビジネスロジック（アービトラージ判定、スリッページ）
├── dirty-work/        # マーケットメイキング現物

└── utils/             # ユーティリティ関数
```

### 重要ファイル

- `src/constants/constant.ts` - 取引ペア、取引所、手数料定義
- `src/logic/checkArbitrage.ts` - アービトラージ機会の判定
- `src/logic/slippage/` - 買い側・売り側スリッページ計算
- `src/clients/kucoin/kucoin-ws.ts` - WebSocket統合

## 環境変数

`.env`ファイル（`.env.example`参照）：

```env
# Discord通知
DISCORD_WEBHOOK_URL=xxx
DISCORD_WEBHOOK_URL_ORDER=xxx  # 注文通知用

# 取引所API（取引実行時に必要）
MEXC_API_KEY=xxx
MEXC_SECRET=xxx
BYBIT_API_KEY=xxx
BYBIT_SECRET=xxx
KUCOIN_API_KEY=xxx
KUCOIN_SECRET=xxx
KUCOIN_PASSPHRASE=xxx

# 機能フラグ
FEATURE_FLAG_ENABLE_ORDER=false  # 自動取引有効化
```

## テスト戦略

- Vitest使用、`*.spec.ts`パターン
- 取引所レスポンスはモック化
- 利益計算とアービトラージロジックに重点

## 本番環境

```bash
# PM2での運用
pm2 start dist/index.js --name spicy
pm2 start dist/src/server.js --name spicy-api
pm2 logs spicy
pm2 status
```

## Git操作

### ブランチ命名

- `feat/spicy-{issue番号}-{機能名}` - 新機能
- `refactor/spicy-{issue番号}-{内容}` - リファクタリング
- `docs/{内容}` - ドキュメント

### コミットメッセージ

```
{type}({scope}): {subject}
```

- `feat`: 新機能
- `refactor`: リファクタリング
- `test`: テスト追加
- `fix`: バグ修正
- `chore`: その他

### 開発フロー

```bash
git checkout main && git pull origin main
git checkout -b feat/spicy-123-feature-name
# 開発・テスト後
pnpm test && pnpm lint && pnpm typecheck
git add -p  # 変更を論理的に分割
git commit -m "feat(core): add new calculation logic"
git push -u origin feat/spicy-123-feature-name
gh pr create
```
