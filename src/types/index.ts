export type Face =
  | 'U'
  | 'D'
  | 'F'
  | 'B'
  | 'R'
  | 'L'
  | 'M'
  | 'E'
  | 'S'
  | 'r'
  | 'l'
  | 'u'
  | 'd'
  | 'f'
  | 'b';

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
  quaternion: [number, number, number, number];
  colors: CubieColorDef;
  isDimmed?: boolean;
}

// Bảng màu sáp / giấy phác thảo lấy cảm hứng từ phim ngắn SCRAMBLED
export const CUBE_PALETTE = {
  U: '#e5a922', // Vàng nghệ sáp
  D: '#dfdcce', // Trắng giấy mỹ thuật
  F: '#38934c', // Xanh lá sáp / meadow
  B: '#2f7ebb', // Xanh lam cerulean
  R: '#9d2825', // Đỏ đô sáp / crimson
  L: '#d86629', // Cam đất / burnt orange
  CORE: '#1a1715', // Thân nhựa than đen thô mộc
  DIMMED: '#4a443e', // Xám chì mờ khi không thuộc nhóm highlight
} as const;

/** Sub-step của từng bài học Roux (FB/SB/CMLL/LSE) */
export interface LessonStep {
  /** Tiêu đề ngắn gọn của sub-step */
  title: string;
  /** Mô tả chi tiết cần làm ở sub-step này */
  description: string;
  /** Config SVG diagram 2D minh hoạ trạng thái mặt Rubik */
  diagram?: import('../components/ui/CubeDiagram2D').CubeDiagramConfig;
  /** Chuỗi moves để minh hoạ kỹ thuật này trên khối 3D (chạy sau setupAlg) */
  demoAlg?: string;
  /** Setup state trước khi chạy demoAlg (reset về trạng thái phù hợp) */
  setupAlg?: string;
  /** Phase highlight trên khối 3D khi xem sub-step này */
  highlightPhase?: 'fb' | 'sb' | 'cmll' | 'lse' | 'all';
  /** Tooltip / ghi chú thêm */
  note?: string;
}
