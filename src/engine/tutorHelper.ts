import type { FullRouxSolution } from './solver/rouxSolver';

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
