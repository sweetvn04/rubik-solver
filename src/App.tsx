import { RubikCanvas } from './components/cube/RubikCanvas';
import { PlayerBar } from './components/ui/PlayerBar';
import { BookOpen, Wand2 } from 'lucide-react';

export default function App() {
  return (
    <main className="w-screen h-screen flex flex-col bg-[#f6f2e9] text-[#332b25] relative overflow-hidden select-none">
      {/* Header bar - Cozy Toy Style */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 pointer-events-none">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-[#e8dfcf] pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-[#e07a5f] flex items-center justify-center text-white font-bold text-sm shadow-inner">
            R
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#2c221e]">
              Roux Method VN
            </h1>
            <p className="text-[11px] text-[#7d7168]">
              Interactive 3D Guide & Solver
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/80 hover:bg-white text-[#4a3f35] rounded-xl border border-[#e8dfcf] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#3d5a80]" />
            <span>Bài học</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Tự giải (Auto Solve)</span>
          </button>
        </div>
      </header>

      {/* 3D Canvas Viewport */}
      <section className="flex-1 w-full h-full">
        <RubikCanvas />
      </section>

      {/* Bottom Floating Player Bar */}
      <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <PlayerBar />
      </footer>
    </main>
  );
}
