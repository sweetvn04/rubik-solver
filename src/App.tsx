import { useState } from 'react';
import { RubikCanvas } from './components/cube/RubikCanvas';
import { PlayerBar } from './components/ui/PlayerBar';
import { TutorCard } from './components/ui/TutorCard';
import { LessonDrawer } from './components/ui/LessonDrawer';
import { useRubikStore } from './store/useRubikStore';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { BookOpen } from 'lucide-react';

export default function App() {
  useKeyboardControls();
  const isTutorActive = useRubikStore((s) => s.isTutorActive);
  const [isLessonOpen, setIsLessonOpen] = useState(false);

  return (
    <main className="w-screen h-dvh min-h-dvh max-h-dvh flex flex-col bg-[#f6f2e9] text-[#332b25] relative overflow-hidden select-none">
      {/* Header bar - Tối giản tinh tế để tập trung vào khối Rubik */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 sm:p-4 pointer-events-none">
        {/* Logo Roux Method VN */}
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-[#e8dfcf] shadow-xs pointer-events-auto">
          <div className="w-5 h-5 rounded-md bg-[#e07a5f] flex items-center justify-center text-white font-bold text-xs shadow-inner">
            R
          </div>
          <span className="text-xs font-bold tracking-tight text-[#2c221e]">
            Roux Method VN
          </span>
        </div>

        {/* Nút mở Thư viện Giáo trình & Tra cứu 45 CMLL */}
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsLessonOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/85 hover:bg-white text-[#2c221e] text-xs font-bold rounded-xl border border-[#e8dfcf] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Mở Thư viện Giáo trình Roux & Tra cứu 45 CMLL"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#e07a5f]" />
            <span className="hidden xs:inline sm:inline">Giáo trình & CMLL</span>
            <span className="xs:hidden sm:hidden">Lý thuyết</span>
          </button>
        </div>
      </header>

      {/* 3D Canvas Viewport */}
      <section className="flex-1 w-full h-full relative">
        <RubikCanvas />

        {/* Cozy Studio Vignette Overlay: Spotlight dịu dàng ở trung tâm và viền tối ấm ở 4 góc */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 46%, rgba(255, 253, 248, 0.35) 0%, transparent 58%), radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(160, 135, 110, 0.15) 75%, rgba(110, 85, 60, 0.25) 100%)',
          }}
        />
      </section>

      {/* Tutor Mode Card: Nằm fixed ở góc phải màn hình Desktop, hoặc ở đáy có chế độ thu gọn trên Mobile */}
      {isTutorActive ? (
        <TutorCard />
      ) : (
        /* Bottom Floating Player Bar - Căn chuẩn đáy màn hình di động có tính Safe Area */
        <footer className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full flex justify-center px-2">
          <PlayerBar />
        </footer>
      )}

      {/* Drawer Thư viện Giáo trình Roux & Tra cứu 45 CMLL */}
      <LessonDrawer
        isOpen={isLessonOpen}
        onClose={() => setIsLessonOpen(false)}
      />
    </main>
  );
}
