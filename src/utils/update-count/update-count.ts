import fs from 'fs';
import path from 'path';
import { Pair } from '../../constants';

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
