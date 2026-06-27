/**
 * Danh sach 250 cau A1/A tu Phu luc I — Cong van 2262/CSGT-P5 (07/5/2025)
 * Trich tu data/cong-van-2262.pdf — chon loc tu bo 600 cau, khong phai PDF rieng.
 */
const MOTO_A1_GROUPS = {
  "m-ch1-quy-dinh-chung": [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 19, 20, 21, 22, 24, 26, 27,
    28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
    38, 39, 40, 41, 43, 44, 45, 46, 47, 48,
    49, 51, 52, 53, 54, 56, 57, 59, 63, 64,
    65, 66, 67, 68, 69, 70, 71, 72, 73, 74,
    75, 76, 77, 80, 81, 87, 88, 90, 91, 92,
    93, 94, 96, 97, 98, 99, 100, 102, 103, 107,
    109, 110, 111, 119, 123, 124, 125, 126, 137, 138,
    140, 141, 142, 145, 146, 151, 155, 163, 167, 178
  ],
  "m-ch2-van-hoa-giao-thong": [
    182, 185, 187, 189, 191, 192, 193, 194, 195, 200
  ],
  "m-ch3-ky-thuat-lai-xe": [
    206, 215, 219, 232, 233, 240, 241, 242, 254, 255,
    257, 258, 259, 260, 261
  ],
  "m-ch4-bao-hieu-duong-bo": [
    303, 304, 305, 306, 307, 313, 314, 315, 317, 318,
    322, 323, 324, 325, 326, 329, 330, 335, 345, 346,
    347, 348, 349, 350, 351, 354, 360, 362, 364, 366,
    367, 368, 369, 370, 371, 372, 373, 374, 375, 376,
    377, 380, 381, 382, 386, 387, 389, 390, 391, 393,
    394, 395, 397, 398, 400, 401, 411, 412, 413, 415,
    419, 422, 427, 430, 431, 432, 433, 434, 435, 437,
    438, 439, 440, 441, 442, 445, 450, 451, 452, 454,
    455, 457, 458, 459, 460, 461, 474, 475, 476, 478
  ],
  "m-ch5-sa-hinh": [
    486, 487, 490, 492, 495, 499,
    500, 503, 504, 505, 507, 508,
    509, 517, 520, 525, 527, 528,
    529, 538, 539, 540, 543, 548,
    553, 556, 559, 560, 562, 565,
    567, 568, 583, 592, 600
  ]
};

/** 20 cau diem liet trong bo 250 (Phu luc I muc 6) */
const MOTO_A1_CRITICAL = new Set([
  19, 20, 21, 22, 24, 26, 27, 28, 30, 47,
  48, 52, 53, 63, 64, 65, 68, 70, 71, 72
]);

function getAllMotoA1Numbers() {
  const nums = [];
  for (const list of Object.values(MOTO_A1_GROUPS)) {
    nums.push(...list);
  }
  return nums.sort((a, b) => a - b);
}

function getMotoTopicForNum(num) {
  for (const [topicId, list] of Object.entries(MOTO_A1_GROUPS)) {
    if (list.includes(num)) return topicId;
  }
  return null;
}

module.exports = {
  MOTO_A1_GROUPS,
  MOTO_A1_CRITICAL,
  getAllMotoA1Numbers,
  getMotoTopicForNum
};
