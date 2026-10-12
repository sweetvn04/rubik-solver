import { parseAlgorithm } from './moveParser';
import type { Move } from '../types';

const FACES = ['U', 'D', 'L', 'R', 'F', 'B'] as const;
const MODIFIERS = ['', "'", '2'] as const;

// Nhóm các mặt cùng trục xoay để tránh sinh 2 move triệt tiêu nhau liên tiếp
const AXIS_GROUPS: Record<string, string> = {
  U: 'Y',
  D: 'Y',
  L: 'X',
  R: 'X',
  F: 'Z',
  B: 'Z',
};

/**
 * Sinh chuỗi Scramble chuẩn WCA (20 moves ngẫu nhiên, không trùng trục)
 */
export function generateScramble(length: number = 20): { raw: string; moves: Move[] } {
  const chosen: string[] = [];
  let lastFace = '';
  let secondLastFace = '';

  for (let i = 0; i < length; i++) {
    const validFaces = FACES.filter((f) => {
      // Không lặp lại cùng mặt
      if (f === lastFace) return false;
      // Không lặp lại 3 mặt cùng 1 trục (ví dụ: R L R)
      if (
        secondLastFace &&
        AXIS_GROUPS[f] === AXIS_GROUPS[lastFace] &&
        AXIS_GROUPS[f] === AXIS_GROUPS[secondLastFace]
      ) {
        return false;
      }
      return true;
    });

    const face = validFaces[Math.floor(Math.random() * validFaces.length)];
    const mod = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    chosen.push(`${face}${mod}`);

    secondLastFace = lastFace;
    lastFace = face;
  }

  const raw = chosen.join(' ');
  // Mặc định các bước tráo Rubik có tốc độ nhanh (90ms / move)
  return { raw, moves: parseAlgorithm(raw, 90) };
}
