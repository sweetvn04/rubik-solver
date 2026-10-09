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

// Các chuỗi Unslot Trigger giải phóng các mảnh bị kẹt chéo ở tầng D/R lên tầng U
const SB_SETUPS: string[][] = [
  [], // Không setup (trạng thái gốc)
  ['R', 'U', "R'"],
  ["R'", 'U', 'R'],
  ['r', 'U', "r'"],
  ["r'", 'U', 'r'],
  ['R', "U'", "R'"],
  ["R'", "U'", 'R'],
  ['r', "U'", "r'"],
  ['R2'],
  ['M2'],
];

export interface BlockSolveResult {
  moves: string[];
  state: SolverCubeState;
  explanation: string;
}

/**
 * Tự động giải Second Block (SB: 1x2x3 bên phải) từ trạng thái đã giải xong FB
 * 100% bám sát giáo trình Roux Method VN và bảo toàn tuyệt đối First Block.
 */
export function solveSecondBlock(initialCube: SolverCubeState): BlockSolveResult {
  // Nếu SB đã giải xong ngay từ đầu
  if (isSecondBlockSolved(initialCube)) {
    return {
      moves: [],
      state: initialCube,
      explanation: 'Second Block đã hoàn thành từ trước.',
    };
  }

  // Helper tìm kiếm chặng thứ 2 (hoàn thiện cặp còn lại)
  const solveRemainingPair = (
    state: SolverCubeState,
    isFrontSquareCompleted: boolean,
    maxDepth: number = 6
  ): string[] | null => {
    if (isSecondBlockSolved(state)) return [];

    // 1. Thử IDA* ngắn (độ sâu 1..5)
    let finishMoves = idaSearchSB(state, isSecondBlockSolved, SB_CANDIDATE_MOVES, 5);
    if (finishMoves) return finishMoves;

    // 2. Thử Macro BFS an toàn (độ sâu tối đa 4 tầng macro)
    const macros = isFrontSquareCompleted ? BACK_PAIR_MACROS : FRONT_PAIR_MACROS;
    finishMoves = bfsSolvePair(state, isSecondBlockSolved, macros, 4);
    if (finishMoves) return finishMoves;

    // 3. Thử IDA* sâu
    if (maxDepth > 5) {
      finishMoves = idaSearchSB(state, isSecondBlockSolved, SB_CANDIDATE_MOVES, maxDepth);
    }
    return finishMoves;
  };

  // VÒNG 1: Thử tất cả các Setups ở độ sâu 5..6 (tốc độ siêu nhanh < 300ms)
  for (const prefix of SB_SETUPS) {
    let base = initialCube;
    for (const m of prefix) base = applyMove(base, m);

    // Nhánh 1: BackSquare trước -> giải nốt SB
    const bMoves = idaSearchSB(base, isBackSquareR_Solved, SB_CANDIDATE_MOVES, 6);
    if (bMoves) {
      let afterB = base;
      for (const m of bMoves) afterB = applyMove(afterB, m);
      const fMoves = solveRemainingPair(afterB, false, 6);
      if (fMoves) {
        let finalState = afterB;
        for (const m of fMoves) finalState = applyMove(finalState, m);
        if (isSecondBlockSolved(finalState)) {
          const totalMoves = [...prefix, ...bMoves, ...fMoves];
          return {
            moves: totalMoves,
            state: finalState,
            explanation: `Dựng Second Block (1x2x3 bên phải): ${totalMoves.join(' ')}`,
          };
        }
      }
    }

    // Nhánh 2: FrontSquare trước -> giải nốt SB
    const fMoves = idaSearchSB(base, isFrontSquareR_Solved, SB_CANDIDATE_MOVES, 6);
    if (fMoves) {
      let afterF = base;
      for (const m of fMoves) afterF = applyMove(afterF, m);
      const b2Moves = solveRemainingPair(afterF, true, 6);
      if (b2Moves) {
        let finalState = afterF;
        for (const m of b2Moves) finalState = applyMove(finalState, m);
        if (isSecondBlockSolved(finalState)) {
          const totalMoves = [...prefix, ...fMoves, ...b2Moves];
          return {
            moves: totalMoves,
            state: finalState,
            explanation: `Dựng Second Block (1x2x3 bên phải): ${totalMoves.join(' ')}`,
          };
        }
      }
    }
  }

  // VÒNG 2 (Fallback cho các trường hợp đặc biệt khó): Thử độ sâu 7 trên các setup chính
  const PRIMARY_SETUPS = [[], ['R', 'U', "R'"], ["R'", 'U', 'R'], ['r', 'U', "r'"]];
  for (const prefix of PRIMARY_SETUPS) {
    let base = initialCube;
    for (const m of prefix) base = applyMove(base, m);

    // Thử BackSquare độ sâu 7
    const bMoves = idaSearchSB(base, isBackSquareR_Solved, SB_CANDIDATE_MOVES, 7);
    if (bMoves) {
      let afterB = base;
      for (const m of bMoves) afterB = applyMove(afterB, m);
      const fMoves = solveRemainingPair(afterB, false, 7);
      if (fMoves) {
        let finalState = afterB;
        for (const m of fMoves) finalState = applyMove(finalState, m);
        if (isSecondBlockSolved(finalState)) {
          const totalMoves = [...prefix, ...bMoves, ...fMoves];
          return {
            moves: totalMoves,
            state: finalState,
            explanation: `Dựng Second Block (1x2x3 bên phải): ${totalMoves.join(' ')}`,
          };
        }
      }
    }

    // Thử FrontSquare độ sâu 7
    const fMoves = idaSearchSB(base, isFrontSquareR_Solved, SB_CANDIDATE_MOVES, 7);
    if (fMoves) {
      let afterF = base;
      for (const m of fMoves) afterF = applyMove(afterF, m);
      const b2Moves = solveRemainingPair(afterF, true, 7);
      if (b2Moves) {
        let finalState = afterF;
        for (const m of b2Moves) finalState = applyMove(finalState, m);
        if (isSecondBlockSolved(finalState)) {
          const totalMoves = [...prefix, ...fMoves, ...b2Moves];
          return {
            moves: totalMoves,
            state: finalState,
            explanation: `Dựng Second Block (1x2x3 bên phải): ${totalMoves.join(' ')}`,
          };
        }
      }
    }
  }

  // Fallback khẩn cấp: tìm trực tiếp SB độ sâu 7
  const emergency = idaSearchSB(initialCube, isSecondBlockSolved, SB_CANDIDATE_MOVES, 7);
  if (emergency) {
    let endState = cloneCube(initialCube);
    for (const m of emergency) endState = applyMove(endState, m);
    if (isSecondBlockSolved(endState)) {
      return {
        moves: emergency,
        state: endState,
        explanation: `Dựng Second Block (1x2x3 bên phải): ${emergency.join(' ')}`,
      };
    }
  }

  // Nếu vẫn không ra, trả về rỗng kèm thông báo thay vì trả về moves cụt làm hỏng khối
  return {
    moves: [],
    state: initialCube,
    explanation: 'Không tìm thấy lời giải cho Second Block trong giới hạn độ sâu.',
  };
}
