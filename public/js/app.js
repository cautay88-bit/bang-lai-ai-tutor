const AppState = {
  currentView: "home",
  practice: {
    topicId: null,
    question: null,
    answered: false,
    mode: "mixed"
  },
  sahinh: {
    question: null,
    answered: false,
    selected: null
  },
  exam: {
    active: false,
    questions: [],
    currentIndex: 0,
    answers: {},
    startTime: null,
    durationMinutes: 35,
    timerInterval: null
  },
  deferredPrompt: null
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  migrateLegacyProgress();
  bindNavigation();
  bindSettings();
  bindAuth();
  registerPWA();
  showLoading("Đang tải...");
  await purgeStaleImageCaches();
  await ensureAllBanksReady();
  hideLoading();
  updateAuthUI();

  if (isLoggedIn()) {
    try {
      await syncProgressOnLogin();
    } catch (_) {}
  }

  showView("landing");
}

function enterModule(vehicle) {
  setCurrentVehicle(vehicle);
  document.getElementById("header-landing").style.display = "none";
  document.getElementById("header-module").style.display = "block";
  updateModuleHeader();
  updateNavForVehicle();

  document.getElementById("home-content-oto").style.display = isOtoMode() ? "block" : "none";
  document.getElementById("home-content-moto").style.display = isMotoMode() ? "block" : "none";

  if (isOtoMode()) {
    updateBankInfo();
  } else {
    const el = document.getElementById("bank-size-info-moto");
    const bank = typeof getActiveQuestionBank === "function" ? getActiveQuestionBank() : [];
    const imgCount = bank.filter(q => q.image).length;
    const critical = bank.filter(q => q.critical).length;
    if (el) {
      el.textContent = isOfficialBank()
        ? `Ngân hàng: 250 câu A1 chính thức (${imgCount} có hình, ${critical} điểm liệt)`
        : "Đang tải bộ 250 câu A1...";
    }
    const banner = document.getElementById("moto-data-banner");
    if (banner) banner.style.display = isOfficialBank() ? "none" : "block";
  }

  renderHome();
  showView("home");
}

function exitToLanding() {
  setCurrentVehicle(null);
  document.getElementById("header-landing").style.display = "block";
  document.getElementById("header-module").style.display = "none";
  showView("landing");
}

function updateModuleHeader() {
  const cfg = getVehicleConfig();
  const logoEl = document.getElementById("module-logo-icon");
  if (logoEl) {
    logoEl.innerHTML = `<img src="/images/logo-${cfg.id === "moto" ? "moto" : "car"}.svg" alt="${cfg.label}">`;
  }
  const sub = document.getElementById("module-subtitle");
  if (sub) sub.textContent = `AI Tutor · ${cfg.label} ${cfg.badge}`;
  const statsTitle = document.getElementById("stats-title");
  if (statsTitle) statsTitle.textContent = `Thống kê · ${cfg.label} ${cfg.badge}`;
  const statsDesc = document.getElementById("stats-desc");
  if (statsDesc) statsDesc.textContent = `Tiến độ ôn tập ${cfg.label.toLowerCase()} — lưu riêng biệt với loại xe kia`;
  const practiceTitle = document.getElementById("practice-panel-title");
  if (practiceTitle) practiceTitle.textContent = isMotoMode() ? "Chủ đề ôn tập A1" : "Chọn chủ đề ôn tập";
  const practiceDesc = document.getElementById("practice-panel-desc");
  if (practiceDesc) {
    practiceDesc.textContent = isMotoMode()
      ? "5 chương theo bộ 250 câu mô tô hạng A1"
      : "6 chương theo bộ 600 câu lý thuyết lái xe ô tô";
  }
}

function updateNavForVehicle() {
  const cfg = getVehicleConfig();
  document.querySelectorAll(".nav-sahinh").forEach(el => {
    el.style.display = cfg.hasSahinh ? "" : "none";
  });
  document.querySelectorAll(".mode-sahinh").forEach(el => {
    el.style.display = cfg.hasSahinh ? "" : "none";
  });
}

function bindNavigation() {
  document.querySelectorAll("#module-nav .nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      document.querySelectorAll("#module-nav .nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showView(view);
    });
  });
}

function showView(name) {
  if (name === "sahinh" && isMotoMode()) {
    toast("Sa hình chỉ có trong phần Ô tô", "error");
    name = "home";
  }

  AppState.currentView = name;
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  const el = document.getElementById(`view-${name}`);
  if (el) el.classList.add("active");

  if (name !== "landing" && Vehicle.current) {
    document.querySelectorAll("#module-nav .nav-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.view === name);
    });
  }

  switch (name) {
    case "landing": break;
    case "home": renderHome(); break;
    case "practice": renderPracticeTopics(); break;
    case "sahinh": loadSaHinhQuestion(); break;
    case "exam": renderExamSetup(); break;
    case "stats": renderStats(); break;
    case "account": renderAccount(); break;
    case "settings": renderSettings(); break;
  }
}

function updateBankInfo() {
  if (!isOtoMode()) return;
  const size = typeof getQuestionBankSize === "function" ? getQuestionBankSize() : QUESTION_BANK.length;
  const saCount = typeof getSaHinhQuestions === "function" ? getSaHinhQuestions().length : 0;
  const imgCount = QUESTION_BANK.filter(q => q.image).length;
  const el = document.getElementById("bank-size-info");
  if (el) {
    el.textContent = isOfficialBank()
      ? `Ngân hàng: ${size} câu chính thức (${imgCount} có hình, ${saCount} sa hình)`
      : `Ngân hàng: ${size} câu (${saCount} sa hình)`;
  }
  const settingsCount = document.getElementById("settings-bank-count");
  if (settingsCount) settingsCount.textContent = size + "+";
}

function bindAuth() {
  document.getElementById("btn-login")?.addEventListener("click", async () => {
    const username = document.getElementById("auth-username").value.trim();
    const password = document.getElementById("auth-password").value;
    if (!username || !password) return toast("Nhập tên đăng nhập và mật khẩu", "error");
    showLoading("Đang đăng nhập...");
    try {
      await loginAccount(username, password);
      await syncProgressOnLogin();
      updateAuthUI();
      toast("Đăng nhập thành công!", "success");
      renderHome();
    } catch (e) {
      toast(e.message, "error");
    }
    hideLoading();
  });

  document.getElementById("btn-register")?.addEventListener("click", async () => {
    const username = document.getElementById("auth-username").value.trim();
    const password = document.getElementById("auth-password").value;
    const email = document.getElementById("auth-email").value.trim();
    if (!username || password.length < 6) return toast("Mật khẩu tối thiểu 6 ký tự", "error");
    showLoading("Đang đăng ký...");
    try {
      await registerAccount(username, password, email);
      await syncProgressOnLogin();
      updateAuthUI();
      toast("Đăng ký thành công!", "success");
    } catch (e) {
      toast(e.message, "error");
    }
    hideLoading();
  });

  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    await logoutAccount();
    updateAuthUI();
    toast("Đã đăng xuất", "success");
  });

  document.getElementById("btn-sync-now")?.addEventListener("click", async () => {
    showLoading("Đang đồng bộ...");
    try {
      await syncProgressToCloud();
      toast("Đồng bộ thành công!", "success");
    } catch (e) {
      toast(e.message, "error");
    }
    hideLoading();
  });
}

function updateAuthUI() {
  const user = getAuthUser();
  const badge = document.getElementById("auth-badge");
  const badgeLanding = document.getElementById("auth-badge-landing");
  const loggedOut = document.getElementById("account-logged-out");
  const loggedIn = document.getElementById("account-logged-in");

  const badgeHtml = user
    ? `<span class="auth-user">👤 ${escapeHtml(user.username)}</span>`
    : "";

  if (badge) badge.innerHTML = badgeHtml;
  if (badgeLanding) badgeLanding.innerHTML = badgeHtml;

  if (user) {
    if (loggedOut) loggedOut.style.display = "none";
    if (loggedIn) loggedIn.style.display = "block";
    const nameEl = document.getElementById("account-username");
    if (nameEl) nameEl.textContent = user.username;
  } else {
    if (loggedOut) loggedOut.style.display = "block";
    if (loggedIn) loggedIn.style.display = "none";
  }
}

function renderAccount() {
  updateAuthUI();
  const pwaStatus = document.getElementById("pwa-status");
  if (pwaStatus) {
    pwaStatus.textContent = window.matchMedia("(display-mode: standalone)").matches
      ? "✅ Ứng dụng đang chạy ở chế độ standalone"
      : "💡 Mở trên điện thoại và thêm vào màn hình chính để dùng như app";
  }
}

function registerPWA() {
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    AppState.deferredPrompt = e;
    const btn = document.getElementById("btn-install-pwa");
    if (btn) btn.style.display = "inline-flex";
  });

  document.getElementById("btn-install-pwa")?.addEventListener("click", async () => {
    if (!AppState.deferredPrompt) return;
    AppState.deferredPrompt.prompt();
    await AppState.deferredPrompt.userChoice;
    AppState.deferredPrompt = null;
    document.getElementById("btn-install-pwa").style.display = "none";
  });
}

function renderQuestionImage(q) {
  if (!q.image) return "";
  const alt = q.type === "sahinh" ? "Sa hinh giao thong" : "Bien bao duong bo";
  const src = escapeHtml(q.image);
  return `<div class="sahinh-image-wrap">
    <div class="image-loading">Đang tải hình...</div>
    <img data-src="${src}" alt="${alt}" class="sahinh-image question-image" decoding="async">
  </div>`;
}

function bindQuestionImages(root) {
  if (!root) return;
  root.querySelectorAll("img.question-image[data-src]").forEach(img => {
    if (img.dataset.bound) return;
    img.dataset.bound = "1";
    const wrap = img.closest(".sahinh-image-wrap");
    const loading = wrap?.querySelector(".image-loading");
    const src = img.dataset.src;
    let retries = 0;

    const finishLoad = () => {
      img.style.opacity = "1";
      loading?.remove();
    };

    const load = () => {
      img.src = retries > 0 ? `${src}?cb=${Date.now()}` : src;
    };

    img.addEventListener("load", finishLoad);
    img.addEventListener("error", () => {
      if (retries < 3) {
        retries++;
        if (loading) {
          loading.className = "image-loading";
          loading.textContent = `Đang tải hình... (lần ${retries + 1})`;
        }
        setTimeout(load, retries * 400);
        return;
      }
      if (loading) {
        loading.className = "image-error";
        loading.textContent = "Không tải được hình. Kiểm tra mạng hoặc thử trình duyệt khác.";
      }
      img.remove();
    });

    load();
  });
}

async function purgeStaleImageCaches() {
  if (!("caches" in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map(async key => {
      const cache = await caches.open(key);
      const reqs = await cache.keys();
      await Promise.all(reqs.map(req => {
        if (req.url.includes("/images/official/")) return cache.delete(req);
      }));
    }));
  } catch (_) {}
}

function preloadQuestionImages(questions) {
  questions.filter(q => q.image).forEach(q => {
    const img = new Image();
    img.src = q.image;
  });
}

function getQuestionTypeLabel(q) {
  if (q.type === "sahinh") return "Sa hình";
  if (q.type === "essay") return "Tự luận";
  return "Trắc nghiệm";
}

function bindSettings() {
  document.getElementById("btn-save-settings")?.addEventListener("click", saveSettings);
  document.getElementById("btn-test-ai")?.addEventListener("click", testAI);
  document.getElementById("btn-reset-progress")?.addEventListener("click", () => {
    if (confirm("Xóa toàn bộ tiến độ học tập?")) {
      resetProgress();
      toast("Đã xóa tiến độ", "success");
      renderHome();
    }
  });
}

function renderSettings() {
  const config = loadAIConfig();
  document.getElementById("input-api-key").value = config.apiKey || "";
  document.getElementById("select-provider").value = config.provider || "openai";
  document.getElementById("select-model").value = config.model || "gpt-4o-mini";
  document.getElementById("input-ai-enabled").checked = config.enabled;
}

function saveSettings() {
  const config = {
    apiKey: document.getElementById("input-api-key").value.trim(),
    provider: document.getElementById("select-provider").value,
    model: document.getElementById("select-model").value,
    enabled: document.getElementById("input-ai-enabled").checked
  };
  saveAIConfig(config);
  toast("Đã lưu cài đặt", "success");
}

async function testAI() {
  saveSettings();
  showLoading("Đang kiểm tra kết nối AI...");
  const result = await checkAIConnection();
  hideLoading();
  toast(result.message, result.ok ? "success" : "error");
}

function renderHome() {
  const stats = getOverallStats();
  document.getElementById("stat-total").textContent = stats.totalQuestions;
  document.getElementById("stat-accuracy").textContent = stats.accuracy + "%";
  document.getElementById("stat-streak").textContent = stats.streak;
  document.getElementById("stat-exams").textContent = `${stats.examsPassed}/${stats.examsTaken}`;

  const weakList = document.getElementById("weak-topics-list");
  const weak = getWeakTopics(5);
  if (weak.length === 0) {
    const emptyMsg = isMotoMode()
      ? "Chưa có dữ liệu — hãy bắt đầu ôn tập A1!"
      : "Chưa có dữ liệu — hãy bắt đầu ôn tập!";
    weakList.innerHTML = `<li class="empty-state"><span>${emptyMsg}</span></li>`;
  } else {
    weakList.innerHTML = weak.map(w => {
      const topic = getTopicByIdActive(w.topicId);
      const acc = Math.round(w.accuracy * 100);
      return `<li>
        <span>${topic?.title || w.topicId}</span>
        <span class="weak-badge">${acc}% đúng (${w.wrong} sai)</span>
      </li>`;
    }).join("");
  }

  renderSuggestions();
}

async function renderSuggestions() {
  const container = document.getElementById("suggestions-list");
  container.innerHTML = '<div class="loading"></div> Đang phân tích...';
  const suggestions = await getPersonalizedStudyPlan();
  container.innerHTML = suggestions.map(s => `
    <div class="suggestion-item">
      <h5>${s.title}</h5>
      <p>${s.message}</p>
      <button class="btn btn-secondary" style="margin-top:0.5rem;font-size:0.85rem" onclick="startPractice('${s.topicId}')">
        Ôn ngay →
      </button>
    </div>
  `).join("");
}

function renderPracticeTopics() {
  const placeholder = document.getElementById("moto-practice-placeholder");
  const grid = document.getElementById("topics-grid");

  if (placeholder) placeholder.style.display = "none";
  if (grid) grid.style.display = "";

  ensureBankReady().then(() => {
    const topics = getActiveTopics();
    grid.innerHTML = topics.map(topic => {
      const acc = getTopicAccuracy(topic.id);
      const pct = acc !== null ? acc : 0;
      const count = typeof getQuestionsByTopic === "function"
        ? getQuestionsByTopic(topic.id).length
        : (topic.questionCount || 0);
      return `
      <div class="topic-card" onclick="startPractice('${topic.id}')">
        <div class="chapter">${topic.chapter}</div>
        <h4>${topic.title}</h4>
        <p style="font-size:0.85rem;color:var(--text-muted)">${topic.description}</p>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="meta">
          <span>${acc !== null ? acc + "% chính xác" : "Chưa ôn"}</span>
          <span>${count} câu</span>
        </div>
      </div>`;
    }).join("");
  });
}

function startPractice(topicId) {
  AppState.practice = { topicId, question: null, answered: false, mode: "mixed" };
  document.querySelectorAll("#module-nav .nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('#module-nav [data-view="practice"]').classList.add("active");
  showView("practice");
  showPracticeSession();
  loadNextPracticeQuestion();
}

function showPracticeSession() {
  const topic = getTopicByIdActive(AppState.practice.topicId);
  document.getElementById("practice-topics-panel").style.display = "none";
  document.getElementById("practice-session-panel").style.display = "block";
  document.getElementById("practice-topic-title").textContent = topic?.title || "";
}

function backToTopics() {
  document.getElementById("practice-topics-panel").style.display = "block";
  document.getElementById("practice-session-panel").style.display = "none";
  AppState.practice.answered = false;
}

async function loadNextPracticeQuestion() {
  AppState.practice.answered = false;
  await ensureBankReady();
  const { topicId, mode } = AppState.practice;
  showLoading("Đang tạo câu hỏi...");

  let question = null;
  const useAI = loadAIConfig().enabled;

  if (mode === "sahinh") {
    const pool = getQuestionsByTopic(topicId).filter(q => q.type === "sahinh");
    question = pool.length
      ? pool[Math.floor(Math.random() * pool.length)]
      : getRandomSaHinhQuestions(1)[0];
  } else {
    const wantEssay = mode === "essay" || (mode === "mixed" && Math.random() > 0.75);
    const wantSaHinh = mode === "mixed" && !wantEssay && Math.random() > 0.85;

    if (useAI && !wantSaHinh) {
      question = await generateAIQuestion(topicId, wantEssay ? "essay" : "mcq");
    }

    if (!question) {
      const pool = getQuestionsByTopic(topicId);
      if (pool.length === 0) {
        hideLoading();
        toast("Không có câu hỏi cho chủ đề này", "error");
        return;
      }
      if (wantSaHinh) {
        const sh = pool.filter(q => q.type === "sahinh");
        question = sh.length ? sh[Math.floor(Math.random() * sh.length)] : pool[Math.floor(Math.random() * pool.length)];
      } else if (wantEssay) {
        const essays = pool.filter(q => q.type === "essay");
        question = essays.length ? essays[Math.floor(Math.random() * essays.length)] : pool[Math.floor(Math.random() * pool.length)];
      } else {
        const mcqs = pool.filter(q => q.type === "mcq" || q.type === "sahinh");
        question = mcqs.length ? mcqs[Math.floor(Math.random() * mcqs.length)] : pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }

  hideLoading();
  AppState.practice.question = question;
  renderPracticeQuestion(question);
}

function renderPracticeQuestion(q) {
  const container = document.getElementById("question-container");
  const isMcq = isMcqLike(q);

  let html = `
    <div class="question-box">
      <span class="q-type ${q.type === "essay" ? "essay" : q.type === "sahinh" ? "sahinh" : ""}">${getQuestionTypeLabel(q)}</span>
      ${q.critical ? '<span class="q-type" style="background:var(--danger);margin-left:0.5rem">Điểm liệt</span>' : ""}
      ${q.num ? `<span style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:0.5rem">Câu ${q.num} / ${isMotoMode() ? "250" : "600"}</span>` : ""}
      ${renderQuestionImage(q)}
      <p class="q-text">${escapeHtml(q.text)}</p>`;

  if (isMcq) {
    html += '<ul class="options-list">';
    q.options.forEach((opt, i) => {
      html += `<li><button class="option-btn" data-index="${i}" onclick="selectOption(${i})">${escapeHtml(opt)}</button></li>`;
    });
    html += "</ul>";
  } else {
    html += `<div class="form-group">
      <textarea id="essay-answer" placeholder="Nhập câu trả lời của bạn..."></textarea>
    </div>`;
  }

  html += `</div>
    <div id="answer-actions" class="btn-group">
      <button class="btn btn-primary" onclick="submitPracticeAnswer()">${isMcq ? "Kiểm tra đáp án" : "Nộp bài"}</button>
      <button class="btn btn-secondary" onclick="loadNextPracticeQuestion()">Câu tiếp theo</button>
    </div>
    <div id="explanation-area"></div>`;

  container.innerHTML = html;
  bindQuestionImages(container);
}

let selectedOption = null;

function selectOption(index) {
  if (AppState.practice.answered) return;
  selectedOption = index;
  document.querySelectorAll(".option-btn").forEach((btn, i) => {
    btn.classList.toggle("selected", i === index);
  });
}

function renderExplanationBox(isCorrect, question, selectedIndex, explanation, extraHtml = "") {
  const isMcq = question.type === "mcq" || question.type === "sahinh";
  const correctLetter = isMcq ? getOptionLetter(question.correct) : "";
  const correctText = isMcq ? stripOptionPrefix(question.options[question.correct]) : "";
  const chosenLetter = isMcq && selectedIndex != null ? getOptionLetter(selectedIndex) : "";
  const chosenText = isMcq && selectedIndex != null ? stripOptionPrefix(question.options[selectedIndex]) : "";
  const paragraphs = (explanation || "")
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p>${escapeHtml(p)}</p>`)
    .join("");

  let compareHtml = "";
  if (isMcq && !isCorrect && selectedIndex != null) {
    compareHtml = `
      <div class="explanation-compare">
        <p class="explanation-your"><span>Bạn chọn:</span> ${escapeHtml(chosenLetter)}. ${escapeHtml(chosenText)}</p>
        <p class="explanation-correct"><span>Đáp án đúng:</span> ${escapeHtml(correctLetter)}. ${escapeHtml(correctText)}</p>
      </div>`;
  } else if (isMcq && isCorrect) {
    compareHtml = `
      <p class="explanation-correct"><span>Đáp án đúng:</span> ${escapeHtml(correctLetter)}. ${escapeHtml(correctText)}</p>`;
  }

  return `
    <div class="explanation-box ${isCorrect ? "explanation-box--correct" : "explanation-box--wrong"}">
      <h4>${isCorrect ? "✅ Chính xác!" : "❌ Chưa đúng — xem giải thích chi tiết"}</h4>
      ${compareHtml}
      <div class="explanation-detail">
        <strong>Giải thích</strong>
        ${extraHtml}
        ${paragraphs || "<p>Đáp án đúng đã được đánh dấu màu xanh ở trên.</p>"}
      </div>
    </div>`;
}

async function submitPracticeAnswer() {
  if (AppState.practice.answered) return;
  const q = AppState.practice.question;
  if (!q) return;

  showLoading("Đang chấm bài...");
  let isCorrect = false;
  let explanation = q.explanation;
  let extraHtml = "";

  if (q.type === "mcq" || q.type === "sahinh") {
    if (selectedOption === null) {
      hideLoading();
      toast("Vui lòng chọn đáp án", "error");
      return;
    }
    isCorrect = selectedOption === q.correct;
    document.querySelectorAll(".option-btn").forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correct) btn.classList.add("correct");
      else if (i === selectedOption && !isCorrect) btn.classList.add("wrong");
    });
    explanation = await getAIExplanation(q, selectedOption, isCorrect);
  } else {
    const answer = document.getElementById("essay-answer")?.value?.trim();
    if (!answer) {
      hideLoading();
      toast("Vui lòng nhập câu trả lời", "error");
      return;
    }
    const result = await gradeEssayAnswer(q, answer);
    isCorrect = result.isCorrect;
    explanation = result.explanation;
    extraHtml = `
      <p><strong>Điểm:</strong> ${result.score}/100</p>
      <p><strong>Nhận xét:</strong> ${escapeHtml(result.feedback)}</p>
      ${result.missingPoints?.length ? `<p><strong>Cần bổ sung:</strong> ${result.missingPoints.map(escapeHtml).join("; ")}</p>` : ""}
      ${q.sampleAnswer ? `<p><strong>Đáp án mẫu:</strong> ${escapeHtml(q.sampleAnswer)}</p>` : ""}`;
    document.getElementById("essay-answer").disabled = true;
  }

  recordAnswer(q.topicId, isCorrect, q.type);
  AppState.practice.answered = true;
  hideLoading();

  document.getElementById("explanation-area").innerHTML =
    renderExplanationBox(
      isCorrect,
      q,
      q.type === "mcq" || q.type === "sahinh" ? selectedOption : null,
      explanation,
      extraHtml
    );

  toast(isCorrect ? "Trả lời đúng!" : "Hãy xem giải thích bên dưới", isCorrect ? "success" : "error");
  selectedOption = null;
}

function setPracticeMode(mode) {
  AppState.practice.mode = mode;
  document.querySelectorAll(".mode-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.mode === mode);
  });
}

function renderExamSetup() {
  if (AppState.exam.active) return;
  document.getElementById("exam-setup-panel").style.display = "block";
  document.getElementById("exam-session-panel").style.display = "none";
  document.getElementById("exam-result-panel").style.display = "none";
  const otoSetup = document.getElementById("exam-setup-oto");
  const motoSetup = document.getElementById("exam-setup-moto");
  if (otoSetup) otoSetup.style.display = isOtoMode() ? "block" : "none";
  if (motoSetup) motoSetup.style.display = isMotoMode() ? "block" : "none";
}

function startExam() {
  const duration = getExamDurationMinutes();

  ensureBankReady().then(() => {
    AppState.exam = {
      active: true,
      questions: isOfficialBank() ? buildExamPaper() : getRandomQuestions(getExamQuestionCount()),
      currentIndex: 0,
      answers: {},
      startTime: Date.now(),
      durationMinutes: duration,
      timerInterval: null
    };

    preloadQuestionImages(AppState.exam.questions);

    document.getElementById("exam-setup-panel").style.display = "none";
    document.getElementById("exam-session-panel").style.display = "block";
    document.getElementById("exam-result-panel").style.display = "none";

    startExamTimer();
    renderExamQuestion();
  });
}

function startExamTimer() {
  const totalMs = AppState.exam.durationMinutes * 60 * 1000;
  const timerEl = document.getElementById("exam-timer");

  AppState.exam.timerInterval = setInterval(() => {
    const elapsed = Date.now() - AppState.exam.startTime;
    const remaining = Math.max(0, totalMs - elapsed);
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    timerEl.className = "time" + (remaining < 300000 ? (remaining < 60000 ? " danger" : " warning") : "");

    if (remaining <= 0) finishExam();
  }, 1000);
}

function renderExamQuestion() {
  const { questions, currentIndex, answers } = AppState.exam;
  const q = questions[currentIndex];
  if (!q) return;

  document.getElementById("exam-progress-text").textContent =
    `Câu ${currentIndex + 1} / ${questions.length}`;

  const container = document.getElementById("exam-question-container");
  const saved = answers[currentIndex];

  let html = `<div class="question-box">
    <span class="q-type ${q.type === "sahinh" ? "sahinh" : q.type === "essay" ? "essay" : ""}">${getQuestionTypeLabel(q)}</span>
    ${q.critical ? '<span class="q-type" style="background:var(--danger);margin-left:0.5rem">Điểm liệt</span>' : ""}
    ${q.num ? `<span style="font-size:0.8rem;color:var(--text-muted);display:block;margin-bottom:0.5rem">Câu ${q.num} / ${isMotoMode() ? "250" : "600"}</span>` : ""}
    ${renderQuestionImage(q)}
    <p class="q-text">${escapeHtml(q.text)}</p>`;

  if (q.type === "mcq" || q.type === "sahinh") {
    html += '<ul class="options-list">';
    q.options.forEach((opt, i) => {
      const sel = saved === i ? "selected" : "";
      html += `<li><button class="option-btn ${sel}" onclick="saveExamAnswer(${i})">${escapeHtml(opt)}</button></li>`;
    });
    html += "</ul>";
  } else {
    html += `<div class="form-group">
      <textarea id="exam-essay-answer" placeholder="Nhập câu trả lời..." onchange="saveExamEssay()">${saved || ""}</textarea>
    </div>`;
  }
  html += "</div>";

  container.innerHTML = html;
  bindQuestionImages(container);

  document.getElementById("btn-exam-prev").disabled = currentIndex === 0;
  document.getElementById("btn-exam-next").textContent =
    currentIndex === questions.length - 1 ? "Nộp bài" : "Câu sau →";
}

function saveExamAnswer(index) {
  AppState.exam.answers[AppState.exam.currentIndex] = index;
  document.querySelectorAll(".option-btn").forEach((btn, i) => {
    btn.classList.toggle("selected", i === index);
  });
}

function saveExamEssay() {
  const val = document.getElementById("exam-essay-answer")?.value;
  AppState.exam.answers[AppState.exam.currentIndex] = val;
}

function examPrev() {
  if (AppState.exam.currentIndex > 0) {
    AppState.exam.currentIndex--;
    renderExamQuestion();
  }
}

function examNext() {
  const { currentIndex, questions } = AppState.exam;
  if (currentIndex < questions.length - 1) {
    AppState.exam.currentIndex++;
    renderExamQuestion();
  } else {
    if (confirm("Nộp bài thi?")) finishExam();
  }
}

async function finishExam() {
  clearInterval(AppState.exam.timerInterval);
  AppState.exam.active = false;

  const { questions, answers, durationMinutes, startTime } = AppState.exam;
  let correct = 0;
  const topicResults = {};

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!topicResults[q.topicId]) topicResults[q.topicId] = { correct: 0, total: 0 };
    topicResults[q.topicId].total++;

    if (q.type === "mcq" || q.type === "sahinh") {
      const isCorrect = answers[i] === q.correct;
      if (isCorrect) { correct++; topicResults[q.topicId].correct++; }
      recordAnswer(q.topicId, isCorrect, "mcq");
    } else {
      const ans = answers[i] || "";
      const result = await gradeEssayAnswer(q, ans);
      if (result.isCorrect) { correct++; topicResults[q.topicId].correct++; }
      recordAnswer(q.topicId, result.isCorrect, "essay");
    }
  }

  const total = questions.length;
  const scorePct = Math.round((correct / total) * 100);
  const passScore = getExamPassScore(total);

  let criticalFailed = false;
  let criticalQuestion = null;
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].critical) {
      criticalQuestion = questions[i];
      const ans = answers[i];
      if (ans !== questions[i].correct) criticalFailed = true;
      break;
    }
  }

  const passed = correct >= passScore && !criticalFailed;

  const weakTopics = Object.entries(topicResults)
    .map(([id, r]) => ({ topicId: id, accuracy: r.correct / r.total }))
    .filter(w => w.accuracy < 0.7)
    .sort((a, b) => a.accuracy - b.accuracy);

  const elapsed = Math.round((Date.now() - startTime) / 60000);
  recordExamResult(correct, total, passed, elapsed, weakTopics);

  document.getElementById("exam-session-panel").style.display = "none";
  document.getElementById("exam-result-panel").style.display = "block";

  document.getElementById("exam-result-content").innerHTML = `
    <div class="result-summary">
      <div class="score-circle ${passed ? "pass" : "fail"}">
        <span class="score-value">${correct}/${total}</span>
        <span class="score-label">${scorePct}%</span>
      </div>
      <h3>${passed ? "🎉 ĐẠT — Chúc mừng!" : "📚 Chưa đạt — Cố gắng thêm nhé!"}</h3>
      ${criticalFailed ? `<p style="color:var(--danger);font-weight:600;margin:0.75rem 0">⚠️ Trả lời sai câu điểm liệt — bài thi không đạt dù các câu khác đúng.</p>` : ""}
      <p style="color:var(--text-muted);margin:1rem 0">
        ${isOfficialBank()
          ? (isMotoMode()
            ? `Thi thật hạng A1: 25 câu / 19 phút / đạt ${passScore}/25. Có 1 câu điểm liệt trong đề.`
            : `Thi thật hạng B: 30 câu / 20 phút / đạt ${passScore}/30. Có 1 câu điểm liệt trong đề.`)
          : `Điểm chuẩn: ${passScore}/${total} câu. Thời gian: ${elapsed} phút / ${durationMinutes} phút.`}
      </p>
      ${weakTopics.length ? `
        <div class="card" style="text-align:left;margin-top:1.5rem">
          <h3>📌 Chủ đề cần ôn thêm</h3>
          <ul class="weak-topics-list">
            ${weakTopics.map(w => {
              const t = getTopicByIdActive(w.topicId);
              return `<li><span>${t?.title}</span><span class="weak-badge">${Math.round(w.accuracy * 100)}%</span></li>`;
            }).join("")}
          </ul>
        </div>` : ""}
      <div class="btn-group" style="justify-content:center;margin-top:1.5rem">
        <button class="btn btn-primary" onclick="renderExamSetup();showView('exam')">Thi lại</button>
        <button class="btn btn-secondary" onclick="showView('home')">Về trang chủ</button>
      </div>
    </div>`;
}

function renderStats() {
  const progress = loadProgress();
  const stats = getOverallStats();

  document.getElementById("stats-overview").innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="value">${stats.totalQuestions}</div><div class="label">Tổng câu đã làm</div></div>
      <div class="stat-card"><div class="value">${stats.accuracy}%</div><div class="label">Tỷ lệ đúng</div></div>
      <div class="stat-card"><div class="value">${stats.streak}</div><div class="label">Chuỗi đúng liên tiếp</div></div>
      <div class="stat-card"><div class="value">${stats.examsPassed}/${stats.examsTaken}</div><div class="label">Thi đạt/Tổng</div></div>
    </div>`;

  const topicStats = document.getElementById("topic-stats-list");
  const topics = getActiveTopics();
  topicStats.innerHTML = topics.map(topic => {
    const t = progress.topics[topic.id] || { correct: 0, wrong: 0, total: 0 };
    const acc = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
    return `
      <div class="topic-card" style="cursor:default">
        <h4>${topic.title}</h4>
        <div class="progress-bar"><div class="progress-fill" style="width:${acc}%"></div></div>
        <div class="meta">
          <span>${t.total} câu · ${acc}% đúng</span>
          <span>${t.wrong} sai</span>
        </div>
      </div>`;
  }).join("");

  const history = document.getElementById("exam-history-list");
  if (progress.examHistory.length === 0) {
    history.innerHTML = '<p class="empty-state">Chưa có lịch sử thi giả lập</p>';
  } else {
    history.innerHTML = progress.examHistory.map(e => {
      const date = new Date(e.date).toLocaleDateString("vi-VN");
      return `<div class="suggestion-item" style="border-color:${e.passed ? "var(--success)" : "var(--danger)"}">
        <h5>${date} — ${e.score}/${e.total} ${e.passed ? "✅ Đạt" : "❌ Chưa đạt"}</h5>
        <p>Thời gian: ${e.durationMinutes} phút</p>
      </div>`;
    }).join("");
  }
}

function loadSaHinhQuestion() {
  ensureBankReady().then(() => {
    AppState.sahinh.answered = false;
    AppState.sahinh.selected = null;
    const questions = getRandomSaHinhQuestions(1);
    if (!questions.length) {
      document.getElementById("sahinh-container").innerHTML = '<p class="empty-state">Chua co cau sa hinh</p>';
      return;
    }
    AppState.sahinh.question = questions[0];
    renderSaHinhQuestion(questions[0]);
    document.getElementById("sahinh-explanation").innerHTML = "";
  });
}

function renderSaHinhQuestion(q) {
  const container = document.getElementById("sahinh-container");
  container.innerHTML = `
    <div class="question-box">
      <span class="q-type sahinh">Sa hình</span>
      ${renderQuestionImage(q)}
      <p class="q-text">${escapeHtml(q.text)}</p>
      <ul class="options-list">
        ${q.options.map((opt, i) =>
          `<li><button class="option-btn" onclick="selectSaHinhOption(${i})">${escapeHtml(opt)}</button></li>`
        ).join("")}
      </ul>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="submitSaHinhAnswer()">Kiểm tra đáp án</button>
    </div>`;
  bindQuestionImages(container);
}

function selectSaHinhOption(index) {
  if (AppState.sahinh.answered) return;
  AppState.sahinh.selected = index;
  document.querySelectorAll("#sahinh-container .option-btn").forEach((btn, i) => {
    btn.classList.toggle("selected", i === index);
  });
}

async function submitSaHinhAnswer() {
  const q = AppState.sahinh.question;
  if (!q || AppState.sahinh.answered) return;
  if (AppState.sahinh.selected === null) return toast("Vui lòng chọn đáp án", "error");

  showLoading("Đang chấm bài...");
  const selected = AppState.sahinh.selected;
  const isCorrect = selected === q.correct;
  AppState.sahinh.answered = true;

  document.querySelectorAll("#sahinh-container .option-btn").forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add("correct");
    else if (i === selected && !isCorrect) btn.classList.add("wrong");
  });

  const explanation = await getAIExplanation(q, selected, isCorrect);
  hideLoading();
  recordAnswer(q.topicId, isCorrect, "sahinh");

  document.getElementById("sahinh-explanation").innerHTML =
    renderExplanationBox(isCorrect, q, selected, explanation);
  toast(isCorrect ? "Trả lời đúng!" : "Xem giải thích bên dưới", isCorrect ? "success" : "error");
}

function showLoading(msg = "Đang xử lý...") {
  const overlay = document.getElementById("loading-overlay");
  document.getElementById("loading-text").textContent = msg;
  overlay.classList.add("show");
}

function hideLoading() {
  document.getElementById("loading-overlay").classList.remove("show");
}

function toast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.startPractice = startPractice;
window.enterModule = enterModule;
window.exitToLanding = exitToLanding;
window.backToTopics = backToTopics;
window.loadNextPracticeQuestion = loadNextPracticeQuestion;
window.selectOption = selectOption;
window.submitPracticeAnswer = submitPracticeAnswer;
window.setPracticeMode = setPracticeMode;
window.startExam = startExam;
window.saveExamAnswer = saveExamAnswer;
window.saveExamEssay = saveExamEssay;
window.examPrev = examPrev;
window.examNext = examNext;
window.showView = showView;
window.renderExamSetup = renderExamSetup;
window.loadSaHinhQuestion = loadSaHinhQuestion;
window.selectSaHinhOption = selectSaHinhOption;
window.submitSaHinhAnswer = submitSaHinhAnswer;
