import React, { useState } from 'react';
import { useRubikStore } from '../../store/useRubikStore';
import { getMoveDescriptionVi } from '../../engine/tutorHelper';
import {
  ChevronLeft,
  ChevronRight,
  FastForward,
  X,
  Trophy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
} from 'lucide-react';

export const TutorCard: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [side, setSide] = useState<'right' | 'left'>('right');

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

  const sideClass =
    side === 'right'
      ? 'sm:right-6 sm:left-auto'
      : 'sm:left-6 sm:right-auto';

  // 1. Chế độ thu gọn Mini Bar (Chỉ cao ~52px, không che khối Rubik)
  if (isCollapsed) {
    return (
      <div
        className={`fixed z-30 bottom-3 inset-x-3 sm:inset-x-auto sm:bottom-6 ${sideClass} sm:w-[380px] p-2 bg-white/95 backdrop-blur-md rounded-2xl border border-[#e8dfcf] shadow-xl animate-in fade-in duration-200 pointer-events-auto flex items-center justify-between gap-2`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#f4ebe1] text-[#935c34] shrink-0">
            {currentPhase?.id?.toUpperCase() || 'ROUX'}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-sm text-[#2c221e]">
                {currentMove || 'Xong'}
              </span>
              <span className="text-[11px] text-[#706459] truncate font-medium">
                {isFinished ? 'Hoàn thành' : moveDescVi}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={tutorPrevStep}
            disabled={tutorCurrentIndex <= 0 || isBusy}
            className="p-1.5 text-xs text-[#5c4f43] disabled:opacity-30 hover:bg-[#efe8dc] rounded-lg transition-all"
            title="Lùi lại"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isFinished ? (
            <button
              type="button"
              onClick={tutorNextStep}
              disabled={isBusy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white disabled:opacity-50 rounded-lg shadow-xs transition-all active:scale-95"
              title="Xoay bước này"
            >
              <span>Xoay</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={exitTutorMode}
              className="p-1.5 text-xs font-bold bg-[#2a9d8f] text-white rounded-lg shadow-xs"
              title="Thoát"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 text-[#8c7b6c] hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-lg transition-all"
            title="Mở rộng chi tiết"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Chế độ mở rộng đầy đủ (Expanded Card)
  return (
    <div
      className={`fixed z-30 bottom-3 inset-x-3 sm:inset-x-auto sm:bottom-6 ${sideClass} sm:w-[370px] max-h-[82vh] overflow-y-auto p-4 bg-white/95 backdrop-blur-md rounded-3xl border border-[#e8dfcf] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto`}
    >
      {/* Header: Tiêu đề Phase & Bộ nút điều hướng thẻ */}
      <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#f0e8db]">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#f4ebe1] text-[#935c34] border border-[#e5d4c3]">
              {currentPhase?.title || 'Phương pháp Roux'}
            </span>
            {currentPhase?.caseName && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#e8f3ef] text-[#247c72] border border-[#c4e3dc]">
                {currentPhase.caseName}
              </span>
            )}
          </div>
          <div className="text-[11px] text-[#706459] font-medium mt-0.5">
            {currentPhase?.subtitle}
          </div>
        </div>

        {/* Nút Đổi bên, Thu nhỏ, Thoát */}
        <div className="flex items-center gap-0.5 text-[#8c7b6c]">
          <button
            type="button"
            onClick={() => setSide(side === 'right' ? 'left' : 'right')}
            className="p-1 hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-lg transition-all hidden sm:flex"
            title={side === 'right' ? 'Chuyển sang bên trái' : 'Chuyển sang bên phải'}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-lg transition-all"
            title="Thu nhỏ để nhìn rõ Rubik"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={exitTutorMode}
            className="p-1 hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-lg transition-all"
            title="Thoát chế độ hướng dẫn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thanh tiến trình (Overall Progress Bar) */}
      <div className="my-2.5">
        <div className="flex justify-between text-[10px] font-semibold text-[#8c7b6c] mb-1">
          <span>Tiến độ: Bước {tutorCurrentIndex}/{totalMoves}</span>
          <span className="text-[#a06030] font-mono">{overallPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#f0e8db] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#e07a5f] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Hero Step Display - Ký hiệu bước xoay hiện tại */}
      {isFinished ? (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <div className="w-12 h-12 rounded-full bg-[#2a9d8f]/15 flex items-center justify-center text-[#2a9d8f] mb-1.5 animate-bounce">
            <Trophy className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-[#2c221e]">
            Tuyệt vời! Bạn đã hoàn thành!
          </h3>
          <p className="text-[11px] text-[#706459] max-w-xs mt-0.5">
            Toàn bộ 4 giai đoạn Roux (FB, SB, CMLL, LSE) đã được giải hoàn tất 100%.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-2.5 px-2 bg-[#faf6ee] rounded-2xl border border-[#ede3d4] my-1.5">
          <div className="text-[9px] font-bold text-[#8c7b6c] uppercase tracking-wider mb-0.5">
            Bước {phaseStep} / {phaseTotal} của chặng này
          </div>

          {/* Move to đùng nổi bật */}
          <div className="text-3xl sm:text-4xl font-mono font-black text-[#2c221e] tracking-tight my-0.5 drop-shadow-xs">
            {currentMove}
          </div>

          {/* Mô tả tiếng Việt thân thiện */}
          <div className="text-xs font-semibold text-[#a06030] text-center px-1">
            {moveDescVi}
          </div>

          {/* Lời khuyên của Phase */}
          {currentPhase?.tip && (
            <div className="text-[10px] text-[#7d7165] text-center mt-1.5 px-2 italic bg-white/70 py-0.5 rounded-lg border border-[#ebe0d0] max-w-sm">
              💡 {currentPhase.tip}
            </div>
          )}
        </div>
      )}

      {/* Bộ nút điều khiển bước (Controls) */}
      <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-[#f0e8db]">
        {/* Nút Lùi lại 1 bước */}
        <button
          type="button"
          onClick={tutorPrevStep}
          disabled={tutorCurrentIndex <= 0 || isBusy}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-[#faf6ee] hover:bg-white text-[#5c4f43] disabled:opacity-40 rounded-xl border border-[#e2d8c7] shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          title="Lùi lại 1 bước vừa xoay (Undo)"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Lùi</span>
        </button>

        {/* Nút Xong chặng này (Fast Forward) */}
        {!isFinished && (
          <button
            type="button"
            onClick={tutorPlayCurrentPhase}
            disabled={isBusy}
            className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold bg-[#faf6ee] hover:bg-white text-[#7a4820] disabled:opacity-40 rounded-xl border border-[#e2d8c7] shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            title="Tự động xoay hết các bước còn lại của chặng hiện tại"
          >
            <FastForward className="w-3 h-3 text-[#e07a5f]" />
            <span>Xong chặng</span>
          </button>
        )}

        {/* Nút Bước tiếp theo / Hoàn thành */}
        {isFinished ? (
          <button
            type="button"
            onClick={exitTutorMode}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#2a9d8f] hover:bg-[#238b7f] text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Xong & Thoát</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={tutorNextStep}
            disabled={isBusy}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white disabled:opacity-50 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            title="Xoay 1 bước tiếp theo (Phím Mũi tên phải)"
          >
            <span>Xoay bước này</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
