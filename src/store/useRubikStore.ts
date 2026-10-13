import { create } from 'zustand';
import * as THREE from 'three';
import { invalidate } from '@react-three/fiber';
import type { CubieState, Move, ActiveCaseStudy } from '../types';
import { createInitialCubies } from '../engine/cubeModel';
import { parseAlgorithm, getMoveExecutionInfo } from '../engine/moveParser';
import { generateScramble } from '../engine/scrambler';
import { soundEngine } from '../engine/soundEngine';
import { lofiEngine } from '../engine/lofiEngine';
import {
  cubiesToSolverState,
  solverStateToCubies,
  validateCubeState,
  isFirstBlockSolved,
  isSecondBlockSolved,
  isCMLLSolved,
  type SolverCubeState,
} from '../engine/solver/cubeState';
import { solveFirstBlock } from '../engine/solver/firstBlock';
import { solveSecondBlock } from '../engine/solver/secondBlock';
import { solveCMLL } from '../engine/solver/cmllSolver';
import { solveCompleteRoux, type FullRouxSolution } from '../engine/solver/rouxSolver';
import {
  createTutorPhases,
  createTutorChunks,
  invertMove,
  type TutorPhase,
  type TutorChunk,
} from '../engine/tutorHelper';

export interface SolveResult {
  fbMoves: string[];
  sbMoves: string[];
  cmllMoves: string[];
  cmllCaseName?: string;
  durationMs: number;
  isAlreadySolved: boolean;
  isFailed?: boolean;
  errorMessage?: string;
}

export type { ActiveCaseStudy };

interface RubikStore {
  cubies: CubieState[];
  isAnimating: boolean;
  moveQueue: Move[];
  currentMove: Move | null;
  moveHistory: string[];
  turnDuration: number; // ms cho 1 move
  isMuted: boolean;

  // Tutor Mode State
  isTutorActive: boolean;
  tutorPhases: TutorPhase[];
  tutorChunks: TutorChunk[];
  tutorAllMoves: string[];
  tutorCurrentIndex: number;

  // Case Study State (Học thế cờ tương tác trực tiếp trên 3D)
  activeCaseStudy: ActiveCaseStudy | null;
  caseStudyGroup: ActiveCaseStudy[];
  caseStudyIndex: number;
  caseCurrentMoveIndex: number;

  // Focus Mode State (Làm nổi bật các viên của phase đang giải)
  isFocusMode: boolean;

  // Lo-fi Ambient BGM State
  isLofiPlaying: boolean;
  lofiVolume: number;

  // Actions
  enqueueMove: (moveOrRaw: Move | string, customDuration?: number) => void;
  enqueueAlgorithm: (alg: string, customDuration?: number) => void;
  startNextMove: () => Move | null;
  completeCurrentMove: () => void;
  scramble: () => void;
  reset: () => void;
  setTurnDuration: (duration: number) => void;
  toggleMute: () => void;
  toggleFocusMode: () => void;
  toggleLofi: () => void;
  setLofiVolume: (vol: number) => void;
  solveFirstTwoBlocks: () => SolveResult | null;
  solveFullCube: () => FullRouxSolution | null;

  // Case Study Actions
  startCaseStudy: (caseItem: ActiveCaseStudy, group?: ActiveCaseStudy[]) => void;
  closeCaseStudy: () => void;
  resetCaseStudyState: () => void;
  playCaseStudyDemo: () => void;
  stepCaseForward: () => void;
  stepCaseBackward: () => void;
  nextCaseStudy: () => void;
  prevCaseStudy: () => void;

  // Tutor Mode Actions
  startTutorMode: () => { success: boolean; message?: string };
  applyCustomCubeState: (solverState: SolverCubeState) => {
    success: boolean;
    message?: string;
    phaseId?: string;
  };
  tutorNextStep: () => void;
  tutorPrevStep: () => void;
  tutorPlayCurrentPhase: () => void;
  tutorPlayChunk: (chunkId: string) => void;
  exitTutorMode: () => void;
}

/**
 * Cập nhật tọa độ và quaternion của các cubie sau khi xoay 1 move
 */
function rotateCubies(cubies: CubieState[], move: Move): CubieState[] {
  const { axis, angle, filter } = getMoveExecutionInfo(move);

  // Tạo delta quaternion xoay quanh trục tương ứng
  const deltaQuat = new THREE.Quaternion().setFromAxisAngle(axis, angle);

  return cubies.map((cubie) => {
    // Chỉ cập nhật các viên thỏa mãn bộ lọc tầng (filter)
    if (!filter(cubie.currentPos)) {
      return cubie;
    }

    // 1. Tính toán vị trí mới
    const posVec = new THREE.Vector3(...cubie.currentPos);
    posVec.applyQuaternion(deltaQuat);
    const newPos: [number, number, number] = [
      Math.round(posVec.x),
      Math.round(posVec.y),
      Math.round(posVec.z),
    ];

    // 2. Tính toán quaternion hướng mới: Q_new = DeltaQ * Q_old
    const currentQuat = new THREE.Quaternion(...cubie.quaternion);
    const newQuat = new THREE.Quaternion().multiplyQuaternions(deltaQuat, currentQuat);
    newQuat.normalize();

    return {
      ...cubie,
      currentPos: newPos,
      quaternion: [newQuat.x, newQuat.y, newQuat.z, newQuat.w],
    };
  });
}

/**
 * Áp dụng tức thời một chuỗi công thức lên các cubie mà không qua hàng đợi animation
 */
function applyAlgorithmToCubies(cubies: CubieState[], alg: string): CubieState[] {
  let state = cubies;
  const moves = parseAlgorithm(alg);
  for (const m of moves) {
    state = rotateCubies(state, m);
  }
  return state;
}

export const useRubikStore = create<RubikStore>((set, get) => ({
  cubies: createInitialCubies(),
  isAnimating: false,
  moveQueue: [],
  currentMove: null,
  moveHistory: [],
  turnDuration: 220, // 220ms xoay nhanh mượt
  isMuted: soundEngine.getMuted(),

  // Tutor Mode State
  isTutorActive: false,
  tutorPhases: [],
  tutorChunks: [],
  tutorAllMoves: [],
  tutorCurrentIndex: 0,

  // Case Study State (Học thế cờ tương tác trực tiếp trên 3D)
  activeCaseStudy: null,
  caseStudyGroup: [],
  caseStudyIndex: 0,
  caseCurrentMoveIndex: 0,

  // Focus Mode State
  isFocusMode: true,

  toggleMute: () => {
    const muted = soundEngine.toggleMute();
    set({ isMuted: muted });
  },

  toggleFocusMode: () => {
    set((state) => ({ isFocusMode: !state.isFocusMode }));
    invalidate();
  },

  // Lo-fi Ambient BGM State
  isLofiPlaying: lofiEngine.getIsPlaying(),
  lofiVolume: lofiEngine.getVolume(),

  toggleLofi: () => {
    const playing = lofiEngine.toggle();
    set({ isLofiPlaying: playing });
  },

  setLofiVolume: (vol: number) => {
    lofiEngine.setVolume(vol);
    set({ lofiVolume: vol });
  },

  enqueueMove: (moveOrRaw, customDuration) => {
    let move: Move | null = null;
    if (typeof moveOrRaw === 'string') {
      const parsed = parseAlgorithm(moveOrRaw, customDuration)[0];
      move = parsed || null;
    } else {
      move = customDuration ? { ...moveOrRaw, duration: customDuration } : moveOrRaw;
    }

    if (!move) return;

    set((state) => ({
      moveQueue: [...state.moveQueue, move],
    }));
    invalidate();
  },

  enqueueAlgorithm: (alg, customDuration) => {
    const moves = parseAlgorithm(alg, customDuration);
    if (!moves.length) return;

    set((state) => ({
      moveQueue: [...state.moveQueue, ...moves],
    }));
    invalidate();
  },

  startNextMove: () => {
    const { moveQueue, isAnimating } = get();
    if (isAnimating || moveQueue.length === 0) return null;

    const [nextMove, ...remainingQueue] = moveQueue;
    set({
      currentMove: nextMove,
      moveQueue: remainingQueue,
      isAnimating: true,
    });

    return nextMove;
  },

  completeCurrentMove: () => {
    const { currentMove, cubies, moveHistory, activeCaseStudy, caseCurrentMoveIndex } = get();
    if (!currentMove) return;

    const updatedCubies = rotateCubies(cubies, currentMove);

    let nextCaseMoveIndex = caseCurrentMoveIndex;
    if (activeCaseStudy) {
      const totalMoves = parseAlgorithm(activeCaseStudy.alg).length;
      if (currentMove.isBackward) {
        nextCaseMoveIndex = Math.max(0, caseCurrentMoveIndex - 1);
      } else {
        nextCaseMoveIndex = Math.min(totalMoves, caseCurrentMoveIndex + 1);
      }
    }

    set({
      cubies: updatedCubies,
      currentMove: null,
      isAnimating: false,
      moveHistory: [...moveHistory, currentMove.raw],
      caseCurrentMoveIndex: nextCaseMoveIndex,
    });

    // Phát âm thanh click cơ học giòn tan khi hoàn thành 1 move
    soundEngine.playTurnSnap();
  },

  scramble: () => {
    const { moves } = generateScramble(20);
    set((state) => ({
      moveQueue: [...state.moveQueue, ...moves],
      isTutorActive: false,
      tutorPhases: [],
      tutorAllMoves: [],
      tutorCurrentIndex: 0,
    }));
    invalidate();
  },

  reset: () => {
    soundEngine.playResetSound();
    set({
      cubies: createInitialCubies(),
      isAnimating: false,
      moveQueue: [],
      currentMove: null,
      moveHistory: [],
      isTutorActive: false,
      tutorPhases: [],
      tutorAllMoves: [],
      tutorCurrentIndex: 0,
    });
    invalidate();
  },

  setTurnDuration: (duration) => set({ turnDuration: duration }),
  solveFirstTwoBlocks: () => {
    const { cubies, isAnimating, moveQueue } = get();
    if (isAnimating || moveQueue.length > 0) return null;

    const t0 = performance.now();
    const solverState = cubiesToSolverState(cubies);

    const isFBAlready = isFirstBlockSolved(solverState);
    const isSBAlready = isSecondBlockSolved(solverState);
    const isCMLLAlready = isCMLLSolved(solverState);

    if (isFBAlready && isSBAlready && isCMLLAlready) {
      return {
        fbMoves: [],
        sbMoves: [],
        cmllMoves: [],
        durationMs: performance.now() - t0,
        isAlreadySolved: true,
      };
    }

    const fbRes = isFBAlready
      ? { moves: [] as string[], state: solverState }
      : solveFirstBlock(solverState);

    const isFBSuccessful = isFirstBlockSolved(fbRes.state);
    if (!isFBSuccessful) {
      return {
        fbMoves: [],
        sbMoves: [],
        cmllMoves: [],
        durationMs: performance.now() - t0,
        isAlreadySolved: false,
        isFailed: true,
        errorMessage: 'Chưa tìm ra lời giải cho First Block trong độ sâu cho phép.',
      };
    }

    const sbRes = isSBAlready
      ? { moves: [] as string[], state: fbRes.state }
      : solveSecondBlock(fbRes.state);

    const isSBSuccessful = isSecondBlockSolved(sbRes.state);
    if (!isSBSuccessful) {
      return {
        fbMoves: fbRes.moves,
        sbMoves: [],
        cmllMoves: [],
        durationMs: performance.now() - t0,
        isAlreadySolved: false,
        isFailed: true,
        errorMessage: 'Chưa tìm ra lời giải hoàn chỉnh cho Second Block.',
      };
    }

    // Phase 3: CMLL
    const cmllRes = isCMLLAlready
      ? { moves: [] as string[], caseName: 'Skip (Đã giải sẵn)', state: sbRes.state }
      : solveCMLL(sbRes.state);

    if (!cmllRes || !isCMLLSolved(cmllRes.state)) {
      return {
        fbMoves: fbRes.moves,
        sbMoves: sbRes.moves,
        cmllMoves: [],
        durationMs: performance.now() - t0,
        isAlreadySolved: false,
        isFailed: true,
        errorMessage: 'Chưa tìm ra thuật toán CMLL khớp cho 4 góc.',
      };
    }

    const durationMs = performance.now() - t0;
    const allMovesStr = [...fbRes.moves, ...sbRes.moves, ...cmllRes.moves].join(' ');

    if (allMovesStr) {
      get().enqueueAlgorithm(allMovesStr);
    }

    return {
      fbMoves: fbRes.moves,
      sbMoves: sbRes.moves,
      cmllMoves: cmllRes.moves,
      cmllCaseName: cmllRes.caseName,
      durationMs,
      isAlreadySolved: false,
    };
  },

  solveFullCube: () => {
    const { cubies, isAnimating, moveQueue } = get();
    if (isAnimating || moveQueue.length > 0) return null;

    const solverState = cubiesToSolverState(cubies);
    const solution = solveCompleteRoux(solverState);

    if (solution.isSuccess && solution.allMoves.length > 0) {
      // Tốc độ giải tự động mặc định chậm rãi (380ms) để người dùng kịp quan sát
      get().enqueueAlgorithm(solution.allMoves.join(' '), 380);
    }

    return solution;
  },

  startTutorMode: () => {
    const { cubies, isAnimating, moveQueue } = get();
    if (isAnimating || moveQueue.length > 0) {
      return { success: false, message: 'Khối đang xoay, vui lòng chờ một chút...' };
    }

    const solverState = cubiesToSolverState(cubies);
    const solution = solveCompleteRoux(solverState);

    if (!solution.isSuccess) {
      return {
        success: false,
        message: solution.errorMessage || 'Chưa tìm ra thuật toán giải cho trạng thái này.',
      };
    }

    if (solution.allMoves.length === 0) {
      return {
        success: false,
        message: 'Khối Rubik đã được giải hoàn tất 100% rồi!',
      };
    }

    const phases = createTutorPhases(solution);
    const chunks = createTutorChunks(solution, solverState);
    set({
      isTutorActive: true,
      tutorPhases: phases,
      tutorChunks: chunks,
      tutorAllMoves: solution.allMoves,
      tutorCurrentIndex: 0,
    });

    return { success: true };
  },

  applyCustomCubeState: (solverState) => {
    const { isAnimating, moveQueue } = get();
    if (isAnimating || moveQueue.length > 0) {
      return { success: false, message: 'Khối đang xoay, vui lòng chờ một chút trước khi nạp trạng thái.' };
    }

    const validation = validateCubeState(solverState);
    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    const solution = solveCompleteRoux(solverState);
    if (!solution.isSuccess) {
      return {
        success: false,
        message: solution.errorMessage || 'Không tìm thấy đường giải Roux cho trạng thái này. Vui lòng kiểm tra lại màu các ô.',
      };
    }

    const newCubies = solverStateToCubies(solverState);
    soundEngine.playResetSound();

    if (solution.allMoves.length === 0) {
      set({
        cubies: newCubies,
        isAnimating: false,
        moveQueue: [],
        currentMove: null,
        moveHistory: [],
        isTutorActive: false,
        tutorPhases: [],
        tutorChunks: [],
        tutorAllMoves: [],
        tutorCurrentIndex: 0,
      });
      invalidate();
      return { success: true, message: 'Khối Rubik đã được giải hoàn tất 100% rồi!' };
    }

    const phases = createTutorPhases(solution);
    const chunks = createTutorChunks(solution, solverState);
    set({
      cubies: newCubies,
      isAnimating: false,
      moveQueue: [],
      currentMove: null,
      moveHistory: [],
      isTutorActive: true,
      tutorPhases: phases,
      tutorChunks: chunks,
      tutorAllMoves: solution.allMoves,
      tutorCurrentIndex: 0,
    });
    invalidate();

    const firstPhase = phases[0];
    return {
      success: true,
      message: `Đã nạp thành công! Bắt đầu hướng dẫn từ ${firstPhase ? firstPhase.title : 'bước tiếp theo'}.`,
      phaseId: firstPhase?.id,
    };
  },

  tutorNextStep: () => {
    const { isTutorActive, isAnimating, moveQueue, tutorAllMoves, tutorCurrentIndex } = get();
    if (!isTutorActive || isAnimating || moveQueue.length > 0) return;
    if (tutorCurrentIndex >= tutorAllMoves.length) return;

    const nextMove = tutorAllMoves[tutorCurrentIndex];
    set({ tutorCurrentIndex: tutorCurrentIndex + 1 });
    // Tốc độ xoay từng bước trong tutor: 350ms (đầm tay, rõ ràng)
    get().enqueueMove(nextMove, 350);
  },

  tutorPrevStep: () => {
    const { isTutorActive, isAnimating, moveQueue, tutorAllMoves, tutorCurrentIndex } = get();
    if (!isTutorActive || isAnimating || moveQueue.length > 0) return;
    if (tutorCurrentIndex <= 0) return;

    const lastMove = tutorAllMoves[tutorCurrentIndex - 1];
    const revMove = invertMove(lastMove);
    set({ tutorCurrentIndex: tutorCurrentIndex - 1 });
    get().enqueueMove(revMove, 250);
  },

  tutorPlayCurrentPhase: () => {
    const { isTutorActive, isAnimating, moveQueue, tutorPhases, tutorAllMoves, tutorCurrentIndex } = get();
    if (!isTutorActive || isAnimating || moveQueue.length > 0) return;
    if (tutorCurrentIndex >= tutorAllMoves.length) return;

    const currentPhase = tutorPhases.find(
      (p) => tutorCurrentIndex >= p.startIndex && tutorCurrentIndex < p.endIndex
    );
    if (!currentPhase) return;

    const remaining = tutorAllMoves.slice(tutorCurrentIndex, currentPhase.endIndex);
    if (remaining.length === 0) return;

    set({ tutorCurrentIndex: currentPhase.endIndex });
    get().enqueueAlgorithm(remaining.join(' '), 380);
  },

  tutorPlayChunk: (chunkId: string) => {
    const { isTutorActive, isAnimating, moveQueue, tutorChunks, tutorAllMoves, tutorCurrentIndex } = get();
    if (!isTutorActive || isAnimating || moveQueue.length > 0) return;
    if (tutorCurrentIndex >= tutorAllMoves.length) return;

    const chunk = tutorChunks.find((c) => c.id === chunkId);
    if (!chunk) return;

    const start = Math.max(tutorCurrentIndex, chunk.startIndex);
    if (start >= chunk.endIndex) return;

    const remaining = tutorAllMoves.slice(start, chunk.endIndex);
    if (remaining.length === 0) return;

    set({ tutorCurrentIndex: chunk.endIndex });
    get().enqueueAlgorithm(remaining.join(' '), 380);
  },

  exitTutorMode: () => {
    set({
      isTutorActive: false,
      tutorPhases: [],
      tutorChunks: [],
      tutorAllMoves: [],
      tutorCurrentIndex: 0,
    });
  },

  // ── Case Study Actions ──
  startCaseStudy: (caseItem, group) => {
    const list = group && group.length > 0 ? group : [caseItem];
    const idx = list.findIndex((c) => c.id === caseItem.id);
    const validIdx = idx >= 0 ? idx : 0;

    // Thiết lập trạng thái khối Rubik tức thời theo toán học, xoá bỏ hoàn toàn animation 90ms và timer
    const initial = createInitialCubies();
    const setupCubies = applyAlgorithmToCubies(initial, caseItem.setupAlg);

    set({
      isTutorActive: false,
      activeCaseStudy: caseItem,
      caseStudyGroup: list,
      caseStudyIndex: validIdx,
      caseCurrentMoveIndex: 0,
      cubies: setupCubies,
      moveQueue: [],
      currentMove: null,
      isAnimating: false,
      moveHistory: [],
    });
    invalidate();
  },

  closeCaseStudy: () => {
    set({
      activeCaseStudy: null,
      caseStudyGroup: [],
      caseStudyIndex: 0,
      caseCurrentMoveIndex: 0,
    });
    invalidate();
  },

  resetCaseStudyState: () => {
    const { activeCaseStudy } = get();
    if (!activeCaseStudy) return;

    // Đặt lại tức thời về thế cờ ban đầu của case study
    const initial = createInitialCubies();
    const setupCubies = applyAlgorithmToCubies(initial, activeCaseStudy.setupAlg);

    set({
      cubies: setupCubies,
      moveQueue: [],
      currentMove: null,
      isAnimating: false,
      caseCurrentMoveIndex: 0,
    });
    invalidate();
  },

  playCaseStudyDemo: () => {
    const { activeCaseStudy, isAnimating, moveQueue, caseCurrentMoveIndex } = get();
    if (!activeCaseStudy || isAnimating || moveQueue.length > 0) return;

    const moves = parseAlgorithm(activeCaseStudy.alg, 380);
    if (!moves.length) return;

    if (caseCurrentMoveIndex >= moves.length) {
      // Đã giải xong: reset tức thời về thế cờ ban đầu rồi chạy demo giải
      const initial = createInitialCubies();
      const setupCubies = applyAlgorithmToCubies(initial, activeCaseStudy.setupAlg);
      set({
        cubies: setupCubies,
        moveQueue: [],
        currentMove: null,
        isAnimating: false,
        caseCurrentMoveIndex: 0,
      });
      invalidate();
      get().enqueueAlgorithm(activeCaseStudy.alg, 380);
    } else {
      // Chưa giải xong: chạy tiếp các nước đi còn lại
      const remainingMoves = moves.slice(caseCurrentMoveIndex);
      const remainingAlg = remainingMoves.map((m) => m.raw).join(' ');
      get().enqueueAlgorithm(remainingAlg, 380);
    }
  },

  stepCaseForward: () => {
    const { activeCaseStudy, isAnimating, moveQueue, caseCurrentMoveIndex } = get();
    if (!activeCaseStudy || isAnimating || moveQueue.length > 0) return;

    const moves = parseAlgorithm(activeCaseStudy.alg, 350);
    if (caseCurrentMoveIndex < moves.length) {
      const nextMove = moves[caseCurrentMoveIndex];
      get().enqueueMove(nextMove.raw, 350);
    }
  },

  stepCaseBackward: () => {
    const { activeCaseStudy, isAnimating, moveQueue, caseCurrentMoveIndex } = get();
    if (!activeCaseStudy || isAnimating || moveQueue.length > 0) return;

    const moves = parseAlgorithm(activeCaseStudy.alg, 300);
    if (caseCurrentMoveIndex > 0) {
      const prevMove = moves[caseCurrentMoveIndex - 1];
      const invRaw = invertMove(prevMove.raw);
      const parsedInv = parseAlgorithm(invRaw, 300)[0];
      if (parsedInv) {
        parsedInv.isBackward = true;
        set((state) => ({ moveQueue: [...state.moveQueue, parsedInv] }));
        invalidate();
      }
    }
  },

  nextCaseStudy: () => {
    const { caseStudyGroup, caseStudyIndex, isAnimating, moveQueue } = get();
    if (caseStudyGroup.length <= 1 || isAnimating || moveQueue.length > 0) return;

    const nextIdx = (caseStudyIndex + 1) % caseStudyGroup.length;
    const nextCase = caseStudyGroup[nextIdx];
    get().startCaseStudy(nextCase, caseStudyGroup);
  },

  prevCaseStudy: () => {
    const { caseStudyGroup, caseStudyIndex, isAnimating, moveQueue } = get();
    if (caseStudyGroup.length <= 1 || isAnimating || moveQueue.length > 0) return;

    const prevIdx = (caseStudyIndex - 1 + caseStudyGroup.length) % caseStudyGroup.length;
    const prevCase = caseStudyGroup[prevIdx];
    get().startCaseStudy(prevCase, caseStudyGroup);
  },
}));

