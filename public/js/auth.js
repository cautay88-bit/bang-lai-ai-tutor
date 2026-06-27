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
  if (!res.ok) throw new Error(data.error || "Lỗi kết nối server");
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

function mergeVehicleProgress(local, cloud, vehicle) {
  const topicIds = vehicle === "moto" ? getAllMotoTopicIds() : getAllTopicIds();
  const cloudTime = cloud.lastSession ? new Date(cloud.lastSession).getTime() : 0;
  const localTime = local.lastSession ? new Date(local.lastSession).getTime() : 0;
  if (localTime > cloudTime && local.totalQuestions > 0) {
    return mergeProgress(local, cloud, topicIds);
  }
  return cloud;
}

async function syncProgressOnLogin() {
  migrateLegacyProgress();
  const cloudRaw = await fetchCloudProgress();
  const bundle = normalizeCloudBundle(cloudRaw);

  ["oto", "moto"].forEach(vehicle => {
    const local = loadProgressLocalFor(vehicle);
    const merged = mergeVehicleProgress(local, bundle[vehicle], vehicle);
    saveProgressLocalFor(vehicle, merged);
    bundle[vehicle] = merged;
  });

  await pushCloudProgress(bundle);
  return loadProgressLocal();
}

async function syncProgressToCloud() {
  if (!isLoggedIn()) return;
  try {
    const cloudRaw = await fetchCloudProgress();
    const bundle = normalizeCloudBundle(cloudRaw);
    const vehicle = getCurrentVehicle() || "oto";
    bundle[vehicle] = loadProgressLocalFor(vehicle);
    await pushCloudProgress(bundle);
  } catch (e) {
    console.warn("Cloud sync failed:", e.message);
  }
}
