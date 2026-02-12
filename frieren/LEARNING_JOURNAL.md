# Frieren - Rust学習ジャーナル

> 他のClaudeCodeセッションへの引き継ぎドキュメント
> 最終更新: 2026-02-11（Day 2終了時点）

---

## 1. ユーザープロファイルと教え方のルール

### ユーザーについて

- **TypeScript熟練者**。spicyプロジェクト = 仮想通貨アービトラージBot（関数型アーキテクチャ、クラス不使用）
- **Neovim + wezterm** ユーザー。美しく最短なコード編集・ターミナルUIにこだわる
- Rust経験ゼロからスタート。「フリーレン式」で学習中

### 教え方のルール（厳守）

1. **実装は絶対にユーザーが書く。コード代行はNG**
   - 初回セッションでsubagentにコード生成を委託したらリジェクトされた
   - 「あのー実装はこっちがやりたい。意図がわかる？」と言われた
   - ユーザーは自分の手でRustと会話したい

2. **「少しずつ絆創して欲しい」**
   - 一歩ずつガイド。一気に全コードを渡さない
   - 次の一手だけ提示 → 書いてもらう → 次の一手
   - コンパイラエラーが出たら貼ってもらって一緒に読む

3. **フリーレン式 = 静かに、正確に、一つずつ**
   - 完成度より「Rustと会話できるか」を優先
   - 30分タイムボックス制で区切る
   - 「板同期？再接続？設計美？全部いらない。今日は触らない。」の精神

4. **説明は全てTS対比で行う**
   - 「TSで言うと○○」が最も効果的
   - 比較テーブル（Rust | TS | 説明）を多用する
   - 概念説明 → コード例 → 自分で書く → コンパイラと会話 → 質問 のサイクル

5. **ChatGPTにもレビューを出している**
   - 並行してChatGPTにコードレビューを依頼することがある
   - ChatGPTの指摘を「次のタスク」として持ち込んでくることがある

---

## 2. TS→Rust 概念マッピング（効果的だった全一覧）

### クレート = npmパッケージ

| Rust クレート       | TSでの対応物                    | 説明                              |
| ------------------- | ------------------------------- | --------------------------------- |
| `tokio`             | Node.jsイベントループ           | 非同期ランタイム                  |
| `tokio-tungstenite` | `ws` パッケージ                 | WebSocketクライアント             |
| `futures-util`      | Stream操作                      | `.next()` `.send()` を有効にする  |
| `serde_json`        | `JSON.parse` / `JSON.stringify` | JSONシリアライズ                  |
| `serde`             | -                               | 型変換の本体（derive マクロ提供） |
| `reqwest`           | `fetch`                         | HTTPクライアント                  |
| `url`               | `new URL()`                     | URLパース                         |

### 型・データ構造

| Rust               | TS                   | 説明                                 |
| ------------------ | -------------------- | ------------------------------------ |
| `HashMap`          | `Map`                | キーバリューストア                   |
| `Vec`              | `Array`              | 可変長配列                           |
| `Option<T>`        | `T \| undefined`     | あるかもしれないし、ないかもしれない |
| `Result<T, E>`     | `T \| Error`         | 成功か失敗か                         |
| `String`           | `string`             | ヒープ上の文字列                     |
| `&str`             | `string`（リテラル） | 文字列の参照                         |
| `u64`              | `number`（整数）     | 符号なし64bit整数                    |
| `f64`              | `number`（小数）     | 64bit浮動小数点                      |
| `Vec<[String; 2]>` | `[string, string][]` | 固定長配列の配列                     |

### エラーハンドリング

| Rust                  | TS                       | 使い所                                       |
| --------------------- | ------------------------ | -------------------------------------------- |
| `.unwrap()`           | `!` (non-null assertion) | 絶対失敗しない場所。失敗→panic（プロセス死） |
| `.expect("msg")`      | `.unwrap()` + メッセージ | 失敗→panicだがメッセージ付き                 |
| `.is_err()`           | `try-catch` で握る       | 失敗しても続けたい場所                       |
| `.unwrap_or(default)` | `?? default`             | デフォルト値付き                             |

### 構文

| Rust                   | TS                       | 説明                             |
| ---------------------- | ------------------------ | -------------------------------- |
| `match`                | `switch`                 | パターンマッチ                   |
| `if let Some(x) = val` | `if (val !== undefined)` | パターンマッチで変数束縛         |
| `let mut x`            | `let x`（再代入可能）    | 「この変数は変更する」宣言       |
| `format!("{}", x)`     | `` `${x}` ``             | テンプレートリテラル             |
| `println!("{}", x)`    | `console.log(x)`         | 人間用表示                       |
| `println!("{:?}", x)`  | `console.dir(x)`         | デバッグ表示                     |
| `18_000`               | `18000`                  | 可読性用アンダースコア（同じ値） |
| `.parse()`             | `Number()`               | 文字列→数値変換                  |

### 所有権・借用（Rustの最重要概念）

| Rust               | TS                        | 説明                                         |
| ------------------ | ------------------------- | -------------------------------------------- |
| `&x`（借用）       | 参照渡し（TSは暗黙）      | データを見るだけ、所有権は移動しない         |
| `.clone()`         | 暗黙のコピー（TSは自動）  | 明示的にデータをコピーして新しい所有権を作る |
| `for item in vec`  | `for (const item of arr)` | **所有権が移動する。以後vecは使えない**      |
| `for item in &vec` | `for (const item of arr)` | **借用。vecは引き続き使える**                |
| `.iter()`          | `.forEach()` の起点       | `&` と同じく借用。`.take(5)` 等チェーン可能  |
| `async move`       | `async () => {}`          | クロージャに所有権を移動する                 |

### 非同期・並行処理

| Rust                    | TS                        | 説明                                                  |
| ----------------------- | ------------------------- | ----------------------------------------------------- |
| `#[tokio::main]`        | トップレベル `await`      | 非同期mainを有効にするおまじない                      |
| `.await`                | `await`                   | 非同期処理の完了を待つ                                |
| `tokio::spawn`          | `setTimeout`/別タスク起動 | 所有権をmoveで渡す。死んでも誰も気づかない            |
| `tokio::select!`        | `Promise.race`            | 複数の非同期処理を同時に待つ。片方死→もう片方も止まる |
| `tokio::time::interval` | `setInterval`             | ドリフトしない定期実行                                |
| `tokio::time::sleep`    | `setTimeout`              | 一回だけ待つ。ループで使うとドリフトする              |

### serde（シリアライズ）

| Rust                                 | TS                   | 説明                                       |
| ------------------------------------ | -------------------- | ------------------------------------------ |
| `struct + #[derive(Deserialize)]`    | `interface`          | JSONの型定義 + 自動パース                  |
| `#[serde(rename_all = "camelCase")]` | -                    | JSONのcamelCase → Rustのsnake_case自動変換 |
| `serde_json::Value`                  | `any`                | 型なしJSON。`as_str()` 等で取り出す        |
| `serde_json::from_str::<T>(&s)`      | `JSON.parse(s) as T` | 型付きパース                               |

---

## 3. つまずきポイントと解決（時系列）

### Day 1（初回30分チャレンジ）

| #   | つまずき                                    | 解決した説明                                                                  |
| --- | ------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | `futures_utils` typo（sが余計）             | コンパイラが `futures_util` を提案。初めてのコンパイラとの会話                |
| 2   | `unwrap()` がなぜ必要かわからない           | 「`Url::parse` は失敗するかもしれない。TSは型に現れないがRustは型で強制する」 |
| 3   | `unwrap` vs `expect` vs `is_err` の使い分け | 「雑=unwrap、メッセージ付き=expect、ハンドリング=is_err」の3択                |
| 4   | `tokio::spawn` を受信ループの**後**に書いた | 「while(true)の後にコード書いてるのと同じ。到達しない」で即理解               |
| 5   | `interval` を loop 内で毎回生成             | 「setIntervalの中でsetIntervalを呼び直してる状態」で理解                      |
| 6   | `u64 * 0.8` がコンパイルエラー              | 「Rustは整数と小数を混ぜて計算できない」。`* 4 / 5` か `as f64` でキャスト    |
| 7   | `as_str()` がいつ必要かわからない           | 「`serde_json::Value` = `any`。取り出すときは必ず型を明示する」               |

### Day 2

| #   | つまずき                                        | 解決した説明                                                             |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| 8   | `for in` での `&` の必要性                      | 「forループが所有権を奪う。`&` を付けると借りるだけ」                    |
| 9   | 所有権がforループ後に返らないのか？             | 「返らない。消費された。ゴミコレクタではなく所有権移動。Rustでは明示的」 |
| 10  | `snapshot_resp.data.sequence` を2箇所で使えない | `.clone()` または `.parse()` で新しい値を作る                            |
| 11  | sequenceの番号が飛んでいる（1ずつ増えない）     | 「1メッセージに複数変更が入る。changes配列を全部処理すれば漏れない」     |
| 12  | changesが実際には処理されていない               | ユーザー自身が「sequence更新だけでchanges無視してる」と気づいた（鋭い）  |

---

## 4. 学習の進行パターン

```
Day 1 前半: 写経
  → コード提示 → そのまま書く → コンパイラと初対面

Day 1 後半: 改造
  → ping順序の問題を自分で理解
  → 変数抽出（token_endpoint）を自発的に実施
  → ping sent のデバッグログを大量に追加（楽しんでる兆候）

Day 2: 自走
  → intervalの配置ミスを構造的に理解
  → struct定義を自力で書く（Vec<[String; 3]> を自分で判断）
  → sequenceの抜け問題を自分で指摘
  → 「mutにして値を更新する方法はどう思う？」→ 設計判断を自ら問い始めた
```

**キーポイント**: ユーザーは写経→改造→自走のフェーズを自然に進んでいる。Day 3以降は「ガイド最小限 + 質問対応」モードでOK。

---

## 5. 現在のコード状態

### ファイル構成

```
frieren/
├── Cargo.toml
├── src/
│   └── main.rs  （約220行）
└── LEARNING_JOURNAL.md  （このファイル）
```

### main.rs の構造

```
structs定義:
  SnapshotResp / SnapshotData    ... スナップショットAPI用（完成）
  OrderBookState                 ... 板状態（定義のみ、未使用）
  L2Message / L2Data / L2Changes ... WS L2メッセージ用（完成）

main():
  1. トークン取得（POST /bullet-public）  ... serde_json::Value のまま
  2. スナップショット取得（GET /level2_20） ... SnapshotResp でパース
  3. asks/bids を HashMap に投入
  4. WS接続・L2 subscribe
  5. ping_task（async block）:
     - tokio::time::interval で定期ping
     - interval * 4/5 で余裕を持たせる
     - カウンタでping ID付与
  6. recv_task（async block）:
     - L2Message にパース
     - sequence_start と last_sequence を比較
     - newer → last_sequence を更新（※sequence_startで更新中、sequence_endが正しい）
  7. select! で ping_task / recv_task を束ねる
```

### 依存クレート（Cargo.toml）

```toml
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
tokio-tungstenite = { version = "0.21", features = ["native-tls"] }
futures-util = "0.3"
serde_json = "1"
serde = { version = "1", features = ["derive"] }
url = "2"
reqwest = { version = "0.12", features = ["json"] }
```

---

## 6. 残タスク（TODO）- 優先順位順

### すぐできる（Day 3前半）

1. **changesをHashMapに反映** — `size=="0"` で `remove`、それ以外は `insert`
2. **`last_sequence` を `sequence_end` で更新** — 現在は `sequence_start` で更新してしまっている（バグ）
3. **gap検出** — `last_sequence + 1 < sequence_start` の場合にログ出力

### 本丸（Day 3後半〜）

4. **WSバッファリング + スナップショット並列取得**
   - 現在: スナップショット取得 → WS接続 の順序（間のメッセージが抜ける）
   - あるべき姿: WS接続 → メッセージをバッファ(Vec) → 並列でスナップショット取得 → バッファ内の seq > snapshot.sequence だけ適用
   - `tokio::spawn` + `mpsc` チャネルが必要
   - ユーザーは「これは難しいと思っている」と言っている。丁寧にガイドが必要

### 将来（運用段階）

5. 再接続処理
6. pong監視（サーバーからのpong応答チェック）

---

## 7. 使用しているKuCoin API

| API                                                  | メソッド  | 用途                                                                            |
| ---------------------------------------------------- | --------- | ------------------------------------------------------------------------------- |
| `/api/v1/bullet-public`                              | POST      | WSトークン取得。レスポンスに `token`, `endpoint`, `pingInterval`, `pingTimeout` |
| `/api/v1/market/orderbook/level2_20?symbol=BTC-USDT` | GET       | 板スナップショット（20段）。`asks`, `bids`, `sequence`, `time`                  |
| WS `/market/level2:BTC-USDT`                         | subscribe | L2リアルタイム更新。`changes.asks/bids`, `sequenceStart/End`                    |

---

## 8. 関連するTSコード（spicyプロジェクト内）

Rust実装の参考にしているTS既存コード:

| ファイル                                 | 役割                                                          |
| ---------------------------------------- | ------------------------------------------------------------- |
| `src/apps/mm/mm-app.ts`                  | オーケストレーション（WS接続→バッファ→スナップショット→処理） |
| `src/clients/kucoin/snapshot/request.ts` | REST APIでスナップショット取得                                |
| `src/clients/kucoin/kucoin-ws.ts`        | WebSocket L2接続                                              |
| `src/domain/mm/l2/index.ts`              | 板データ管理（OrderBookState, handleL2Update）                |

---

## 9. セッション間で気をつけること

- **ユーザーに実装させる**。コードを渡すのではなく、次の一手だけ提示する
- **TS対比で説明する**。「TSだと○○」が最も伝わる
- **所有権の説明は慎重に**。まだ完全には理解していない。実際にコンパイルエラーに遭遇するたびに少しずつ教える方式が効果的
- **ChatGPTのレビューが来ることがある**。それを次のタスクとして扱う
- **30分タイムボックス**を意識する。ユーザーが区切ろうとしたら止めない
- **「フリーレン」の比喩**を理解しておく。静かな積み上げ、長期視点、確実な魔法
