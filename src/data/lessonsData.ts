import type { LessonStep } from '../types';
import { CUBE_PALETTE } from '../types';
import type { FaceColors } from '../components/ui/CubeDiagram2D';

// Helpers màu tắt gọn
const Y = CUBE_PALETTE.U;   // Vàng (Up)
const W = CUBE_PALETTE.D;   // Trắng (Down)
const G = CUBE_PALETTE.F;   // Xanh lá (Front)
const B = CUBE_PALETTE.B;   // Xanh lam (Back)
const RED = CUBE_PALETTE.L; // Đỏ (Left - L khi U=Vàng, F=Xanh lá)
const ORA = CUBE_PALETTE.R; // Cam (Right - R khi U=Vàng, F=Xanh lá)
const X = '#c8c2b8';        // Xám (không quan tâm / ẩn)

const _9 = (c: string): FaceColors => [c,c,c, c,c,c, c,c,c];
const solved = (face: string): FaceColors => {
  const m: Record<string,string> = { U:Y, D:W, F:G, B:B, R:ORA, L:RED };
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
    subtitle: 'Xây dựng khối 1×2×3 ở bên trái theo triết lý Block-building',
    avgMoves: '7 - 10 moves',
    description:
      'First Block là bước nền móng mở đầu của phương pháp Roux. Khác hoàn toàn với CFOP (vốn rập khuôn bắt đầu bằng dấu thập Cross), Roux hoàn toàn tự do và trực quan (Intuitive): bạn xây dựng một khối hộp 1×2×3 hoàn chỉnh ở bên trái (mặt L màu Đỏ, mặt D màu Trắng). Bạn không bị ràng buộc bởi bất kỳ tâm hay mặt nào khác, cho phép ghép các viên với số moves ít nhất thế giới.',
    objectives: [
      'Định vị mỏ neo: Cạnh đáy trái DL (Trắng - Đỏ) cố định giữa tâm Đỏ (L) và tâm Trắng (D).',
      'Dựng Back Square 1×2×2: Ghép góc DBL (Trắng/Đỏ/Xanh lam) + cạnh BL (Đỏ/Xanh lam) thành khối vuông phía sau.',
      'Dựng Front Square 1×2×2: Ghép góc DFL (Trắng/Đỏ/Xanh lá) + cạnh FL (Đỏ/Xanh lá) thành khối vuông phía trước.',
      'Hoàn tất trọn vẹn khối hộp 1×2×3 bên trái mà không cần xoay cả khối Rubik (Cube Rotation).',
    ],
    keyTechniques: [
      'Quy trình Line → Square → Block: Đặt mỏ neo DL (Line) → Xây khối 1×2×2 (Square) → Hoàn tất 1×2×3 (Block).',
      'Tận dụng tầng giữa M và tầng R tự do: Ở bước 1, toàn bộ nửa bên phải và trục giữa M hoàn toàn tự do, bạn có thể xoay M2, R2 thoải mái để đưa góc/cạnh lên tầng U ghép cặp.',
      '3 Thế ghép cặp cơ bản: Cùng màu trên U, Khác màu trên U, và Mặt Trắng hướng lên trên.',
    ],
    proTips: [
      'Tập quan sát (Inspection) toàn bộ First Block trong 15 giây đầu trước khi bắt đầu xoay.',
      'Luôn giữ mặt Trắng ở đáy (D), Xanh lá ở trước (F) và Vàng ở trên (U) — tuyệt đối không xoay cả khối Rubik (Cube Rotation).',
    ],
    steps: [
      {
        title: '1a. Triết lý Block-building (Line → Square → Block)',
        description:
          'Để giải First Block thông minh và ít bước nhất, cuber Roux không giải từng viên rời rạc mà đi theo lộ trình 3 nấc: (1) Đặt cạnh mỏ neo DL (tạo thành một "Line" 1×1×2 gồm tâm L và cạnh DL); (2) Ghép một cặp góc-cạnh tạo thành khối vuông 1×2×2 ("Square"); (3) Ghép cặp còn lại để hoàn tất khối 1×2×3 ("Block").',
        diagram: {
          U: _9(X),
          D: [RED,X,X, X,W,X, RED,X,X],
          F: [X,X,X, X,G,X, RED,X,X],
          B: [X,X,X, X,B,X, RED,X,X],
          R: _9(X),
          L: [RED,RED,RED, RED,RED,RED, RED,RED,RED],
          highlightCells: ['L-0-0','L-0-1','L-0-2','L-1-0','L-1-1','L-1-2','L-2-0','L-2-1','L-2-2'],
          focusFaces: ['L', 'D', 'F'],
        },
        highlightPhase: 'fb',
        note: '💡 Toàn bộ mặt L (Đỏ) và tầng đáy bên trái (Trắng) sau khi xong sẽ gắn liền thành một khối thống nhất.',
      },
      {
        title: '1b. Mỏ neo DL (Trắng - Đỏ) — Nền móng đầu tiên',
        description:
          'Tìm viên cạnh có 2 màu Trắng và Đỏ (DL). Đưa nó về vị trí đáy-trái: màu Trắng hướng xuống đáy D, màu Đỏ hướng sang mặt L. Nếu viên DL đang ở tầng U: dùng move L\' U L hoặc L2 để đưa xuống. Nếu cạnh nằm ngược hướng ở đáy: xoay L F\' hoặc l U l\' để chỉnh lại.',
        diagram: {
          U: _9(X),
          D: [X,X,X, RED,W,X, X,X,X],
          F: _9(X),
          B: _9(X),
          R: _9(X),
          L: [X,X,X, X,RED,X, X,W,X],
          highlightCells: ['D-1-0', 'L-2-1'],
          focusFaces: ['D', 'L'],
        },
        demoAlg: "L' U L",
        setupAlg: "L U' L'",
        highlightPhase: 'fb',
        note: 'Mẹo: Bạn có thể đưa cạnh DL vào trước hoặc giải đồng thời cùng cặp 1×2×2 đầu tiên.',
      },
      {
        title: '1c. Dựng Back Square 1×2×2 (Cặp sau BL)',
        description:
          'Tìm góc DBL (Trắng/Đỏ/Xanh lam) và cạnh BL (Đỏ/Xanh lam). Đưa cả hai lên tầng trên U để ghép đôi thành cặp khớp màu. Các trigger vàng siêu tốc: B\' (khi cặp ghép sẵn trên U), B\' U\' B (khi Trắng hướng ra B), r\' B hoặc r B (khi Trắng hướng L), và M U R B\' (khi cạnh kẹt ở DF đáy trước).',
        diagram: {
          U: _9(X),
          D: [X,X,X, RED,W,X, RED,X,X],
          F: _9(X),
          B: [X,X,X, X,X,X, RED,B,X],
          R: _9(X),
          L: [X,X,X, X,RED,RED, X,W,B],
          highlightCells: ['D-2-0', 'B-2-0', 'B-2-1', 'L-2-2', 'L-1-2'],
          focusFaces: ['D', 'B', 'L'],
        },
        demoAlg: "U' L' U L",
        setupAlg: "L' U' L U",
        highlightPhase: 'fb',
        note: '💡 Mẹo Pro: Ưu tiên làm Back Square trước! Xem chi tiết 11 thế cờ minh họa 3D của Cặp Sau FB trong mục Cẩm nang.',
      },
      {
        title: '1d. Dựng Front Square 1×2×2 (Cặp trước FL) → Hoàn tất 1×2×3',
        description:
          'Tìm cặp còn lại: góc DFL (Trắng/Đỏ/Xanh lá) và cạnh FL (Đỏ/Xanh lá). Tách và ghép đôi trên tầng U sao cho cạnh và góc dính liền nhau. Dùng move U L\' U\' L để chèn vào khe trước. Lúc này toàn bộ khối 1×2×3 bên trái đã hoàn thiện trọn vẹn!',
        diagram: {
          U: _9(X),
          D: [RED,X,X, RED,W,X, RED,X,X],
          F: [X,X,X, X,X,X, RED,G,X],
          B: [X,X,X, X,X,X, RED,B,X],
          R: _9(X),
          L: [RED,RED,RED, RED,RED,RED, G,W,B],
          highlightCells: ['D-0-0', 'F-2-0', 'F-2-1', 'L-2-0', 'L-1-0'],
          focusFaces: ['D', 'F', 'L'],
        },
        demoAlg: "U L' U' L",
        setupAlg: "L' U L U'",
        highlightPhase: 'fb',
        note: 'Kiểm tra: Khối 1×2×3 bên trái đã chuẩn màu, các tầng R và M vẫn xoay tự do.',
      },
      {
        title: '1e. 3 Thế ghép cặp góc-cạnh cơ bản (Core Pair Techniques)',
        description:
          'Khi ghép bất kỳ cặp F2L nào trên tầng U:\n• Thế 1 (Cùng màu trên U): Giấu góc xuống khe trống bằng L\', xoay U đưa cạnh cách góc 1 ô, rồi nhấc góc lên bằng L.\n• Thế 2 (Khác màu trên U): Đưa cạnh đối diện góc sao cho khi gạt L\' sẽ dính liền vào nhau.\n• Thế 3 (Mặt Trắng của góc hướng lên trên): Khớp màu cạnh với tâm bên, xoay úp mặt trắng xuống ghép với cạnh.',
        diagram: {
          U: [X,G,X, X,Y,X, RED,X,X],
          D: _9(X),
          F: [W,X,X, X,G,X, X,X,X],
          B: _9(X),
          R: _9(X),
          L: [X,X,G, X,RED,X, X,X,X],
          highlightCells: ['U-0-1', 'U-2-0', 'F-0-0', 'L-0-2'],
          focusFaces: ['U', 'F', 'L'],
        },
        demoAlg: "U L' U2 L",
        setupAlg: "L' U2 L U'",
        highlightPhase: 'fb',
        note: '💡 Đây là 3 nguyên tắc ghép cặp dùng cho cả đời chơi Roux, áp dụng cho cả First Block lẫn Second Block!',
      },
      {
        title: '1f. Tận dụng tầng M và R tự do (Bí quyết xoay ít bước)',
        description:
          'Trong First Block, toàn bộ nửa bên phải và tầng giữa M đều CHƯA CÓ khối nào bị khóa. Nếu một viên cạnh hoặc góc bị kẹt dưới đáy hoặc hướng xấu, bạn có thể tự do dùng move M, M2, r hoặc R để nhấc viên đó lên tầng U một cách thần tốc mà không sợ vỡ bất kỳ thứ gì!',
        diagram: {
          U: [X,X,X, X,Y,X, X,X,X],
          D: solved('D'),
          F: solved('F'),
          B: solved('B'),
          R: solved('R'),
          L: solved('L'),
          focusFaces: ['U', 'D', 'L'],
        },
        demoAlg: "M2 U M2",
        setupAlg: "M2 U' M2",
        highlightPhase: 'fb',
        note: 'Ưu thế của Roux: Bạn có 50% khối Rubik tự do để xoay ghép, tiết kiệm trung bình 15-20 moves so với làm Cross của CFOP.',
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
    subtitle: 'Xây dựng khối 1×2×3 đối xứng ở bên phải chỉ bằng <R, r, M, U>',
    avgMoves: '10 - 15 moves',
    description:
      'Sau khi First Block bên trái đã hoàn thành, bạn bước vào giai đoạn Second Block. Nhiệm vụ là xây dựng khối 1×2×3 đối xứng ở bên phải (mặt R màu Cam, mặt D màu Trắng). Điểm quan trọng nhất và là quy tắc sống còn của Roux: bạn BẮT BUỘC chỉ được xoay các move trong tập ⟨R, r, M, U⟩ để tuyệt đối bảo vệ khối First Block bên trái không bị vỡ.',
    objectives: [
      'Định vị mỏ neo DR: Cạnh đáy phải (DR - Trắng/Cam) vào đúng vị trí giữa tâm Cam (R) và tâm Trắng (D).',
      'Dựng Back Square 1×2×2 bên phải: Ghép góc DBR (Trắng/Cam/Xanh lam) + cạnh BR (Cam/Xanh lam).',
      'Dựng Front Square 1×2×2 bên phải: Ghép góc DFR (Trắng/Cam/Xanh lá) + cạnh FR (Cam/Xanh lá).',
      'Hoàn tất cụm First Two Blocks (F2B): Hai khối hông 1×2×3 hai bên đã vững chắc, giải phóng trục giữa M tự do.',
    ],
    keyTechniques: [
      'Quy tắc bất biến <R, r, M, U>: Không bao giờ xoay mặt L, F hoặc B vì sẽ phá hỏng First Block.',
      'Kỹ thuật Unslotting: Dùng R U R\' hoặc r U\' r\' để giải cứu các viên góc/cạnh bị kẹt ở khe sai lên tầng U.',
      'Sức mạnh của Wide Move r: Vì r = R + M, khi xoay r thì khối FB ở lớp L hoàn toàn bất động, giúp mở khe và ghép cặp cực kỳ êm ái.',
      'Tận dụng tầng giữa M: Giấu cạnh vào DF hoặc DB bằng move M\' để ghép góc trên U.',
    ],
    proTips: [
      'Ưu tiên giải quyết cặp sau (Back Square) trước để góc nhìn phía trước luôn thông thoáng.',
      'Hạn chế xoay M quá nhiều ở đầu SB; ưu tiên dùng các move ⟨R, r, U⟩ mượt mà và liền mạch.',
    ],
    steps: [
      {
        title: '2a. Ràng buộc bất biến <R, r, M, U> (Bảo vệ khối FB)',
        description:
          'Luật thép của Second Block: KHÔNG BAO GIỜ xoay các mặt L, F, B. Khối First Block bên trái của bạn đã hoàn thành và nằm ở lớp x = -1. Mọi chuyển động trong tập ⟨R, r, M, U⟩ chỉ tác động lên lớp giữa (M) và lớp bên phải (R), do đó First Block luôn được bảo toàn 100%.',
        diagram: {
          U: _9(X),
          D: [RED,X,X, RED,W,X, RED,X,X],
          F: [X,X,X, X,G,X, RED,X,X],
          B: [X,X,X, X,B,X, RED,X,X],
          R: [X,X,X, X,ORA,X, X,X,X],
          L: solved('L'),
          highlightCells: ['L-0-0','L-0-1','L-0-2','L-1-0','L-1-1','L-1-2','L-2-0','L-2-1','L-2-2'],
          focusFaces: ['L', 'R', 'D'],
        },
        highlightPhase: 'sb',
        note: 'Cảnh báo: Nếu bạn lỡ xoay F hoặc B, First Block bên trái sẽ bị vỡ ngay lập tức!',
      },
      {
        title: '2b. Mỏ neo DR (Trắng - Cam) — Mở đầu khối đối xứng',
        description:
          'Tìm viên cạnh Trắng/Cam (DR). Đưa nó về vị trí đáy-phải (DR) sao cho màu Trắng nhìn xuống D, màu Cam nhìn sang R.\n• Nếu DR ở tầng U: Xoay U đưa về vị trí đối diện rồi dùng R2 hoặc r U\' r\' để hạ xuống.\n• Nếu DR nằm lộn ngược màu ở tầng đáy: Dùng M2 hoặc r2 U\' r2 để lật lại.',
        diagram: {
          U: _9(X),
          D: [RED,X,ORA, RED,W,ORA, RED,X,ORA],
          F: _9(X),
          B: _9(X),
          R: [X,X,X, X,ORA,X, X,W,X],
          L: solved('L'),
          highlightCells: ['D-1-2', 'R-2-1'],
          focusFaces: ['D', 'R', 'L'],
        },
        demoAlg: "R U' R'",
        setupAlg: "R U R'",
        highlightPhase: 'sb',
        note: 'Mẹo: Dùng move R2 là cách nhanh nhất khi viên DR đang ở tầng U đối diện đáy.',
      },
      {
        title: '2c. Kỹ thuật Unslotting (Giải cứu góc/cạnh bị kẹt)',
        description:
          'Rất phổ biến khi góc hoặc cạnh bạn cần tìm đang bị kẹt dưới khe sai (ví dụ góc DBR bị cắm ngược ở khe trước DFR). Kỹ thuật Unslotting: Đưa khe chứa viên đó lên tầng U bằng R U R\' hoặc r U\' r\', xoay U đưa viên đó ra vị trí an toàn, rồi trả tầng R về vị trí cũ bằng R\' hoặc r\'.',
        diagram: {
          U: [X,X,ORA, X,Y,X, X,X,X],
          D: [RED,X,X, RED,W,ORA, RED,X,X],
          F: [X,X,X, X,G,X, X,X,W],
          B: _9(X),
          R: [X,X,X, X,ORA,X, G,X,X],
          L: solved('L'),
          highlightCells: ['U-0-2', 'F-2-2', 'R-2-0'],
          focusFaces: ['U', 'F', 'R'],
        },
        demoAlg: "R U R'",
        setupAlg: "R U' R'",
        highlightPhase: 'sb',
        note: 'Công thức vàng: R U R\' giúp đưa góc kẹt lên tầng U trong 0.2 giây mà mỏ neo DR không bị mất.',
      },
      {
        title: '2d. Dựng Back Square 1×2×2 bên phải (Cặp sau BR)',
        description:
          'Tìm góc DBR (Trắng/Cam/Xanh lam) và cạnh BR (Cam/Xanh lam). Sau khi đã đưa cả hai lên tầng U, áp dụng các công thức vàng chỉ dùng ⟨R, r, M, U⟩: r\' U\' r hoặc R\' U R (chèn cặp siêu tốc 3 bước), M2 r\' U\' r (khi cạnh kẹt ở DF), và R U\' R\' r\' U\' r (khi cạnh kẹt ở khe trước FR).',
        diagram: {
          U: _9(X),
          D: [RED,X,X, RED,W,ORA, RED,X,ORA],
          F: _9(X),
          B: [X,X,X, X,B,X, RED,X,ORA],
          R: [X,X,X, X,ORA,ORA, X,W,B],
          L: solved('L'),
          highlightCells: ['D-2-2', 'B-2-2', 'R-2-2', 'R-1-2'],
          focusFaces: ['D', 'B', 'R'],
        },
        demoAlg: "U' R' U R",
        setupAlg: "R' U' R U",
        highlightPhase: 'sb',
        note: '💡 Mẹo Pro: Luôn hoàn thành khe sau trước để thoải mái nhìn khe trước! Xem chi tiết 8 thế cờ minh họa 3D của Cặp Sau SB trong mục Cẩm nang.',
      },
      {
        title: '2e. Dựng Front Square (Cặp trước FR) → Hoàn tất F2B',
        description:
          'Tìm cặp cuối cùng: góc DFR (Trắng/Cam/Xanh lá) và cạnh FR (Cam/Xanh lá). Ghép đôi ở tầng U rồi chèn vào khe trước bằng U R U\' R\' hoặc U\' R U R\'. Sau bước này, toàn bộ 2 khối 1×2×3 ở hai bên hông (F2B) đã hoàn thiện 100%! Trục giữa M hoàn toàn tự do cho CMLL và LSE.',
        diagram: {
          U: _9(X),
          D: [RED,X,ORA, RED,W,ORA, RED,X,ORA],
          F: [X,X,X, X,G,X, RED,X,ORA],
          B: [X,X,X, X,B,X, RED,X,ORA],
          R: [ORA,ORA,ORA, ORA,ORA,ORA, G,W,B],
          L: solved('L'),
          highlightCells: ['D-0-2', 'F-2-2', 'R-2-0', 'R-1-0'],
          focusFaces: ['D', 'F', 'R'],
        },
        demoAlg: "U R U' R'",
        setupAlg: "R U R' U'",
        highlightPhase: 'sb',
        note: '🎉 Chúc mừng! Bạn đã hoàn thành First Two Blocks (F2B) — bước chiếm 60% thời gian của Roux!',
      },
      {
        title: '2f. Tuyệt chiêu Wide Move r & Tầng M trong Second Block',
        description:
          'Tại sao cuber giỏi lại thích wide move r? Vì r U\' r\' vừa mở khe chèn cặp sau, vừa có thể điều chỉnh tâm M mà không hề phá mỏ neo DR. Ngoài ra, bạn có thể giấu cạnh vào khe DF bằng move M\', xoay U ghép góc, rồi gạt M đưa cạnh lên ghép đôi (M-slice pair building) — đây là vũ khí bí mật độc nhất vô nhị chỉ Roux mới có!',
        diagram: {
          U: [X,Y,X, X,Y,X, X,X,X],
          D: solved('D'),
          F: solved('F'),
          B: solved('B'),
          R: solved('R'),
          L: solved('L'),
          focusFaces: ['U', 'R', 'D'],
        },
        demoAlg: "r U' r' U r U r'",
        setupAlg: "r' U' r' U' r U r'",
        highlightPhase: 'sb',
        note: 'Bí quyết: Luyện tập thành thạo r và M sẽ giúp tốc độ giải Second Block nhanh hơn gấp 2 lần.',
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
          F: [G,X,ORA, X,G,X, X,X,X] as FaceColors,
          R: [X,X,X, X,ORA,X, X,X,X],
          L: [X,X,X, X,RED,X, X,X,X],
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
  // BƯỚC 4: LAST SIX EDGES (LSE)
  // ─────────────────────────────────────────────────────────
  {
    id: 'lse',
    stepNumber: 4,
    phaseId: 'lse',
    title: 'Bước 4: Last Six Edges (LSE)',
    subtitle: 'Giải quyết 6 cạnh cuối cùng chỉ với <M, U>',
    avgMoves: '12 - 17 moves',
    description:
      'LSE là chặng về đích độc đáo và thần tốc nhất của phương pháp Roux. Toàn bộ 6 cạnh còn lại (UL, UR, UF, UB, DF, DB) chỉ cần giải quyết bằng hai mặt duy nhất là tầng giữa M và tầng trên U <M, U>. Tốc độ xoay ngón tay (TPS) ở bước này cực kỳ cao và đã tay vì hoàn toàn không cần xoay khối (Rotationless)!',
    objectives: [
      '4a. Edge Orientation (EO): Lật đúng hướng tất cả 6 cạnh (đưa số bad edges về 0).',
      '4b. UL và UR Placement: Đưa 2 cạnh bên UL (Đỏ/Vàng) và UR (Cam/Vàng) vào đúng vị trí hai bên.',
      '4c. Tự nghiệm L4E (Intuitive): Dùng <M, U2> gom 2 cạnh đáy trắng xuống D, sửa tâm D-Dots và hoán vị U.',
      '4d. Bảng công thức tối ưu L4E: Nhận biết 16 thế cờ 1 cạnh trắng ở U và các thế đặc biệt Ub, Ua, H, Z.',
    ],
    keyTechniques: [
      'Quy tắc nhận diện Bad Edge: Cạnh ở U/D có màu Vàng/Trắng hướng lên trên là Good; cạnh ở M có màu F/B hướng ra trước/sau là Good.',
      'Quy tắc 3/1F và 3/1B: Đưa mọi thế EO về thế cơ bản 3/1 rồi giải dứt điểm chỉ với M\' U\' M\' hoặc M U\' M\'.',
      'Tập nước đi <M, U2> ở L4E: Chỉ cần xoay M và U2 để gom 2 cạnh trắng xuống D mà không làm hỏng EO và CMLL.',
      'Xử lý D-Dots: Gạt duy nhất 1 nước M2 là hoán vị tâm U và D về đúng mặt.',
    ],
    proTips: [
      'Luyện tập flick ngón tay tầng giữa (M-slice finger tricks) bằng ngón áp út và ngón giữa.',
      'Ở L4E, không cần học vẹt công thức: chỉ cần nhớ quy tắc gom 2 cạnh trắng xuống đáy D trước, rồi sửa tâm M2 là xong!',
    ],
    steps: [
      {
        title: '4a. Nhận diện Bad Edges (Quy tắc màu tâm U/D)',
        description:
          'Trước khi giải EO, bắt buộc màu tâm ở mặt U phải là màu Vàng hoặc Trắng. Sau đó kiểm tra 6 cạnh: Một cạnh là "Bad" nếu màu Vàng/Trắng của nó nằm ở các mặt bên (F, B, R, L) thay vì nằm trên mặt U hoặc mặt D. Tổng số cạnh sai trên cả khối luôn là một số chẵn: 0, 2, 4 hoặc 6.',
        diagram: {
          U: [X,G,X, X,Y,X, X,B,X] as FaceColors,
          F: [X,Y,X, X,G,X, X,X,X] as FaceColors,
          B: [X,Y,X, X,B,X, X,X,X] as FaceColors,
          L: [X,X,X, X,RED,X, X,X,X],
          R: [X,X,X, X,ORA,X, X,X,X],
          D: [X,X,X, X,W,X, X,X,X],
          highlightCells: ['U-0-1','U-2-1','F-0-1','B-0-1'],
          focusFaces: ['U', 'F', 'B'],
        },
        demoAlg: "M' U M",
        highlightPhase: 'lse',
        note: '🔍 Mẹo: Nếu tâm U là Vàng/Trắng thì cạnh có Vàng/Trắng ở F/B/R/L là cạnh sai cần lật.',
      },
      {
        title: '4b. Định hướng 6 cạnh (EO — Quy về thế cơ bản 3/1)',
        description:
          'Mục tiêu của EO là đưa tất cả các cạnh sai về thế cơ bản 3/1 (3 cạnh sai ở U, 1 cạnh sai ở D) rồi giải dứt điểm bằng M\' U\' M\' (hoặc M U\' M\'). Với thế 2a/0 (2 cạnh sai kề nhau), đặt ở UB và UL rồi xoay M\' U M\' U2. Với thế 2o/0, đặt ở UF và UB rồi xoay M\' U M U\'.',
        diagram: {
          U: [X,Y,X, X,Y,X, X,Y,X] as FaceColors,
          F: [X,G,X, X,G,X, X,X,X] as FaceColors,
          B: [X,B,X, X,B,X, X,X,X] as FaceColors,
          L: [X,X,X, X,RED,X, X,X,X],
          R: [X,X,X, X,ORA,X, X,X,X],
          D: [X,W,X, X,W,X, X,X,X],
          highlightCells: ['U-0-1','U-1-1','U-2-1','F-0-1','B-0-1'],
          focusFaces: ['U', 'F', 'B', 'D'],
        },
        demoAlg: "M' U M' U2 M' U' M'",
        setupAlg: "M U M U2 M U' M",
        highlightPhase: 'lse',
        note: '✅ Khi tất cả 6 cạnh đều hướng Vàng/Trắng lên trên ở U và xuống dưới ở D → EO hoàn tất!',
      },
      {
        title: '4c. Đưa 2 cạnh bên UL & UR về vị trí (Bước 4b Roux)',
        description:
          'Tìm 2 viên cạnh UL (Đỏ - Vàng) và UR (Cam - Vàng). Chỉ dùng các nước đi <M, U>: Nếu 2 viên ở tầng U, xoay U để đưa 1 viên vào cột M rồi gạt M2 đưa xuống D. Sau đó xoay U đưa viên thứ hai vào đối diện và dùng M2 đưa cả 2 viên về đúng vị trí bên trái/phải.',
        diagram: {
          U: [RED,Y,ORA, X,Y,X, X,X,X] as FaceColors,
          L: [X,RED,X, X,RED,X, X,X,X],
          R: [X,ORA,X, X,ORA,X, X,X,X],
          F: _9(X),
          B: _9(X),
          D: _9(X),
          highlightCells: ['U-0-0','U-0-2','L-0-1','L-1-1','R-0-1','R-1-1'],
          focusFaces: ['U', 'L', 'R'],
        },
        demoAlg: "U' M U2 M",
        setupAlg: "M' U2 M' U",
        highlightPhase: 'lse',
        note: '💡 Suốt bước 4b chỉ dùng <M, U> để bảo vệ 100% hướng EO đã làm ở bước 4a.',
      },
      {
        title: '4d. Phương pháp tự nghiệm L4E (3 giai đoạn trực quan)',
        description:
          'L4E là bước giải 4 cạnh cuối trên cột giữa M (UF, UB, DF, DB) chỉ bằng <M, U2>. Quy trình tự nghiệm 3 giai đoạn: (1) Gom 2 cạnh màu Trắng xuống đáy D bằng M\' U2 M hoặc M U2 M\'; (2) Kiểm tra tâm đáy D: nếu dính D-Dots (tâm đáy vàng) thì gạt M2 để sửa; (3) Hoán vị các cạnh còn lại trên tầng U bằng U2 hoặc M2 U2 M2.',
        diagram: {
          U: [X,Y,X, X,Y,X, X,Y,X] as FaceColors,
          D: [X,W,X, X,W,X, X,W,X] as FaceColors,
          F: [X,G,X, X,G,X, X,G,X] as FaceColors,
          B: [X,B,X, X,B,X, X,B,X] as FaceColors,
          L: [X,RED,X, X,RED,X, X,RED,X] as FaceColors,
          R: [X,ORA,X, X,ORA,X, X,ORA,X] as FaceColors,
          highlightCells: ['U-1-1', 'D-1-1', 'F-1-1', 'B-1-1'],
          focusFaces: ['U', 'F', 'D'],
        },
        demoAlg: "U2 M U2 M'",
        setupAlg: "M U2 M' U2",
        highlightPhase: 'lse',
        note: '🎯 Chỉ dùng <M, U2>! Bạn không cần nhớ công thức phức tạp, chỉ cần tư duy gom 2 cạnh trắng xuống đáy!',
      },
      {
        title: '4e. Xử lý D-Dots & Các công thức tối ưu Cột M (Ub, Ua, H, Z)',
        description:
          'Khi 2 cạnh đáy đã về D nhưng bị lệch tâm hoặc chu kỳ cạnh: (1) D-Dots cơ bản: gạt M2; (2) Chu trình 3 cạnh Ub: M U2 M2 U2 M\'; (3) Chu trình 3 cạnh Ua: M\' U2 M2 U2 M\'; (4) Thế H-Perm: U2 M2 U2 M2; (5) Thế Z-Perm: M2 U M2 U M\' U2 M2 U2 M\'. Khối Rubik hoàn thành 100%!',
        diagram: {
          U: solved('U'),
          D: solved('D'),
          F: solved('F'),
          B: solved('B'),
          L: solved('L'),
          R: solved('R'),
          focusFaces: ['U', 'F', 'B'],
        },
        demoAlg: "U2 M2 U2 M2",
        setupAlg: "M2 U2 M2 U2",
        highlightPhase: 'lse',
        note: '🎉 Chúc mừng! Bạn đã chinh phục trọn vẹn toàn bộ phương pháp Roux!',
      },
    ],
  },
];

