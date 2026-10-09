export interface Lesson {
  id: string;
  stepNumber: number;
  phaseId: 'fb' | 'sb' | 'cmll' | 'lse';
  title: string;
  subtitle: string;
  avgMoves: string;
  description: string;
  objectives: string[];
  keyTechniques: string[];
  proTips: string[];
}

export const ROUX_LESSONS: Lesson[] = [
  {
    id: 'first-block',
    stepNumber: 1,
    phaseId: 'fb',
    title: 'Bước 1: First Block (FB)',
    subtitle: 'Xây dựng khối 1x2x3 ở bên trái',
    avgMoves: '7 - 10 moves',
    description:
      'First Block là bước nền tảng mở đầu của phương pháp Roux. Mục tiêu là ghép một khối 1x2x3 hoàn chỉnh ở bên trái (mặc định mặt L màu Cam, mặt D màu Trắng). Điểm đặc biệt của Roux là bạn không cần làm dấu thập (Cross) như CFOP, mà tự do ghép các cặp viên theo trực giác.',
    objectives: [
      'Đưa tâm mặt Trái (L - Cam) và cạnh Đáy Trái (DL - Trắng/Cam) về đúng vị trí.',
      'Ghép cặp F2L góc-cạnh phía trước: cạnh FL (Cam/Xanh lá) + góc DFL (Trắng/Cam/Xanh lá).',
      'Ghép cặp F2L góc-cạnh phía sau: cạnh BL (Cam/Xanh lam) + góc DBL (Trắng/Cam/Xanh lam).',
    ],
    keyTechniques: [
      'Xây cạnh DL trước: Đưa viên cạnh Trắng/Cam về tầng D mặt L làm "mỏ neo".',
      'Ghép cặp ở tầng trên (U) rồi hạ xuống tầng đáy bằng các move l, L, U, F.',
      'Tận dụng tầng giữa M và mặt R tự do vì chưa bị khóa bởi bất kỳ khối nào.',
    ],
    proTips: [
      'Tập quan sát (Inspection) toàn bộ First Block trong 15 giây đầu trước khi bắt đầu xoay.',
      'Không bao giờ xoay cả khối Rubik (Cube Rotation) — giữ nguyên mặt Trắng ở đáy, Xanh lá ở trước.',
    ],
  },
  {
    id: 'second-block',
    stepNumber: 2,
    phaseId: 'sb',
    title: 'Bước 2: Second Block (SB)',
    subtitle: 'Xây dựng khối 1x2x3 đối xứng ở bên phải',
    avgMoves: '10 - 15 moves',
    description:
      'Sau khi đã hoàn thành First Block bên trái, bạn sẽ tiếp tục dựng một khối 1x2x3 đối xứng ở bên phải (mặt R màu Đỏ, mặt D màu Trắng). Điểm quan trọng nhất: bạn chỉ được sử dụng các bước xoay trong tập <R, r, M, U> để tuyệt đối không phá vỡ khối First Block bên trái.',
    objectives: [
      'Đưa cạnh Đáy Phải (DR - Trắng/Đỏ) vào đúng vị trí.',
      'Ghép cặp góc-cạnh phía sau bên phải: cạnh BR + góc DBR.',
      'Ghép cặp góc-cạnh phía trước bên phải: cạnh FR + góc DFR.',
    ],
    keyTechniques: [
      'Tận dụng Wide move "r" và tầng giữa "M": Xoay r U r\' hoặc M\' U2 r để giấu và ghép cặp.',
      'Unslotting: Nếu góc hoặc cạnh bị kẹt dưới tầng D, dùng R U R\' hoặc r U r\' để giải phóng lên tầng U.',
      'Tầng U và M là "sân chơi tự do" để bạn ghép đôi góc và cạnh một cách nhẹ nhàng.',
    ],
    proTips: [
      'Hạn chế xoay M quá nhiều ở đầu SB; ưu tiên dùng các move <R, r, U> mượt mà.',
      'Sau khi hoàn thành SB, hai khối 1x2x3 hai bên được gọi là "First Two Blocks" (F2B).',
    ],
  },
  {
    id: 'cmll',
    stepNumber: 3,
    phaseId: 'cmll',
    title: 'Bước 3: CMLL',
    subtitle: 'Định hướng & Hoán vị đồng thời 4 góc tầng trên',
    avgMoves: '9 - 13 moves',
    description:
      'CMLL (Corners of Last Layer) là giai đoạn lật toàn bộ mặt Vàng lên trên và hoán vị đúng vị trí cả 4 viên góc cùng lúc, trong khi 100% bảo toàn cả First Block và Second Block bên dưới. Có tổng cộng 42 trường hợp (chia thành 8 nhóm thế cờ).',
    objectives: [
      'Lật toàn bộ 4 góc tầng U lên màu Vàng (Orientation).',
      'Đưa 4 góc về đúng vị trí tương đối với nhau (Permutation).',
      'Giữ nguyên vẹn toàn bộ 2 khối F2B đã xây xong ở Bước 1 và Bước 2.',
    ],
    keyTechniques: [
      'Nhận diện theo 8 nhóm hình dạng mặt Vàng: O, H, Pi, T, U, L, S (Sune), As (Antisune).',
      'Đọc màu của 2 viên góc kề nhau để nhận biết trường hợp hoán vị (Headlights, Bar, Slash).',
      'Sử dụng các công thức tối ưu không cần xoay cả khối Rubik.',
    ],
    proTips: [
      'Hãy học trước 7 công thức 2-Look CMLL cơ bản, sau đó nâng dần lên full 42 công thức.',
      'Dùng công cụ tra cứu 45 CMLL trong ứng dụng này để bấm thử và luyện tập từng case.',
    ],
  },
  {
    id: 'lse',
    stepNumber: 4,
    phaseId: 'lse',
    title: 'Bước 4: Last Six Edges (LSE)',
    subtitle: 'Giải quyết 6 cạnh cuối cùng chỉ với <M, U>',
    avgMoves: '12 - 17 moves',
    description:
      'LSE là chặng về đích độc đáo và thần tốc nhất của Roux. Toàn bộ 6 cạnh còn lại (UL, UR, UF, UB, DF, DB) chỉ cần giải quyết bằng hai mặt duy nhất là tầng giữa M và tầng trên U <M, U>. Tốc độ xoay ngón tay (TPS) ở bước này cực kỳ cao và đã tay!',
    objectives: [
      '4a. Edge Orientation (EO): Lật đúng hướng tất cả 6 cạnh (đưa số bad edges về 0).',
      '4b. UL và UR: Đưa 2 cạnh bên UL (Cam/Vàng) và UR (Đỏ/Vàng) vào đúng vị trí.',
      '4c. L4E (Last 4 Edges): Hoán vị 4 cạnh còn lại trên tầng giữa (UB, UF, DF, DB) để hoàn thành khối Rubik 100%!',
    ],
    keyTechniques: [
      'Quy tắc nhận diện Bad Edge: Cạnh ở U/D có màu Vàng/Trắng hướng lên trên là Good; cạnh ở M có màu F/B hướng ra trước/sau là Good.',
      'Đưa về thế 4/0, 3/1, 1/1, 2/2 bằng các công thức M\' U M hoặc M\' U\' M.',
      'L4E chỉ cần các move M2, U2, M để giải xong toàn bộ khối trong vài bước.',
    ],
    proTips: [
      'Luyện tập flick ngón tay tầng giữa (M-slice finger tricks) bằng ngón áp út và ngón giữa.',
      'Roux là phương pháp có số lượt xoay (Move Count) ít nhất trong số các phương pháp thi đấu WCA hiện đại!',
    ],
  },
];
