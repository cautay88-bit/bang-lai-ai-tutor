/**
 * Kiem tra bank-600.json va bank-250-moto.json (dung cho build tren Render).
 */
const fs = require("fs");
const path = require("path");
const { getAllMotoA1Numbers, MOTO_A1_GROUPS } = require("./moto-a1-numbers");

const BANK_600 = path.join(__dirname, "../public/data/bank-600.json");
const BANK_250 = path.join(__dirname, "../public/data/bank-250-moto.json");
const IMG_DIR = path.join(__dirname, "../public/images/official");

function verifyBank600() {
  if (!fs.existsSync(BANK_600)) {
    console.error("Missing public/data/bank-600.json — run npm run import-pdf locally first.");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(BANK_600, "utf8"));
  const total = data.questions?.length || 0;

  if (total < 600) {
    console.error(`Invalid bank-600: expected 600 questions, got ${total}`);
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
    `Oto OK: ${total} questions, ${withImage} with images, ` +
    `${data.criticalCount || 0} critical, version ${data.version || 1}`
  );
}

function verifyBank250() {
  if (!fs.existsSync(BANK_250)) {
    console.error("Missing public/data/bank-250-moto.json — run: node scripts/build-bank-250-moto.js");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(BANK_250, "utf8"));
  const total = data.questions?.length || 0;

  if (total !== 250) {
    console.error(`Invalid bank-250-moto: expected 250 questions, got ${total}`);
    process.exit(1);
  }

  const expectedNums = new Set(getAllMotoA1Numbers());
  const nums = data.questions.map(q => q.sourceNum || q.num);
  if (nums.length !== expectedNums.size || nums.some(n => !expectedNums.has(n))) {
    console.error("bank-250-moto question numbers do not match Phu luc I");
    process.exit(1);
  }

  for (const [topicId, expectedCount] of Object.entries(MOTO_A1_GROUPS)) {
    const actual = data.questions.filter(q => q.topicId === topicId).length;
    if (actual !== expectedCount.length) {
      console.error(`Topic ${topicId}: expected ${expectedCount.length}, got ${actual}`);
      process.exit(1);
    }
  }

  const critical = data.questions.filter(q => q.critical).length;
  if (critical !== 20) {
    console.error(`Expected 20 critical moto questions, got ${critical}`);
    process.exit(1);
  }

  let missingImages = 0;
  for (const q of data.questions) {
    if (q.image && !fs.existsSync(path.join(__dirname, "../public", q.image))) {
      missingImages++;
    }
  }
  if (missingImages > 0) {
    console.error(`${missingImages} moto question images missing`);
    process.exit(1);
  }

  const withImage = data.questions.filter(q => q.image).length;
  console.log(`Moto OK: ${total} questions, ${withImage} with images, ${critical} critical`);
}

verifyBank600();
verifyBank250();
console.log("Build OK");
