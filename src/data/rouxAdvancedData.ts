/**
 * rouxAdvancedData.ts
 * Tổng hợp toàn bộ dữ liệu nâng cao, chuyên sâu từ giáo trình RouxMethodVN:
 * 1. Fast EO Recognition: Kỹ thuật nhận biết nhanh EO qua 1 sticker FD.
 * 2. Dots Skipping & Ez L4E: Kỹ thuật né D-Dots, điều khiển UF/DB đưa về thế Good L4E.
 * 3. EOLR (Edge Orientation + Left/Right): Kỹ thuật kết hợp giải EO và đưa UL/UR về DF/DB.
 * 4. Pro Techniques: Non-Matching Centres (NMC), Free Blockbuilding, Non-Matching Blocks, Influencing EO.
 * 5. CMLL One-Handed (OH): 42 công thức tối ưu hóa cho giải 1 tay (không dùng F/M).
 * 6. Sub-X Roadmap: Lộ trình tiến bộ từ Mới chơi (>1:00) đến Sub-10 (Movecount & thời gian).
 * 7. Meyer Method: Phương pháp Roux mở rộng trên Rubik 4x4x4.
 */

export interface FastEORule {
  uBadCount: number;
  fdStatus: 'bad' | 'good'; // bad: có màu U/D (vàng/trắng), good: không có màu U/D
  inferredCase: string;
  explanation: string;
}

export interface EOLRCase {
  id: string;
  name: string;
  eoGroup: string; // '3/1 (F)', '4/2', '4/0', v.v.
  ulurPosition: string; // 'UF DF', 'UR DB', v.v.
  solution: string;
  setupAlg: string;
  savedMoves: string;
  tip: string;
}

export interface DotsSkipCase {
  id: string;
  name: string;
  pattern: string;
  standardSolution: string;
  standardResult: string;
  ezSolution: string;
  ezResult: string;
  tip: string;
}

export interface ProTechnique {
  id: string;
  title: string;
  vietnameseTitle: string;
  summary: string;
  howItWorks: string;
  scramble?: string;
  solution?: string;
  pros: string[];
  cons: string[];
}

export interface SubXStage {
  level: string;
  timeRange: string;
  fbMoveTarget: string;
  sbMoveTarget: string;
  cmllTarget: string;
  lseTarget: string;
  timeSplit: string; // FB - SB - CMLL - LSE
  coreFocus: string[];
  advice: string;
}

export interface MeyerStep {
  stepNumber: number;
  title: string;
  objective: string;
  keyRule: string;
  tips: string;
}

// ─────────────────────────────────────────────────────────────
// 1. NHẬN BIẾT NHANH EO (FAST EO RECOGNITION)
// ─────────────────────────────────────────────────────────────

export const FAST_EO_GUIDE = {
  title: 'Nhận biết nhanh EO trong < 1 giây (Không lật đáy)',
  principle: 'Tổng số cạnh sai (Bad edges) trên toàn khối Rubik LUÔN LUÔN LÀ SỐ CHẴN (0, 2, 4 hoặc 6).',
  formula: '[Số cạnh sai mặt U] + [Màu sticker FD] ➔ Đoán chính xác tên trường hợp EO',
  steps: [
    {
      title: 'Bước 1: Đếm số cạnh sai trên mặt U',
      content: 'Cạnh sai trên mặt U là cạnh KHÔNG CÓ màu Vàng hoặc Trắng hướng lên trên (tối thiểu 0, tối đa 4). Nếu số cạnh sai là chẵn (0, 2, 4) thì tổng số cạnh sai toàn khối là chẵn. Nếu số lẻ (1, 3) thì số cạnh sai ở đáy phải là số lẻ (1 cạnh sai ở đáy) để tổng chẵn!',
    },
    {
      title: 'Bước 2: Chỉ nhìn duy nhất 1 sticker ở vị trí FD (Mặt trước cạnh đáy)',
      content: 'Không cần ngửa Rubik lên xem mặt DF/DB! Chỉ cần nhìn sticker hướng về phía bạn ở vị trí FD (mặt F của cạnh dưới):\n• Nếu sticker FD có màu Trắng hoặc Vàng ➔ Cạnh DF này là SAI (Bad).\n• Nếu sticker FD KHÔNG PHẢI Trắng hoặc Vàng ➔ Cạnh DF này là ĐÚNG (Good).',
    },
    {
      title: 'Bước 3: Suy luận tức thì trạng thái của viên DB phía sau',
      content: 'Nhờ định lý tổng chẵn: Nếu U có 1 cạnh sai và DF là Good (0 sai ở FD) ➔ chắc chắn DB phải là Bad để tổng = 2 (Thế 1/1 F/B). Nếu U có 3 cạnh sai và DF là Bad ➔ DB phải là Good để tổng = 4 (Thế 3/1 F)!',
    },
  ],
  lookupTable: [
    {
      uBadCount: 1,
      fdStatus: 'bad',
      inferredCase: 'Thế 1/1 (F)',
      explanation: 'U có 1 Bad, FD là Bad ➔ DF chính là cạnh sai, DB đúng ➔ Thế 1/1 ở phía Trước (F).',
    },
    {
      uBadCount: 1,
      fdStatus: 'good',
      inferredCase: 'Thế 1/1 (B)',
      explanation: 'U có 1 Bad, FD là Good ➔ DF đúng, suy ra DB phía sau phải là Bad ➔ Thế 1/1 ở phía Sau (B).',
    },
    {
      uBadCount: 3,
      fdStatus: 'good',
      inferredCase: 'Thế 3/1 (F)',
      explanation: 'U có 3 Bad, FD là Good ➔ viên sai còn lại ở DB phía sau ➔ Khi đưa về cơ bản dùng M\' U M\' (3/1 F).',
    },
    {
      uBadCount: 3,
      fdStatus: 'bad',
      inferredCase: 'Thế 3/1 (B)',
      explanation: 'U có 3 Bad, FD là Bad ➔ viên sai ở DF phía trước ➔ Khi đưa về cơ bản dùng M U M (3/1 B).',
    },
    {
      uBadCount: 2,
      fdStatus: 'bad',
      inferredCase: 'Thế 2a/2 hoặc 2o/2',
      explanation: 'U có 2 Bad (kề hoặc đối), FD là Bad ➔ ở D phải có đúng 2 Bad ➔ Cả DF và DB đều Bad.',
    },
    {
      uBadCount: 2,
      fdStatus: 'good',
      inferredCase: 'Thế 2a/0 hoặc 2o/0',
      explanation: 'U có 2 Bad, FD là Good ➔ ở D không có Bad nào ➔ Cả DF và DB đều Good (0 Bad ở đáy).',
    },
    {
      uBadCount: 4,
      fdStatus: 'good',
      inferredCase: 'Thế 4/0',
      explanation: 'U có cả 4 Bad, FD là Good ➔ Đáy D hoàn toàn Good ➔ Chỉ cần M\' U2 M\' là xong.',
    },
    {
      uBadCount: 4,
      fdStatus: 'bad',
      inferredCase: 'Thế 4/2',
      explanation: 'U có cả 4 Bad, FD là Bad ➔ Cả 6 cạnh đều Bad (4 ở U, 2 ở D) ➔ M\' U M\' đưa về 3/1.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 2. DOTS SKIPPING & EZ L4E
// ─────────────────────────────────────────────────────────────

export const DOTS_SKIPPING_GUIDE = {
  title: 'Dots Skipping & Ez L4E (Né D-Dots, Rút ngắn L4E)',
  overview: 'Sau khi làm xong UL/UR, rất nhiều người rơi vào thế D-Dots (chấm đối tâm đáy), phải mất 6-12 moves (E2 M E2 M\' hoặc U2 M\' U2 M2 U2 M\' U2 M2). Kỹ thuật Dots Skipping giúp né hoàn toàn Dots ngay từ bước giải UL/UR!',
  keyConcept: 'Dựa vào thanh màu cạnh UL/UR ở mặt F và màu góc ở F để điều khiển move chèn M U2 M\' hay M\' U2 M.',
  patterns: [
    {
      id: 'ds_h_line',
      name: 'Thanh ngang màu trắng ở F',
      condition: 'Cạnh UL/UR ở F tạo thành thanh màu trắng nằm ngang.',
      standardRule: 'Nếu xoay M U2 M\' theo thói quen ➔ Bị dính D-Dots (Bad).',
      skipTrick: 'Chuyển sang dùng M\' U2 M hoặc giữ lại thanh ngang ➔ Né hoàn toàn D-Dots, L4E đưa về chu trình đẹp.',
      formula: 'M\' U2 M (hoặc M U2 M tuỳ góc F)',
    },
    {
      id: 'ds_v_line',
      name: 'Thanh dọc màu vàng ở F',
      condition: 'Cạnh UL/UR ở F tạo thành thanh màu vàng chạy dọc.',
      standardRule: 'Nếu xoay M\' U2 M ➔ Dính D-Dots.',
      skipTrick: 'Dùng M U2 M ➔ Chuyển thành thanh ngang, đưa về thế Good L4E chỉ tốn 5 moves.',
      formula: 'M U2 M',
    },
    {
      id: 'ds_isolated',
      name: 'Viên đơn độc ở mặt U (Mình ta cô đơn)',
      condition: 'Chỉ có đúng 1 cạnh vàng hoặc trắng trên đỉnh U.',
      standardRule: 'Làm bình thường mất 11 moves: M\' U2 M U M2 U + M\' U2 M2 U2 M.',
      skipTrick: 'Nhìn màu góc ở F không trùng cạnh ➔ B2 ➔ M U2 M + U\' M2 U\' (Rút ngắn còn đúng 6 moves!).',
      formula: 'M U2 M + U\' M2 U\'',
    },
  ],
  ezL4ECases: [
    {
      id: 'ez_good_line',
      name: 'Thế Good L4E Tiêu Chuẩn',
      moves: "U' M2 U' U2 M2 U2 M2",
      explanation: 'Sau khi né dots thành công, L4E chỉ gồm các move U và M2 cực kỳ mượt tay.',
    },
    {
      id: 'ez_skip',
      name: 'Skip Hoàn Toàn L4E (0 moves)',
      moves: "U hoặc U'",
      explanation: 'Khi xếp chuẩn UL/UR với Dots Skipping, các cạnh tầng M tự động về đúng vị trí, chỉ cần 1 move U/U\' là giải xong cả khối Rubik!',
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 3. CẨM NANG EOLR (EDGE ORIENTATION + LEFT/RIGHT)
// ─────────────────────────────────────────────────────────────

export const EOLR_GUIDE = {
  title: 'EOLR — Đỉnh Cao LSE (Kết Hợp 4a & 4b trong 1 Bước)',
  overview: 'EOLR là kỹ thuật định hướng 6 cạnh (EO) đồng thời điều khiển 2 cạnh UL và UR về sẵn tầng đáy D (DF và DB). Khi hoàn thành EOLR, bạn chỉ cần gạt M2 là xong bước 4b và tiến thẳng vào L4E!',
  efficiency: 'Giảm từ 13-16 moves (EO rời + UL/UR rời) xuống còn 5-7 moves mượt mà!',
  samples: [
    {
      id: 'eolr_31_uf_df',
      name: 'Thế 3/1 (F) — UL/UR tại UF & DF',
      eoGroup: '3/1 (F)',
      ulurPosition: 'UF & DF',
      solution: 'M U\' M2 U',
      setupAlg: 'M\' U M2 U M\'',
      savedMoves: 'Tiết kiệm 8 moves (từ 13 moves xuống 5 moves)',
      tip: 'Chỉ với 4 moves M U\' M2 U, cả 6 cạnh được định hướng và UL/UR được đưa thẳng vào vị trí!',
    },
    {
      id: 'eolr_31_ur_db',
      name: 'Thế 3/1 (F) — UL/UR tại UR & DB',
      eoGroup: '3/1 (F)',
      ulurPosition: 'UR & DB',
      solution: 'M\' U M',
      setupAlg: 'U\' M\' U M2 U\' M\'',
      savedMoves: 'Tiết kiệm 6 moves',
      tip: 'Sau M\' U M, hai cạnh UL/UR tự động đối xứng ở đáy D.',
    },
    {
      id: 'eolr_40_uf_ub',
      name: 'Thế 4/0 — UL/UR tại UF & UB',
      eoGroup: '4/0',
      ulurPosition: 'UF & UB',
      solution: 'M\'',
      setupAlg: 'M',
      savedMoves: 'Cực nhanh (1 move M\')',
      tip: 'Chỉ 1 move M\' giải quyết ngay cả 4 cạnh sai trên U và đưa UL/UR vào đáy!',
    },
    {
      id: 'eolr_42_ur_db',
      name: 'Thế 4/2 — UL/UR tại UR & DB',
      eoGroup: '4/2',
      ulurPosition: 'UR & DB',
      solution: 'M\' U\' M U\' M\'',
      setupAlg: 'U\' M2 U\' M\' U\' M U2 M\' U2 M',
      savedMoves: 'Rút ngắn từ 18 moves xuống 5 moves',
      tip: 'Giải quyết trường hợp 6 cạnh lật khó nhất chỉ trong 5 nước xoay.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// 4. CÁC KỸ THUẬT ROUX ĐẶC BIỆT (PRO TECHNIQUES)
// ─────────────────────────────────────────────────────────────

export const PRO_TECHNIQUES: ProTechnique[] = [
  {
    id: 'nmc',
    title: 'Non-Matching Centres (NMC)',
    vietnameseTitle: 'Dựng Khối Không Cần Trùng Tâm',
    summary: 'Xây dựng First Block và Second Block (F2B) tự do mà không cần quan tâm tâm E/M có đúng không. Sau khi xong F2B, chỉ cần dùng 1 công thức ngắn để sửa tâm trước khi vào CMLL.',
    howItWorks: 'Sau khi F2B xong, căn chỉnh tâm bằng 1 trong các move:\n• u M\' u\' (lệch 90°)\n• u\' M\' u (lệch -90°)\n• u M2 u\' (lệch 180°)',
    scramble: "U2 F2 D' L2 F2 L2 F2 R2 D' R2 D' B D2 L2 D' F L F' R F2 B",
    solution: "FB: x' y M2 U R' F | SB: r2 U2 R U' r2 U' r' U' r U r U r' | Fix: u' M' u",
    pros: [
      'Tối ưu hóa số bước FB/SB cực đại, tận dụng ngay các cặp block 1x2x2 có sẵn trên khối xáo.',
      'Giảm trung bình 2-4 moves cho giai đoạn F2B.',
    ],
    cons: [
      'Đòi hỏi nhận biết màu tương đối tốt vì tâm không còn là mốc chuẩn.',
      'Có thể bị khựng nếu chưa quen finger-trick sửa tâm.',
    ],
  },
  {
    id: 'influencing_eo',
    title: 'Influencing EO từ CMLL',
    vietnameseTitle: 'Chủ Động Định Hình EO Trong CMLL',
    summary: 'Không giống như COLL (giữ nguyên cạnh), mỗi công thức CMLL đều có tính chất lật hoặc hoán đổi các cạnh tầng M/U. Người chơi trình độ cao sẽ chọn công thức CMLL phù hợp để ép thế LSE ra dạng dễ (0/0 hoặc 4/0).',
    howItWorks: 'Ví dụ với thế Sune: Nếu dùng công thức R U R\' U R U2 R\' sẽ không làm lật cạnh nào (bảo toàn EO). Nhưng nếu dùng công thức thay thế, bạn có thể chủ động lật 2 cạnh để chuyển thế 2 Bad thành 0 Bad (Skip EO)!',
    pros: [
      'Tăng tỷ lệ Skip EO hoặc ra các thế EO 1 nước đi.',
      'Giúp Look-ahead từ CMLL sang LSE mượt mà không bị khựng.',
    ],
    cons: [
      'Cần học thêm các thuật toán CMLL thay thế cho cùng 1 trường hợp góc.',
    ],
  },
  {
    id: 'free_blockbuilding',
    title: 'Free Blockbuilding',
    vietnameseTitle: 'Xây Khối Tự Do Đan Xen',
    summary: 'Không nhất thiết phải hoàn thành 100% FB rồi mới sang SB. Bạn có thể dựng 1x2x2 của FB, thấy SB có cặp đẹp thì dựng 1x2x2 của SB trước, sau đó hoàn tất cả hai.',
    howItWorks: 'Tận dụng các khối có sẵn sau khi Scramble ở cả 2 bên trái và phải, linh hoạt chuyển đổi giữa lớp L và R.',
    pros: [
      'Linh hoạt tối đa, giảm số moves lãng phí khi cố tìm viên cho FB.',
    ],
    cons: [
      'Dễ bị loạn màu và quên mất tiến độ các khối.',
    ],
  },
  {
    id: 'non_matching_blocks',
    title: 'Non-Matching Blocks (NMB)',
    vietnameseTitle: 'Hai Khối Khác Màu Đáy',
    summary: 'FB có đáy màu Trắng, nhưng SB có đáy màu Vàng (hoặc Xanh lam). Rất hiệu quả khi phát hiện SB có màu đáy đối diện dễ giải hơn nhiều.',
    howItWorks: 'Sau khi giải FB đáy Trắng, dựng SB đáy Vàng (đối diện). Giai đoạn CMLL nhận biết theo màu tương ứng.',
    pros: [
      'Mở rộng không gian tìm kiếm, tận dụng triệt để scramble thuận lợi.',
    ],
    cons: [
      'Nhận biết CMLL phải chuyển sang hệ quy chiếu màu đối diện.',
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// 5. BỘ CÔNG THỨC CMLL CHO GIẢI 1 TAY (ONE-HANDED - OH)
// ─────────────────────────────────────────────────────────────

export interface OHCMLLCase {
  id: string;
  group: 'O' | 'H' | 'Pi' | 'T' | 'U' | 'S' | 'As' | 'L';
  name: string;
  alg: string;
  standard2HAlg: string;
  notes: string;
}

export const OH_CMLL_ALGORITHMS: OHCMLLCase[] = [
  // Nhóm O
  { id: 'oh_o_adj', group: 'O', name: 'Adjacent Swap (PLL J)', alg: "R U R' F' R U R' U' R' F R2 U' R'", standard2HAlg: "R U R' F' R U R' U' R' F R2 U' R'", notes: 'Chuẩn 1 tay, finger-trick mượt mà' },
  { id: 'oh_o_diag', group: 'O', name: 'Diagonal Swap (PLL T)', alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'", standard2HAlg: "F R U' R' U' R U R' F' R U R' U' R' F R F'", notes: 'Dùng ngón trỏ gạt F/F\'' },

  // Nhóm H
  { id: 'oh_h_cols', group: 'H', name: 'H - Columns', alg: "R U2 R' U' R U R' U' R U' R'", standard2HAlg: "R U2' R' U' R U R' U' R U' R'", notes: '100% moves R và U, lý tưởng cho OH' },
  { id: 'oh_h_rows', group: 'H', name: 'H - Rows', alg: "F R U R' U' R U R' U' R U R' U' F'", standard2HAlg: "F R U R' U' R U R' U' R U R' U' F'", notes: 'Cụm Sexy Move 3 lần kẹp trong F...F\'' },
  { id: 'oh_h_col', group: 'H', name: 'H - Column', alg: "U' F R U' R' U R U2 R' U' R U R' U' F'", standard2HAlg: "R U2' R2' F R F' U2 R' F R F'", notes: 'Bản OH né move kép R2\'' },
  { id: 'oh_h_row', group: 'H', name: 'H - Row', alg: "r U' r' F U2 r2 F r U' r", standard2HAlg: "r U' r2' D' r U' r' D r2 U r'", notes: 'Dùng wide move r thay vì tầng D' },

  // Nhóm Pi
  { id: 'oh_pi_right_bar', group: 'Pi', name: 'Pi - Right Bar', alg: "F R U R' U' R U R' U' F'", standard2HAlg: "F R U R' U' R U R' U' F'", notes: 'Cực nhanh với 1 tay trái' },
  { id: 'oh_pi_back_slash', group: 'Pi', name: 'Pi - Back Slash', alg: "F R' F' R U2 R U' R' U R U2 R'", standard2HAlg: "F R' F' R U2 R U' R' U R U2' R'", notes: 'Tránh move gạt ngược' },
  { id: 'oh_pi_forward_slash', group: 'Pi', name: 'Pi - Forward Slash', alg: "R U2 R' U' R U R' U2 R' F R F'", standard2HAlg: "R U2 R' U' R U R' U2' R' F R F'", notes: 'Sexy move mở rộng kết hợp sledge' },
  { id: 'oh_pi_x', group: 'Pi', name: 'Pi - X Checkerboard', alg: "F R U' R' U' R U R' U R U' R' F'", standard2HAlg: "F R U' R' U' R U R' U R U' R' F'", notes: 'Nhịp R U\' R\' liên tục' },
  { id: 'oh_pi_cols', group: 'Pi', name: 'Pi - Columns', alg: "U2 r' F R F' r U' R' U' R U' R'", standard2HAlg: "r U' r2' D' r U r' D r2 U r'", notes: 'Bản OH né tầng D hoàn toàn' },
  { id: 'oh_pi_left_bar', group: 'Pi', name: 'Pi - Left Bar', alg: "R' U' R' F R F' R U' R' U2 R", standard2HAlg: "R' U' R' F R F' R U' R' U2 R", notes: 'Sledgehammer đảo ngược' },

  // Nhóm U
  { id: 'oh_u_forward_slash', group: 'U', name: 'U - Forward Slash', alg: "U2 R2 D R' U2 R D' R' U2 R'", standard2HAlg: "R2 D R' U2 R D' R' U2 R'", notes: 'Tối ưu commutator D với ngón đeo nhẫn' },
  { id: 'oh_u_back_slash', group: 'U', name: 'U - Back Slash', alg: "R2 D' R U2 R' D R U2 R", standard2HAlg: "R2' D' R U2 R' D R U2 R", notes: 'Đối xứng chuẩn xác' },
  { id: 'oh_u_front_row', group: 'U', name: 'U - Front Row', alg: "R' U' R U' R' U2 R2 U R' U R U2 R'", standard2HAlg: "R' U' R U' R' U2' R2 U R' U R U2' R'", notes: '100% 2-gen <R, U>, tốc độ tối đa' },
  { id: 'oh_u_rows', group: 'U', name: 'U - Rows', alg: "F R U R' U' R' U R U' F' U R' U' R", standard2HAlg: "F R2 D R' U R D' R2' U' F'", notes: 'Bản OH né move D phức tạp' },
  { id: 'oh_u_x', group: 'U', name: 'U - X Checkerboard', alg: "F R U' R' U R U R' U R U' R' F'", standard2HAlg: "F R U' R' U R U R' U R U' R' F'", notes: 'Mượt mà với ngón trỏ' },
  { id: 'oh_u_back_row', group: 'U', name: 'U - Back Row', alg: "F R U R' U' F'", standard2HAlg: "F R U R' U' F'", notes: 'Công thức ngắn nhất (6 moves)' },

  // Nhóm T
  { id: 'oh_t_left_bar', group: 'T', name: 'T - Left Bar', alg: "R U R' U' R' F R F'", standard2HAlg: "R U R' U' R' F R F'", notes: 'Sexy move + Sledgehammer' },
  { id: 'oh_t_right_bar', group: 'T', name: 'T - Right Bar', alg: "F R U' R' U R U R' F'", standard2HAlg: "L' U' L U r U' r' F", notes: 'Bản OH né move L và r tay trái' },
  { id: 'oh_t_rows', group: 'T', name: 'T - Rows', alg: "R U2 R' U' R U' R2 U2 R U R' U R", standard2HAlg: "R U2' R' U' R U' R2' U2' R U R' U R", notes: '2-gen thuần túy <R, U>' },
  { id: 'oh_t_front_row', group: 'T', name: 'T - Front Row', alg: "r' U r U2 R2 F R F' R", standard2HAlg: "r' U r U2' R2 F R F' R", notes: 'Wide move r\' mượt mà' },
  { id: 'oh_t_back_row', group: 'T', name: 'T - Back Row', alg: "F R U R' U' R U' R' U' R U R' F'", standard2HAlg: "r' D' r U r' D r U' r U r'", notes: 'Bản OH né move D' },
  { id: 'oh_t_cols', group: 'T', name: 'T - Columns', alg: "R' U' R U' R' U R U' R' U F' U F R", standard2HAlg: "r2' D' r U r' D r2 U' r' U' r", notes: 'Tối ưu cho 1 tay trái' },

  // Nhóm S (Sune)
  { id: 'oh_s_left_bar', group: 'S', name: 'S - Left Bar', alg: "R U R' U R U2 R'", standard2HAlg: "R U R' U R U2 R'", notes: 'Sune kinh điển, vua tốc độ OH' },
  { id: 'oh_s_x', group: 'S', name: 'S - X Checkerboard', alg: "F U R U2 R' U' R U R' F'", standard2HAlg: "L' U2 L U2 r U' r' F", notes: 'Né move tay trái L\'' },
  { id: 'oh_s_forward_slash', group: 'S', name: 'S - Forward Slash', alg: "F R' F' R U2 R U2 R'", standard2HAlg: "F R' F' R U2 R U2 R'", notes: 'Sledge + U2' },
  { id: 'oh_s_cols', group: 'S', name: 'S - Columns', alg: "R' U' R U' R' U2 F R F' r U r'", standard2HAlg: "R U R' U R U' R D R' U' R D' R2'", notes: 'Bản OH né move D kép' },
  { id: 'oh_s_right_bar', group: 'S', name: 'S - Right Bar', alg: "R U R' U R' F R F' R U2 R'", standard2HAlg: "R U R' U R' F R F' R U2 R'", notes: 'Sune biến thể có chèn sledge' },
  { id: 'oh_s_back_slash', group: 'S', name: 'S - Back Slash', alg: "R U' z U' z' U R' U' z U z'", standard2HAlg: "R U' L' U R' U' L", notes: 'Dùng rotation z nhẹ thay vì L' },

  // Nhóm As (Anti-Sune)
  { id: 'oh_as_right_bar', group: 'As', name: 'As - Right Bar', alg: "R' U' R U' R' U2 R", standard2HAlg: "R' U' R U' R' U2' R", notes: 'Anti-Sune chuẩn mực' },
  { id: 'oh_as_cols', group: 'As', name: 'As - Columns', alg: "r U' r' F R' F' U2 R U R' U", standard2HAlg: "R2 D R' U R D' R' U R' U' R U' R'", notes: 'Né hoàn toàn tầng D' },
  { id: 'oh_as_back_slash', group: 'As', name: 'As - Back Slash', alg: "F' r U r' U2 r' F2 r", standard2HAlg: "F' r U r' U2 r' F2' r", notes: 'Wide move r và F2' },
  { id: 'oh_as_x', group: 'As', name: 'As - X Checkerboard', alg: "R U2 R' U2 R' F R F'", standard2HAlg: "F R U R' U' F'", notes: 'Dễ finger-trick 1 tay' },
  { id: 'oh_as_forward_slash', group: 'As', name: 'As - Forward Slash', alg: "z U' z' U R U' z U z' U R'", standard2HAlg: "L' U R U' L U R'", notes: 'Né move tay trái' },
  { id: 'oh_as_left_bar', group: 'As', name: 'As - Left Bar', alg: "R' U' R U' R' U R' F R F' U R", standard2HAlg: "R' U' R U' R' U R' F R F' U R", notes: 'Anti-Sune có kết hợp Sledge' },

  // Nhóm L
  { id: 'oh_l_mirror', group: 'L', name: 'L - Mirror', alg: "F R U' R' U' R U R' F'", standard2HAlg: "F R U' R' U' R U R' F'", notes: 'Ngắn gọn, dễ nhớ' },
  { id: 'oh_l_inverse', group: 'L', name: 'L - Inverse', alg: "F R' F' R U R U' R'", standard2HAlg: "F R' F' R U R U' R'", notes: 'Sledgehammer + Sexy move' },
  { id: 'oh_l_pure', group: 'L', name: 'L - Pure', alg: "R U2 R' U' R U R' U' R U R' U' R U' R'", standard2HAlg: "R U2' R' U' R U R' U' R U R' U' R U' R'", notes: '100% 2-gen <R, U>' },
  { id: 'oh_l_front_comm', group: 'L', name: 'L - Front Commutator', alg: "R U2 R D R' U2 R D' R2", standard2HAlg: "R U2 R D R' U2 R D' R2'", notes: 'Commutator kinh điển' },
  { id: 'oh_l_diag', group: 'L', name: 'L - Diagonal', alg: "R' U' R U' F U' R' U' R U F'", standard2HAlg: "R' U' R U R' F' R U R' U' R' F R2", notes: 'Bản OH né move R2 kép nặng tay' },
  { id: 'oh_l_back_comm', group: 'L', name: 'L - Back Commutator', alg: "R' U2 R' D' R U2 R' D R2", standard2HAlg: "R' U2 R' D' R U2 R' D R2", notes: 'Đối xứng của Front Commutator' },
];

// ─────────────────────────────────────────────────────────────
// 6. LỘ TRÌNH LUYỆN TẬP SUB-X (SUB-X ROADMAP)
// ─────────────────────────────────────────────────────────────

export const SUB_X_ROADMAP: SubXStage[] = [
  {
    level: 'Mới bắt đầu (Beginner)',
    timeRange: '1:00+ (Trên 1 phút)',
    fbMoveTarget: '≤ 15 moves',
    sbMoveTarget: '≤ 25 moves',
    cmllTarget: '2-Look (9 công thức)',
    lseTarget: 'Hiểu bản chất 4a-4b-4c',
    timeSplit: '20s - 20s - 10s - 20s',
    coreFocus: [
      'Không quan tâm xoay nhanh, tập trung hiểu cách thức Roux hoạt động.',
      'FB: Tự do dùng mọi vị trí, mọi move (R, r, U, u, M, F...).',
      'SB: Chỉ dùng R, r, U, M để bảo vệ FB.',
      'Học thuộc 7 OLL góc và 2 PLL góc (2-Look CMLL).',
    ],
    advice: 'Tạo blocks (Block-building) chiếm phần lớn thời gian. Hãy kiên trì luyện tập tư duy ghép cặp tự do thay vì vội vã học công thức.',
  },
  {
    level: 'Có tiến triển (Intermediate)',
    timeRange: '45s — 50s',
    fbMoveTarget: '< 15 moves',
    sbMoveTarget: '< 20 moves',
    cmllTarget: 'Bắt đầu học 1 vài họ CMLL',
    lseTarget: 'Nhận biết 11 thế EO trong 3s',
    timeSplit: '15s - 18s - 6s - 11s',
    coreFocus: [
      'Đẩy nhanh tốc độ một chút nhưng không được để mất nhịp Look-ahead.',
      'FB: Luyện tập dựng First Square (1x2x2) phía sau trước.',
      'SB: Tận dụng wide move r để ghép cặp.',
      'LSE: Thành thạo move M và M2 bằng ngón đeo nhẫn/ngón giữa.',
    ],
    advice: 'Luyện tập finger-trick cho tầng giữa M (dùng ngón nhẫn gạt M, ngón nhẫn + giữa cho M2).',
  },
  {
    level: 'Khá (Sub-30)',
    timeRange: '25s — 30s',
    fbMoveTarget: '≤ 12 moves',
    sbMoveTarget: '≤ 18 moves',
    cmllTarget: 'Full 42/45 CMLL',
    lseTarget: '≤ 18 moves (dưới 8s)',
    timeSplit: '8s - 10s - 4s - 8s',
    coreFocus: [
      'FB: Lên kế hoạch dựng được mỏ neo DL + cặp đầu tiên ngay trong 15 giây quan sát (Inspection).',
      'SB: Giảm tối đa thời gian tìm kiếm cặp góc-cạnh thứ hai.',
      'Thuộc trọn vẹn 42/45 thế CMLL và nhận biết được trong < 1.5 giây.',
      'LSE: Chuyển giao mượt mà giữa 4a (EO) sang 4b (UL/UR).',
    ],
    advice: 'Chuyển hẳn sang Full CMLL. Số move giảm mạnh sẽ giúp bạn chạm mốc Sub-30 cực kỳ nhanh chóng.',
  },
  {
    level: 'Giỏi (Sub-20)',
    timeRange: '16s — 20s',
    fbMoveTarget: '≤ 10 moves',
    sbMoveTarget: '≤ 15 moves',
    cmllTarget: 'Nhận biết tức thì (< 1s)',
    lseTarget: '≤ 15 moves (dưới 4.5s)',
    timeSplit: '4.5s - 6.5s - 2.5s - 4.5s',
    coreFocus: [
      'FB: Quy hoạch hoàn chỉnh 100% First Block 1x2x3 trong 15 giây Inspection.',
      'SB: Look-ahead liên tục, tay xoay không ngừng (Turn speed ổn định 4-5 TPS).',
      'Áp dụng Dots Skipping để né thế D-Dots.',
      'Áp dụng kỹ thuật nhận biết nhanh EO (chỉ nhìn 1 sticker FD).',
    ],
    advice: 'Tập xoay với máy đếm nhịp (Metronome) ở tốc độ vừa phải nhưng KHÔNG KHỰNG (Zero Pause).',
  },
  {
    level: 'Chuyên gia (Sub-15)',
    timeRange: '12s — 15s',
    fbMoveTarget: '≤ 8 moves',
    sbMoveTarget: '≤ 12 moves',
    cmllTarget: 'Sub-1s execution + Influencing EO',
    lseTarget: 'EOLR cơ bản (≤ 12 moves)',
    timeSplit: '3s - 5s - 2s - 3.5s',
    coreFocus: [
      'Bắt đầu áp dụng EOLR cho các thế EO phổ biến (3/1 F, 4/2).',
      'Non-Matching Centres (NMC) khi scramble cho blocks thuận lợi.',
      'Dự đoán trước trường hợp EO ngay từ lúc đang xoay thuật toán CMLL.',
    ],
    advice: 'Luyện tập EOLR để biến bước 4a và 4b thành một giai đoạn duy nhất.',
  },
  {
    level: 'Thượng thừa (Sub-10)',
    timeRange: '< 10s',
    fbMoveTarget: '≤ 7 moves',
    sbMoveTarget: '≤ 10 moves',
    cmllTarget: 'Sub-0.8s + Full Influencing',
    lseTarget: 'Full EOLR (~60 cases)',
    timeSplit: '2s - 3.5s - 1.5s - 2.5s',
    coreFocus: [
      'Quy hoạch FB + First Pair SB ngay trong inspection.',
      'Thành thạo 100% 60 thế EOLR và Ez L4E.',
      'TPS đạt trên 7-9 lượt xoay/giây với finger-trick đỉnh cao.',
    ],
    advice: 'Roux ở đẳng cấp thế giới là sự kết hợp hoàn mỹ giữa hiệu quả số bước (Move efficiency < 40 moves) và tốc độ quay thần tốc.',
  },
];

// ─────────────────────────────────────────────────────────────
// 7. GIÁO TRÌNH MEYER METHOD (ROUX TRÊN RUBIK 4X4X4)
// ─────────────────────────────────────────────────────────────

export const MEYER_4X4_GUIDE: MeyerStep[] = [
  {
    stepNumber: 1,
    title: 'Tạo 2 tâm đối diện nhau (Trái & Phải)',
    objective: 'Giải hoàn chỉnh 2 tâm đầu tiên (thường là Cam và Đỏ, hoặc Trắng và Vàng).',
    keyRule: 'Chọn cố định 1 màu tâm để luôn ở bên trái (mặt L). Ví dụ nếu chọn Cam/Đỏ thì luôn giữ mặt Cam ở bên trái.',
    tips: 'Giống bước đầu của Yau Method, nhưng tập trung vào 2 tâm phục vụ 2 blocks trái-phải.',
  },
  {
    stepNumber: 2,
    title: 'Dựng First Block (1×2×3) ở bên trái',
    objective: 'Ghép 3 cạnh của First Block (ví dụ DL, BL, FL) và đưa về mặt L để tạo khối hoàn chỉnh 1×2×3.',
    keyRule: 'Ghép từng cặp cạnh đôi (Edge pairing) rồi chèn vào khe bên trái, khóa tâm L lại.',
    tips: 'Vì các tâm còn lại chưa giải, bạn có thể tự do mượn các tầng r, l, u để ghép cặp cạnh cực nhanh.',
  },
  {
    stepNumber: 3,
    title: 'Giải 4 tâm còn lại',
    objective: 'Hoàn tất 4 tâm ở giữa (U, D, F, B) mà không làm vỡ First Block ở bên trái.',
    keyRule: 'Chỉ sử dụng các chuyển động của nửa bên phải (lớp r, R, U) để xoay các tâm về đúng vị trí.',
    tips: 'Tận dụng không gian tự do của nửa phải, quy tắc đối xứng màu tương tự như giải tâm 4x4 thông thường.',
  },
  {
    stepNumber: 4,
    title: 'Ghép các cạnh còn lại & Giải Second Block',
    objective: 'Ghép tất cả các cạnh đôi còn lại và hoàn thành Second Block ở bên phải.',
    keyRule: 'Dùng kỹ thuật ghép 3-2-2-2 cạnh hoặc ghép từng cặp bằng move R, U, r.',
    tips: 'Sau khi ghép xong cạnh DR và 2 cặp góc-cạnh bên phải, Rubik 4x4 đã hoàn tất 2 khối F2B như 3x3!',
  },
  {
    stepNumber: 5,
    title: 'CMLL & LSE trên 4×4 (Xử lý Parity)',
    objective: 'Giải 4 góc U bằng CMLL và giải 6 cạnh còn lại bằng LSE.',
    keyRule: 'Nếu gặp OLL Parity (1 cạnh bị lật ngược): Dùng công thức r2 B2 U2 l U2 r\' U2 r U2 F2 r F2 l\' B2 r2. Nếu gặp PLL Parity: Dùng 2R2 U2 2R2 u2 2R2 2U2.',
    tips: 'LSE trên 4x4 xoay cực kỳ sướng tay vì chỉ cần xoay 2 lớp trong (wide slice M).',
  },
];
