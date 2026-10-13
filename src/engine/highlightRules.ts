import type { CubieState, ActiveCaseStudy } from '../types';

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

/**
 * Kiểm tra xem một viên Cubie có thuộc nhóm liên quan trực tiếp đến thế cờ đang học
 * trong Case Study (First Block hoặc Second Block) hay không.
 * Các viên không liên quan sẽ được làm xám (dimmed) để người học quan sát trực quan nhất.
 */
export function isCubieInCaseStudy(
  cubie: CubieState,
  caseStudy: ActiveCaseStudy
): boolean {
  const [ix, iy, iz] = cubie.initialPos;
  const isCenter = Math.abs(ix) + Math.abs(iy) + Math.abs(iz) === 1;

  // 1. FIRST BLOCK (FB)
  if (caseStudy.blockType === 'fb') {
    // Các tâm tham chiếu định hướng không gian: L (mặt chính FB), D (đáy), F (trước), B (sau), U (trên)
    // Tâm R đối diện được làm xám vì First Block hoàn toàn không can thiệp mặt R
    if (isCenter) {
      return ix !== 1;
    }

    // Mỏ neo DL: Chỉ viên cạnh DL (Trắng - Đỏ)
    if (caseStudy.targetSlot === 'DL') {
      return ix === -1 && iy === -1 && iz === 0;
    }

    // Cặp trước FL (Front Pair): Cạnh DL (nền), Cặp FL (DFL + FL), kèm Cặp sau (DBL + BL) nếu đã xong
    if (caseStudy.targetSlot === 'FL') {
      const isDL = ix === -1 && iy === -1 && iz === 0;
      const isFrontPair = (ix === -1 && iy === -1 && iz === 1) || (ix === -1 && iy === 0 && iz === 1);
      const isBackPair = (ix === -1 && iy === -1 && iz === -1) || (ix === -1 && iy === 0 && iz === -1);
      return isDL || isFrontPair || isBackPair;
    }

    // Cặp sau BL (Back Pair): Cạnh DL (nền) + Cặp BL (DBL + BL)
    if (caseStudy.targetSlot === 'BL') {
      const isDL = ix === -1 && iy === -1 && iz === 0;
      const isBackPair = (ix === -1 && iy === -1 && iz === -1) || (ix === -1 && iy === 0 && iz === -1);
      return isDL || isBackPair;
    }

    // Mặc định cho First Block (x = -1, y <= 0)
    return ix === -1 && iy <= 0;
  }

  // 2. SECOND BLOCK (SB)
  if (caseStudy.blockType === 'sb') {
    // Toàn bộ khối First Block bên trái (1x2x3) đã giải xong: luôn giữ nguyên màu để nhận biết
    const isFB = ix === -1 && iy <= 0;
    if (isFB) return true;

    // Toàn bộ 6 tâm hệ quy chiếu không gian
    if (isCenter) return true;

    // Mỏ neo DR: Chỉ viên cạnh DR (Trắng - Cam)
    if (caseStudy.targetSlot === 'DR') {
      return ix === 1 && iy === -1 && iz === 0;
    }

    // Cặp trước FR: Cạnh DR + Cặp FR (DFR + FR) + Cặp sau (DBR + BR) nếu có
    if (caseStudy.targetSlot === 'FR') {
      const isDR = ix === 1 && iy === -1 && iz === 0;
      const isFrontPair = (ix === 1 && iy === -1 && iz === 1) || (ix === 1 && iy === 0 && iz === 1);
      const isBackPair = (ix === 1 && iy === -1 && iz === -1) || (ix === 1 && iy === 0 && iz === -1);
      return isDR || isFrontPair || isBackPair;
    }

    // Cặp sau BR: Cạnh DR + Cặp BR (DBR + BR)
    if (caseStudy.targetSlot === 'BR') {
      const isDR = ix === 1 && iy === -1 && iz === 0;
      const isBackPair = (ix === 1 && iy === -1 && iz === -1) || (ix === 1 && iy === 0 && iz === -1);
      return isDR || isBackPair;
    }

    // Mặc định cho Second Block: Khối FB hoặc SB (x !== 0, y <= 0)
    return (ix === -1 || ix === 1) && iy <= 0;
  }

  return true;
}

