/**
 * Tao SVG sa hinh kieu de thi that (nhin tu tren, mau sac ro rang)
 * Chay: node scripts/build-sahinh-svg.js
 */
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "../public/images/sa-hinh");

function svgWrap(content, w = 480, h = 360) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#fbbf24"/>
    </marker>
    <filter id="shadow"><feDropShadow dx="1" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="#2d3748"/>
  ${content}
</svg>`;
}

function roadH(y, w = 480) {
  return `<rect x="0" y="${y}" width="${w}" height="80" fill="#4a5568"/>
  <rect x="0" y="${y + 38}" width="${w}" height="4" fill="#fbbf24"/>
  <rect x="0" y="${y + 48}" width="${w}" height="2" fill="#fff" stroke-dasharray="16 12"/>`;
}

function roadV(x, h = 360) {
  return `<rect x="${x}" y="0" width="80" height="${h}" fill="#4a5568"/>
  <rect x="${x + 38}" y="0" width="4" height="${h}" fill="#fbbf24"/>
  <rect x="${x + 48}" y="0" width="2" height="${h}" fill="#fff" stroke-dasharray="16 12"/>`;
}

function car(x, y, color, label, w = 36, h = 56, rot = 0) {
  const cx = x + w / 2, cy = y + h / 2;
  return `<g transform="rotate(${rot} ${cx} ${cy})" filter="url(#shadow)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${color}" stroke="#1a202c" stroke-width="2"/>
    <rect x="${x + 4}" y="${y + 8}" width="${w - 8}" height="${h * 0.35}" rx="3" fill="${color}" opacity="0.7"/>
    <text x="${cx}" y="${y - 6}" fill="${color}" font-size="11" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold">${label}</text>
  </g>`;
}

function zebra(x, y, w = 100) {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += `<rect x="${x + i * 14}" y="${y}" width="10" height="70" fill="#fff"/>`;
  }
  return s;
}

const diagrams = {
  "intersection.svg": svgWrap(`
    ${roadH(140)}
    ${roadV(200)}
    <line x1="200" y1="140" x2="280" y2="220" stroke="#fff" stroke-width="2" stroke-dasharray="10 8"/>
    <line x1="280" y1="140" x2="200" y2="220" stroke="#fff" stroke-width="2" stroke-dasharray="10 8"/>
    ${car(214, 260, "#2563eb", "Ban", 32, 48, 0)}
    ${car(100, 165, "#dc2626", "Do", 48, 32, 0)}
    ${car(300, 165, "#ca8a04", "Vang", 48, 32, 0)}
    <text x="240" y="30" fill="#e2e8f0" font-size="14" text-anchor="middle" font-family="Arial">Nga tu khong co den tin hieu</text>
  `),

  "pedestrian.svg": svgWrap(`
    ${roadH(140)}
    ${zebra(190, 145)}
    ${car(340, 155, "#2563eb", "Ban", 52, 30)}
    <g>
      <circle cx="240" cy="168" r="9" fill="#f97316"/>
      <rect x="236" y="177" width="8" height="22" fill="#f97316"/>
      <line x1="236" y1="185" x2="225" y2="195" stroke="#f97316" stroke-width="3"/>
      <line x1="244" y1="185" x2="255" y2="195" stroke="#f97316" stroke-width="3"/>
      <line x1="240" y1="199" x2="232" y2="215" stroke="#f97316" stroke-width="3"/>
      <line x1="240" y1="199" x2="248" y2="215" stroke="#f97316" stroke-width="3"/>
    </g>
    <text x="240" y="30" fill="#e2e8f0" font-size="14" text-anchor="middle" font-family="Arial">Nguoi di bo qua vach sang duong</text>
  `),

  "roundabout.svg": svgWrap(`
    ${roadH(140)} ${roadV(200)}
    <circle cx="240" cy="180" r="55" fill="#2d3748" stroke="#22c55e" stroke-width="5"/>
    <path d="M 240 125 A 55 55 0 1 1 295 180" fill="none" stroke="#fbbf24" stroke-width="3" marker-end="url(#arrow)"/>
    ${car(214, 280, "#2563eb", "Ban", 32, 48)}
    ${car(225, 155, "#dc2626", "Trong vong", 32, 48, 15)}
    <text x="240" y="30" fill="#e2e8f0" font-size="14" text-anchor="middle" font-family="Arial">Bung binh - xe trong vong uu tien</text>
  `),

  "left-turn.svg": svgWrap(`
    ${roadH(140)} ${roadV(200)}
    <rect x="192" y="30" width="16" height="50" rx="2" fill="#111"/>
    <circle cx="200" cy="45" r="8" fill="#22c55e"/>
    <circle cx="200" cy="65" r="8" fill="#374151"/>
    <circle cx="200" cy="85" r="8" fill="#374151"/>
    ${car(214, 260, "#2563eb", "Re trai", 32, 48)}
    ${car(214, 80, "#dc2626", "Di thang", 32, 48)}
    <path d="M 230 260 Q 160 220 90 170" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="8 5"/>
    <text x="240" y="330" fill="#e2e8f0" font-size="13" text-anchor="middle" font-family="Arial">Den xanh - re trai gap xe di thang</text>
  `),

  "priority-road.svg": svgWrap(`
    ${roadH(155)} ${roadV(200)}
    <rect x="0" y="173" width="480" height="4" fill="#fbbf24"/>
    <rect x="0" y="183" width="480" height="4" fill="#fbbf24"/>
    <polygon points="240,25 258,55 222,55" fill="#fff" stroke="#dc2626" stroke-width="2"/>
    <rect x="230" y="35" width="20" height="12" fill="#dc2626"/>
    ${car(300, 160, "#22c55e", "Duong uu tien", 52, 30)}
    ${car(214, 260, "#2563eb", "Ban (nhanh)", 32, 48)}
    <text x="240" y="340" fill="#e2e8f0" font-size="13" text-anchor="middle" font-family="Arial">Xe nhanh phai nhuong duong uu tien</text>
  `),

  "narrow-bridge.svg": svgWrap(`
    ${roadH(140)}
    <rect x="170" y="140" width="140" height="80" fill="#374151"/>
    <line x1="170" y1="140" x2="150" y2="120" stroke="#718096" stroke-width="4"/>
    <line x1="310" y1="140" x2="330" y2="120" stroke="#718096" stroke-width="4"/>
    <line x1="170" y1="220" x2="150" y2="240" stroke="#718096" stroke-width="4"/>
    <line x1="310" y1="220" x2="330" y2="240" stroke="#718096" stroke-width="4"/>
    ${car(214, 230, "#2563eb", "Ban", 32, 48)}
    ${car(214, 100, "#dc2626", "Doi dien", 32, 48)}
    <text x="240" y="30" fill="#e2e8f0" font-size="14" text-anchor="middle" font-family="Arial">Cau hep mot lan</text>
  `),

  "school-zone.svg": svgWrap(`
    ${roadH(140)}
    <polygon points="70,50 110,50 110,95 90,115 70,95" fill="#fbbf24" stroke="#000"/>
    <text x="90" y="82" fill="#000" font-size="22" text-anchor="middle">S</text>
    <g>
      <circle cx="230" cy="172" r="8" fill="#f97316"/>
      <rect x="227" y="180" width="6" height="18" fill="#f97316"/>
      <circle cx="250" cy="175" r="7" fill="#f97316"/>
      <rect x="247" y="182" width="6" height="16" fill="#f97316"/>
    </g>
    ${car(340, 155, "#2563eb", "Ban", 52, 30)}
    <text x="240" y="30" fill="#e2e8f0" font-size="14" text-anchor="middle" font-family="Arial">Khu vuc truong hoc</text>
  `),

  "highway-merge.svg": svgWrap(`
    ${roadH(100)}
    <path d="M0 280 L140 280 L260 120" fill="none" stroke="#4a5568" stroke-width="55"/>
    <path d="M0 280 L140 280 L260 120" fill="none" stroke="#374151" stroke-width="48"/>
    ${car(310, 115, "#dc2626", "Lan chinh", 52, 30)}
    ${car(90, 265, "#2563eb", "Ban", 48, 28)}
    <path d="M114 265 Q200 200 290 130" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="8 5"/>
    <text x="240" y="340" fill="#e2e8f0" font-size="13" text-anchor="middle" font-family="Arial">Nhap lan cao toc</text>
  `),

  "railway.svg": svgWrap(`
    ${roadH(155)}
    <line x1="0" y1="100" x2="480" y2="100" stroke="#111" stroke-width="4"/>
    <line x1="0" y1="110" x2="480" y2="110" stroke="#111" stroke-width="4"/>
    <rect x="200" y="70" width="80" height="40" rx="4" fill="#dc2626"/>
    <text x="240" y="95" fill="#fff" font-size="12" text-anchor="middle" font-family="Arial">TAU HO</text>
    ${car(214, 200, "#2563eb", "Ban", 32, 48)}
    <line x1="214" y1="200" x2="214" y2="120" stroke="#ef4444" stroke-width="2" stroke-dasharray="6 4"/>
    <text x="240" y="30" fill="#e2e8f0" font-size="14" text-anchor="middle" font-family="Arial">Duong ngang khong co rao chan</text>
  `),

  "downhill.svg": svgWrap(`
    ${roadV(200)}
    <text x="350" y="100" fill="#22c55e" font-size="13" font-family="Arial">Len doc</text>
    <text x="80" y="280" fill="#f97316" font-size="13" font-family="Arial">Xuong doc</text>
    <path d="M240 60 L240 300" stroke="#fbbf24" stroke-width="3" marker-end="url(#arrow)"/>
    ${car(214, 80, "#22c55e", "Len doc", 32, 48)}
    ${car(214, 240, "#2563eb", "Ban", 32, 48)}
    <text x="240" y="30" fill="#e2e8f0" font-size="14" text-anchor="middle" font-family="Arial">Duong doc hep - ai nhuong?</text>
  `),

  "emergency.svg": svgWrap(`
    ${roadH(140)}
    ${car(280, 155, "#2563eb", "Ban", 52, 30)}
    <g filter="url(#shadow)">
      <rect x="120" y="150" width="60" height="32" rx="4" fill="#fff" stroke="#dc2626" stroke-width="2"/>
      <rect x="130" y="158" width="40" height="16" fill="#dc2626"/>
      <text x="150" y="140" fill="#dc2626" font-size="11" text-anchor="middle" font-family="Arial">CUU THUONG</text>
    </g>
    <path d="M180 166 L270 166" fill="none" stroke="#fbbf24" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="240" y="30" fill="#e2e8f0" font-size="14" text-anchor="middle" font-family="Arial">Xe uu tien dang den</text>
  `),

  "red-light-right.svg": svgWrap(`
    ${roadH(140)} ${roadV(200)}
    <rect x="192" y="30" width="16" height="50" rx="2" fill="#111"/>
    <circle cx="200" cy="45" r="8" fill="#dc2626"/>
    <circle cx="200" cy="65" r="8" fill="#374151"/>
    ${car(300, 165, "#2563eb", "Ban", 48, 32)}
    <path d="M324 165 Q380 165 400 120" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="8 5"/>
    <g>${zebra(190, 145)}</g>
    <text x="240" y="330" fill="#e2e8f0" font-size="13" text-anchor="middle" font-family="Arial">Den do - re phai (nhuong nguoi di bo)</text>
  `)
};

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

Object.entries(diagrams).forEach(([name, content]) => {
  fs.writeFileSync(path.join(OUT_DIR, name), content, "utf8");
  console.log("Created", name);
});

console.log(`Done: ${Object.keys(diagrams).length} sa hinh SVG`);
