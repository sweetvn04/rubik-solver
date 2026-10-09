import type { CubieState } from '../types';

export type FocusPhaseId = 'fb' | 'sb' | 'cmll' | 'lse' | 'all';

/**
 * Kiểm tra xem một viên Cubie có thuộc nhóm được làm nổi bật (Highlight)
 * trong từng giai đoạn của phương pháp Roux hay không.
 *
 * Lưu ý: Việc nhận diện dựa trên vị trí khởi tạo (initialPos) của viên cubie:
 * - FB (First Block 1x2x3 bên trái):
 *   Tâm L, cạnh DL, cạnh FL, cạnh BL, góc DFL, góc DBL.
 *   Điều kiện: x === -1 && y <= 0 (6 viên).
 *
 * - SB (Second Block 1x2x3 bên phải):
 *   Tâm R, cạnh DR, cạnh FR, cạnh BR, góc DFR, góc DBR.
 *   Điều kiện: x === 1 && y <= 0 (6 viên).
 *
 * - CMLL (Corners of Last Layer - 4 góc tầng trên):
 *   Góc UFL, UFR, UBL, UBR.
 *   Điều kiện: y === 1 && x !== 0 && z !== 0 (4 viên).
 *
 * - LSE (Last Six Edges - 6 cạnh cuối cùng):
 *   Cạnh UL, UR, UF, UB, DF, DB.
 */
export function isCubieInPhase(
  cubie: CubieState,
  phaseId: FocusPhaseId,
  includePrevious: boolean = true
): boolean {
  if (phaseId === 'all') return true;

  const [ix, iy, iz] = cubie.initialPos;

  // 1. First Block: 6 viên bên trái tầng D và E (x = -1, y <= 0)
  const isFB = ix === -1 && iy <= 0;
  if (phaseId === 'fb') return isFB;

  // 2. Second Block: 6 viên bên phải tầng D và E (x = 1, y <= 0)
  const isSB = ix === 1 && iy <= 0;
  if (phaseId === 'sb') {
    return includePrevious ? isFB || isSB : isSB;
  }

  // 3. CMLL: 4 viên góc tầng U (y = 1, x != 0, z != 0)
  const isCMLL = iy === 1 && ix !== 0 && iz !== 0;
  if (phaseId === 'cmll') {
    return includePrevious ? isFB || isSB || isCMLL : isCMLL;
  }

  // 4. LSE: 6 cạnh cuối (y = 1 hoặc y = -1 hoặc z = 0 cạnh M-slice)
  if (phaseId === 'lse') {
    return true; // Trong LSE cả khối đã sắp giải xong, hiển thị tất cả
  }

  return true;
}
