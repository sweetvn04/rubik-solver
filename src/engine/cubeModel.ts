import { type CubieState, CUBE_PALETTE } from '../types';

/**
 * Sinh ra trạng thái mặc định của 26 viên Cubie trong không gian 3x3x3
 * Tâm (0, 0, 0) bị bỏ qua vì không có viên hiển thị bên trong.
 */
export function createInitialCubies(): CubieState[] {
  const cubies: CubieState[] = [];

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        // Bỏ qua tâm rỗng bên trong
        if (x === 0 && y === 0 && z === 0) continue;

        const id = `cubie_${x}_${y}_${z}`;
        const colors: CubieState['colors'] = {};

        // Gán màu cho các mặt tiếp xúc bên ngoài
        if (y === 1) colors.U = CUBE_PALETTE.U;
        if (y === -1) colors.D = CUBE_PALETTE.D;
        if (z === 1) colors.F = CUBE_PALETTE.F;
        if (z === -1) colors.B = CUBE_PALETTE.B;
        if (x === 1) colors.R = CUBE_PALETTE.R;
        if (x === -1) colors.L = CUBE_PALETTE.L;

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
