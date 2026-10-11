import type { FullRouxSolution } from './solver/rouxSolver';
import {
  type SolverCubeState,
  cloneCube,
  applyMove,
} from './solver/cubeState';
import {
  isDLSolved,
  isBackSquareSolved,
  isFrontSquareSolved,
} from './solver/firstBlock';
import {
  isDRSolved,
  isBackSquareR_Solved,
  isFrontSquareR_Solved,
} from './solver/secondBlock';

export interface TutorPhase {
  id: 'fb' | 'sb' | 'cmll' | 'lse';
  phaseIndex: number;
  title: string;
  subtitle: string;
  startIndex: number; // Vị trí bắt đầu trong allMoves (inclusive)
  endIndex: number;   // Vị trí kết thúc trong allMoves (exclusive)
  moves: string[];
  caseName?: string;
  tip: string;
}

/**
 * Một cụm mục tiêu logic trong lộ trình giải (Chunk)
 * Giúp người học hiểu TẠI SAO lại xoay các nước đi này, tư duy block-building thay vì nhớ từng move rời rạc
 */
export interface TutorChunk {
  id: string;
  phaseId: 'fb' | 'sb' | 'cmll' | 'lse';
  phaseTitle: string;
  chunkTitle: string;
  chunkSubtitle: string;
  startIndex: number;
  endIndex: number;
  moves: string[];
  intent: string;       // Mục đích khối & tư duy đằng sau cụm xoay này
  recognition: string;  // Cách nhận biết trường hợp trước khi xoay cụm này
  keyTip?: string;      // Mẹo nhớ thực chiến
}

/**
 * Nghịch đảo một move WCA để hỗ trợ thao tác Undo / Lùi lại 1 bước
 */
export function invertMove(move: string): string {
  if (!move) return '';
  if (move.endsWith('2')) return move; // Move xoay 180 độ nghịch đảo là chính nó
  if (move.endsWith("'")) return move.slice(0, -1); // Xoay ngược ' -> thuận
  return `${move}'`; // Thuận -> xoay ngược '
}

/**
 * Diễn giải chuyển động xoay bằng tiếng Việt thân thiện, trực quan cho người học
 */
export function getMoveDescriptionVi(rawMove: string): string {
  if (!rawMove) return '';

  const face = rawMove[0];
  const isDouble = rawMove.includes('2');
  const isPrime = rawMove.includes("'");

  const dirText = isDouble
    ? '180° (xoay 2 lần)'
    : isPrime
    ? 'ngược chiều kim đồng hồ 90°'
    : 'thuận chiều kim đồng hồ 90°';

  switch (face) {
    case 'R':
      return `Mặt Phải (R): xoay ${dirText}`;
    case 'L':
      return `Mặt Trái (L): xoay ${dirText}`;
    case 'U':
      return `Tầng Trên (U): xoay ${dirText}`;
    case 'D':
      return `Tầng Đáy (D): xoay ${dirText}`;
    case 'F':
      return `Mặt Trước (F): xoay ${dirText}`;
    case 'B':
      return `Mặt Sau (B): xoay ${dirText}`;

    // Tầng giữa Roux
    case 'M':
      if (isDouble) return 'Tầng Giữa (M): xoay 180°';
      if (isPrime) return 'Tầng Giữa (M\'): gạt LÊN trên 90° (ngược chiều L)';
      return 'Tầng Giữa (M): gạt XUỐNG dưới 90° (cùng chiều L)';

    case 'E':
      return `Tầng Giữa ngang (E): xoay ${dirText}`;
    case 'S':
      return `Tầng Giữa dọc (S): xoay ${dirText}`;

    // Wide moves (2 tầng cùng lúc)
    case 'r':
      return `Xoay 2 tầng Phải (r): bao gồm mặt R và tầng giữa M ${dirText}`;
    case 'l':
      return `Xoay 2 tầng Trái (l): bao gồm mặt L và tầng giữa M ${dirText}`;
    case 'u':
      return `Xoay 2 tầng Trên (u): bao gồm tầng U và tầng giữa E ${dirText}`;
    case 'd':
      return `Xoay 2 tầng Đáy (d): bao gồm tầng D và tầng giữa E ${dirText}`;
    case 'f':
      return `Xoay 2 tầng Trước (f): bao gồm mặt F và tầng giữa S ${dirText}`;
    case 'b':
      return `Xoay 2 tầng Sau (b): bao gồm mặt B và tầng giữa S ${dirText}`;

    default:
      return `Xoay ${rawMove}`;
  }
}

/**
 * Phân rã chuỗi giải của Master Roux thành 4 Phase hướng dẫn trực quan
 */
export function createTutorPhases(solution: FullRouxSolution): TutorPhase[] {
  const phases: TutorPhase[] = [];
  let currentIndex = 0;

  // 1. Phase 1: First Block
  if (solution.fbMoves.length > 0) {
    const end = currentIndex + solution.fbMoves.length;
    phases.push({
      id: 'fb',
      phaseIndex: 0,
      title: 'Bước 1: First Block (FB)',
      subtitle: 'Xây dựng khối 1x2x3 bên trái',
      startIndex: currentIndex,
      endIndex: end,
      moves: solution.fbMoves,
      tip: 'Mục tiêu: Đưa tâm L, cạnh DL và 2 cặp F2L bên trái (FL+DFL, BL+DBL) vào đúng vị trí.',
    });
    currentIndex = end;
  }

  // 2. Phase 2: Second Block
  if (solution.sbMoves.length > 0) {
    const end = currentIndex + solution.sbMoves.length;
    phases.push({
      id: 'sb',
      phaseIndex: 1,
      title: 'Bước 2: Second Block (SB)',
      subtitle: 'Xây dựng khối 1x2x3 bên phải',
      startIndex: currentIndex,
      endIndex: end,
      moves: solution.sbMoves,
      tip: 'Mục tiêu: Dựng khối đối xứng bên phải mà không làm vỡ khối First Block bên trái.',
    });
    currentIndex = end;
  }

  // 3. Phase 3: CMLL
  if (solution.cmllMoves.length > 0) {
    const end = currentIndex + solution.cmllMoves.length;
    phases.push({
      id: 'cmll',
      phaseIndex: 2,
      title: 'Bước 3: CMLL',
      subtitle: 'Định hướng & hoán vị 4 góc tầng trên',
      startIndex: currentIndex,
      endIndex: end,
      moves: solution.cmllMoves,
      caseName: solution.cmllCaseName,
      tip: `Trường hợp: ${solution.cmllCaseName || 'Chuẩn'}. Lật toàn bộ màu vàng lên trên và khớp vị trí 4 góc.`,
    });
    currentIndex = end;
  }

  // 4. Phase 4: LSE
  if (solution.lseMoves.length > 0) {
    const end = currentIndex + solution.lseMoves.length;
    phases.push({
      id: 'lse',
      phaseIndex: 3,
      title: 'Bước 4: Last Six Edges (LSE)',
      subtitle: 'Giải quyết 6 cạnh cuối bằng <M, U>',
      startIndex: currentIndex,
      endIndex: end,
      moves: solution.lseMoves,
      tip: 'Mục tiêu: Lật đúng hướng 6 cạnh (EO), đưa 2 cạnh UL/UR vào vị trí, và hoán vị 4 cạnh tầng M.',
    });
    currentIndex = end;
  }

  return phases;
}

/**
 * Phân tích chuyên sâu chuỗi giải thành toàn bộ các cụm mục tiêu (Chunk Breakdown)
 * Giúp người học nắm được trọn vẹn tư duy block-building từng bước của Roux
 */
export function createTutorChunks(
  solution: FullRouxSolution,
  initialCubeState?: SolverCubeState
): TutorChunk[] {
  const chunks: TutorChunk[] = [];
  let globalMoveOffset = 0;
  let st = initialCubeState ? cloneCube(initialCubeState) : null;

  // ── 1. PHÂN CỤM FIRST BLOCK (FB) ──
  if (solution.fbMoves.length > 0) {
    const fbTotal = solution.fbMoves.length;
    let dlStep = -1;
    let squareStep = -1;

    if (st) {
      for (let i = 0; i < fbTotal; i++) {
        st = applyMove(st, solution.fbMoves[i]);
        if (dlStep === -1 && isDLSolved(st)) {
          dlStep = i + 1;
        }
        if (squareStep === -1 && (isBackSquareSolved(st) || isFrontSquareSolved(st))) {
          squareStep = i + 1;
        }
      }
    }

    // Nếu không phân rã tự động được, chia dựa trên độ dài tự nhiên
    if (dlStep <= 0 || dlStep >= fbTotal) {
      if (fbTotal <= 4) {
        dlStep = fbTotal;
      } else {
        dlStep = Math.min(3, Math.floor(fbTotal / 2));
      }
    }
    if (squareStep <= dlStep || squareStep >= fbTotal) {
      squareStep = dlStep < fbTotal ? Math.min(dlStep + 3, fbTotal) : fbTotal;
    }

    // Chunk 1.1: Mỏ neo DL
    const chunk1Moves = solution.fbMoves.slice(0, dlStep);
    chunks.push({
      id: 'fb_anchor',
      phaseId: 'fb',
      phaseTitle: 'Bước 1: First Block',
      chunkTitle: 'Dựng mỏ neo DL (Trắng - Đỏ)',
      chunkSubtitle: 'Đặt cạnh đáy bên trái làm nền tảng',
      startIndex: globalMoveOffset,
      endIndex: globalMoveOffset + chunk1Moves.length,
      moves: chunk1Moves,
      intent: 'Đưa cạnh DL (Trắng - Đỏ) về đúng vị trí giữa tâm Trắng (D) và tâm Đỏ (L) để cố định toạ độ tầng đáy trái.',
      recognition: 'Tìm cạnh có 2 màu Trắng và Đỏ trên khối Rubik. Dùng các move tự do đưa về tầng đáy D bên trái.',
      keyTip: 'Ở bước này toàn bộ các viên khác chưa cần giữ, hãy xoay tự do và trực quan nhất có thể.',
    });

    // Chunk 1.2: Cặp 1x2x2 Square (nếu còn moves)
    if (squareStep > dlStep && squareStep < fbTotal) {
      const chunk2Moves = solution.fbMoves.slice(dlStep, squareStep);
      chunks.push({
        id: 'fb_square',
        phaseId: 'fb',
        phaseTitle: 'Bước 1: First Block',
        chunkTitle: 'Ghép cặp tạo khối 1x2x2',
        chunkSubtitle: 'Dựng khối vuông 1x2x2 ở góc phía sau hoặc phía trước',
        startIndex: globalMoveOffset + dlStep,
        endIndex: globalMoveOffset + squareStep,
        moves: chunk2Moves,
        intent: 'Tách cặp góc và cạnh lên tầng U, xoay ghép đôi đúng màu rồi đưa xuống tầng đáy bên cạnh mỏ neo DL.',
        recognition: 'Quan sát vị trí của góc DFL/DBL và cạnh FL/BL tương ứng, ghép cạnh và góc sao cho khớp màu.',
        keyTip: 'Tận dụng tầng giữa M và tầng trên U để tự do ghép cặp mà không bị vướng.',
      });
    }

    // Chunk 1.3: Hoàn tất First Block
    const lastFbStart = squareStep > dlStep && squareStep < fbTotal ? squareStep : dlStep;
    if (lastFbStart < fbTotal) {
      const chunk3Moves = solution.fbMoves.slice(lastFbStart, fbTotal);
      chunks.push({
        id: 'fb_finish',
        phaseId: 'fb',
        phaseTitle: 'Bước 1: First Block',
        chunkTitle: 'Hoàn tất First Block (1x2x3)',
        chunkSubtitle: 'Ghép cặp góc-cạnh thứ hai vào khe còn lại',
        startIndex: globalMoveOffset + lastFbStart,
        endIndex: globalMoveOffset + fbTotal,
        moves: chunk3Moves,
        intent: 'Ghép nốt cặp góc-cạnh còn lại ở phía đối diện và chèn vào vị trí để hoàn thiện trọn vẹn khối 1x2x3 bên trái.',
        recognition: 'Tìm viên góc và cạnh còn lại của mặt L, ghép cặp trên U rồi chèn xuống khe trống.',
        keyTip: 'Khối 1x2x3 bên trái sau khi xong sẽ được giữ nguyên vẹn suốt các bước còn lại!',
      });
    }

    globalMoveOffset += fbTotal;
  }

  // ── 2. PHÂN CỤM SECOND BLOCK (SB) ──
  if (solution.sbMoves.length > 0) {
    const sbTotal = solution.sbMoves.length;
    let drStep = -1;
    let sbSquareStep = -1;

    if (st) {
      for (let i = 0; i < sbTotal; i++) {
        st = applyMove(st, solution.sbMoves[i]);
        if (drStep === -1 && isDRSolved(st)) {
          drStep = i + 1;
        }
        if (sbSquareStep === -1 && (isBackSquareR_Solved(st) || isFrontSquareR_Solved(st))) {
          sbSquareStep = i + 1;
        }
      }
    }

    // Fallback nếu không phát hiện mốc cụ thể
    if (drStep <= 0 || drStep >= sbTotal) {
      if (sbTotal <= 4) {
        drStep = sbTotal;
      } else {
        drStep = Math.min(3, Math.floor(sbTotal / 3));
      }
    }
    if (sbSquareStep <= drStep || sbSquareStep >= sbTotal) {
      sbSquareStep = drStep < sbTotal ? Math.min(drStep + 4, Math.floor((sbTotal * 2) / 3)) : sbTotal;
    }

    // Chunk 2.1: Mỏ neo DR
    const chunkSb1 = solution.sbMoves.slice(0, drStep);
    chunks.push({
      id: 'sb_anchor',
      phaseId: 'sb',
      phaseTitle: 'Bước 2: Second Block',
      chunkTitle: 'Dựng mỏ neo DR (Trắng - Cam)',
      chunkSubtitle: 'Đặt cạnh đáy bên phải bằng <R, r, M, U>',
      startIndex: globalMoveOffset,
      endIndex: globalMoveOffset + chunkSb1.length,
      moves: chunkSb1,
      intent: 'Đưa cạnh DR (Trắng - Cam) về đúng vị trí bên phải mà tuyệt đối KHÔNG làm vỡ khối 1x2x3 bên trái.',
      recognition: 'Tìm cạnh Trắng - Cam. Sử dụng các chuyển động <R, r, M, U> để đưa viên này vào vị trí DR.',
      keyTip: 'Từ bước này trở đi, không xoay mặt L hoặc F/B tùy tiện để bảo toàn khối First Block!',
    });

    // Chunk 2.2: Ghép cặp thứ nhất SB
    if (sbSquareStep > drStep && sbSquareStep < sbTotal) {
      const chunkSb2 = solution.sbMoves.slice(drStep, sbSquareStep);
      chunks.push({
        id: 'sb_square',
        phaseId: 'sb',
        phaseTitle: 'Bước 2: Second Block',
        chunkTitle: 'Ghép cặp sau BR (hoặc cặp trước FR)',
        chunkSubtitle: 'Dựng khối 1x2x2 bên phải',
        startIndex: globalMoveOffset + drStep,
        endIndex: globalMoveOffset + sbSquareStep,
        moves: chunkSb2,
        intent: 'Tách góc và cạnh lên tầng U bằng move r hoặc R, ghép cặp rồi chèn vào khe sau BR.',
        recognition: 'Nhận biết cặp góc DBR và cạnh BR (Cam-Xanh lam). Đưa lên U, ghép đôi và gạt R\' hoặc r\' chèn vào khe.',
        keyTip: 'Sử dụng r U\' r\' hoặc R U R\' để mở và đóng khe cờ mượt mà.',
      });
    }

    // Chunk 2.3: Hoàn tất Second Block
    const lastSbStart = sbSquareStep > drStep && sbSquareStep < sbTotal ? sbSquareStep : drStep;
    if (lastSbStart < sbTotal) {
      const chunkSb3 = solution.sbMoves.slice(lastSbStart, sbTotal);
      chunks.push({
        id: 'sb_finish',
        phaseId: 'sb',
        phaseTitle: 'Bước 2: Second Block',
        chunkTitle: 'Hoàn tất Second Block (1x2x3)',
        chunkSubtitle: 'Ghép cặp góc-cạnh cuối cùng bên phải',
        startIndex: globalMoveOffset + lastSbStart,
        endIndex: globalMoveOffset + sbTotal,
        moves: chunkSb3,
        intent: 'Giải quyết cặp F2L cuối cùng (FR) để hoàn thiện trọn vẹn 2 khối 1x2x3 ở cả hai bên hông.',
        recognition: 'Cặp góc URF/DFR và cạnh FR (Cam-Xanh lá). Ghép cặp và chèn vào khe trước.',
        keyTip: 'Sau khi hoàn thành SB, Rubik có 2 khối hông cố định và trục giữa M xoay tự do!',
      });
    }

    globalMoveOffset += sbTotal;
  }

  // ── 3. PHÂN CỤM CMLL ──
  if (solution.cmllMoves.length > 0) {
    const cmllTotal = solution.cmllMoves.length;
    chunks.push({
      id: 'cmll_corner',
      phaseId: 'cmll',
      phaseTitle: 'Bước 3: CMLL',
      chunkTitle: `Giải 4 góc tầng trên (${solution.cmllCaseName || 'Chuẩn'})`,
      chunkSubtitle: 'Định hướng và hoán vị toàn bộ 4 góc tầng U',
      startIndex: globalMoveOffset,
      endIndex: globalMoveOffset + cmllTotal,
      moves: solution.cmllMoves,
      intent: 'Lật tất cả màu vàng lên mặt U và hoán vị 4 góc về đúng vị trí chỉ bằng 1 chuỗi thuật toán, bảo toàn hoàn hảo cả 2 khối FB và SB.',
      recognition: solution.cmllCaseName
        ? `Trường hợp: ${solution.cmllCaseName}. Nhận biết mặt vàng trên U và các cặp góc cùng màu / đèn pha ở 4 mặt bên.`
        : 'Nhận diện hình dạng mặt vàng (Sune, Antisune, H, Pi, T, U, L) và các cặp đèn pha kề/chéo.',
      keyTip: 'Nếu chưa thuộc 45 công thức, bạn hoàn toàn có thể dùng 2-Look CMLL (OLL góc -> PLL góc) cực kỳ dễ nhớ!',
    });
    globalMoveOffset += cmllTotal;
  }

  // ── 4. PHÂN CỤM LSE (LAST SIX EDGES) ──
  if (solution.lseMoves.length > 0) {
    // 4a: EO (Edge Orientation)
    if (solution.moves4a_EO && solution.moves4a_EO.length > 0) {
      const eoTotal = solution.moves4a_EO.length;
      chunks.push({
        id: 'lse_4a_eo',
        phaseId: 'lse',
        phaseTitle: 'Bước 4: Last Six Edges (LSE)',
        chunkTitle: 'Bước 4a: Định hướng 6 cạnh (EO)',
        chunkSubtitle: 'Lật đúng hướng toàn bộ 6 cạnh bằng <M, U>',
        startIndex: globalMoveOffset,
        endIndex: globalMoveOffset + eoTotal,
        moves: solution.moves4a_EO,
        intent: 'Lật toàn bộ 6 cạnh còn lại sao cho các mặt màu Vàng hoặc Trắng đều hướng lên U hoặc xuống D (chuyển về Good Edges).',
        recognition: 'Đếm số lượng Bad Edges (cạnh có màu Vàng/Trắng nằm ở mặt F, B, R, L). Nhận diện thế cờ (3/1, 1/1, 2/2, 4/0...) và xoay trigger.',
        keyTip: 'Luôn đưa về thế cơ bản 3/1 (F) [M\' U\' M\'] hoặc 3/1 (B) [M U\' M\'] để giải dứt điểm!',
      });
      globalMoveOffset += eoTotal;
    }

    // 4b: UL/UR
    if (solution.moves4b_UL_UR && solution.moves4b_UL_UR.length > 0) {
      const ulurTotal = solution.moves4b_UL_UR.length;
      chunks.push({
        id: 'lse_4b_ulur',
        phaseId: 'lse',
        phaseTitle: 'Bước 4: Last Six Edges (LSE)',
        chunkTitle: 'Bước 4b: Đưa cạnh UL và UR về vị trí',
        chunkSubtitle: 'Khớp 2 cạnh trái và phải tầng U',
        startIndex: globalMoveOffset,
        endIndex: globalMoveOffset + ulurTotal,
        moves: solution.moves4b_UL_UR,
        intent: 'Đưa cạnh UL (Đỏ - Vàng) và UR (Cam - Vàng) về đúng 2 bên cánh L và R mà không làm hỏng EO (chỉ dùng các move <M, U2>).',
        recognition: 'Tìm 2 viên UL và UR. Đưa 1 viên xuống tầng D (DF hoặc DB), xoay U đưa viên kia vào đối diện trên cột M rồi hoán đổi.',
        keyTip: 'Chỉ cần quan sát 2 viên có màu Đỏ/Vàng và Cam/Vàng, không cần quan tâm các cạnh khác.',
      });
      globalMoveOffset += ulurTotal;
    }

    // 4c: L4E
    if (solution.moves4c_L4E && solution.moves4c_L4E.length > 0) {
      const l4eTotal = solution.moves4c_L4E.length;
      chunks.push({
        id: 'lse_4c_l4e',
        phaseId: 'lse',
        phaseTitle: 'Bước 4: Last Six Edges (LSE)',
        chunkTitle: 'Bước 4c: Hoàn tất 4 cạnh cuối (L4E)',
        chunkSubtitle: 'Giải quyết tầng giữa M và các tâm để hoàn thành khối Rubik',
        startIndex: globalMoveOffset,
        endIndex: globalMoveOffset + l4eTotal,
        moves: solution.moves4c_L4E,
        intent: 'Hoán vị 4 cạnh còn lại trên cột M (DF, DB, UF, UB) và khớp lại màu tâm để giải quyết 100% khối Rubik.',
        recognition: 'Nhìn tâm đáy D: nếu lệch tâm gạt M2 (D-Dots). Nhìn chu trình 3 cạnh (Ub/Ua) hoặc đổi chéo 2 cặp (H-Perm/Z-Perm).',
        keyTip: 'Đây là chặng về đích! Chỉ với vài chuyển động cột M cực nhanh là khối Rubik hoàn tất hoàn toàn.',
      });
      globalMoveOffset += l4eTotal;
    }
  }

  return chunks;
}

