import React, { useMemo } from 'react';
import { useRubikStore } from '../../store/useRubikStore';
import { parseAlgorithm } from '../../engine/moveParser';
import {
  RotateCcw,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Lightbulb,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface CaseStudyHUDProps {
  onOpenTheory?: () => void;
}

export const CaseStudyHUD: React.FC<CaseStudyHUDProps> = ({ onOpenTheory }) => {
  const activeCaseStudy = useRubikStore((s) => s.activeCaseStudy);
  const caseStudyGroup = useRubikStore((s) => s.caseStudyGroup);
  const caseStudyIndex = useRubikStore((s) => s.caseStudyIndex);
  const caseCurrentMoveIndex = useRubikStore((s) => s.caseCurrentMoveIndex);
  const isAnimating = useRubikStore((s) => s.isAnimating);
  const moveQueue = useRubikStore((s) => s.moveQueue);

  const resetCaseStudyState = useRubikStore((s) => s.resetCaseStudyState);
  const playCaseStudyDemo = useRubikStore((s) => s.playCaseStudyDemo);
  const stepCaseForward = useRubikStore((s) => s.stepCaseForward);
  const stepCaseBackward = useRubikStore((s) => s.stepCaseBackward);
  const nextCaseStudy = useRubikStore((s) => s.nextCaseStudy);
  const prevCaseStudy = useRubikStore((s) => s.prevCaseStudy);
  const closeCaseStudy = useRubikStore((s) => s.closeCaseStudy);

  const parsedMoves = useMemo(() => {
    if (!activeCaseStudy?.alg) return [];
    return parseAlgorithm(activeCaseStudy.alg);
  }, [activeCaseStudy?.alg]);

  if (!activeCaseStudy) return null;

  const isFB = activeCaseStudy.blockType === 'fb';
  const isSB = activeCaseStudy.blockType === 'sb';
  const badgeTheme = isFB
    ? 'bg-[#eef6f2] text-[#2d6a4f] border-[#c2e2cf]'
    : isSB
    ? 'bg-[#eef4fb] text-[#1d4e89] border-[#c2daf2]'
    : 'bg-[#fdf4fa] text-[#7b2d6e] border-[#e0a8cc]';

  const isBusy = isAnimating || moveQueue.length > 0;
  const isCompleted = caseCurrentMoveIndex >= parsedMoves.length;

  return (
    <aside className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-[96%] max-w-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="bg-white/94 backdrop-blur-xl rounded-2xl border border-[#e8dfcf] shadow-xl p-3 sm:p-4 space-y-2.5">
        
        {/* ── 1. HEADER: TÊN THẾ CỜ & VỊ TRÍ ── */}
        <div className="flex items-start justify-between gap-2 border-b border-[#f0e6d8] pb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeCaseStudy.targetSlot && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-black rounded-md border ${badgeTheme}`}
                >
                  Slot {activeCaseStudy.targetSlot}
                </span>
              )}
              {activeCaseStudy.groupName && (
                <span className="text-[10px] font-bold text-[#8c7b6c] truncate">
                  {activeCaseStudy.groupName}
                </span>
              )}
              {caseStudyGroup.length > 1 && (
                <span className="text-[10px] font-mono font-semibold text-[#a89b8d]">
                  ({caseStudyIndex + 1}/{caseStudyGroup.length})
                </span>
              )}
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-[#2c221e] mt-0.5 truncate">
              {activeCaseStudy.name}
            </h3>

            {(activeCaseStudy.cornerPos || activeCaseStudy.edgePos) && (
              <div className="flex items-center gap-2 text-[10px] text-[#706459] mt-0.5">
                {activeCaseStudy.cornerPos && (
                  <span>
                    Góc: <strong className="text-[#2c221e] font-mono">{activeCaseStudy.cornerPos}</strong>
                  </span>
                )}
                {activeCaseStudy.cornerPos && activeCaseStudy.edgePos && <span>•</span>}
                {activeCaseStudy.edgePos && (
                  <span>
                    Cạnh: <strong className="text-[#2c221e] font-mono">{activeCaseStudy.edgePos}</strong>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onOpenTheory && (
              <button
                type="button"
                onClick={onOpenTheory}
                className="p-1.5 text-[#706459] hover:text-[#2c221e] hover:bg-[#f5efe4] rounded-xl transition-all cursor-pointer"
                title="Mở danh sách bài học giáo trình"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={closeCaseStudy}
              className="p-1.5 text-[#8c7b6c] hover:text-[#2c221e] hover:bg-[#f5efe4] rounded-xl transition-all cursor-pointer"
              title="Đóng chế độ học thế cờ"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── 2. MOVE SEQUENCE DISPLAY: CHUỖI XOAY HIGHLIGHT TỪNG BƯỚC ── */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="font-bold text-[#8c7b6c] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#e07a5f]" />
              <span>Công thức giải trên 3D:</span>
            </span>
            <span className="font-mono text-[10px] text-[#a89b8d]">
              {caseCurrentMoveIndex} / {parsedMoves.length} moves
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto p-1.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca] min-h-[36px]">
            {parsedMoves.map((m, idx) => {
              const isPast = idx < caseCurrentMoveIndex;
              const isCurrent = idx === caseCurrentMoveIndex && !isCompleted;
              return (
                <span
                  key={idx}
                  className={`px-2 py-1 font-mono font-bold text-xs rounded-lg transition-all shrink-0 ${
                    isPast
                      ? 'bg-[#e2f0e8] text-[#2d6a4f] line-through opacity-70'
                      : isCurrent
                      ? 'bg-[#e07a5f] text-white shadow-xs scale-105 ring-2 ring-[#e07a5f]/40'
                      : 'bg-white text-[#2c221e] border border-[#e2d8c7]'
                  }`}
                >
                  {m.raw}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── 3. MẸO NHẬN BIẾT & LỜI KHUYÊN CÔNG THÁI HỌC ── */}
        {(activeCaseStudy.recognition || activeCaseStudy.tip) && (
          <div className="text-[10.5px] text-[#5c4f43] bg-[#fdfaf5] p-2 rounded-xl border border-[#f0e4d3] leading-snug space-y-1">
            {activeCaseStudy.recognition && (
              <div className="flex items-start gap-1">
                <Compass className="w-3 h-3 text-[#e07a5f] mt-0.5 shrink-0" />
                <p className="flex-1">
                  <strong>Nhận biết: </strong>
                  {activeCaseStudy.recognition}
                </p>
              </div>
            )}
            {activeCaseStudy.tip && (
              <div className="flex items-start gap-1 text-[#78350f]">
                <Lightbulb className="w-3 h-3 text-[#d97706] mt-0.5 shrink-0" />
                <p className="flex-1 italic">
                  <strong>Mẹo xoay: </strong>
                  {activeCaseStudy.tip}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── 4. THANH NÚT ĐIỀU KHIỂN TƯƠNG TÁC 3D ── */}
        <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#f0e6d8]">
          {/* Stepper qua lại các thế trong nhóm */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevCaseStudy}
              disabled={caseStudyGroup.length <= 1 || isBusy}
              className="px-2 py-1.5 bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-30 rounded-xl border border-[#e2d8c7] text-xs font-bold transition-all cursor-pointer flex items-center gap-0.5"
              title="Thế trước trong nhóm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thế trước</span>
            </button>
            <button
              type="button"
              onClick={nextCaseStudy}
              disabled={caseStudyGroup.length <= 1 || isBusy}
              className="px-2 py-1.5 bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-30 rounded-xl border border-[#e2d8c7] text-xs font-bold transition-all cursor-pointer flex items-center gap-0.5"
              title="Thế tiếp theo trong nhóm"
            >
              <span className="hidden sm:inline">Thế tiếp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bộ điều khiển xoay: Đặt lại, Lùi, Play, Tiến */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={resetCaseStudyState}
              disabled={isBusy}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-40 rounded-xl border border-[#e2d8c7] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
              title="Đặt lại thế cờ ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#3d5a80]" />
              <span className="hidden sm:inline">Đặt lại</span>
            </button>

            <button
              type="button"
              onClick={stepCaseBackward}
              disabled={caseCurrentMoveIndex === 0 || isBusy}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-30 rounded-xl border border-[#e2d8c7] text-xs font-bold transition-all cursor-pointer"
              title="Lùi 1 bước xoay"
            >
              ‹ Bước
            </button>

            <button
              type="button"
              onClick={playCaseStudyDemo}
              disabled={isBusy}
              className="px-3 py-1.5 bg-[#e07a5f] hover:bg-[#d4684c] text-white disabled:opacity-50 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
              title="Chạy minh hoạ toàn bộ công thức trên 3D"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isCompleted ? 'Xoay lại' : 'Chạy demo'}</span>
            </button>

            <button
              type="button"
              onClick={stepCaseForward}
              disabled={isCompleted || isBusy}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-30 rounded-xl border border-[#e2d8c7] text-xs font-bold transition-all cursor-pointer"
              title="Tiến 1 bước xoay"
            >
              Bước ›
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
};
