/**
 * rouxReferenceData.ts
 * Cẩm nang công thức và kiến thức Roux chuẩn theo giáo trình rouxmethodvn:
 * 1. 2-Look CMLL: 7 thế OLL góc (Sune, Antisune, H, Pi, T, U, L) + 2 thế PLL góc (T-Perm kề, Y-Perm chéo).
 * 2. Cẩm nang LSE EO: Quy tắc nhận biết Bad Edge, toàn bộ các thế EO (3/1 F/B, 1/1 F/B, 0/2, 2a/0, 2o/0, 4/0, 2a/2, 2o/2, 4/2).
 * 3. Hướng dẫn LSE UL/UR (Bước 4b).
 * 4. Cẩm nang L4E (Bước 4c): D-Dots, Cột M (Ub, Ua), H-Perm, Z-Perm.
 */

export interface TwoLookCornerCase {
  id: string;
  name: string;
  vietnameseName: string;
  type: 'oll' | 'pll';
  recognition: string;
  alg: string;
  setupAlg?: string;
  /** Ma trận 3x3 biểu diễn màu mặt U: 'Y' = Vàng (Yellow), '.' = xám/chưa định hướng */
  topFaceMatrix: string[][];
  /** Vị trí màu vàng ở 4 cạnh xung quanh mặt U: [Bắc(B), Đông(R), Nam(F), Tây(L)] */
  sideStickers?: {
    front?: ('Y' | '.')[]; // [trái, phải]
    back?: ('Y' | '.')[];  // [trái, phải]
    left?: ('Y' | '.')[];  // [trên, dưới]
    right?: ('Y' | '.')[]; // [trên, dưới]
  };
}

export interface EOCase {
  id: string;
  code: string; // "3/1 (F)", "2o/0", v.v.
  name: string;
  badCount: number;
  badU: number;
  badD: number;
  triggerAlg: string;      // Công thức đưa về thế cơ bản
  fullSolution: string;    // Chuỗi hoàn tất EO
  setupAlg: string;        // Để tạo thế cờ này trên Rubik 3D
  recognitionTip: string;  // Dấu hiệu nhận biết & cách đặt khối
  diagramU: ('B' | 'G')[]; // 4 cạnh tầng U: [Bắc(UB), Đông(UR), Nam(UF), Tây(UL)] - B=Bad, G=Good
  diagramD: ('B' | 'G')[]; // 2 cạnh tầng D: [Bắc(DB), Nam(DF)]
}

export interface L4ECase {
  id: string;
  name: string;
  recognition: string;
  alg: string;
  setupAlg: string;
  tip: string;
}

// ─────────────────────────────────────────────────────────────
// 1. DỮ LIỆU 2-LOOK CMLL
// ─────────────────────────────────────────────────────────────

export const TWO_LOOK_OLL_CASES: TwoLookCornerCase[] = [
  {
    id: 'sune',
    name: 'Sune',
    vietnameseName: 'Thế Sune (1 góc vàng trên U)',
    type: 'oll',
    recognition: '1 góc vàng duy nhất hướng lên U (đặt ở góc dưới bên trái UFL). Góc trước bên phải (URF) có màu vàng nhìn thẳng về phía bạn (mặt F).',
    alg: "R U R' U R U2 R'",
    setupAlg: "R U2 R' U' R U' R'",
    topFaceMatrix: [
      ['.', '.', '.'],
      ['.', 'Y', '.'],
      ['Y', '.', '.'],
    ],
  },
  {
    id: 'antisune',
    name: 'Antisune',
    vietnameseName: 'Thế Antisune (1 góc vàng trên U)',
    type: 'oll',
    recognition: '1 góc vàng duy nhất hướng lên U (đặt ở góc trên bên trái UBL). Góc trước bên trái (UFL) có màu vàng nhìn sang bên trái (mặt L).',
    alg: "R U2 R' U' R U' R'",
    setupAlg: "R U R' U R U2 R'",
    topFaceMatrix: [
      ['Y', '.', '.'],
      ['.', 'Y', '.'],
      ['.', '.', '.'],
    ],
  },
  {
    id: 'h',
    name: 'H (Double Sune)',
    vietnameseName: 'Thế H (0 góc vàng, 2 cặp đối xứng)',
    type: 'oll',
    recognition: '0 góc vàng nào hướng lên U. Hai góc vàng phía trước nhìn ra F, hai góc vàng phía sau nhìn ra B.',
    alg: "F (R U R' U')3 F'",
    setupAlg: "F (U R U' R')3 F'",
    topFaceMatrix: [
      ['.', '.', '.'],
      ['.', 'Y', '.'],
      ['.', '.', '.'],
    ],
  },
  {
    id: 'pi',
    name: 'Pi (Bowtie đối)',
    vietnameseName: 'Thế Pi (0 góc vàng, 1 cặp đèn pha + 2 góc sang 2 bên)',
    type: 'oll',
    recognition: '0 góc vàng nào hướng lên U. Hai góc vàng phía sau nhìn ra B (Headlights), hai góc phía trước nhìn sang hai bên (L và R). Đặt đèn pha ra phía sau.',
    alg: "R U2 R2 U' R2 U' R2 U2 R",
    setupAlg: "R' U2 R2 U R2 U R2 U2 R'",
    topFaceMatrix: [
      ['.', '.', '.'],
      ['.', 'Y', '.'],
      ['.', '.', '.'],
    ],
  },
  {
    id: 't',
    name: 'T',
    vietnameseName: 'Thế T (2 góc vàng kề nhau, 2 góc nhìn ngược nhau)',
    type: 'oll',
    recognition: '2 góc vàng hướng lên U nằm bên phải (UBR và UFR). Hai góc còn lại (UBL và UFL) nhìn ngược hướng nhau ra B và F.',
    alg: "(r U R' U') (r' F R F')",
    setupAlg: "F R' F' r U R U' r'",
    topFaceMatrix: [
      ['.', '.', 'Y'],
      ['.', 'Y', '.'],
      ['.', '.', 'Y'],
    ],
  },
  {
    id: 'u',
    name: 'U (Headlights)',
    vietnameseName: 'Thế U (2 góc vàng kề nhau, 2 góc còn lại thành Đèn Pha)',
    type: 'oll',
    recognition: '2 góc vàng hướng lên U nằm phía sau (UBL và UBR). Hai góc phía trước (UFL và UFR) cùng nhìn về mặt trước F (Headlights).',
    alg: "R2 D R' U2 R D' R' U2 R'",
    setupAlg: "R2 U2 R D R' U2 R D' R2",
    topFaceMatrix: [
      ['Y', '.', 'Y'],
      ['.', 'Y', '.'],
      ['.', '.', '.'],
    ],
  },
  {
    id: 'l',
    name: 'L (Bowtie chéo)',
    vietnameseName: 'Thế L (2 góc vàng đối xứng chéo)',
    type: 'oll',
    recognition: '2 góc vàng hướng lên U nằm chéo nhau (UBL và UFR). Góc UFL có màu vàng nhìn ra F, góc UBR có màu vàng nhìn ra R.',
    alg: "F' (r U R' U') (r' F R)",
    setupAlg: "R' F' r U R U' r' F",
    topFaceMatrix: [
      ['Y', '.', '.'],
      ['.', 'Y', '.'],
      ['.', '.', 'Y'],
    ],
  },
];

export const TWO_LOOK_PLL_CASES: TwoLookCornerCase[] = [
  {
    id: 't_perm',
    name: 'Adjacent Swap (T-Perm)',
    vietnameseName: 'Đổi 2 góc kề (Có 1 cặp cùng màu - Headlights)',
    type: 'pll',
    recognition: 'Quan sát 4 mặt xung quanh tầng U: Thấy đúng 1 cặp 2 góc cùng màu ở cùng một mặt (Đèn pha / Headlights). Đặt cặp đèn pha đó sang bên Trái (Mặt L) rồi xoay công thức T-Perm.',
    alg: "R U R' U' R' F R2 U' R' U' R U R' F'",
    setupAlg: "F R U' R' U R U R2 F' R U R U' R'",
    topFaceMatrix: [
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
    ],
  },
  {
    id: 'y_perm',
    name: 'Diagonal Swap (Y-Perm)',
    vietnameseName: 'Đổi 2 góc chéo (Không có cặp góc nào cùng màu)',
    type: 'pll',
    recognition: 'Quan sát 4 mặt xung quanh tầng U: Không có bất kỳ mặt nào có 2 góc cùng màu. Cầm khối Rubik ở góc nhìn bất kỳ và xoay công thức Y-Perm để hoán vị 2 góc chéo.',
    alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    setupAlg: "F R' F' R U R U' R' F R U' R' U R U R' F'",
    topFaceMatrix: [
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// 2. DỮ LIỆU CẨM NANG LSE — EO (EDGE ORIENTATION)
// ─────────────────────────────────────────────────────────────

export const LSE_BAD_EDGE_RULES = {
  title: 'Quy tắc nhận biết Cạnh Sai (Bad Edge) theo giáo trình Roux',
  principles: [
    'Tâm tầng U là Vàng, tâm tầng D là Trắng (hoặc ngược lại).',
    'Một cạnh được gọi là BAD EDGE khi màu Vàng hoặc Trắng của nó nằm ở các mặt bên (F, B, R, L) thay vì nằm trên mặt U hoặc mặt D.',
    'Đối với 2 cạnh UL và UR: Nếu sticker Vàng/Trắng hướng lên mặt U thì là GOOD EDGE; nếu hướng sang mặt L hoặc R thì là BAD EDGE.',
    'Số lượng Bad Edges trên khối Rubik luôn luôn là số chẵn: 0, 2, 4 hoặc 6 cạnh sai.',
    'Mục tiêu của Bước 4a (EO): Đưa tất cả các cạnh sai về thế cơ bản 3/1 rồi giải dứt điểm chỉ bằng 3 moves.',
  ],
};

export const LSE_EO_CASES: EOCase[] = [
  // ── NHÓM CƠ BẢN (BASE CASES) ──
  {
    id: '3_1_F',
    code: '3/1 (F)',
    name: 'Thế Cơ Bản 3/1 (F) — 4 cạnh sai',
    badCount: 4,
    badU: 3,
    badD: 1,
    triggerAlg: "M' U' M'",
    fullSolution: "M' U' M'",
    setupAlg: "M U M",
    recognitionTip: '3 cạnh sai ở tầng U (đặt 1 cạnh đúng duy nhất ở UB). 1 cạnh sai ở tầng D đặt tại vị trí DF (phía trước). Xoay M\' U\' M\' (hoặc M\' U M\') là giải xong toàn bộ EO.',
    diagramU: ['G', 'B', 'B', 'B'], // UB Good, UR Bad, UF Bad, UL Bad
    diagramD: ['G', 'B'],          // DB Good, DF Bad
  },
  {
    id: '3_1_B',
    code: '3/1 (B)',
    name: 'Thế Cơ Bản 3/1 (B) — 4 cạnh sai',
    badCount: 4,
    badU: 3,
    badD: 1,
    triggerAlg: "M U' M'",
    fullSolution: "M U' M'",
    setupAlg: "M U' M'",
    recognitionTip: '3 cạnh sai ở tầng U (đặt 1 cạnh đúng duy nhất ở UF). 1 cạnh sai ở tầng D đặt tại vị trí DB (phía sau). Xoay M U\' M\' (hoặc M U M\') là giải xong toàn bộ EO.',
    diagramU: ['B', 'B', 'G', 'B'], // UB Bad, UR Bad, UF Good, UL Bad
    diagramD: ['B', 'G'],          // DB Bad, DF Good
  },

  // ── NHÓM 2 CẠNH SAI ──
  {
    id: '1_1_F',
    code: '1/1 (F)',
    name: 'Thế 1/1 (F) — 1 cạnh sai ở U, 1 cạnh sai ở D',
    badCount: 2,
    badU: 1,
    badD: 1,
    triggerAlg: "M' U' M U'",
    fullSolution: "M' U' M U' M' U' M'",
    setupAlg: "M U M U' M' U M",
    recognitionTip: 'Đặt 1 cạnh sai ở U tại vị trí UF (trước), 1 cạnh sai ở D tại vị trí DF (trước). Xoay trigger M\' U\' M U\' sẽ chuyển thành thế cơ bản 3/1 (F).',
    diagramU: ['G', 'G', 'B', 'G'],
    diagramD: ['G', 'B'],
  },
  {
    id: '1_1_B',
    code: '1/1 (B)',
    name: 'Thế 1/1 (B) — 1 cạnh sai ở U, 1 cạnh sai ở D',
    badCount: 2,
    badU: 1,
    badD: 1,
    triggerAlg: "M' U' M' U'",
    fullSolution: "M' U' M' U' M U' M'",
    setupAlg: "M U M' U M U M",
    recognitionTip: 'Đặt 1 cạnh sai ở U tại vị trí UB (sau), 1 cạnh sai ở D tại vị trí DB (sau). Xoay trigger M\' U\' M\' U\' sẽ chuyển thành thế cơ bản 3/1 (B).',
    diagramU: ['B', 'G', 'G', 'G'],
    diagramD: ['B', 'G'],
  },
  {
    id: '0_2',
    code: '0/2',
    name: 'Thế 0/2 — 0 cạnh sai ở U, 2 cạnh sai ở D',
    badCount: 2,
    badU: 0,
    badD: 2,
    triggerAlg: "M' U' M' U",
    fullSolution: "M' U' M' U M U' M'",
    setupAlg: "M U' M' U' M U M",
    recognitionTip: 'Tầng U cả 4 cạnh đều tốt. Hai cạnh sai đều nằm ở tầng D (DF và DB). Xoay trigger M\' U\' M\' U sẽ chuyển thành thế cơ bản 3/1 (B).',
    diagramU: ['G', 'G', 'G', 'G'],
    diagramD: ['B', 'B'],
  },
  {
    id: '2o_0',
    code: '2o/0',
    name: 'Thế 2o/0 — 2 cạnh sai đối nhau ở U (Opposite)',
    badCount: 2,
    badU: 2,
    badD: 0,
    triggerAlg: "M' U M U'",
    fullSolution: "M' U M U' M' U' M'",
    setupAlg: "M U M U' M' U' M",
    recognitionTip: 'Tầng D không có cạnh sai. Hai cạnh sai ở tầng U nằm đối diện nhau qua tâm (đặt ở UF và UB). Xoay trigger M\' U M U\' sẽ chuyển thành thế cơ bản 3/1 (F).',
    diagramU: ['B', 'G', 'B', 'G'],
    diagramD: ['G', 'G'],
  },
  {
    id: '2a_0',
    code: '2a/0',
    name: 'Thế 2a/0 — 2 cạnh sai kề nhau ở U (Adjacent)',
    badCount: 2,
    badU: 2,
    badD: 0,
    triggerAlg: "M' U M' U2",
    fullSolution: "M' U M' U2 M' U' M'",
    setupAlg: "M U M U2 M U' M",
    recognitionTip: 'Tầng D không có cạnh sai. Hai cạnh sai ở tầng U nằm kề nhau (đặt tại UF và UL). Xoay trigger M\' U M\' U2 sẽ chuyển thành thế cơ bản 3/1 (F).',
    diagramU: ['G', 'G', 'B', 'B'],
    diagramD: ['G', 'G'],
  },

  // ── NHÓM 4 CẠNH SAI ──
  {
    id: '4_0',
    code: '4/0',
    name: 'Thế 4/0 — 4 cạnh sai ở U, 0 cạnh sai ở D',
    badCount: 4,
    badU: 4,
    badD: 0,
    triggerAlg: "M' U2 M' U2",
    fullSolution: "M' U2 M' U2 M' U' M'",
    setupAlg: "M U M U2 M U2 M",
    recognitionTip: 'Cả 4 cạnh ở tầng U đều sai (chưa lật vàng lên). Tầng D không có cạnh sai. Xoay trigger M\' U2 M\' U2 sẽ chuyển thành thế cơ bản 3/1 (F).',
    diagramU: ['B', 'B', 'B', 'B'],
    diagramD: ['G', 'G'],
  },
  {
    id: '2a_2',
    code: '2a/2',
    name: 'Thế 2a/2 — 2 cạnh sai kề ở U, 2 cạnh sai ở D',
    badCount: 4,
    badU: 2,
    badD: 2,
    triggerAlg: "M2 U'",
    fullSolution: "M2 U' M' U' M'",
    setupAlg: "M U M U M2",
    recognitionTip: '2 cạnh sai ở U kề nhau (đặt tại UF và UL). 2 cạnh sai ở D (DF và DB). Chỉ cần xoay trigger cực ngắn M2 U\' là đưa thẳng về thế cơ bản 3/1 (F).',
    diagramU: ['G', 'G', 'B', 'B'],
    diagramD: ['B', 'B'],
  },
  {
    id: '2o_2',
    code: '2o/2',
    name: 'Thế 2o/2 — 2 cạnh sai đối ở U, 2 cạnh sai ở D',
    badCount: 4,
    badU: 2,
    badD: 2,
    triggerAlg: "M U2 M' U2",
    fullSolution: "M U2 M' U2 M' U' M'",
    setupAlg: "M U M U2 M' U2 M",
    recognitionTip: '2 cạnh sai ở U đối diện nhau (UF và UB). 2 cạnh sai ở D (DF và DB). Xoay trigger M U2 M\' U2 sẽ chuyển thành thế cơ bản 3/1 (F).',
    diagramU: ['B', 'G', 'B', 'G'],
    diagramD: ['B', 'B'],
  },

  // ── NHÓM 6 CẠNH SAI ──
  {
    id: '4_2',
    code: '4/2',
    name: 'Thế 4/2 — Toàn bộ 6 cạnh đều sai',
    badCount: 6,
    badU: 4,
    badD: 2,
    triggerAlg: "M' U M' U2",
    fullSolution: "R U' r' U' M' U r U r'",
    setupAlg: "r' U' r' U' M U r U r'",
    recognitionTip: 'Cả 4 cạnh tầng U và cả 2 cạnh tầng D đều sai. Cách 1 (Roux cơ bản): M\' U M\' U2 đưa về thế 1/1 (F) rồi giải tiếp. Cách 2 (1-look nâng cao): R U\' r\' U\' M\' U r U r\'.',
    diagramU: ['B', 'B', 'B', 'B'],
    diagramD: ['B', 'B'],
  },
];

// ─────────────────────────────────────────────────────────────
// 3. DỮ LIỆU CẨM NANG LSE — UL/UR & L4E
// ─────────────────────────────────────────────────────────────

export const LSE_UL_UR_GUIDE = {
  title: 'Bước 4b: Đưa 2 cạnh UL và UR về đúng vị trí',
  objective: 'Đưa 2 cạnh UL (Đỏ - Vàng) và UR (Cam - Vàng) về đúng vị trí bên trái và bên phải tầng U mà KHÔNG làm hỏng hướng EO đã định hình ở bước 4a (chỉ dùng <M, U>).',
  steps: [
    {
      title: 'Xác định vị trí hiện tại của 2 cạnh UL & UR',
      content: 'Nhìn nhanh tìm 2 cạnh có màu Đỏ/Vàng và Cam/Vàng. Chúng có thể đang ở tầng U hoặc tầng D (DF / DB).',
    },
    {
      title: 'Đưa 1 viên xuống tầng D',
      content: 'Nếu cả 2 viên đang ở tầng U: Xoay U để đưa 1 viên vào cột M (vị trí UF hoặc UB), gạt M2 đưa viên đó xuống đáy D (DF hoặc DB).',
    },
    {
      title: 'Khớp viên còn lại vào vị trí đối diện',
      content: 'Xoay tầng U để đưa viên UL/UR thứ hai vào vị trí đối diện trên cột M. Sau đó xoay M2 để hoán đổi 2 viên xuống đáy hoặc đưa trực tiếp về 2 cánh UL / UR.',
    },
  ],
};

export const LSE_L4E_CASES: L4ECase[] = [
  {
    id: 'd_dots',
    name: 'D-Dots (Lệch tâm đáy)',
    recognition: 'Hai cạnh tầng D (DF và DB) đã cùng màu trắng nhưng tâm đáy D lại đang là vàng (hoặc ngược lại).',
    alg: 'M2',
    setupAlg: 'M2',
    tip: 'Chỉ cần gạt M2 là hoán vị tâm U và D về đúng mặt, đưa về trạng thái hoàn hảo.',
  },
  {
    id: 'ub_perm',
    name: 'Chu trình 3 cạnh Ub (Cột M)',
    recognition: '3 cạnh trên tầng M bị lệch vị trí theo chiều kim đồng hồ: UF cần về UB, UB cần về DF, DF cần về UF.',
    alg: 'M2 U M U2 M\' U M2',
    setupAlg: 'M2 U\' M U2 M\' U\' M2',
    tip: 'Áp dụng công thức cột M kinh điển giải dứt điểm chu trình 3 cạnh chỉ trong 7 moves.',
  },
  {
    id: 'ua_perm',
    name: 'Chu trình 3 cạnh Ua (Cột M)',
    recognition: '3 cạnh trên tầng M bị lệch vị trí ngược chiều kim đồng hồ: UF cần về DF, DF cần về UB, UB cần về UF.',
    alg: 'M2 U\' M U2 M\' U\' M2',
    setupAlg: 'M2 U M U2 M\' U M2',
    tip: 'Phiên bản đối xứng của Ub với move U\' thay vì U.',
  },
  {
    id: 'h_perm',
    name: 'Thế H-Perm (Hoán đổi 2 cặp đối xứng)',
    recognition: 'UF đổi chỗ với UB, đồng thời DF đổi chỗ với DB. Bốn cạnh tầng M đổi chéo nhau từng cặp đối diện.',
    alg: 'M2 U M2 U2 M2 U M2',
    setupAlg: 'M2 U M2 U2 M2 U M2',
    tip: 'Công thức nhịp nhàng đối xứng hoàn toàn, hoàn tất Rubik trong chớp mắt.',
  },
  {
    id: 'z_perm',
    name: 'Thế Z-Perm (Hoán đổi 2 cặp kề nhau)',
    recognition: 'Cạnh UF đổi chỗ với DF, đồng thời cạnh UB đổi chỗ với DB.',
    alg: 'M2 U M2 U M\' U2 M2 U2 M\'',
    setupAlg: 'M U2 M2 U2 M U\' M2 U\' M2',
    tip: 'Sử dụng kỹ thuật gạt M kết hợp U2 để giải 2 cặp cạnh kề trên tầng M.',
  },
];
