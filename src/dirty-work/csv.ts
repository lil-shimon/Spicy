import fs from 'fs';

const dirName = 'pnl';
const filePath = `${dirName}/pnl.csv`;

type PnlCSV = {
  realizedPnL: number;
  invPump: number;
  invUsdt: number;
  price: number;
  side: 'buy' | 'sell';
};

export const writePnlCSV = (f: PnlCSV) => {
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }

  const jstIso = getJstIso();

  const row = `${jstIso},${f.realizedPnL},${f.side},${f.invPump},${f.invUsdt},${f.price}`;
  fs.appendFileSync(filePath, row + '\n');
};

const getJstIso = () => {
  const now = new Date();
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  const jstIso = jst.toISOString().replace('Z', '+09:00');
  return jstIso;
};
