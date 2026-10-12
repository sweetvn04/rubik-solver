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
  group: '1_white_edge' | '1_white_edge_center' | 'special';
  groupName: string;
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
    setupAlg: "M U M U M' U M",
    recognitionTip: 'Đặt 1 cạnh sai ở U tại vị trí UB (phía sau), 1 cạnh sai ở D tại vị trí DF (phía trước). Xoay trigger M\' U\' M U\' sẽ chuyển thành thế cơ bản 3/1 (F).',
    diagramU: ['B', 'G', 'G', 'G'], // UB Bad
    diagramD: ['G', 'B'],          // DF Bad
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
    recognitionTip: 'Đặt 1 cạnh sai ở U tại vị trí UF (phía trước), 1 cạnh sai ở D tại vị trí DB (phía sau). Xoay trigger M\' U\' M\' U\' sẽ chuyển thành thế cơ bản 3/1 (B).',
    diagramU: ['G', 'G', 'B', 'G'], // UF Bad
    diagramD: ['B', 'G'],          // DB Bad
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
    setupAlg: "M U M' U' M U M",
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
    setupAlg: "M U M U M' U' M",
    recognitionTip: 'Tầng D không có cạnh sai. Hai cạnh sai ở tầng U nằm đối diện nhau qua tâm (đặt ở UF và UB). Xoay trigger M\' U M U\' sẽ chuyển thành thế cơ bản 3/1 (F).',
    diagramU: ['B', 'G', 'B', 'G'], // UB Bad, UF Bad
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
    recognitionTip: 'Tầng D không có cạnh sai. Hai cạnh sai ở tầng U nằm kề nhau: BẮT BUỘC đặt tại vị trí UB (sau) và UL (trái). (Nếu để ở UF/UL xoay sẽ bị lặp vòng 2/0). Xoay trigger M\' U M\' U2 sẽ chuyển thành thế cơ bản 3/1 (F). Mẹo: Nếu đặt tại UB và UR thì công thức đối xứng là M\' U\' M\' U2.',
    diagramU: ['B', 'G', 'G', 'B'], // UB Bad, UL Bad
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
    recognitionTip: '2 cạnh sai ở U kề nhau (đặt tại UB và UL). 2 cạnh sai ở D (DF và DB). Chỉ cần xoay trigger cực ngắn M2 U\' là đưa thẳng về thế cơ bản 3/1 (F).',
    diagramU: ['B', 'G', 'G', 'B'], // UB Bad, UL Bad
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
    setupAlg: "M U M U2 M U2 M'",
    recognitionTip: '2 cạnh sai ở U đối diện nhau (đặt tại UL và UR ở 2 bên hông). 2 cạnh sai ở D (DF và DB). Xoay trigger M U2 M\' U2 sẽ chuyển thành thế cơ bản 3/1 (F).',
    diagramU: ['G', 'B', 'G', 'B'], // UR Bad, UL Bad
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
    setupAlg: "M U M U M' U M U2 M U' M",
    recognitionTip: 'Toàn bộ 6 cạnh đều sai (4 ở tầng U và 2 ở tầng D). Cách 1 (Roux cơ bản): Xoay M\' U M\' U2 đưa về thế 1/1 (F) rồi giải tiếp. Cách 2 (1-look nâng cao theo Google Site): R U\' r\' U\' M\' U r U r\'.',
    diagramU: ['B', 'B', 'B', 'B'],
    diagramD: ['B', 'B'],
  },
];


// ─────────────────────────────────────────────────────────────
// 3. DỮ LIỆU CẨM NANG LSE — UL/UR & L4E
// ─────────────────────────────────────────────────────────────

export interface ULURSampleCase {
  id: string;
  name: string;
  caseType: '1_u_1_d' | '2_u' | '2_d' | 'solved_one';
  condition: string;
  alg: string;
  setupAlg: string;
  tip: string;
}

export const LSE_UL_UR_GUIDE = {
  title: 'Bước 4b: Đưa 2 cạnh cánh UL & UR về đúng vị trí (Chuẩn Roux)',
  objective: 'Giải 2 cạnh bên hông tầng U (UL màu Vàng-Cam và UR màu Vàng-Đỏ) để phân tách toàn bộ cạnh cánh ra khỏi cột giữa M. Sau bước này, khối Rubik chỉ còn đúng 4 cạnh trên cột giữa M (bước 4c L4E) chỉ dùng <M, U2>.',
  rules: [
    'Tập nước đi duy nhất được phép sử dụng: <M, U>. Tuyệt đối không xoay R, L, F, B để bảo vệ First Block và Second Block.',
    'Bảo toàn định hướng EO: Vì bước 4a đã giải xong EO nên tất cả 6 cạnh đều đã là Good Edges. Mọi thao tác xoay <M, U> đều giữ nguyên tính chất Good của các cạnh.',
    'Nhận diện màu 2 cánh: Cạnh UL (Vàng - Cam, nằm bên trái), Cạnh UR (Vàng - Đỏ, nằm bên phải) khi mặt F là Xanh lá (Lục).',
  ],
  initialCases: [
    {
      caseType: '1_u_1_d',
      title: 'Trường hợp 1: Một cạnh ở tầng U, một cạnh ở tầng D',
      description: 'Phổ biến nhất. Chỉ cần xoay U đưa cạnh ở tầng U vào vị trí đối diện với cạnh ở tầng D (ví dụ: cạnh ở D tại DB thì đưa cạnh ở U về UF; cạnh ở D tại DF thì đưa cạnh ở U về UB).',
      nextAction: 'Chuyển sang Giai đoạn 2 để úp cả 2 cạnh xuống đáy D.',
    },
    {
      caseType: '2_u',
      title: 'Trường hợp 2: Cả 2 cạnh UL & UR đều ở tầng U',
      description: 'Xoay U đưa 1 cạnh vào vị trí UF hoặc UB. Gạt M hoặc M\' (hoặc M2) để đẩy viên đó xuống tầng D. Sau đó xoay U đưa viên còn lại vào vị trí đối diện.',
      nextAction: 'Đã chuyển thành Trường hợp 1, tiếp tục Giai đoạn 2.',
    },
    {
      caseType: '2_d',
      title: 'Trường hợp 3: Cả 2 cạnh UL & UR đều đã ở tầng D (DF & DB)',
      description: 'Cực kỳ may mắn! Bạn không cần làm Giai đoạn 1 và 2 mà đi thẳng trực tiếp tới Giai đoạn 3 (chỉ cần canh màu góc F rồi gạt M2).',
      nextAction: 'Nhảy thẳng sang Giai đoạn 3 để hoàn tất 2 cánh!',
    },
  ],
  phases: [
    {
      step: 1,
      title: 'Giai đoạn 1: Đưa 2 cạnh vào vị trí đối nhau trên cột M',
      content: 'Tìm vị trí của 2 cạnh UL (Vàng-Cam) và UR (Vàng-Đỏ). Bằng các nước đi U và M/M\', hãy đưa 2 cạnh này vào 2 vị trí đối diện nhau qua tâm: một viên ở UF và một viên ở DB (hoặc một viên ở UB và một viên ở DF).',
    },
    {
      step: 2,
      title: 'Giai đoạn 2: Gom cả 2 cạnh UL & UR xuống tầng đáy D',
      content: 'Khi 2 cạnh đã ở thế đối nhau: Xoay M hoặc M\' để úp viên ở U xuống D, xoay U2 để đưa viên còn lại vào thế đối, rồi xoay tiếp M hoặc M\' để gom cả 2 viên UL và UR xuống nằm trọn vẹn ở 2 vị trí đáy DF và DB.',
    },
    {
      step: 3,
      title: 'Giai đoạn 3: Canh góc tầng U và gạt M2 đưa về 2 cánh',
      content: 'Quan sát màu mặt F của 2 góc tầng U. Xoay U, U\' hoặc U2 sao cho màu mặt F của góc đối màu (hoặc cùng màu) với cạnh ở DF. Sau đó gạt M2 dứt điểm: hai viên UL và UR sẽ tự động bay thẳng từ đáy D lên đúng 2 cánh trái/phải 100%!',
    },
  ],
  samples: [
    {
      id: 'ulur_sample_1',
      name: 'Thế 1: 1 cạnh ở UF, 1 cạnh ở DB (Đối nhau qua tâm)',
      caseType: '1_u_1_d',
      condition: 'Cạnh UL đang ở UF (tầng U), cạnh UR đang ở DB (tầng D).',
      alg: "U' M' U2 M",
      setupAlg: "M' U2 M U",
      tip: "Xoay U' đưa về trục, gạt M' úp xuống D, U2 ghép cặp đối, M đưa cả 2 về D.",
    },
    {
      id: 'ulur_sample_2',
      name: 'Thế 2: 1 cạnh ở UB, 1 cạnh ở DF (Đối nhau qua tâm)',
      caseType: '1_u_1_d',
      condition: 'Cạnh UL đang ở UB (tầng U), cạnh UR đang ở DF (tầng D).',
      alg: "U' M U2 M",
      setupAlg: "M' U2 M' U",
      tip: "Đối xứng của Thế 1. Xoay U' M U2 M để gom 2 cạnh xuống đáy.",
    },
    {
      id: 'ulur_sample_3',
      name: 'Thế 3: Cả 2 cạnh đều ở tầng U (UF và UB)',
      caseType: '2_u',
      condition: 'Cả 2 viên UL và UR đều nằm trên cột M ở tầng U (vị trí UF và UB).',
      alg: "U2 M' U2 M' U M2",
      setupAlg: "M2 U' M U2 M U2",
      tip: "Úp 1 viên xuống đáy, U2 đưa viên kia vào đối diện, gạt M' đưa cả 2 xuống D rồi kết thúc bằng M2.",
    },
    {
      id: 'ulur_sample_4',
      name: 'Thế 4: Cả 2 cạnh đã ở sẵn tầng đáy D (DF và DB)',
      caseType: '2_d',
      condition: 'Cả 2 viên UL và UR đã nằm ở đáy DF và DB. Chỉ cần canh góc U rồi gạt M2.',
      alg: "U M2",
      setupAlg: "M2 U'",
      tip: "Quan sát màu mặt F của góc U, xoay U để canh góc đối màu với DF, rồi gạt M2 là xong 2 cánh!",
    },
    {
      id: 'ulur_sample_5',
      name: 'Thế 5: 1 cạnh đã ở đúng vị trí UL, 1 cạnh ở đáy DF',
      caseType: 'solved_one',
      condition: 'Cạnh UL đã nằm đúng bên trái, cạnh UR đang ở đáy DF.',
      alg: "M' U2 M",
      setupAlg: "M' U2 M",
      tip: "Đưa cạnh UR từ đáy lên cánh phải UR mà không làm xáo trộn cạnh UL bên trái.",
    },
  ] as ULURSampleCase[],
};

export const LSE_L4E_INTUITIVE_GUIDE = {
  title: 'Phương pháp Tự nghiệm (Intuitive) 3 bước giải L4E',
  subtitle: 'Chỉ cần sử dụng duy nhất tập nước đi <M, U2> để hoàn thành 4 cạnh cuối mà không cần học vẹt công thức!',
  steps: [
    {
      title: 'Giai đoạn 1: Đưa 2 cạnh màu Trắng (DF & DB) xuống đáy',
      content: 'Quan sát tìm 2 cạnh có màu trắng ở cột M. Nếu cả 2 viên đang ở tầng U: xoay U2 đưa 1 viên vào vị trí đối diện rồi dùng M2 đưa xuống D. Nếu 1 viên ở U và 1 viên ở D: dùng M\' U2 M hoặc M U2 M\' để gom cả 2 viên về đáy D.',
    },
    {
      title: 'Giai đoạn 2: Khớp tâm tầng D (Xử lý D-Dots)',
      content: 'Kiểm tra tâm đáy D: Nếu 2 cạnh đáy đã là màu trắng nhưng tâm D lại đang là màu vàng (thế D-Dots): chỉ cần duy nhất 1 nước gạt M2 để hoán vị tâm U và D về đúng mặt!',
    },
    {
      title: 'Giai đoạn 3: Hoán vị các cạnh tầng U & Hoàn tất (AUF)',
      content: 'Hai cạnh còn lại trên tầng U (UF và UB): nếu bị ngược vị trí thì xoay U2 (hoặc chuỗi M2 U2 M2 nếu lệch cặp cột M). Sau đó xoay nấc U / U\' / U2 cuối cùng để khớp toàn bộ 6 mặt của khối Rubik!',
    },
  ],
};

export const LSE_L4E_CASES: L4ECase[] = [
  // ── NHÓM 1: 1 CẠNH TRẮNG TRÊN MẶT U (TÂM U LÀ VÀNG) ──
  {
    id: 'l4e_1_1',
    name: 'Thế 1.1: Trắng ở UF, đáy lệch chéo',
    group: '1_white_edge',
    groupName: '1 Cạnh Trắng ở U (Tâm Vàng)',
    recognition: 'Tâm U là Vàng. Mặt U có 1 cạnh Trắng ở UF. Cạnh DF Trắng (F Lam), cạnh DB Vàng (B Lam).',
    alg: "U2 M U2 M'",
    setupAlg: "M U2 M' U2",
    tip: 'Lưu ý: Luôn để mặt màu Lục (F=Xanh lá) trước mặt rồi mới xoay.',
  },
  {
    id: 'l4e_1_2',
    name: 'Thế 1.2: Trắng ở UF, đáy lệch thẳng',
    group: '1_white_edge',
    groupName: '1 Cạnh Trắng ở U (Tâm Vàng)',
    recognition: 'Tâm U là Vàng. Mặt U có 1 cạnh Trắng ở UF. Cạnh DF Vàng (F Xanh lá), cạnh DB Trắng (B Xanh lá).',
    alg: "M' U2 M' U2 M2",
    setupAlg: "M2 U2 M U2 M",
    tip: 'Luôn để mặt Lục (F) trước mặt. Xoay M\' U2 M\' U2 M2.',
  },
  {
    id: 'l4e_1_3',
    name: 'Thế 1.3: Trắng ở UB, đáy lệch chéo',
    group: '1_white_edge',
    groupName: '1 Cạnh Trắng ở U (Tâm Vàng)',
    recognition: 'Tâm U là Vàng. Mặt U có 1 cạnh Trắng ở UB. Cạnh DF Vàng (F Xanh lá), cạnh DB Trắng (B Lam).',
    alg: "U2 M' U2 M",
    setupAlg: "M' U2 M U2",
    tip: 'Luôn để mặt Lục (F) trước mặt. Xoay U2 M\' U2 M.',
  },
  {
    id: 'l4e_1_4',
    name: 'Thế 1.4: Trắng ở UB, đáy lệch thẳng',
    group: '1_white_edge',
    groupName: '1 Cạnh Trắng ở U (Tâm Vàng)',
    recognition: 'Tâm U là Vàng. Mặt U có 1 cạnh Trắng ở UB. Cạnh DF Trắng (F Lam), cạnh DB Vàng (B Xanh lá).',
    alg: "M U2 M' U2",
    setupAlg: "U2 M U2 M'",
    tip: 'Nghịch đảo của Thế 1.1. Luôn để mặt Lục (F) trước mặt.',
  },
  {
    id: 'l4e_1_5',
    name: 'Thế 1.5: Trắng ở UF, chu kỳ 3 cạnh nghịch đảo 1.2',
    group: '1_white_edge',
    groupName: '1 Cạnh Trắng ở U (Tâm Vàng)',
    recognition: 'Tâm U là Vàng. Mặt U có 1 cạnh Trắng ở UF. Cạnh DF Trắng (F Lam), cạnh DB Vàng (B Xanh lá).',
    alg: "M2 U2 M U2 M",
    setupAlg: "M' U2 M' U2 M2",
    tip: 'Nghịch đảo của Thế 1.2. Luôn để mặt Lục (F) trước mặt.',
  },
  {
    id: 'l4e_1_6',
    name: 'Thế 1.6: Trắng ở UF, đổi vị trí với DB',
    group: '1_white_edge',
    groupName: '1 Cạnh Trắng ở U (Tâm Vàng)',
    recognition: 'Tâm U là Vàng. Mặt U có 1 cạnh Trắng ở UF. Cạnh DF Vàng (F Lam), cạnh DB Trắng (B Lam).',
    alg: "M' U2 M U2",
    setupAlg: "U2 M' U2 M",
    tip: 'Nghịch đảo của Thế 1.3. Luôn để mặt Lục (F) trước mặt.',
  },
  {
    id: 'l4e_1_7',
    name: 'Thế 1.7: Trắng ở UB, ghép cạnh đáy',
    group: '1_white_edge',
    groupName: '1 Cạnh Trắng ở U (Tâm Vàng)',
    recognition: 'Tâm U là Vàng. Mặt U có 1 cạnh Trắng ở UB. Cạnh DF Vàng (F Lam), cạnh DB Trắng (B Xanh lá).',
    alg: "M2 U2 M' U2 M'",
    setupAlg: "M U2 M U2 M2",
    tip: 'Luôn để mặt Lục (F) trước mặt. Xoay M2 U2 M\' U2 M\'.',
  },
  {
    id: 'l4e_1_8',
    name: 'Thế 1.8: Trắng ở UB, nghịch đảo 1.7',
    group: '1_white_edge',
    groupName: '1 Cạnh Trắng ở U (Tâm Vàng)',
    recognition: 'Tâm U là Vàng. Mặt U có 1 cạnh Trắng ở UB. Cạnh DF Trắng (F Lam), cạnh DB Vàng (B Lam).',
    alg: "M U2 M U2 M2",
    setupAlg: "M2 U2 M' U2 M'",
    tip: 'Nghịch đảo của Thế 1.7. Luôn để mặt Lục (F) trước mặt.',
  },

  // ── NHÓM 2: 1 CẠNH TRẮNG VÀ TÂM U TRẮNG (TÂM U LÀ TRẮNG, 3 CẠNH VÀNG Ở U) ──
  {
    id: 'l4e_2_1',
    name: 'Thế 2.1: Tâm U trắng, Trắng ở UF',
    group: '1_white_edge_center',
    groupName: '1 Cạnh + Tâm Trắng ở U',
    recognition: 'Tâm U là Trắng (lệch tâm). Mặt U có 1 cạnh Trắng ở UF, cạnh DF Trắng, DB Vàng.',
    alg: "U2 M' U2 M'",
    setupAlg: "M U2 M U2",
    tip: 'Luôn để mặt Lục (F) trước mặt. Xoay U2 M\' U2 M\'.',
  },
  {
    id: 'l4e_2_2',
    name: 'Thế 2.2: Tâm U trắng, Trắng ở UF, đáy lệch',
    group: '1_white_edge_center',
    groupName: '1 Cạnh + Tâm Trắng ở U',
    recognition: 'Tâm U là Trắng. Mặt U có 1 cạnh Trắng ở UF, cạnh DF Vàng, DB Trắng.',
    alg: "M U2 M' U2 M2",
    setupAlg: "M2 U2 M U2 M'",
    tip: 'Luôn để mặt Lục (F) trước mặt. Xoay M U2 M\' U2 M2.',
  },
  {
    id: 'l4e_2_3',
    name: 'Thế 2.3: Tâm U trắng, Trắng ở UF, nghịch đảo 2.1',
    group: '1_white_edge_center',
    groupName: '1 Cạnh + Tâm Trắng ở U',
    recognition: 'Tâm U là Trắng. Mặt U có 1 cạnh Trắng ở UF, cạnh DF Vàng, DB Trắng (F Lam, B Lam).',
    alg: "M U2 M U2",
    setupAlg: "U2 M' U2 M'",
    tip: 'Nghịch đảo của Thế 2.1. Luôn để mặt Lục (F) trước mặt.',
  },
  {
    id: 'l4e_2_4',
    name: 'Thế 2.4: Tâm U trắng, Trắng ở UF, ghép đáy chéo',
    group: '1_white_edge_center',
    groupName: '1 Cạnh + Tâm Trắng ở U',
    recognition: 'Tâm U là Trắng. Mặt U có 1 cạnh Trắng ở UF, cạnh DF Trắng, DB Vàng (F Lam, B Xanh lá).',
    alg: "M2 U2 M' U2 M",
    setupAlg: "M' U2 M U2 M2",
    tip: 'Luôn để mặt Lục (F) trước mặt. Xoay M2 U2 M\' U2 M.',
  },
  {
    id: 'l4e_2_5',
    name: 'Thế 2.5: Tâm U trắng, Trắng ở UB',
    group: '1_white_edge_center',
    groupName: '1 Cạnh + Tâm Trắng ở U',
    recognition: 'Tâm U là Trắng. Mặt U có 1 cạnh Trắng ở UB, cạnh DF Vàng, DB Trắng.',
    alg: "U2 M U2 M",
    setupAlg: "M' U2 M' U2",
    tip: 'Luôn để mặt Lục (F) trước mặt. Xoay U2 M U2 M.',
  },
  {
    id: 'l4e_2_6',
    name: 'Thế 2.6: Tâm U trắng, Trắng ở UB, nghịch đảo 2.5',
    group: '1_white_edge_center',
    groupName: '1 Cạnh + Tâm Trắng ở U',
    recognition: 'Tâm U là Trắng. Mặt U có 1 cạnh Trắng ở UB, cạnh DF Trắng, DB Vàng.',
    alg: "M' U2 M' U2",
    setupAlg: "U2 M U2 M",
    tip: 'Nghịch đảo của Thế 2.5. Luôn để mặt Lục (F) trước mặt.',
  },
  {
    id: 'l4e_2_7',
    name: 'Thế 2.7: Tâm U trắng, Trắng ở UB, nghịch đảo 2.4',
    group: '1_white_edge_center',
    groupName: '1 Cạnh + Tâm Trắng ở U',
    recognition: 'Tâm U là Trắng. Mặt U có 1 cạnh Trắng ở UB, cạnh DF Trắng, DB Vàng (F Lam, B Lam).',
    alg: "M' U2 M U2 M2",
    setupAlg: "M2 U2 M' U2 M",
    tip: 'Nghịch đảo của Thế 2.4. Luôn để mặt Lục (F) trước mặt.',
  },
  {
    id: 'l4e_2_8',
    name: 'Thế 2.8: Tâm U trắng, Trắng ở UB, nghịch đảo 2.2',
    group: '1_white_edge_center',
    groupName: '1 Cạnh + Tâm Trắng ở U',
    recognition: 'Tâm U là Trắng. Mặt U có 1 cạnh Trắng ở UB, cạnh DF Vàng, DB Trắng (F Lam, B Xanh lá).',
    alg: "M2 U2 M U2 M'",
    setupAlg: "M U2 M' U2 M2",
    tip: 'Nghịch đảo của Thế 2.2. Luôn để mặt Lục (F) trước mặt.',
  },

  // ── NHÓM 3: CÁC TRƯỜNG HỢP ĐẶC BIỆT (CỘT M / D-DOTS / PERMS) ──
  {
    id: 'l4e_ub',
    name: 'Chu trình 3 cạnh Ub (Cột M)',
    group: 'special',
    groupName: 'Thế Đặc Biệt (Cột M / Dots)',
    recognition: '3 cạnh trên tầng M lệch vị trí theo chiều kim đồng hồ: UF -> UB -> DF. Cạnh DB đã đúng.',
    alg: "M U2 M2 U2 M'",
    setupAlg: "M U2 M2 U2 M'",
    tip: 'Công thức tối ưu chỉ 5 moves <M, U2> độc quyền của Roux (hoặc M2 U M U2 M\' U M2).',
  },
  {
    id: 'l4e_ua',
    name: 'Chu trình 3 cạnh Ua (Cột M)',
    group: 'special',
    groupName: 'Thế Đặc Biệt (Cột M / Dots)',
    recognition: '3 cạnh trên tầng M lệch vị trí ngược chiều kim đồng hồ: UF -> DF -> UB. Cạnh DB đã đúng.',
    alg: "M' U2 M2 U2 M'",
    setupAlg: "M U2 M2 U2 M",
    tip: 'Phiên bản đối xứng của Ub với move M\' ở đầu.',
  },
  {
    id: 'l4e_dots_diag',
    name: 'Thế D-Dots Chéo (Đổi chéo 2 cặp M)',
    group: 'special',
    groupName: 'Thế Đặc Biệt (Cột M / Dots)',
    recognition: 'UF đổi chỗ với DB, đồng thời UB đổi chỗ với DF (chéo nhau trên tầng giữa M).',
    alg: "U2 M' U2 M2 U2 M' U2",
    setupAlg: "U2 M U2 M2 U2 M U2",
    tip: 'Công thức 7 moves <M, U2> mượt tay, không cần xoay lớp E (hoặc E2 M E2 M).',
  },
  {
    id: 'l4e_dots_line',
    name: 'Thế D-Dots Thẳng (Đổi dọc 2 cặp M)',
    group: 'special',
    groupName: 'Thế Đặc Biệt (Cột M / Dots)',
    recognition: 'Tâm đối màu và 4 cạnh cột M bị tráo đổi song song đối xứng.',
    alg: "U2 M' U2 M2 U2 M' U2 M2",
    setupAlg: "M2 U2 M U2 M2 U2 M U2",
    tip: 'Giải quyết hoàn hảo thế D-Dots thẳng chỉ trong 8 moves <M, U2> (hoặc E2 M E2 M\').',
  },
  {
    id: 'l4e_h',
    name: 'Thế H-Perm (Hoán đổi 2 cặp đối diện)',
    group: 'special',
    groupName: 'Thế Đặc Biệt (Cột M / Dots)',
    recognition: 'UF đổi chỗ với UB, đồng thời DF đổi chỗ với DB. Bốn cạnh tầng M đổi chéo nhau từng cặp đối diện.',
    alg: "U2 M2 U2 M2",
    setupAlg: "M2 U2 M2 U2",
    tip: 'Công thức thần sầu chỉ 4 moves U2 M2 U2 M2 hoàn tất khối Rubik (hoặc M2 U M2 U2 M2 U M2).',
  },
  {
    id: 'l4e_z',
    name: 'Thế Z-Perm (Hoán đổi 2 cặp kề nhau)',
    group: 'special',
    groupName: 'Thế Đặc Biệt (Cột M / Dots)',
    recognition: 'Cạnh UF đổi chỗ với DF, đồng thời cạnh UB đổi chỗ với DB.',
    alg: "M2 U M2 U M' U2 M2 U2 M'",
    setupAlg: "M U2 M2 U2 M U' M2 U' M2",
    tip: 'Sử dụng kỹ thuật gạt M kết hợp U2 để giải 2 cặp cạnh kề trên tầng M.',
  },
  {
    id: 'l4e_dots_base',
    name: 'Thế D-Dots cơ bản (Lệch tâm đáy)',
    group: 'special',
    groupName: 'Thế Đặc Biệt (Cột M / Dots)',
    recognition: 'Hai cạnh tầng D (DF và DB) đã cùng màu trắng nhưng tâm đáy D lại đang là vàng (hoặc ngược lại).',
    alg: "M2",
    setupAlg: "M2",
    tip: 'Chỉ cần gạt M2 là hoán vị tâm U và D về đúng mặt, đưa về trạng thái hoàn hảo.',
  },
];

