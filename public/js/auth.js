const AUTH_TOKEN_KEY = "bang-lai-auth-token";
const AUTH_USER_KEY = "bang-lai-auth-user";

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function isLoggedIn() {
  return !!getAuthToken();
}

function setAuthSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "L?i k?t n?i server");
  return data;
}

async function registerAccount(username, password, email) {
  const data = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password, email })
  });
  setAuthSession(data.token, data.user);
  return data;
}

async function loginAccount(username, password) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  setAuthSession(data.token, data.user);
  return data;
}

async function logoutAccount() {
  try {
    if (isLoggedIn()) {
      await apiRequest("/api/auth/logout", { method: "POST" });
    }
  } catch (_) {}
  clearAuthSession();
}

async function fetchCloudProgress() {
  if (!isLoggedIn()) return null;
  const data = await apiRequest("/api/progress");
  return data.progress;
}

async function pushCloudProgress(progress) {
  if (!isLoggedIn()) return false;
  await apiRequest("/api/progress", {
    method: "PUT",
    body: JSON.stringify({ progress })
  });
  return true;
}

async function syncProgressOnLogin() {
  const cloud = await fetchCloudProgress();
  const local = loadProgressLocal();

  if (!cloud) {
    await pushCloudProgress(local);
    return local;
  }

  const cloudTime = cloud.lastSession ? new Date(cloud.lastSession).getTime() : 0;
  const localTime = local.lastSession ? new Date(local.lastSession).getTime() : 0;

  if (localTime > cloudTime && local.totalQuestions > 0) {
    const merged = mergeProgress(local, cloud);
    saveProgressLocal(merged);
    await pushCloudProgress(merged);
    return merged;
  }

  saveProgressLocal(cloud);
  return cloud;
}

function mergeProgress(a, b) {
  const topics = {};
  getAllTopicIds().forEach(id => {
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

async function syncProgressToCloud() {
  if (!isLoggedIn()) return;
  try {
    await pushCloudProgress(loadProgressLocal());
  } catch (e) {
    console.warn("Cloud sync failed:", e.message);
  }
}
