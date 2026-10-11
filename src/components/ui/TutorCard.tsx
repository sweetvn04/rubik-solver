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
  Eye,
  EyeOff,
  Map,
  Compass,
  Check,
  Play,
} from 'lucide-react';

export const TutorCard: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [side, setSide] = useState<'right' | 'left'>('right');

  const isTutorActive = useRubikStore((s) => s.isTutorActive);
  const tutorPhases = useRubikStore((s) => s.tutorPhases);
  const tutorChunks = useRubikStore((s) => s.tutorChunks);
  const tutorAllMoves = useRubikStore((s) => s.tutorAllMoves);
  const tutorCurrentIndex = useRubikStore((s) => s.tutorCurrentIndex);
  const isAnimating = useRubikStore((s) => s.isAnimating);
  const moveQueue = useRubikStore((s) => s.moveQueue);

  const tutorNextStep = useRubikStore((s) => s.tutorNextStep);
  const tutorPrevStep = useRubikStore((s) => s.tutorPrevStep);
  const tutorPlayChunk = useRubikStore((s) => s.tutorPlayChunk);
  const exitTutorMode = useRubikStore((s) => s.exitTutorMode);
  const isFocusMode = useRubikStore((s) => s.isFocusMode);
  const toggleFocusMode = useRubikStore((s) => s.toggleFocusMode);

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

  // Tìm chunk hiện tại
  const currentChunk = isFinished
    ? tutorChunks[tutorChunks.length - 1]
    : tutorChunks.find(
        (c) => tutorCurrentIndex >= c.startIndex && tutorCurrentIndex < c.endIndex
      ) || tutorChunks[0];

  const currentMove = !isFinished ? tutorAllMoves[tutorCurrentIndex] : null;
  const moveDescVi = currentMove ? getMoveDescriptionVi(currentMove) : '';

  // Tiến độ trong phase hiện tại
  const phaseStep = currentPhase
    ? isFinished
      ? currentPhase.moves.length
      : tutorCurrentIndex - currentPhase.startIndex + 1
    : 1;
  const phaseTotal = currentPhase ? currentPhase.moves.length : 1;

  // Tiến độ trong chunk hiện tại
  const chunkStep = currentChunk
    ? isFinished
      ? currentChunk.moves.length
      : tutorCurrentIndex - currentChunk.startIndex + 1
    : 1;
  const chunkTotal = currentChunk ? currentChunk.moves.length : 1;

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
            {currentChunk ? currentChunk.chunkTitle.slice(0, 14) + '...' : currentPhase?.id?.toUpperCase() || 'ROUX'}
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
            className="p-1.5 text-xs text-[#5c4f43] disabled:opacity-30 hover:bg-[#efe8dc] rounded-lg transition-all cursor-pointer"
            title="Lùi lại"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {!isFinished ? (
            <button
              type="button"
              onClick={tutorNextStep}
              disabled={isBusy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white disabled:opacity-50 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Xoay bước này"
            >
              <span>Xoay</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={exitTutorMode}
              className="p-1.5 text-xs font-bold bg-[#2a9d8f] text-white rounded-lg shadow-xs cursor-pointer"
              title="Thoát"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsRoadmapOpen(true)}
            className="p-1.5 text-[#8c7b6c] hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-lg transition-all cursor-pointer"
            title="Xem lộ trình theo cụm"
          >
            <Map className="w-3.5 h-3.5 text-[#a06030]" />
          </button>

          <button
            type="button"
            onClick={toggleFocusMode}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
              isFocusMode
                ? 'text-[#e07a5f] bg-[#fbf0ec]'
                : 'text-[#8c7b6c] hover:bg-[#efe8dc]'
            }`}
            title={
              isFocusMode
                ? 'Đang bật Tiêu điểm (Focus): Làm nổi bật viên chặng này (Click để tắt)'
                : 'Đang tắt Tiêu điểm: Click để làm nổi bật viên của chặng này'
            }
          >
            {isFocusMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 text-[#8c7b6c] hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-lg transition-all cursor-pointer"
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
    <>
      <div
        className={`fixed z-30 bottom-3 inset-x-3 sm:inset-x-auto sm:bottom-6 ${sideClass} sm:w-[390px] max-h-[85vh] overflow-y-auto p-4 bg-white/95 backdrop-blur-md rounded-3xl border border-[#e8dfcf] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto`}
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

          {/* Nút Lộ trình, Tiêu điểm, Đổi bên, Thu nhỏ, Thoát */}
          <div className="flex items-center gap-0.5 text-[#8c7b6c]">
            <button
              type="button"
              onClick={() => setIsRoadmapOpen(true)}
              className="p-1 text-[#a06030] hover:bg-[#f5ece0] rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold px-1.5"
              title="Xem toàn bộ lộ trình giải theo cụm"
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lộ trình</span>
            </button>

            <button
              type="button"
              onClick={toggleFocusMode}
              className={`p-1 rounded-lg transition-all cursor-pointer ${
                isFocusMode
                  ? 'text-[#e07a5f] bg-[#fbf0ec]'
                  : 'text-[#8c7b6c] hover:bg-[#efe8dc]'
              }`}
              title={
                isFocusMode
                  ? 'Đang bật Tiêu điểm (Focus): Chỉ sáng viên của chặng này (Click để tắt)'
                  : 'Đang tắt Tiêu điểm: Click để làm sáng nổi bật các viên của chặng này'
              }
            >
              {isFocusMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setSide(side === 'right' ? 'left' : 'right')}
              className="p-1 hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-lg transition-all hidden sm:flex cursor-pointer"
              title={side === 'right' ? 'Chuyển sang bên trái' : 'Chuyển sang bên phải'}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="p-1 hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-lg transition-all cursor-pointer"
              title="Thu nhỏ để nhìn rõ Rubik"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={exitTutorMode}
              className="p-1 hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-lg transition-all cursor-pointer"
              title="Thoát chế độ hướng dẫn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thanh tiến trình (Overall Progress Bar) */}
        <div className="my-2">
          <div className="flex justify-between text-[10px] font-semibold text-[#8c7b6c] mb-1">
            <span>Tiến độ toàn khối: {tutorCurrentIndex}/{totalMoves}</span>
            <span className="text-[#a06030] font-mono">{overallPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#f0e8db] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#e07a5f] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* KHỐI NỔI BẬT: CỤM MỤC TIÊU HIỆN TẠI (CHUNK INTENT) */}
        {currentChunk && !isFinished && (
          <div className="my-2 p-2.5 bg-[#fcf9f2] rounded-2xl border border-[#ede2d2] shadow-xs">
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#e07a5f]" />
                <span className="text-xs font-bold text-[#2c221e]">
                  {currentChunk.chunkTitle}
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-white text-[#935c34] rounded-md border border-[#e8ded0]">
                {chunkStep}/{chunkTotal}
              </span>
            </div>

            <p className="text-[11px] text-[#706459] leading-snug">
              {currentChunk.chunkSubtitle}
            </p>

            {/* Chi tiết tư duy: Mục đích & Cách nhận biết */}
            <div className="mt-2 pt-2 border-t border-[#ede2d2] space-y-1 text-[11px]">
              <div className="flex items-start gap-1.5">
                <span className="text-[10px] font-bold text-[#e07a5f] shrink-0 uppercase mt-0.5">Mục đích:</span>
                <span className="text-[#4a3f35] leading-tight">{currentChunk.intent}</span>
              </div>

              <div className="flex items-start gap-1.5">
                <span className="text-[10px] font-bold text-[#2a9d8f] shrink-0 uppercase mt-0.5">Nhận biết:</span>
                <span className="text-[#4a3f35] leading-tight">{currentChunk.recognition}</span>
              </div>
            </div>
          </div>
        )}

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
              Toàn bộ các cụm Roux (FB, SB, CMLL, LSE) đã được giải hoàn tất 100%.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2 px-2 bg-[#faf6ee] rounded-2xl border border-[#ede3d4] my-1.5">
            <div className="text-[9px] font-bold text-[#8c7b6c] uppercase tracking-wider mb-0.5">
              Bước {phaseStep} / {phaseTotal} của {currentPhase?.title}
            </div>

            {/* Move to đùng nổi bật */}
            <div className="text-3xl sm:text-4xl font-mono font-black text-[#2c221e] tracking-tight my-0.5 drop-shadow-xs">
              {currentMove}
            </div>

            {/* Mô tả tiếng Việt thân thiện */}
            <div className="text-xs font-semibold text-[#a06030] text-center px-1">
              {moveDescVi}
            </div>

            {/* Lời khuyên của Chunk / Phase */}
            {(currentChunk?.keyTip || currentPhase?.tip) && (
              <div className="text-[10px] text-[#7d7165] text-center mt-1.5 px-2 italic bg-white/70 py-0.5 rounded-lg border border-[#ebe0d0] max-w-sm">
                💡 {currentChunk?.keyTip || currentPhase?.tip}
              </div>
            )}
          </div>
        )}

        {/* Bộ nút điều khiển bước (Controls) */}
        <div className="flex items-center justify-between gap-1.5 mt-2 pt-2 border-t border-[#f0e8db]">
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

          {/* Nút Xoay hết cụm hiện tại */}
          {!isFinished && currentChunk && (
            <button
              type="button"
              onClick={() => tutorPlayChunk(currentChunk.id)}
              disabled={isBusy}
              className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-semibold bg-[#faf6ee] hover:bg-white text-[#7a4820] disabled:opacity-40 rounded-xl border border-[#e2d8c7] shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              title="Tự động xoay hết các bước còn lại của cụm hiện tại"
            >
              <FastForward className="w-3 h-3 text-[#e07a5f]" />
              <span>Xong cụm này</span>
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

      {/* ── MODAL LỘ TRÌNH GIẢI CHI TIẾT THEO CỤM (ROUX ROADMAP) ── */}
      {isRoadmapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-white rounded-3xl border border-[#e8dfcf] shadow-2xl max-w-lg w-full max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#f0e8db] flex items-center justify-between bg-[#faf6ee]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#f4ebe1] flex items-center justify-center text-[#e07a5f]">
                  <Map className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2c221e]">
                    Toàn bộ Lộ trình Giải theo Cụm
                  </h3>
                  <p className="text-[11px] text-[#706459]">
                    Hiểu tư duy block-building từng bước của phương pháp Roux
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsRoadmapOpen(false)}
                className="p-1.5 text-[#8c7b6c] hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Danh sách các Chunks */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {tutorChunks.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#8c7b6c]">
                  Chưa có dữ liệu lộ trình cho lần giải này.
                </div>
              ) : (
                tutorChunks.map((chunk, idx) => {
                  const isDone = tutorCurrentIndex >= chunk.endIndex;
                  const isCurrent = tutorCurrentIndex >= chunk.startIndex && tutorCurrentIndex < chunk.endIndex;

                  return (
                    <div
                      key={chunk.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-[#fffaf0] border-[#e07a5f] shadow-sm ring-1 ring-[#e07a5f]/40'
                          : isDone
                          ? 'bg-[#f4f9f7] border-[#cce3dc]'
                          : 'bg-[#faf8f4] border-[#ebe0d0] opacity-80'
                      }`}
                    >
                      {/* Chunk Header */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isDone
                                ? 'bg-[#2a9d8f] text-white'
                                : isCurrent
                                ? 'bg-[#e07a5f] text-white animate-pulse'
                                : 'bg-[#e8dec0] text-[#706459]'
                            }`}
                          >
                            {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                          </span>
                          <div>
                            <span className="text-[10px] font-bold text-[#a06030] uppercase mr-1.5">
                              {chunk.phaseTitle}
                            </span>
                            <span className="text-xs font-bold text-[#2c221e]">
                              {chunk.chunkTitle}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge & Run Button */}
                        <div className="flex items-center gap-1.5">
                          {isCurrent && (
                            <button
                              type="button"
                              onClick={() => {
                                tutorPlayChunk(chunk.id);
                                setIsRoadmapOpen(false);
                              }}
                              disabled={isBusy}
                              className="px-2 py-0.5 bg-[#e07a5f] hover:bg-[#d4684c] text-white text-[10px] font-bold rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                              title="Tự động xoay cụm này"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Xoay cụm này</span>
                            </button>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isDone
                                ? 'bg-[#e3f4ef] text-[#247c72]'
                                : isCurrent
                                ? 'bg-[#fbece7] text-[#c45335]'
                                : 'bg-[#efebe4] text-[#807266]'
                            }`}
                          >
                            {isDone ? 'Đã xong' : isCurrent ? 'Đang giải' : 'Chưa tới'}
                          </span>
                        </div>
                      </div>

                      {/* Subtitle */}
                      <p className="text-[11px] text-[#706459] mb-2 pl-7">
                        {chunk.chunkSubtitle}
                      </p>

                      {/* Giải thích tư duy: Mục đích & Nhận biết */}
                      <div className="pl-7 space-y-1 text-[11px] pt-1.5 border-t border-black/5">
                        <div>
                          <span className="font-bold text-[#e07a5f] mr-1">🎯 Mục đích:</span>
                          <span className="text-[#3d332a]">{chunk.intent}</span>
                        </div>
                        <div>
                          <span className="font-bold text-[#2a9d8f] mr-1">🔍 Cách nhận biết:</span>
                          <span className="text-[#3d332a]">{chunk.recognition}</span>
                        </div>
                        {chunk.keyTip && (
                          <div className="text-[10px] italic text-[#706459] bg-white/60 p-1.5 rounded-lg border border-black/5 mt-1">
                            💡 Mẹo: {chunk.keyTip}
                          </div>
                        )}
                      </div>

                      {/* Danh sách moves */}
                      <div className="pl-7 mt-2 pt-1 flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-[#8c7b6c] mr-1">Moves ({chunk.moves.length}):</span>
                        {chunk.moves.map((m, mIdx) => (
                          <span
                            key={mIdx}
                            className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-[#2c221e] rounded border border-[#e2d8c7] shadow-2xs"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#faf6ee] border-t border-[#f0e8db] flex justify-end">
              <button
                type="button"
                onClick={() => setIsRoadmapOpen(false)}
                className="px-4 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Đã hiểu, quay lại xoay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

