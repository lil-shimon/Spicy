import path from 'path';
import fs from 'fs';

export const writeCountToCsv = async (pairCount: Record<string, number>) => {
  const date = new Date();
  const timestamp = date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const filePath = path.resolve(process.cwd(), 'pair-counts.csv');
  const fileExists = fs.existsSync(filePath);

  const header = 'timestamp,pair,count\n';
  const pairCountArray: [string, number][] = Object.entries(pairCount);
  const rows = pairCountArray
    .map(([pair, count]) => `${timestamp},${pair},${count}`)
    .join('\n');

  const csvData = (fileExists ? '' : header) + rows + '\n';

  fs.appendFileSync(filePath, csvData, 'utf8');
};
