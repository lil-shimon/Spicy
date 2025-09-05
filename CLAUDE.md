# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

TypeScriptで構築された仮想通貨アービトラージボット。関数型プログラミングアーキテクチャを採用。

## 必須開発コマンド

```bash
# 開発（pnpmのみ使用 - package.jsonで強制）
pnpm dev                         # アービトラージボット実行
pnpm test                        # 全テスト実行
pnpm test src/path/file.spec.ts  # 単一テストファイル実行
pnpm lint                        # ESLint実行
pnpm typecheck                   # TypeScript型チェック
pnpm build                       # TypeScriptビルド

# コミット前に必ず実行
pnpm lint && pnpm typecheck && pnpm test

# 本番
pnpm start:server                # PM2でボット起動
pnpm log:server                  # ボットログ確認
pnpm restart                     # ボット再起動
```

## アーキテクチャパターン

### ファクトリ関数パターン（重要）

**クラスは一切使用しない** - 全モジュールはファクトリ関数とクロージャーで実装：

```typescript
// Services: export const XxxService = (params) => ({ methods })
export const ArbitrageService = (params) => ({ checkTriangleArbitrage });

// Controllers: export const XxxController = () => ({ methods })
export const ArbitrageController = () => ({ execute });

// Clients: export const createXxx 関数形式
export const createMexcOrder = async (params) => {};
```

### モジュール構成

- **Controllers** (`src/controllers/`) - リクエスト調整、サービス呼び出し
- **Services** (`src/services/`) - ビジネスロジック、リポジトリ使用
- **Repositories** (`src/repositories/`) - データアクセス層
- **Clients** (`src/clients/`) - 外部API統合（取引所、Discord）
- **Core** (`src/core/`) - 純粋な計算関数（利益率、手数料）
- **Domain** (`src/domain/`) - ドメインモデルと型定義

### データフロー

```
index.ts → ArbitrageController → ArbitrageService → Repositories/Clients
                                      ↓
                                  Core計算処理
```

## 重要な実装詳細

### 取引所統合

- **WebSocket**: KuCoinのみ永続的WebSocket接続使用（`kucoin-ws.ts`）
- **REST API**: その他の取引所はccxtライブラリのラッパー使用
- **注文作成**: `createMexcOrder`、`createBybitOrder`、`createKucoinFuturesOrder`関数のみ
- **機能フラグ**: 実際の注文には`FEATURE_FLAG_ENABLE_ORDER=true`が必要

### テスト戦略

- テストファイル: ソースファイルと同じディレクトリに`*.spec.ts`
- 全外部API呼び出しをモック化
- フォーカス: コア計算とアービトラージロジック
- セットアップ: `src/test-setup.ts`でグローバルテスト設定

### エラーハンドリングパターン

全外部呼び出しはtry-catchでラップし、エラー時はDiscord通知。

## 環境変数

`.env`に必須：

- `DISCORD_WEBHOOK_URL` - メイン通知
- `DISCORD_WEBHOOK_URL_ORDER` - 注文通知
- 取引所APIキー（`FEATURE_FLAG_ENABLE_ORDER=true`時）

## Gitワークフロー

```bash
# ブランチ命名
feat/spicy-{issue番号}-{機能名}
refactor/spicy-{issue番号}-{説明}

# コミット形式
{type}({scope}): {メッセージ}
# types: feat, fix, refactor, test, chore

# プッシュ前チェックリスト
pnpm lint && pnpm typecheck && pnpm test
```

## 開発のヒント

1. **必ずファクトリ関数を使用**、クラスは絶対に使わない
2. **コミット前にテスト実行** - Huskyがlint-stagedを自動実行
3. 実装前に**隣接ファイルの既存パターンを確認**
4. **WebSocket接続**は`kucoin-ws.ts`のみ
5. アービトラージチェックは**30秒間隔**（`src/index.ts`参照）
