# Heiter - MEXC ウォレット残高モニター

MEXCの全保有資産をUSDT換算で取得し、前回実行時との差分をDiscordに通知するCLIツール。
cronで定期実行する運用を想定。

## 機能

- MEXCアカウントの全保有資産をUSDT換算で一覧表示
- 前回実行時のスナップショットと比較し、差分（金額・パーセント）を算出
- 整形済みの残高レポートをDiscord Webhookに通知
- 初回実行時は差分なしの初期レポートを送信

## 必要な環境変数

| 変数名                | 必須 | 説明                                                      |
| --------------------- | ---- | --------------------------------------------------------- |
| `MEXC_API_KEY`        | Yes  | MEXC APIキー                                              |
| `MEXC_SECRET`         | Yes  | MEXC APIシークレット                                      |
| `DISCORD_WEBHOOK_URL` | Yes  | Discord Webhook URL                                       |
| `HEITER_DATA_FILE`    | No   | スナップショット保存先（デフォルト: `data/balance.json`） |

親プロジェクトの `.env` に定義し、`source` して使う想定。

## ビルド & 実行

```bash
cd heiter
go build -o heiter
source ../.env
./heiter
```

## cron設定例

```bash
# 毎日9:00 JST
0 9 * * * cd /path/to/spicy/heiter && source ../.env && ./heiter
```

## ファイル構成

```
heiter/
  main.go       # エントリーポイント。全モジュールを呼び出すオーケストレーション
  config.go     # 環境変数の読み込みとバリデーション
  mexc.go       # MEXC REST API統合（残高取得・ティッカー価格取得・HMAC-SHA256署名）
  storage.go    # JSONファイルへのスナップショット永続化・読み込み
  diff.go       # 前回と今回のスナップショット差分計算（純粋関数）
  format.go     # Discord向けMarkdownメッセージ整形
  discord.go    # Discord Webhook POST送信
  data/         # スナップショットJSON保存ディレクトリ（.gitignore対象）
  go.mod        # Goモジュール定義（外部依存なし、標準ライブラリのみ）
```
