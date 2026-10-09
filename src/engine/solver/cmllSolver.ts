import {
  applyMove,
  isCMLLSolved,
  isSecondBlockSolved,
  type SolverCubeState,
} from './cubeState';
import { CMLL_ALGORITHMS, type CMLLCase } from './cmllData';
import { parseAlgorithm } from '../moveParser';

export interface CMLLResult {
  moves: string[];
  caseName: string;
  group: string;
  auf1: string;
  alg: string;
  auf2: string;
  state: SolverCubeState;
  timeMs: number;
}

const AUFS = ['', 'U', "U'", 'U2'] as const;

// Cache sẵn danh sách Move string cho từng thuật toán để tăng tốc tối đa
interface CachedCMLLCase extends CMLLCase {
  parsedMoves: string[];
}

const CACHED_CMLL_ALGS: CachedCMLLCase[] = CMLL_ALGORITHMS.map((c) => ({
  ...c,
  parsedMoves: parseAlgorithm(c.alg).map((m) => m.raw),
}));

/**
 * Thuật toán giải CMLL (Corners of the Last Layer) - Phase 3 của phương pháp Roux
 * 
 * - Đầu vào: Trạng thái khối Rubik đã giải xong FB và SB (isSecondBlockSolved === true).
 * - Đầu ra: Chuỗi bước xoay giải quyết hoàn toàn 4 góc tầng trên (Orientation + Permutation)
 *          mà 100% không làm suy suyển First Block và Second Block.
 * - Hiệu năng: < 1ms thông qua AUF setup và tra cứu bảng thuật toán tối ưu.
 */
export function solveCMLL(state: SolverCubeState): CMLLResult | null {
  const t0 = performance.now();

  // Kiểm tra điều kiện tiên quyết: FB và SB phải hoàn tất
  if (!isSecondBlockSolved(state)) {
    return null;
  }

  // Nếu 4 góc đã giải hoàn chỉnh (CMLL Skip)
  if (isCMLLSolved(state)) {
    return {
      moves: [],
      caseName: 'Skip (Đã giải xong 4 góc)',
      group: 'O',
      auf1: '',
      alg: '',
      auf2: '',
      state: state.slice(),
      timeMs: Number((performance.now() - t0).toFixed(2)),
    };
  }

  // 1. Thử xoay AUF đầu (Adjust Upper Face trước khi thực hiện công thức)
  for (const auf1 of AUFS) {
    let s1 = state;
    if (auf1) {
      s1 = applyMove(s1, auf1);
    }

    // 2. Tra cứu từng thuật toán CMLL chuẩn Roux
    for (const item of CACHED_CMLL_ALGS) {
      let s2 = s1;
      for (let i = 0; i < item.parsedMoves.length; i++) {
        s2 = applyMove(s2, item.parsedMoves[i]);
      }

      // 3. Thử xoay AUF cuối (Adjust Upper Face sau khi thực hiện công thức)
      for (const auf2 of AUFS) {
        let s3 = s2;
        if (auf2) {
          s3 = applyMove(s3, auf2);
        }

        // Kiểm tra xem 4 góc đã khớp hoàn toàn với các tâm chưa
        if (isCMLLSolved(s3)) {
          const solutionMoves: string[] = [];
          if (auf1) solutionMoves.push(auf1);
          solutionMoves.push(...item.parsedMoves);
          if (auf2) solutionMoves.push(auf2);

          const timeMs = Number((performance.now() - t0).toFixed(2));

          return {
            moves: solutionMoves,
            caseName: item.name,
            group: item.group,
            auf1,
            alg: item.alg,
            auf2,
            state: s3,
            timeMs,
          };
        }
      }
    }
  }

  return null;
}
