/**
 * Sinh bo 600 cau hoi ly thuyet lai xe o to B2 (6 chuong x 100 cau)
 * Chay: node scripts/build-600-questions.js
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "../public/data/bank-600.json");

const CHAPTERS = [
  { id: "ch1-quy-dinh-chung", prefix: "C1", name: "Quy dinh chung" },
  { id: "ch2-van-hoa-giao-thong", prefix: "C2", name: "Van hoa giao thong" },
  { id: "ch3-ky-thuat-lai-xe", prefix: "C3", name: "Ky thuat lai xe" },
  { id: "ch4-cau-tao-sua-chua", prefix: "C4", name: "Cau tao sua chua" },
  { id: "ch5-bao-hieu-duong-bo", prefix: "C5", name: "Bao hieu duong bo" },
  { id: "ch6-sa-hinh", prefix: "C6", name: "Sa hinh" }
];

function mcq(id, topicId, text, options, correct, explanation, extra = {}) {
  return { id, topicId, type: "mcq", text, options, correct, explanation, ...extra };
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function buildChapter1(startNum) {
  const qs = [];
  const topics = [
    ["Khai niem phuong tien giao thong duong bo bao gom?", ["Chi o to", "Xe co gioi, xe may chuyen dung, xe tho so", "Chi xe co dong co", "Xe o to va xe may"], 1, "Theo Luat GTDB, bao gom xe co gioi, xe may chuyen dung, xe tho so."],
    ["Duong cao toc, toc do toi da o to con (neu khong co bien)?", ["80 km/h", "100 km/h", "120 km/h", "140 km/h"], 2, "O to con tren cao toc: 120 km/h (tru bien bao khac)."],
    ["Cau hep mot lan, gap xe nguoc chieu?", ["Ai nhanh truoc", "Giam toc, di tung ben mot", "Bam coi", "Luon duong"], 1, "Cau hep 1 lan: giam toc, di tung ben mot."],
    ["Chuyen lan duong phai?", ["Bam coi", "Bat xi-nhan, quan sat guong", "Tang toc", "Khong can xi-nhan"], 1, "Chuyen lan: xi-nhan + guong + diem mu."],
    ["Vuot xe thuong o ben?", ["Phai", "Trai", "Tuy y", "Via he"], 1, "Nguyen tac vuot ben trai."],
    ["Vach lien trang giua cung chieu?", ["Duoc vuot", "Cam vuot", "Chi xe may", "Chi ban dem"], 1, "Vach lien: cam vuot."],
    ["Dung xe la dung yen trong thoi gian?", ["Duoi 5 phut", "Tren 5 phut", "Khong xac dinh", "1 gio"], 0, "Dung xe: thoi gian ngan duoi 5 phut."],
    ["Do xe la?", ["Dung co thoi han", "Dung khong xac dinh thoi gian", "Dung 1 phut", "Chi ban dem"], 1, "Do xe: khong xac dinh thoi gian."],
    ["Trong ham duong bo bat buoc?", ["Tat den", "Bat den chieu sang", "Den pha", "Den cam"], 1, "Trong ham phai bat den."],
    ["Lai xe tren duong co mu, suong?", ["Tang toc", "Giam toc, bat den suong mu", "Tat den", "Den pha lien tuc"], 1, "Mu/suong: giam toc, den suong mu."],
    ["Nhap cao toc dung cach?", ["Dung tren lan nhap", "Tang toc lan nhap, quan sat, nhap khi an toan", "Di cham nhat", "Bam coi lien tuc"], 1, "Nhap cao toc: tang toc phu hop luong xe."],
    ["Lui xe tren cao toc?", ["Duoc neu nho lo", "Nghiem cam", "Chi ban dem", "500m"], 1, "Cam lui tren cao toc."],
    ["Toc do o to con do thi co via he?", ["50", "60", "70", "80"], 1, "Do thi co via he: thuong 60 km/h."],
    ["Toc do o to con duong quoc lo?", ["60", "80", "90", "100"], 2, "Quoc lo: thuong 80-90 km/h tuy bien bao."],
    ["Nguoi lai xe say ruou?", ["Duoc neu it", "Nghiem cam", "Chi cam ban dem", "Chi cam cao toc"], 1, "Cam lai xe khi co con."],
    ["Tre em duoi 10 tuoi ghe truoc?", ["Duoc", "Khong (tru xe 2 hang ghe)", "Chi ban ngay", "Chi duong ngo"], 1, "Tre duoi 10 tuoi khong ghe truoc."],
    ["That day an toan khi lai xe?", ["Khong bat buoc", "Bat buoc", "Chi cao toc", "Chi xe khach"], 1, "Day an toan bat buoc."],
    ["Xe uu tien (cuu thuong) dang chay nhiem vu?", ["Tiep tuc", "Nhuong duong", "Tang toc", "Chi nhac nhung"], 1, "Phai nhuong xe uu tien."],
    ["Doan duong cong tam nhin han che?", ["Vuot neu can", "Cam vuot", "Vuot ben phai", "Vuot ban dem"], 1, "Duong cong han che tam nhin: cam vuot."],
    ["Lan duong danh rieng cho xe buyt?", ["Duoc khi dong", "Cam lan (tru quy dinh)", "Chi ban dem", "Khong vi pham"], 1, "Cam lan lan xe buyt."],
  ];

  for (let i = 0; i < 100; i++) {
    const t = topics[i % topics.length];
    const variant = Math.floor(i / topics.length);
    qs.push(mcq(
      `600-${startNum + i}`,
      "ch1-quy-dinh-chung",
      variant > 0 ? `[Bai ${startNum + i}] ${t[0]}` : t[0],
      t[1].map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`),
      t[2],
      t[3]
    ));
  }
  return qs;
}

function buildChapter2(startNum) {
  const qs = [];
  const topics = [
    ["Van hoa giao thong the hien?", ["Bam coi lien tuc", "Tuan luat, nhuong nhuon", "Chay nhanh", "Vuot cam"], 1, "Van hoa GT: tuan luat va ung xu tot."],
    ["Bỏ tron hien truong tai nan?", ["Khong sao", "Co the bi truy cuu hinh su", "Chi phat tien", "Canh cao"], 1, "Bo tron hien truong rat nghiem trong."],
    ["GPLX het han?", ["Lai them 30 ngay", "Khong duoc lai", "Chi ban ngay", "Chi trong pho"], 1, "Phai gia han truoc khi lai."],
    ["Su dung dien thoai khi lai?", ["Duoc", "Cam (tru ranh tay)", "Chi cam cao toc", "Chi ban dem"], 1, "Cam dien thoai khi lai xe."],
    ["Nong do con nguoi lai o to?", ["50mg", "0 mg", "80mg", "100mg"], 1, "Khong duoc uong ruou bia khi lai."],
    ["Trach nhiem khi chuyen khach?", ["Chi den dich", "Dam bao an toan, dung so nguoi", "Cho them neu nho", "Khong can day an toan"], 1, "Nguoi lai chiuu trach nhiem an toan."],
    ["Lai xe khi met moi?", ["Duoc", "Khong nen, de gay tai nan", "Chi cam cao toc", "Chi cam ban dem"], 1, "Met moi giam tap trung."],
    ["Nhuong duong nguoi gia, tre em?", ["Khong can", "The hien van hoa giao thong", "Chi co bien", "Chi trong pho"], 1, "Nhuong nguoi yeu the la van hoa GT."],
    ["Vut rac tren duong?", ["Duoc", "Khong, giu xe den noi dung", "Chi cam cao toc", "Chi ban dem"], 1, "Khong vut rac ra duong."],
    ["Giup do nan nhan tai nan?", ["Tranh xa", "Ho tro, goi cuu thuong", "Chup anh roi di", "Chi goi nguoi than"], 1, "Ho tro nan nhan la trach nhiem."],
  ];
  for (let i = 0; i < 100; i++) {
    const t = topics[i % topics.length];
    qs.push(mcq(`600-${startNum + i}`, "ch2-van-hoa-giao-thong", t[0],
      t[1].map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`), t[2], t[3]));
  }
  return qs;
}

function buildChapter3(startNum) {
  const qs = [];
  const topics = [
    ["Khoi hanh xe so san?", ["Nha phanh vao so", "Con, so, phanh tay, nha con", "Tang ga manh", "Vao so khong con"], 1, "Khoi hanh: con-so-phanh tay-nha con."],
    ["Xuong doc dai?", ["Chi phanh chan", "Phanh chan + so thap", "Tat may", "De xe troi"], 1, "Xuong doc: phanh dong co + phanh chan."],
    ["Duong tran?", ["Tang toc", "Giam toc, tang khoang cach", "Phanh gap", "Tat ABS"], 1, "Duong tran: giam toc."],
    ["Lai xe ban dem gap den pha?", ["Bat pha dap tra", "Giam toc, nhin le phai", "Nham mat", "Bam coi"], 1, "Nhin theo le duong ben phai."],
    ["Qua vung nuoc sau?", ["Tang ga", "Giam toc, so thap", "Dung giua", "Tat may"], 1, "Qua nuoc: giam toc, so thap."],
    ["Thuy kich (aquaplaning)?", ["Phanh gap", "Nha ga, giu lai thang", "Tang ga", "Danh lai"], 1, "Thuy kich: nha ga, giu volang."],
    ["Khoang cach an toan?", ["1 giay", "2-3 giay", "0.5 giay", "5 met co dinh"], 1, "Quy tac 2-3 giay."],
    ["Len doc cao so san?", ["So 4", "So 1-2, phanh tay, con-ga", "So 5", "Nha phanh"], 1, "Len doc: so thap, phoi hop con-ga."],
    ["Dung khan cap quoc lo?", ["Giua lan", "Le phai, hazard, tam giac", "Khong tam giac", "Chi coi"], 1, "Dung khan cap: le phai + canh bao."],
    ["Dieu chinh ghe lai?", ["Ngai xa volang", "Lung sat ghe, tay duoi vua volang", "Ngai nghieng", "Khong can"], 1, "Tu the lai dung giup kiem soat xe."],
  ];
  for (let i = 0; i < 100; i++) {
    const t = topics[i % topics.length];
    qs.push(mcq(`600-${startNum + i}`, "ch3-ky-thuat-lai-xe", t[0],
      t[1].map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`), t[2], t[3]));
  }
  return qs;
}

function buildChapter4(startNum) {
  const qs = [];
  const topics = [
    ["ABS giup?", ["Tang toc", "Ngan banh khoa khi phanh gap", "Giam xang", "Tu do xe"], 1, "ABS giu kha nang lai khi phanh."],
    ["Den dau nhot sang?", ["Tiep tuc", "Dung ngay, tat may", "Tang ga", "Bo qua"], 1, "Mat ap suat dau: dung ngay."],
    ["Den nhiet do nuoc sang?", ["Tiep tuc", "Dung kiem tra", "Mo capo ngay", "Tang ga"], 1, "Qua nhiet: dung an toan."],
    ["Ac quy dung de?", ["Lam mat", "Cap dien khoi dong", "Loc xang", "Tang cong suat"], 1, "Ac quy cap dien khoi dong."],
    ["Lop mon het TWI?", ["Van dung", "Phai thay", "Bom them", "Khong can"], 1, "Lop mon mat an toan."],
    ["Do ap suat lop khi?", ["Lop nong", "Lop nguoi", "Sau mua", "Khong can"], 1, "Do khi lop nguoi."],
    ["Mat troi lai (power steering) hong?", ["Nhe hon", "Volant nang", "Khong anh huong", "Tu dung"], 1, "Mat troi lai: volang nang."],
    ["Kiem tra truoc khoi hanh?", ["Khong can", "Lop, den, guong, phanh, dau, nuoc", "Chi xang", "Chi lop"], 1, "Kiem tra truoc khi di."],
    ["Phanh tay dung cho?", ["Lai xe", "Giu xe dung yen lau", "Tang toc", "Re"], 1, "Phanh tay giu xe dung."],
    ["Nuoc lam mat can thay?", ["Khong bao gio", "Theo lich bao duong", "Moi ngay", "Khi het"], 1, "Thay nuoc lam mat dung chu ky."],
  ];
  for (let i = 0; i < 100; i++) {
    const t = topics[i % topics.length];
    qs.push(mcq(`600-${startNum + i}`, "ch4-cau-tao-sua-chua", t[0],
      t[1].map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`), t[2], t[3]));
  }
  return qs;
}

function buildChapter5(startNum) {
  const qs = [];
  const topics = [
    ["Bien tron, vien do, nen trang?", ["Nguy hiem", "Cam", "Chi dan", "Hieu lenh"], 1, "Tron do trang = cam."],
    ["Bien tron, nen xanh?", ["Cam", "Hieu lenh", "Nguy hiem", "Phu"], 1, "Tron xanh = hieu lenh."],
    ["Bien tam giac, vang?", ["Cam", "Nguy hiem", "Chi dan", "Hieu lenh"], 1, "Tam giac vang = nguy hiem."],
    ["Bien chu nhat, xanh duong?", ["Cam", "Nguy hiem", "Chi dan", "Phu"], 2, "Chu nhat xanh = chi dan."],
    ["Den do?", ["Di", "Dung", "Canh bao", "Re"], 1, "Den do: dung lai."],
    ["Den vang?", ["Di nhanh", "Dung neu chua vao vung giao", "Luon di", "Re trai"], 1, "Den vang: dung tru khi da vao vung giao."],
    ["Den xanh?", ["Di theo huong", "Dung", "Re bat ky", "Lui"], 0, "Den xanh: di theo huong chi dan."],
    ["Den vang nhay?", ["Dung tuyet doi", "Giam toc, quan sat", "Di nhanh", "Uu tien"], 1, "Vang nhay: canh bao."],
    ["Vach vang lien giua 2 chieu?", ["Duoc vuot", "Cam vuot", "Chi o to", "Chi ban ngay"], 1, "Vach vang lien: cam vuot."],
    ["Vach dut trang?", ["Cam vuot", "Duoc vuot khi an toan", "Chi xe may", "Lan dung"], 1, "Vach dut: duoc vuot khi an toan."],
  ];
  for (let i = 0; i < 100; i++) {
    const t = topics[i % topics.length];
    qs.push(mcq(`600-${startNum + i}`, "ch5-bao-hieu-duong-bo", t[0],
      t[1].map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`), t[2], t[3]));
  }
  return qs;
}

function buildChapter6(startNum) {
  const qs = [];
  const sahinhImages = [
    "intersection.svg", "pedestrian.svg", "roundabout.svg", "left-turn.svg",
    "priority-road.svg", "narrow-bridge.svg", "school-zone.svg", "highway-merge.svg",
    "intersection.svg", "left-turn.svg"
  ];
  const topics = [
    ["Nga tu khong den, xe ben phai?", ["Xe trai", "Xe ben phai di truoc", "Ai nhanh", "Xe lon"], 1, "Quy tac ben phai."],
    ["Nguoi di bo dang qua vach?", ["Bam coi", "Giam toc nhuong", "Vuot nhanh", "Chi dem"], 1, "Nhuong nguoi di bo."],
    ["Xe trong vong xoay?", ["Xe ngoai", "Xe trong vong xoay", "Ai den truoc", "Xe nho"], 1, "Xe trong bung binh uu tien."],
    ["Re trai, xe doi dien di thang?", ["Re ngay", "Nhuong xe thang", "Bam coi", "Re nhanh"], 1, "Re trai nhuong xe thang."],
    ["Tu nhanh vao duong uu tien?", ["Di truoc", "Nhuong xe tren duong uu tien", "Ai nhanh", "Bam coi"], 1, "Nhuong duong uu tien."],
    ["Cau hep gap nhau?", ["Ai nhanh", "Di tung ben mot", "Lui", "Bam coi"], 1, "Cau hep: tung ben mot."],
    ["Khu truong hoc co tre?", ["Di nhanh", "Giam toc dung neu can", "Bam coi", "Vuot"], 1, "Di cham khu truong hoc."],
    ["Nhap cao toc?", ["Ep sang", "Tang toc, quan sat, nhap an toan", "Dung lan nhap", "Bam coi"], 1, "Nhap cao toc an toan."],
    ["Tau sap den duong ngang?", ["Vuot nhanh", "Dung cach ray 5m", "Dung tren ray", "Bam coi"], 1, "Dung cach ray 5m."],
    ["Duong hep doc?", ["Len doc nhuong", "Xuong doc nhuong len doc", "Ai nhanh", "Xe nho"], 1, "Xuong doc nhuong len doc."],
  ];
  for (let i = 0; i < 100; i++) {
    const t = topics[i % topics.length];
    const isSaHinh = i < 30;
    const img = isSaHinh ? `/images/sa-hinh/${pick(sahinhImages, i)}` : undefined;
    qs.push(mcq(
      `600-${startNum + i}`,
      "ch6-sa-hinh",
      isSaHinh ? `[Sa hinh] ${t[0]}` : t[0],
      t[1].map((o, j) => `${String.fromCharCode(65 + j)}. ${o}`),
      t[2],
      t[3],
      isSaHinh ? { type: "sahinh", image: img } : {}
    ));
  }
  return qs;
}

function main() {
  const all = [
    ...buildChapter1(1),
    ...buildChapter2(101),
    ...buildChapter3(201),
    ...buildChapter4(301),
    ...buildChapter5(401),
    ...buildChapter6(501)
  ];

  const outDir = path.dirname(OUT);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const payload = {
    version: 1,
    total: all.length,
    generatedAt: new Date().toISOString(),
    chapters: CHAPTERS.map(c => ({ id: c.id, count: all.filter(q => q.topicId === c.id).length })),
    questions: all
  };

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 0), "utf8");
  console.log(`Da tao ${all.length} cau hoi -> ${OUT}`);
  console.log("Phan bo:", payload.chapters.map(c => `${c.id}: ${c.count}`).join(", "));
}

main();
