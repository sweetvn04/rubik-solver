import {
  applyMove,
  isCMLLSolved,
  isCubeSolved,
  type SolverCubeState,
  FACELETS,
  COLOR_U,
  COLOR_D,
  COLOR_F,
  COLOR_B,
  COLOR_L,
  COLOR_R,
} from './cubeState';

export interface LSEResult {
  moves: string[];
  moves4a_EO: string[];
  moves4b_UL_UR: string[];
  moves4c_L4E: string[];
  state: SolverCubeState;
  durationMs: number;
}

const LSE_MOVES = ['M', "M'", 'M2', 'U', "U'", 'U2'] as const;
const L4E_MOVES = ['M', "M'", 'M2', 'U2'] as const;

// =========================================================================
// 1. TIỂU BƯỚC 4a: EDGE ORIENTATION (EO) — 128 TRẠNG THÁI CACHED
// =========================================================================

function getEOHash(c: SolverCubeState): number {
  const isUorD = (col: number) => col === COLOR_U || col === COLOR_D;
  let hash = 0;
  if (!isUorD(c[FACELETS.U_F])) hash |= (1 << 0);
  if (!isUorD(c[FACELETS.U_B])) hash |= (1 << 1);
  if (!isUorD(c[FACELETS.U_L])) hash |= (1 << 2);
  if (!isUorD(c[FACELETS.U_R])) hash |= (1 << 3);
  if (!isUorD(c[FACELETS.D_F])) hash |= (1 << 4);
  if (!isUorD(c[FACELETS.D_B])) hash |= (1 << 5);

  let center = 0;
  if (c[FACELETS.U_C] === COLOR_D) center = 1;
  else if (c[FACELETS.U_C] === COLOR_F) center = 2;
  else if (c[FACELETS.U_C] === COLOR_B) center = 3;

  hash |= (center << 6);
  return hash;
}

function invertMove(m: string): string {
  if (m === 'M') return "M'";
  if (m === "M'") return 'M';
  if (m === 'U') return "U'";
  if (m === "U'") return 'U';
  return m;
}

const eoTable = new Map<number, string[]>();

function initEOTable() {
  if (eoTable.size > 0) return;

  const solved = new Uint8Array(54);
  for (let i = 0; i < 9; i++) solved[i] = COLOR_U;
  for (let i = 9; i < 18; i++) solved[i] = COLOR_D;
  for (let i = 18; i < 27; i++) solved[i] = COLOR_F;
  for (let i = 27; i < 36; i++) solved[i] = COLOR_B;
  for (let i = 36; i < 45; i++) solved[i] = COLOR_L;
  for (let i = 45; i < 54; i++) solved[i] = COLOR_R;

  const m2 = applyMove(solved, 'M2');

  eoTable.set(getEOHash(solved), []);
  eoTable.set(getEOHash(m2), []);

  const queue: Array<{ state: SolverCubeState; moves: string[] }> = [
    { state: solved, moves: [] },
    { state: m2, moves: [] },
  ];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const m of LSE_MOVES) {
      const next = applyMove(cur.state, m);
      const h = getEOHash(next);
      if (!eoTable.has(h)) {
        const inv = invertMove(m);
        const sol = [inv, ...cur.moves];
        eoTable.set(h, sol);
        queue.push({ state: next, moves: sol });
      }
    }
  }
}

// Khởi tạo bảng ngay khi module được load
initEOTable();

export function isEO_Solved(c: SolverCubeState): boolean {
  if (!isCMLLSolved(c)) return false;
  const isUorD = (col: number) => col === COLOR_U || col === COLOR_D;
  return (
    isUorD(c[FACELETS.U_F]) &&
    isUorD(c[FACELETS.U_B]) &&
    isUorD(c[FACELETS.U_L]) &&
    isUorD(c[FACELETS.U_R]) &&
    isUorD(c[FACELETS.D_F]) &&
    isUorD(c[FACELETS.D_B]) &&
    (c[FACELETS.U_C] === COLOR_U || c[FACELETS.U_C] === COLOR_D) &&
    (c[FACELETS.F_C] === COLOR_F || c[FACELETS.F_C] === COLOR_B)
  );
}

function solve4a_EO(s: SolverCubeState): { moves: string[]; state: SolverCubeState } | null {
  const h = getEOHash(s);
  const moves = eoTable.get(h);
  if (!moves) return null;

  let next = s;
  for (const m of moves) next = applyMove(next, m);
  return { moves, state: next };
}

// =========================================================================
// 2. TIỂU BƯỚC 4b: UL VÀ UR PLACEMENT
// =========================================================================

export function isUL_UR_Solved(c: SolverCubeState): boolean {
  if (!isCMLLSolved(c)) return false;

  // Hướng cạnh EO phải còn nguyên
  const isUorD = (col: number) => col === COLOR_U || col === COLOR_D;
  if (
    !isUorD(c[FACELETS.U_F]) ||
    !isUorD(c[FACELETS.U_B]) ||
    !isUorD(c[FACELETS.U_L]) ||
    !isUorD(c[FACELETS.U_R]) ||
    !isUorD(c[FACELETS.D_F]) ||
    !isUorD(c[FACELETS.D_B])
  ) return false;

  // Tâm phải đúng hoàn toàn
  if (
    c[FACELETS.U_C] !== COLOR_U ||
    c[FACELETS.D_C] !== COLOR_D ||
    c[FACELETS.F_C] !== COLOR_F ||
    c[FACELETS.B_C] !== COLOR_B
  ) return false;

  // UL đúng
  if (c[FACELETS.U_L] !== COLOR_U || c[FACELETS.L_U] !== COLOR_L) return false;
  // UR đúng
  if (c[FACELETS.U_R] !== COLOR_U || c[FACELETS.R_U] !== COLOR_R) return false;

  return true;
}

function solve4b_UL_UR(startState: SolverCubeState): { moves: string[]; state: SolverCubeState } | null {
  if (isUL_UR_Solved(startState)) return { moves: [], state: startState };

  let queue: Array<{ state: SolverCubeState; moves: string[] }> = [{ state: startState, moves: [] }];

  for (let depth = 1; depth <= 8; depth++) {
    const nextQueue: Array<{ state: SolverCubeState; moves: string[] }> = [];

    for (const item of queue) {
      const lastMove = item.moves[item.moves.length - 1];
      const lastFace = lastMove ? lastMove[0] : '';

      for (const m of LSE_MOVES) {
        if (m[0] === lastFace) continue;

        const nextState = applyMove(item.state, m);
        const nextMoves = [...item.moves, m];

        if (isUL_UR_Solved(nextState)) {
          return { moves: nextMoves, state: nextState };
        }

        if (depth < 8) {
          nextQueue.push({ state: nextState, moves: nextMoves });
        }
      }
    }
    queue = nextQueue;
  }

  return null;
}

// =========================================================================
// 3. TIỂU BƯỚC 4c: M-SLICE PERMUTATION (L4E - 4 CẠNH CUỐI CÙNG)
// =========================================================================

function solve4c_L4E(startState: SolverCubeState): { moves: string[]; state: SolverCubeState } | null {
  if (isCubeSolved(startState)) return { moves: [], state: startState };

  let queue: Array<{ state: SolverCubeState; moves: string[] }> = [{ state: startState, moves: [] }];

  for (let depth = 1; depth <= 9; depth++) {
    const nextQueue: Array<{ state: SolverCubeState; moves: string[] }> = [];

    for (const item of queue) {
      const lastMove = item.moves[item.moves.length - 1];
      const lastFace = lastMove ? lastMove[0] : '';

      for (const m of L4E_MOVES) {
        if (m[0] === lastFace) continue;

        const nextState = applyMove(item.state, m);
        const nextMoves = [...item.moves, m];

        if (isCubeSolved(nextState)) {
          return { moves: nextMoves, state: nextState };
        }

        if (depth < 9) {
          nextQueue.push({ state: nextState, moves: nextMoves });
        }
      }
    }
    queue = nextQueue;
  }

  return null;
}

// =========================================================================
// BỘ ĐIỀU PHỐI CHÍNH LSE (LAST SIX EDGES COORDINATOR)
// =========================================================================

/**
 * Giải quyết trọn vẹn 6 cạnh cuối cùng (LSE) trong phương pháp Roux:
 * - 4a: Edge Orientation (EO)
 * - 4b: Giải 2 cạnh bên UL và UR
 * - 4c: Hoán vị 4 cạnh còn lại của tầng M (L4E)
 * 
 * Kết quả: Toàn bộ khối Rubik được giải hoàn tất 100%!
 */
export function solveLSE(state: SolverCubeState): LSEResult | null {
  const t0 = performance.now();

  if (!isCMLLSolved(state)) {
    return null;
  }

  // 1. Bước 4a: EO
  const eoRes = solve4a_EO(state);
  if (!eoRes) return null;

  // 2. Bước 4b: UL và UR
  const ulurRes = solve4b_UL_UR(eoRes.state);
  if (!ulurRes) return null;

  // 3. Bước 4c: L4E
  const l4eRes = solve4c_L4E(ulurRes.state);
  if (!l4eRes || !isCubeSolved(l4eRes.state)) return null;

  const totalMoves = [...eoRes.moves, ...ulurRes.moves, ...l4eRes.moves];
  const durationMs = Number((performance.now() - t0).toFixed(2));

  return {
    moves: totalMoves,
    moves4a_EO: eoRes.moves,
    moves4b_UL_UR: ulurRes.moves,
    moves4c_L4E: l4eRes.moves,
    state: l4eRes.state,
    durationMs,
  };
}
