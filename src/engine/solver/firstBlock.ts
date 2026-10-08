import {
  type SolverCubeState,
  FACELETS,
  COLOR_L,
  COLOR_D,
  COLOR_F,
  COLOR_B,
  applyMove,
  isFirstBlockSolved,
  cloneCube,
} from './cubeState';

// Tập hợp các moves dùng trong xây dựng First Block (WCA moves + M, r)
const FB_CANDIDATE_MOVES = [
  'U', "U'", 'U2',
  'D', "D'", 'D2',
  'F', "F'", 'F2',
  'B', "B'", 'B2',
  'L', "L'", 'L2',
  'R', "R'", 'R2',
  'M', "M'", 'M2',
  'r', "r'", 'r2',
];

/**
 * Kiểm tra cạnh DL và tâm L đã giải chưa
 */
export function isDLSolved(c: SolverCubeState): boolean {
  return (
    c[FACELETS.L_C] === COLOR_L &&
    c[FACELETS.D_L] === COLOR_D &&
    c[FACELETS.L_D] === COLOR_L
  );
}

/**
 * Kiểm tra cạnh DL và Cặp sau (BL + DBL) đã giải chưa (Khối 1x2x2 phía sau)
 */
export function isBackSquareSolved(c: SolverCubeState): boolean {
  if (!isDLSolved(c)) return false;

  // Cạnh BL (B = Xanh lam, L = Cam)
  if (c[FACELETS.B_L] !== COLOR_B || c[FACELETS.L_B] !== COLOR_L) return false;

  // Góc DBL (D = Trắng, B = Xanh lam, L = Cam)
  if (
    c[FACELETS.D_BL] !== COLOR_D ||
    c[FACELETS.B_DL] !== COLOR_B ||
    c[FACELETS.L_DB] !== COLOR_L
  ) return false;

  return true;
}

/**
 * Kiểm tra cạnh DL và Cặp trước (FL + DFL) đã giải chưa (Khối 1x2x2 phía trước)
 */
export function isFrontSquareSolved(c: SolverCubeState): boolean {
  if (!isDLSolved(c)) return false;

  // Cạnh FL (F = Xanh lá, L = Cam)
  if (c[FACELETS.F_L] !== COLOR_F || c[FACELETS.L_F] !== COLOR_L) return false;

  // Góc DFL (D = Trắng, F = Xanh lá, L = Cam)
  if (
    c[FACELETS.D_FL] !== COLOR_D ||
    c[FACELETS.F_DL] !== COLOR_F ||
    c[FACELETS.L_DF] !== COLOR_L
  ) return false;

  return true;
}

/**
 * Thuật toán tìm kiếm IDA* (Iterative Deepening A*) giải một mục tiêu cụ thể
 */
function idaSearch(
  state: SolverCubeState,
  isGoal: (c: SolverCubeState) => boolean,
  allowedMoves: string[],
  maxDepth: number
): string[] | null {
  if (isGoal(state)) return [];

  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = dfs(state, isGoal, allowedMoves, depth, null);
    if (result) return result;
  }

  return null;
}

function dfs(
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
      const sub = dfs(nextState, isGoal, allowedMoves, depthLeft - 1, m);
      if (sub) {
        return [m, ...sub];
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
 * Tự động giải First Block (FB: 1x2x3 bên trái) từ bất kỳ trạng thái nào
 * Bám sát giáo trình Roux Method VN:
 * 1. Đặt cạnh DL (và tâm L).
 * 2. Ghép và chèn cặp thứ nhất (Front hoặc Back tùy theo bên nào tối ưu hơn).
 * 3. Ghép và chèn cặp còn lại để hoàn tất 1x2x3 block.
 */
export function solveFirstBlock(initialCube: SolverCubeState): BlockSolveResult {
  let cube = cloneCube(initialCube);
  const totalMoves: string[] = [];

  // Nếu FB đã giải xong ngay từ đầu
  if (isFirstBlockSolved(cube)) {
    return {
      moves: [],
      state: cube,
      explanation: 'First Block đã hoàn thành từ trước.',
    };
  }

  // --- BƯỚC 1: Dựng cạnh DL và tâm L ---
  if (!isDLSolved(cube)) {
    const dlMoves = idaSearch(cube, isDLSolved, FB_CANDIDATE_MOVES, 4);
    if (dlMoves && dlMoves.length > 0) {
      for (const m of dlMoves) {
        cube = applyMove(cube, m);
        totalMoves.push(m);
      }
    }
  }

  if (isFirstBlockSolved(cube)) {
    return {
      moves: totalMoves,
      state: cube,
      explanation: 'Hoàn tất First Block (1x2x3 bên trái).',
    };
  }

  // --- BƯỚC 2 & 3: Thử 2 phương án (Làm cặp sau trước HOẶC làm cặp trước trước) ---
  // Phương án A: Làm Back 1x2x2 trước, sau đó Front pair
  const tryBackFirst = (): string[] | null => {
    let testState = cloneCube(cube);
    const movesA: string[] = [];

    if (!isBackSquareSolved(testState)) {
      const backMoves = idaSearch(testState, isBackSquareSolved, FB_CANDIDATE_MOVES, 5);
      if (!backMoves) return null;
      for (const m of backMoves) {
        testState = applyMove(testState, m);
        movesA.push(m);
      }
    }

    if (!isFirstBlockSolved(testState)) {
      const finishMoves = idaSearch(testState, isFirstBlockSolved, FB_CANDIDATE_MOVES, 5);
      if (!finishMoves) return null;
      movesA.push(...finishMoves);
    }

    return movesA;
  };

  // Phương án B: Làm Front 1x2x2 trước, sau đó Back pair
  const tryFrontFirst = (): string[] | null => {
    let testState = cloneCube(cube);
    const movesB: string[] = [];

    if (!isFrontSquareSolved(testState)) {
      const frontMoves = idaSearch(testState, isFrontSquareSolved, FB_CANDIDATE_MOVES, 5);
      if (!frontMoves) return null;
      for (const m of frontMoves) {
        testState = applyMove(testState, m);
        movesB.push(m);
      }
    }

    if (!isFirstBlockSolved(testState)) {
      const finishMoves = idaSearch(testState, isFirstBlockSolved, FB_CANDIDATE_MOVES, 5);
      if (!finishMoves) return null;
      movesB.push(...finishMoves);
    }

    return movesB;
  };

  // Chọn phương án có số bước giải ngắn hơn
  const pathA = tryBackFirst();
  const pathB = tryFrontFirst();

  let chosenPath: string[] | null = null;
  if (pathA && pathB) {
    chosenPath = pathA.length <= pathB.length ? pathA : pathB;
  } else {
    chosenPath = pathA || pathB;
  }

  // Nếu cả 2 phương án phân rã đều sâu hơn 5 moves, chạy IDA* trực tiếp tìm đích FB
  if (!chosenPath) {
    chosenPath = idaSearch(cube, isFirstBlockSolved, FB_CANDIDATE_MOVES, 6);
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
    explanation: `Dựng First Block (1x2x3 bên trái): ${totalMoves.join(' ')}`,
  };
}
