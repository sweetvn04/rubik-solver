import React from 'react';
import { useRubikStore } from '../../store/useRubikStore';
import { getMoveDescriptionVi } from '../../engine/tutorHelper';
import {
  ChevronLeft,
  ChevronRight,
  FastForward,
  X,
  Trophy,
  CheckCircle2,
} from 'lucide-react';

export const TutorCard: React.FC = () => {
  const isTutorActive = useRubikStore((s) => s.isTutorActive);
  const tutorPhases = useRubikStore((s) => s.tutorPhases);
  const tutorAllMoves = useRubikStore((s) => s.tutorAllMoves);
  const tutorCurrentIndex = useRubikStore((s) => s.tutorCurrentIndex);
  const isAnimating = useRubikStore((s) => s.isAnimating);
  const moveQueue = useRubikStore((s) => s.moveQueue);

  const tutorNextStep = useRubikStore((s) => s.tutorNextStep);
  const tutorPrevStep = useRubikStore((s) => s.tutorPrevStep);
  const tutorPlayCurrentPhase = useRubikStore((s) => s.tutorPlayCurrentPhase);
  const exitTutorMode = useRubikStore((s) => s.exitTutorMode);

  if (!isTutorActive) return null;

  const totalMoves = tutorAllMoves.length;
  const isFinished = tutorCurrentIndex >= totalMoves;
  const isBusy = isAnimating || moveQueue.length > 0;

  // Tìm phase hiện tại
  const currentPhase = isFinished
    ? tutorPhases[tutorPhases.length - 1]
    : tutorPhases.find(
        (p) => tutorCurrentIndex >= p.startIndex && tutorCurrentIndex < p.endIndex
      ) || tutorPhases[0];

  const currentMove = !isFinished ? tutorAllMoves[tutorCurrentIndex] : null;
  const moveDescVi = currentMove ? getMoveDescriptionVi(currentMove) : '';

  // Tiến độ trong phase hiện tại
  const phaseStep = currentPhase
    ? isFinished
      ? currentPhase.moves.length
      : tutorCurrentIndex - currentPhase.startIndex + 1
    : 1;
  const phaseTotal = currentPhase ? currentPhase.moves.length : 1;

  // Tính % tiến độ toàn khối
  const overallPercent = totalMoves > 0 ? Math.round((tutorCurrentIndex / totalMoves) * 100) : 100;

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto p-4 sm:p-5 bg-white/95 backdrop-blur-md rounded-3xl border border-[#e8dfcf] shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto">
      {/* 1. Header: Tiêu đề Phase & Nút Thoát */}
      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#f0e8db]">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#f4ebe1] text-[#935c34] border border-[#e5d4c3]">
              {currentPhase?.title || 'Phương pháp Roux'}
            </span>
            {currentPhase?.caseName && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#e8f3ef] text-[#247c72] border border-[#c4e3dc]">
                {currentPhase.caseName}
              </span>
            )}
          </div>
          <div className="text-xs text-[#706459] font-medium mt-1">
            {currentPhase?.subtitle}
          </div>
        </div>

        <button
          type="button"
          onClick={exitTutorMode}
          className="p-1.5 text-[#8c7b6c] hover:text-[#2c221e] rounded-xl hover:bg-[#efe8dc] transition-all cursor-pointer"
          title="Thoát chế độ hướng dẫn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Thanh tiến trình (Overall Progress Bar) */}
      <div className="my-3">
        <div className="flex justify-between text-[11px] font-semibold text-[#8c7b6c] mb-1">
          <span>Tiến độ: Bước {tutorCurrentIndex}/{totalMoves}</span>
          <span className="text-[#a06030] font-mono">{overallPercent}%</span>
        </div>
        <div className="w-full h-2 bg-[#f0e8db] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e07a5f] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Hero Step Display - Ký hiệu bước xoay hiện tại */}
      {isFinished ? (
        <div className="flex flex-col items-center justify-center py-5 text-center">
          <div className="w-14 h-14 rounded-full bg-[#2a9d8f]/15 flex items-center justify-center text-[#2a9d8f] mb-2 animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#2c221e]">
            Tuyệt vời! Bạn đã hoàn thành!
          </h3>
          <p className="text-xs text-[#706459] max-w-xs mt-1">
            Toàn bộ 4 giai đoạn Roux (FB, SB, CMLL, LSE) đã được giải hoàn tất 100%.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-3 sm:py-4 px-2 bg-[#faf6ee] rounded-2xl border border-[#ede3d4] my-2">
          <div className="text-[10px] font-bold text-[#8c7b6c] uppercase tracking-wider mb-0.5">
            Bước {phaseStep} / {phaseTotal} của chặng này
          </div>

          {/* Move to đùng nổi bật */}
          <div className="text-4xl sm:text-5xl font-mono font-black text-[#2c221e] tracking-tight my-1 drop-shadow-xs">
            {currentMove}
          </div>

          {/* Mô tả tiếng Việt thân thiện */}
          <div className="text-xs sm:text-sm font-semibold text-[#a06030] text-center px-2">
            {moveDescVi}
          </div>

          {/* Lời khuyên của Phase */}
          {currentPhase?.tip && (
            <div className="text-[11px] text-[#7d7165] text-center mt-2 px-3 italic bg-white/70 py-1 rounded-xl border border-[#ebe0d0] max-w-sm">
              💡 {currentPhase.tip}
            </div>
          )}
        </div>
      )}

      {/* 4. Bộ nút điều khiển bước (Controls) */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-[#f0e8db]">
        {/* Nút Lùi lại 1 bước */}
        <button
          type="button"
          onClick={tutorPrevStep}
          disabled={tutorCurrentIndex <= 0 || isBusy}
          className="flex items-center gap-1 px-3 py-2 text-xs font-bold bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-40 rounded-xl border border-[#e2d8c7] shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          title="Lùi lại 1 bước vừa xoay (Undo)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline sm:inline">Lùi lại</span>
        </button>

        {/* Nút Xong chặng này (Fast Forward) */}
        {!isFinished && (
          <button
            type="button"
            onClick={tutorPlayCurrentPhase}
            disabled={isBusy}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#7a4820] disabled:opacity-40 rounded-xl border border-[#e2d8c7] shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed text-[11px]"
            title="Tự động xoay hết các bước còn lại của chặng hiện tại"
          >
            <FastForward className="w-3.5 h-3.5 text-[#e07a5f]" />
            <span className="hidden xs:inline sm:inline">Xong chặng</span>
          </button>
        )}

        {/* Nút Bước tiếp theo / Hoàn thành */}
        {isFinished ? (
          <button
            type="button"
            onClick={exitTutorMode}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#2a9d8f] hover:bg-[#238b7f] text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Hoàn thành & Thoát</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={tutorNextStep}
            disabled={isBusy}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white disabled:opacity-50 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            title="Xoay 1 bước tiếp theo trên màn hình (Phím Mũi tên phải)"
          >
            <span>Xoay bước này</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
