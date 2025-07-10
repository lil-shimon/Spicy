# Spicy - 仮想通貨アービトラージボット

TypeScriptで構築された仮想通貨アービトラージボットです。複数の取引所間の価格差を監視し、収益性の高い取引機会を特定してDiscord通知を送信します。

## 機能

- 複数取引所（Bybit、MEXC）の価格監視
- リアルタイムアービトラージ機会の検出
- テイカー手数料を考慮した利益計算
- Discord Webhook通知システム
- 継続的な価格監視（30秒間隔）

## 監視対象

- **取引ペア**: HNT/USDT、XO/USDT
- **取引所**: Bybit、MEXC
- **最小利益閾値**: 0.1%

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
├── index.ts              # エントリーポイント
├── bot.ts                # メインボットロジック
├── clients/              # 取引所API クライアント
│   ├── binance.ts
│   ├── bybit.ts
│   ├── kucoin.ts
│   ├── mexc.ts
│   └── discord.ts
├── constants/            # 設定定数
│   ├── exchanges.ts
│   ├── exchangeFees.ts
│   └── tradingPairs.ts
├── core/                 # コア計算ロジック
│   ├── calculateProfitRate.ts
│   ├── calculateSpread.ts
│   └── calculateTakerFees.ts
├── logic/                # ビジネスロジック
│   ├── checkArbitrage.ts
│   ├── fetchPrice.ts
│   └── slippage/          # スリッページ計算
└── utils/                # ユーティリティ関数
```

## 技術スタック

- **言語**: TypeScript
- **ランタイム**: Node.js
- **取引所API**: ccxt
- **テスト**: Vitest
- **リンター**: ESLint
- **パッケージマネージャー**: pnpm

## 免責事項

このソフトウェアは教育目的で提供されています。実際の取引には十分な注意を払い、自己責任で使用してください。作者は投資による損失について一切の責任を負いません。

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