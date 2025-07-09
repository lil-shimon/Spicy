import path from "path";
import fs from "fs";

export const writeCountToCsv = async (
  pairCount: Record<string, number>,
  timestamp = new Date().toISOString()
) => {
  const filePath = path.resolve(__dirname, "pair-counts.csv");
  const fileExists = fs.existsSync(filePath);

  const header = "timestamp,pair,count\n";
  const pairCountArray: [string, number][] = Object.entries(pairCount);
  const rows = pairCountArray
    .map(([pair, count]) => `${timestamp},${pair},${count}`)
    .join("\n");

  const csvData = (fileExists ? "" : header) + rows + "\n";

  fs.appendFileSync(filePath, csvData, "utf8");
};
