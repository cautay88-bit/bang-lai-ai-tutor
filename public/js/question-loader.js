let QUESTION_BANK_LOADED = false;
let QUESTION_BANK_LOADING = null;
let OFFICIAL_BANK = false;

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

function ensureBankReady() {
  return QUESTION_BANK_LOADED ? Promise.resolve(QUESTION_BANK) : loadQuestionBank();
}

function isOfficialBank() {
  return OFFICIAL_BANK;
}

function getCriticalQuestions() {
  return QUESTION_BANK.filter(q => q.critical);
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

/** De thi hang B chuan 2262/CSGT-P5: 30 cau, 20 phut, dat 27/30 + khong sai diem liet */
function buildExamPaperB() {
  const used = new Set();
  const paper = [];

  const criticalPool = getCriticalQuestions();
  const critical = pickQuestions(criticalPool, 1, used)[0];
  if (critical) {
    paper.push(critical);
    used.add(critical.id);
  }

  const addFromTopic = (topicId, count, opts = {}) => {
    let pool = QUESTION_BANK.filter(q =>
      q.topicId === topicId &&
      !used.has(q.id) &&
      isMcqLike(q)
    );
    if (opts.excludeCritical) pool = pool.filter(q => !q.critical);
    pickQuestions(pool, count, used).forEach(q => {
      paper.push(q);
      used.add(q.id);
    });
  };

  addFromTopic("ch1-quy-dinh-chung", 8, { excludeCritical: true });
  addFromTopic("ch2-van-hoa-giao-thong", 1);
  addFromTopic("ch3-ky-thuat-lai-xe", 1);
  addFromTopic("ch4-cau-tao-sua-chua", 1);
  addFromTopic("ch5-bao-hieu-duong-bo", 9);
  addFromTopic("ch6-sa-hinh", 9);

  return shuffleArray(paper);
}
