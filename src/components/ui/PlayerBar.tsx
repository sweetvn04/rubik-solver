import { useRubikStore } from '../../store/useRubikStore';
import { RotateCw, RefreshCw, Shuffle, Flame } from 'lucide-react';

const QUICK_MOVES = ['R', "R'", 'U', "U'", 'M', "M'", 'r', 'F', "F'"];

export function PlayerBar() {
  const enqueueMove = useRubikStore((s) => s.enqueueMove);
  const enqueueAlgorithm = useRubikStore((s) => s.enqueueAlgorithm);
  const scramble = useRubikStore((s) => s.scramble);
  const reset = useRubikStore((s) => s.reset);
  const moveQueue = useRubikStore((s) => s.moveQueue);
  const moveHistory = useRubikStore((s) => s.moveHistory);

  // Test một công thức kinh điển (Sexy Move: R U R' U' hoặc M2 U M2 U2 M2 U M2)
  const testSexyMove = () => enqueueAlgorithm("R U R' U'");
  const testRouxH = () => enqueueAlgorithm("M2 U M2 U2 M2 U M2");

  return (
    <div className="flex flex-col items-center gap-2 pointer-events-auto">
      {/* Lịch sử hoặc hàng đợi di chuyển */}
      <div className="flex items-center gap-2 px-3 py-1 bg-white/70 backdrop-blur-md rounded-xl text-[11px] text-[#6d6156] border border-[#e8dfcf] shadow-sm">
        <span className="font-semibold text-[#a06030]">Hàng đợi:</span>
        <span className="font-mono font-medium">
          {moveQueue.length > 0
            ? `${moveQueue.map((m) => m.raw).slice(0, 8).join(' ')}${
                moveQueue.length > 8 ? '...' : ''
              }`
            : moveHistory.length > 0
            ? `Vừa xoay: ${moveHistory.slice(-5).join(' ')}`
            : 'Sẵn sàng'}
        </span>
      </div>

      {/* Thanh nút bấm điều khiển - Phong cách Capsule Toy */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white/85 backdrop-blur-md rounded-2xl border border-[#e8dfcf] shadow-lg">
        {/* Nút Xáo Scramble */}
        <button
          type="button"
          onClick={scramble}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Xáo khối 20 moves chuẩn WCA"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Xáo</span>
        </button>

        {/* Nút Reset */}
        <button
          type="button"
          onClick={reset}
          className="p-1.5 text-xs text-[#5c4f43] hover:bg-[#efe8dc] rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Khôi phục trạng thái ban đầu"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#e0d6c4] mx-1" />

        {/* Các nút xoay nhanh */}
        <div className="flex items-center gap-1">
          {QUICK_MOVES.map((rawMove) => {
            const isRouxSpecial = rawMove.startsWith('M') || rawMove === 'r';
            return (
              <button
                key={rawMove}
                type="button"
                onClick={() => enqueueMove(rawMove)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
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

        <div className="w-[1px] h-4 bg-[#e0d6c4] mx-1" />

        {/* Nút test công thức mẫu (Sexy Move & Roux LSE H-perm) */}
        <button
          type="button"
          onClick={testSexyMove}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#f4a261] hover:bg-[#e7924e] text-white rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Chạy công thức R U R' U'"
        >
          <RotateCw className="w-3 h-3" />
          <span>R U R' U'</span>
        </button>

        <button
          type="button"
          onClick={testRouxH}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#2a9d8f] hover:bg-[#238b7f] text-white rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Chạy công thức Roux LSE M2 U M2 U2 M2 U M2"
        >
          <Flame className="w-3 h-3" />
          <span>M2 U M2</span>
        </button>
      </div>
    </div>
  );
}
