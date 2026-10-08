import { RubikCanvas } from './components/cube/RubikCanvas';
import { PlayerBar } from './components/ui/PlayerBar';
import { useKeyboardControls } from './hooks/useKeyboardControls';

export default function App() {
  useKeyboardControls();

  return (
    <main className="w-screen h-dvh min-h-dvh max-h-dvh flex flex-col bg-[#f6f2e9] text-[#332b25] relative overflow-hidden select-none">
      {/* Header bar - Tối giản tối đa để tập trung vào khối Rubik */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 sm:p-4 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/75 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#e8dfcf] shadow-xs pointer-events-auto">
          <div className="w-5 h-5 rounded-md bg-[#e07a5f] flex items-center justify-center text-white font-bold text-xs shadow-inner">
            R
          </div>
          <span className="text-xs font-bold tracking-tight text-[#2c221e]">
            Roux Method VN
          </span>
        </div>
      </header>

      {/* 3D Canvas Viewport */}
      <section className="flex-1 w-full h-full relative">
        <RubikCanvas />

        {/* Cozy Studio Vignette Overlay: Spotlight dịu dàng ở trung tâm và viền tối ấm ở 4 góc (0 draw call, 0% GPU) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 46%, rgba(255, 253, 248, 0.35) 0%, transparent 58%), radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(160, 135, 110, 0.15) 75%, rgba(110, 85, 60, 0.25) 100%)',
          }}
        />
      </section>

      {/* Bottom Floating Player Bar - Căn chuẩn đáy màn hình di động có tính Safe Area */}
      <footer className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full flex justify-center px-2">
        <PlayerBar />
      </footer>
    </main>
  );
}

