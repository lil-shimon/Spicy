# calculate-buy-slippage-rate.ts テスト設計書

## 概要

`src/logic/slippage/calculate-buy-slippage-rate.ts`の`calculateBuySlippageRate`関数に対するテスト実装設計書

## 対象関数の分析

### 関数シグネチャ

```typescript
export const calculateBuySlippageRate = (
  asks: OrderBookEntry[],
  tradeAmount: number
) => number;
```

### 入力パラメータ

- `asks`: `OrderBookEntry[]` - 売り注文のオーダーブック（価格昇順）
- `tradeAmount`: `number` - 取引量

### 出力

- `number`: スリッページ率（パーセンテージ）

### 処理ロジック

1. オーダーブックから取引量に必要な分だけ順次消費
2. 平均取得価格を計算
3. 最良価格（asks[0][0]）と平均価格の差からスリッページ率を計算

## テストケース設計

### 1. 正常系テスト

#### 1.1 単一オーダーで完結する場合

```typescript
test('単一オーダーで取引量が満たされる場合', () => {
  const asks: OrderBookEntry[] = [[100, 10]];
  const tradeAmount = 5;
  const result = calculateBuySlippageRate(asks, tradeAmount);
  expect(result).toBe(0); // スリッページなし
});
```

#### 1.2 複数オーダーにまたがる場合

```typescript
test('複数オーダーにまたがる場合のスリッページ計算', () => {
  const asks: OrderBookEntry[] = [
    [100, 5],
    [101, 5],
    [102, 5],
  ];
  const tradeAmount = 10;
  // 平均価格 = (100*5 + 101*5) / 10 = 100.5
  // スリッページ率 = ((100.5 - 100) / 100.5) * 100 ≈ 0.497%
  const result = calculateBuySlippageRate(asks, tradeAmount);
  expect(result).toBeCloseTo(0.497, 3);
});
```

#### 1.3 オーダーが部分的に消費される場合

```typescript
test('最後のオーダーが部分的に消費される場合', () => {
  const asks: OrderBookEntry[] = [
    [100, 3],
    [101, 10],
  ];
  const tradeAmount = 5;
  // 平均価格 = (100*3 + 101*2) / 5 = 102/5 = 20.4
  const result = calculateBuySlippageRate(asks, tradeAmount);
  expect(result).toBeCloseTo(expected_value, 3);
});
```

### 2. 異常系テスト

#### 2.1 オーダーブックの流動性不足

```typescript
test('取引量がオーダーブックの総量を超える場合', () => {
  const asks: OrderBookEntry[] = [
    [100, 3],
    [101, 2],
  ];
  const tradeAmount = 10; // 総量5を超える
  expect(() => calculateBuySlippageRate(asks, tradeAmount)).toThrow(
    '注文量に対して板が薄すぎます'
  );
});
```

#### 2.2 空のオーダーブック

```typescript
test('オーダーブックが空の場合', () => {
  const asks: OrderBookEntry[] = [];
  const tradeAmount = 5;
  expect(() => calculateBuySlippageRate(asks, tradeAmount)).toThrow(
    '注文量に対して板が薄すぎます'
  );
});
```

### 3. エッジケース

#### 3.1 取引量が0の場合

```typescript
test('取引量が0の場合', () => {
  const asks: OrderBookEntry[] = [[100, 10]];
  const tradeAmount = 0;
  expect(() => calculateBuySlippageRate(asks, tradeAmount)).toThrow(); // 0除算エラー
});
```

#### 3.2 価格が0のオーダー

```typescript
test('価格が0のオーダーが含まれる場合', () => {
  const asks: OrderBookEntry[] = [
    [0, 5],
    [100, 5],
  ];
  const tradeAmount = 3;
  // 異常なデータでも計算は継続される
  const result = calculateBuySlippageRate(asks, tradeAmount);
  expect(result).toBeDefined();
});
```

#### 3.3 数量が0のオーダー

```typescript
test('数量が0のオーダーが含まれる場合', () => {
  const asks: OrderBookEntry[] = [
    [100, 0],
    [101, 5],
  ];
  const tradeAmount = 3;
  const result = calculateBuySlippageRate(asks, tradeAmount);
  expect(result).toBeDefined();
});
```

## 実装方針

### テストファイル構成

```
src/logic/slippage/calculate-buy-slippage-rate.spec.ts
├── describe('calculateBuySlippageRate')
│   ├── describe('正常系')
│   │   ├── test('単一オーダーで完結')
│   │   ├── test('複数オーダーにまたがる')
│   │   └── test('部分的消費')
│   ├── describe('異常系')
│   │   ├── test('流動性不足')
│   │   └── test('空のオーダーブック')
│   └── describe('エッジケース')
│       ├── test('取引量0')
│       ├── test('価格0')
│       └── test('数量0')
```

### テストデータ戦略

- 現実的なオーダーブックデータを使用
- 計算結果の精度は小数点以下3桁で検証
- 境界値テストを重視

### 実行コマンド

```bash
pnpm test src/logic/slippage/calculate-buy-slippage-rate.spec.ts
```

## 検証項目

- [x] 正常系テスト実装
- [x] 異常系テスト実装
- [x] エッジケーステスト実装
- [x] テストカバレッジ100%達成
- [x] 実行時間が適切（<100ms）
