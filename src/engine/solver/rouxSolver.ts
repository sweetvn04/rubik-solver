import {
  isFirstBlockSolved,
  isSecondBlockSolved,
  isCMLLSolved,
  isCubeSolved,
  type SolverCubeState,
} from './cubeState';
import { solveFirstBlock } from './firstBlock';
import { solveSecondBlock } from './secondBlock';
import { solveCMLL } from './cmllSolver';
import { solveLSE } from './lseSolver';

export interface FullRouxSolution {
  isSuccess: boolean;
  fbMoves: string[];
  sbMoves: string[];
  cmllMoves: string[];
  cmllCaseName?: string;
  lseMoves: string[];
  moves4a_EO: string[];
  moves4b_UL_UR: string[];
  moves4c_L4E: string[];
  allMoves: string[];
  totalMovesCount: number;
  durationMs: number;
  finalState: SolverCubeState;
  errorMessage?: string;
}

/**
 * Master Roux Solver Coordinator
 * Tự động xâu chuỗi hoàn chỉnh 4 giai đoạn chuẩn của phương pháp Roux:
 *   Phase 1: First Block (FB) — Khối 1x2x3 bên trái
 *   Phase 2: Second Block (SB) — Khối 1x2x3 bên phải
 *   Phase 3: CMLL — Định hướng & hoán vị 4 góc tầng trên
 *   Phase 4: LSE (Last Six Edges) — 4a EO -> 4b UL/UR -> 4c L4E
 * 
 * Đảm bảo tính bất biến toàn vẹn và giải quyết 100% khối Rubik.
 */
export function solveCompleteRoux(initialState: SolverCubeState): FullRouxSolution {
  const t0 = performance.now();

  // Đã giải sẵn 100%
  if (isCubeSolved(initialState)) {
    return {
      isSuccess: true,
      fbMoves: [],
      sbMoves: [],
      cmllMoves: [],
      lseMoves: [],
      moves4a_EO: [],
      moves4b_UL_UR: [],
      moves4c_L4E: [],
      allMoves: [],
      totalMovesCount: 0,
      durationMs: Number((performance.now() - t0).toFixed(2)),
      finalState: initialState.slice(),
    };
  }

  // Phase 1: First Block
  const isFBAlready = isFirstBlockSolved(initialState);
  const fbRes = isFBAlready
    ? { moves: [] as string[], state: initialState }
    : solveFirstBlock(initialState);

  if (!fbRes || !isFirstBlockSolved(fbRes.state)) {
    return {
      isSuccess: false,
      fbMoves: [],
      sbMoves: [],
      cmllMoves: [],
      lseMoves: [],
      moves4a_EO: [],
      moves4b_UL_UR: [],
      moves4c_L4E: [],
      allMoves: [],
      totalMovesCount: 0,
      durationMs: Number((performance.now() - t0).toFixed(2)),
      finalState: initialState.slice(),
      errorMessage: 'Không tìm thấy đường giải cho First Block.',
    };
  }

  // Phase 2: Second Block
  const isSBAlready = isSecondBlockSolved(fbRes.state);
  const sbRes = isSBAlready
    ? { moves: [] as string[], state: fbRes.state }
    : solveSecondBlock(fbRes.state);

  if (!sbRes || !isSecondBlockSolved(sbRes.state)) {
    return {
      isSuccess: false,
      fbMoves: fbRes.moves,
      sbMoves: [],
      cmllMoves: [],
      lseMoves: [],
      moves4a_EO: [],
      moves4b_UL_UR: [],
      moves4c_L4E: [],
      allMoves: [],
      totalMovesCount: 0,
      durationMs: Number((performance.now() - t0).toFixed(2)),
      finalState: fbRes.state,
      errorMessage: 'Không tìm thấy đường giải cho Second Block.',
    };
  }

  // Phase 3: CMLL
  const isCMLLAlready = isCMLLSolved(sbRes.state);
  const cmllRes = isCMLLAlready
    ? { moves: [] as string[], caseName: 'Skip (Đã giải sẵn)', state: sbRes.state }
    : solveCMLL(sbRes.state);

  if (!cmllRes || !isCMLLSolved(cmllRes.state)) {
    return {
      isSuccess: false,
      fbMoves: fbRes.moves,
      sbMoves: sbRes.moves,
      cmllMoves: [],
      lseMoves: [],
      moves4a_EO: [],
      moves4b_UL_UR: [],
      moves4c_L4E: [],
      allMoves: [],
      totalMovesCount: 0,
      durationMs: Number((performance.now() - t0).toFixed(2)),
      finalState: sbRes.state,
      errorMessage: 'Không tìm thấy thuật toán CMLL khớp cho 4 góc.',
    };
  }

  // Phase 4: LSE (Last Six Edges)
  const isLSEAlready = isCubeSolved(cmllRes.state);
  const lseRes = isLSEAlready
    ? {
        moves: [] as string[],
        moves4a_EO: [] as string[],
        moves4b_UL_UR: [] as string[],
        moves4c_L4E: [] as string[],
        state: cmllRes.state,
        durationMs: 0,
      }
    : solveLSE(cmllRes.state);

  if (!lseRes || !isCubeSolved(lseRes.state)) {
    return {
      isSuccess: false,
      fbMoves: fbRes.moves,
      sbMoves: sbRes.moves,
      cmllMoves: cmllRes.moves,
      cmllCaseName: cmllRes.caseName,
      lseMoves: [],
      moves4a_EO: [],
      moves4b_UL_UR: [],
      moves4c_L4E: [],
      allMoves: [],
      totalMovesCount: 0,
      durationMs: Number((performance.now() - t0).toFixed(2)),
      finalState: cmllRes.state,
      errorMessage: 'Không thể giải 6 cạnh cuối (LSE).',
    };
  }

  const allMoves = [...fbRes.moves, ...sbRes.moves, ...cmllRes.moves, ...lseRes.moves];
  const durationMs = Number((performance.now() - t0).toFixed(2));

  return {
    isSuccess: true,
    fbMoves: fbRes.moves,
    sbMoves: sbRes.moves,
    cmllMoves: cmllRes.moves,
    cmllCaseName: cmllRes.caseName,
    lseMoves: lseRes.moves,
    moves4a_EO: lseRes.moves4a_EO,
    moves4b_UL_UR: lseRes.moves4b_UL_UR,
    moves4c_L4E: lseRes.moves4c_L4E,
    allMoves,
    totalMovesCount: allMoves.length,
    durationMs,
    finalState: lseRes.state,
  };
}
