const STORAGE_KEY = "bang-lai-ai-tutor-progress";

function loadProgressLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return createEmptyProgress();
}

function loadProgress() {
  return loadProgressLocal();
}

function createEmptyProgress() {
  const topics = {};
  getAllTopicIds().forEach(id => {
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

function saveProgressLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

  weak.forEach(({ topicId, accuracy }) => {
    const topic = getTopicById(topicId);
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
    TOPICS.slice(0, 2).forEach(topic => {
      suggestions.push({
        topicId: topic.id,
        title: topic.title,
        accuracy: null,
        message: `Bắt đầu ôn tập "${topic.title}" để AI tutor theo dõi điểm yếu của bạn.`,
        keywords: topic.keywords
      });
    });
  }

  return suggestions;
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  if (isLoggedIn()) {
    pushCloudProgress(createEmptyProgress()).catch(() => {});
  }
}
