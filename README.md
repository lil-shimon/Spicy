# Spicy - 仮想通貨アービトラージボット

TypeScriptで構築された高度な仮想通貨アービトラージボットです。複数の取引所間の価格差を監視し、収益性の高い取引機会を特定、通知、そして実際の取引実行も可能です。

## 機能

- 複数取引所（Bybit、MEXC）のリアルタイム価格監視
- オーダーブック深度分析によるスリッページ計算
- テイカー手数料を考慮した利益計算
- Discord Webhook通知システム
- 残高取得機能
- MEXC取引所での自動注文作成機能
- 取引ペアの活動状況をCSVでログ記録
- 継続的な価格監視（30秒間隔）

## 監視対象

- **取引ペア**: XO/USDT、SOL/USDT、PUMP/USDT、ZRO/USDT、TNSR/USDT、FET/USDT、PYTH/USDT
- **アクティブ取引所**: Bybit、MEXC
- **実装済み（無効）**: Binance、KuCoin
- **最小利益閾値**: 0.5%
- **取引手数料**:
  - Bybit: 0.1%
  - MEXC: 0.05%

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

# 取引所APIキー（取引実行機能を使う場合）
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
BYBIT_API_KEY=your_bybit_api_key
BYBIT_SECRET_KEY=your_bybit_secret_key
MEXC_API_KEY=your_mexc_api_key
MEXC_SECRET_KEY=your_mexc_secret_key

# 機能フラグ
FEATURE_FLAG_ENABLE_ORDER=false  # 自動取引を有効にする場合はtrue
```

## 使用方法

### ボットの実行

```bash
# メインボットの開始
pnpm dev

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
├── index.ts                          # ボットのエントリーポイント
├── server.ts                         # APIサーバーのエントリーポイント
├── bot.ts                            # メインボットオーケストレーション
├── clients/                          # 取引所API クライアント
│   ├── binance/                      # Binance統合（無効）
│   │   └── binance-client.ts
│   ├── bybit/                        # Bybit統合
│   │   ├── bybit-client.ts
│   │   ├── fetch-orderbook.ts
│   │   └── fetch-balance.ts
│   ├── kucoin/                       # KuCoin統合（無効）
│   │   └── kucoin-client.ts
│   ├── mexc/                         # MEXC統合
│   │   ├── mexc-client.ts
│   │   ├── fetch-orderbook.ts
│   │   ├── fetch-balance.ts
│   │   └── create-order.ts
│   └── discord/                      # Discord通知
│       └── post-message.ts
├── constants/                        # 設定定数
│   └── constant.ts                   # すべての定数（取引所、手数料、ペアなど）
├── core/                             # コア計算ロジック
│   ├── profit-rate/                  # 利益率計算
│   ├── spread/                       # スプレッド計算
│   └── taker-fee/                    # 手数料計算
├── logic/                            # ビジネスロジック
│   ├── check-arbitrage-opportunities/  # 利益機会フィルタリング
│   │   └── check-arbitrage-opportunities.ts
│   ├── fetch-price/                  # 価格取得オーケストレーション
│   │   └── fetch-price.ts
│   ├── fetch-price-by-pair/          # ペア別価格取得
│   │   └── fetch-price-by-pair.ts
│   └── slippage/                     # スリッページ計算
│       ├── buy-slippage.ts
│       └── sell-slippage.ts
└── utils/                            # ユーティリティ関数
    ├── pair-to-symbol/               # ペアフォーマット変換
    └── update-count/                 # カウント追跡とCSVログ出力
        ├── update-count.ts
        └── update-count-v2.ts
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
- **ランタイム**: Node.js
- **取引所API**: ccxt
- **テスト**: Vitest
- **リンター**: ESLint
- **パッケージマネージャー**: pnpm（package.jsonで強制）

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

## ライセンス

MIT License

## 本番環境での実行

### SSHアクセス

```bash
ssh -i ~/.ssh/spicy.pem bitnami@13.114.216.83
```

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
