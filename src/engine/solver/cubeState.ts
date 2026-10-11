import * as THREE from 'three';
import { type CubieState, type Move, CUBE_PALETTE } from '../../types';
import { getMoveExecutionInfo, parseAlgorithm } from '../moveParser';

/**
 * Mã màu chuẩn 6 mặt (BOY Standard Color Scheme):
 * 0 = U: Vàng (Yellow)
 * 1 = D: Trắng (White)
 * 2 = F: Xanh lá (Green)
 * 3 = B: Xanh lam (Blue)
 * 4 = L: Cam (Orange)
 * 5 = R: Đỏ (Red)
 */
export const COLOR_U = 0;
export const COLOR_D = 1;
export const COLOR_F = 2;
export const COLOR_B = 3;
export const COLOR_L = 4;
export const COLOR_R = 5;

export type ColorId = 0 | 1 | 2 | 3 | 4 | 5;
export const COLOR_NAMES: Record<ColorId, string> = {
  [COLOR_U]: 'U (Vàng)',
  [COLOR_D]: 'D (Trắng)',
  [COLOR_F]: 'F (Xanh lá)',
  [COLOR_B]: 'B (Xanh lam)',
  [COLOR_L]: 'L (Đỏ)',
  [COLOR_R]: 'R (Cam)',
};

export const COLOR_CHARS = ['U', 'D', 'F', 'B', 'L', 'R'] as const;

/**
 * 54 Facelet Indices (0..53) theo chuẩn Kociemba / WCA:
 *
 *               | 0  1  2 |
 *               | 3  U  5 |
 *               | 6  7  8 |
 *   ------------+---------+------------+------------
 *    36 37 38   | 18 19 20| 45 46 47   | 27 28 29
 *    39  L 41   | 21  F 23| 48  R 50   | 30  B 32
 *    42 43 44   | 24 25 26| 51 52 53   | 33 34 35
 *   ------------+---------+------------+------------
 *               | 9  10 11|
 *               | 12 D  14|
 *               | 15 16 17|
 */
export const FACELETS = {
  // Mặt U (Top): 0..8
  U_BL: 0, U_B: 1, U_BR: 2,
  U_L: 3,  U_C: 4, U_R: 5,
  U_FL: 6, U_F: 7, U_FR: 8,

  // Mặt D (Bottom): 9..17
  D_FL: 9,  D_F: 10, D_FR: 11,
  D_L: 12,  D_C: 13, D_R: 14,
  D_BL: 15, D_B: 16, D_BR: 17,

  // Mặt F (Front): 18..26
  F_UL: 18, F_U: 19, F_UR: 20,
  F_L: 21,  F_C: 22, F_R: 23,
  F_DL: 24, F_D: 25, F_DR: 26,

  // Mặt B (Back): 27..35
  B_UR: 27, B_U: 28, B_UL: 29,
  B_R: 30,  B_C: 31, B_L: 32,
  B_DR: 33, B_D: 34, B_DL: 35,

  // Mặt L (Left): 36..44
  L_UB: 36, L_U: 37, L_UF: 38,
  L_B: 39,  L_C: 40, L_F: 41,
  L_DB: 42, L_D: 43, L_DF: 44,

  // Mặt R (Right): 45..53
  R_UF: 45, R_U: 46, R_UB: 47,
  R_F: 48,  R_C: 49, R_B: 50,
  R_DF: 51, R_D: 52, R_DB: 53,
} as const;

export type SolverCubeState = Uint8Array;

/**
 * Định nghĩa tọa độ 3D và vector pháp tuyến cho từng facelet trong số 54 facelet
 */
interface FaceletDef {
  index: number;
  face: ColorId;
  pos: [number, number, number];    // x, y, z trong {-1, 0, 1}
  normal: [number, number, number]; // x, y, z vector pháp tuyến
}

const FACELET_DEFS: FaceletDef[] = [
  // Mặt U (y = +1, normal = [0, 1, 0])
  { index: 0, face: COLOR_U, pos: [-1, 1, -1], normal: [0, 1, 0] },
  { index: 1, face: COLOR_U, pos: [0, 1, -1],  normal: [0, 1, 0] },
  { index: 2, face: COLOR_U, pos: [1, 1, -1],  normal: [0, 1, 0] },
  { index: 3, face: COLOR_U, pos: [-1, 1, 0],  normal: [0, 1, 0] },
  { index: 4, face: COLOR_U, pos: [0, 1, 0],   normal: [0, 1, 0] },
  { index: 5, face: COLOR_U, pos: [1, 1, 0],   normal: [0, 1, 0] },
  { index: 6, face: COLOR_U, pos: [-1, 1, 1],  normal: [0, 1, 0] },
  { index: 7, face: COLOR_U, pos: [0, 1, 1],   normal: [0, 1, 0] },
  { index: 8, face: COLOR_U, pos: [1, 1, 1],   normal: [0, 1, 0] },

  // Mặt D (y = -1, normal = [0, -1, 0])
  { index: 9,  face: COLOR_D, pos: [-1, -1, 1],  normal: [0, -1, 0] },
  { index: 10, face: COLOR_D, pos: [0, -1, 1],   normal: [0, -1, 0] },
  { index: 11, face: COLOR_D, pos: [1, -1, 1],   normal: [0, -1, 0] },
  { index: 12, face: COLOR_D, pos: [-1, -1, 0],  normal: [0, -1, 0] },
  { index: 13, face: COLOR_D, pos: [0, -1, 0],   normal: [0, -1, 0] },
  { index: 14, face: COLOR_D, pos: [1, -1, 0],   normal: [0, -1, 0] },
  { index: 15, face: COLOR_D, pos: [-1, -1, -1], normal: [0, -1, 0] },
  { index: 16, face: COLOR_D, pos: [0, -1, -1],  normal: [0, -1, 0] },
  { index: 17, face: COLOR_D, pos: [1, -1, -1],  normal: [0, -1, 0] },

  // Mặt F (z = +1, normal = [0, 0, 1])
  { index: 18, face: COLOR_F, pos: [-1, 1, 1],  normal: [0, 0, 1] },
  { index: 19, face: COLOR_F, pos: [0, 1, 1],   normal: [0, 0, 1] },
  { index: 20, face: COLOR_F, pos: [1, 1, 1],   normal: [0, 0, 1] },
  { index: 21, face: COLOR_F, pos: [-1, 0, 1],  normal: [0, 0, 1] },
  { index: 22, face: COLOR_F, pos: [0, 0, 1],   normal: [0, 0, 1] },
  { index: 23, face: COLOR_F, pos: [1, 0, 1],   normal: [0, 0, 1] },
  { index: 24, face: COLOR_F, pos: [-1, -1, 1], normal: [0, 0, 1] },
  { index: 25, face: COLOR_F, pos: [0, -1, 1],  normal: [0, 0, 1] },
  { index: 26, face: COLOR_F, pos: [1, -1, 1],  normal: [0, 0, 1] },

  // Mặt B (z = -1, normal = [0, 0, -1])
  { index: 27, face: COLOR_B, pos: [1, 1, -1],  normal: [0, 0, -1] },
  { index: 28, face: COLOR_B, pos: [0, 1, -1],  normal: [0, 0, -1] },
  { index: 29, face: COLOR_B, pos: [-1, 1, -1], normal: [0, 0, -1] },
  { index: 30, face: COLOR_B, pos: [1, 0, -1],  normal: [0, 0, -1] },
  { index: 31, face: COLOR_B, pos: [0, 0, -1],  normal: [0, 0, -1] },
  { index: 32, face: COLOR_B, pos: [-1, 0, -1], normal: [0, 0, -1] },
  { index: 33, face: COLOR_B, pos: [1, -1, -1], normal: [0, 0, -1] },
  { index: 34, face: COLOR_B, pos: [0, -1, -1], normal: [0, 0, -1] },
  { index: 35, face: COLOR_B, pos: [-1, -1, -1],normal: [0, 0, -1] },

  // Mặt L (x = -1, normal = [-1, 0, 0])
  { index: 36, face: COLOR_L, pos: [-1, 1, -1], normal: [-1, 0, 0] },
  { index: 37, face: COLOR_L, pos: [-1, 1, 0],  normal: [-1, 0, 0] },
  { index: 38, face: COLOR_L, pos: [-1, 1, 1],  normal: [-1, 0, 0] },
  { index: 39, face: COLOR_L, pos: [-1, 0, -1], normal: [-1, 0, 0] },
  { index: 40, face: COLOR_L, pos: [-1, 0, 0],  normal: [-1, 0, 0] },
  { index: 41, face: COLOR_L, pos: [-1, 0, 1],  normal: [-1, 0, 0] },
  { index: 42, face: COLOR_L, pos: [-1, -1, -1],normal: [-1, 0, 0] },
  { index: 43, face: COLOR_L, pos: [-1, -1, 0], normal: [-1, 0, 0] },
  { index: 44, face: COLOR_L, pos: [-1, -1, 1], normal: [-1, 0, 0] },

  // Mặt R (x = +1, normal = [1, 0, 0])
  { index: 45, face: COLOR_R, pos: [1, 1, 1],   normal: [1, 0, 0] },
  { index: 46, face: COLOR_R, pos: [1, 1, 0],   normal: [1, 0, 0] },
  { index: 47, face: COLOR_R, pos: [1, 1, -1],  normal: [1, 0, 0] },
  { index: 48, face: COLOR_R, pos: [1, 0, 1],   normal: [1, 0, 0] },
  { index: 49, face: COLOR_R, pos: [1, 0, 0],   normal: [1, 0, 0] },
  { index: 50, face: COLOR_R, pos: [1, 0, -1],  normal: [1, 0, 0] },
  { index: 51, face: COLOR_R, pos: [1, -1, 1],  normal: [1, 0, 0] },
  { index: 52, face: COLOR_R, pos: [1, -1, 0],  normal: [1, 0, 0] },
  { index: 53, face: COLOR_R, pos: [1, -1, -1], normal: [1, 0, 0] },
];

/**
 * Tìm facelet index theo vị trí [x, y, z] và vector pháp tuyến [nx, ny, nz]
 */
function findFaceletIndex(
  x: number, y: number, z: number,
  nx: number, ny: number, nz: number
): number {
  const rx = Math.round(x);
  const ry = Math.round(y);
  const rz = Math.round(z);
  const rnx = Math.round(nx);
  const rny = Math.round(ny);
  const rnz = Math.round(nz);

  for (let i = 0; i < FACELET_DEFS.length; i++) {
    const d = FACELET_DEFS[i];
    if (
      d.pos[0] === rx && d.pos[1] === ry && d.pos[2] === rz &&
      d.normal[0] === rnx && d.normal[1] === rny && d.normal[2] === rnz
    ) {
      return i;
    }
  }
  return -1;
}

/**
 * Tính toán mảng hoán vị (Permutation Array) cho một Move từ moveParser
 * perm[dst] = src: tức là facelet tại vị trí dst sau move sẽ lấy màu từ vị trí src trước move.
 */
function generateMovePermutation(move: Move): Uint8Array {
  const { axis, angle, filter } = getMoveExecutionInfo(move);
  const deltaQ = new THREE.Quaternion().setFromAxisAngle(axis, angle);
  const perm = new Uint8Array(54);

  // Mặc định không đổi
  for (let i = 0; i < 54; i++) perm[i] = i;

  for (let src = 0; src < 54; src++) {
    const def = FACELET_DEFS[src];
    // Kiểm tra xem viên này có thuộc tầng bị xoay không
    if (!filter(def.pos)) {
      continue;
    }

    // Xoay vị trí 3D
    const posVec = new THREE.Vector3(...def.pos).applyQuaternion(deltaQ);
    // Xoay vector pháp tuyến
    const normVec = new THREE.Vector3(...def.normal).applyQuaternion(deltaQ);

    const dst = findFaceletIndex(
      posVec.x, posVec.y, posVec.z,
      normVec.x, normVec.y, normVec.z
    );

    if (dst !== -1) {
      perm[dst] = src;
    }
  }

  return perm;
}

// Bảng Cache các mảng hoán vị cho mọi Move
const MOVE_PERMUTATIONS: Map<string, Uint8Array> = new Map();

/**
 * Lấy mảng hoán vị cho một Move (tự động sinh và lưu cache)
 */
export function getMovePermutation(move: Move): Uint8Array {
  const key = move.raw;
  let perm = MOVE_PERMUTATIONS.get(key);
  if (!perm) {
    perm = generateMovePermutation(move);
    MOVE_PERMUTATIONS.set(key, perm);
  }
  return perm;
}

/**
 * Tạo một khối Rubik ở trạng thái đã giải hoàn tất (Solved State)
 */
export function createSolvedCube(): SolverCubeState {
  const cube = new Uint8Array(54);
  for (let i = 0; i < 54; i++) {
    cube[i] = FACELET_DEFS[i].face;
  }
  return cube;
}

/**
 * Sao chép một trạng thái khối Rubik
 */
export function cloneCube(cube: SolverCubeState): SolverCubeState {
  return new Uint8Array(cube);
}

/**
 * Thực hiện một Move trên khối Rubik trong nano-giây (siêu tốc cho solver)
 */
export function applyMove(cube: SolverCubeState, moveOrRaw: Move | string): SolverCubeState {
  const move = typeof moveOrRaw === 'string' ? parseAlgorithm(moveOrRaw)[0] : moveOrRaw;
  if (!move) return cube;

  const perm = getMovePermutation(move);
  const next = new Uint8Array(54);
  for (let dst = 0; dst < 54; dst++) {
    next[dst] = cube[perm[dst]];
  }
  return next;
}

/**
 * Thực hiện chuỗi thuật toán (nhiều moves) trên khối Rubik
 */
export function applyAlgorithm(cube: SolverCubeState, alg: string): SolverCubeState {
  const moves = parseAlgorithm(alg);
  let current = cube;
  for (let i = 0; i < moves.length; i++) {
    current = applyMove(current, moves[i]);
  }
  return current;
}

/**
 * Chuyển đổi trạng thái hiển thị 3D Zustand (CubieState[]) sang SolverCubeState
 */
export function cubiesToSolverState(cubies: CubieState[]): SolverCubeState {
  const cube = new Uint8Array(54);

  // Ánh xạ màu hex sang ColorId
  const hexToColor = (hex?: string): ColorId | null => {
    if (!hex) return null;
    if (hex.includes('e5a922')) return COLOR_U;
    if (hex.includes('dfdcce')) return COLOR_D;
    if (hex.includes('38934c')) return COLOR_F;
    if (hex.includes('2f7ebb')) return COLOR_B;
    if (hex.includes('9d2825')) return COLOR_L;
    if (hex.includes('d86629')) return COLOR_R;
    return null;
  };

  const normals: Array<{ face: 'U' | 'D' | 'F' | 'B' | 'L' | 'R'; vec: [number, number, number] }> = [
    { face: 'U', vec: [0, 1, 0] },
    { face: 'D', vec: [0, -1, 0] },
    { face: 'F', vec: [0, 0, 1] },
    { face: 'B', vec: [0, 0, -1] },
    { face: 'L', vec: [-1, 0, 0] },
    { face: 'R', vec: [1, 0, 0] },
  ];

  for (let i = 0; i < cubies.length; i++) {
    const cubie = cubies[i];
    const q = new THREE.Quaternion(...cubie.quaternion);

    for (let j = 0; j < normals.length; j++) {
      const { face, vec } = normals[j];
      const origHex = cubie.colors[face];
      if (!origHex) continue;

      const colorId = hexToColor(origHex);
      if (colorId === null) continue;

      // Tính vector pháp tuyến hiện tại sau khi cubie đã xoay
      const currentNorm = new THREE.Vector3(...vec).applyQuaternion(q);
      const [cx, cy, cz] = cubie.currentPos;

      const faceletIdx = findFaceletIndex(
        cx, cy, cz,
        currentNorm.x, currentNorm.y, currentNorm.z
      );

      if (faceletIdx !== -1) {
        cube[faceletIdx] = colorId;
      }
    }
  }

  return cube;
}

// =========================================================================
// CÁC HÀM KIỂM TRA ĐIỀU KIỆN ĐẠT CHUẨN CỦA 4 BƯỚC ROUX (ROUX PHASE VALIDATORS)
// =========================================================================

/**
 * Kiểm tra xem khối Rubik đã hoàn tất 100% chưa
 */
export function isCubeSolved(c: SolverCubeState): boolean {
  for (let i = 0; i < 54; i++) {
    if (c[i] !== FACELET_DEFS[i].face) return false;
  }
  return true;
}

/**
 * Bước 1 (Phase 1): First Block (FB) — Khối 1x2x3 bên trái (Mặt L và D)
 * Gồm: Tâm L, cạnh DL, cạnh FL, cạnh BL, góc DFL, góc DBL.
 */
export function isFirstBlockSolved(c: SolverCubeState): boolean {
  // Tâm L
  if (c[FACELETS.L_C] !== COLOR_L) return false;

  // Cạnh DL (D = Trắng, L = Cam)
  if (c[FACELETS.D_L] !== COLOR_D || c[FACELETS.L_D] !== COLOR_L) return false;

  // Cạnh FL (F = Xanh lá, L = Cam)
  if (c[FACELETS.F_L] !== COLOR_F || c[FACELETS.L_F] !== COLOR_L) return false;

  // Cạnh BL (B = Xanh lam, L = Cam)
  if (c[FACELETS.B_L] !== COLOR_B || c[FACELETS.L_B] !== COLOR_L) return false;

  // Góc DFL (D = Trắng, F = Xanh lá, L = Cam)
  if (
    c[FACELETS.D_FL] !== COLOR_D ||
    c[FACELETS.F_DL] !== COLOR_F ||
    c[FACELETS.L_DF] !== COLOR_L
  ) return false;

  // Góc DBL (D = Trắng, B = Xanh lam, L = Cam)
  if (
    c[FACELETS.D_BL] !== COLOR_D ||
    c[FACELETS.B_DL] !== COLOR_B ||
    c[FACELETS.L_DB] !== COLOR_L
  ) return false;

  return true;
}

/**
 * Bước 2 (Phase 2): Second Block (SB) — Khối 1x2x3 bên phải (Mặt R và D)
 * Yêu cầu: FB vẫn nguyên vẹn + Khối bên phải hoàn chỉnh (Tâm R, cạnh DR, FR, BR, góc DFR, DBR).
 */
export function isSecondBlockSolved(c: SolverCubeState): boolean {
  if (!isFirstBlockSolved(c)) return false;

  // Tâm R
  if (c[FACELETS.R_C] !== COLOR_R) return false;

  // Cạnh DR (D = Trắng, R = Đỏ)
  if (c[FACELETS.D_R] !== COLOR_D || c[FACELETS.R_D] !== COLOR_R) return false;

  // Cạnh FR (F = Xanh lá, R = Đỏ)
  if (c[FACELETS.F_R] !== COLOR_F || c[FACELETS.R_F] !== COLOR_R) return false;

  // Cạnh BR (B = Xanh lam, R = Đỏ)
  if (c[FACELETS.B_R] !== COLOR_B || c[FACELETS.R_B] !== COLOR_R) return false;

  // Góc DFR (D = Trắng, F = Xanh lá, R = Đỏ)
  if (
    c[FACELETS.D_FR] !== COLOR_D ||
    c[FACELETS.F_DR] !== COLOR_F ||
    c[FACELETS.R_DF] !== COLOR_R
  ) return false;

  // Góc DBR (D = Trắng, B = Xanh lam, R = Đỏ)
  if (
    c[FACELETS.D_BR] !== COLOR_D ||
    c[FACELETS.B_DR] !== COLOR_B ||
    c[FACELETS.R_DB] !== COLOR_R
  ) return false;

  return true;
}

/**
 * Bước 3 (Phase 3): CMLL — Định hướng và hoán vị 4 góc tầng U (giữ nguyên FB và SB)
 * 4 góc U: UFL, UFR, UBL, UBR đều có màu U hướng lên trên và các cạnh bên khớp màu nhau.
 */
export function isCMLLSolved(c: SolverCubeState): boolean {
  if (!isSecondBlockSolved(c)) return false;

  // 1. Định hướng 4 góc U (tất cả đỉnh U đều là màu Vàng U)
  if (
    c[FACELETS.U_FL] !== COLOR_U ||
    c[FACELETS.U_FR] !== COLOR_U ||
    c[FACELETS.U_BL] !== COLOR_U ||
    c[FACELETS.U_BR] !== COLOR_U
  ) return false;

  // 2. Hoán vị 4 góc U: các mặt bên của các góc phải khớp màu
  // Cặp góc mặt F (F_UL và F_UR) cùng màu
  if (c[FACELETS.F_UL] !== c[FACELETS.F_UR]) return false;
  // Cặp góc mặt B (B_UL và B_UR) cùng màu
  if (c[FACELETS.B_UL] !== c[FACELETS.B_UR]) return false;
  // Cặp góc mặt L (L_UB và L_UF) cùng màu
  if (c[FACELETS.L_UB] !== c[FACELETS.L_UF]) return false;
  // Cặp góc mặt R (R_UF và R_UB) cùng màu
  if (c[FACELETS.R_UF] !== c[FACELETS.R_UB]) return false;

  // Đồng thời mặt bên phải khớp với màu tâm tương ứng
  if (c[FACELETS.F_UL] !== COLOR_F) return false;
  if (c[FACELETS.B_UL] !== COLOR_B) return false;
  if (c[FACELETS.L_UB] !== COLOR_L) return false;
  if (c[FACELETS.R_UF] !== COLOR_R) return false;

  return true;
}

/**
 * Bước 4a: LSE - Edge Orientation (EO)
 * Cả 6 cạnh còn lại (UF, UB, UL, UR, DF, DB) đều có hướng "Good" theo luật Roux:
 * - Các cạnh ở tầng U/D: mặt U/D phải là màu U hoặc D (Vàng hoặc Trắng).
 * - Nếu ở vị trí E/F/B thì mặt F/B phải là màu U hoặc D.
 */
export function isLSE_EOSolved(c: SolverCubeState): boolean {
  if (!isCMLLSolved(c)) return false;

  const isUorD = (col: number) => col === COLOR_U || col === COLOR_D;

  // 4 cạnh trên tầng U: UF, UB, UL, UR
  if (!isUorD(c[FACELETS.U_F])) return false;
  if (!isUorD(c[FACELETS.U_B])) return false;
  if (!isUorD(c[FACELETS.U_L])) return false;
  if (!isUorD(c[FACELETS.U_R])) return false;

  // 2 cạnh dưới tầng D: DF, DB
  if (!isUorD(c[FACELETS.D_F])) return false;
  if (!isUorD(c[FACELETS.D_B])) return false;

  return true;
}

/**
 * In lưới 2D của khối Rubik phục vụ debug trực quan
 */
export function formatCubeNet(c: SolverCubeState): string {
  const ch = (idx: number) => COLOR_CHARS[c[idx]];
  return `
    ${ch(0)}${ch(1)}${ch(2)}
    ${ch(3)}${ch(4)}${ch(5)}
    ${ch(6)}${ch(7)}${ch(8)}
${ch(36)}${ch(37)}${ch(38)} ${ch(18)}${ch(19)}${ch(20)} ${ch(45)}${ch(46)}${ch(47)} ${ch(27)}${ch(28)}${ch(29)}
${ch(39)}${ch(40)}${ch(41)} ${ch(21)}${ch(22)}${ch(23)} ${ch(48)}${ch(49)}${ch(50)} ${ch(30)}${ch(31)}${ch(32)}
${ch(42)}${ch(43)}${ch(44)} ${ch(24)}${ch(25)}${ch(26)} ${ch(51)}${ch(52)}${ch(53)} ${ch(33)}${ch(34)}${ch(35)}
    ${ch(9)}${ch(10)}${ch(11)}
    ${ch(12)}${ch(13)}${ch(14)}
    ${ch(15)}${ch(16)}${ch(17)}
  `.trim();
}

/**
 * Ánh xạ mã màu ColorId sang mã màu hex thực tế của ứng dụng
 */
export const COLOR_ID_TO_HEX: Record<ColorId, string> = {
  [COLOR_U]: CUBE_PALETTE.U,
  [COLOR_D]: CUBE_PALETTE.D,
  [COLOR_F]: CUBE_PALETTE.F,
  [COLOR_B]: CUBE_PALETTE.B,
  [COLOR_L]: CUBE_PALETTE.L,
  [COLOR_R]: CUBE_PALETTE.R,
};

/**
 * Tạo trạng thái SolverCubeState ở trạng thái đã giải hoàn tất 100%
 */
export function createSolvedSolverState(): SolverCubeState {
  const c = new Uint8Array(54);
  for (let i = 0; i < 54; i++) {
    c[i] = FACELET_DEFS[i].face;
  }
  return c;
}

/**
 * Chuyển đổi SolverCubeState (54 facelets) thành 26 CubieState 3D cho giao diện WebGL
 */
export function solverStateToCubies(cube: SolverCubeState): CubieState[] {
  const cubies: CubieState[] = [];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;

        const id = `cubie_${x}_${y}_${z}`;
        const colors: CubieState['colors'] = {};

        if (y === 1) {
          const idx = findFaceletIndex(x, y, z, 0, 1, 0);
          if (idx !== -1) colors.U = COLOR_ID_TO_HEX[cube[idx] as ColorId];
        }
        if (y === -1) {
          const idx = findFaceletIndex(x, y, z, 0, -1, 0);
          if (idx !== -1) colors.D = COLOR_ID_TO_HEX[cube[idx] as ColorId];
        }
        if (z === 1) {
          const idx = findFaceletIndex(x, y, z, 0, 0, 1);
          if (idx !== -1) colors.F = COLOR_ID_TO_HEX[cube[idx] as ColorId];
        }
        if (z === -1) {
          const idx = findFaceletIndex(x, y, z, 0, 0, -1);
          if (idx !== -1) colors.B = COLOR_ID_TO_HEX[cube[idx] as ColorId];
        }
        if (x === -1) {
          const idx = findFaceletIndex(x, y, z, -1, 0, 0);
          if (idx !== -1) colors.L = COLOR_ID_TO_HEX[cube[idx] as ColorId];
        }
        if (x === 1) {
          const idx = findFaceletIndex(x, y, z, 1, 0, 0);
          if (idx !== -1) colors.R = COLOR_ID_TO_HEX[cube[idx] as ColorId];
        }

        cubies.push({
          id,
          initialPos: [x, y, z],
          currentPos: [x, y, z],
          quaternion: [0, 0, 0, 1],
          colors,
          isDimmed: false,
        });
      }
    }
  }

  return cubies;
}

export interface CubeValidationResult {
  isValid: boolean;
  message?: string;
  counts: Record<ColorId, number>;
  unassignedCount: number;
}

const OPPOSITE_COLORS: Record<ColorId, ColorId> = {
  [COLOR_U]: COLOR_D,
  [COLOR_D]: COLOR_U,
  [COLOR_F]: COLOR_B,
  [COLOR_B]: COLOR_F,
  [COLOR_L]: COLOR_R,
  [COLOR_R]: COLOR_L,
};

const CUBE_EDGES: [number, number][] = [
  [FACELETS.U_B, FACELETS.B_U],
  [FACELETS.U_L, FACELETS.L_U],
  [FACELETS.U_R, FACELETS.R_U],
  [FACELETS.U_F, FACELETS.F_U],
  [FACELETS.D_F, FACELETS.F_D],
  [FACELETS.D_L, FACELETS.L_D],
  [FACELETS.D_R, FACELETS.R_D],
  [FACELETS.D_B, FACELETS.B_D],
  [FACELETS.F_L, FACELETS.L_F],
  [FACELETS.F_R, FACELETS.R_F],
  [FACELETS.B_L, FACELETS.L_B],
  [FACELETS.B_R, FACELETS.R_B],
];

const CUBE_CORNERS: [number, number, number][] = [
  [FACELETS.U_FL, FACELETS.F_UL, FACELETS.L_UF],
  [FACELETS.U_FR, FACELETS.F_UR, FACELETS.R_UF],
  [FACELETS.U_BL, FACELETS.B_UL, FACELETS.L_UB],
  [FACELETS.U_BR, FACELETS.B_UR, FACELETS.R_UB],
  [FACELETS.D_FL, FACELETS.F_DL, FACELETS.L_DF],
  [FACELETS.D_FR, FACELETS.F_DR, FACELETS.R_DF],
  [FACELETS.D_BL, FACELETS.B_DL, FACELETS.L_DB],
  [FACELETS.D_BR, FACELETS.B_DR, FACELETS.R_DB],
];

/**
 * Kiểm tra tính hợp lệ về mặt vật lý của khối Rubik dựa trên 54 ô màu
 */
export function validateCubeState(state: ArrayLike<number | null>): CubeValidationResult {
  const counts: Record<ColorId, number> = {
    [COLOR_U]: 0,
    [COLOR_D]: 0,
    [COLOR_F]: 0,
    [COLOR_B]: 0,
    [COLOR_L]: 0,
    [COLOR_R]: 0,
  };

  let unassignedCount = 0;
  for (let i = 0; i < 54; i++) {
    const val = state[i];
    if (val === null || val === undefined || val < 0 || val > 5) {
      unassignedCount++;
    } else {
      counts[val as ColorId] = (counts[val as ColorId] || 0) + 1;
    }
  }

  if (unassignedCount > 0) {
    return {
      isValid: false,
      message: `Còn ${unassignedCount} ô chưa được chọn màu.`,
      counts,
      unassignedCount,
    };
  }

  // 1. Kiểm tra số lượng mỗi màu phải đúng 9 ô
  for (let c = 0; c <= 5; c++) {
    const cid = c as ColorId;
    if (counts[cid] !== 9) {
      return {
        isValid: false,
        message: `Màu ${COLOR_NAMES[cid]} có ${counts[cid]}/9 ô (cần đúng 9 ô).`,
        counts,
        unassignedCount: 0,
      };
    }
  }

  // 2. Kiểm tra các viên cạnh (12 edges)
  const seenEdges = new Set<string>();
  for (let i = 0; i < CUBE_EDGES.length; i++) {
    const [idx1, idx2] = CUBE_EDGES[i];
    const c1 = state[idx1] as ColorId;
    const c2 = state[idx2] as ColorId;

    if (c1 === c2) {
      return {
        isValid: false,
        message: `Phát hiện viên cạnh có 2 màu trùng nhau (${COLOR_NAMES[c1]}).`,
        counts,
        unassignedCount: 0,
      };
    }

    if (OPPOSITE_COLORS[c1] === c2) {
      return {
        isValid: false,
        message: `Phát hiện viên cạnh có 2 màu đối diện (${COLOR_NAMES[c1]} và ${COLOR_NAMES[c2]}).`,
        counts,
        unassignedCount: 0,
      };
    }

    const edgeKey = [Math.min(c1, c2), Math.max(c1, c2)].join('-');
    if (seenEdges.has(edgeKey)) {
      return {
        isValid: false,
        message: `Phát hiện viên cạnh bị trùng lặp màu (${COLOR_NAMES[c1]} - ${COLOR_NAMES[c2]}).`,
        counts,
        unassignedCount: 0,
      };
    }
    seenEdges.add(edgeKey);
  }

  // 3. Kiểm tra các viên góc (8 corners)
  const seenCorners = new Set<string>();
  for (let i = 0; i < CUBE_CORNERS.length; i++) {
    const [idx1, idx2, idx3] = CUBE_CORNERS[i];
    const c1 = state[idx1] as ColorId;
    const c2 = state[idx2] as ColorId;
    const c3 = state[idx3] as ColorId;

    if (c1 === c2 || c1 === c3 || c2 === c3) {
      return {
        isValid: false,
        message: 'Phát hiện viên góc có các mặt cùng màu.',
        counts,
        unassignedCount: 0,
      };
    }

    if (
      OPPOSITE_COLORS[c1] === c2 ||
      OPPOSITE_COLORS[c1] === c3 ||
      OPPOSITE_COLORS[c2] === c3
    ) {
      return {
        isValid: false,
        message: `Phát hiện viên góc chứa 2 màu đối diện không thể đứng cạnh nhau.`,
        counts,
        unassignedCount: 0,
      };
    }

    const cornerKey = [c1, c2, c3].sort().join('-');
    if (seenCorners.has(cornerKey)) {
      return {
        isValid: false,
        message: 'Phát hiện 2 viên góc có cùng tổ hợp 3 màu.',
        counts,
        unassignedCount: 0,
      };
    }
    seenCorners.add(cornerKey);
  }

  return {
    isValid: true,
    message: 'Khối Rubik hợp lệ! Sẵn sàng giải.',
    counts,
    unassignedCount: 0,
  };
}

