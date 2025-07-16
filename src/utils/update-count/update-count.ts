import fs from 'fs';
import path from 'path';
import { Pair } from '../../constants';
import { FetchPriceResult } from '../../logic/fetch-price/fetch-price';

const filePath = path.resolve(process.cwd(), 'pair-counts.json');

type ArbCount = Record<string, number>;

const loadCounts = () => {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('JSONのパースに失敗しました:', error);
    return {};
  }
};

const saveCounts = (counts: ArbCount) => {
  fs.writeFileSync(filePath, JSON.stringify(counts, null, 2), 'utf8');
};

export const updateCount = (pair: Pair) => {
  const counts = loadCounts();
  counts[pair] = (counts[pair] || 0) + 1;
  saveCounts(counts);
  console.log(`ペア ${pair} のカウントを更新しました: ${counts[pair]}`);
};

const dirName = path.resolve(process.cwd(), 'data');
const filePathV2 = path.join(dirName, 'arb-logs.jsonl');

/**
 * アビトラ機会をJSONに保存
 * @param {FetchPriceResult} data
 */
export const updateCountV2 = (data: FetchPriceResult) => {
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }

  const now = new Date();
  // 日本標準時のオフセットを追加
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  // ISO 8601 形式に変換
  // new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
  // ↑は人間が読みやすい形式だけど、機械的に処理する場合は ISO 8601 形式が便利
  const jstIso = jst.toISOString().replace('Z', '+09:00');

  const entry = {
    pair: data.pair,
    buy: data.from,
    sell: data.to,
    profit: data.profit,
    timestamp: jstIso,
  };

  fs.appendFileSync(filePathV2, JSON.stringify(entry) + '\n', 'utf8');
  console.log(`ペア ${data.pair}のログを追記しました`);
};
