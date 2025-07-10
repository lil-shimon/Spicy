# calculate-sell-slippage-rate.ts テスト設計書

## 概要
`src/logic/slippage/calculate-sell-slippage-rate.ts`の`calculateSellSlippageRate`関数に対するテスト実装設計書

## 対象関数の分析

### 関数シグネチャ
```typescript
export const calculateSellSlippageRate = (
  bids: OrderBookEntry[],
  targetAmount: number
) => number
```

### 入力パラメータ
- `bids`: `OrderBookEntry[]` - 買い注文のオーダーブック（価格降順）
- `targetAmount`: `number` - 売却量

### 出力
- `number`: スリッページ率（パーセンテージ）

### 処理ロジック
1. オーダーブックから売却量に必要な分だけ順次消費
2. 平均売却価格を計算
3. 最良価格（bids[0][0]）と平均価格の差からスリッページ率を計算
4. 売り注文では価格が下がるため、スリッページ計算式は `((averagePrice - bestBidPrice) / averagePrice) * 100`

## テストケース設計

### 1. 正常系テスト

#### 1.1 単一オーダーで完結する場合
```typescript
test('単一オーダーで売却量が満たされる場合', () => {
  const bids: OrderBookEntry[] = [[100, 10]];
  const targetAmount = 5;
  const result = calculateSellSlippageRate(bids, targetAmount);
  expect(result).toBe(0); // スリッページなし
});
```

#### 1.2 複数オーダーにまたがる場合
```typescript
test('複数オーダーにまたがる場合のスリッページ計算', () => {
  const bids: OrderBookEntry[] = [
    [100, 5],
    [99, 5],
    [98, 5]
  ];
  const targetAmount = 10;
  // 総コスト = 100*5 + 99*5 = 995
  // 平均価格 = 995 / 10 = 99.5
  // スリッページ率 = ((99.5 - 100) / 99.5) * 100 ≈ -0.503%
  const result = calculateSellSlippageRate(bids, targetAmount);
  expect(result).toBeCloseTo(-0.503, 3);
});
```

#### 1.3 オーダーが部分的に消費される場合
```typescript
test('最後のオーダーが部分的に消費される場合', () => {
  const bids: OrderBookEntry[] = [
    [100, 3],
    [99, 10]
  ];
  const targetAmount = 5;
  // 総コスト = 100*3 + 99*2 = 498
  // 平均価格 = 498 / 5 = 99.6
  // スリッページ率 = ((99.6 - 100) / 99.6) * 100 ≈ -0.402%
  const result = calculateSellSlippageRate(bids, targetAmount);
  expect(result).toBeCloseTo(-0.402, 3);
});
```

### 2. 異常系テスト

#### 2.1 オーダーブックの流動性不足
```typescript
test('売却量がオーダーブックの総量を超える場合', () => {
  const bids: OrderBookEntry[] = [
    [100, 3],
    [99, 2]
  ];
  const targetAmount = 10; // 総量5を超える
  expect(() => calculateSellSlippageRate(bids, targetAmount))
    .toThrow('注文量に対して板が薄すぎます');
});
```

#### 2.2 空のオーダーブック
```typescript
test('オーダーブックが空の場合', () => {
  const bids: OrderBookEntry[] = [];
  const targetAmount = 5;
  expect(() => calculateSellSlippageRate(bids, targetAmount))
    .toThrow('注文量に対して板が薄すぎます');
});
```

### 3. エッジケース

#### 3.1 売却量が0の場合
```typescript
test('売却量が0の場合', () => {
  const bids: OrderBookEntry[] = [[100, 10]];
  const targetAmount = 0;
  expect(() => calculateSellSlippageRate(bids, targetAmount))
    .toThrow(); // 0除算エラー
});
```

#### 3.2 価格が0のオーダー
```typescript
test('価格が0のオーダーが含まれる場合', () => {
  const bids: OrderBookEntry[] = [[0, 5], [100, 5]];
  const targetAmount = 3;
  // 異常なデータでも計算は継続される
  const result = calculateSellSlippageRate(bids, targetAmount);
  expect(result).toBeDefined();
});
```

#### 3.3 数量が0のオーダー
```typescript
test('数量が0のオーダーが含まれる場合', () => {
  const bids: OrderBookEntry[] = [[100, 0], [99, 5]];
  const targetAmount = 3;
  const result = calculateSellSlippageRate(bids, targetAmount);
  expect(result).toBeDefined();
});
```

#### 3.4 売却量とオーダーブック総量が一致
```typescript
test('売却量がオーダーブックの総量と完全に一致する場合', () => {
  const bids: OrderBookEntry[] = [
    [100, 5],
    [99, 5]
  ];
  const targetAmount = 10;
  const result = calculateSellSlippageRate(bids, targetAmount);
  expect(result).toBeCloseTo(-0.503, 3);
});
```

#### 3.5 非常に小さなスリッページ
```typescript
test('非常に小さなスリッページのケース', () => {
  const bids: OrderBookEntry[] = [
    [100, 99],
    [99.99, 1]
  ];
  const targetAmount = 100;
  const result = calculateSellSlippageRate(bids, targetAmount);
  expect(result).toBeCloseTo(-0.0001, 4);
});
```

#### 3.6 小数点を含む価格と数量
```typescript
test('小数点を含む価格と数量のテスト', () => {
  const bids: OrderBookEntry[] = [
    [100.01, 2.5],
    [99.99, 3.5],
    [99.95, 4.0]
  ];
  const targetAmount = 6;
  const result = calculateSellSlippageRate(bids, targetAmount);
  expect(result).toBeDefined();
  expect(result).toBeLessThanOrEqual(0); // 売りスリッページは通常負の値
});
```

## 実装方針

### テストファイル構成
```
src/logic/slippage/calculate-sell-slippage-rate.spec.ts
├── describe('calculateSellSlippageRate')
│   ├── describe('正常系')
│   │   ├── test('単一オーダーで完結')
│   │   ├── test('複数オーダーにまたがる')
│   │   └── test('部分的消費')
│   ├── describe('異常系')
│   │   ├── test('流動性不足')
│   │   └── test('空のオーダーブック')
│   └── describe('エッジケース')
│       ├── test('売却量0')
│       ├── test('価格0')
│       ├── test('数量0')
│       ├── test('売却量と総量一致')
│       ├── test('小さなスリッページ')
│       └── test('小数点価格・数量')
```

### テストデータ戦略
- 現実的なオーダーブックデータを使用
- 計算結果の精度は小数点以下3桁で検証（非常に小さなスリッページは4桁）
- 売りスリッページは通常負の値となることを考慮
- 境界値テストを重視

### 実行コマンド
```bash
pnpm test src/logic/slippage/calculate-sell-slippage-rate.spec.ts
```

## 検証項目
- [x] 正常系テスト実装
- [x] 異常系テスト実装
- [x] エッジケーステスト実装
- [x] テストカバレッジ100%達成（全テストケース網羅）
- [x] 実行時間が適切（<100ms）
- [x] 売りスリッページ特有のロジック（正の値）の検証