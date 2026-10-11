/**
 * CubeDiagram2D — SVG mini diagram hiển thị trạng thái mặt Rubik
 * Dùng để minh hoạ từng sub-step trong giáo trình Roux
 *
 * Layout: Unfolded net dạng cross
 *         [  U  ]
 *    [L]  [  F  ]  [R]  [B]
 *         [  D  ]
 *
 * Mỗi cell là một hình chữ nhật SVG màu sắc theo CUBE_PALETTE.
 * Cells trong `highlightCells` sẽ được tô sáng bằng vòng viền vàng.
 * Cells trong `dimCells` sẽ bị làm mờ (opacity thấp).
 */
import React from 'react';
import { CUBE_PALETTE } from '../../types';

// Màu khi ô chưa xác định (không quan tâm / ẩn)
const UNKNOWN_COLOR = '#c8c2b8';
const CELL_SIZE = 13; // px mỗi ô
const GAP = 1;        // px khoảng cách giữa ô
const STEP = CELL_SIZE + GAP;

export type FaceColors = [string, string, string, string, string, string, string, string, string]; // 9 ô theo thứ tự hàng trên->dưới, trái->phải

export interface CubeDiagramConfig {
  /** Màu 9 ô mỗi mặt theo FaceColors. Có thể bỏ qua mặt nào đó (sẽ hiện xám) */
  U?: FaceColors;
  D?: FaceColors;
  F?: FaceColors;
  B?: FaceColors;
  R?: FaceColors;
  L?: FaceColors;
  /** Các ô cần highlight (tô viền vàng sáng) — dạng "FACE-ROW-COL" e.g. "U-0-0" */
  highlightCells?: string[];
  /** Các mặt cần hiển thị đậm hơn (các mặt khác sẽ mờ hơn) */
  focusFaces?: Array<'U' | 'D' | 'F' | 'B' | 'R' | 'L'>;
}

interface FaceGridProps {
  face: string;
  colors: FaceColors | undefined;
  offsetX: number;
  offsetY: number;
  highlightCells: string[];
  focusFaces: string[];
}

const DEFAULT_FACE: FaceColors = [
  UNKNOWN_COLOR, UNKNOWN_COLOR, UNKNOWN_COLOR,
  UNKNOWN_COLOR, UNKNOWN_COLOR, UNKNOWN_COLOR,
  UNKNOWN_COLOR, UNKNOWN_COLOR, UNKNOWN_COLOR,
];

// Màu trung tâm mặc định của mỗi mặt (center sticker không thay đổi)
const CENTER_COLOR: Record<string, string> = {
  U: CUBE_PALETTE.U,
  D: CUBE_PALETTE.D,
  F: CUBE_PALETTE.F,
  B: CUBE_PALETTE.B,
  R: CUBE_PALETTE.R,
  L: CUBE_PALETTE.L,
};

function FaceGrid({ face, colors, offsetX, offsetY, highlightCells, focusFaces }: FaceGridProps) {
  const cells = colors ?? DEFAULT_FACE;
  const isFocused = focusFaces.length === 0 || focusFaces.includes(face);
  const faceOpacity = isFocused ? 1 : 0.35;

  return (
    <g opacity={faceOpacity}>
      {cells.map((rawColor, idx) => {
        const row = Math.floor(idx / 3);
        const col = idx % 3;
        const x = offsetX + col * STEP;
        const y = offsetY + row * STEP;
        const isCenter = idx === 4;
        // Center sticker luôn dùng màu chuẩn
        const fillColor = isCenter ? (CENTER_COLOR[face] ?? rawColor) : rawColor;
        const cellKey = `${face}-${row}-${col}`;
        const isHighlighted = highlightCells.includes(cellKey);

        return (
          <g key={cellKey}>
            <rect
              x={x}
              y={y}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={2}
              fill={fillColor}
              stroke={isHighlighted ? '#f5c842' : 'rgba(0,0,0,0.18)'}
              strokeWidth={isHighlighted ? 2 : 0.75}
            />
            {/* Highlight glow overlay */}
            {isHighlighted && (
              <rect
                x={x + 1}
                y={y + 1}
                width={CELL_SIZE - 2}
                height={CELL_SIZE - 2}
                rx={1.5}
                fill="#fef08a"
                opacity={0.28}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

export const CubeDiagram2D: React.FC<CubeDiagramConfig> = ({
  U, D, F, B, R, L,
  highlightCells = [],
  focusFaces = [],
}) => {
  // Layout cross:
  //       U (col 1, row 0)
  //  L F R B  (col 0-3, row 1)
  //       D (col 1, row 2)
  const FACE_W = 3 * STEP - GAP; // width của 1 mặt 3x3
  const totalW = 4 * (FACE_W + GAP) + GAP;
  const totalH = 3 * (FACE_W + GAP) + GAP;

  const faceX = (col: number) => GAP + col * (FACE_W + GAP);
  const faceY = (row: number) => GAP + row * (FACE_W + GAP);

  return (
    <svg
      width={totalW}
      height={totalH}
      viewBox={`0 0 ${totalW} ${totalH}`}
      className="rounded-lg overflow-hidden"
      style={{ imageRendering: 'crisp-edges' }}
    >
      {/* Nền */}
      <rect width={totalW} height={totalH} rx={5} fill="#e8e0d4" />

      {/* U — hàng 0, cột 1 */}
      <FaceGrid face="U" colors={U} offsetX={faceX(1)} offsetY={faceY(0)} highlightCells={highlightCells} focusFaces={focusFaces} />
      {/* L — hàng 1, cột 0 */}
      <FaceGrid face="L" colors={L} offsetX={faceX(0)} offsetY={faceY(1)} highlightCells={highlightCells} focusFaces={focusFaces} />
      {/* F — hàng 1, cột 1 */}
      <FaceGrid face="F" colors={F} offsetX={faceX(1)} offsetY={faceY(1)} highlightCells={highlightCells} focusFaces={focusFaces} />
      {/* R — hàng 1, cột 2 */}
      <FaceGrid face="R" colors={R} offsetX={faceX(2)} offsetY={faceY(1)} highlightCells={highlightCells} focusFaces={focusFaces} />
      {/* B — hàng 1, cột 3 */}
      <FaceGrid face="B" colors={B} offsetX={faceX(3)} offsetY={faceY(1)} highlightCells={highlightCells} focusFaces={focusFaces} />
      {/* D — hàng 2, cột 1 */}
      <FaceGrid face="D" colors={D} offsetX={faceX(1)} offsetY={faceY(2)} highlightCells={highlightCells} focusFaces={focusFaces} />

      {/* Face labels nhỏ ở góc trên-trái mỗi mặt */}
      {(['U', 'L', 'F', 'R', 'B', 'D'] as const).map((face) => {
        const positions: Record<string, [number, number]> = {
          U: [faceX(1) + 1.5, faceY(0) + 7],
          L: [faceX(0) + 1.5, faceY(1) + 7],
          F: [faceX(1) + 1.5, faceY(1) + 7],
          R: [faceX(2) + 1.5, faceY(1) + 7],
          B: [faceX(3) + 1.5, faceY(1) + 7],
          D: [faceX(1) + 1.5, faceY(2) + 7],
        };
        const isFocused = focusFaces.length === 0 || focusFaces.includes(face);
        return (
          <text
            key={face}
            x={positions[face][0]}
            y={positions[face][1]}
            fontSize={7}
            fontWeight="bold"
            fill="rgba(0,0,0,0.45)"
            opacity={isFocused ? 1 : 0.3}
          >
            {face}
          </text>
        );
      })}
    </svg>
  );
};
