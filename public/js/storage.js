const PROGRESS_KEYS = {
  oto: "bang-lai-progress-oto",
  moto: "bang-lai-progress-moto"
};
const LEGACY_KEY = "bang-lai-ai-tutor-progress";

function migrateLegacyProgress() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw && !localStorage.getItem(PROGRESS_KEYS.oto)) {
      localStorage.setItem(PROGRESS_KEYS.oto, raw);
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch (_) {}
}

function progressKeyFor(vehicle) {
  return PROGRESS_KEYS[vehicle || getCurrentVehicle() || "oto"];
}

function loadProgressLocalFor(vehicle) {
  migrateLegacyProgress();
  try {
    const raw = localStorage.getItem(progressKeyFor(vehicle));
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return createEmptyProgressFor(vehicle);
}

function loadProgressLocal() {
  return loadProgressLocalFor(getCurrentVehicle() || "oto");
}

function loadProgress() {
  return loadProgressLocal();
}

function createEmptyProgressFor(vehicle) {
  const topicIds = vehicle === "moto" ? getAllMotoTopicIds() : getAllTopicIds();
  const topics = {};
  topicIds.forEach(id => {
    topics[id] = { correct: 0, wrong: 0, total: 0, lastPracticed: null };
  });
  return {
    topics,
    examHistory: [],
    totalQuestions: 0,
    totalCorrect: 0,
    streak: 0,
    lastSession: null
  };
}

function createEmptyProgress() {
  return createEmptyProgressFor(getCurrentVehicle() || "oto");
}

function saveProgressLocalFor(vehicle, data) {
  localStorage.setItem(progressKeyFor(vehicle), JSON.stringify(data));
}

function saveProgressLocal(data) {
  saveProgressLocalFor(getCurrentVehicle() || "oto", data);
}

function saveProgress(data) {
  saveProgressLocal(data);
  syncProgressToCloud();
}

function recordAnswer(topicId, isCorrect, questionType = "mcq") {
  const progress = loadProgress();
  if (!progress.topics[topicId]) {
    progress.topics[topicId] = { correct: 0, wrong: 0, total: 0, lastPracticed: null };
  }
  const t = progress.topics[topicId];
  t.total++;
  if (isCorrect) {
    t.correct++;
    progress.totalCorrect++;
    progress.streak++;
  } else {
    t.wrong++;
    progress.streak = 0;
  }
  progress.totalQuestions++;
  t.lastPracticed = new Date().toISOString();
  progress.lastSession = new Date().toISOString();
  saveProgress(progress);
  return progress;
}

function recordExamResult(score, total, passed, durationMinutes, weakTopics) {
  const progress = loadProgress();
  progress.examHistory.unshift({
    date: new Date().toISOString(),
    score,
    total,
    passed,
    durationMinutes,
    weakTopics
  });
  if (progress.examHistory.length > 20) {
    progress.examHistory = progress.examHistory.slice(0, 20);
  }
  saveProgress(progress);
}

function getWeakTopics(limit = 5) {
  const progress = loadProgress();
  const ranked = Object.entries(progress.topics)
    .filter(([, stats]) => stats.total >= 2)
    .map(([id, stats]) => ({
      topicId: id,
      accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
      wrong: stats.wrong,
      total: stats.total
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
  return ranked.slice(0, limit);
}

function getTopicAccuracy(topicId) {
  const progress = loadProgress();
  const t = progress.topics[topicId];
  if (!t || t.total === 0) return null;
  return Math.round((t.correct / t.total) * 100);
}

function getOverallStats() {
  const progress = loadProgress();
  const accuracy = progress.totalQuestions > 0
    ? Math.round((progress.totalCorrect / progress.totalQuestions) * 100)
    : 0;
  const examsTaken = progress.examHistory.length;
  const examsPassed = progress.examHistory.filter(e => e.passed).length;
  return {
    totalQuestions: progress.totalQuestions,
    accuracy,
    streak: progress.streak,
    examsTaken,
    examsPassed
  };
}

function getStudySuggestions() {
  const weak = getWeakTopics(3);
  const suggestions = [];
  const topics = getActiveTopics();

  weak.forEach(({ topicId, accuracy }) => {
    const topic = getTopicByIdActive(topicId);
    if (!topic) return;
    suggestions.push({
      topicId,
      title: topic.title,
      accuracy: Math.round(accuracy * 100),
      message: `Bạn trả lời đúng ${Math.round(accuracy * 100)}% câu hỏi về "${topic.title}". Nên ôn thêm: ${topic.keywords.slice(0, 3).join(", ")}.`,
      keywords: topic.keywords
    });
  });

  if (suggestions.length === 0) {
    topics.slice(0, 2).forEach(topic => {
      suggestions.push({
        topicId: topic.id,
        title: topic.title,
        accuracy: null,
        message: `Bắt đầu ôn tập "${topic.title}" để AI Tutor theo dõi điểm yếu của bạn.`,
        keywords: topic.keywords
      });
    });
  }

  return suggestions;
}

function resetProgress() {
  const vehicle = getCurrentVehicle() || "oto";
  localStorage.removeItem(progressKeyFor(vehicle));
  if (isLoggedIn()) {
    syncProgressToCloud();
  }
}

function mergeProgress(a, b, topicIds) {
  const topics = {};
  topicIds.forEach(id => {
    const ta = a.topics[id] || { correct: 0, wrong: 0, total: 0 };
    const tb = b.topics[id] || { correct: 0, wrong: 0, total: 0 };
    topics[id] = {
      correct: ta.correct + tb.correct,
      wrong: ta.wrong + tb.wrong,
      total: ta.total + tb.total,
      lastPracticed: [ta.lastPracticed, tb.lastPracticed].filter(Boolean).sort().pop() || null
    };
  });

  const examHistory = [...(a.examHistory || []), ...(b.examHistory || [])]
    .sort((x, y) => new Date(y.date) - new Date(x.date))
    .slice(0, 20);

  return {
    topics,
    examHistory,
    totalQuestions: (a.totalQuestions || 0) + (b.totalQuestions || 0),
    totalCorrect: (a.totalCorrect || 0) + (b.totalCorrect || 0),
    streak: Math.max(a.streak || 0, b.streak || 0),
    lastSession: [a.lastSession, b.lastSession].filter(Boolean).sort().pop() || null
  };
}

function normalizeCloudBundle(raw) {
  if (!raw) return { oto: createEmptyProgressFor("oto"), moto: createEmptyProgressFor("moto") };
  if (raw.topics) return { oto: raw, moto: createEmptyProgressFor("moto") };
  return {
    oto: raw.oto || createEmptyProgressFor("oto"),
    moto: raw.moto || createEmptyProgressFor("moto")
  };
}

function getCloudBundleFromLocal() {
  return {
    oto: loadProgressLocalFor("oto"),
    moto: loadProgressLocalFor("moto")
  };
}
