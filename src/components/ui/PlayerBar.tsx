import { useState } from 'react';
import { useRubikStore } from '../../store/useRubikStore';
import {
  RefreshCw,
  Shuffle,
  Play,
  X,
  Gauge,
  Terminal,
  Sparkles,
  Grid3X3,
  Volume2,
  VolumeX,
  Wand2,
  GraduationCap,
  SlidersHorizontal,
  Compass,
  Palette,
} from 'lucide-react';

export interface PlayerBarProps {
  onOpenInputModal?: () => void;
}

const BASIC_FACES = ['R', 'L', 'U', 'D', 'F', 'B'];

const ROUX_SLICE_MOVES = [
  ['M', "M'", 'M2'],
  ['E', "E'", 'E2'],
  ['S', "S'", 'S2'],
];

const WIDE_MOVES = [
  ['r', "r'", 'r2'],
  ['l', "l'", 'l2'],
  ['u', "u'", 'u2'],
];

const SAMPLE_ALGORITHMS = [
  { name: 'Sexy Move', alg: "R U R' U'" },
  { name: 'Sune', alg: "R U R' U R U2 R'" },
  { name: 'T-Perm', alg: "R U R' U' R' F R2 U' R' U' R U R' F'" },
  { name: 'Roux H-Perm', alg: "M2 U M2 U2 M2 U M2" },
  { name: 'Roux EOLR', alg: "M' U M' U M' U2 M U M" },
];

export function PlayerBar({ onOpenInputModal }: PlayerBarProps = {}) {
  const enqueueMove = useRubikStore((s) => s.enqueueMove);
  const enqueueAlgorithm = useRubikStore((s) => s.enqueueAlgorithm);
  const scramble = useRubikStore((s) => s.scramble);
  const reset = useRubikStore((s) => s.reset);
  const moveQueue = useRubikStore((s) => s.moveQueue);
  const moveHistory = useRubikStore((s) => s.moveHistory);
  const turnDuration = useRubikStore((s) => s.turnDuration);
  const setTurnDuration = useRubikStore((s) => s.setTurnDuration);
  const isMuted = useRubikStore((s) => s.isMuted);
  const toggleMute = useRubikStore((s) => s.toggleMute);
  const solveFullCube = useRubikStore((s) => s.solveFullCube);
  const startTutorMode = useRubikStore((s) => s.startTutorMode);

  const [isMovePadOpen, setIsMovePadOpen] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [customAlg, setCustomAlg] = useState('');
  const [solverFeedback, setSolverFeedback] = useState<string | null>(null);

  const handleStartTutorMode = () => {
    const res = startTutorMode();
    if (!res.success && res.message) {
      setSolverFeedback(`💡 ${res.message}`);
      setTimeout(() => {
        setSolverFeedback(null);
      }, 4000);
    }
  };

  const handleAutoSolveFullRoux = () => {
    const res = solveFullCube();
    if (!res) return;

    if (!res.isSuccess) {
      setSolverFeedback(`⚠️ ${res.errorMessage || 'Không tìm ra lời giải hoàn chỉnh.'}`);
    } else if (res.totalMovesCount === 0) {
      setSolverFeedback('✅ Khối Rubik đã được giải hoàn tất 100%!');
    } else {
      setSolverFeedback(
        `🎉 Giải xong 100%: FB(${res.fbMoves.length}) + SB(${res.sbMoves.length}) + CMLL(${res.cmllMoves.length}) + LSE(${res.lseMoves.length}) = ${res.totalMovesCount} bước (${res.durationMs.toFixed(0)}ms)`
      );
    }

    setTimeout(() => {
      setSolverFeedback(null);
    }, 7000);
  };

  const handleRunCustomAlg = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customAlg.trim()) return;
    enqueueAlgorithm(customAlg.trim());
  };

  return (
    <div className="flex flex-col items-center gap-1.5 max-w-[98vw] px-1 select-none pointer-events-auto">
      {/* Thông báo phản hồi kết quả giải FB & SB */}
      {solverFeedback && (
        <div className="px-3.5 py-1.5 bg-[#2a9d8f]/95 backdrop-blur-sm text-white text-xs font-medium rounded-xl shadow-lg border border-[#238b7f] animate-in fade-in slide-in-from-bottom-2 duration-200">
          {solverFeedback}
        </div>
      )}

      {/* ── 1. UNIFIED STATUS PILL: QUY ƯỚC MẶT + TRẠNG THÁI HÀNG ĐỢI ── */}
      <div className="relative flex items-center gap-1.5 px-2.5 py-1 bg-white/85 backdrop-blur-md rounded-xl text-[11px] text-[#6d6156] border border-[#e8dfcf] shadow-xs">
        {/* Nút bật/tắt Quy ước mặt */}
        <button
          type="button"
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="flex items-center gap-1 text-[#a06030] hover:text-[#2c221e] font-bold cursor-pointer transition-colors whitespace-nowrap"
          title="Xem quy ước màu các mặt Rubik"
        >
          <Compass className="w-3.5 h-3.5 text-[#e07a5f] shrink-0" />
          <span>Mặt</span>
        </button>

        <span className="text-[#d8cdbd]">|</span>

        {/* Trạng thái Hàng đợi / Vừa xoay */}
        <div className="flex items-center gap-1 min-w-0 max-w-[190px] sm:max-w-[320px]">
          <span className="text-[#8c7b6c] shrink-0 font-medium text-[10px] sm:text-[11px]">
            {moveQueue.length > 0 ? 'Đang xoay:' : moveHistory.length > 0 ? 'Vừa xoay:' : 'Trạng thái:'}
          </span>
          <span className="font-mono font-bold text-[#2c221e] truncate text-[10px] sm:text-[11px]">
            {moveQueue.length > 0
              ? `${moveQueue.map((m) => m.raw).slice(0, 8).join(' ')}${moveQueue.length > 8 ? '...' : ''}`
              : moveHistory.length > 0
              ? moveHistory.slice(-5).join(' ')
              : 'Sẵn sàng'}
          </span>
        </div>

        {/* Popover Bảng màu quy ước 6 mặt khi bấm nút "Mặt" */}
        {isLegendOpen && (
          <div className="absolute bottom-full mb-2 left-0 sm:left-1/2 sm:-translate-x-1/2 p-3 bg-white/98 backdrop-blur-xl rounded-2xl border border-[#e8dfcf] shadow-xl w-48 z-40 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#f0e8db] mb-2">
              <span className="text-[10px] font-bold text-[#2c221e] flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#e07a5f]" />
                Quy ước 6 mặt Roux
              </span>
              <button
                type="button"
                onClick={() => setIsLegendOpen(false)}
                className="text-[#a89b8d] hover:text-[#2c221e] p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#f4d06f] border border-black/10 shrink-0" />
                <span className="font-medium text-[#2c221e]">U — Vàng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#ffffff] border border-black/15 shrink-0" />
                <span className="font-medium text-[#2c221e]">D — Trắng</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#52b788] border border-black/10 shrink-0" />
                <span className="font-medium text-[#2c221e]">F — Xanh lá</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#3d5a80] border border-black/10 shrink-0" />
                <span className="font-medium text-[#2c221e]">B — Xanh lam</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#e63946] border border-black/10 shrink-0" />
                <span className="font-medium text-[#2c221e]">L — Đỏ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-[#f77f00] border border-black/10 shrink-0" />
                <span className="font-medium text-[#2c221e]">R — Cam</span>
              </div>
            </div>
            <p className="text-[9px] text-[#8c7b6c] mt-2 pt-1 border-t border-[#f0e8db] leading-tight italic">
              📐 Chuẩn Roux: F Xanh lá phía trước, U Vàng trên cùng.
            </p>
          </div>
        )}
      </div>

      {/* ── 2. Ô NHẬP CÔNG THỨC TÙY Ý ── */}
      {isInputOpen && (
        <div className="w-full max-w-sm sm:max-w-md p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-[#e8dfcf] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8c7b6c] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e07a5f]" />
              Nhập chuỗi công thức
            </span>
            <button
              type="button"
              onClick={() => setIsInputOpen(false)}
              className="p-1 text-[#8c7b6c] hover:text-[#332b25] rounded-lg hover:bg-[#efe8dc] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleRunCustomAlg} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 flex-1 bg-[#faf6ee] px-2.5 py-1.5 rounded-xl border border-[#e4d9c7]">
              <Terminal className="w-3.5 h-3.5 text-[#8c7b6c] shrink-0" />
              <input
                type="text"
                value={customAlg}
                onChange={(e) => setCustomAlg(e.target.value)}
                placeholder="Ví dụ: R U R' U' M2 U M..."
                className="w-full text-xs font-mono text-[#2c221e] bg-transparent outline-none placeholder:text-[#a89b8d]"
              />
              {customAlg && (
                <button
                  type="button"
                  onClick={() => setCustomAlg('')}
                  className="text-[#a89b8d] hover:text-[#5c4f43]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!customAlg.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] disabled:opacity-50 text-white rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Chạy</span>
            </button>
          </form>

          {/* Công thức mẫu thông dụng */}
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#f0e8db] overflow-x-auto text-[10px]">
            <span className="text-[#8c7b6c] shrink-0 font-medium">Mẫu:</span>
            {SAMPLE_ALGORITHMS.map(({ name, alg }) => (
              <button
                key={name}
                type="button"
                onClick={() => enqueueAlgorithm(alg)}
                className="px-2 py-0.5 bg-[#f5efe4] hover:bg-[#eae1d3] text-[#4a3f35] font-mono rounded-md shrink-0 border border-[#e2d7c5] transition-colors cursor-pointer"
                title={alg}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. HỘP MOVES (BẢNG KÝ HIỆU) ── */}
      {isMovePadOpen && (
        <div className="w-full max-w-sm sm:max-w-md max-h-[60vh] overflow-y-auto p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-[#e8dfcf] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#f0e8db]">
            <span className="text-[11px] font-bold text-[#8c7b6c] uppercase tracking-wider flex items-center gap-1.5">
              <Grid3X3 className="w-3.5 h-3.5 text-[#3d5a80]" />
              Hộp Moves (Bảng Ký Hiệu)
            </span>
            <button
              type="button"
              onClick={() => setIsMovePadOpen(false)}
              className="p-1 text-[#8c7b6c] hover:text-[#332b25] rounded-lg hover:bg-[#efe8dc] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Cụm 1: 6 Mặt cơ bản WCA */}
            <div>
              <div className="text-[10px] font-semibold text-[#8c7b6c] mb-1">
                6 Mặt cơ bản (WCA)
              </div>
              <div className="grid grid-cols-6 gap-1">
                {BASIC_FACES.map((face) => (
                  <div key={face} className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => enqueueMove(face)}
                      className="h-8 flex items-center justify-center text-xs font-mono font-bold bg-[#faf6ee] hover:bg-white active:scale-90 text-[#2c221e] rounded-lg border border-[#e2d8c7] shadow-xs transition-all cursor-pointer"
                    >
                      {face}
                    </button>
                    <button
                      type="button"
                      onClick={() => enqueueMove(`${face}'`)}
                      className="h-7 flex items-center justify-center text-[11px] font-mono font-bold bg-[#f3ebe0] hover:bg-[#eae0d2] active:scale-90 text-[#7a4820] rounded-lg border border-[#dfd2c0] transition-all cursor-pointer"
                    >
                      {face}'
                    </button>
                    <button
                      type="button"
                      onClick={() => enqueueMove(`${face}2`)}
                      className="h-6 flex items-center justify-center text-[10px] font-mono font-semibold bg-[#eae0d2] hover:bg-[#dfd3c2] active:scale-90 text-[#544133] rounded-lg border border-[#d6c7b2] transition-all cursor-pointer"
                    >
                      {face}2
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Cụm 2: Tầng Roux Slice & Wide Moves */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f0e8db]">
              <div>
                <div className="text-[10px] font-bold text-[#3d5a80] mb-1">
                  Tầng giữa Roux (Slice)
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {ROUX_SLICE_MOVES.map((row) => (
                    <div key={row[0]} className="flex flex-col gap-1">
                      {row.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => enqueueMove(m)}
                          className="h-7 flex items-center justify-center text-[11px] font-mono font-bold bg-[#3d5a80] hover:bg-[#344e70] active:scale-90 text-white rounded-lg border border-[#344d6d] shadow-xs transition-all cursor-pointer"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-[#2a9d8f] mb-1">
                  Xoay 2 tầng (Wide)
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {WIDE_MOVES.map((row) => (
                    <div key={row[0]} className="flex flex-col gap-1">
                      {row.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => enqueueMove(m)}
                          className="h-7 flex items-center justify-center text-[11px] font-mono font-bold bg-[#2a9d8f] hover:bg-[#238b7f] active:scale-90 text-white rounded-lg border border-[#208579] shadow-xs transition-all cursor-pointer"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. THANH DOCK CHÍNH - TINH GỌN, CHUẨN MOBILE, HƯỚNG ĐẾN RUBIK THẬT NGOÀI ĐỜI ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-white/92 backdrop-blur-xl rounded-2xl border border-[#e8dfcf] shadow-md max-w-full">
        {/* Nút 1: Nhập Rubik thật ngoài đời (Primary Action) */}
        <button
          type="button"
          onClick={onOpenInputModal}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          title="Nhập màu trạng thái cục Rubik thật ngoài đời để nhận lộ trình giải Roux"
        >
          <Palette className="w-4 h-4 shrink-0" />
          <span>Nhập Rubik thật</span>
        </button>

        {/* Nút 2: Hướng dẫn giải từng bước (Tutor Mode) */}
        <button
          type="button"
          onClick={handleStartTutorMode}
          disabled={moveQueue.length > 0}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold bg-[#3d5a80] hover:bg-[#344d6d] disabled:opacity-40 text-white rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
          title="Bật chế độ hướng dẫn giải từng bước (Tutor Mode)"
        >
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span>Hướng dẫn giải</span>
        </button>

        {/* Nút 3: Menu Tiện Ích & Tùy Chọn Khối Ảo */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              if (!isMenuOpen) {
                setIsMovePadOpen(false);
                setIsInputOpen(false);
              }
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer shrink-0 ${
              isMenuOpen
                ? 'bg-[#2c221e] text-white border-[#2c221e] shadow-xs'
                : 'bg-[#faf6ee] hover:bg-white text-[#5c4f43] border-[#e2d8c7]'
            }`}
            title="Tiện ích & Tùy chọn (Xáo ảo, Đặt lại, Tự giải demo, Moves, Tốc độ)"
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0" />
          </button>

          {/* Popover Tiện Ích Mô Phỏng Ảo */}
          {isMenuOpen && (
            <div className="absolute bottom-full mb-2 right-0 p-3 bg-white/98 backdrop-blur-xl rounded-2xl border border-[#e8dfcf] shadow-xl w-64 z-40 animate-in fade-in zoom-in-95 duration-150 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#f0e8db]">
                <span className="text-[11px] font-bold text-[#2c221e] flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-[#e07a5f]" />
                  Tiện ích mô phỏng ảo
                </span>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[#a89b8d] hover:text-[#2c221e] p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Nhóm thao tác khối ảo */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-[#8c7b6c]">
                  Thao tác khối ảo:
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      scramble();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 bg-[#fbf0ec] hover:bg-[#fae4dc] text-[#d4684c] text-[11px] font-bold rounded-xl border border-[#f5ccbf] transition-all active:scale-95 cursor-pointer"
                    title="Xáo ngẫu nhiên 20 bước WCA"
                  >
                    <Shuffle className="w-3 h-3 shrink-0" />
                    <span>Xáo ảo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 bg-[#faf6ee] hover:bg-white text-[#5c4f43] text-[11px] font-bold rounded-xl border border-[#e2d8c7] transition-all active:scale-95 cursor-pointer"
                    title="Đặt lại khối về trạng thái hoàn thành"
                  >
                    <RefreshCw className="w-3 h-3 shrink-0" />
                    <span>Đặt lại</span>
                  </button>
                </div>

                {/* Tự giải demo */}
                <button
                  type="button"
                  onClick={() => {
                    handleAutoSolveFullRoux();
                    setIsMenuOpen(false);
                  }}
                  disabled={moveQueue.length > 0}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#eef7f5] hover:bg-[#e0f1ed] text-[#247c72] text-[11px] font-bold rounded-xl border border-[#cbe3dd] transition-all active:scale-95 cursor-pointer disabled:opacity-40"
                  title="Tự động xoay demo toàn bộ 4 bước Roux 100%"
                >
                  <Wand2 className="w-3 h-3 shrink-0" />
                  <span>Tự giải demo (Máy tính xoay)</span>
                </button>

                {/* Hộp phím xoay Moves */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMovePadOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#faf6ee] hover:bg-white text-[#2c221e] text-[11px] font-bold rounded-xl border border-[#e2d8c7] transition-all cursor-pointer"
                  title="Mở bảng phím xoay ảo (R, U, F, M...)"
                >
                  <Grid3X3 className="w-3 h-3 shrink-0 text-[#3d5a80]" />
                  <span>Bảng phím xoay (Moves)</span>
                </button>
              </div>

              {/* Cài đặt tốc độ & âm thanh */}
              <div className="pt-2 border-t border-[#f0e8db] space-y-2">
                <div>
                  <div className="text-[10px] font-semibold text-[#8c7b6c] mb-1 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-[#e07a5f]" />
                    Tốc độ xoay tự do:
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { label: 'Nhanh', ms: 120 },
                      { label: 'Vừa', ms: 220 },
                      { label: 'Chậm', ms: 420 },
                    ].map((spd) => (
                      <button
                        key={spd.ms}
                        type="button"
                        onClick={() => setTurnDuration(spd.ms)}
                        className={`py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                          turnDuration === spd.ms
                            ? 'bg-[#e07a5f] text-white border-[#cc6b52] shadow-2xs'
                            : 'bg-[#faf6ee] text-[#5c4f43] border-[#e2d8c7] hover:bg-white'
                        }`}
                      >
                        {spd.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Âm thanh xoay ASMR */}
                <div className="flex items-center justify-between pt-1 border-t border-[#f0e8db]">
                  <span className="text-[10px] font-semibold text-[#8c7b6c] flex items-center gap-1">
                    {isMuted ? (
                      <VolumeX className="w-3 h-3 text-[#a89b8d]" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-[#e07a5f]" />
                    )}
                    Âm click ASMR:
                  </span>
                  <button
                    type="button"
                    onClick={toggleMute}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                      isMuted
                        ? 'bg-[#faf6ee] text-[#8c7b6c] border-[#e2d8c7]'
                        : 'bg-[#fbf0ec] text-[#e07a5f] border-[#f4c8bc]'
                    }`}
                  >
                    {isMuted ? 'Tắt' : 'Bật'}
                  </button>
                </div>

                {/* Nhập chuỗi công thức */}
                <div className="pt-1 border-t border-[#f0e8db]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsInputOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#faf6ee] hover:bg-white text-[#2c221e] text-[11px] font-bold rounded-xl border border-[#e2d8c7] transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#e07a5f]" />
                    <span>Nhập công thức tùy ý</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
