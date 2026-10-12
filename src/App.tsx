import { useState, useRef, useCallback } from 'react';
import { RubikCanvas } from './components/cube/RubikCanvas';
import { PlayerBar } from './components/ui/PlayerBar';
import { TutorCard } from './components/ui/TutorCard';
import { LessonDrawer } from './components/ui/LessonDrawer';
import { CubeInputModal } from './components/ui/CubeInputModal';
import { OrientationLegend } from './components/ui/OrientationLegend';
import { TopNavbar } from './components/ui/TopNavbar';
import { useRubikStore } from './store/useRubikStore';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { MonitorPlay, X } from 'lucide-react';

export default function App() {
  useKeyboardControls();
  const isTutorActive = useRubikStore((s) => s.isTutorActive);
  const [activeView, setActiveView] = useState<'workspace' | 'theory'>('workspace');
  const [demoToastInfo, setDemoToastInfo] = useState<string | null>(null);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);

  // Reset camera callback được expose từ RubikCanvas
  const resetCameraRef = useRef<(() => void) | null>(null);
  const handleCameraReset = useCallback((fn: () => void) => {
    resetCameraRef.current = fn;
  }, []);

  return (
    <main className="w-screen h-dvh min-h-dvh max-h-dvh flex flex-col bg-[#f6f2e9] text-[#332b25] relative overflow-hidden select-none">
      {/* ── 1. TOP NAVBAR CHUẨN WEB 2026 ── */}
      <TopNavbar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          if (view === 'theory') setDemoToastInfo(null);
        }}
        onOpenInputModal={() => setIsInputModalOpen(true)}
        onResetCamera={() => resetCameraRef.current?.()}
      />

      {/* ── 2. VIEWPORT CHÍNH: BÀN XOAY 3D HOẶC GIÁO TRÌNH ── */}
      {/* 2A. CHẾ ĐỘ BÀN XOAY 3D (WORKSPACE) */}
      <section
        className={`flex-1 w-full h-full relative overflow-hidden ${
          activeView === 'workspace' ? 'flex flex-col' : 'hidden'
        }`}
      >
        {/* Banner thông báo khi chuyển từ bài học sang xem demo 3D */}
        {demoToastInfo && (
          <div className="absolute top-14 sm:top-18 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 bg-white/95 backdrop-blur-md text-xs font-bold text-[#2c221e] rounded-xl border border-[#e8dfcf] shadow-md animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
            <MonitorPlay className="w-3.5 h-3.5 text-[#e07a5f]" />
            <span className="truncate max-w-[180px] sm:max-w-xs">
              Minh hoạ: {demoToastInfo}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveView('theory');
                setDemoToastInfo(null);
              }}
              className="ml-1 px-2.5 py-1 bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
            >
              ‹ Quay lại bài học
            </button>
            <button
              type="button"
              onClick={() => setDemoToastInfo(null)}
              className="p-1 text-[#8c7b6c] hover:text-[#2c221e] rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3D Canvas Viewport */}
        <div className="flex-1 w-full h-full relative">
          <RubikCanvas onResetCamera={handleCameraReset} />

          {/* Cozy Studio Vignette Overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 46%, rgba(255, 253, 248, 0.35) 0%, transparent 58%), radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(160, 135, 110, 0.15) 75%, rgba(110, 85, 60, 0.25) 100%)',
            }}
          />

          {/* Legend quy ước màu mặt Rubik — góc dưới trái màn hình */}
          {!isTutorActive && <OrientationLegend />}
        </div>

        {/* Tutor Mode Card hoặc Bottom Player Bar */}
        {isTutorActive ? (
          <TutorCard />
        ) : (
          <footer className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] left-1/2 -translate-x-1/2 z-20 pointer-events-auto w-full flex justify-center px-2">
            <PlayerBar />
          </footer>
        )}
      </section>

      {/* 2B. CHẾ ĐỘ GIÁO TRÌNH LÝ THUYẾT (THEORY VIEW TOÀN TRANG) */}
      {activeView === 'theory' && (
        <section className="flex-1 w-full h-full relative overflow-hidden pt-13 sm:pt-16">
          <LessonDrawer
            isOpen={true}
            isFullPage={true}
            onClose={() => setActiveView('workspace')}
            onSwitchTo3D={(stepTitle) => {
              setActiveView('workspace');
              setDemoToastInfo(stepTitle || 'Mô phỏng 3D');
            }}
          />
        </section>
      )}

      {/* Modal Nhập Khối Rubik Ngoài Đời Thật */}
      <CubeInputModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
      />
    </main>
  );
}
