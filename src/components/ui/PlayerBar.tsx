import { useState } from 'react';
import { useRubikStore } from '../../store/useRubikStore';
import {
  RefreshCw,
  Shuffle,
  Play,
  X,
  Gauge,
  ChevronUp,
  ChevronDown,
  Terminal,
  Keyboard,
  Sparkles,
} from 'lucide-react';

const QUICK_MOVES = ['R', "R'", 'U', "U'", 'M', "M'", 'r', 'F', "F'"];

const ALL_BASIC_MOVES = [
  ['R', "R'", 'R2'],
  ['L', "L'", 'L2'],
  ['U', "U'", 'U2'],
  ['D', "D'", 'D2'],
  ['F', "F'", 'F2'],
  ['B', "B'", 'B2'],
];

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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [showKeyHints, setShowKeyHints] = useState(false);
  const [customAlg, setCustomAlg] = useState('');

  const handleRunCustomAlg = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customAlg.trim()) return;
    enqueueAlgorithm(customAlg.trim());
  };

  return (
    <div className="flex flex-col items-center gap-2 max-w-full px-4 select-none pointer-events-auto">
      {/* 1. Thanh trạng thái & Hàng đợi di chuyển */}
      <div className="flex items-center gap-2 px-3 py-1 bg-white/75 backdrop-blur-md rounded-xl text-[11px] text-[#6d6156] border border-[#e8dfcf] shadow-sm">
        <span className="font-semibold text-[#a06030]">Hàng đợi:</span>
        <span className="font-mono font-medium max-w-[280px] truncate">
          {moveQueue.length > 0
            ? `${moveQueue.map((m) => m.raw).slice(0, 10).join(' ')}${
                moveQueue.length > 10 ? '...' : ''
              }`
            : moveHistory.length > 0
            ? `Vừa xoay: ${moveHistory.slice(-6).join(' ')}`
            : 'Sẵn sàng'}
        </span>
      </div>

      {/* 2. Bảng nhập công thức tự do (Custom Algorithm Bar) */}
      {isInputOpen && (
        <div className="w-full max-w-md p-2.5 bg-white/90 backdrop-blur-md rounded-2xl border border-[#e8dfcf] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <form onSubmit={handleRunCustomAlg} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 flex-1 bg-[#faf6ee] px-2.5 py-1.5 rounded-xl border border-[#e4d9c7]">
              <Terminal className="w-3.5 h-3.5 text-[#8c7b6c]" />
              <input
                type="text"
                value={customAlg}
                onChange={(e) => setCustomAlg(e.target.value)}
                placeholder="Nhập công thức: R U R' U' M2..."
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

      {/* 3. Bảng đầy đủ ký hiệu xoay (Full Move Drawer) */}
      {isDrawerOpen && (
        <div className="w-full max-w-lg p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-[#e8dfcf] shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex flex-col gap-2.5">
            {/* Nhóm Mặt Cơ Bản */}
            <div>
              <div className="text-[10px] font-bold text-[#8c7b6c] uppercase tracking-wider mb-1">
                Mặt cơ bản (Standard WCA)
              </div>
              <div className="grid grid-cols-6 gap-1">
                {ALL_BASIC_MOVES.map((row) => (
                  <div key={row[0]} className="flex flex-col gap-0.5">
                    {row.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => enqueueMove(m)}
                        className="py-1 text-xs font-mono font-bold bg-[#faf6ee] hover:bg-white text-[#2c221e] rounded-lg border border-[#e2d8c7] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Nhóm Tầng Giữa Roux & Wide Moves */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#f0e8db]">
              <div>
                <div className="text-[10px] font-bold text-[#3d5a80] uppercase tracking-wider mb-1">
                  Tầng giữa Roux (Slice)
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {ROUX_SLICE_MOVES.map((row) => (
                    <div key={row[0]} className="flex flex-col gap-0.5">
                      {row.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => enqueueMove(m)}
                          className="py-1 text-xs font-mono font-bold bg-[#3d5a80] hover:bg-[#344e70] text-white rounded-lg border border-[#344d6d] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-[#2a9d8f] uppercase tracking-wider mb-1">
                  Xoay 2 tầng (Wide)
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {WIDE_MOVES.map((row) => (
                    <div key={row[0]} className="flex flex-col gap-0.5">
                      {row.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => enqueueMove(m)}
                          className="py-1 text-xs font-mono font-bold bg-[#2a9d8f] hover:bg-[#238b7f] text-white rounded-lg border border-[#208579] transition-all hover:scale-105 active:scale-95 cursor-pointer"
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

      {/* 4. Thanh điều khiển chính - Capsule Toy Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/85 backdrop-blur-md rounded-2xl border border-[#e8dfcf] shadow-lg flex-wrap justify-center">
        {/* Nút Xáo Scramble */}
        <button
          type="button"
          onClick={scramble}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Xáo khối 20 moves chuẩn WCA (Space)"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Xáo</span>
        </button>

        {/* Nút Reset */}
        <button
          type="button"
          onClick={reset}
          className="p-1.5 text-xs text-[#5c4f43] hover:bg-[#efe8dc] rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Khôi phục trạng thái hoàn thành (Esc)"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#e0d6c4] mx-0.5" />

        {/* Các nút xoay nhanh cơ bản */}
        <div className="flex items-center gap-1">
          {QUICK_MOVES.map((rawMove) => {
            const isRouxSpecial = rawMove.startsWith('M') || rawMove === 'r';
            return (
              <button
                key={rawMove}
                type="button"
                onClick={() => enqueueMove(rawMove)}
                className={`px-2 py-1 text-xs font-mono font-bold rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  isRouxSpecial
                    ? 'bg-[#3d5a80] text-white border-[#344d6d] hover:bg-[#344e70]'
                    : 'bg-[#faf6ee] hover:bg-white text-[#2c221e] border-[#e2d8c7]'
                }`}
                title={`Xoay ${rawMove}`}
              >
                {rawMove}
              </button>
            );
          })}
        </div>

        <div className="w-[1px] h-4 bg-[#e0d6c4] mx-0.5" />

        {/* Mở Drawer bảng moves đầy đủ */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isDrawerOpen
              ? 'bg-[#4a3f35] text-white border-[#3a3129]'
              : 'bg-[#f4efe5] hover:bg-[#eae2d4] text-[#4a3f35] border-[#dfd5c4]'
          }`}
          title="Xem toàn bộ bảng ký hiệu"
        >
          <span>Moves</span>
          {isDrawerOpen ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronUp className="w-3 h-3" />
          )}
        </button>

        {/* Mở ô nhập công thức tự do */}
        <button
          type="button"
          onClick={() => setIsInputOpen(!isInputOpen)}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isInputOpen
              ? 'bg-[#e07a5f] text-white border-[#cc6b52]'
              : 'bg-[#f4efe5] hover:bg-[#eae2d4] text-[#4a3f35] border-[#dfd5c4]'
          }`}
          title="Nhập chuỗi công thức bất kỳ"
        >
          <Sparkles className="w-3 h-3" />
          <span>Công thức</span>
        </button>

        {/* Điều chỉnh tốc độ xoay */}
        <button
          type="button"
          onClick={() => {
            if (turnDuration === 220) setTurnDuration(120); // Nhanh
            else if (turnDuration === 120) setTurnDuration(420); // Chậm
            else setTurnDuration(220); // Bình thường
          }}
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title={`Tốc độ xoay: ${turnDuration}ms (Click để đổi)`}
        >
          <Gauge className="w-3 h-3 text-[#e07a5f]" />
          <span className="font-mono text-[11px]">
            {turnDuration === 120 ? 'Nhanh' : turnDuration === 220 ? 'Vừa' : 'Chậm'}
          </span>
        </button>

        {/* Trợ giúp phím tắt */}
        <button
          type="button"
          onClick={() => setShowKeyHints(!showKeyHints)}
          className={`p-1.5 text-xs rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
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
            <strong className="font-mono">R, L, U, D, F, B, M</strong> (Giữ{' '}
            <strong className="font-mono">Shift</strong> để xoay ngược{' '})
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
