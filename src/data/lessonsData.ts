import type { LessonStep } from '../types';
import { CUBE_PALETTE } from '../types';
import type { FaceColors } from '../components/ui/CubeDiagram2D';

// Helpers màu tắt gọn
const Y = CUBE_PALETTE.U;   // Vàng
const W = CUBE_PALETTE.D;   // Trắng
const G = CUBE_PALETTE.F;   // Xanh lá (Front)
const B = CUBE_PALETTE.B;   // Xanh lam (Back)
const R = CUBE_PALETTE.R;   // Đỏ (Right)
const O = CUBE_PALETTE.L;   // Cam (Left)
const X = '#c8c2b8';        // Xám (không quan tâm / ẩn)

const _9 = (c: string): FaceColors => [c,c,c, c,c,c, c,c,c];
const solved = (face: string): FaceColors => {
  const m: Record<string,string> = { U:Y, D:W, F:G, B:B, R:R, L:O };
  const c = m[face] ?? X;
  return _9(c);
};

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
  /** Danh sách sub-steps minh hoạ từng kỹ thuật cụ thể */
  steps: LessonStep[];
}

export const ROUX_LESSONS: Lesson[] = [
  // ─────────────────────────────────────────────────────────
  // BƯỚC 1: FIRST BLOCK (FB)
  // ─────────────────────────────────────────────────────────
  {
    id: 'first-block',
    stepNumber: 1,
    phaseId: 'fb',
    title: 'Bước 1: First Block (FB)',
    subtitle: 'Xây dựng khối 1×2×3 ở bên trái',
    avgMoves: '7 - 10 moves',
    description:
      'First Block là bước nền tảng mở đầu của phương pháp Roux. Mục tiêu là ghép một khối 1×2×3 hoàn chỉnh ở bên trái (mặc định mặt L màu Cam, mặt D màu Trắng). Điểm đặc biệt của Roux là bạn không cần làm dấu thập (Cross) như CFOP, mà tự do ghép các cặp viên theo trực giác.',
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
    steps: [
      {
        title: '1a. Định hướng chuẩn',
        description:
          'Giữ khối Rubik sao cho mặt Xanh lá (F) hướng về phía bạn và mặt Trắng (D) ở đáy. Đây là quy ước chuẩn Roux — bạn sẽ xây First Block ở cột bên Trái (mặt Cam - L).',
        diagram: {
          U: _9(X),
          D: solved('D'),
          F: solved('F'),
          B: _9(X),
          R: _9(X),
          L: solved('L'),
          focusFaces: ['F', 'D', 'L'],
        },
        highlightPhase: 'all',
        note: 'Bước này không xoay gì cả, chỉ cầm đúng hướng.',
      },
      {
        title: '1b. Đưa cạnh DL về đúng vị trí',
        description:
          'Tìm viên cạnh Trắng/Cam (DL) — cạnh có màu Trắng và Cam. Đưa nó về vị trí đáy-trái (DL): màu Trắng nhìn xuống dưới, màu Cam nhìn sang trái.',
        diagram: {
          U: _9(X),
          D: [X,X,X, O,W,X, X,X,X],
          F: [X,X,X, X,X,X, O,X,X],
          B: _9(X),
          R: _9(X),
          L: [X,X,X, X,O,X, X,W,X],
          highlightCells: ['D-1-0', 'L-2-1'],
          focusFaces: ['D', 'L', 'F'],
        },
        demoAlg: "L' U L",
        setupAlg: "L U' L'",
        highlightPhase: 'fb',
        note: 'Tip: Nếu viên DL đang ở tầng U, dùng move L\' U L hoặc L2 để hạ xuống.',
      },
      {
        title: '1c. Ghép cặp FL — góc-cạnh phía trước',
        description:
          'Tìm cặp: viên góc DFL (Trắng/Cam/Xanh lá) + viên cạnh FL (Cam/Xanh lá). Ghép chúng thành đôi trên tầng U, rồi dùng move L để thả xuống vào vị trí.',
        diagram: {
          U: _9(X),
          D: [O,X,X, X,W,X, X,X,X],
          F: [X,X,X, X,X,X, O,G,X],
          B: _9(X),
          R: _9(X),
          L: [X,X,X, X,O,X, G,W,X],
          highlightCells: ['D-0-0','F-2-0','F-2-1','L-2-0','L-2-1'],
          focusFaces: ['D', 'F', 'L'],
        },
        demoAlg: "U L' U' L",
        setupAlg: "L U L' U'",
        highlightPhase: 'fb',
        note: 'Kỹ thuật: Ghép cặp ở tầng U (không xoay cả khối), sau đó hạ xuống bằng L.',
      },
      {
        title: '1d. Ghép cặp BL — góc-cạnh phía sau',
        description:
          'Tìm cặp: viên góc DBL (Trắng/Cam/Xanh lam) + viên cạnh BL (Cam/Xanh lam). Ghép đôi ở tầng U, rồi dùng l\' (wide) hoặc L\' B để đặt vào vị trí BL.',
        diagram: {
          U: _9(X),
          D: [O,X,X, X,W,X, O,X,X],
          F: [X,X,X, X,X,X, O,G,X],
          B: [X,X,X, X,X,X, X,B,O],
          R: _9(X),
          L: [X,X,X, X,O,X, G,W,B],
          highlightCells: ['D-2-0','B-2-2','B-2-1','L-2-2','L-2-1'],
          focusFaces: ['D', 'B', 'L'],
        },
        demoAlg: "U' L U L'",
        setupAlg: "L U' L' U",
        highlightPhase: 'fb',
        note: 'Sau khi hoàn thành bước này, cột FB Cam-Trắng bên trái đã hoàn chỉnh!',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // BƯỚC 2: SECOND BLOCK (SB)
  // ─────────────────────────────────────────────────────────
  {
    id: 'second-block',
    stepNumber: 2,
    phaseId: 'sb',
    title: 'Bước 2: Second Block (SB)',
    subtitle: 'Xây dựng khối 1×2×3 đối xứng ở bên phải',
    avgMoves: '10 - 15 moves',
    description:
      'Sau khi đã hoàn thành First Block bên trái, bạn sẽ tiếp tục dựng một khối 1×2×3 đối xứng ở bên phải (mặt R màu Đỏ, mặt D màu Trắng). Điểm quan trọng nhất: bạn chỉ được sử dụng các bước xoay trong tập <R, r, M, U> để tuyệt đối không phá vỡ khối First Block bên trái.',
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
      'Sau khi hoàn thành SB, hai khối 1×2×3 hai bên được gọi là "First Two Blocks" (F2B).',
    ],
    steps: [
      {
        title: '2a. Đưa cạnh DR về vị trí',
        description:
          'Tìm viên cạnh Trắng/Đỏ (DR). Đưa nó về đúng vị trí đáy-phải (DR) mà không phá khối FB bên trái. Dùng move R2, U R2 hoặc M2.',
        diagram: {
          U: _9(X),
          D: [X,X,X, X,W,R, X,X,X],
          F: [X,X,X, X,X,R, X,X,X],
          B: _9(X),
          R: [X,X,X, X,R,X, X,W,X],
          L: solved('L'),
          highlightCells: ['D-1-2','R-2-1'],
          focusFaces: ['D', 'R', 'L'],
        },
        demoAlg: "R U' R'",
        setupAlg: "R U R'",
        highlightPhase: 'sb',
        note: 'Mẹo: Dùng R2 nếu viên DR đang lộn ngược ở tầng D.',
      },
      {
        title: '2b. Ghép cặp FR — góc-cạnh phía trước',
        description:
          'Tìm cặp: góc DFR (Trắng/Đỏ/Xanh lá) + cạnh FR (Đỏ/Xanh lá). Ghép chúng ở tầng U bằng wide move r, rồi insert vào.',
        diagram: {
          U: _9(X),
          D: [X,X,X, X,W,R, X,X,R],
          F: [X,X,X, X,X,R, X,G,R],
          R: [X,X,X, X,R,X, G,W,X],
          L: solved('L'),
          B: _9(X),
          highlightCells: ['D-2-2','F-2-2','F-2-1','R-2-0','R-2-1'],
          focusFaces: ['D', 'F', 'R'],
        },
        demoAlg: "R U' R' U R U' R'",
        setupAlg: "R U R' U' R U R'",
        highlightPhase: 'sb',
        note: 'Kỹ thuật Unslotting: nếu góc bị kẹt, dùng R U R\' để giải phóng lên U.',
      },
      {
        title: '2c. Ghép cặp BR — góc-cạnh phía sau',
        description:
          'Tìm cặp: góc DBR (Trắng/Đỏ/Xanh lam) + cạnh BR (Đỏ/Xanh lam). Ghép đôi ở tầng U, sau đó insert vào góc BR bằng R\' U R hoặc r U r\'.',
        diagram: {
          U: _9(X),
          D: [X,X,X, X,W,R, X,X,R],
          F: [X,X,X, X,X,R, X,G,R],
          B: [X,X,X, X,X,X, B,B,R],
          R: [X,X,X, X,R,X, G,W,B],
          L: solved('L'),
          highlightCells: ['D-2-2','B-2-0','B-2-1','R-2-2','R-2-1'],
          focusFaces: ['D', 'B', 'R'],
        },
        demoAlg: "U R U' R'",
        setupAlg: "R U R' U'",
        highlightPhase: 'sb',
        note: 'F2B hoàn thành! Hai khối 1×2×3 đã xây xong — đây là nền tảng cho CMLL.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // BƯỚC 3: CMLL
  // ─────────────────────────────────────────────────────────
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
    steps: [
      {
        title: '3a. Nhận diện 8 nhóm hình mặt U',
        description:
          'Nhìn vào mặt U (Vàng). Đếm và xác định vị trí của các ô Vàng để phân loại vào 1 trong 8 nhóm: O (4 góc), H (2 cạnh), Pi, T, U, L, S (Sune), As (Antisune). Diagram dưới là ví dụ nhóm T.',
        diagram: {
          // Nhóm T: 2 góc Vàng liền kề hàng trên, 2 góc còn lại không Vàng
          U: [Y,Y,Y, X,Y,X, X,X,X] as FaceColors,
          F: [X,X,X, X,G,X, X,X,X],
          B: _9(X),
          R: _9(X),
          L: _9(X),
          D: _9(X),
          highlightCells: ['U-0-0','U-0-1','U-0-2','U-1-1'],
          focusFaces: ['U'],
        },
        highlightPhase: 'cmll',
        note: '📌 Nhóm O: Cả 4 góc đã Vàng (Skip hoặc chỉ cần hoán vị). Nhóm S: Chữ L Vàng ở một góc.',
      },
      {
        title: '3b. Đọc hoán vị góc (Headlights/Bar/Slash)',
        description:
          'Nhìn vào màu 2 viên góc kề nhau ở cạnh F-front: nếu 2 góc cùng màu = "Headlights". Nếu không có cặp nào = "Diagonal". Thông tin này xác định công thức CMLL cụ thể trong nhóm.',
        diagram: {
          U: _9(Y),
          F: [G,X,R, X,G,X, X,X,X] as FaceColors,
          R: [X,X,X, X,R,X, X,X,X],
          L: [X,X,X, X,O,X, X,X,X],
          B: [X,X,X, X,B,X, X,X,X],
          D: _9(X),
          highlightCells: ['F-0-0','F-0-2'],
          focusFaces: ['U', 'F', 'R', 'L'],
        },
        highlightPhase: 'cmll',
        note: '💡 Nếu 2 góc cùng màu Xanh lá ở mặt F → "Headlights" → cần công thức hoán vị góc.',
      },
      {
        title: '3c. Tra cứu & áp dụng công thức',
        description:
          'Sau khi đã xác định nhóm (S/As/T/U/Pi/H/L/O) và loại hoán vị, mở tab "Tra cứu 45 CMLL" bên cạnh để tìm đúng case. Bấm "Chạy giải" để xem app minh hoạ công thức trên khối 3D.',
        diagram: {
          U: _9(Y),
          F: solved('F'),
          R: solved('R'),
          L: solved('L'),
          B: solved('B'),
          D: _9(X),
          focusFaces: ['U', 'F', 'R', 'L', 'B'],
        },
        highlightPhase: 'cmll',
        note: '✅ Sau bước này, 4 góc tầng U đã đúng màu và đúng vị trí. F2B bên dưới vẫn nguyên vẹn.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // BƯỚC 4: LSE
  // ─────────────────────────────────────────────────────────
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
    steps: [
      {
        title: '4a. Nhận diện Bad Edges',
        description:
          'Nhìn 6 cạnh M-slice (UF, UB, DF, DB) và 2 cạnh bên (UL, UR). Một cạnh là "Bad" nếu: ở tầng U/D mà màu Vàng/Trắng hướng sang Trái/Phải; ở M-slice mà màu Xanh/Đỏ/Cam hướng lên/xuống.',
        diagram: {
          // Minh hoạ: 2 bad edges ở UF và UB (màu sai hướng)
          U: [X,G,X, X,Y,X, X,B,X] as FaceColors,
          F: [X,Y,X, X,G,X, X,X,X] as FaceColors,
          B: [X,Y,X, X,B,X, X,X,X] as FaceColors,
          L: [X,X,X, X,O,X, X,X,X],
          R: [X,X,X, X,R,X, X,X,X],
          D: [X,X,X, X,W,X, X,X,X],
          highlightCells: ['U-0-1','U-2-1','F-0-1','B-0-1'],
          focusFaces: ['U', 'F', 'B'],
        },
        demoAlg: "M' U M",
        highlightPhase: 'lse',
        note: '🔍 Đếm số Bad Edges (0-4). Mục tiêu: đưa về 0 bad edges.',
      },
      {
        title: '4b. EO — Đưa về 0 Bad Edges',
        description:
          'Dùng combo M\' U M hoặc M\' U\' M để lật cạnh. Mỗi lần lật sẽ đổi trạng thái 2 cạnh. Lặp cho đến khi tất cả 6 cạnh đều "Good" (tất cả màu Vàng nhìn lên trên ở tầng U, màu Trắng nhìn xuống ở tầng D).',
        diagram: {
          U: [X,Y,X, X,Y,X, X,Y,X] as FaceColors,
          F: [X,G,X, X,G,X, X,X,X] as FaceColors,
          B: [X,B,X, X,B,X, X,X,X] as FaceColors,
          L: [X,X,X, X,O,X, X,X,X],
          R: [X,X,X, X,R,X, X,X,X],
          D: [X,W,X, X,W,X, X,X,X],
          highlightCells: ['U-0-1','U-1-1','U-2-1','F-0-1','B-0-1'],
          focusFaces: ['U', 'F', 'B', 'D'],
        },
        demoAlg: "M' U M U2 M' U M",
        highlightPhase: 'lse',
        note: '✅ Khi tất cả cạnh ở tầng U đều Vàng và ở M-slice đều Green/Blue → EO xong!',
      },
      {
        title: '4b. Đặt UL và UR',
        description:
          'Dùng U2 và M2 để đưa viên UL (Cam/Vàng) và UR (Đỏ/Vàng) về đúng bên. Đây là bước "chọn lane" — xoay U cho đến khi thấy cả 2 viên đúng màu ở bên của chúng.',
        diagram: {
          U: [O,Y,R, X,Y,X, X,X,X] as FaceColors,
          L: [X,O,X, X,O,X, X,X,X],
          R: [X,R,X, X,R,X, X,X,X],
          F: _9(X),
          B: _9(X),
          D: _9(X),
          highlightCells: ['U-0-0','U-0-2','L-0-1','L-1-1','R-0-1','R-1-1'],
          focusFaces: ['U', 'L', 'R'],
        },
        demoAlg: "U M2 U2 M2",
        highlightPhase: 'lse',
        note: '💡 Mẹo: Nếu UL đúng chỗ nhưng UR chưa, dùng U để xoay rồi check lại.',
      },
      {
        title: '4c. L4E — Hoàn thành 4 cạnh cuối',
        description:
          'Chỉ còn 4 cạnh (UF, UB, DF, DB) chưa đúng vị trí. Dùng M2 và U2 để hoán vị chúng. Thường chỉ cần 1-3 move M2/U2 là xong! Khối Rubik 100% hoàn thành!',
        diagram: {
          U: solved('U'),
          D: solved('D'),
          F: solved('F'),
          B: solved('B'),
          L: solved('L'),
          R: solved('R'),
          focusFaces: ['U', 'F', 'B'],
        },
        demoAlg: "M2 U2 M2 U2",
        highlightPhase: 'lse',
        note: '🎉 Xong! Các pattern L4E phổ biến: Ub (M2 U2 M2), Ua (M2 U2 M2 U2), Skip!',
      },
    ],
  },
];
