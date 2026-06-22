/**
 * Kiem tra bank-600.json da co san (dung cho build tren Render).
 * Import PDF chi chay local: npm run import-pdf
 */
const fs = require("fs");
const path = require("path");

const BANK = path.join(__dirname, "../public/data/bank-600.json");
const IMG_DIR = path.join(__dirname, "../public/images/official");

if (!fs.existsSync(BANK)) {
  console.error("Missing public/data/bank-600.json — run npm run import-pdf locally first.");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(BANK, "utf8"));
const total = data.questions?.length || 0;

if (total < 600) {
  console.error(`Invalid bank: expected 600 questions, got ${total}`);
  process.exit(1);
}

const withImage = data.questions.filter(q => q.image).length;
let missingImages = 0;
for (const q of data.questions) {
  if (q.image && !fs.existsSync(path.join(__dirname, "../public", q.image))) {
    missingImages++;
  }
}

if (missingImages > 0) {
  console.error(`${missingImages} question images missing under public/`);
  process.exit(1);
}

console.log(
  `Build OK: ${total} questions, ${withImage} with images, ` +
  `${data.criticalCount || 0} critical, version ${data.version || 1}`
);
