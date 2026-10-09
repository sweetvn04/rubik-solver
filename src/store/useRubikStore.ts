import { create } from 'zustand';
import * as THREE from 'three';
import { invalidate } from '@react-three/fiber';
import type { CubieState, Move } from '../types';
import { createInitialCubies } from '../engine/cubeModel';
import { parseAlgorithm, getMoveExecutionInfo } from '../engine/moveParser';
import { generateScramble } from '../engine/scrambler';
import { soundEngine } from '../engine/soundEngine';
import { cubiesToSolverState, isFirstBlockSolved, isSecondBlockSolved } from '../engine/solver/cubeState';
import { solveFirstBlock } from '../engine/solver/firstBlock';
import { solveSecondBlock } from '../engine/solver/secondBlock';

export interface SolveResult {
  fbMoves: string[];
  sbMoves: string[];
  durationMs: number;
  isAlreadySolved: boolean;
  isFailed?: boolean;
  errorMessage?: string;
}

interface RubikStore {
  cubies: CubieState[];
  isAnimating: boolean;
  moveQueue: Move[];
  currentMove: Move | null;
  moveHistory: string[];
  turnDuration: number; // ms cho 1 move
  isMuted: boolean;

  // Actions
  enqueueMove: (moveOrRaw: Move | string) => void;
  enqueueAlgorithm: (alg: string) => void;
  startNextMove: () => Move | null;
  completeCurrentMove: () => void;
  scramble: () => void;
  reset: () => void;
  setTurnDuration: (duration: number) => void;
  toggleMute: () => void;
  solveFirstTwoBlocks: () => SolveResult | null;
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

export const useRubikStore = create<RubikStore>((set, get) => ({
  cubies: createInitialCubies(),
  isAnimating: false,
  moveQueue: [],
  currentMove: null,
  moveHistory: [],
  turnDuration: 220, // 220ms xoay nhanh mượt
  isMuted: soundEngine.getMuted(),

  toggleMute: () => {
    const muted = soundEngine.toggleMute();
    set({ isMuted: muted });
  },

  enqueueMove: (moveOrRaw) => {
    const move =
      typeof moveOrRaw === 'string'
        ? parseAlgorithm(moveOrRaw)[0]
        : moveOrRaw;

    if (!move) return;

    set((state) => ({
      moveQueue: [...state.moveQueue, move],
    }));
    invalidate();
  },

  enqueueAlgorithm: (alg) => {
    const moves = parseAlgorithm(alg);
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
    const { currentMove, cubies, moveHistory } = get();
    if (!currentMove) return;

    const updatedCubies = rotateCubies(cubies, currentMove);

    set({
      cubies: updatedCubies,
      currentMove: null,
      isAnimating: false,
      moveHistory: [...moveHistory, currentMove.raw],
    });

    // Phát âm thanh click cơ học giòn tan khi hoàn thành 1 move
    soundEngine.playTurnSnap();
  },

  scramble: () => {
    const { moves } = generateScramble(20);
    set((state) => ({
      moveQueue: [...state.moveQueue, ...moves],
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

    if (isFBAlready && isSBAlready) {
      return {
        fbMoves: [],
        sbMoves: [],
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
        durationMs: performance.now() - t0,
        isAlreadySolved: false,
        isFailed: true,
        errorMessage: 'Chưa tìm ra lời giải hoàn chỉnh cho Second Block.',
      };
    }

    const durationMs = performance.now() - t0;
    const allMovesStr = [...fbRes.moves, ...sbRes.moves].join(' ');

    if (allMovesStr) {
      get().enqueueAlgorithm(allMovesStr);
    }

    return {
      fbMoves: fbRes.moves,
      sbMoves: sbRes.moves,
      durationMs,
      isAlreadySolved: false,
    };
  },
}));
