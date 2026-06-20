let QUESTION_BANK_LOADED = false;
let QUESTION_BANK_LOADING = null;

async function loadQuestionBank() {
  if (QUESTION_BANK_LOADED) return QUESTION_BANK;
  if (QUESTION_BANK_LOADING) return QUESTION_BANK_LOADING;

  QUESTION_BANK_LOADING = (async () => {
    try {
      const res = await fetch("/data/bank-600.json");
      if (res.ok) {
        const data = await res.json();
        const imported = data.questions || data;
        if (Array.isArray(imported) && imported.length > 0) {
          const existingIds = new Set(QUESTION_BANK.map(q => q.id));
          imported.forEach(q => {
            if (!existingIds.has(q.id)) {
              QUESTION_BANK.push(q);
              existingIds.add(q.id);
            }
          });
          console.log(`Loaded ${imported.length} questions from bank-600.json (total: ${QUESTION_BANK.length})`);
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
