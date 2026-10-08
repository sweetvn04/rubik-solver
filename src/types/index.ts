export type Face = 'U' | 'D' | 'F' | 'B' | 'R' | 'L' | 'M' | 'E' | 'S';

export interface Move {
  face: Face;
  direction: 1 | -1; // 1 = Clockwise, -1 = Counter-Clockwise
  double?: boolean;  // 180 degree rotation
  raw: string;       // e.g. "R", "U'", "M2"
}

export type RouxPhase = 'FB' | 'SB' | 'CMLL' | 'LSE_EO' | 'LSE_ULUR' | 'LSE_M';

export interface SolveStep {
  phase: RouxPhase;
  title: string;
  description: string;
  moves: string[];
  highlightGroup?: string;
}

// 3D Cubie coordinate in grid {-1, 0, 1}
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type CubieId = string;

export interface CubieColorDef {
  U?: string;
  D?: string;
  F?: string;
  B?: string;
  R?: string;
  L?: string;
}

export interface CubieState {
  id: CubieId;
  initialPos: [number, number, number];
  currentPos: [number, number, number];
  colors: CubieColorDef;
  isDimmed?: boolean;
}

// Bảng màu Cozy Pastel (phong cách Deliver on a planet)
export const CUBE_PALETTE = {
  U: '#f6d167', // Vàng bơ ấm
  D: '#fbf8f1', // Trắng sữa kem
  F: '#52b788', // Xanh mint / matcha
  B: '#3d5a80', // Xanh denim
  R: '#e07a5f', // Đỏ san hô
  L: '#f4a261', // Cam đào
  CORE: '#2c2724', // Thân nhựa matte đen ấm
  DIMMED: '#4a4642', // Màu xám mờ khi không thuộc nhóm highlight
} as const;

