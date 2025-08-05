# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) への指針を提供します。

## プロジェクト概要

これはTypeScriptで構築された高度な仮想通貨アービトラージボットで、取引所間（Bybit、MEXC）の価格差を監視し、収益性の高い取引機会を特定します。ボットは継続的に実行され、機会が見つかるとDiscord通知を送信し、さらにMEXC取引所での自動注文作成機能も持っています。また、取引ペアの活動状況をCSVファイルにログ記録します。

## 開発コマンド

**重要：このプロジェクトではpnpmのみを使用します（package.jsonで強制されています）**

```bash
# 依存関係のインストール
pnpm install

# メインボットの実行
pnpm dev

# テストの実行
pnpm test

# リンターの実行
pnpm lint

# デモスクリプトの実行
pnpm demo

# TypeScriptのビルド
pnpm build

# ビルド済みファイルの実行
pnpm start

# pm2でサーバーとして実行
pnpm start:server

# pm2ログの確認
pnpm log:server

# pm2サーバーの再起動
pnpm restart
```

単一のテストファイルを実行するには：

```bash
pnpm test path/to/test.spec.ts
```

## アーキテクチャと主要コンポーネント

### コアフロー

1. **src/index.ts** - 30秒間隔でボットを初期化するエントリーポイント
2. **src/bot.ts** - すべての操作を調整するメインボットロジック
3. **src/logic/checkArbitrage.ts** - 価格差を分析し、利益機会を計算
4. **src/logic/fetchPrice.ts** - ccxtライブラリを使用して取引所から現在の価格を取得

### 取引所統合

- すべての取引所クライアントは`src/clients/`にあり、ccxtライブラリをラップしています
- 各取引所はAPI の違いにより、特定のオーダーブック取得ロジックを持っています
- 取引所手数料は`src/constants/exchangeFees.ts`で設定されています

### 利益計算

- ボットは買い側と売り側の両方のテイカー手数料を考慮します
- 最小利益閾値は0.5%（定数で設定可能）
- 利益計算は`src/core/profit-rate/`にあります
- スリッページ計算は`src/logic/slippage/`にあります（買い側・売り側で分離）

### 理解すべき重要なファイル

- **src/constants/constant.ts** - 取引ペア、取引所、手数料、利益閾値の定義
- **src/bot.ts** - メインオーケストレーションロジック
- **src/clients/discord/post-message.ts** - Discord通知システム（.envにwebhook URLが必要）
- **src/clients/mexc/create-mexc-order.ts** - MEXC自動注文作成機能
- **src/clients/bybit/fetch-bybit-balance.ts** - Bybit残高取得
- **src/clients/mexc/fetch-mexc-balance.ts** - MEXC残高取得
- **src/utils/write-count-to-csv/** - 取引ペア活動状況のCSVログ記録

## 環境設定

`.env`ファイルを作成し、以下を記述：

```
DISCORD_WEBHOOK_URL=your_webhook_url_here
```

## テストアプローチ

- ユニットテストはTypeScriptでVitestを使用
- 一貫したテストのために取引所レスポンスをモック
- テストファイルは`*.spec.ts`パターンに従う
- 利益計算とアービトラージロジックのテストに焦点を当てる

## 既知のパターン

- すべての非同期操作はasync/awaitを使用
- 取引所APIコールはtry-catchブロックでラップされている
- 価格は取得後、数値（文字列ではない）として処理される
- ボットはシンプルなインターバルベースのポーリングアプローチを使用（30秒間隔）
- 取引実行機能はMEXCでのみ実装済み
- Binance、KuCoinは実装済みだが現在無効化されている

## 本番環境での実行

本番サーバーでの実行には以下のコマンドを使用：

```bash
# サーバーへのSSH接続
ssh -i ~/.ssh/spicy.pem bitnami@<ip>

# pm2でサーバーとして起動
pm2 start dist/index.js --name spicy

# ログの確認
pm2 logs spicy
```

## ブランチ戦略とGit操作

### ブランチ命名規則

最近のPRパターンから学んだブランチ命名規則：

- `feat/spicy-{issue番号}-{機能名}` - 新機能追加
- `refactor/spicy-{issue番号}-{内容}` - リファクタリング
- `docs/{内容}` - ドキュメント更新

例：

- `feat/spicy-55-futures-maker-fees`
- `refactor/spicy-50-pnl-service`
- `docs/add-ccxt-documentation`

### 開発フロー

```bash
# 1. 最新のmainブランチを取得
git checkout main && git pull origin main

# 2. 新しいブランチを作成
git checkout -b feat/spicy-{issue番号}-{機能名}

# 3. 開発・テスト
pnpm test
pnpm lint
pnpm tsc --noEmit

# 4. コミット（分割して作成）
git add src/constants/constant.ts
git commit -m "feat(constants): add MAKER_FEES_FUTURES for KuCoin futures trading"

git add src/core/maker-fee/maker-fee.ts
git commit -m "feat(core): add getMakerFeeFutures utility function"

git add src/core/maker-fee/maker-fee.spec.ts
git commit -m "test(core): add tests for getMakerFeeFutures function"

# 5. リモートにプッシュ
git push -u origin {ブランチ名}

# 6. PR作成
gh pr create --title "feat: {機能概要}" --body "..."
```

### コミットメッセージフォーマット

```
{type}({scope}): {subject}

- {詳細1}
- {詳細2}
```

type例：

- `feat`: 新機能
- `refactor`: リファクタリング
- `test`: テスト追加
- `docs`: ドキュメント
- `chore`: その他の変更
