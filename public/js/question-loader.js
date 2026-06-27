let QUESTION_BANK_LOADED = false;
let QUESTION_BANK_LOADING = null;
let OFFICIAL_BANK = false;

let MOTO_QUESTION_BANK = [];
let MOTO_BANK_LOADED = false;
let MOTO_BANK_LOADING = null;
let OFFICIAL_MOTO_BANK = false;

function getActiveQuestionBank() {
  return isMotoMode() ? MOTO_QUESTION_BANK : QUESTION_BANK;
}

async function loadQuestionBank() {
  if (QUESTION_BANK_LOADED) return QUESTION_BANK;
  if (QUESTION_BANK_LOADING) return QUESTION_BANK_LOADING;

  QUESTION_BANK_LOADING = (async () => {
    try {
      const res = await fetch("/data/bank-600.json?v=2", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const imported = data.questions || data;
        if (Array.isArray(imported) && imported.length > 0) {
          if (imported.length >= 600 || data.version >= 2) {
            QUESTION_BANK.length = 0;
            imported.forEach(q => QUESTION_BANK.push(q));
            OFFICIAL_BANK = true;
            console.log(`Loaded official bank: ${imported.length} questions`);
          } else {
            const existingIds = new Set(QUESTION_BANK.map(q => q.id));
            imported.forEach(q => {
              if (!existingIds.has(q.id)) {
                QUESTION_BANK.push(q);
                existingIds.add(q.id);
              }
            });
            console.log(`Merged ${imported.length} questions (total: ${QUESTION_BANK.length})`);
          }
        }
      }
    } catch (e) {
      console.warn("Could not load bank-600.json, using built-in questions:", e.message);
    }
    QUESTION_BANK_LOADED = true;
    return QUESTION_BANK;
  })();

  return QUESTION_BANK_LOADING;
}

async function loadMotoQuestionBank() {
  if (MOTO_BANK_LOADED) return MOTO_QUESTION_BANK;
  if (MOTO_BANK_LOADING) return MOTO_BANK_LOADING;

  MOTO_BANK_LOADING = (async () => {
    try {
      const res = await fetch("/data/bank-250-moto.json?v=1", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const imported = data.questions || data;
        if (Array.isArray(imported) && imported.length >= 250) {
          MOTO_QUESTION_BANK = imported;
          OFFICIAL_MOTO_BANK = true;
          console.log(`Loaded moto bank: ${imported.length} questions`);
        }
      }
    } catch (e) {
      console.warn("Could not load bank-250-moto.json:", e.message);
    }
    MOTO_BANK_LOADED = true;
    return MOTO_QUESTION_BANK;
  })();

  return MOTO_BANK_LOADING;
}

function ensureBankReady() {
  if (isMotoMode()) {
    return MOTO_BANK_LOADED ? Promise.resolve(MOTO_QUESTION_BANK) : loadMotoQuestionBank();
  }
  return QUESTION_BANK_LOADED ? Promise.resolve(QUESTION_BANK) : loadQuestionBank();
}

function ensureAllBanksReady() {
  return Promise.all([loadQuestionBank(), loadMotoQuestionBank()]);
}

function isOfficialBank() {
  return isMotoMode() ? OFFICIAL_MOTO_BANK : OFFICIAL_BANK;
}

function getCriticalQuestions() {
  return getActiveQuestionBank().filter(q => q.critical);
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(pool, count, excludeIds = new Set()) {
  const filtered = pool.filter(q => !excludeIds.has(q.id));
  return shuffleArray(filtered).slice(0, Math.min(count, filtered.length));
}

function buildExamFromBank(bank, spec) {
  const used = new Set();
  const paper = [];

  if (spec.critical) {
    const critical = pickQuestions(bank.filter(q => q.critical), 1, used)[0];
    if (critical) {
      paper.push(critical);
      used.add(critical.id);
    }
  }

  for (const { topicId, count, excludeCritical } of spec.topics) {
    let pool = bank.filter(q =>
      q.topicId === topicId &&
      !used.has(q.id) &&
      isMcqLike(q)
    );
    if (excludeCritical) pool = pool.filter(q => !q.critical);
    pickQuestions(pool, count, used).forEach(q => {
      paper.push(q);
      used.add(q.id);
    });
  }

  return shuffleArray(paper);
}

/** De thi hang B chuan 2262/CSGT-P5: 30 cau, 20 phut, dat 27/30 + khong sai diem liet */
function buildExamPaperB() {
  return buildExamFromBank(QUESTION_BANK, {
    critical: true,
    topics: [
      { topicId: "ch1-quy-dinh-chung", count: 8, excludeCritical: true },
      { topicId: "ch2-van-hoa-giao-thong", count: 1 },
      { topicId: "ch3-ky-thuat-lai-xe", count: 1 },
      { topicId: "ch4-cau-tao-sua-chua", count: 1 },
      { topicId: "ch5-bao-hieu-duong-bo", count: 9 },
      { topicId: "ch6-sa-hinh", count: 9 }
    ]
  });
}

/** De thi hang A1: 25 cau, 19 phut, dat 21/25 + khong sai diem liet */
function buildExamPaperA1() {
  return buildExamFromBank(MOTO_QUESTION_BANK, {
    critical: true,
    topics: [
      { topicId: "m-ch1-quy-dinh-chung", count: 8, excludeCritical: true },
      { topicId: "m-ch2-van-hoa-giao-thong", count: 1 },
      { topicId: "m-ch3-ky-thuat-lai-xe", count: 1 },
      { topicId: "m-ch4-bao-hieu-duong-bo", count: 8 },
      { topicId: "m-ch5-sa-hinh", count: 6 }
    ]
  });
}

function buildExamPaper() {
  return isMotoMode() ? buildExamPaperA1() : buildExamPaperB();
}

function getExamPassScore(total) {
  if (isMotoMode() && OFFICIAL_MOTO_BANK) return 21;
  if (!isMotoMode() && OFFICIAL_BANK) return 27;
  return Math.ceil(total * 0.84);
}

function getExamDurationMinutes() {
  return isMotoMode() ? 19 : 20;
}

function getExamQuestionCount() {
  return isMotoMode() ? 25 : 30;
}
