/**
 * OrientationLegend — Legend cố định hiển thị quy ước màu → tên mặt Rubik
 * Giúp người dùng biết mặt nào là F/B/R/L/U/D khi nhìn vào khối 3D
 */
import React, { useState } from 'react';
import { CUBE_PALETTE } from '../../types';
import { ChevronDown, ChevronUp, Compass } from 'lucide-react';

interface FaceEntry {
  face: string;
  label: string;
  color: string;
  hint: string;
}

const FACE_ENTRIES: FaceEntry[] = [
  { face: 'U', label: 'U — Trên',  color: CUBE_PALETTE.U, hint: 'Up (Vàng)' },
  { face: 'D', label: 'D — Dưới', color: CUBE_PALETTE.D, hint: 'Down (Trắng)' },
  { face: 'F', label: 'F — Trước', color: CUBE_PALETTE.F, hint: 'Front (Xanh lá)' },
  { face: 'B', label: 'B — Sau',  color: CUBE_PALETTE.B, hint: 'Back (Xanh lam)' },
  { face: 'L', label: 'L — Trái', color: CUBE_PALETTE.L, hint: 'Left (Đỏ)' },
  { face: 'R', label: 'R — Phải', color: CUBE_PALETTE.R, hint: 'Right (Cam)' },
];

export const OrientationLegend: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute left-3 bottom-[max(4.5rem,calc(env(safe-area-inset-bottom,0.75rem)+3.75rem))] z-20 pointer-events-auto select-none">
      <div
        className={`bg-white/85 backdrop-blur-md rounded-2xl border border-[#e8dfcf] shadow-md overflow-hidden transition-all duration-200 ${
          isExpanded ? 'w-40' : 'w-auto'
        }`}
      >
        {/* Toggle header */}
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-[#5c4f43] hover:bg-[#faf6ee] transition-colors cursor-pointer"
          title="Quy ước màu mặt Rubik"
        >
          <Compass className="w-3.5 h-3.5 text-[#e07a5f] shrink-0" />
          <span className="shrink-0">Quy ước mặt</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-[#a89b8d] ml-auto" />
          ) : (
            <ChevronDown className="w-3 h-3 text-[#a89b8d] ml-auto" />
          )}
        </button>

        {/* Face list */}
        {isExpanded && (
          <div className="px-2.5 pb-2.5 flex flex-col gap-1 border-t border-[#f0e8db]">
            {FACE_ENTRIES.map(({ face, label, color, hint }) => (
              <div
                key={face}
                className="flex items-center gap-2"
                title={hint}
              >
                {/* Color swatch */}
                <span
                  className="w-4 h-4 rounded-md shrink-0 border border-black/10 shadow-inner"
                  style={{ backgroundColor: color }}
                />
                {/* Label */}
                <span className="text-[11px] font-semibold text-[#2c221e] leading-none">
                  {label}
                </span>
              </div>
            ))}

            {/* Divider + ghi chú hướng nhìn */}
            <div className="mt-1 pt-1.5 border-t border-[#f0e8db]">
              <p className="text-[10px] text-[#a89b8d] leading-tight">
                📐 Chuẩn Roux: F = Xanh lá hướng về phía bạn
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
