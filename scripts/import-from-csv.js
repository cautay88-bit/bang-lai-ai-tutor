/**
 * Import cau hoi tu file CSV vao bank-600.json
 *
 * Format CSV (header):
 * id,topicId,type,text,optionA,optionB,optionC,optionD,correct,explanation,image
 *
 * Chay: node scripts/import-from-csv.js path/to/file.csv
 */
const fs = require("fs");
const path = require("path");

const csvPath = process.argv[2];
const OUT = path.join(__dirname, "../public/data/bank-600.json");

if (!csvPath || !fs.existsSync(csvPath)) {
  console.log(`
Import cau hoi tu CSV
---------------------
Usage: node scripts/import-from-csv.js <file.csv>

Cot CSV:
  id, topicId, type, text, optionA, optionB, optionC, optionD, correct, explanation, image

topicId: ch1-quy-dinh-chung | ch2-van-hoa-giao-thong | ch3-ky-thuat-lai-xe
         ch4-cau-tao-sua-chua | ch5-bao-hieu-duong-bo | ch6-sa-hinh
type: mcq | essay | sahinh
correct: 0-3 (index dap an dung)
`);
  process.exit(1);
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  const header = lines[0].split(",").map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    const values = cols.map(c => c.replace(/^"|"$/g, "").trim());
    const row = {};
    header.forEach((h, j) => { row[h] = values[j] || ""; });
    rows.push(row);
  }
  return rows;
}

function rowToQuestion(row) {
  const options = [row.optionA, row.optionB, row.optionC, row.optionD]
    .filter(Boolean)
    .map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`);

  const q = {
    id: row.id,
    topicId: row.topicId,
    type: row.type || "mcq",
    text: row.text,
    options,
    correct: parseInt(row.correct, 10) || 0,
    explanation: row.explanation || ""
  };

  if (row.image) q.image = row.image.startsWith("/") ? row.image : `/images/sa-hinh/${row.image}`;
  if (row.type === "essay") {
    q.sampleAnswer = row.sampleAnswer || row.explanation;
    delete q.options;
    delete q.correct;
  }
  return q;
}

const raw = fs.readFileSync(csvPath, "utf8");
const rows = parseCSV(raw);
const questions = rows.map(rowToQuestion);

const payload = {
  version: 1,
  total: questions.length,
  importedAt: new Date().toISOString(),
  source: path.basename(csvPath),
  questions
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload), "utf8");
console.log(`Imported ${questions.length} questions -> ${OUT}`);
