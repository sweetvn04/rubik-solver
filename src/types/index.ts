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
