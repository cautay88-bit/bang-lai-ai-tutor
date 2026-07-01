const AI_CONFIG_KEY = "bang-lai-ai-config";

function loadAIConfig() {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { apiKey: "", provider: "openai", model: "gpt-4o-mini", enabled: false };
}

function saveAIConfig(config) {
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
}

async function callAI(messages, options = {}) {
  const config = loadAIConfig();
  if (!config.enabled || !config.apiKey) {
    return null;
  }

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      provider: config.provider,
      model: config.model,
      apiKey: config.apiKey,
      ...options
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Lỗi kết nối AI");
  }

  const data = await res.json();
  return data.content;
}

async function generateAIQuestion(topicId, type = "mcq") {
  const topic = getTopicById(topicId);
  if (!topic) return null;

  const typeLabel = type === "mcq" ? "trắc nghiệm 4 đáp án A B C D" : "tự luận ngắn";
  const prompt = `Bạn là gia sư AI ôn thi bằng lái xe ô tô Việt Nam (bộ 600 câu).
Tạo 1 câu hỏi ${typeLabel} về chủ đề: "${topic.title}".
Từ khóa: ${topic.keywords.join(", ")}.

Trả về JSON thuần (không markdown), format:
${type === "mcq" ? `{
  "type": "mcq",
  "text": "nội dung câu hỏi",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct": 0,
  "explanation": "giải thích dễ hiểu"
}` : `{
  "type": "essay",
  "text": "nội dung câu hỏi",
  "sampleAnswer": "đáp án mẫu",
  "explanation": "giải thích dễ hiểu"
}`}`;

  try {
    const content = await callAI([
      { role: "system", content: "Bạn là chuyên gia giáo dục giao thông Việt Nam. Trả lời bằng tiếng Việt, JSON hợp lệ." },
      { role: "user", content: prompt }
    ]);
    if (!content) return null;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const q = JSON.parse(jsonMatch[0]);
    q.topicId = topicId;
    q.id = "ai-" + Date.now();
    return q;
  } catch (e) {
    console.warn("AI question failed:", e);
    return null;
  }
}

function stripOptionPrefix(opt) {
  return (opt || "").replace(/^[A-D]\.\s*/, "").trim();
}

function getOptionLetter(index) {
  return ["A", "B", "C", "D"][index] || String.fromCharCode(65 + index);
}

function buildLocalMcqExplanation(question, selectedIndex, isCorrect) {
  const ci = question.correct;
  const correctLetter = getOptionLetter(ci);
  const correctText = stripOptionPrefix(question.options[ci]);
  const parts = [];

  if (!isCorrect && selectedIndex != null && selectedIndex !== ci) {
    const chosenLetter = getOptionLetter(selectedIndex);
    const chosenText = stripOptionPrefix(question.options[selectedIndex]);
    parts.push(
      `Bạn đã chọn đáp án ${chosenLetter}: «${chosenText}». Đáp án này chưa phù hợp với tình huống mà câu hỏi đang hỏi.`
    );
  }

  parts.push(
    `Đối với trường hợp này, câu trả lời đúng phải là ${correctLetter}: «${correctText}» — vì vậy đáp án ${correctLetter} mới là lựa chọn chính xác.`
  );

  if (question.explanation?.trim()) {
    parts.push(question.explanation.trim());
  } else {
    parts.push(
      `Cần đọc kỹ các từ khóa trong đề bài (loại phương tiện, điều kiện đường, tốc độ, khu vực, thời gian…), sau đó đối chiếu từng đáp án với quy định tại Luật Giao thông đường bộ và bộ câu hỏi chính thức (Công văn 2262/CSGT-P5). Các phương án còn lại mô tả nhóm xe hoặc quy tắc khác, không khớp hoàn toàn với yêu cầu cụ thể của câu hỏi.`
    );

    const others = question.options
      .map((opt, i) => ({ i, letter: getOptionLetter(i), text: stripOptionPrefix(opt) }))
      .filter(({ i }) => i !== ci);

    if (!isCorrect && others.length) {
      const brief = others
        .slice(0, 2)
        .map(({ letter, text }) => `đáp án ${letter} («${text.slice(0, 80)}${text.length > 80 ? "…" : ""}»)`)
        .join(" và ");
      parts.push(`Lưu ý: ${brief} không đáp ứng đúng điều kiện đã nêu trong câu hỏi, nên cần loại trừ khi chọn đáp án.`);
    }
  }

  if (isCorrect) {
    parts.push("Bạn đã chọn đúng. Hãy ghi nhớ quy định này để áp dụng khi ôn tập và khi thi thật.");
  } else {
    parts.push("Gợi ý ôn tập: Sau khi xem giải thích, hãy tìm lại câu hỏi cùng chủ đề trong mục Ôn theo chương để củng cố kiến thức.");
  }

  return parts.join("\n\n");
}

async function gradeEssayAnswer(question, userAnswer) {
  const config = loadAIConfig();
  if (!config.enabled || !config.apiKey) {
    return gradeEssayLocally(question, userAnswer);
  }

  const prompt = `Chấm câu trả lời tự luận ôn thi bằng lái xe Việt Nam.

Câu hỏi: ${question.text}
Đáp án mẫu: ${question.sampleAnswer || question.explanation}
Câu trả lời học viên: ${userAnswer}

Trả về JSON:
{
  "score": 0-100,
  "isCorrect": true/false (>=60 là đúng),
  "feedback": "nhận xét ngắn gọn",
  "explanation": "giải thích chi tiết, dễ hiểu",
  "missingPoints": ["điểm thiếu 1", "điểm thiếu 2"]
}`;

  try {
    const content = await callAI([
      { role: "system", content: "Chấm điểm công bằng, giải thích dễ hiểu bằng tiếng Việt. JSON hợp lệ." },
      { role: "user", content: prompt }
    ]);
    if (!content) return gradeEssayLocally(question, userAnswer);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return gradeEssayLocally(question, userAnswer);
    return JSON.parse(jsonMatch[0]);
  } catch (_) {
    return gradeEssayLocally(question, userAnswer);
  }
}

function gradeEssayLocally(question, userAnswer) {
  const sample = (question.sampleAnswer || question.explanation || "").toLowerCase();
  const answer = userAnswer.toLowerCase().trim();
  if (answer.length < 20) {
    return {
      score: 20,
      isCorrect: false,
      feedback: "Câu trả lời quá ngắn. Hãy trình bày đầy đủ hơn.",
      explanation: question.explanation || question.sampleAnswer,
      missingPoints: ["Cần nêu đủ các ý chính trong đáp án"]
    };
  }

  const keywords = sample.split(/[,\s;.()]+/).filter(w => w.length > 4);
  const matched = keywords.filter(kw => answer.includes(kw)).length;
  const ratio = keywords.length > 0 ? matched / keywords.length : 0.5;
  const score = Math.min(100, Math.round(40 + ratio * 60));

  return {
    score,
    isCorrect: score >= 60,
    feedback: score >= 60
      ? "Bạn nắm được các ý chính. Xem giải thích để hoàn thiện thêm."
      : "Còn thiếu một số ý quan trọng. Hãy xem đáp án mẫu bên dưới.",
    explanation: question.explanation || question.sampleAnswer,
    missingPoints: score < 80 ? ["Xem đáp án mẫu để bổ sung kiến thức"] : []
  };
}

async function getAIExplanation(question, selectedIndex, isCorrect) {
  const userAnswer = selectedIndex != null ? question.options[selectedIndex] : "";
  const local = buildLocalMcqExplanation(question, selectedIndex, isCorrect);
  const config = loadAIConfig();
  if (!config.enabled || !config.apiKey) {
    return local;
  }

  const prompt = `Giải thích đáp án câu hỏi thi bằng lái xe bằng ngôn ngữ dễ hiểu cho người mới học.

Câu hỏi: ${question.text}
${question.type === "mcq" || question.type === "sahinh" ? `Đáp án đúng: ${question.options[question.correct]}` : ""}
Học viên trả lời: ${userAnswer || "(chưa trả lời)"}
Kết quả: ${isCorrect ? "Đúng" : "Sai"}

Viết 2-3 đoạn ngắn giải thích:
- Nếu sai: nêu rõ vì sao đáp án học viên chọn chưa đúng, và tại sao đáp án đúng mới phù hợp với tình huống trong câu hỏi.
- Nếu đúng: khẳng định và bổ sung mẹo nhớ, lưu ý khi lái xe thực tế.`;

  try {
    const content = await callAI([
      { role: "system", content: "Giải thích dễ hiểu, thân thiện, tiếng Việt." },
      { role: "user", content: prompt }
    ]);
    return (content && content.trim()) || local;
  } catch (_) {
    return local;
  }
}

async function getPersonalizedStudyPlan() {
  const weak = getWeakTopics(3);
  const config = loadAIConfig();
  if (!config.enabled || !config.apiKey || weak.length === 0) {
    return getStudySuggestions();
  }

  const weakDesc = weak.map(w => {
    const t = getTopicByIdActive(w.topicId);
    return `${t?.title}: ${Math.round(w.accuracy * 100)}% đúng`;
  }).join("; ");

  try {
    const content = await callAI([
      { role: "system", content: "Tư vấn lộ trình ôn thi bằng lái xe, tiếng Việt, JSON array." },
      { role: "user", content: `Học viên yếu ở: ${weakDesc}. Trả về JSON array:
[{"topicId":"...", "title":"...", "message":"đề xuất cụ thể", "keywords":["..."]}]` }
    ]);
    if (!content) return getStudySuggestions();
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return getStudySuggestions();
    return JSON.parse(jsonMatch[0]);
  } catch (_) {
    return getStudySuggestions();
  }
}

async function checkAIConnection() {
  const config = loadAIConfig();
  if (!config.apiKey) return { ok: false, message: "Chưa nhập API key" };
  try {
    await callAI([{ role: "user", content: "Trả lời: OK" }]);
    return { ok: true, message: "Kết nối AI thành công!" };
  } catch (e) {
    return { ok: false, message: e.message };
  }
}
