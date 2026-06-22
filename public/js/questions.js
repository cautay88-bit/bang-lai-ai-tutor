const QUESTION_BANK = [
  {
    id: "q001",
    topicId: "ch1-quy-dinh-chung",
    type: "mcq",
    text: "Khái niệm về phương tiện giao thông đường bộ theo Luật Giao thông đường bộ bao gồm những loại nào?",
    options: [
      "A. Chỉ xe ô tô và xe máy",
      "B. Xe cơ giới, xe máy chuyên dùng, xe thô sơ và các loại xe tương tự",
      "C. Chỉ phương tiện có động cơ",
      "D. Xe ô tô, xe tải và xe khách"
    ],
    correct: 1,
    explanation: "Theo Luật Giao thông đường bộ, phương tiện giao thông đường bộ bao gồm xe cơ giới, xe máy chuyên dùng, xe thô sơ và các loại xe tương tự. Đây là khái niệm cơ bản cần nắm vững trước khi thi."
  },
  {
    id: "q002",
    topicId: "ch1-quy-dinh-chung",
    type: "mcq",
    text: "Người lái xe phải giảm tốc độ và cho xe đi từng bên một vượt qua cầu hẹp có mấy làn xe khi có xe đi ngược chiều?",
    options: [
      "A. Một làn xe",
      "B. Hai làn xe trở lên",
      "C. Ba làn xe",
      "D. Không cần giảm tốc độ"
    ],
    correct: 0,
    explanation: "Trên cầu hẹp chỉ có một làn xe, khi có xe đi ngược chiều, người lái phải giảm tốc độ và cho xe đi từng bên một để đảm bảo an toàn. Đây là quy tắc nhường đường quan trọng."
  },
  {
    id: "q003",
    topicId: "ch1-quy-dinh-chung",
    type: "mcq",
    text: "Tốc độ tối đa cho phép của xe ô tô con trên đường cao tốc (trừ khu vực có biển báo khác) là bao nhiêu?",
    options: [
      "A. 80 km/h",
      "B. 90 km/h",
      "C. 100 km/h",
      "D. 120 km/h"
    ],
    correct: 3,
    explanation: "Theo quy định hiện hành, tốc độ tối đa cho xe ô tô con trên đường cao tốc là 120 km/h (trừ khi có biển báo quy định khác). Luôn chú ý biển báo tốc độ trên từng đoạn đường."
  },
  {
    id: "q004",
    topicId: "ch1-quy-dinh-chung",
    type: "essay",
    text: "Hãy trình bày các quy tắc khi xe ô tô rẽ trái tại nơi có đèn tín hiệu giao thông?",
    sampleAnswer: "Khi rẽ trái tại nơi có đèn tín hiệu: (1) Tuân thủ tín hiệu đèn; (2) Nhường đường cho xe đi thẳng, xe rẽ phải từ hướng đi ngược lại; (3) Nhường đường cho người đi bộ đang qua đường; (4) Rẽ trái vào làn đường bên trái gần nhất của đường muốn vào.",
    explanation: "Quy tắc rẽ trái yêu cầu tuân thủ đèn tín hiệu và nhường đường cho các phương tiện, người đi bộ có quyền ưu tiên. Đây là tình huống thường gặp trong thi thực hành lý thuyết."
  },
  {
    id: "q005",
    topicId: "ch2-van-hoa-giao-thong",
    type: "mcq",
    text: "Hành vi nào sau đây thể hiện văn hóa giao thông của người lái xe?",
    options: [
      "A. Bấm còi liên tục khi giao thông đông",
      "B. Nhường đường cho người già, trẻ em, người khuyết tật",
      "C. Vượt xe ở nơi cấm vượt",
      "D. Sử dụng điện thoại khi lái xe"
    ],
    correct: 1,
    explanation: "Nhường đường cho người yếu thế trong xã hội (người già, trẻ em, người khuyết tật) là biểu hiện rõ ràng của văn hóa giao thông và đạo đức người lái xe."
  },
  {
    id: "q006",
    topicId: "ch2-van-hoa-giao-thong",
    type: "mcq",
    text: "Người lái xe sử dụng điện thoại di động khi đang lái xe (trừ thiết bị rảnh tay) bị xử phạt vì?",
    options: [
      "A. Không vi phạm nếu gọi ngắn",
      "B. Vi phạm quy tắc an toàn, mất tập trung",
      "C. Chỉ vi phạm trên cao tốc",
      "D. Chỉ vi phạm ban đêm"
    ],
    correct: 1,
    explanation: "Sử dụng điện thoại khi lái xe làm mất tập trung, tăng nguy cơ tai nạn. Luật nghiêm cấm hành vi này (trừ thiết bị rảnh tay được phép)."
  },
  {
    id: "q007",
    topicId: "ch2-van-hoa-giao-thong",
    type: "essay",
    text: "Trình bày trách nhiệm của người lái xe khi gây tai nạn giao thông?",
    sampleAnswer: "Khi gây tai nạn: (1) Dừng ngay xe, giữ nguyên hiện trường; (2) Cứu thương, gọi cấp cứu; (3) Báo cơ quan công an; (4) Giúp đỡ nạn nhân; (5) Không tự ý rời khỏi hiện trường; (6) Cung cấp thông tin cho cơ quan chức năng.",
    explanation: "Trách nhiệm khi gây tai nạn được quy định rõ trong Luật Giao thông. Việc bỏ trốn hiện trường là hành vi nghiêm trọng, có thể bị truy cứu trách nhiệm hình sự."
  },
  {
    id: "q008",
    topicId: "ch3-ky-thuat-lai-xe",
    type: "mcq",
    text: "Khi xe đi xuống dốc dài, người lái xe nên sử dụng phanh như thế nào?",
    options: [
      "A. Chỉ dùng phanh chân liên tục",
      "B. Kết hợp phanh chân và số thấp (engine braking)",
      "C. Tắt máy để tiết kiệm nhiên liệu",
      "D. Để xe trôi tự do"
    ],
    correct: 1,
    explanation: "Xuống dốc dài nên kết hợp phanh chân với số thấp (phanh động cơ) để tránh phanh bị nóng mất hiệu lực. Không nên chỉ dùng phanh chân liên tục."
  },
  {
    id: "q009",
    topicId: "ch3-ky-thuat-lai-xe",
    type: "mcq",
    text: "Khoảng cách an toàn giữa hai xe ô tô trên đường cao tốc khô ráo tối thiểu nên là?",
    options: [
      "A. 2 giây",
      "B. 3 giây trở lên",
      "C. 1 giây",
      "D. 5 mét cố định"
    ],
    correct: 1,
    explanation: "Quy tắc '3 giây' giúp duy trì khoảng cách an toàn phù hợp với tốc độ. Trên cao tốc, khoảng cách này càng quan trọng vì tốc độ cao, quãng đường phanh dài hơn."
  },
  {
    id: "q010",
    topicId: "ch3-ky-thuat-lai-xe",
    type: "mcq",
    text: "Khi lái xe ban đêm gặp xe đi ngược chiều bật đèn pha, người lái xe nên?",
    options: [
      "A. Bật đèn pha đáp trả",
      "B. Giảm tốc, nhìn lệch về phía lề đường bên phải",
      "C. Nhắm mắt và phanh gấp",
      "D. Bấm còi liên tục"
    ],
    correct: 1,
    explanation: "Khi bị chói mắt bởi đèn pha xe ngược chiều, giảm tốc và nhìn theo vạch kẻ đường bên phải giúp giữ được hướng đi an toàn mà không gây nguy hiểm."
  },
  {
    id: "q011",
    topicId: "ch4-cau-tao-sua-chua",
    type: "mcq",
    text: "Hệ thống phanh ABS trên xe ô tô có tác dụng gì?",
    options: [
      "A. Tăng tốc độ xe",
      "B. Ngăn bánh xe bị khóa khi phanh gấp, giữ khả năng lái",
      "C. Giảm tiêu hao nhiên liệu",
      "D. Tự động đỗ xe"
    ],
    correct: 1,
    explanation: "ABS (Anti-lock Braking System) ngăn bánh xe bị khóa khi phanh gấp, giúp người lái vẫn có thể điều khiển hướng xe trong khi phanh."
  },
  {
    id: "q012",
    topicId: "ch4-cau-tao-sua-chua",
    type: "mcq",
    text: "Đèn báo dầu nhớt động cơ (Oil) sáng khi đang chạy xe, người lái nên?",
    options: [
      "A. Tiếp tục chạy đến garage gần nhất",
      "B. Dừng xe ngay, tắt máy và kiểm tra",
      "C. Tăng ga để bơm dầu",
      "D. Bỏ qua nếu xe vẫn chạy"
    ],
    correct: 1,
    explanation: "Đèn dầu nhớt sáng báo hiệu áp suất dầu thấp — có thể gây hư hỏng nghiêm trọng động cơ. Cần dừng xe ngay và kiểm tra, không tiếp tục chạy."
  },
  {
    id: "q013",
    topicId: "ch4-cau-tao-sua-chua",
    type: "essay",
    text: "Nêu các hạng mục cần kiểm tra trước khi khởi hành xe ô tô?",
    sampleAnswer: "Kiểm tra trước khi khởi hành: (1) Lốp xe (áp suất, mòn); (2) Đèn chiếu sáng, xi-nhan; (3) Gương chiếu hậu; (4) Phanh, tay phanh; (5) Nước làm mát, dầu nhớt; (6) Nhiên liệu; (7) Còi, gạt mưa.",
    explanation: "Kiểm tra trước khi khởi hành là thói quen an toàn cơ bản. Phát hiện sớm sự cố giúp tránh hỏng hóc giữa đường và tai nạn."
  },
  {
    id: "q014",
    topicId: "ch5-bao-hieu-duong-bo",
    type: "mcq",
    text: "Biển báo hình tam giác, viền đỏ, nền vàng, hình vẽ màu đen thuộc loại biển gì?",
    options: [
      "A. Biển báo cấm",
      "B. Biển báo nguy hiểm",
      "C. Biển báo hiệu lệnh",
      "D. Biển báo chỉ dẫn"
    ],
    correct: 1,
    explanation: "Biển tam giác, viền đỏ, nền vàng là biển báo nguy hiểm — cảnh báo trước các tình huống có thể gây mất an toàn trên đường."
  },
  {
    id: "q015",
    topicId: "ch5-bao-hieu-duong-bo",
    type: "mcq",
    text: "Vạch liền màu trắng trên mặt đường có ý nghĩa gì?",
    options: [
      "A. Được phép vượt",
      "B. Phân chia làn đường, cấm vượt",
      "C. Chỉ dành cho xe máy",
      "D. Làn đường dừng khẩn cấp"
    ],
    correct: 1,
    explanation: "Vạch liền trắng phân chia làn đường cùng chiều và cấm vượt. Vạch đứt mới cho phép vượt khi an toàn."
  },
  {
    id: "q016",
    topicId: "ch5-bao-hieu-duong-bo",
    type: "mcq",
    text: "Đèn tín hiệu giao thông có ba màu xanh, vàng, đỏ dùng để?",
    options: [
      "A. Trang trí đường phố",
      "B. Điều khiển giao thông tại nút giao",
      "C. Chỉ dành cho xe công an",
      "D. Báo tốc độ"
    ],
    correct: 1,
    explanation: "Đèn tín hiệu ba màu điều khiển luồng giao thông: Xanh — đi, Vàng — dừng (trừ khi đã vào vùng giao), Đỏ — dừng."
  },
  {
    id: "q017",
    topicId: "ch5-bao-hieu-duong-bo",
    type: "essay",
    text: "Phân biệt biển báo cấm và biển báo hiệu lệnh?",
    sampleAnswer: "Biển cấm: hình tròn, viền đỏ, nền trắng — cấm hành vi (cấm đi, cấm rẽ, cấm dừng...). Biển hiệu lệnh: hình tròn, nền xanh — bắt buộc thực hiện (đi thẳng, rẽ phải, tốc độ tối thiểu...).",
    explanation: "Nhận biết đúng loại biển giúp phản xạ nhanh khi thi sa hình và khi lái xe thực tế. Cấm = không được, Hiệu lệnh = phải làm."
  },
  {
    id: "q018",
    topicId: "ch6-sa-hinh",
    type: "mcq",
    text: "Tại nơi giao nhau không có đèn tín hiệu, xe nào được ưu tiên đi trước?",
    options: [
      "A. Xe lớn hơn",
      "B. Xe đến từ bên phải (quy tắc bên phải)",
      "C. Xe đi nhanh hơn",
      "D. Xe chở nhiều người hơn"
    ],
    correct: 1,
    explanation: "Quy tắc 'nhường đường bên phải' áp dụng tại nơi giao nhau không có tín hiệu: xe đến từ bên phải được ưu tiên đi trước."
  },
  {
    id: "q019",
    topicId: "ch6-sa-hinh",
    type: "mcq",
    text: "Xe ô tô đang đi trên đường ưu tiên, gặp xe từ đường nhánh nối vào. Ai được đi trước?",
    options: [
      "A. Xe từ đường nhánh",
      "B. Xe trên đường ưu tiên",
      "C. Xe nào đến trước",
      "D. Xe nhỏ hơn"
    ],
    correct: 1,
    explanation: "Xe trên đường ưu tiên (đường chính) được ưu tiên. Xe từ đường nhánh phải nhường đường cho xe trên đường ưu tiên."
  },
  {
    id: "q020",
    topicId: "ch6-sa-hinh",
    type: "mcq",
    text: "Người đi bộ đang qua vạch sang đường (vạch zebra), xe ô tô phải?",
    options: [
      "A. Bấm còi nhắc nhở",
      "B. Giảm tốc và nhường đường",
      "C. Vượt nhanh trước khi họ qua",
      "D. Chỉ nhường nếu có đèn xanh cho người đi bộ"
    ],
    correct: 1,
    explanation: "Người đi bộ đang qua đường tại vạch sang đường được ưu tiên. Xe cơ giới phải giảm tốc và nhường đường — đây là quy tắc an toàn cơ bản."
  },
  {
    id: "q021",
    topicId: "ch1-quy-dinh-chung",
    type: "mcq",
    text: "Khi xe ô tô đi vào đường cao tốc, người lái xe phải?",
    options: [
      "A. Dừng ngay trên làn nhập",
      "B. Quan sát gương, tăng tốc phù hợp và nhập làn an toàn",
      "C. Đi chậm nhất có thể",
      "D. Bật đèn pha liên tục"
    ],
    correct: 1,
    explanation: "Nhập cao tốc cần tăng tốc trên làn nhập để khớp tốc độ luồng xe chính, quan sát gương và nhập làn khi an toàn."
  },
  {
    id: "q022",
    topicId: "ch3-ky-thuat-lai-xe",
    type: "essay",
    text: "Mô tả quy trình dừng xe khẩn cấp an toàn trên đường quốc lộ?",
    sampleAnswer: "Dừng khẩn cấp: (1) Bật xi-nhan phải; (2) Giảm tốc từ từ, đánh lái sang lề phải; (3) Dừng sát lề; (4) Bật đèn cảnh báo nguy hiểm; (5) Đặt tam giác cảnh báo phía sau 50-100m; (6) Kiểm tra và xử lý sự cố.",
    explanation: "Dừng khẩn cấp trên quốc lộ cần cảnh báo rõ ràng cho xe phía sau để tránh va chạm. Tam giác cảnh báo là bắt buộc."
  },
  {
    id: "q023",
    topicId: "ch5-bao-hieu-duong-bo",
    type: "mcq",
    text: "Biển số P.127 (Cấm đỗ xe) có hiệu lực như thế nào?",
    options: [
      "A. Chỉ ban ngày",
      "B. Cấm đỗ xe tại vị trí đặt biển",
      "C. Chỉ cấm xe tải",
      "D. Khuyến cáo, không phạt"
    ],
    correct: 1,
    explanation: "Biển P.127 cấm đỗ xe tại vị trí đặt biển. Vi phạm sẽ bị xử phạt theo quy định hiện hành."
  },
  {
    id: "q024",
    topicId: "ch6-sa-hinh",
    type: "mcq",
    text: "Xe ô tô đang đi thẳng, xe máy rẽ trái từ làn đối diện. Ai nhường ai?",
    options: [
      "A. Xe ô tô nhường xe máy",
      "B. Xe máy rẽ trái nhường xe ô tô đi thẳng",
      "C. Ai nhanh hơn đi trước",
      "D. Xe ô tô phải dừng lại"
    ],
    correct: 1,
    explanation: "Xe rẽ trái phải nhường đường cho xe đi thẳng từ hướng ngược lại. Đây là quy tắc ưu tiên cơ bản tại ngã tư."
  },
  {
    id: "q025",
    topicId: "ch2-van-hoa-giao-thong",
    type: "mcq",
    text: "Nồng độ cồn tối đa cho phép người lái xe ô tô không kinh doanh vận tải là?",
    options: [
      "A. 0 mg/100ml máu",
      "B. Không được uống rượu bia khi lái xe (0 mg/100ml máu hoặc 0 mg/l khí thở)",
      "C. 50 mg/100ml máu",
      "D. 80 mg/100ml máu"
    ],
    correct: 1,
    explanation: "Theo quy định hiện hành tại Việt Nam, người lái xe không được uống rượu bia (nồng độ cồn bằng 0). Đây là câu hỏi liên quan điểm liệt trong bộ 600 câu."
  },
  {
    id: "q026",
    topicId: "ch4-cau-tao-sua-chua",
    type: "mcq",
    text: "Ắc quy (bình điện) trên xe ô tô dùng để?",
    options: [
      "A. Làm mát động cơ",
      "B. Cung cấp điện khởi động và cung cấp điện khi máy tắt",
      "C. Tăng công suất động cơ",
      "D. Lọc nhiên liệu"
    ],
    correct: 1,
    explanation: "Ắc quy cung cấp điện năng cho động cơ khởi động (starter) và các thiết bị điện khi động cơ chưa chạy hoặc máy tắt."
  },
  {
    id: "q027",
    topicId: "ch1-quy-dinh-chung",
    type: "mcq",
    text: "Hành vi lùi xe trên đường cao tốc?",
    options: [
      "A. Được phép nếu nhỡ lố",
      "B. Bị nghiêm cấm",
      "C. Chỉ cấm ban đêm",
      "D. Được phép trong 500m"
    ],
    correct: 1,
    explanation: "Lùi xe trên cao tốc bị nghiêm cấm vì cực kỳ nguy hiểm. Nếu nhỡ lố, phải tiếp tục đến nút ra gần nhất."
  },
  {
    id: "q028",
    topicId: "ch6-sa-hinh",
    type: "essay",
    text: "Xe ô tô đang đi trong khu dân cư, trẻ em chạy băng qua đường đột ngột. Bạn xử lý thế nào?",
    sampleAnswer: "Giảm tốc ngay, có thể phanh gấp nếu an toàn; không bấm còi gây hoảng loạn; quan sát gương trước khi phanh; sẵn sàng dừng hoàn toàn; sau khi qua, tiếp tục thận trọng vì có thể còn trẻ em.",
    explanation: "Khu dân cư là nơi ưu tiên an toàn cho người đi bộ, đặc biệt trẻ em. Luôn đi chậm và sẵn sàng dừng xe trong khu dân cư."
  },
  {
    id: "q029",
    topicId: "ch3-ky-thuat-lai-xe",
    type: "mcq",
    text: "Khi điều khiển xe qua vũng nước sâu, người lái nên?",
    options: [
      "A. Tăng ga nhanh qua",
      "B. Giảm tốc, đi số thấp, tránh nước vào ống hút",
      "C. Dừng giữa vũng nước",
      "D. Tắt máy và đẩy xe"
    ],
    correct: 1,
    explanation: "Qua vũng nước sâu cần giảm tốc, số thấp để tránh nước hút vào động cơ qua ống hút gió — có thể gây hỏng nặng."
  },
  {
    id: "q030",
    topicId: "ch5-bao-hieu-duong-bo",
    type: "mcq",
    text: "Biển báo hình chữ nhật, nền xanh dương thường là biển?",
    options: [
      "A. Cấm",
      "B. Nguy hiểm",
      "C. Chỉ dẫn",
      "D. Phụ"
    ],
    correct: 2,
    explanation: "Biển chữ nhật nền xanh dương là biển chỉ dẫn — hướng dẫn thông tin, hướng đi, khoảng cách, địa danh..."
  }
];

function getQuestionsByTopic(topicId) {
  return QUESTION_BANK.filter(q => q.topicId === topicId);
}

function getRandomQuestions(count, topicIds = null) {
  if (isOfficialBank() && count === 30) {
    return buildExamPaperB();
  }
  let pool = QUESTION_BANK.filter(q => isMcqLike(q));
  if (topicIds && topicIds.length > 0) {
    pool = pool.filter(q => topicIds.includes(q.topicId));
  }
  return shuffleArray(pool).slice(0, Math.min(count, pool.length));
}

function getQuestionById(id) {
  return QUESTION_BANK.find(q => q.id === id);
}

function getMcqQuestions(count, topicId = null) {
  let pool = QUESTION_BANK.filter(q => q.type === "mcq" || q.type === "sahinh");
  if (topicId) pool = pool.filter(q => q.topicId === topicId);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

function getEssayQuestions(count, topicId = null) {
  let pool = QUESTION_BANK.filter(q => q.type === "essay");
  if (topicId) pool = pool.filter(q => q.topicId === topicId);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}
