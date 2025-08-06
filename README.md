# Spicy - 仮想通貨アービトラージ＆マーケットメイキングボット

TypeScriptで構築された高度な仮想通貨取引ボットです。複数の取引所間の価格差を利用したアービトラージ戦略と、先物市場でのマーケットメイキング戦略をサポートします。

## 機能

### アービトラージ機能

- 複数取引所（Bybit、MEXC、KuCoin）のリアルタイム価格監視
- オーダーブック深度分析によるスリッページ計算
- テイカー手数料を考慮した利益計算
- Discord Webhook通知システム
- 残高取得機能
- MEXC取引所での自動注文作成機能
- 取引ペアの活動状況をCSVでログ記録
- 継続的な価格監視（30秒間隔）

### マーケットメイキング機能（現物）- dirty-work

- MEXC現物市場でのマーケットメイキング
- スプレッドベースの取引戦略
- 両建て注文（買い・売り同時発注）
- 動的価格設定とティックサイズ調整
- 損益（P&L）とインベントリ追跡
- 注文タイムアウト管理（30秒）
- CSVでの取引データ記録

### マーケットメイキング機能（先物）- drama

- KuCoin先物市場でのマーケットメイキング
- WebSocketによるリアルタイム価格監視
- メイカー手数料（0.02%）を考慮した収益性判断
- 両側注文（買い・売り同時）の自動管理
- ポジション管理と注文タイムアウト機能

## 監視対象

### アービトラージ（現物）

- **取引ペア**: XO/USDT、SOL/USDT、PUMP/USDT
- **アクティブ取引所**: Bybit、MEXC、KuCoin
- **実装済み（無効）**: Binance
- **最小利益閾値**: 0.5%
- **テイカー手数料**:
  - Bybit: 0.1%
  - MEXC: 0.05%
  - KuCoin: 0.1%

### マーケットメイキング（先物）

- **対応取引所**: KuCoin Futures
- **メイカー手数料**: 0.02%
- **最小スプレッド**: 0.04%（往復手数料）

## セットアップ

### 前提条件

- Node.js (v20以上)
- pnpm パッケージマネージャー

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/lil-shimon/spicy.git
cd spicy

# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してDISCORD_WEBHOOK_URLを設定
```

### 環境変数

`.env`ファイルに以下を設定：

```env
# Discord通知（必須）
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
DISCORD_ORDER_WEBHOOK_URL=your_order_webhook_url_here  # 注文通知用（オプション）

# 取引所APIキー（取引実行機能を使う場合）
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
BYBIT_API_KEY=your_bybit_api_key
BYBIT_SECRET_KEY=your_bybit_secret_key
MEXC_API_KEY=your_mexc_api_key
MEXC_SECRET_KEY=your_mexc_secret_key
KUCOIN_API_KEY=your_kucoin_api_key
KUCOIN_SECRET=your_kucoin_secret
KUCOIN_PASSPHRASE=your_kucoin_passphrase

# 機能フラグ
FEATURE_FLAG_ENABLE_ORDER=false  # 自動取引を有効にする場合はtrue
```

## 使用方法

### ボットの実行

```bash
# アービトラージボットの開始
pnpm dev

# マーケットメイキング（現物）の開始
pnpm dirty-work

# マーケットメイキング（先物）の開始
pnpm drama

# デモモードの実行
pnpm demo

# APIサーバーの起動（開発用）
pnpm api

# PM2でボットを起動
pnpm start:server

# PM2でAPIサーバーを起動
pnpm start:api
```

### 開発

```bash
# TypeScriptのビルド
pnpm build

# ビルド済みファイルの実行
pnpm start

# テストの実行
pnpm test

# リンターの実行
pnpm lint

# コードフォーマット
pnpm format

# 単一テストファイルの実行
pnpm test path/to/test.spec.ts

# PM2ログの確認（ボット）
pnpm log:server

# PM2ログの確認（API）
pnpm log:api

# PM2再起動
pnpm restart
pnpm restart:api
```

## アーキテクチャ

```
src/
├── index.ts                          # アービトラージボットのエントリーポイント
├── server.ts                         # APIサーバーのエントリーポイント
├── bot.ts                            # アービトラージボットのメインロジック
├── dirty-work/                       # マーケットメイキング機能（現物）
│   ├── bot.ts                        # MM戦略のメインロジック
│   ├── services/                     # ビジネスロジックサービス（関数型）
│   │   ├── order-service.ts          # 注文管理
│   │   ├── inventory-service.ts      # 在庫管理
│   │   └── pnl-service.ts            # 損益計算
│   └── logics/                       # 取引ロジック
│       ├── get-prices.ts
│       └── status.ts
├── drama/                            # マーケットメイキング機能（先物）
│   ├── bot.ts                        # 先物MMのメインロジック
│   ├── market-maker-profit.ts        # 収益性判断
│   ├── position-manager.ts           # ポジション管理
│   ├── dual-order-manager.ts         # 両側注文管理
│   └── notification-manager.ts       # Discord通知
├── clients/                          # 取引所API クライアント
│   ├── binance/                      # Binance統合（無効）
│   ├── bybit/                        # Bybit統合
│   │   ├── bybit-client.ts
│   │   ├── fetch-orderbook.ts
│   │   └── fetch-balance.ts
│   ├── kucoin/                       # KuCoin統合
│   │   ├── kucoin-client.ts          # 現物・先物クライアント
│   │   ├── kucoin-ws.ts              # WebSocket（現物・先物対応）
│   │   └── fetch-kucoin.ts
│   ├── mexc/                         # MEXC統合
│   │   ├── mexc-client.ts
│   │   ├── fetch-orderbook.ts
│   │   ├── fetch-balance.ts
│   │   └── create-order.ts
│   └── discord/                      # Discord通知
│       └── post-message.ts
├── constants/                        # 設定定数
│   └── constant.ts                   # 定数（TAKER_FEES、MAKER_FEES_FUTURES等）
├── core/                             # コア計算ロジック
│   ├── profit-rate/                  # 利益率計算
│   ├── spread/                       # スプレッド計算
│   ├── taker-fee/                    # テイカー手数料計算
│   └── maker-fee/                    # メイカー手数料計算
├── logic/                            # ビジネスロジック
│   ├── check-arbitrage-opportunities/
│   ├── fetch-price/
│   ├── fetch-price-by-pair/
│   └── slippage/
└── utils/                            # ユーティリティ関数
    ├── pair-to-symbol/
    └── update-count/
```

## 動作フロー

1. **価格監視**: 30秒ごとに指定された取引ペアの価格を各取引所から取得
2. **オーダーブック分析**: 買い板・売り板の深度を分析してスリッページを計算
3. **利益計算**:
   - 買い側・売り側の取引手数料を考慮
   - スリッページを加味した実際の取引価格を算出
   - 利益率が閾値（0.5%）を超えるかチェック
4. **機会通知**: 利益機会が見つかったらDiscordに通知
5. **取引実行**（オプション）: MEXCでの自動注文作成が可能
6. **ログ記録**: 取引ペアの活動状況をCSVファイルに記録

## 技術スタック

- **言語**: TypeScript
- **ランタイム**: Node.js (v20+)
- **取引所API**: ccxt
- **WebSocket**: ws
- **テスト**: Vitest
- **リンター**: ESLint
- **フォーマッター**: Prettier
- **プロセス管理**: PM2
- **パッケージマネージャー**: pnpm（package.jsonで強制）
- **アーキテクチャ**: 関数型プログラミング（クロージャーパターン）

## 取引実行機能

このボットはMEXC取引所での自動注文作成機能を持っています。実際の取引を行う場合は：

1. 取引所のAPIキーを適切に設定
2. 十分な残高があることを確認
3. リスク管理設定を慎重に行う

## 免責事項

**重要**: このソフトウェアは教育目的および研究目的で提供されています。実際の取引に使用する場合は：

- 仮想通貨取引には高いリスクが伴います
- 市場の急激な変動により大きな損失が発生する可能性があります
- 作者は投資による損失について一切の責任を負いません
- 必ず少額でテストを行い、動作を十分理解してから使用してください

## 開発ガイドライン

### ブランチ戦略

- `feat/spicy-{issue番号}-{機能名}` - 新機能追加
- `refactor/spicy-{issue番号}-{内容}` - リファクタリング
- `docs/{内容}` - ドキュメント更新

### コーディング規約

- **関数型プログラミング**: クラスは使用せず、クロージャーパターンを使用
- **エクスポート形式**: `createXxxService`、`createXxxManager`の形式
- **非同期処理**: async/await を使用
- **エラーハンドリング**: try-catch でラップ

詳細は[CLAUDE.md](./CLAUDE.md)を参照してください。

## ライセンス

MIT License

## 本番環境での実行

### PM2でのボット管理

```bash
# ボットの起動
pm2 start dist/index.js --name spicy

# APIサーバーの起動
pm2 start dist/src/server.js --name spicy-api

# ログの確認
pm2 logs spicy      # ボットのログ
pm2 logs spicy-api  # APIのログ

# プロセスの状態確認
pm2 status

# 再起動
pm2 restart spicy
pm2 restart spicy-api
```

## APIサーバー機能

このボットにはAPIサーバー機能が含まれており、以下のエンドポイントを提供します：

- `/api/logs` - ボットのログを取得
- その他のエンドポイントは`src/server.ts`を参照

開発環境では`pnpm api`、本番環境では`pnpm start:api`で起動できます。
