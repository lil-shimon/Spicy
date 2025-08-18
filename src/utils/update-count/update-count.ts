import fs from 'fs';
import path from 'path';
import { FetchPriceResult } from '../../logic/fetch-price/fetch-price';

const dirName = path.resolve(process.cwd(), 'data');
const filePath = path.join(dirName, 'arb-logs.jsonl');

/**
 * アビトラ機会をJSONに保存
 * @param {FetchPriceResult} data
 */
export const updateCount = (data: FetchPriceResult) => {
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
    profitRate: data.profit,
    timestamp: jstIso,
  };

  fs.appendFileSync(filePath, JSON.stringify(entry) + '\n', 'utf8');
  console.log(`ペア ${data.pair}のログを追記しました`);
};
