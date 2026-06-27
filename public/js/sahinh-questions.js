const SAHINH_QUESTIONS = [
  { id:"sh001", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/intersection.svg",
    text:"Tai nga tu khong co den tin hieu nhu hinh, xe o to mau xanh (di len) va xe do (tu trai) cung den. Ai duoc di truoc?",
    options:["A. Xe xanh vi di thang","B. Xe do vi o ben phai xe xanh","C. Xe nao nhanh hon","D. Xe xanh vi lon hon"],
    correct:1, explanation:"Quy tac nhuong duong ben phai: xe do den tu ben phai cua xe xanh nen xe do duoc uu tien di truoc." },
  { id:"sh002", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/pedestrian.svg",
    text:"Nhu hinh, nguoi di bo dang qua vach sang duong. Xe o to mau xanh phai xu ly the nao?",
    options:["A. Bam coi va di nhanh qua","B. Giam toc va nhuong duong","C. Vuot ben trai nguoi di bo","D. Chi nhuong neu co den do"],
    correct:1, explanation:"Nguoi di bo dang qua vach sang duong duoc uu tien. Xe co gioi phai giam toc va nhuong duong." },
  { id:"sh003", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/roundabout.svg",
    text:"Xe xanh sap vao bung binh, xe do dang trong vong xoay. Ai duoc uu tien?",
    options:["A. Xe xanh vi ben ngoai","B. Xe do dang trong vong xoay","C. Ai den truoc","D. Xe lon hon"],
    correct:1, explanation:"Xe dang trong vong xoay (bung binh) duoc uu tien. Xe muon vao phai nhuong duong." },
  { id:"sh004", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/left-turn.svg",
    text:"Den xanh, xe xanh muon re trai, xe do doi dien di thang. Xe xanh nen?",
    options:["A. Re ngay vi den xanh","B. Nhuong xe do di thang roi moi re","C. Bam coi nhac xe do","D. Re nhanh truoc xe do"],
    correct:1, explanation:"Khi re trai phai nhuong xe di thang tu huong nguoc lai, ke ca khi den xanh." },
  { id:"sh005", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/priority-road.svg",
    text:"Xe xanh tu duong nhanh muon sang duong uu tien, xe xanh la dang tren duong uu tien. Ai di truoc?",
    options:["A. Xe xanh tu nhanh","B. Xe tren duong uu tien","C. Ai den truoc","D. Xe re trai duoc uu tien"],
    correct:1, explanation:"Xe tren duong uu tien duoc di truoc. Xe tu duong nhanh phai quan sat va nhuong duong." },
  { id:"sh006", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/narrow-bridge.svg",
    text:"Tren cau hep mot lan, xe xanh va xe do gap nhau. Cach xu ly dung?",
    options:["A. Ai nhanh hon di truoc","B. Giam toc, cho xe di tung ben mot","C. Xe xanh lui vi nho hon","D. Bam coi yeu cau nhuong"],
    correct:1, explanation:"Tren cau hep mot lan, phai giam toc va cho xe di tung ben mot khi gap xe nguoc chieu." },
  { id:"sh007", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/school-zone.svg",
    text:"Trong khu vuc truong hoc, tre em dang bang qua duong. Xe xanh phai?",
    options:["A. Giam toc, dung neu can de nhuong","B. Bam coi lien tuc","C. Vuot nhanh truoc khi tre qua het","D. Chi giam toc ban dem"],
    correct:0, explanation:"Khu vuc truong hoc can di cham, san sang dung xe. Tre em la doi tuong uu tien bao ve." },
  { id:"sh008", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/highway-merge.svg",
    text:"Xe xanh dang nhap lan cao toc, xe do dang tren lan chinh. Xe xanh nen?",
    options:["A. Ep sang lan chinh ngay","B. Tang toc tren lan nhap, quan sat guong, nhap khi an toan","C. Dung tren lan nhap","D. Bam coi yeu cau nhuong"],
    correct:1, explanation:"Nhap cao toc: tang toc tren lan nhap cho khop luong xe, quan sat guong, xi-nhan va nhap lan khi an toan." },
  { id:"sh009", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/intersection.svg",
    text:"Tai nga tu khong den, xe vang tu phai va xe do tu trai cung den. Ai di truoc?",
    options:["A. Xe vang vi o ben phai xe do","B. Xe do vi di thang","C. Xe vang vi den truoc","D. Ca hai dung lai"],
    correct:0, explanation:"Xe vang o ben phai cua xe do nen xe vang duoc uu tien theo quy tac ben phai." },
  { id:"sh010", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/left-turn.svg",
    text:"Xe xanh re trai, can nhuong ai trong tinh huong hinh ve?",
    options:["A. Chi nhuong nguoi di bo","B. Xe di thang doi dien va nguoi di bo","C. Khong can nhuong khi den xanh","D. Chi nhuong xe tai"],
    correct:1, explanation:"Re trai phai nhuong xe di thang, xe re phai tu huong nguoc lai va nguoi di bo." },
  { id:"sh011", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/railway.svg",
    text:"Tau sap den duong ngang khong co rao chan nhu hinh. Xe o to phai dung cach duong ray bao nhieu?",
    options:["A. 1 met","B. Toi thieu 5 met","C. 10 met","D. Tren ray"],
    correct:1, explanation:"Dung cach duong ray toi thieu 5m khi tau sap den." },
  { id:"sh012", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/downhill.svg",
    text:"Tren doan duong doc hep nhu hinh, xe xanh (xuong doc) va xe xanh la (len doc) gap nhau. Ai nhuong?",
    options:["A. Xe len doc","B. Xe xuong doc nhuong xe len doc","C. Ai nhanh hon","D. Xe nho hon"],
    correct:1, explanation:"Xe xuong doc nhuong xe len doc vi de dung va khoi dong hon." },
  { id:"sh013", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/emergency.svg",
    text:"Xe cuu thuong dang chay nhiem vu hu coi nhu hinh. Xe o to mau xanh phai?",
    options:["A. Tiep tuc di","B. Nhuong duong, sat le phai dung neu can","C. Tang toc","D. Chi nhac nhung"],
    correct:1, explanation:"Phai nhuong duong cho xe uu tien." },
  { id:"sh014", topicId:"ch6-sa-hinh", type:"sahinh", image:"/images/sa-hinh/red-light-right.svg",
    text:"Den do, xe o to muon re phai nhu hinh. Duoc phep khi nao?",
    options:["A. Luon duoc","B. Khong co bien cam va nhuong nguoi di bo","C. Khong bao gio","D. Chi ban dem"],
    correct:1, explanation:"Re phai khi den do: duoc neu khong cam va nhuong nguoi di bo." }
];

function getSaHinhQuestions() {
  return QUESTION_BANK.filter(q => q.type === "sahinh");
}

function getRandomSaHinhQuestions(count) {
  const pool = getSaHinhQuestions();
  return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
}

function getQuestionBankSize() {
  if (typeof isMotoMode === "function" && isMotoMode() && typeof getActiveQuestionBank === "function") {
    return getActiveQuestionBank().length;
  }
  return QUESTION_BANK.length;
}

function isMcqLike(q) {
  return q.type === "mcq" || q.type === "sahinh";
}

QUESTION_BANK.push(...SAHINH_QUESTIONS);
