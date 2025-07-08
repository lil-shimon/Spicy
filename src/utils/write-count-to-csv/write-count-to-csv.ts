import path from "path";

export const writeCountToCsv = async () => {
  const filePath = path.resolve(__dirname, "pair-count.csv");
  console.log("CSVファイルのパス:", filePath);
};
