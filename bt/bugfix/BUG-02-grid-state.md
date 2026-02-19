# BUG-02: グリッド状態管理がなく、同一レベルを何度でも約定できる

## 現状のコード

**ファイル**: `bt/core/backtester.py:72-88`

```python
for p in buys:
    px = round_price(p, constraints.price_tick)
    if candle.low <= px and should_fill(cost, rng):
        fill_px = apply_slippage(px, 'buy', cost)
        fee = fill_px * qty * fee_rate(cost)
        cash -= fill_px * qty + fee
        inventory += qty
        buy_stack.append(fill_px)   # ← 約定後もbuysリストに残り続ける

for p in sells:
    px = round_price(p, constraints.price_tick)
    if candle.high >= px and inventory >= qty and should_fill(cost, rng):
        fill_px = apply_slippage(px, 'sell', cost)
        fee = fill_px * qty * fee_rate(cost)
        proceeds = fill_px * qty - fee
        cash += proceeds
        inventory -= qty            # ← 約定後もsellsリストに残り続ける
        trades += 1
```

### 何が起きているか

| 問題                                                          | 具体的な影響                                                                        |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `buys` / `sells` がリスト固定のまま全candle を走査する        | 価格が同じレベル付近に留まると、**1つのレベルが毎candle 約定する**                  |
| 約定後にそのレベルをリストから除去しない                      | 同一買いレベルが何度でもトリガーされ、`inventory` と `buy_stack` が無限に積み上がる |
| 結果として `trades` / PnL / `return_pct` が大幅に水増しされる | バックテスト結果が実取引と乖離し、戦略の評価として機能しない                        |

---

## あるべき姿

グリッド取引の本来の動作（1サイクル）：

```
buy @ level[i] 約定
  → level[i] を active_buys から除去
  → 対応する sell レベル (level[i] + grid_spacing) を active_sells に追加

sell @ level[j] 約定
  → level[j] を active_sells から除去
  → 対応する buy レベル (level[j] - grid_spacing) を active_buys に追加
```

これにより、各レベルは「約定 → 反対側へ移動 → 再び約定待ち」というサイクルを形成する。

---

## 修正方針

### 変更するもの（`bt/core/backtester.py`）

#### 1. `active_buys` / `active_sells` の導入

```python
buys, sells = build_grid_levels(center_price, params)
active_buys: set[float] = set(buys)
active_sells: set[float] = set(sells)
```

初期値は `build_grid_levels` の結果をそのまま使う。`list` ではなく `set` にすることで O(1) での除去・追加を実現する。

#### 2. buy 約定時の状態更新

```python
for p in list(active_buys):           # イテレート中に変更するためコピー
    px = round_price(p, constraints.price_tick)
    if candle.low <= px and should_fill(cost, rng):
        fill_px = apply_slippage(px, 'buy', cost)
        fee = fill_px * qty * fee_rate(cost)
        cash -= fill_px * qty + fee
        inventory += qty
        buy_stack.append(fill_px)
        active_buys.discard(p)                   # ← 除去
        active_sells.add(p + grid_spacing)        # ← 対応 sell を追加
```

#### 3. sell 約定時の状態更新

```python
for p in list(active_sells):          # イテレート中に変更するためコピー
    px = round_price(p, constraints.price_tick)
    if candle.high >= px and inventory >= qty and should_fill(cost, rng):
        fill_px = apply_slippage(px, 'sell', cost)
        fee = fill_px * qty * fee_rate(cost)
        proceeds = fill_px * qty - fee
        cash += proceeds
        inventory -= qty
        trades += 1
        active_sells.discard(p)                  # ← 除去
        active_buys.add(p - grid_spacing)         # ← 対応 buy を追加
        # ... buy_stack による wins/losses 計算は既存ロジックを踏襲
```

#### 4. `grid_spacing` の計算

`bt/core/grid_strategy.py` の `build_grid_levels` によると：

```python
step = (center_price * params.range_pct) / max(params.levels_per_side, 1)
buys  = [center_price - step * i for i in range(1, params.levels_per_side + 1)]
sells = [center_price + step * i for i in range(1, params.levels_per_side + 1)]
```

隣接レベル間の間隔は一定の `step` であるため：

```python
grid_spacing = (center_price * params.range_pct) / max(params.levels_per_side, 1)
```

buy @ `center - step*i` が約定した場合、追加する sell は `center - step*i + step = center - step*(i-1)` となり、1段上のグリッドレベルに対応する。

#### 5. リセンター時の処理

```python
if should_recenter(candle, center_price, params):
    # 残 inventory を close 価格で強制クローズ（手数料考慮）
    for buy_px in buy_stack:
        close_val = candle.close * qty
        buy_cost = buy_px * qty
        fee = candle.close * qty * fee_rate(cost)
        trade_pnl = close_val - buy_cost - fee   # close 時の手数料も差し引く
        if trade_pnl > 0:
            wins += 1
            gross_profit += trade_pnl
        else:
            losses += 1
            gross_loss += abs(trade_pnl)
    cash += candle.close * inventory             # inventory を cash に換算して計上
    inventory = 0.0
    buy_stack.clear()

    # グリッドリセット
    active_buys.clear()
    active_sells.clear()
    center_price = candle.close
    buys, sells = build_grid_levels(center_price, params)
    active_buys = set(buys)
    active_sells = set(sells)
    grid_spacing = (center_price * params.range_pct) / max(params.levels_per_side, 1)
```

### 変更しないもの

- `equity_curve` の計算ロジック（`mtm = cash + inventory * candle.close`）
- `wins` / `losses` / `win_rate` の計算（BUG-01 で別途対応済み）
- `return_pct`、`max_dd_pct`、`profit_factor` の定義

---

## 設計判断メモ

### リセンター時: 強制クローズ採用

- **採用: 残 inventory を close 価格で売却し cash に計上**
- 理由: 放置するとリセンターのたびに対応する sell のない買いが積み上がる。
  BUG-01 の `buy_stack` 問題と同様に、バックテストの信頼性が損なわれる。
  強制クローズにより、リセンター = 「その時点でのポジション精算 + 新グリッド開始」と明確に定義できる。

### `set` vs `list`

- `list` は `remove()` が O(n)。グリッドレベル数が増えるとボトルネックになる。
- `set` で O(1) の `discard()` / `add()` を使うことでパフォーマンスを確保する。
- ただし `set` は順序を保証しないため、ソートが必要な場面では `sorted(active_buys)` を使う。

### buy 約定後に追加する sell レベルがグリッド範囲外になる場合

- `active_sells.add(p + grid_spacing)` が上限グリッドを超えることがある。
- 現状は許容する（範囲外の sell は価格が届かず約定しないため実害はない）。
- 将来的にクランプ処理を追加するかは別途検討。

---

## ステータス

- [x] 現状把握
- [ ] 修正実装
- [ ] 動作確認
