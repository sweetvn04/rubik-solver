import * as THREE from 'three';
import type { Move, Face } from '../types';

export interface MoveExecutionInfo {
  move: Move;
  axis: THREE.Vector3;
  angle: number; // Radian
  filter: (pos: [number, number, number]) => boolean;
}

/**
 * Phân tích chuỗi công thức Rubik thành mảng Move
 * Ví dụ: "R U R' U' M2 U M" -> Move[]
 */
export function parseAlgorithm(alg: string, customDuration?: number): Move[] {
  if (!alg) return [];

  // Regex bắt các move: R, L, U, D, F, B, M, E, S, r, l, u, d, f, b kèm ' hoặc 2
  const tokenRegex = /([RLUDFBMESrludfb])([2']?)/g;
  const moves: Move[] = [];
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(alg)) !== null) {
    const rawFace = match[1] as Face;
    const modifier = match[2];

    const double = modifier === '2';
    const direction = modifier === "'" ? -1 : 1;

    moves.push({
      face: rawFace,
      direction,
      double,
      raw: match[0],
      ...(customDuration ? { duration: customDuration } : {}),
    });
  }

  return moves;
}

/**
 * Ánh xạ một Move sang thông số trục xoay, góc quay và bộ lọc các viên chịu tác động
 */
export function getMoveExecutionInfo(move: Move): MoveExecutionInfo {
  const { face, direction, double } = move;
  const baseAngle = double ? Math.PI : Math.PI / 2;
  const dirSign = direction === -1 ? -1 : 1;

  const X_AXIS = new THREE.Vector3(1, 0, 0);
  const Y_AXIS = new THREE.Vector3(0, 1, 0);
  const Z_AXIS = new THREE.Vector3(0, 0, 1);

  switch (face) {
    // 1. CÁC MẶT CƠ BẢN
    case 'R':
      return {
        move,
        axis: X_AXIS,
        angle: -baseAngle * dirSign,
        filter: ([x]) => Math.round(x) === 1,
      };

    case 'L':
      return {
        move,
        axis: X_AXIS,
        angle: baseAngle * dirSign,
        filter: ([x]) => Math.round(x) === -1,
      };

    case 'U':
      return {
        move,
        axis: Y_AXIS,
        angle: -baseAngle * dirSign,
        filter: ([, y]) => Math.round(y) === 1,
      };

    case 'D':
      return {
        move,
        axis: Y_AXIS,
        angle: baseAngle * dirSign,
        filter: ([, y]) => Math.round(y) === -1,
      };

    case 'F':
      return {
        move,
        axis: Z_AXIS,
        angle: -baseAngle * dirSign,
        filter: ([, , z]) => Math.round(z) === 1,
      };

    case 'B':
      return {
        move,
        axis: Z_AXIS,
        angle: baseAngle * dirSign,
        filter: ([, , z]) => Math.round(z) === -1,
      };

    // 2. TẦNG GIỮA (ROUX M-SLICE CỐT LÕI)
    case 'M':
      // M xoay cùng chiều với L
      return {
        move,
        axis: X_AXIS,
        angle: baseAngle * dirSign,
        filter: ([x]) => Math.round(x) === 0,
      };

    case 'E':
      // E xoay cùng chiều với D
      return {
        move,
        axis: Y_AXIS,
        angle: baseAngle * dirSign,
        filter: ([, y]) => Math.round(y) === 0,
      };

    case 'S':
      // S xoay cùng chiều với F
      return {
        move,
        axis: Z_AXIS,
        angle: -baseAngle * dirSign,
        filter: ([, , z]) => Math.round(z) === 0,
      };

    // 3. WIDE MOVES (2 TẦNG CÙNG LÚC DÙNG TRONG ROUX SB VÀ CMLL)
    case 'r':
      return {
        move,
        axis: X_AXIS,
        angle: -baseAngle * dirSign,
        filter: ([x]) => Math.round(x) >= 0, // Cả R và M
      };

    case 'l':
      return {
        move,
        axis: X_AXIS,
        angle: baseAngle * dirSign,
        filter: ([x]) => Math.round(x) <= 0, // Cả L và M
      };

    case 'u':
      return {
        move,
        axis: Y_AXIS,
        angle: -baseAngle * dirSign,
        filter: ([, y]) => Math.round(y) >= 0, // Cả U và E
      };

    case 'd':
      return {
        move,
        axis: Y_AXIS,
        angle: baseAngle * dirSign,
        filter: ([, y]) => Math.round(y) <= 0, // Cả D và E
      };

    case 'f':
      return {
        move,
        axis: Z_AXIS,
        angle: -baseAngle * dirSign,
        filter: ([, , z]) => Math.round(z) >= 0, // Cả F và S
      };

    case 'b':
      return {
        move,
        axis: Z_AXIS,
        angle: baseAngle * dirSign,
        filter: ([, , z]) => Math.round(z) <= 0, // Cả B và S
      };

    default:
      return {
        move,
        axis: Y_AXIS,
        angle: 0,
        filter: () => false,
      };
  }
}
