import React from 'react';
import type { BlockCase } from '../../data/rouxBlockData';
import { BlockDiagram } from './ReferenceDiagrams';
import { useRubikStore } from '../../store/useRubikStore';
import { RotateCcw, Play, Lightbulb, Compass, Box } from 'lucide-react';

interface BlockCaseCardProps {
  caseItem: BlockCase;
  allCasesInGroup?: BlockCase[];
  onSetup: (setupAlg: string, name: string) => void;
  onRun: (alg: string, name: string) => void;
  onSwitchTo3D?: (caseName: string) => void;
}

export const BlockCaseCard: React.FC<BlockCaseCardProps> = ({
  caseItem,
  allCasesInGroup,
  onSetup,
  onRun,
  onSwitchTo3D,
}) => {
  const startCaseStudy = useRubikStore((s) => s.startCaseStudy);
  const activeCaseStudy = useRubikStore((s) => s.activeCaseStudy);

  const isCurrentActive = activeCaseStudy?.id === caseItem.id;

  const isFB = caseItem.blockType === 'fb';
  const themeBadge = isFB
    ? 'bg-[#eef6f2] text-[#2d6a4f] border-[#c2e2cf]'
    : 'bg-[#eef4fb] text-[#1d4e89] border-[#c2daf2]';
  const themeBtn = isFB
    ? 'bg-[#2d6a4f] hover:bg-[#245640]'
    : 'bg-[#1d4e89] hover:bg-[#163e6e]';

  const handleOpen3D = () => {
    startCaseStudy(caseItem, allCasesInGroup);
    if (onSwitchTo3D) {
      onSwitchTo3D(caseItem.name);
    }
  };

  return (
    <div
      className={`p-3 bg-white rounded-2xl border transition-all hover:border-[#dfd0bd] flex flex-col gap-2.5 ${
        isCurrentActive
          ? 'border-[#e07a5f] ring-2 ring-[#e07a5f]/20 shadow-md'
          : 'border-[#e8dfcf] shadow-2xs'
      }`}
    >
      {/* Header: Tên thế cờ + Vị trí slot + Nhóm */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-black rounded-md border ${themeBadge}`}
            >
              Slot {caseItem.targetSlot}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-[#2c221e] leading-snug">
              {caseItem.name}
            </h4>
          </div>

          {/* Vị trí viên góc và cạnh */}
          <div className="flex items-center gap-2 mt-1 text-[10px] text-[#706459]">
            <span className="flex items-center gap-0.5">
              <span className="font-semibold text-[#8c7b6c]">Góc:</span>
              <span className="font-mono font-bold text-[#2c221e] bg-[#f5efe4] px-1 rounded border border-[#ebdcca]">
                {caseItem.cornerPos}
              </span>
            </span>
            <span className="text-[#c8c2b8]">•</span>
            <span className="flex items-center gap-0.5">
              <span className="font-semibold text-[#8c7b6c]">Cạnh:</span>
              <span className="font-mono font-bold text-[#2c221e] bg-[#f5efe4] px-1 rounded border border-[#ebdcca]">
                {caseItem.edgePos}
              </span>
            </span>
          </div>
        </div>

        {/* Sơ đồ Isometric 3D SVG thu nhỏ (Click để mở ngay trên 3D) */}
        <button
          type="button"
          onClick={handleOpen3D}
          className="shrink-0 flex flex-col items-center group cursor-pointer relative"
          title="Bấm để mở thế cờ này trực tiếp trên khối Rubik 3D"
        >
          <BlockDiagram
            blockType={caseItem.blockType}
            targetSlot={caseItem.targetSlot}
            setupAlg={caseItem.setupAlg}
            alg={caseItem.alg}
            cornerPos={caseItem.cornerPos || 'UFL'}
            edgePos={caseItem.edgePos}
            size={68}
          />
          <span className="absolute bottom-1 right-1 p-0.5 bg-black/60 text-white rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            <Box className="w-2.5 h-2.5" /> 3D
          </span>
        </button>
      </div>

      {/* Mẹo nhận biết đặc trưng */}
      <div className="text-[11px] text-[#5c4f43] bg-[#faf6ee] p-2 rounded-xl border border-[#ebdcca] leading-snug space-y-1">
        <div className="flex items-start gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#e07a5f] mt-0.5 shrink-0" />
          <p className="flex-1">
            <span className="font-bold text-[#2c221e]">Nhận biết: </span>
            {caseItem.recognition}
          </p>
        </div>

        {/* Lời khuyên công thái học / finger trick */}
        {caseItem.tip && (
          <div className="flex items-start gap-1.5 pt-1 border-t border-[#f0e4d3] text-[10.5px] text-[#706459]">
            <Lightbulb className="w-3 h-3 text-[#d97706] mt-0.5 shrink-0" />
            <p className="flex-1 italic">
              <span className="font-semibold text-[#a06030] not-italic">Mẹo xoay: </span>
              {caseItem.tip}
            </p>
          </div>
        )}
      </div>

      {/* Chuỗi công thức xoay */}
      <div className="p-2 bg-[#fcf9f2] rounded-xl border border-[#ebdcca] space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[#8c7b6c]">Công thức tối ưu:</span>
          <span className="font-mono font-bold text-xs text-[#a06030] select-all break-all">
            {caseItem.alg}
          </span>
        </div>
        {caseItem.altAlg && (
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#f2e7d7]">
            <span className="text-[#a89b8d] italic">Cách xoay khác:</span>
            <span className="font-mono font-semibold text-[#706459] select-all break-all">
              {caseItem.altAlg}
            </span>
          </div>
        )}
      </div>

      {/* Nút tương tác: 1 nút mở 3D nổi bật và 2 nút nhanh */}
      <div className="flex items-center gap-1.5 pt-0.5">
        {/* Nút chính: Mở thế cờ trực tiếp trên 3D */}
        <button
          type="button"
          onClick={handleOpen3D}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          title="Mở thế cờ và công thức trực tiếp trên khối Rubik 3D"
        >
          <Box className="w-3.5 h-3.5" />
          <span>Học trên khối 3D</span>
        </button>

        {/* Nút nạp nhanh */}
        <button
          type="button"
          onClick={() => onSetup(caseItem.setupAlg, caseItem.name)}
          className="px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all cursor-pointer flex items-center gap-1"
          title={`Thiết lập khối Rubik 3D về thế ${caseItem.name}`}
        >
          <RotateCcw className="w-3 h-3 text-[#3d5a80]" />
          <span className="hidden sm:inline">Nạp</span>
        </button>

        {/* Nút chạy demo */}
        <button
          type="button"
          onClick={() => onRun(caseItem.alg, caseItem.name)}
          className={`flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer ${themeBtn}`}
          title="Xem minh hoạ 3D với tốc độ chậm (400ms)"
        >
          <Play className="w-3 h-3 fill-current" />
          <span className="hidden sm:inline">Demo</span>
        </button>
      </div>
    </div>
  );
};
