/**
 * ReferenceDiagrams.tsx
 * Bộ linh kiện SVG trực quan cho:
 * 1. CMLLDiagram: Sơ đồ 4 góc mặt U và 4 viền xung quanh chuẩn Speedcubing cho 45 CMLL.
 * 2. EODiagram: Sơ đồ tầng U (4 cạnh) và tầng D (2 cạnh) phân biệt rõ Bad Edge vs Good Edge cho 11 thế EO.
 * 3. L4EDiagram: Sơ đồ trực quan cho các thế cột M (D-Dots, Ub, Ua, H-Perm, Z-Perm).
 * 4. ULURDiagram: Sơ đồ xác định 2 cạnh cánh UL và UR.
 */

import React, { useMemo } from 'react';
import { CUBE_PALETTE } from '../../types';
import {
  createSolvedCube,
  applyAlgorithm,
  FACELETS,
  COLOR_ID_TO_HEX,
  type ColorId,
} from '../../engine/solver/cubeState';
import { parseAlgorithm } from '../../engine/moveParser';
import { invertMove } from '../../engine/tutorHelper';

// Cache để không phải tính lại các thế cờ CMLL nhiều lần
const cmllVisualCache: Record<
  string,
  {
    u_bl: string;
    u_br: string;
    u_fl: string;
    u_fr: string;
    b_l: string;
    b_r: string;
    f_l: string;
    f_r: string;
    l_b: string;
    l_f: string;
    r_b: string;
    r_f: string;
  }
> = {};

function getCMLLVisualStickers(alg: string) {
  if (cmllVisualCache[alg]) return cmllVisualCache[alg];

  try {
    const cube = createSolvedCube();
    const moves = parseAlgorithm(alg);
    const setupMoves = [...moves].reverse().map((m) => invertMove(m.raw)).join(' ');
    const st = applyAlgorithm(cube, setupMoves);

    const getColor = (idx: number) => COLOR_ID_TO_HEX[st[idx] as ColorId] || CUBE_PALETTE.CORE;

    const data = {
      u_bl: getColor(FACELETS.U_BL),
      u_br: getColor(FACELETS.U_BR),
      u_fl: getColor(FACELETS.U_FL),
      u_fr: getColor(FACELETS.U_FR),
      b_l: getColor(FACELETS.B_UL),
      b_r: getColor(FACELETS.B_UR),
      f_l: getColor(FACELETS.F_UL),
      f_r: getColor(FACELETS.F_UR),
      l_b: getColor(FACELETS.L_UB),
      l_f: getColor(FACELETS.L_UF),
      r_b: getColor(FACELETS.R_UB),
      r_f: getColor(FACELETS.R_UF),
    };

    cmllVisualCache[alg] = data;
    return data;
  } catch {
    // Fallback nếu có lỗi parse
    const fallback = {
      u_bl: CUBE_PALETTE.U,
      u_br: CUBE_PALETTE.U,
      u_fl: CUBE_PALETTE.U,
      u_fr: CUBE_PALETTE.U,
      b_l: CUBE_PALETTE.B,
      b_r: CUBE_PALETTE.B,
      f_l: CUBE_PALETTE.F,
      f_r: CUBE_PALETTE.F,
      l_b: CUBE_PALETTE.L,
      l_f: CUBE_PALETTE.L,
      r_b: CUBE_PALETTE.R,
      r_f: CUBE_PALETTE.R,
    };
    return fallback;
  }
}

/**
 * 1. CMLLDiagram: Hiển thị mặt trên U kèm 4 viền màu của 4 góc
 * Chuẩn đồ hoạ SpeedcubeDB / RouxMethodVN
 */
interface CMLLDiagramProps {
  alg: string;
  size?: number;
}

export const CMLLDiagram: React.FC<CMLLDiagramProps> = ({ alg, size = 64 }) => {
  const stickers = useMemo(() => getCMLLVisualStickers(alg), [alg]);

  // Kích thước vẽ SVG chuẩn toạ độ 100x100
  const borderThick = 9;  // Độ dày thanh viền ngoài
  const gridOffset = 16;  // Vị trí bắt đầu của ô 3x3
  const cellSize = 21;    // Kích thước mỗi ô trong 3x3
  const gap = 2;          // Khoảng cách giữa các ô
  const step = cellSize + gap;

  const UNUSED_EDGE = '#4a443e'; // Cạnh xám than (không xét trong CMLL)
  const CENTER_COLOR = CUBE_PALETTE.U; // Tâm Vàng

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="shrink-0 drop-shadow-2xs select-none"
    >
      {/* Nền khung */}
      <rect x="0" y="0" width="100" height="100" rx="10" fill="#1f1a17" />

      {/* ── 1. CÁC VIỀN XUNG QUANH (BORDERS CỦA 4 GÓC) ── */}
      {/* Viền B (Phía sau - Trên): B_UL (trái) và B_UR (phải) */}
      <rect x={gridOffset} y="3" width={cellSize} height={borderThick} rx="2" fill={stickers.b_l} stroke="#14110f" strokeWidth="1" />
      <rect x={gridOffset + step * 2} y="3" width={cellSize} height={borderThick} rx="2" fill={stickers.b_r} stroke="#14110f" strokeWidth="1" />

      {/* Viền F (Phía trước - Dưới): F_UL (trái) và F_UR (phải) */}
      <rect x={gridOffset} y={100 - borderThick - 3} width={cellSize} height={borderThick} rx="2" fill={stickers.f_l} stroke="#14110f" strokeWidth="1" />
      <rect x={gridOffset + step * 2} y={100 - borderThick - 3} width={cellSize} height={borderThick} rx="2" fill={stickers.f_r} stroke="#14110f" strokeWidth="1" />

      {/* Viền L (Bên trái): L_UB (trên) và L_UF (dưới) */}
      <rect x="3" y={gridOffset} width={borderThick} height={cellSize} rx="2" fill={stickers.l_b} stroke="#14110f" strokeWidth="1" />
      <rect x="3" y={gridOffset + step * 2} width={borderThick} height={cellSize} rx="2" fill={stickers.l_f} stroke="#14110f" strokeWidth="1" />

      {/* Viền R (Bên phải): R_UB (trên) và R_UF (dưới) */}
      <rect x={100 - borderThick - 3} y={gridOffset} width={borderThick} height={cellSize} rx="2" fill={stickers.r_b} stroke="#14110f" strokeWidth="1" />
      <rect x={100 - borderThick - 3} y={gridOffset + step * 2} width={borderThick} height={cellSize} rx="2" fill={stickers.r_f} stroke="#14110f" strokeWidth="1" />

      {/* ── 2. MẶT TRÊN U (3x3 GRID Ở GIỮA) ── */}
      {/* Hàng 0: U_BL (góc), U_B (cạnh), U_BR (góc) */}
      <rect x={gridOffset} y={gridOffset} width={cellSize} height={cellSize} rx="3" fill={stickers.u_bl} stroke="#14110f" strokeWidth="1" />
      <rect x={gridOffset + step} y={gridOffset} width={cellSize} height={cellSize} rx="3" fill={UNUSED_EDGE} />
      <rect x={gridOffset + step * 2} y={gridOffset} width={cellSize} height={cellSize} rx="3" fill={stickers.u_br} stroke="#14110f" strokeWidth="1" />

      {/* Hàng 1: U_L (cạnh), U_C (tâm vàng), U_R (cạnh) */}
      <rect x={gridOffset} y={gridOffset + step} width={cellSize} height={cellSize} rx="3" fill={UNUSED_EDGE} />
      <rect x={gridOffset + step} y={gridOffset + step} width={cellSize} height={cellSize} rx="3" fill={CENTER_COLOR} />
      <rect x={gridOffset + step * 2} y={gridOffset + step} width={cellSize} height={cellSize} rx="3" fill={UNUSED_EDGE} />

      {/* Hàng 2: U_FL (góc), U_F (cạnh), U_FR (góc) */}
      <rect x={gridOffset} y={gridOffset + step * 2} width={cellSize} height={cellSize} rx="3" fill={stickers.u_fl} stroke="#14110f" strokeWidth="1" />
      <rect x={gridOffset + step} y={gridOffset + step * 2} width={cellSize} height={cellSize} rx="3" fill={UNUSED_EDGE} />
      <rect x={gridOffset + step * 2} y={gridOffset + step * 2} width={cellSize} height={cellSize} rx="3" fill={stickers.u_fr} stroke="#14110f" strokeWidth="1" />
    </svg>
  );
};

/**
 * 2. EODiagram: Hiển thị trạng thái Bad Edge vs Good Edge ở cả tầng U và tầng D
 */
interface EODiagramProps {
  diagramU: ('B' | 'G')[]; // [UB, UR, UF, UL]
  diagramD: ('B' | 'G')[]; // [DB, DF]
}

export const EODiagram: React.FC<EODiagramProps> = ({ diagramU, diagramD }) => {
  const [ub, ur, uf, ul] = diagramU;
  const [db, df] = diagramD;

  const BAD_COLOR = '#e07a5f';      // Cam đỏ cảnh báo cạnh sai
  const GOOD_U_COLOR = '#e5a922';   // Vàng nghệ (Cạnh tốt trên U)
  const GOOD_D_COLOR = '#dfdcce';   // Trắng giấy (Cạnh tốt trên D)
  const CORNER_DIM = '#524b43';     // Góc xám mờ

  return (
    <div className="flex items-center gap-3 p-2 bg-[#1f1a17] rounded-xl shrink-0 shadow-xs border border-[#38312a]">
      {/* Sơ đồ Tầng U (Nhìn từ trên xuống) */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-bold text-[#b5a695] mb-1 uppercase tracking-wider">
          Tầng Trên (U)
        </span>
        <svg width="56" height="56" viewBox="0 0 56 56" className="drop-shadow-2xs">
          {/* Nền khung U */}
          <rect width="56" height="56" rx="6" fill="#14110f" />

          {/* 4 Góc mờ */}
          <rect x="2" y="2" width="15" height="15" rx="2" fill={CORNER_DIM} />
          <rect x="39" y="2" width="15" height="15" rx="2" fill={CORNER_DIM} />
          <rect x="2" y="39" width="15" height="15" rx="2" fill={CORNER_DIM} />
          <rect x="39" y="39" width="15" height="15" rx="2" fill={CORNER_DIM} />

          {/* Tâm U */}
          <rect x="20.5" y="20.5" width="15" height="15" rx="2" fill={CUBE_PALETTE.U} />

          {/* Cạnh UB (Bắc - Trên) */}
          <rect
            x="20.5"
            y="2"
            width="15"
            height="15"
            rx="2"
            fill={ub === 'B' ? BAD_COLOR : GOOD_U_COLOR}
            stroke={ub === 'B' ? '#ff3b30' : 'none'}
            strokeWidth={ub === 'B' ? '1.5' : '0'}
          />
          {ub === 'B' && <line x1="23" y1="4.5" x2="33" y2="14.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />}

          {/* Cạnh UR (Đông - Phải) */}
          <rect
            x="39"
            y="20.5"
            width="15"
            height="15"
            rx="2"
            fill={ur === 'B' ? BAD_COLOR : GOOD_U_COLOR}
            stroke={ur === 'B' ? '#ff3b30' : 'none'}
            strokeWidth={ur === 'B' ? '1.5' : '0'}
          />
          {ur === 'B' && <line x1="41.5" y1="23" x2="51.5" y2="33" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />}

          {/* Cạnh UF (Nam - Dưới) */}
          <rect
            x="20.5"
            y="39"
            width="15"
            height="15"
            rx="2"
            fill={uf === 'B' ? BAD_COLOR : GOOD_U_COLOR}
            stroke={uf === 'B' ? '#ff3b30' : 'none'}
            strokeWidth={uf === 'B' ? '1.5' : '0'}
          />
          {uf === 'B' && <line x1="23" y1="41.5" x2="33" y2="51.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />}

          {/* Cạnh UL (Tây - Trái) */}
          <rect
            x="2"
            y="20.5"
            width="15"
            height="15"
            rx="2"
            fill={ul === 'B' ? BAD_COLOR : GOOD_U_COLOR}
            stroke={ul === 'B' ? '#ff3b30' : 'none'}
            strokeWidth={ul === 'B' ? '1.5' : '0'}
          />
          {ul === 'B' && <line x1="4.5" y1="23" x2="14.5" y2="33" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />}
        </svg>
      </div>

      {/* Vạch ngăn cách */}
      <div className="h-10 w-px bg-[#3d362e]" />

      {/* Sơ đồ Tầng D (Cột giữa DB và DF) */}
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-bold text-[#b5a695] mb-1 uppercase tracking-wider">
          Tầng Đáy (D)
        </span>
        <svg width="24" height="56" viewBox="0 0 24 56" className="drop-shadow-2xs">
          {/* Nền khung D */}
          <rect width="24" height="56" rx="5" fill="#14110f" />

          {/* Cạnh DB (Phía sau - Trên) */}
          <rect
            x="4"
            y="4"
            width="16"
            height="14"
            rx="2"
            fill={db === 'B' ? BAD_COLOR : GOOD_D_COLOR}
            stroke={db === 'B' ? '#ff3b30' : 'none'}
            strokeWidth={db === 'B' ? '1.5' : '0'}
          />
          {db === 'B' && <line x1="6" y1="6" x2="18" y2="16" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />}

          {/* Tâm D ở giữa */}
          <rect x="4" y="21" width="16" height="14" rx="2" fill={CUBE_PALETTE.D} />
          <circle cx="12" cy="28" r="2.5" fill="#a8a092" />

          {/* Cạnh DF (Phía trước - Dưới) */}
          <rect
            x="4"
            y="38"
            width="16"
            height="14"
            rx="2"
            fill={df === 'B' ? BAD_COLOR : GOOD_D_COLOR}
            stroke={df === 'B' ? '#ff3b30' : 'none'}
            strokeWidth={df === 'B' ? '1.5' : '0'}
          />
          {df === 'B' && <line x1="6" y1="40" x2="18" y2="50" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />}
        </svg>
      </div>
    </div>
  );
};

/**
 * 3. L4EDiagram: Minh hoạ chu trình cột M (D-Dots, Ub, Ua, H-Perm, Z-Perm & 16 thế tối ưu L4E)
 */
interface L4EDiagramProps {
  caseId: string;
}

export const L4EDiagram: React.FC<L4EDiagramProps> = ({ caseId }) => {
  const isUb = caseId === 'ub_perm' || caseId === 'l4e_ub';
  const isUa = caseId === 'ua_perm' || caseId === 'l4e_ua';
  const isH = caseId === 'h_perm' || caseId === 'l4e_h';
  const isZ = caseId === 'z_perm' || caseId === 'l4e_z';
  const isDotsBase = caseId === 'd_dots' || caseId === 'l4e_dots_base';
  const isDotsDiag = caseId === 'l4e_dots_diag';
  const isDotsLine = caseId === 'l4e_dots_line';

  // Nhóm 1: 1 Cạnh trắng ở U (tâm U vàng)
  const isGroup1 = caseId.startsWith('l4e_1_');
  // Nhóm 2: 1 Cạnh trắng + Tâm U trắng (tâm U trắng)
  const isGroup2 = caseId.startsWith('l4e_2_');

  // Xác định vị trí cạnh trắng ở U (UF hay UB) cho Nhóm 1 và Nhóm 2
  const whiteAtUF = ['l4e_1_1', 'l4e_1_2', 'l4e_1_5', 'l4e_1_6', 'l4e_2_1', 'l4e_2_2', 'l4e_2_3', 'l4e_2_4'].includes(caseId);

  return (
    <div className="w-14 h-14 p-1 bg-[#1f1a17] rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-[#38312a]">
      {isDotsBase && (
        <svg width="46" height="46" viewBox="0 0 46 46">
          <rect width="46" height="46" rx="6" fill="#14110f" />
          <rect x="15" y="3" width="16" height="11" rx="2" fill={CUBE_PALETTE.D} />
          <rect x="15" y="32" width="16" height="11" rx="2" fill={CUBE_PALETTE.D} />
          <rect x="15" y="17" width="16" height="12" rx="2" fill={CUBE_PALETTE.U} stroke="#ff3b30" strokeWidth="1.5" />
          <circle cx="23" cy="23" r="3" fill="#ff3b30" />
        </svg>
      )}

      {isUb && (
        <svg width="46" height="46" viewBox="0 0 46 46">
          <rect width="46" height="46" rx="6" fill="#14110f" />
          <circle cx="23" cy="8" r="4.5" fill={CUBE_PALETTE.F} />
          <circle cx="8" cy="36" r="4.5" fill={CUBE_PALETTE.B} />
          <circle cx="38" cy="36" r="4.5" fill={CUBE_PALETTE.D} />
          <path d="M 23 15 L 34 31 M 33 36 L 13 36 M 12 31 L 23 15" stroke="#e07a5f" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" fill="none" />
          <polygon points="23,12 20,17 26,17" fill="#e07a5f" />
        </svg>
      )}

      {isUa && (
        <svg width="46" height="46" viewBox="0 0 46 46">
          <rect width="46" height="46" rx="6" fill="#14110f" />
          <circle cx="23" cy="8" r="4.5" fill={CUBE_PALETTE.F} />
          <circle cx="8" cy="36" r="4.5" fill={CUBE_PALETTE.D} />
          <circle cx="38" cy="36" r="4.5" fill={CUBE_PALETTE.B} />
          <path d="M 23 15 L 12 31 M 13 36 L 33 36 M 34 31 L 23 15" stroke="#2a9d8f" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" fill="none" />
          <polygon points="23,12 26,17 20,17" fill="#2a9d8f" />
        </svg>
      )}

      {isH && (
        <svg width="46" height="46" viewBox="0 0 46 46">
          <rect width="46" height="46" rx="6" fill="#14110f" />
          <circle cx="23" cy="7" r="4" fill={CUBE_PALETTE.F} />
          <circle cx="23" cy="39" r="4" fill={CUBE_PALETTE.B} />
          <circle cx="7" cy="23" r="4" fill={CUBE_PALETTE.U} />
          <circle cx="39" cy="23" r="4" fill={CUBE_PALETTE.D} />
          <line x1="23" y1="13" x2="23" y2="33" stroke="#e07a5f" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="13" y1="23" x2="33" y2="23" stroke="#2a9d8f" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}

      {isZ && (
        <svg width="46" height="46" viewBox="0 0 46 46">
          <rect width="46" height="46" rx="6" fill="#14110f" />
          <circle cx="10" cy="10" r="4" fill={CUBE_PALETTE.F} />
          <circle cx="36" cy="10" r="4" fill={CUBE_PALETTE.D} />
          <circle cx="10" cy="36" r="4" fill={CUBE_PALETTE.B} />
          <circle cx="36" cy="36" r="4.5" fill={CUBE_PALETTE.U} />
          <line x1="13" y1="13" x2="33" y2="33" stroke="#e76f51" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />
          <line x1="33" y1="13" x2="13" y2="33" stroke="#e76f51" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />
        </svg>
      )}

      {isDotsDiag && (
        <svg width="46" height="46" viewBox="0 0 46 46">
          <rect width="46" height="46" rx="6" fill="#14110f" />
          <circle cx="12" cy="12" r="4.5" fill={CUBE_PALETTE.D} />
          <circle cx="34" cy="34" r="4.5" fill={CUBE_PALETTE.U} />
          <circle cx="34" cy="12" r="4.5" fill={CUBE_PALETTE.U} />
          <circle cx="12" cy="34" r="4.5" fill={CUBE_PALETTE.D} />
          <line x1="16" y1="16" x2="30" y2="30" stroke="#e07a5f" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
          <line x1="30" y1="16" x2="16" y2="30" stroke="#2a9d8f" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
        </svg>
      )}

      {isDotsLine && (
        <svg width="46" height="46" viewBox="0 0 46 46">
          <rect width="46" height="46" rx="6" fill="#14110f" />
          <rect x="15" y="4" width="16" height="10" rx="2" fill={CUBE_PALETTE.U} stroke="#ff3b30" strokeWidth="1" />
          <rect x="15" y="18" width="16" height="10" rx="2" fill={CUBE_PALETTE.D} stroke="#ff3b30" strokeWidth="1" />
          <rect x="15" y="32" width="16" height="10" rx="2" fill={CUBE_PALETTE.U} stroke="#ff3b30" strokeWidth="1" />
          <line x1="23" y1="14" x2="23" y2="18" stroke="#ff3b30" strokeWidth="2" />
          <line x1="23" y1="28" x2="23" y2="32" stroke="#ff3b30" strokeWidth="2" />
        </svg>
      )}

      {(isGroup1 || isGroup2) && (
        <svg width="46" height="46" viewBox="0 0 46 46">
          <rect width="46" height="46" rx="6" fill="#14110f" />
          {/* Cột M tầng U: UB (trên), Tâm U (giữa), UF (dưới) */}
          <rect
            x="14"
            y="4"
            width="18"
            height="10"
            rx="2"
            fill={!whiteAtUF ? CUBE_PALETTE.D : (isGroup2 ? CUBE_PALETTE.U : CUBE_PALETTE.U)}
            stroke={!whiteAtUF ? '#ffffff' : 'none'}
            strokeWidth={!whiteAtUF ? '1' : '0'}
          />
          <rect
            x="14"
            y="17"
            width="18"
            height="12"
            rx="2"
            fill={isGroup2 ? CUBE_PALETTE.D : CUBE_PALETTE.U}
            stroke={isGroup2 ? '#ff3b30' : 'none'}
            strokeWidth={isGroup2 ? '1.5' : '0'}
          />
          <rect
            x="14"
            y="32"
            width="18"
            height="10"
            rx="2"
            fill={whiteAtUF ? CUBE_PALETTE.D : (isGroup2 ? CUBE_PALETTE.U : CUBE_PALETTE.U)}
            stroke={whiteAtUF ? '#ffffff' : 'none'}
            strokeWidth={whiteAtUF ? '1' : '0'}
          />
        </svg>
      )}
    </div>
  );
};

interface ULURDiagramProps {
  caseType?: '1_u_1_d' | '2_u' | '2_d' | 'solved_one' | string;
}

export const ULURDiagram: React.FC<ULURDiagramProps> = ({ caseType = '1_u_1_d' }) => {
  return (
    <div className="shrink-0 flex flex-col items-center gap-1 p-1 bg-[#201c18] rounded-xl border border-[#3d362e] shadow-inner select-none">
      <svg width="46" height="46" viewBox="0 0 46 46">
        <rect width="46" height="46" rx="6" fill="#14110f" />

        {/* Khối FB bên trái (L Block - Màu Cam) */}
        <rect x="3" y="3" width="10" height="40" rx="3" fill="#ea580c" opacity="0.8" />
        <text x="8" y="24" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
          L
        </text>

        {/* Khối SB bên phải (R Block - Màu Đỏ) */}
        <rect x="33" y="3" width="10" height="40" rx="3" fill="#dc2626" opacity="0.8" />
        <text x="38" y="24" fill="#ffffff" fontSize="7" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
          R
        </text>

        {/* Tâm U (Vàng) */}
        <rect x="17" y="17" width="12" height="12" rx="2" fill={CUBE_PALETTE.U} opacity="0.9" />

        {/* Cột M (UB ở trên, UF ở dưới) */}
        {caseType === '1_u_1_d' && (
          <>
            {/* 1 cạnh ở U (UF ở dưới) */}
            <rect x="16" y="32" width="14" height="10" rx="2" fill={CUBE_PALETTE.U} stroke="#38bdf8" strokeWidth="1.5" />
            {/* 1 cạnh ở D (DB ở trên) - vẽ chấm nét đứt */}
            <rect x="16" y="4" width="14" height="10" rx="2" fill="#292524" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
            <text x="23" y="9" fill="#f59e0b" fontSize="6" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
              D
            </text>
          </>
        )}

        {caseType === '2_u' && (
          <>
            {/* Cả 2 cạnh đều ở U (UB và UF sáng màu) */}
            <rect x="16" y="4" width="14" height="10" rx="2" fill={CUBE_PALETTE.U} stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="16" y="32" width="14" height="10" rx="2" fill={CUBE_PALETTE.U} stroke="#38bdf8" strokeWidth="1.5" />
          </>
        )}

        {caseType === '2_d' && (
          <>
            {/* Cả 2 cạnh đều ở đáy D (DF và DB nét đứt D) */}
            <rect x="16" y="4" width="14" height="10" rx="2" fill="#292524" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
            <text x="23" y="9" fill="#10b981" fontSize="6" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
              D
            </text>
            <rect x="16" y="32" width="14" height="10" rx="2" fill="#292524" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
            <text x="23" y="37" fill="#10b981" fontSize="6" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
              D
            </text>
          </>
        )}

        {caseType === 'solved_one' && (
          <>
            {/* UL đã giải (nằm ở cánh L) */}
            <rect x="10" y="17" width="5" height="12" rx="1" fill={CUBE_PALETTE.U} stroke="#10b981" strokeWidth="1" />
            {/* UR đang ở đáy DF */}
            <rect x="16" y="32" width="14" height="10" rx="2" fill="#292524" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
            <text x="23" y="37" fill="#f59e0b" fontSize="6" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
              D
            </text>
          </>
        )}
      </svg>
      <span className="text-[9px] font-mono font-bold text-[#b8a99a]">
        {caseType === '1_u_1_d' ? '1U / 1D' : caseType === '2_u' ? '2 Ở U' : caseType === '2_d' ? '2 Ở D' : '1 Ở CÁNH'}
      </span>
    </div>
  );
};

interface L4EIntuitiveDiagramProps {
  stage: 'white_to_bottom' | 'fix_center_dots' | 'permute_top';
}

export const L4EIntuitiveDiagram: React.FC<L4EIntuitiveDiagramProps> = ({ stage }) => {
  return (
    <div className="shrink-0 flex flex-col items-center gap-1 p-1 bg-[#201c18] rounded-xl border border-[#3d362e] shadow-inner select-none">
      <svg width="60" height="60" viewBox="0 0 60 60">
        <rect width="60" height="60" rx="6" fill="#14110f" />

        {/* Khung mặt cắt cột M: Phần U (trên) và phần D (dưới) */}
        {/* TẦNG U (Mặt Vàng ở trên) */}
        <text x="5" y="14" fill="#a8a29e" fontSize="7" fontWeight="bold">U</text>
        <rect x="15" y="6" width="12" height="14" rx="2" fill={stage === 'white_to_bottom' ? '#ffffff' : (stage === 'fix_center_dots' ? '#ffffff' : '#10b981')} stroke={stage === 'white_to_bottom' ? '#38bdf8' : 'none'} strokeWidth="1" />
        <rect x="29" y="6" width="14" height="14" rx="2" fill={stage === 'fix_center_dots' ? '#ffffff' : CUBE_PALETTE.U} />
        <rect x="45" y="6" width="12" height="14" rx="2" fill={stage === 'white_to_bottom' ? '#ffffff' : (stage === 'fix_center_dots' ? CUBE_PALETTE.U : '#3b82f6')} stroke={stage === 'white_to_bottom' ? '#38bdf8' : 'none'} strokeWidth="1" />

        {/* Vạch ngăn cách giữa U và D */}
        <line x1="8" y1="29" x2="54" y2="29" stroke="#3d362e" strokeWidth="1" strokeDasharray="2 2" />

        {/* TẦNG D (Mặt Trắng ở dưới) */}
        <text x="5" y="47" fill="#a8a29e" fontSize="7" fontWeight="bold">D</text>
        <rect x="15" y="37" width="12" height="14" rx="2" fill="#ffffff" />
        <rect x="29" y="37" width="14" height="14" rx="2" fill={stage === 'fix_center_dots' ? CUBE_PALETTE.U : '#ffffff'} stroke={stage === 'fix_center_dots' ? '#ef4444' : 'none'} strokeWidth="1.5" />
        <rect x="45" y="37" width="12" height="14" rx="2" fill="#ffffff" />

        {/* Mũi tên và chỉ dẫn hành động theo từng giai đoạn */}
        {stage === 'white_to_bottom' && (
          <>
            {/* Mũi tên đẩy 2 viên trắng từ U xuống D */}
            <path d="M 21 21 L 21 35 M 19 32 L 21 35 L 23 32" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 51 21 L 51 35 M 49 32 L 51 35 L 53 32" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {stage === 'fix_center_dots' && (
          <>
            {/* Mũi tên cong hoán vị tâm U và D (M2) */}
            <path d="M 36 21 C 41 26, 41 33, 36 36 M 34 33 L 36 36 L 39 34" fill="none" stroke="#e07a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <text x="36" y="28" fill="#e07a5f" fontSize="7" fontWeight="bold" textAnchor="middle">M2</text>
          </>
        )}

        {stage === 'permute_top' && (
          <>
            {/* Mũi tên 2 chiều tráo 2 cạnh UF và UB */}
            <path d="M 26 13 L 44 13 M 28 11 L 26 13 L 28 15 M 42 11 L 44 13 L 42 15" stroke="#e07a5f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="35" y="24" fill="#e07a5f" fontSize="6" fontWeight="bold" textAnchor="middle">M2 U2 M2</text>
          </>
        )}
      </svg>
      <span className="text-[8px] font-mono font-bold text-[#b8a99a] text-center leading-tight">
        {stage === 'white_to_bottom' ? 'GĐ 1: Về Đáy D' : stage === 'fix_center_dots' ? 'GĐ 2: Sửa Dots' : 'GĐ 3: Tráo Đỉnh'}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 5. BlockDiagram: Sơ đồ 3D Isometric cho First Block (FB) và Second Block (SB)
// ─────────────────────────────────────────────────────────────

interface BlockDiagramProps {
  blockType: 'fb' | 'sb';
  targetSlot: 'FL' | 'BL' | 'FR' | 'BR' | 'DL' | 'DR';
  setupAlg: string;
  alg?: string;
  cornerPos?: string;
  edgePos: string;
  size?: number;
}

const EDGE_FACELET_MAP: Record<string, [number, number]> = {
  UF: [FACELETS.U_F, FACELETS.F_U],
  UL: [FACELETS.U_L, FACELETS.L_U],
  UB: [FACELETS.U_B, FACELETS.B_U],
  UR: [FACELETS.U_R, FACELETS.R_U],
  FL: [FACELETS.F_L, FACELETS.L_F],
  FR: [FACELETS.F_R, FACELETS.R_F],
  BL: [FACELETS.B_L, FACELETS.L_B],
  BR: [FACELETS.B_R, FACELETS.R_B],
  DF: [FACELETS.D_F, FACELETS.F_D],
  DL: [FACELETS.D_L, FACELETS.L_D],
  DR: [FACELETS.D_R, FACELETS.R_D],
  DB: [FACELETS.D_B, FACELETS.B_D],
};

const CORNER_FACELET_MAP: Record<string, [number, number, number]> = {
  UFL: [FACELETS.U_FL, FACELETS.F_UL, FACELETS.L_UF],
  UBL: [FACELETS.U_BL, FACELETS.B_UL, FACELETS.L_UB],
  UFR: [FACELETS.U_FR, FACELETS.F_UR, FACELETS.R_UF],
  UBR: [FACELETS.U_BR, FACELETS.B_UR, FACELETS.R_UB],
  DFL: [FACELETS.D_FL, FACELETS.F_DL, FACELETS.L_DF],
  DBL: [FACELETS.D_BL, FACELETS.B_DL, FACELETS.L_DB],
  DFR: [FACELETS.D_FR, FACELETS.F_DR, FACELETS.R_DF],
  DBR: [FACELETS.D_BR, FACELETS.B_DR, FACELETS.R_DB],
};

export const BlockDiagram: React.FC<BlockDiagramProps> = ({
  blockType,
  targetSlot,
  setupAlg,
  cornerPos,
  edgePos,
  size = 96,
}) => {
  const { cubeState, activeIndices, targetSlotIndices, hiddenEdgeStickers } = useMemo(() => {
    const cube = createSolvedCube();
    const st = applyAlgorithm(cube, setupAlg);

    const activeSet = new Set<number>();
    const slotSet = new Set<number>();

    // 1. Phân định các mảnh đang hoạt động (active corner & active edge)
    if (cornerPos && CORNER_FACELET_MAP[cornerPos]) {
      CORNER_FACELET_MAP[cornerPos].forEach((idx) => activeSet.add(idx));
    }
    if (edgePos && EDGE_FACELET_MAP[edgePos]) {
      EDGE_FACELET_MAP[edgePos].forEach((idx) => activeSet.add(idx));
    }

    // 2. Mảnh mỏ neo và phần đã giải của Block
    if (blockType === 'fb') {
      activeSet.add(FACELETS.D_L);
      activeSet.add(FACELETS.L_D);
      activeSet.add(FACELETS.L_C);

      if (targetSlot === 'FL') {
        // Cặp sau đã giải xong
        activeSet.add(FACELETS.D_BL);
        activeSet.add(FACELETS.B_DL);
        activeSet.add(FACELETS.L_DB);
        activeSet.add(FACELETS.B_L);
        activeSet.add(FACELETS.L_B);
        // Target slot là FL
        slotSet.add(FACELETS.F_L);
        slotSet.add(FACELETS.L_F);
        slotSet.add(FACELETS.D_FL);
        slotSet.add(FACELETS.F_DL);
        slotSet.add(FACELETS.L_DF);
      } else if (targetSlot === 'BL') {
        // Cặp trước đã giải xong
        activeSet.add(FACELETS.D_FL);
        activeSet.add(FACELETS.F_DL);
        activeSet.add(FACELETS.L_DF);
        activeSet.add(FACELETS.F_L);
        activeSet.add(FACELETS.L_F);
        // Target slot là BL
        slotSet.add(FACELETS.B_L);
        slotSet.add(FACELETS.L_B);
        slotSet.add(FACELETS.D_BL);
        slotSet.add(FACELETS.B_DL);
        slotSet.add(FACELETS.L_DB);
      } else if (targetSlot === 'DL') {
        slotSet.add(FACELETS.D_L);
        slotSet.add(FACELETS.L_D);
      }
    } else {
      // Second Block (SB):
      // Toàn bộ First Block bên trái (L) đã hoàn thành vững chắc
      [
        FACELETS.L_UB, FACELETS.L_U, FACELETS.L_UF,
        FACELETS.L_B, FACELETS.L_C, FACELETS.L_F,
        FACELETS.L_DB, FACELETS.L_D, FACELETS.L_DF,
        FACELETS.D_BL, FACELETS.D_L, FACELETS.D_FL,
        FACELETS.F_L, FACELETS.F_DL, FACELETS.B_L, FACELETS.B_DL,
      ].forEach((idx) => activeSet.add(idx));

      activeSet.add(FACELETS.D_R);
      activeSet.add(FACELETS.R_D);
      activeSet.add(FACELETS.R_C);

      if (targetSlot === 'FR') {
        activeSet.add(FACELETS.D_BR);
        activeSet.add(FACELETS.B_DR);
        activeSet.add(FACELETS.R_DB);
        activeSet.add(FACELETS.B_R);
        activeSet.add(FACELETS.R_B);
        // Slot FR
        slotSet.add(FACELETS.F_R);
        slotSet.add(FACELETS.R_F);
        slotSet.add(FACELETS.D_FR);
        slotSet.add(FACELETS.F_DR);
        slotSet.add(FACELETS.R_DF);
      } else if (targetSlot === 'BR') {
        activeSet.add(FACELETS.D_FR);
        activeSet.add(FACELETS.F_DR);
        activeSet.add(FACELETS.R_DF);
        activeSet.add(FACELETS.F_R);
        activeSet.add(FACELETS.R_F);
        // Slot BR
        slotSet.add(FACELETS.B_R);
        slotSet.add(FACELETS.R_B);
        slotSet.add(FACELETS.D_BR);
        slotSet.add(FACELETS.B_DR);
        slotSet.add(FACELETS.R_DB);
      } else if (targetSlot === 'DR') {
        slotSet.add(FACELETS.D_R);
        slotSet.add(FACELETS.R_D);
      }
    }

    // 3. Thông tin nhãn hiển thị nếu cạnh bị giấu ở mặt sau/đáy
    let hiddenStickers: { name: string; c1: string; c2: string } | null = null;
    if (['UB', 'DB', 'DF', 'UL', 'DR', 'DL'].includes(edgePos)) {
      const pair = EDGE_FACELET_MAP[edgePos];
      if (pair) {
        hiddenStickers = {
          name: edgePos,
          c1: COLOR_ID_TO_HEX[st[pair[0]] as ColorId] || CUBE_PALETTE.CORE,
          c2: COLOR_ID_TO_HEX[st[pair[1]] as ColorId] || CUBE_PALETTE.CORE,
        };
      }
    }

    return {
      cubeState: st,
      activeIndices: activeSet,
      targetSlotIndices: slotSet,
      hiddenEdgeStickers: hiddenStickers,
    };
  }, [blockType, targetSlot, setupAlg, cornerPos, edgePos]);

  const DIM_COLOR = '#2b2621'; // Màu xám ấm mờ cho các viên không liên quan

  const getColor = (idx: number) => {
    if (!activeIndices.has(idx)) return DIM_COLOR;
    return COLOR_ID_TO_HEX[cubeState[idx] as ColorId] || CUBE_PALETTE.CORE;
  };

  // Cấu hình vẽ Isometric SVG
  // cx, cy là tâm đỉnh của hình chiếu (gặp nhau của 3 mặt)
  const cx = 50;
  const cy = 42;
  const s = 11.5;
  const cos30 = 0.866;
  const sin30 = 0.5;

  // Vector đơn vị
  const vUpLeft = { x: -cos30 * s, y: -sin30 * s };
  const vUpRight = { x: cos30 * s, y: -sin30 * s };
  const vDown = { x: 0, y: s };

  const renderIsometricTile = (
    baseX: number,
    baseY: number,
    v1: { x: number; y: number },
    v2: { x: number; y: number },
    faceletIdx: number,
    key: string
  ) => {
    const p0 = { x: baseX, y: baseY };
    const p1 = { x: baseX + v1.x, y: baseY + v1.y };
    const p2 = { x: baseX + v1.x + v2.x, y: baseY + v1.y + v2.y };
    const p3 = { x: baseX + v2.x, y: baseY + v2.y };
    const pts = `${p0.x.toFixed(1)},${p0.y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)} ${p3.x.toFixed(1)},${p3.y.toFixed(1)}`;

    const fill = getColor(faceletIdx);
    const isSlot = targetSlotIndices.has(faceletIdx);
    const stroke = isSlot ? '#fbbf24' : 'rgba(20,17,15,0.7)';
    const strokeWidth = isSlot ? 1.5 : 0.6;
    const strokeDash = isSlot ? '2,1' : 'none';

    return (
      <polygon
        key={key}
        points={pts}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDash}
      />
    );
  };

  return (
    <div className="shrink-0 flex flex-col items-center gap-1 p-1 bg-[#1a1614] rounded-xl border border-[#38312a] shadow-inner select-none">
      <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-xs">
        <rect width="100" height="100" rx="8" fill="#14110f" />

        {/* 1. MẶT U (TRÊN CÙNG): 3x3 tiles */}
        {/* r=0..2 (gần tới xa theo vUpRight), c=0..2 (trái sang phải theo vUpLeft) */}
        {blockType === 'fb' ? (
          // View FB: Top-Front-Left
          <>
            {/* Tầng U */}
            {[
              [FACELETS.U_FL, FACELETS.U_L, FACELETS.U_BL],
              [FACELETS.U_F, FACELETS.U_C, FACELETS.U_B],
              [FACELETS.U_FR, FACELETS.U_R, FACELETS.U_BR],
            ].map((col, r) =>
              col.map((idx, c) => {
                const bx = cx + r * vUpRight.x + c * vUpLeft.x;
                const by = cy + r * vUpRight.y + c * vUpLeft.y;
                return renderIsometricTile(bx, by, vUpRight, vUpLeft, idx, `u-${r}-${c}`);
              })
            )}

            {/* Mặt L (Bên trái cột giữa) */}
            {[
              [FACELETS.L_UF, FACELETS.L_U, FACELETS.L_UB],
              [FACELETS.L_F, FACELETS.L_C, FACELETS.L_B],
              [FACELETS.L_DF, FACELETS.L_D, FACELETS.L_DB],
            ].map((row, k) =>
              row.map((idx, c) => {
                const bx = cx + c * vUpLeft.x + k * vDown.x;
                const by = cy + c * vUpLeft.y + k * vDown.y;
                return renderIsometricTile(bx, by, vUpLeft, vDown, idx, `l-${k}-${c}`);
              })
            )}

            {/* Mặt F (Bên phải cột giữa) */}
            {[
              [FACELETS.F_UL, FACELETS.F_U, FACELETS.F_UR],
              [FACELETS.F_L, FACELETS.F_C, FACELETS.F_R],
              [FACELETS.F_DL, FACELETS.F_D, FACELETS.F_DR],
            ].map((row, k) =>
              row.map((idx, r) => {
                const bx = cx + r * vUpRight.x + k * vDown.x;
                const by = cy + r * vUpRight.y + k * vDown.y;
                return renderIsometricTile(bx, by, vUpRight, vDown, idx, `f-${k}-${r}`);
              })
            )}

            {/* Dải mặt D (Đáy) dưới chân mặt L: DFL, DL, DBL */}
            <g transform="translate(14, 86)">
              <text x="0" y="8" fill="#8c8278" fontSize="6.5" fontWeight="bold">D</text>
              <rect x="9" y="1" width="8.5" height="8.5" rx="1.5" fill={getColor(FACELETS.D_FL)} stroke="#201c18" strokeWidth="0.5" />
              <rect x="19" y="1" width="8.5" height="8.5" rx="1.5" fill={getColor(FACELETS.D_L)} stroke="#201c18" strokeWidth="0.5" />
              <rect x="29" y="1" width="8.5" height="8.5" rx="1.5" fill={getColor(FACELETS.D_BL)} stroke="#201c18" strokeWidth="0.5" />
            </g>
          </>
        ) : (
          // View SB: Top-Front-Right
          <>
            {/* Tầng U */}
            {[
              [FACELETS.U_FL, FACELETS.U_F, FACELETS.U_FR],
              [FACELETS.U_L, FACELETS.U_C, FACELETS.U_R],
              [FACELETS.U_BL, FACELETS.U_B, FACELETS.U_BR],
            ].map((col, r) =>
              col.map((idx, c) => {
                const bx = cx + r * vUpLeft.x + c * vUpRight.x;
                const by = cy + r * vUpLeft.y + c * vUpRight.y;
                return renderIsometricTile(bx, by, vUpLeft, vUpRight, idx, `u-sb-${r}-${c}`);
              })
            )}

            {/* Mặt F (Bên trái trục giữa của SB) */}
            {[
              [FACELETS.F_UR, FACELETS.F_U, FACELETS.F_UL],
              [FACELETS.F_R, FACELETS.F_C, FACELETS.F_L],
              [FACELETS.F_DR, FACELETS.F_D, FACELETS.F_DL],
            ].map((row, k) =>
              row.map((idx, c) => {
                const bx = cx + c * vUpLeft.x + k * vDown.x;
                const by = cy + c * vUpLeft.y + k * vDown.y;
                return renderIsometricTile(bx, by, vUpLeft, vDown, idx, `f-sb-${k}-${c}`);
              })
            )}

            {/* Mặt R (Bên phải trục giữa của SB) */}
            {[
              [FACELETS.R_UF, FACELETS.R_U, FACELETS.R_UB],
              [FACELETS.R_F, FACELETS.R_C, FACELETS.R_B],
              [FACELETS.R_DF, FACELETS.R_D, FACELETS.R_DB],
            ].map((row, k) =>
              row.map((idx, r) => {
                const bx = cx + r * vUpRight.x + k * vDown.x;
                const by = cy + r * vUpRight.y + k * vDown.y;
                return renderIsometricTile(bx, by, vUpRight, vDown, idx, `r-sb-${k}-${r}`);
              })
            )}

            {/* Dải mặt D (Đáy) dưới chân mặt R: DFR, DR, DBR */}
            <g transform="translate(54, 86)">
              <text x="0" y="8" fill="#8c8278" fontSize="6.5" fontWeight="bold">D</text>
              <rect x="9" y="1" width="8.5" height="8.5" rx="1.5" fill={getColor(FACELETS.D_FR)} stroke="#201c18" strokeWidth="0.5" />
              <rect x="19" y="1" width="8.5" height="8.5" rx="1.5" fill={getColor(FACELETS.D_R)} stroke="#201c18" strokeWidth="0.5" />
              <rect x="29" y="1" width="8.5" height="8.5" rx="1.5" fill={getColor(FACELETS.D_BR)} stroke="#201c18" strokeWidth="0.5" />
            </g>
          </>
        )}

        {/* Nhãn góc/cạnh chỉ dẫn trên ảnh */}
        <text x="5" y="11" fill="#e0d5c1" fontSize="7" fontWeight="bold" fontFamily="monospace">
          {blockType === 'fb' ? 'FB (L)' : 'SB (R)'}
        </text>
      </svg>

      {/* Pill nhãn hiển thị vị trí cạnh & 2 màu nếu ở vị trí ẩn */}
      {hiddenEdgeStickers && (
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#25201b] rounded border border-[#3d362e] text-[8px] text-[#e8dfcf]">
          <span className="font-semibold">{hiddenEdgeStickers.name}:</span>
          <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: hiddenEdgeStickers.c1 }} />
          <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: hiddenEdgeStickers.c2 }} />
        </div>
      )}
    </div>
  );
};



