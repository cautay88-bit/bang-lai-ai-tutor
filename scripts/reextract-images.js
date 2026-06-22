/**
 * Trich lai anh tu PDF thanh PNG hop le (sua loi luu RGB raw thanh .jpg)
 */
const fs = require("fs");
const path = require("path");
const { encodePng, isValidJpeg } = require("./png-encode");

const PDF_PATH = path.join(__dirname, "../data/bo-600-official.pdf");
const OUT_DIR = path.join(__dirname, "../public/images/official");
const BANK_PATH = path.join(__dirname, "../public/data/bank-600.json");

async function extractImages(doc) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let saved = 0;
  let skipped = 0;

  const getObj = (page, name) => new Promise(resolve => {
    let done = false;
    const finish = v => { if (!done) { done = true; clearTimeout(t); resolve(v); } };
    const t = setTimeout(() => finish(null), 3000);
    try { page.objs.get(name, o => finish(o || null)); } catch (_) { finish(null); }
  });

  for (let p = 4; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    const seen = new Set();

    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (fn !== 85 && fn !== 86) continue;
      const name = ops.argsArray[i][0];
      const key = `${p}-${name}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const img = await getObj(page, name);
      if (!img?.data || !img.width || !img.height) { skipped++; continue; }

      const pngPath = path.join(OUT_DIR, `p${p}-${name}.png`);
      const jpgPath = pngPath.replace(".png", ".jpg");

      try {
        let out;
        if (isValidJpeg(Buffer.from(img.data))) {
          fs.writeFileSync(jpgPath, Buffer.from(img.data));
          out = jpgPath;
        } else if (img.kind === 1 || img.kind === 2 || img.kind === 3) {
          out = pngPath;
          fs.writeFileSync(pngPath, encodePng(img.width, img.height, img.data, img.kind));
        } else {
          skipped++;
          continue;
        }
        if (fs.existsSync(jpgPath) && out.endsWith(".png")) fs.unlinkSync(jpgPath);
        saved++;
      } catch (e) {
        console.warn(`Skip p${p}-${name}:`, e.message);
        skipped++;
      }
    }
  }

  return { saved, skipped };
}

async function buildImageMapping(doc) {
  const existing = new Set(fs.readdirSync(OUT_DIR).filter(f => f.endsWith(".png") || f.endsWith(".jpg")));
  const mapping = new Map();
  const usedFiles = new Set();

  async function pageLocal(p) {
    const page = await doc.getPage(p);
    const ops = await page.getOperatorList();
    const imgs = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      if (fn !== 85 && fn !== 86) continue;
      const name = ops.argsArray[i][0];
      const png = `p${p}-${name}.png`;
      const jpg = `p${p}-${name}.jpg`;
      const file = existing.has(png) ? png : (existing.has(jpg) ? jpg : null);
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
      const png = `p${p}-${name}.png`;
      const jpg = `p${p}-${name}.jpg`;
      const file = existing.has(png) ? png : (existing.has(jpg) ? jpg : null);
      if (!file || usedFiles.has(file)) continue;
      const key = typeof ops.argsArray[i][1] === "number" ? ops.argsArray[i][1] : 0;
      imgs.push({ file, key });
    }
    imgs.sort((a, b) => b.key - a.key).forEach(im => orderedImg.push(`/images/official/${im.file}`));

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
    console.error("PDF not found:", PDF_PATH);
    process.exit(1);
  }

  const buf = fs.readFileSync(PDF_PATH);
  const pdfjs = await import("../node_modules/pdfjs-dist/legacy/build/pdf.mjs");
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: true }).promise;

  console.log("Extracting images as PNG...");
  const { saved, skipped } = await extractImages(doc);
  console.log(`Saved ${saved} images, skipped ${skipped}`);

  console.log("Mapping images to questions...");
  const imageMap = await buildImageMapping(doc);
  console.log(`Mapped ${imageMap.size} question images`);

  const bank = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
  let updated = 0;
  for (const q of bank.questions) {
    const img = imageMap.get(q.num);
    if (img) {
      q.image = img;
      updated++;
    } else if (q.num >= 301) {
      delete q.image;
    }
  }

  bank.importedAt = new Date().toISOString();
  fs.writeFileSync(BANK_PATH, JSON.stringify(bank), "utf8");
  console.log(`Updated bank: ${updated} questions with images`);

  // Xoa file .jpg cu (RGB raw loi)
  for (const f of fs.readdirSync(OUT_DIR)) {
    if (f.endsWith(".jpg")) {
      const png = f.replace(".jpg", ".png");
      if (fs.existsSync(path.join(OUT_DIR, png))) fs.unlinkSync(path.join(OUT_DIR, f));
    }
  }

  const pngCount = fs.readdirSync(OUT_DIR).filter(f => f.endsWith(".png")).length;
  console.log(`PNG files in ${OUT_DIR}: ${pngCount}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
