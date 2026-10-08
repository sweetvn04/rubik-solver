import { useState } from 'react';
import { useRubikStore } from '../../store/useRubikStore';
import {
  RefreshCw,
  Shuffle,
  Play,
  X,
  Gauge,
  Terminal,
  Keyboard,
  Sparkles,
  Grid3X3,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';

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

export function PlayerBar() {
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
  const solveFirstTwoBlocks = useRubikStore((s) => s.solveFirstTwoBlocks);

  const [isMovePadOpen, setIsMovePadOpen] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [showKeyHints, setShowKeyHints] = useState(false);
  const [customAlg, setCustomAlg] = useState('');
  const [solverFeedback, setSolverFeedback] = useState<string | null>(null);

  const handleAutoSolveFB_SB = () => {
    const res = solveFirstTwoBlocks();
    if (!res) return;

    if (res.isAlreadySolved) {
      setSolverFeedback('✅ Khối 1 & 2 (FB & SB) đã hoàn thành sẵn!');
    } else {
      const total = res.fbMoves.length + res.sbMoves.length;
      setSolverFeedback(
        `✨ FB (${res.fbMoves.length}) + SB (${res.sbMoves.length}) = ${total} bước (${res.durationMs.toFixed(0)}ms)`
      );
    }

    setTimeout(() => {
      setSolverFeedback(null);
    }, 5000);
  };

  const handleRunCustomAlg = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customAlg.trim()) return;
    enqueueAlgorithm(customAlg.trim());
  };

  return (
    <div className="flex flex-col items-center gap-2 max-w-[95vw] px-2 select-none pointer-events-auto">
      {/* Thông báo phản hồi kết quả giải FB & SB */}
      {solverFeedback && (
        <div className="px-3.5 py-1.5 bg-[#2a9d8f]/95 backdrop-blur-sm text-white text-xs font-medium rounded-xl shadow-lg border border-[#238b7f] animate-in fade-in slide-in-from-bottom-2 duration-200">
          {solverFeedback}
        </div>
      )}

      {/* 1. Lịch sử hoặc hàng đợi di chuyển */}
      <div className="flex items-center gap-2 px-3 py-1 bg-white/75 backdrop-blur-md rounded-xl text-[11px] text-[#6d6156] border border-[#e8dfcf] shadow-sm">
        <span className="font-semibold text-[#a06030]">Hàng đợi:</span>
        <span className="font-mono font-medium max-w-[260px] sm:max-w-[360px] truncate">
          {moveQueue.length > 0
            ? `${moveQueue.map((m) => m.raw).slice(0, 10).join(' ')}${
                moveQueue.length > 10 ? '...' : ''
              }`
            : moveHistory.length > 0
            ? `Vừa xoay: ${moveHistory.slice(-6).join(' ')}`
            : 'Sẵn sàng'}
        </span>
      </div>

      {/* 2. Ô nhập công thức tùy ý (Custom Algorithm Bar) */}
      {isInputOpen && (
        <div className="w-full max-w-md p-3 bg-white/92 backdrop-blur-md rounded-2xl border border-[#e8dfcf] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8c7b6c] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e07a5f]" />
              Nhập chuỗi công thức
            </span>
            <button
              type="button"
              onClick={() => setIsInputOpen(false)}
              className="p-1 text-[#8c7b6c] hover:text-[#332b25] rounded-lg hover:bg-[#efe8dc] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleRunCustomAlg} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 flex-1 bg-[#faf6ee] px-2.5 py-1.5 rounded-xl border border-[#e4d9c7]">
              <Terminal className="w-3.5 h-3.5 text-[#8c7b6c]" />
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
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] disabled:opacity-50 text-white rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Chạy</span>
            </button>
          </form>

          {/* Công thức mẫu thông dụng */}
          <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-[#f0e8db] overflow-x-auto text-[10px]">
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

      {/* 3. "HỘP MOVES" (Floating Move Pad) - Bảng phím bấm chuyên dụng */}
      {isMovePadOpen && (
        <div className="w-full max-w-sm sm:max-w-md max-h-[65vh] overflow-y-auto p-3 bg-white/92 backdrop-blur-md rounded-2xl border border-[#e8dfcf] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#f0e8db]">
            <span className="text-[11px] font-bold text-[#8c7b6c] uppercase tracking-wider flex items-center gap-1.5">
              <Grid3X3 className="w-3.5 h-3.5 text-[#3d5a80]" />
              Hộp Moves (Bảng Ký Hiệu)
            </span>
            <button
              type="button"
              onClick={() => setIsMovePadOpen(false)}
              className="p-1 text-[#8c7b6c] hover:text-[#332b25] rounded-lg hover:bg-[#efe8dc] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Cụm 1: 6 Mặt cơ bản WCA (Lưới 6 cột x 3 hàng: Thuận, Nghịch ', Đôi 2) */}
            <div>
              <div className="text-[10px] font-semibold text-[#8c7b6c] mb-1">
                6 Mặt cơ bản (WCA)
              </div>
              <div className="grid grid-cols-6 gap-1">
                {BASIC_FACES.map((face) => (
                  <div key={face} className="flex flex-col gap-1">
                    {/* Move thuận (R, L, U...) */}
                    <button
                      type="button"
                      onClick={() => enqueueMove(face)}
                      className="h-8 flex items-center justify-center text-xs font-mono font-bold bg-[#faf6ee] hover:bg-white active:scale-90 text-[#2c221e] rounded-lg border border-[#e2d8c7] shadow-xs transition-all cursor-pointer"
                    >
                      {face}
                    </button>
                    {/* Move nghịch (R', L', U'...) */}
                    <button
                      type="button"
                      onClick={() => enqueueMove(`${face}'`)}
                      className="h-7 flex items-center justify-center text-[11px] font-mono font-bold bg-[#f3ebe0] hover:bg-[#eae0d2] active:scale-90 text-[#7a4820] rounded-lg border border-[#dfd2c0] transition-all cursor-pointer"
                    >
                      {face}'
                    </button>
                    {/* Move xoay đôi 180 độ (R2, L2, U2...) */}
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

            {/* Cụm 2: Tầng Roux đặc trưng & Wide Moves */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f0e8db]">
              {/* Roux Slice Moves */}
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

              {/* 2-Layer Wide Moves */}
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

      {/* 4. Thanh điều khiển chính - Minimalist Dock (Gọn gàng & Tinh tế) */}
      <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-white/88 backdrop-blur-md rounded-2xl border border-[#e8dfcf] shadow-lg max-w-full">
        {/* Nút Xáo Scramble */}
        <button
          type="button"
          onClick={scramble}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Xáo khối 20 moves chuẩn WCA (Phím Space)"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Xáo</span>
        </button>

        {/* Nút Reset */}
        <button
          type="button"
          onClick={reset}
          className="p-1.5 text-xs text-[#5c4f43] hover:bg-[#efe8dc] rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Khôi phục trạng thái hoàn thành (Phím Esc)"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Nút Tự giải FB & SB */}
        <button
          type="button"
          onClick={handleAutoSolveFB_SB}
          disabled={moveQueue.length > 0}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold bg-[#2a9d8f] hover:bg-[#238b7f] disabled:opacity-40 text-white rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          title="Tự động tính toán & diễn hoạt giải First Block và Second Block"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">Giải FB+SB</span>
          <span className="xs:hidden sm:hidden">Giải</span>
        </button>

        <div className="w-[1px] h-4 bg-[#e0d6c4] mx-0.5" />

        {/* Nút mở HỘP MOVES */}
        <button
          type="button"
          onClick={() => {
            setIsMovePadOpen(!isMovePadOpen);
            if (!isMovePadOpen) setIsInputOpen(false);
          }}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isMovePadOpen
              ? 'bg-[#3d5a80] text-white border-[#344d6d] shadow-sm'
              : 'bg-[#faf6ee] hover:bg-white text-[#2c221e] border-[#e2d8c7]'
          }`}
          title="Bật/Tắt Hộp Moves (Bảng ký hiệu)"
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span>Moves</span>
        </button>

        {/* Nút mở Ô NHẬP CÔNG THỨC */}
        <button
          type="button"
          onClick={() => {
            setIsInputOpen(!isInputOpen);
            if (!isInputOpen) setIsMovePadOpen(false);
          }}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isInputOpen
              ? 'bg-[#e07a5f] text-white border-[#cc6b52] shadow-sm'
              : 'bg-[#faf6ee] hover:bg-white text-[#2c221e] border-[#e2d8c7]'
          }`}
          title="Nhập chuỗi công thức bất kỳ"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">Công thức</span>
        </button>

        <div className="w-[1px] h-4 bg-[#e0d6c4] mx-0.5" />

        {/* Điều chỉnh tốc độ xoay */}
        <button
          type="button"
          onClick={() => {
            if (turnDuration === 220) setTurnDuration(120); // Nhanh
            else if (turnDuration === 120) setTurnDuration(420); // Chậm
            else setTurnDuration(220); // Bình thường
          }}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title={`Tốc độ xoay: ${turnDuration}ms (Click để đổi)`}
        >
          <Gauge className="w-3.5 h-3.5 text-[#e07a5f]" />
          <span className="font-mono text-[11px] hidden sm:inline">
            {turnDuration === 120 ? 'Nhanh' : turnDuration === 220 ? 'Vừa' : 'Chậm'}
          </span>
        </button>

        {/* Nút bật/tắt âm thanh xúc giác (Tactile ASMR Sound) */}
        <button
          type="button"
          onClick={toggleMute}
          className={`p-1.5 text-xs rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isMuted
              ? 'bg-[#faf6ee] text-[#b0a293] border-[#e2d8c7]'
              : 'bg-[#faf6ee] hover:bg-white text-[#e07a5f] border-[#e2d8c7]'
          }`}
          title={isMuted ? 'Bật âm thanh click (ASMR)' : 'Tắt âm thanh'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Trợ giúp phím tắt - Ẩn trên Mobile vì điện thoại không có bàn phím cứng */}
        <button
          type="button"
          onClick={() => setShowKeyHints(!showKeyHints)}
          className={`hidden sm:flex p-1.5 text-xs rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            showKeyHints
              ? 'bg-[#3d5a80] text-white border-[#344d6d]'
              : 'bg-[#faf6ee] hover:bg-white text-[#5c4f43] border-[#e2d8c7]'
          }`}
          title="Xem phím tắt bàn phím"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. Gợi ý phím tắt bàn phím (Keyboard Hint) */}
      {showKeyHints && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-xl text-[11px] text-[#5c4f43] border border-[#e8dfcf] shadow-sm animate-in fade-in duration-200">
          <span className="font-bold text-[#3d5a80]">⌨ Phím tắt:</span>
          <span>
            <strong className="font-mono">R, L, U, D, F, B, M</strong> (+{' '}
            <strong className="font-mono">Shift</strong> xoay ngược{' '})
          </span>
          <span className="text-[#a89b8d]">|</span>
          <span>
            <strong className="font-mono">Space</strong>: Xáo
          </span>
          <span className="text-[#a89b8d]">|</span>
          <span>
            <strong className="font-mono">Esc</strong>: Reset
          </span>
        </div>
      )}
    </div>
  );
}
