import {
  type SolverCubeState,
  FACELETS,
  COLOR_R,
  COLOR_D,
  COLOR_F,
  COLOR_B,
  applyMove,
  isSecondBlockSolved,
  cloneCube,
} from './cubeState';

// Tập hợp các moves cho phép trong Second Block (bảo toàn 100% First Block)
// Roux Invariance: Mọi move trong {R, r, M, U} đều không tác động đến x = -1, y <= 0
const SB_CANDIDATE_MOVES = [
  'U', "U'", 'U2',
  'R', "R'", 'R2',
  'r', "r'", 'r2',
  'M', "M'", 'M2',
];

/**
 * Kiểm tra cạnh DR và tâm R đã giải chưa
 */
export function isDRSolved(c: SolverCubeState): boolean {
  return (
    c[FACELETS.R_C] === COLOR_R &&
    c[FACELETS.D_R] === COLOR_D &&
    c[FACELETS.R_D] === COLOR_R
  );
}

/**
 * Kiểm tra cạnh DR và Cặp sau (BR + DBR) đã giải chưa (Khối 1x2x2 phía sau bên phải)
 */
export function isBackSquareR_Solved(c: SolverCubeState): boolean {
  if (!isDRSolved(c)) return false;

  // Cạnh BR (B = Xanh lam, R = Đỏ)
  if (c[FACELETS.B_R] !== COLOR_B || c[FACELETS.R_B] !== COLOR_R) return false;

  // Góc DBR (D = Trắng, B = Xanh lam, R = Đỏ)
  if (
    c[FACELETS.D_BR] !== COLOR_D ||
    c[FACELETS.B_DR] !== COLOR_B ||
    c[FACELETS.R_DB] !== COLOR_R
  ) return false;

  return true;
}

/**
 * Kiểm tra cạnh DR và Cặp trước (FR + DFR) đã giải chưa (Khối 1x2x2 phía trước bên phải)
 */
export function isFrontSquareR_Solved(c: SolverCubeState): boolean {
  if (!isDRSolved(c)) return false;

  // Cạnh FR (F = Xanh lá, R = Đỏ)
  if (c[FACELETS.F_R] !== COLOR_F || c[FACELETS.R_F] !== COLOR_R) return false;

  // Góc DFR (D = Trắng, F = Xanh lá, R = Đỏ)
  if (
    c[FACELETS.D_FR] !== COLOR_D ||
    c[FACELETS.F_DR] !== COLOR_F ||
    c[FACELETS.R_DF] !== COLOR_R
  ) return false;

  return true;
}

/**
 * Thuật toán IDA* tìm kiếm chuỗi bước đi ngắn nhất thỏa mãn mục tiêu
 */
function idaSearchSB(
  state: SolverCubeState,
  isGoal: (c: SolverCubeState) => boolean,
  allowedMoves: string[],
  maxDepth: number
): string[] | null {
  if (isGoal(state)) return [];

  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = dfsSB(state, isGoal, allowedMoves, depth, null);
    if (result) return result;
  }

  return null;
}

function dfsSB(
  state: SolverCubeState,
  isGoal: (c: SolverCubeState) => boolean,
  allowedMoves: string[],
  depthLeft: number,
  lastMove: string | null
): string[] | null {
  if (depthLeft === 0) {
    return isGoal(state) ? [] : null;
  }

  const lastFace = lastMove ? lastMove[0] : '';

  for (let i = 0; i < allowedMoves.length; i++) {
    const m = allowedMoves[i];
    const face = m[0];

    // Cắt tỉa: Không xoay cùng một mặt liên tiếp (ví dụ: R sau R)
    if (face === lastFace) continue;

    const nextState = applyMove(state, m);

    // Kiểm tra sớm nếu đã đạt mục tiêu
    if (isGoal(nextState) && depthLeft === 1) {
      return [m];
    }

    if (depthLeft > 1) {
      const sub = dfsSB(nextState, isGoal, allowedMoves, depthLeft - 1, m);
      if (sub) {
        return [m, ...sub];
      }
    }
  }

  return null;
}

// Các Macro F2L cho cặp Front-Right (bảo toàn 100% Back-Square và FB)
const FRONT_PAIR_MACROS: string[][] = [
  ['U'], ["U'"], ['U2'],
  ['R', 'U', "R'"],
  ['R', "U'", "R'"],
  ['R', 'U2', "R'"],
  ['U', 'R', "U'", "R'"],
  ["U'", 'R', 'U', "R'"],
  ['U2', 'R', 'U', "R'"],
  ['U2', 'R', "U'", "R'"],
  ['r', 'U', "r'"],
  ['r', "U'", "r'"],
  ['r', 'U2', "r'"],
  ["M'", 'U', 'M'],
  ["M'", "U'", 'M'],
  ["M'", 'U2', 'M'],
  ['M2'],
  ['R', 'U', "R'", 'U', 'R', "U'", "R'"],
  ['R', "U'", "R'", 'U', 'R', "U'", "R'"],
];

// Các Macro F2L cho cặp Back-Right (bảo toàn 100% Front-Square và FB)
const BACK_PAIR_MACROS: string[][] = [
  ['U'], ["U'"], ['U2'],
  ["R'", 'U', 'R'],
  ["R'", "U'", 'R'],
  ["R'", 'U2', 'R'],
  ['U', "R'", "U'", 'R'],
  ["U'", "R'", 'U', 'R'],
  ['U2', "R'", 'U', 'R'],
  ['U2', "R'", "U'", 'R'],
  ["r'", 'U', 'r'],
  ["r'", "U'", 'r'],
  ["r'", 'U2', 'r'],
  ["M'", 'U', 'M'],
  ["M'", "U'", 'M'],
  ["M'", 'U2', 'M'],
  ['M2'],
  ["R'", 'U', 'R', 'U', "R'", "U'", 'R'],
  ["R'", "U'", 'R', 'U', "R'", "U'", 'R'],
];

/**
 * Tìm kiếm BFS giải nốt cặp thứ hai bằng các Macro F2L bảo toàn
 */
function bfsSolvePair(
  state: SolverCubeState,
  isGoal: (c: SolverCubeState) => boolean,
  macros: string[][],
  maxMacros: number = 4
): string[] | null {
  if (isGoal(state)) return [];

  interface QueueNode {
    state: SolverCubeState;
    moves: string[];
    depth: number;
  }

  const queue: QueueNode[] = [{ state, moves: [], depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= maxMacros) continue;

    for (let i = 0; i < macros.length; i++) {
      const macro = macros[i];
      let next = current.state;
      for (const m of macro) {
        next = applyMove(next, m);
      }

      const nextMoves = [...current.moves, ...macro];
      if (isGoal(next)) {
        return nextMoves;
      }

      if (current.depth + 1 < maxMacros) {
        queue.push({
          state: next,
          moves: nextMoves,
          depth: current.depth + 1,
        });
      }
    }
  }

  return null;
}

export interface BlockSolveResult {
  moves: string[];
  state: SolverCubeState;
  explanation: string;
}

/**
 * Tự động giải Second Block (SB: 1x2x3 bên phải) từ trạng thái đã giải xong FB
 * 100% bám sát giáo trình Roux Method VN:
 * 1. Dựng cạnh DR (và tâm R) bằng các moves trong {R, r, M, U}.
 * 2. Ghép và chèn cặp 1 (Back pair hoặc Front pair tùy theo nhánh nào tối ưu hơn).
 * 3. Ghép và chèn cặp còn lại để hoàn tất 1x2x3 block bên phải.
 */
export function solveSecondBlock(initialCube: SolverCubeState): BlockSolveResult {
  let cube = cloneCube(initialCube);
  const totalMoves: string[] = [];

  // Nếu SB đã giải xong ngay từ đầu
  if (isSecondBlockSolved(cube)) {
    return {
      moves: [],
      state: cube,
      explanation: 'Second Block đã hoàn thành từ trước.',
    };
  }

  // --- BƯỚC 1: Dựng cạnh DR và tâm R ---
  if (!isDRSolved(cube)) {
    const drMoves = idaSearchSB(cube, isDRSolved, SB_CANDIDATE_MOVES, 5);
    if (drMoves && drMoves.length > 0) {
      for (const m of drMoves) {
        cube = applyMove(cube, m);
        totalMoves.push(m);
      }
    }
  }

  if (isSecondBlockSolved(cube)) {
    return {
      moves: totalMoves,
      state: cube,
      explanation: 'Hoàn tất Second Block (1x2x3 bên phải).',
    };
  }

  // --- BƯỚC 2 & 3: Thử 2 phương án phân rã cặp ---
  // Phương án A: Làm Back 1x2x2 trước, sau đó Front pair
  const tryBackFirst = (): string[] | null => {
    let testState = cloneCube(cube);
    const movesA: string[] = [];

    if (!isBackSquareR_Solved(testState)) {
      const backMoves = idaSearchSB(testState, isBackSquareR_Solved, SB_CANDIDATE_MOVES, 6);
      if (!backMoves) return null;
      for (const m of backMoves) {
        testState = applyMove(testState, m);
        movesA.push(m);
      }
    }

    if (!isSecondBlockSolved(testState)) {
      // Thử IDA* ngắn trước
      let finishMoves = idaSearchSB(testState, isSecondBlockSolved, SB_CANDIDATE_MOVES, 5);
      // Nếu không ra, dùng Macro BFS
      if (!finishMoves) {
        finishMoves = bfsSolvePair(testState, isSecondBlockSolved, FRONT_PAIR_MACROS, 4);
      }
      if (!finishMoves) return null;
      movesA.push(...finishMoves);
    }

    return movesA;
  };

  // Phương án B: Làm Front 1x2x2 trước, sau đó Back pair
  const tryFrontFirst = (): string[] | null => {
    let testState = cloneCube(cube);
    const movesB: string[] = [];

    if (!isFrontSquareR_Solved(testState)) {
      const frontMoves = idaSearchSB(testState, isFrontSquareR_Solved, SB_CANDIDATE_MOVES, 6);
      if (!frontMoves) return null;
      for (const m of frontMoves) {
        testState = applyMove(testState, m);
        movesB.push(m);
      }
    }

    if (!isSecondBlockSolved(testState)) {
      let finishMoves = idaSearchSB(testState, isSecondBlockSolved, SB_CANDIDATE_MOVES, 5);
      if (!finishMoves) {
        finishMoves = bfsSolvePair(testState, isSecondBlockSolved, BACK_PAIR_MACROS, 4);
      }
      if (!finishMoves) return null;
      movesB.push(...finishMoves);
    }

    return movesB;
  };

  const pathA = tryBackFirst();
  const pathB = tryFrontFirst();

  let chosenPath: string[] | null = null;
  if (pathA && pathB) {
    chosenPath = pathA.length <= pathB.length ? pathA : pathB;
  } else {
    chosenPath = pathA || pathB;
  }

  // Fallback: Nếu phân rã không ra, thử tìm trực tiếp SB tới độ sâu 6
  if (!chosenPath) {
    chosenPath = idaSearchSB(cube, isSecondBlockSolved, SB_CANDIDATE_MOVES, 6);
  }

  if (chosenPath) {
    for (const m of chosenPath) {
      cube = applyMove(cube, m);
      totalMoves.push(m);
    }
  }

  return {
    moves: totalMoves,
    state: cube,
    explanation: `Dựng Second Block (1x2x3 bên phải): ${totalMoves.join(' ')}`,
  };
}
