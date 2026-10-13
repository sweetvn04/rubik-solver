import React, { useMemo, useState } from 'react';
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
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CaseStudyHUDProps {
  onOpenTheory?: () => void;
}

export const CaseStudyHUD: React.FC<CaseStudyHUDProps> = ({ onOpenTheory }) => {
  const [isTipsOpen, setIsTipsOpen] = useState(false);

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

  const isFocusMode = useRubikStore((s) => s.isFocusMode);
  const toggleFocusMode = useRubikStore((s) => s.toggleFocusMode);

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
    <aside className="fixed sm:absolute bottom-[max(0.4rem,env(safe-area-inset-bottom,0.4rem))] sm:bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-[95%] max-w-lg sm:max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-white/96 backdrop-blur-xl rounded-2xl border border-[#e8dfcf] shadow-xl p-2.5 sm:p-4 space-y-2 sm:space-y-2.5 max-h-[82vh] sm:max-h-none flex flex-col">
        
        {/* ── 1. HEADER: TÊN THẾ CỜ & VỊ TRÍ ── */}
        <div className="flex items-start justify-between gap-1.5 border-b border-[#f0e6d8] pb-1.5 sm:pb-2 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {activeCaseStudy.targetSlot && (
                <span
                  className={`px-1.5 py-0.5 text-[9.5px] sm:text-[10px] font-mono font-black rounded-md border ${badgeTheme}`}
                >
                  Slot {activeCaseStudy.targetSlot}
                </span>
              )}
              {activeCaseStudy.groupName && (
                <span className="text-[9.5px] sm:text-[10px] font-bold text-[#8c7b6c] truncate max-w-[140px] sm:max-w-none">
                  {activeCaseStudy.groupName}
                </span>
              )}
              {caseStudyGroup.length > 1 && (
                <span className="text-[9.5px] sm:text-[10px] font-mono font-semibold text-[#a89b8d]">
                  ({caseStudyIndex + 1}/{caseStudyGroup.length})
                </span>
              )}
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-[#2c221e] mt-0.5 truncate leading-tight">
              {activeCaseStudy.name}
            </h3>

            {(activeCaseStudy.cornerPos || activeCaseStudy.edgePos) && (
              <div className="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] text-[#706459] mt-0.5">
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
            {/* Nút bật/tắt làm xám các viên thừa không liên quan */}
            <button
              type="button"
              onClick={toggleFocusMode}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                isFocusMode
                  ? 'bg-[#e07a5f]/15 text-[#e07a5f] border-[#e07a5f]/30 hover:bg-[#e07a5f]/25 shadow-2xs'
                  : 'bg-[#faf6ee] text-[#8c7b6c] border-[#e2d8c7] hover:text-[#2c221e]'
              }`}
              title={
                isFocusMode
                  ? 'Đang làm xám các viên không liên quan (Bấm để hiện màu tất cả)'
                  : 'Đang hiện màu toàn bộ khối (Bấm để làm xám các viên thừa)'
              }
            >
              {isFocusMode ? <Eye className="w-3.5 h-3.5 text-[#e07a5f]" /> : <EyeOff className="w-3.5 h-3.5 text-[#8c7b6c]" />}
              <span className="hidden sm:inline">{isFocusMode ? 'Đang làm xám' : 'Hiện đủ màu'}</span>
            </button>

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
        <div className="space-y-1 shrink-0">
          <div className="flex items-center justify-between text-[10px] sm:text-[10.5px]">
            <span className="font-bold text-[#8c7b6c] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#e07a5f]" />
              <span>Công thức giải trên 3D:</span>
            </span>
            <span className="font-mono text-[9.5px] sm:text-[10px] text-[#a89b8d]">
              {caseCurrentMoveIndex} / {parsedMoves.length} moves
            </span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto p-1 sm:p-1.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca] min-h-[32px] sm:min-h-[36px]">
            {parsedMoves.map((m, idx) => {
              const isPast = idx < caseCurrentMoveIndex;
              const isCurrent = idx === caseCurrentMoveIndex && !isCompleted;
              return (
                <span
                  key={idx}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono font-bold text-[11px] sm:text-xs rounded-lg transition-all shrink-0 ${
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

        {/* ── 3. MẸO NHẬN BIẾT & LỜI KHUYÊN (TỐI ƯU GỌN GÀNG CHO MOBILE) ── */}
        {(activeCaseStudy.recognition || activeCaseStudy.tip) && (
          <div className="space-y-1">
            {/* Nút bấm xem/thu gọn mẹo trên mobile để giải phóng chiều cao */}
            <button
              type="button"
              onClick={() => setIsTipsOpen(!isTipsOpen)}
              className="w-full flex sm:hidden items-center justify-between text-[10px] font-bold text-[#706459] bg-[#faf6ee] hover:bg-[#f5efe4] px-2 py-1 rounded-lg border border-[#e8dfcf] transition-all cursor-pointer"
            >
              <span className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-[#d97706]" />
                <span>Mẹo nhận biết & cách xoay</span>
              </span>
              <span className="text-[#a89b8d] flex items-center gap-0.5 font-normal text-[9.5px]">
                {isTipsOpen ? (
                  <>Thu gọn <ChevronUp className="w-3 h-3" /></>
                ) : (
                  <>Xem mẹo <ChevronDown className="w-3 h-3" /></>
                )}
              </span>
            </button>

            {/* Khung nội dung chi tiết: luôn mở trên desktop (sm), mở khi bấm trên mobile */}
            <div
              className={`${
                isTipsOpen ? 'block' : 'hidden sm:block'
              } text-[10px] sm:text-[10.5px] text-[#5c4f43] bg-[#fdfaf5] p-1.5 sm:p-2 rounded-xl border border-[#f0e4d3] leading-snug space-y-1 max-h-[22vh] sm:max-h-none overflow-y-auto`}
            >
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
          </div>
        )}

        {/* ── 4. THANH NÚT ĐIỀU KHIỂN TƯƠNG TÁC 3D (CHUẨN MOBILE 100%) ── */}
        <div className="flex items-center justify-between gap-1 pt-1 sm:pt-1.5 border-t border-[#f0e6d8] shrink-0">
          {/* Stepper qua lại các thế trong nhóm */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              type="button"
              onClick={prevCaseStudy}
              disabled={caseStudyGroup.length <= 1 || isBusy}
              className="w-7 h-7 sm:w-auto sm:h-auto sm:px-2 sm:py-1.5 bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-30 rounded-lg sm:rounded-xl border border-[#e2d8c7] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-0.5"
              title="Thế trước trong nhóm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thế trước</span>
            </button>
            <button
              type="button"
              onClick={nextCaseStudy}
              disabled={caseStudyGroup.length <= 1 || isBusy}
              className="w-7 h-7 sm:w-auto sm:h-auto sm:px-2 sm:py-1.5 bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-30 rounded-lg sm:rounded-xl border border-[#e2d8c7] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-0.5"
              title="Thế tiếp theo trong nhóm"
            >
              <span className="hidden sm:inline">Thế tiếp</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bộ điều khiển xoay: Đặt lại, Lùi, Play, Tiến */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={resetCaseStudyState}
              disabled={isBusy}
              className="w-7 h-7 sm:w-auto sm:h-auto p-0 sm:px-2 sm:py-1.5 bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-40 rounded-lg sm:rounded-xl border border-[#e2d8c7] text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1"
              title="Đặt lại thế cờ ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#3d5a80]" />
              <span className="hidden sm:inline">Đặt lại</span>
            </button>

            <button
              type="button"
              onClick={stepCaseBackward}
              disabled={caseCurrentMoveIndex === 0 || isBusy}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-30 rounded-lg sm:rounded-xl border border-[#e2d8c7] text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0"
              title="Lùi 1 bước xoay"
            >
              ‹ Bước
            </button>

            <button
              type="button"
              onClick={playCaseStudyDemo}
              disabled={isBusy}
              className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#e07a5f] hover:bg-[#d4684c] text-white disabled:opacity-50 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
              title="Chạy minh hoạ toàn bộ công thức trên 3D"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isCompleted ? 'Xoay lại' : 'Chạy demo'}</span>
            </button>

            <button
              type="button"
              onClick={stepCaseForward}
              disabled={isCompleted || isBusy}
              className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-30 rounded-lg sm:rounded-xl border border-[#e2d8c7] text-[11px] sm:text-xs font-bold transition-all cursor-pointer shrink-0"
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

