const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const PROGRESS_DIR = path.join(DATA_DIR, "progress");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json"
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROGRESS_DIR)) fs.mkdirSync(PROGRESS_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
  if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, "{}");
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getUserFromToken(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const sessions = readJson(SESSIONS_FILE, {});
  const session = sessions[token];
  if (!session) return null;
  if (new Date(session.expires) < new Date()) {
    delete sessions[token];
    writeJson(SESSIONS_FILE, sessions);
    return null;
  }
  return session;
}

function jsonResponse(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res) {
  const rel = req.url === "/" ? "index.html" : req.url.split("?")[0].replace(/^\//, "");
  const filePath = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not Found");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

async function callOpenAI(apiKey, model, messages) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: 0.7 })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "OpenAI API error");
  return data.choices[0].message.content;
}

async function callGemini(apiKey, model, messages) {
  const system = messages.find(m => m.role === "system");
  const contents = messages.filter(m => m.role !== "system").map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = { contents, generationConfig: { temperature: 0.7 } };
  if (system) body.systemInstruction = { parts: [{ text: system.content }] };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Gemini API error");
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

function handleRegister(body) {
  const { username, password, email } = body;
  if (!username || !password || username.length < 3 || password.length < 6) {
    throw new Error("Ten dang nhap (>=3) va mat khau (>=6) la bat buoc");
  }
  const users = readJson(USERS_FILE, []);
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("Ten dang nhap da ton tai");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const user = {
    id: crypto.randomUUID(),
    username,
    email: email || "",
    salt,
    passwordHash: hashPassword(password, salt),
    createdAt: new Date().toISOString()
  };
  users.push(user);
  writeJson(USERS_FILE, users);
  return createSession(user);
}

function handleLogin(body) {
  const { username, password } = body;
  const users = readJson(USERS_FILE, []);
  const user = users.find(u => u.username.toLowerCase() === (username || "").toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password || "", user.salt)) {
    throw new Error("Sai ten dang nhap hoac mat khau");
  }
  return createSession(user);
}

function createSession(user) {
  const token = createToken();
  const sessions = readJson(SESSIONS_FILE, {});
  sessions[token] = {
    userId: user.id,
    username: user.username,
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  writeJson(SESSIONS_FILE, sessions);
  return {
    token,
    user: { id: user.id, username: user.username, email: user.email }
  };
}

function handleLogout(token) {
  const sessions = readJson(SESSIONS_FILE, {});
  delete sessions[token];
  writeJson(SESSIONS_FILE, sessions);
}

function getProgressPath(userId) {
  return path.join(PROGRESS_DIR, `${userId}.json`);
}

function getUserProgress(userId) {
  const file = getProgressPath(userId);
  if (!fs.existsSync(file)) return null;
  return readJson(file, null);
}

function saveUserProgress(userId, progress) {
  writeJson(getProgressPath(userId), progress);
}

ensureDataDir();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  try {
    if (url.pathname === "/api/auth/register" && req.method === "POST") {
      const result = handleRegister(await readBody(req));
      return jsonResponse(res, 200, result);
    }

    if (url.pathname === "/api/auth/login" && req.method === "POST") {
      const result = handleLogin(await readBody(req));
      return jsonResponse(res, 200, result);
    }

    if (url.pathname === "/api/auth/logout" && req.method === "POST") {
      const session = getUserFromToken(req);
      if (session) {
        const auth = req.headers.authorization || "";
        handleLogout(auth.slice(7));
      }
      return jsonResponse(res, 200, { ok: true });
    }

    if (url.pathname === "/api/auth/me" && req.method === "GET") {
      const session = getUserFromToken(req);
      if (!session) return jsonResponse(res, 401, { error: "Chua dang nhap" });
      return jsonResponse(res, 200, { user: { id: session.userId, username: session.username } });
    }

    if (url.pathname === "/api/progress") {
      const session = getUserFromToken(req);
      if (!session) return jsonResponse(res, 401, { error: "Chua dang nhap" });

      if (req.method === "GET") {
        return jsonResponse(res, 200, { progress: getUserProgress(session.userId) });
      }
      if (req.method === "PUT") {
        const { progress } = await readBody(req);
        if (!progress) return jsonResponse(res, 400, { error: "Thieu du lieu tien do" });
        saveUserProgress(session.userId, progress);
        return jsonResponse(res, 200, { ok: true });
      }
    }

    if (url.pathname === "/api/chat" && req.method === "POST") {
      const { messages, provider, model, apiKey } = await readBody(req);
      if (!apiKey) return jsonResponse(res, 400, { error: "Thieu API key" });
      let content;
      if (provider === "gemini") {
        content = await callGemini(apiKey, model || "gemini-2.0-flash", messages);
      } else {
        content = await callOpenAI(apiKey, model || "gpt-4o-mini", messages);
      }
      return jsonResponse(res, 200, { content });
    }

    if (req.method === "GET") return serveStatic(req, res);

    res.writeHead(405);
    res.end("Method Not Allowed");
  } catch (e) {
    jsonResponse(res, 400, { error: e.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`
  AI Tutor - On thi bang lai xe B2
  ---------------------------------
  Mo trinh duyet: http://localhost:${PORT}
  Deploy: PORT=${PORT} HOST=${HOST}
  Dang nhap cloud: tab Tai khoan
  Cai dat PWA: Add to Home Screen tren dien thoai

  Nhan Ctrl+C de dung server.
  `);
});
