# BUG-01: `wins/losses/win_rate` が間違った概念を測定している

## 現状のコード

**ファイル**: `bt/core/backtester.py:79-88`

```python
mtm = cash + inventory * candle.close
pnl_step = mtm - equity          # 「前の1分」との差額

if pnl_step > 0:
    wins += 1                    # MTMが増えた1分 = 勝ち（← 間違い）
    gross_profit += pnl_step
elif pnl_step < 0:
    losses += 1                  # MTMが減った1分 = 負け（← 間違い）
    gross_loss += abs(pnl_step)

equity = mtm
```

### 何を数えているか

| 変数       | 実際に数えていること                          |
| ---------- | --------------------------------------------- |
| `trades`   | buy約定回数 + sell約定回数（往復で2カウント） |
| `wins`     | 「前の1分よりMTMが増えたcandle数」            |
| `losses`   | 「前の1分よりMTMが減ったcandle数」            |
| `win_rate` | 上記の比率（トレード勝率とは別物）            |

---

## あるべき姿

グリッド取引での「1トレード」= **buy約定 → sell約定の往復1セット**

- buy約定時 → 「いくらで買ったか」を記録
- sell約定時 → 「さっきの買値より高く売れたか」を判定
  - 高く売れた → `wins +1`（勝ちトレード）
  - 安く売れた → `losses +1`（負けトレード）

```
例:
  buy  @ 90,000 → 記録
  sell @ 90,900 → 差額 +900 → wins +1

  buy  @ 90,000 → 記録
  sell @ 89,500 → 差額 -500 → losses +1
```

---

## 修正方針

### 変更するもの

**`bt/core/backtester.py`**

1. buy約定時に買値をスタックへ積む（`buy_prices: list[float]`）
2. sell約定時にスタックから買値を取り出し、損益を計算
3. 損益が正 → `wins +1` / `gross_profit += pnl`
4. 損益が負 → `losses +1` / `gross_loss += abs(pnl)`
5. `trades`はbuy/sellそれぞれでカウントせず、**完結した往復**でカウントする

### 変更しないもの

- `equity_curve`（MTM推移）の計算ロジックはそのまま
- `max_dd_pct`、`return_pct`、`profit_factor`の定義はそのまま
  - ※`profit_factor`は`gross_profit / gross_loss`なので、こちらも修正後の値になる

### 注意点

- グリッドは複数レベルあるため、どのbuyとどのsellを対応させるかが重要
- シンプルな実装として **FIFO（先入れ先出し）** を採用する
  - 一番古いbuyと、今回のsellを対応させる

---

## 気になる点

### 1. リセンター時の未決済ポジション

`buy_prices` スタックにbuy記録が残っている状態でリセンターが走ると、その在庫の扱いが不明。

```
buy @ 90,000 → スタックに積む
↓ 価格急落、リセンター発生
sell されないまま新しいグリッドへ
```

リセンター時にスタックをどう処理するかを明記する必要がある。

- ~~含み損のまま放置（新グリッドのsellで回収を狙う）~~
- **✅ 採用: 強制クローズ扱いとしてlossに計上する**（ユーザー決定）

**理由**: 放置するとリセンターのたびにスタックが積み上がり、
対応するsellが来ない買いが増え続ける。
win_rate / profit_factor が実態より楽観的になり、
バックテストの信頼性が損なわれる。

### 2. グリッドレベルとFIFOの乖離

**✅ 考慮なし（ユーザー決定）**

どのbuyとどのsellをペアリングしても合計P&Lは変わらないため、FIFOで割り切る。
win_rate の内訳は変わるが、`return_pct` や `profit_factor` の合計値には影響しない。

---

## ステータス

- [x] 現状把握
- [x] 修正実装
- [ ] 動作確認
