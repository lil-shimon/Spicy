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

- **取引ペア**: XO/USDT、HNT/USDT、SOL/USDT
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

```
DISCORD_WEBHOOK_URL=your_discord_webhook_url_here
```

## 使用方法

### ボットの実行

```bash
# メインボットの開始
pnpm dev

# デモモードの実行
pnpm demo
```

### 開発

```bash
# テストの実行
pnpm test

# リンターの実行
pnpm lint

# 単一テストファイルの実行
pnpm test path/to/test.spec.ts
```

## アーキテクチャ

```
src/
├── index.ts                          # エントリーポイント
├── bot.ts                            # メインボットオーケストレーション
├── clients/                          # 取引所API クライアント
│   ├── binance/                      # Binance統合（無効）
│   ├── bybit/                        # Bybit統合
│   │   ├── fetch-orderbook.ts
│   │   └── fetch-balance.ts
│   ├── kucoin/                       # KuCoin統合（無効）
│   ├── mexc/                         # MEXC統合
│   │   ├── fetch-orderbook.ts
│   │   ├── fetch-balance.ts
│   │   └── create-order.ts
│   └── discord/                      # Discord通知
├── constants/                        # 設定定数
│   ├── exchanges.ts                  # アクティブ取引所設定
│   ├── exchange-fees.ts              # 取引手数料設定
│   ├── trading-pairs.ts              # 監視ペア設定
│   └── arbitrage-config.ts           # アービトラージ閾値
├── core/                             # コア計算ロジック
│   ├── profit-rate/                  # 利益率計算
│   ├── spread/                       # スプレッド計算
│   └── taker-fee/                    # 手数料計算
├── logic/                            # ビジネスロジック
│   ├── check-arbitrage-opportunities/  # 利益機会フィルタリング
│   ├── fetch-price/                  # 価格取得オーケストレーション
│   ├── fetch-price-by-pair/          # ペア別価格取得
│   └── slippage/                     # スリッページ計算
│       ├── buy-slippage.ts
│       └── sell-slippage.ts
└── utils/                            # ユーティリティ関数
    ├── pair-to-symbol/               # ペアフォーマット変換
    ├── update-count/                 # カウント追跡
    └── write-count-to-csv/           # CSVログ出力
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

## dev
ssh 
```
ssh -i ~/.ssh/spicy.pem bitnami@13.114.216.83
```

server
```
pm2 start dist/index.js --name spicy
```

log
```
pm2 logs spicy
```