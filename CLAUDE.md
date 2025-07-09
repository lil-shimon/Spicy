# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) への指針を提供します。

## プロジェクト概要
これはTypeScriptで構築された仮想通貨アービトラージボットで、取引所間（Bybit、MEXC）の価格差を監視し、収益性の高い取引機会を特定します。ボットは継続的に実行され、機会が見つかるとDiscord通知を送信します。

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
- 最小利益閾値は0.1%（定数で設定可能）
- 利益計算は`src/core/calculateProfitRate.ts`にあります
- スリッページ計算は`src/logic/slippage/`にあります

### 理解すべき重要なファイル
- **src/constants/tradingPairs.ts** - 監視する取引ペアを定義
- **src/constants/exchanges.ts** - アクティブな取引所をリスト
- **src/bot.ts:runArbitrageCheck()** - メインオーケストレーションロジック
- **src/clients/discord.ts** - 通知システム（.envにwebhook URLが必要）

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
- ボットはシンプルなインターバルベースのポーリングアプローチを使用