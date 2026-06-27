/**
 * Tao bank-250-moto.json tu bank-600.json + Phu luc I Cong van 2262
 * Chay: node scripts/build-bank-250-moto.js
 */
const fs = require("fs");
const path = require("path");
const {
  MOTO_A1_GROUPS,
  MOTO_A1_CRITICAL,
  getAllMotoA1Numbers,
  getMotoTopicForNum
} = require("./moto-a1-numbers");

const BANK_600 = path.join(__dirname, "../public/data/bank-600.json");
const OUT = path.join(__dirname, "../public/data/bank-250-moto.json");

const data600 = JSON.parse(fs.readFileSync(BANK_600, "utf8"));
const byNum = new Map(data600.questions.map(q => [q.num, q]));

const expected = getAllMotoA1Numbers();
const missing = expected.filter(n => !byNum.has(n));
if (missing.length) {
  console.error("Missing questions in bank-600:", missing.join(", "));
  process.exit(1);
}

const questions = expected.map((num, idx) => {
  const src = byNum.get(num);
  const topicId = getMotoTopicForNum(num);
  if (!topicId) {
    console.error("No topic for num", num);
    process.exit(1);
  }
  return {
    ...src,
    id: `m${String(idx + 1).padStart(3, "0")}`,
    num,
    sourceNum: num,
    topicId,
    critical: MOTO_A1_CRITICAL.has(num)
  };
});

const counts = {};
for (const [topicId, nums] of Object.entries(MOTO_A1_GROUPS)) {
  counts[topicId] = nums.length;
}

const out = {
  version: 1,
  source: "Cong van 2262/CSGT-P5 — Phu luc I (250 cau chon loc tu bo 600)",
  vehicle: "moto",
  licenseClass: "A1",
  totalQuestions: 250,
  criticalCount: questions.filter(q => q.critical).length,
  topicCounts: counts,
  questions
};

fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`Wrote ${OUT}: ${questions.length} questions, ${out.criticalCount} critical`);
for (const [k, v] of Object.entries(counts)) {
  console.log(`  ${k}: ${v}`);
}
