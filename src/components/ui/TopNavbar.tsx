import React, { useState } from 'react';
import { useRubikStore } from '../../store/useRubikStore';
import {
  Palette,
  LocateFixed,
  Music,
  BookOpen,
  Box,
  Menu,
  X,
  Keyboard,
  Check,
} from 'lucide-react';

interface TopNavbarProps {
  activeView: 'workspace' | 'theory';
  onViewChange: (view: 'workspace' | 'theory') => void;
  onOpenInputModal: () => void;
  onResetCamera: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeView,
  onViewChange,
  onOpenInputModal,
  onResetCamera,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showKeyHintsModal, setShowKeyHintsModal] = useState(false);

  const isLofiPlaying = useRubikStore((s) => s.isLofiPlaying);
  const toggleLofi = useRubikStore((s) => s.toggleLofi);
  const isTutorActive = useRubikStore((s) => s.isTutorActive);

  return (
    <>
      <header className="w-full h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between border-b border-[#e8dfcf]/90 bg-[#fcf9f2]/90 backdrop-blur-xl shadow-xs z-30 select-none shrink-0 relative transition-all">
        {/* ── 1. LOGO & BRAND IDENTITY (BÊN TRÁI) ── */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onViewChange('workspace')}
            className="flex items-center gap-2 group cursor-pointer text-left"
            title="Trang chủ Bàn Xoay Rubik"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#e07a5f] to-[#cc6348] flex items-center justify-center text-white font-black text-sm sm:text-base shadow-sm group-hover:scale-105 active:scale-95 transition-all">
              R
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-[#2c221e] group-hover:text-[#e07a5f] transition-colors flex items-center gap-1.5">
                Roux Method VN
                <span className="hidden md:inline-flex px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-md bg-[#eef5f3] text-[#247c72] border border-[#cbe3dd]">
                  3D v2026
                </span>
              </span>
              <span className="hidden sm:inline text-[10px] text-[#807266] font-medium leading-none">
                Interactive Rubik Guide & Solver
              </span>
            </div>
          </button>
        </div>

        {/* ── 2. SEGMENTED TAB SWITCHER (Ở GIỮA - CHUẨN 2026) ── */}
        <nav className="flex items-center bg-[#eee4d4]/70 p-1 rounded-2xl border border-[#e4d7c3] shadow-inner">
          <button
            type="button"
            onClick={() => onViewChange('workspace')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'workspace'
                ? 'bg-white text-[#2c221e] shadow-xs scale-100'
                : 'text-[#706459] hover:text-[#2c221e] hover:bg-white/40'
            }`}
            title="Chế độ Bàn Xoay 3D tương tác & Tự giải"
          >
            <Box className={`w-3.5 h-3.5 ${activeView === 'workspace' ? 'text-[#e07a5f]' : ''}`} />
            <span>Bàn Xoay 3D</span>
            {isTutorActive && activeView === 'workspace' && (
              <span className="w-2 h-2 rounded-full bg-[#2a9d8f] animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onViewChange('theory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'theory'
                ? 'bg-white text-[#2c221e] shadow-xs scale-100'
                : 'text-[#706459] hover:text-[#2c221e] hover:bg-white/40'
            }`}
            title="Chế độ Cẩm nang & Giáo trình học Roux"
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeView === 'theory' ? 'text-[#e07a5f]' : ''}`} />
            <span>Giáo Trình</span>
          </button>
        </nav>

        {/* ── 3. ACTIONS (BÊN PHẢI) ── */}
        <div className="flex items-center gap-1.5">
          {/* DESKTOP ACTIONS */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* Nhập khối Rubik thật */}
            <button
              type="button"
              onClick={onOpenInputModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border bg-white hover:bg-[#faf6ee] text-[#2c221e] border-[#e2d7c5] shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Nhập màu Rubik ngoài đời thực để máy hướng dẫn giải"
            >
              <Palette className="w-3.5 h-3.5 text-[#e07a5f]" />
              <span>Nhập Rubik thật</span>
            </button>

            {/* Reset Camera góc nhìn chuẩn Roux */}
            {activeView === 'workspace' && (
              <button
                type="button"
                onClick={onResetCamera}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border bg-white hover:bg-[#faf6ee] text-[#5c4f43] border-[#e2d7c5] shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Đặt lại camera về góc nhìn chuẩn Roux (F Xanh lá, U Trắng)"
              >
                <LocateFixed className="w-3.5 h-3.5 text-[#3d5a80]" />
                <span>Góc nhìn</span>
              </button>
            )}

            {/* Bật/Tắt Lo-fi */}
            <button
              type="button"
              onClick={toggleLofi}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                isLofiPlaying
                  ? 'bg-[#fbf0ec] text-[#e07a5f] border-[#f4c8bc] shadow-xs'
                  : 'bg-white hover:bg-[#faf6ee] text-[#7a6f64] border-[#e2d7c5]'
              }`}
              title={isLofiPlaying ? 'Đang phát Lo-fi (Click để tắt)' : 'Bật nhạc nền Lo-fi thư giãn'}
            >
              <Music className={`w-3.5 h-3.5 ${isLofiPlaying ? 'animate-pulse' : ''}`} />
              <span>Lo-fi</span>
            </button>
          </div>

          {/* MOBILE QUICK BUTTONS */}
          <div className="flex lg:hidden items-center gap-1">
            {/* Quick Lo-fi toggle on mobile */}
            <button
              type="button"
              onClick={toggleLofi}
              className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                isLofiPlaying
                  ? 'bg-[#fbf0ec] text-[#e07a5f] border-[#f4c8bc] shadow-xs'
                  : 'bg-white text-[#7a6f64] border-[#e2d7c5]'
              }`}
              title="Nhạc nền Lo-fi"
            >
              <Music className={`w-3.5 h-3.5 ${isLofiPlaying ? 'animate-pulse' : ''}`} />
            </button>

            {/* Quick Reset Camera on mobile (chỉ hiện khi ở workspace) */}
            {activeView === 'workspace' && (
              <button
                type="button"
                onClick={onResetCamera}
                className="p-2 rounded-xl border bg-white text-[#3d5a80] border-[#e2d7c5] active:scale-95 cursor-pointer"
                title="Đặt lại góc nhìn"
              >
                <LocateFixed className="w-3.5 h-3.5" />
              </button>
            )}

            {/* HAMBURGER MENU BUTTON CHUẨN 2026 */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isMobileMenuOpen
                  ? 'bg-[#e07a5f] text-white border-[#cc6b52] shadow-sm'
                  : 'bg-white text-[#2c221e] border-[#e2d7c5] hover:bg-[#faf6ee]'
              }`}
              title="Mở menu tính năng"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── 4. MOBILE NAVIGATION SHEET / POPUP DRAWER (CHUẨN WEB 2026) ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col justify-start pt-14 sm:pt-16 animate-in fade-in duration-200">
          {/* Backdrop mờ phía sau */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Card trượt từ trên xuống */}
          <div className="relative z-50 mx-3 mt-2 p-4 bg-[#fcf9f2]/98 backdrop-blur-2xl rounded-3xl border border-[#e8dfcf] shadow-2xl space-y-3 animate-in slide-in-from-top-4 duration-200 max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0e8db]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c7b6c]">
                Menu Tiện Ích
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-[#8c7b6c] hover:text-[#2c221e] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 gap-2">
              {/* Chuyển sang Bàn Xoay 3D */}
              <button
                type="button"
                onClick={() => {
                  onViewChange('workspace');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeView === 'workspace'
                    ? 'bg-[#fffaf0] border-[#e07a5f] shadow-xs'
                    : 'bg-white border-[#e8dfcf] hover:bg-[#faf6ee]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#e07a5f]/15 flex items-center justify-center text-[#e07a5f]">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2c221e]">Bàn Xoay 3D & Tự Giải</div>
                    <div className="text-[10px] text-[#706459]">Thao tác khối Rubik, xáo, xoay và theo dõi từng bước</div>
                  </div>
                </div>
                {activeView === 'workspace' && <Check className="w-4 h-4 text-[#e07a5f]" />}
              </button>

              {/* Chuyển sang Giáo Trình */}
              <button
                type="button"
                onClick={() => {
                  onViewChange('theory');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeView === 'theory'
                    ? 'bg-[#fffaf0] border-[#e07a5f] shadow-xs'
                    : 'bg-white border-[#e8dfcf] hover:bg-[#faf6ee]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#2a9d8f]/15 flex items-center justify-center text-[#2a9d8f]">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2c221e]">Giáo Trình & Tra Cứu CMLL</div>
                    <div className="text-[10px] text-[#706459]">Lý thuyết 4 bước Roux, sơ đồ 2D và bảng công thức</div>
                  </div>
                </div>
                {activeView === 'theory' && <Check className="w-4 h-4 text-[#2a9d8f]" />}
              </button>

              {/* Nhập Rubik Thật */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenInputModal();
                }}
                className="w-full flex items-center gap-3 p-3 bg-white hover:bg-[#faf6ee] rounded-2xl border border-[#e8dfcf] text-left transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#e07a5f]/15 flex items-center justify-center text-[#e07a5f]">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2c221e]">Nhập Rubik Ngoài Đời Thật</div>
                  <div className="text-[10px] text-[#706459]">Tô màu các mặt Rubik thật để máy giải tiếp</div>
                </div>
              </button>

              {/* Đặt Lại Góc Nhìn */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (activeView !== 'workspace') onViewChange('workspace');
                  setTimeout(onResetCamera, 100);
                }}
                className="w-full flex items-center gap-3 p-3 bg-white hover:bg-[#faf6ee] rounded-2xl border border-[#e8dfcf] text-left transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#3d5a80]/15 flex items-center justify-center text-[#3d5a80]">
                  <LocateFixed className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2c221e]">Đặt Lại Góc Nhìn Camera</div>
                  <div className="text-[10px] text-[#706459]">Trở về góc nhìn chuẩn Roux (F Xanh lá, U Trắng)</div>
                </div>
              </button>

              {/* Bật/Tắt Lo-fi */}
              <button
                type="button"
                onClick={toggleLofi}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-[#faf6ee] rounded-2xl border border-[#e8dfcf] text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#a06030]/15 flex items-center justify-center text-[#a06030]">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2c221e]">Nhạc Nền Lo-fi Ambient</div>
                    <div className="text-[10px] text-[#706459]">
                      {isLofiPlaying ? 'Đang phát (Nhấn để tắt)' : 'Đang tắt (Nhấn để bật)'}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                    isLofiPlaying
                      ? 'bg-[#fbf0ec] text-[#e07a5f] border border-[#f4c8bc]'
                      : 'bg-[#faf6ee] text-[#7a6f64] border border-[#e8dfcf]'
                  }`}
                >
                  {isLofiPlaying ? 'BẬT' : 'TẮT'}
                </span>
              </button>

              {/* Hướng dẫn phím tắt */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowKeyHintsModal(true);
                }}
                className="w-full flex items-center gap-3 p-3 bg-white hover:bg-[#faf6ee] rounded-2xl border border-[#e8dfcf] text-left transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#706459]/15 flex items-center justify-center text-[#706459]">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2c221e]">Bảng Phím Tắt Bàn Phím</div>
                  <div className="text-[10px] text-[#706459]">R, L, U, D, F, B, M, Space, Esc...</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. MODAL HƯỚNG DẪN PHÍM TẮT ── */}
      {showKeyHintsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#e8dfcf] shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0e8db]">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#e07a5f]" />
                <h3 className="text-sm font-bold text-[#2c221e]">Phím Tắt Điều Khiển</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyHintsModal(false)}
                className="p-1 text-[#8c7b6c] hover:text-[#2c221e] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#5c4f43]">
              <div className="flex justify-between p-2 bg-[#faf6ee] rounded-xl border border-[#ede3d4]">
                <span className="font-semibold">Xoay các mặt (WCA)</span>
                <span className="font-mono font-bold text-[#2c221e]">R, L, U, D, F, B</span>
              </div>
              <div className="flex justify-between p-2 bg-[#faf6ee] rounded-xl border border-[#ede3d4]">
                <span className="font-semibold">Xoay nghịch chiều (')</span>
                <span className="font-mono font-bold text-[#2c221e]">Shift + Phím mặt</span>
              </div>
              <div className="flex justify-between p-2 bg-[#faf6ee] rounded-xl border border-[#ede3d4]">
                <span className="font-semibold">Tầng giữa Roux</span>
                <span className="font-mono font-bold text-[#2c221e]">M, E, S</span>
              </div>
              <div className="flex justify-between p-2 bg-[#faf6ee] rounded-xl border border-[#ede3d4]">
                <span className="font-semibold">Xáo khối 20 moves</span>
                <span className="font-mono font-bold text-[#2c221e]">Phím Space</span>
              </div>
              <div className="flex justify-between p-2 bg-[#faf6ee] rounded-xl border border-[#ede3d4]">
                <span className="font-semibold">Khôi phục đã giải</span>
                <span className="font-mono font-bold text-[#2c221e]">Phím Esc</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowKeyHintsModal(false)}
              className="w-full py-2 bg-[#e07a5f] hover:bg-[#d4684c] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
