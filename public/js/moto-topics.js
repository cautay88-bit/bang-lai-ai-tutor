/** Chủ đề A1 — theo Phụ lục I Công văn 2262/CSGT-P5 */
const MOTO_TOPICS = [
  {
    id: "m-ch1-quy-dinh-chung",
    chapter: "Chương I",
    title: "Quy định chung và quy tắc giao thông đường bộ",
    description: "Khái niệm, quy tắc cơ bản khi điều khiển xe mô tô",
    questionCount: 100,
    keywords: ["quy tắc", "mô tô", "làn đường", "tốc độ", "nhường đường"]
  },
  {
    id: "m-ch2-van-hoa-giao-thong",
    chapter: "Chương II",
    title: "Văn hóa giao thông & đạo đức người lái xe",
    description: "Đạo đức, văn hóa ứng xử, phòng cháy chữa cháy",
    questionCount: 10,
    keywords: ["văn hóa", "đạo đức", "an toàn"]
  },
  {
    id: "m-ch3-ky-thuat-lai-xe",
    chapter: "Chương III",
    title: "Kỹ thuật lái xe mô tô",
    description: "Kỹ năng điều khiển, dừng xe, đi ban đêm",
    questionCount: 15,
    keywords: ["kỹ thuật", "lái xe", "phanh", "ban đêm"]
  },
  {
    id: "m-ch4-bao-hieu-duong-bo",
    chapter: "Chương IV",
    title: "Báo hiệu đường bộ",
    description: "Biển báo, vạch kẻ, đèn tín hiệu",
    questionCount: 90,
    keywords: ["biển báo", "vạch kẻ", "đèn tín hiệu"]
  },
  {
    id: "m-ch5-sa-hinh",
    chapter: "Chương V",
    title: "Giải thế sa hình & xử lý tình huống",
    description: "Phân tích tình huống giao thông qua hình vẽ",
    questionCount: 35,
    keywords: ["sa hình", "tình huống", "an toàn"]
  }
];

function getMotoTopicById(id) {
  return MOTO_TOPICS.find(t => t.id === id);
}

function getAllMotoTopicIds() {
  return MOTO_TOPICS.map(t => t.id);
}

function getActiveTopics() {
  return isMotoMode() ? MOTO_TOPICS : TOPICS;
}

function getTopicByIdActive(id) {
  return isMotoMode() ? getMotoTopicById(id) : getTopicById(id);
}

function getAllTopicIdsActive() {
  return isMotoMode() ? getAllMotoTopicIds() : getAllTopicIds();
}
