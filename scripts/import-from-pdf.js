/**
 * Import bo 600 cau hoi chinh thuc tu PDF (Cong van 2262/CSGT-P5)
 * Chay: node scripts/import-from-pdf.js [path/to/pdf]
 */
const fs = require("fs");
const path = require("path");

const PDF_PATH = process.argv[2] || path.join(__dirname, "../data/bo-600-official.pdf");
const OUT_JSON = path.join(__dirname, "../public/data/bank-600.json");
const IMG_DIR = path.join(__dirname, "../public/images/official");

const { encodePng, isValidJpeg } = require("./png-encode");

const ANSWER_OVERRIDES = {
  17: 0, 93: 0, 268: 0, 292: 0, 331: 1, 388: 0, 556: 0
};

const DIEM_LIET = new Set([
  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 32, 34, 35, 47, 48, 52, 53, 55, 58,
  63, 64, 65, 66, 67, 68, 70, 71, 72, 73, 74, 85, 86, 87, 88, 89, 90, 91, 92, 93,
  97, 98, 102, 117, 163, 165, 167, 197, 198, 206, 215, 226, 234, 245, 246, 252, 253,
  254, 255, 260
]);

const CHAPTERS = [
  { max: 180, topicId: "ch1-quy-dinh-chung" },
  { max: 205, topicId: "ch2-van-hoa-giao-thong" },
  { max: 263, topicId: "ch3-ky-thuat-lai-xe" },
  { max: 300, topicId: "ch4-cau-tao-sua-chua" },
  { max: 485, topicId: "ch5-bao-hieu-duong-bo" },
  { max: 600, topicId: "ch6-sa-hinh" }
];

function topicForNum(n) {
  for (const ch of CHAPTERS) {
    if (n <= ch.max) return ch.topicId;
  }
  return "ch6-sa-hinh";
}

function normalizeText(t) {
  return t.replace(/\s+/g, " ").trim();
}

function parseQuestionsFromText(rawText) {
  const text = rawText
    .replace(/\r/g, "")
    .replace(/CHƯƠNG [IVX]+\.[^\n]*/gi, " ")
    .replace(/BAN BIÊN SOẠN[\s\S]*?Câu 1\./i, "Câu 1.");

  const parts = text.split(/(?=Câu\s+\d+[:.])/i);
  const questions = [];

  for (const part of parts) {
    const m = part.match(/^Câu\s+(\d+)[:.]\s*([\s\S]*)/i);
    if (!m) continue;
    const num = +m[1];
    if (num < 1 || num > 600) continue;

    const body = m[2].trim();
    const optRe = /(?:^|\n)\s*([1-4])\.\s+/g;
    const indices = [];
    let om;
    while ((om = optRe.exec(body)) !== null) {
      indices.push({ index: +om[1] - 1, start: om.index + om[0].length - om[1].length - 2 });
    }

    if (indices.length === 0) continue;

    const qText = normalizeText(body.slice(0, indices[0].start));
    const options = indices.map((hit, i) => {
      const start = body.indexOf(`${hit.index + 1}.`, hit.start);
      const end = i + 1 < indices.length
        ? body.indexOf(`${indices[i + 1].index + 1}.`, indices[i + 1].start)
        : body.length;
      const chunk = body.slice(start, end);
      const textOpt = normalizeText(chunk.replace(/^[1-4]\.\s*/, ""));
      return { index: hit.index, text: textOpt };
    });

    questions.push({ num, text: qText, options });
  }

  return questions.sort((a, b) => a.num - b.num);
}

function getUnderlines(fnArray, argsArray, OPS) {
  const lines = [];
  for (let i = 0; i < fnArray.length; i++) {
    if (fnArray[i] === OPS.constructPath) {
      const coords = argsArray[i][1];
      if (coords?.length >= 4) {
        const [x, y, w, h] = coords;
        if (h > 0 && h < 2 && w > 15) lines.push({ x, y, w, h });
      }
    }
  }
  return lines;
}

function parsePageForAnswers(items) {
  const questions = [];
  let q = null;
  let opt = null;

  const flushOpt = () => {
    if (opt && q) {
      q.options.push(opt);
      opt = null;
    }
  };

  for (const it of items) {
    if (!it.str?.trim()) continue;
    const s = it.str.trim();
    const qm = s.match(/^C(?:â|a)u\s+(\d+)[:.]/i);
    if (qm) {
      flushOpt();
      if (q) questions.push(q);
      q = { num: +qm[1], options: [] };
      continue;
    }
    const om = s.match(/^([1-4])\.\s*(.*)/);
    if (om && q) {
      flushOpt();
      opt = {
        index: +om[1] - 1,
        lines: [{ y: it.transform[5], x: it.transform[4], w: it.width }]
      };
      continue;
    }
    if (/^([1-4])\.$/.test(s) && q) {
      flushOpt();
      opt = {
        index: +s[0] - 1,
        lines: [{ y: it.transform[5], x: it.transform[4], w: it.width }]
      };
      continue;
    }
    if (opt) {
      const ly = it.transform[5];
      const last = opt.lines[opt.lines.length - 1];
      if (Math.abs(ly - last.y) <= 4) {
        last.w = Math.max(last.w, it.transform[4] + it.width - last.x);
      } else {
        opt.lines.push({ y: ly, x: it.transform[4], w: it.width });
      }
    }
  }
  flushOpt();
  if (q) questions.push(q);
  return questions;
}

function matchAnswer(q, lines) {
  for (const line of lines) {
    let best = null;
    let bestDist = 999;
    for (const opt of q.options) {
      for (const ln of opt.lines) {
        const dy = ln.y - line.y;
        if (dy < -2 || dy > 25) continue;
        const overlap = line.x <= ln.x + ln.w + 8 && line.x + line.w >= ln.x - 8;
        if (!overlap) continue;
        const dist = Math.abs(dy - 2);
        if (dist < bestDist) {
          bestDist = dist;
          best = opt.index;
        }
      }
    }
    if (best !== null) return best;
  }
  return null;
}

async function extractPageImages(page, pageNum, outDir) {
  const ops = await page.getOperatorList();
  let saved = 0;
  const seen = new Set();

  const getObj = (name) => new Promise(resolve => {
    let settled = false;
    const finish = (val) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(val);
    };
    const timer = setTimeout(() => finish(null), 2000);
    try {
      page.objs.get(name, obj => finish(obj || null));
    } catch (_) {
      finish(null);
    }
  });

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    if (fn !== 85 && fn !== 86) continue;
    const name = ops.argsArray[i][0];
    const key = `${pageNum}-${name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const file = path.join(outDir, `p${pageNum}-${name}.png`);
    const jpgLegacy = file.replace(".png", ".jpg");
    if (fs.existsSync(file)) continue;
    try {
      const img = await getObj(name);
      if (!img?.data || !img.width || !img.height) continue;
      if (isValidJpeg(Buffer.from(img.data))) {
        fs.writeFileSync(jpgLegacy, Buffer.from(img.data));
      } else if (img.kind === 1 || img.kind === 2 || img.kind === 3) {
        fs.writeFileSync(file, encodePng(img.width, img.height, img.data, img.kind));
        saved++;
      }
    } catch (_) {}
  }
  return saved;
}

async function buildImageMapping(doc) {
  const existing = new Set(
    fs.readdirSync(IMG_DIR).filter(f => f.endsWith(".png") || f.endsWith(".jpg"))
  );
  const mapping = new Map();
  const usedFiles = new Set();

  const pickFile = (p, name) => {
    const png = `p${p}-${name}.png`;
    const jpg = `p${p}-${name}.jpg`;
    if (existing.has(png)) return png;
    if (existing.has(jpg)) return jpg;
    return null;
  };

  async function pageLocal(p) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    const imgs = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (fn !== 85 && fn !== 86) continue;
      const name = ops.argsArray[i][0];
      const file = pickFile(p, name);
      if (!file) continue;
      const key = typeof ops.argsArray[i][1] === "number" ? ops.argsArray[i][1] : 0;
      imgs.push({ file, key });
    }
    imgs.sort((a, b) => b.key - a.key);

    const tc = await page.getTextContent();
    const qs = [];
    let tb = "";
    for (const it of tc.items) {
      tb = (tb + (it.str || "")).slice(-40);
      const m = tb.match(/C(?:â|a)u\s+(\d+)[:.]/i);
      if (m) {
        const num = +m[1];
        if (num >= 301 && num <= 600) {
          const last = qs[qs.length - 1];
          if (!last || last.num !== num) qs.push({ num, y: it.transform[5] });
        }
      }
    }
    qs.sort((a, b) => b.y - a.y);

    for (let i = 0; i < Math.min(imgs.length, qs.length); i++) {
      if (!mapping.has(qs[i].num)) {
        mapping.set(qs[i].num, `/images/official/${imgs[i].file}`);
        usedFiles.add(imgs[i].file);
      }
    }
  }

  for (let p = 4; p <= doc.numPages; p++) await pageLocal(p);

  const orderedQ = [];
  const orderedImg = [];
  for (let p = 4; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    const imgs = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (fn !== 85 && fn !== 86) continue;
      const name = ops.argsArray[i][0];
      const file = pickFile(p, name);
      if (!file || usedFiles.has(file)) continue;
      const key = typeof ops.argsArray[i][1] === "number" ? ops.argsArray[i][1] : 0;
      imgs.push({ file, key });
    }
    imgs.sort((a, b) => b.key - a.key).forEach(im => {
      orderedImg.push(`/images/official/${im.file}`);
    });

    const tc = await page.getTextContent();
    let tb = "";
    const seen = new Set();
    for (const it of tc.items) {
      tb = (tb + (it.str || "")).slice(-40);
      const m = tb.match(/C(?:â|a)u\s+(\d+)[:.]/i);
      if (m) {
        const num = +m[1];
        if (num >= 301 && num <= 600 && !seen.has(num)) {
          seen.add(num);
          if (!mapping.has(num)) orderedQ.push(num);
        }
      }
    }
  }

  for (let i = 0; i < Math.min(orderedQ.length, orderedImg.length); i++) {
    mapping.set(orderedQ[i], orderedImg[i]);
  }

  return mapping;
}

async function main() {
  if (!fs.existsSync(PDF_PATH)) {
    if (fs.existsSync(OUT_JSON)) {
      console.log("PDF not found — using existing bank-600.json");
      process.exit(0);
    }
    console.error("PDF not found:", PDF_PATH);
    process.exit(1);
  }

  const buf = fs.readFileSync(PDF_PATH);
  const pdfParse = require("pdf-parse");
  const parsed = await pdfParse(buf);
  const textQuestions = parseQuestionsFromText(parsed.text);
  console.log(`Parsed ${textQuestions.length} questions from PDF text`);

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { getDocument, OPS } = pdfjs;
  const doc = await getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;

  const answers = new Map();
  fs.mkdirSync(IMG_DIR, { recursive: true });
  let imgSaved = 0;

  // Trich dap an bang cach doc underline trong PDF (giu state giua cac trang)
  let curQ = null;
  let lastOpt = null;
  let textBuf = "";

  for (let p = 4; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    imgSaved += await extractPageImages(page, p, IMG_DIR);

    const ops = await page.getOperatorList();
    const { fnArray, argsArray } = ops;

    for (let i = 0; i < fnArray.length; i++) {
      const fn = fnArray[i];
      if (fn === OPS.showText) {
        const glyphs = argsArray[i][0];
        let str = "";
        for (const g of glyphs) {
          if (typeof g === "object" && g.unicode) str += g.unicode;
        }
        if (!str.trim()) continue;

        textBuf = (textBuf + str).slice(-80);
        const qm = textBuf.match(/C(?:â|a)u\s+(\d+)[:.]/i);
        if (qm) {
          curQ = +qm[1];
          lastOpt = null;
        }
        const om = str.match(/^([1-4])\./);
        if (om && curQ !== null) {
          lastOpt = +om[1] - 1;
        }
      }

      if (fn === OPS.constructPath && curQ !== null && lastOpt !== null) {
        const coords = argsArray[i][1];
        if (coords?.length >= 4) {
          const [, , w, h] = coords;
          if (h > 0 && h < 2 && w > 15) {
            answers.set(curQ, lastOpt);
          }
        }
      }
    }

    // Bo sung: match underline theo toa do text (cau co layout phuc tap)
    const lines = getUnderlines(fnArray, argsArray, OPS);
    const tc = await page.getTextContent();
    const pageQs = parsePageForAnswers(tc.items);
    for (const pq of pageQs) {
      const ans = matchAnswer(pq, lines);
      if (ans !== null) answers.set(pq.num, ans);
    }
  }

  console.log(`Detected ${answers.size} answers from PDF underlines`);

  const imageMap = await buildImageMapping(doc);
  console.log(`Mapped ${imageMap.size} question images`);

  const questions = [];
  const warnings = [];

  for (const q of textQuestions) {
    const topicId = topicForNum(q.num);
    const type = topicId === "ch6-sa-hinh" ? "sahinh" : "mcq";
    const correct = answers.get(q.num) ?? ANSWER_OVERRIDES[q.num];

    if (correct === undefined) warnings.push(`ans-${q.num}`);

    const options = q.options
      .sort((a, b) => a.index - b.index)
      .map(o => `${String.fromCharCode(65 + o.index)}. ${o.text}`);

    const item = {
      id: `q${String(q.num).padStart(3, "0")}`,
      num: q.num,
      topicId,
      type,
      text: q.text,
      options,
      correct: correct ?? 0,
      critical: DIEM_LIET.has(q.num),
      explanation: DIEM_LIET.has(q.num)
        ? "Câu hỏi tình huống mất an toàn giao thông nghiêm trọng (điểm liệt). Trả lời sai sẽ trượt bài thi."
        : ""
    };

    const imgPath = imageMap.get(q.num);
    if (imgPath) item.image = imgPath;

    questions.push(item);
  }

  const needsImage = questions.filter(q => q.num >= 301).length;
  const withImage = questions.filter(q => q.image).length;
  if (withImage < needsImage) {
    warnings.push(`images-${withImage}/${needsImage}`);
  }

  // Xoa file .raw thua tu lan trich truoc
  for (const f of fs.readdirSync(IMG_DIR)) {
    if (f.endsWith(".raw")) fs.unlinkSync(path.join(IMG_DIR, f));
  }

  if (textQuestions.length < 600) {
    warnings.push(`only-${textQuestions.length}-questions`);
  }

  const payload = {
    version: 2,
    total: questions.length,
    importedAt: new Date().toISOString(),
    source: "Cong van 2262/CSGT-P5 (PDF chinh thuc 2025)",
    criticalCount: DIEM_LIET.size,
    chapters: { ch1: 180, ch2: 25, ch3: 58, ch4: 37, ch5: 185, ch6: 115 },
    questions
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(payload), "utf8");

  console.log(`Saved -> ${OUT_JSON}`);
  console.log(`Images saved: ${imgSaved}`);
  if (warnings.length) console.warn(`Warnings (${warnings.length}):`, warnings.slice(0, 40).join(", "));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
