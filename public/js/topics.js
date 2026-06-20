const TOPICS = [
  {
    id: "ch1-quy-dinh-chung",
    chapter: "Chương I",
    title: "Quy định chung và quy tắc giao thông đường bộ",
    description: "Khái niệm, phạm vi điều chỉnh, quy tắc cơ bản khi tham gia giao thông",
    keywords: ["quy tắc giao thông", "làn đường", "nhường đường", "tốc độ", "dừng xe"]
  },
  {
    id: "ch2-van-hoa-giao-thong",
    chapter: "Chương II",
    title: "Văn hóa giao thông, đạo đức người lái xe",
    description: "Đạo đức, văn hóa ứng xử và trách nhiệm của người lái xe",
    keywords: ["văn hóa giao thông", "đạo đức", "trách nhiệm", "an toàn", "cộng đồng"]
  },
  {
    id: "ch3-ky-thuat-lai-xe",
    chapter: "Chương III",
    title: "Kỹ thuật lái xe",
    description: "Kỹ năng khởi hành, dừng xe, đi đường dốc, đi ban đêm, đi đường cao tốc",
    keywords: ["khởi hành", "dừng xe", "đi dốc", "ban đêm", "cao tốc", "khoảng cách"]
  },
  {
    id: "ch4-cau-tao-sua-chua",
    chapter: "Chương IV",
    title: "Cấu tạo và sửa chữa",
    description: "Hệ thống động cơ, phanh, lái, điện và bảo dưỡng xe ô tô",
    keywords: ["động cơ", "phanh", "lái", "ắc quy", "bảo dưỡng", "cấu tạo"]
  },
  {
    id: "ch5-bao-hieu-duong-bo",
    chapter: "Chương V",
    title: "Báo hiệu đường bộ",
    description: "Biển báo hiệu, vạch kẻ đường, đèn tín hiệu giao thông",
    keywords: ["biển báo", "vạch kẻ", "đèn tín hiệu", "cấm", "nguy hiểm", "hiệu lệnh"]
  },
  {
    id: "ch6-sa-hinh",
    chapter: "Chương VI",
    title: "Giải thế sa hình và kỹ năng xử lý tình huống",
    description: "Phân tích tình huống giao thông, chọn hành vi đúng trong sa hình",
    keywords: ["sa hình", "tình huống", "nhường đường", "ưu tiên", "an toàn"]
  }
];

function getTopicById(id) {
  return TOPICS.find(t => t.id === id);
}

function getAllTopicIds() {
  return TOPICS.map(t => t.id);
}
