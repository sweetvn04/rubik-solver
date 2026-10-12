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
      {/* ── 1. FLOATING ISLAND TOP BAR (CHUẨN WEB 2026) ── */}
      <header className="fixed top-2 sm:top-3.5 inset-x-2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[94%] sm:max-w-5xl z-30 select-none pointer-events-auto transition-all">
        <div className="h-11 sm:h-13 px-2 sm:px-4 bg-white/88 backdrop-blur-xl rounded-2xl border border-[#e8dfcf] shadow-sm flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* ── LOGO & BRAND (BÊN TRÁI) ── */}
          <button
            type="button"
            onClick={() => onViewChange('workspace')}
            className="flex items-center gap-1.5 sm:gap-2 group cursor-pointer text-left shrink-0"
            title="Trang chủ Bàn Xoay Rubik"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#e07a5f] to-[#cc6348] flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-2xs group-hover:scale-105 active:scale-95 transition-all">
              R
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-[#2c221e] group-hover:text-[#e07a5f] transition-colors">
                <span className="sm:hidden">Roux VN</span>
                <span className="hidden sm:inline">Roux Method VN</span>
              </span>
              <span className="hidden md:inline-flex px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-md bg-[#eef5f3] text-[#247c72] border border-[#cbe3dd]">
                2026
              </span>
            </div>
          </button>

          {/* ── SEGMENTED TAB SWITCHER (Ở GIỮA - GỌN GÀNG, KHÔNG RỚT DÒNG) ── */}
          <nav className="flex items-center bg-[#eee4d4]/60 p-0.5 sm:p-1 rounded-xl border border-[#e4d7c3] shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => onViewChange('workspace')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'workspace'
                  ? 'bg-white text-[#2c221e] shadow-xs'
                  : 'text-[#706459] hover:text-[#2c221e] hover:bg-white/40'
              }`}
              title="Chế độ Bàn Xoay 3D tương tác & Tự giải"
            >
              <Box className={`w-3.5 h-3.5 shrink-0 ${activeView === 'workspace' ? 'text-[#e07a5f]' : ''}`} />
              <span className="sm:hidden">3D</span>
              <span className="hidden sm:inline">Bàn Xoay 3D</span>
              {isTutorActive && activeView === 'workspace' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#2a9d8f] animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => onViewChange('theory')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'theory'
                  ? 'bg-white text-[#2c221e] shadow-xs'
                  : 'text-[#706459] hover:text-[#2c221e] hover:bg-white/40'
              }`}
              title="Chế độ Cẩm nang & Giáo trình học Roux"
            >
              <BookOpen className={`w-3.5 h-3.5 shrink-0 ${activeView === 'theory' ? 'text-[#e07a5f]' : ''}`} />
              <span>Giáo trình</span>
            </button>
          </nav>

          {/* ── ACTIONS (BÊN PHẢI) ── */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* DESKTOP ACTIONS */}
            <div className="hidden lg:flex items-center gap-1.5">
              {/* Nhập khối Rubik thật */}
              <button
                type="button"
                onClick={onOpenInputModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border bg-white/80 hover:bg-white text-[#2c221e] border-[#e2d7c5] shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
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
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border bg-white/80 hover:bg-white text-[#5c4f43] border-[#e2d7c5] shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
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
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap ${
                  isLofiPlaying
                    ? 'bg-[#fbf0ec] text-[#e07a5f] border-[#f4c8bc] shadow-xs'
                    : 'bg-white/80 hover:bg-white text-[#7a6f64] border-[#e2d7c5]'
                }`}
                title={isLofiPlaying ? 'Đang phát Lo-fi (Click để tắt)' : 'Bật nhạc nền Lo-fi thư giãn'}
              >
                <Music className={`w-3.5 h-3.5 ${isLofiPlaying ? 'animate-pulse' : ''}`} />
                <span>Lo-fi</span>
              </button>
            </div>

            {/* MOBILE QUICK BUTTONS (ĐÚNG 2 NÚT VUÔNG TRÒN ĐỐI XỨNG CỰC GỌN) */}
            <div className="flex lg:hidden items-center gap-1">
              {/* Quick Lo-fi button */}
              <button
                type="button"
                onClick={toggleLofi}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                  isLofiPlaying
                    ? 'bg-[#fbf0ec] text-[#e07a5f] border-[#f4c8bc] shadow-2xs'
                    : 'bg-white text-[#7a6f64] border-[#e2d7c5]'
                }`}
                title="Bật/Tắt nhạc nền Lo-fi"
              >
                <Music className={`w-3.5 h-3.5 ${isLofiPlaying ? 'animate-pulse' : ''}`} />
              </button>

              {/* Mobile Hamburger Menu Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                  isMobileMenuOpen
                    ? 'bg-[#e07a5f] text-white border-[#cc6b52] shadow-xs'
                    : 'bg-white text-[#2c221e] border-[#e2d7c5] hover:bg-[#faf6ee]'
                }`}
                title="Mở menu tiện ích"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── 2. MOBILE NAVIGATION SHEET / POPUP DRAWER ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex flex-col justify-start pt-14 sm:pt-16 animate-in fade-in duration-150 pointer-events-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Floating Card */}
          <div className="relative z-50 mx-2.5 mt-1 p-3.5 bg-white/95 backdrop-blur-2xl rounded-2xl border border-[#e8dfcf] shadow-xl space-y-2.5 animate-in slide-in-from-top-3 duration-200 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0e8db]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c7b6c]">
                Menu Tiện Ích
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-[#8c7b6c] hover:text-[#2c221e] rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 gap-1.5">
              {/* Nhập Rubik Thật */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenInputModal();
                }}
                className="w-full flex items-center gap-3 p-2.5 bg-[#faf6ee] hover:bg-white rounded-xl border border-[#e8dfcf] text-left transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#e07a5f]/15 flex items-center justify-center text-[#e07a5f] shrink-0">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2c221e]">Nhập Rubik Ngoài Đời Thật</div>
                  <div className="text-[10px] text-[#706459]">Tô màu các mặt Rubik thật để máy giải tiếp</div>
                </div>
              </button>

              {/* Đặt Lại Góc Nhìn Camera */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (activeView !== 'workspace') onViewChange('workspace');
                  setTimeout(onResetCamera, 100);
                }}
                className="w-full flex items-center gap-3 p-2.5 bg-[#faf6ee] hover:bg-white rounded-xl border border-[#e8dfcf] text-left transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#3d5a80]/15 flex items-center justify-center text-[#3d5a80] shrink-0">
                  <LocateFixed className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2c221e]">Đặt Lại Góc Nhìn Chuẩn Roux</div>
                  <div className="text-[10px] text-[#706459]">F Xanh lá phía trước, U Trắng trên cùng</div>
                </div>
              </button>

              {/* Bật/Tắt Lo-fi */}
              <button
                type="button"
                onClick={toggleLofi}
                className="w-full flex items-center justify-between p-2.5 bg-[#faf6ee] hover:bg-white rounded-xl border border-[#e8dfcf] text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#a06030]/15 flex items-center justify-center text-[#a06030] shrink-0">
                    <Music className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2c221e]">Nhạc Nền Lo-fi Ambient</div>
                    <div className="text-[10px] text-[#706459]">
                      {isLofiPlaying ? 'Đang phát' : 'Đang tắt'}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                    isLofiPlaying
                      ? 'bg-[#fbf0ec] text-[#e07a5f] border border-[#f4c8bc]'
                      : 'bg-white text-[#7a6f64] border border-[#e8dfcf]'
                  }`}
                >
                  {isLofiPlaying ? 'BẬT' : 'TẮT'}
                </span>
              </button>

              {/* Phím tắt bàn phím */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowKeyHintsModal(true);
                }}
                className="w-full flex items-center gap-3 p-2.5 bg-[#faf6ee] hover:bg-white rounded-xl border border-[#e8dfcf] text-left transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#706459]/15 flex items-center justify-center text-[#706459] shrink-0">
                  <Keyboard className="w-3.5 h-3.5" />
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

      {/* ── 3. MODAL PHÍM TẮT BÀN PHÍM ── */}
      {showKeyHintsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200 pointer-events-auto">
          <div className="bg-white rounded-2xl border border-[#e8dfcf] shadow-2xl max-w-xs w-full p-4 space-y-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0e8db]">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#e07a5f]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#2c221e]">Phím Tắt Điều Khiển</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyHintsModal(false)}
                className="p-1 text-[#8c7b6c] hover:text-[#2c221e] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-[#5c4f43]">
              <div className="flex justify-between p-2 bg-[#faf6ee] rounded-xl border border-[#ede3d4]">
                <span className="font-semibold text-[11px]">Xoay 6 mặt WCA</span>
                <span className="font-mono font-bold text-[#2c221e]">R, L, U, D, F, B</span>
              </div>
              <div className="flex justify-between p-2 bg-[#faf6ee] rounded-xl border border-[#ede3d4]">
                <span className="font-semibold text-[11px]">Xoay nghịch (')</span>
                <span className="font-mono font-bold text-[#2c221e]">Shift + Phím</span>
              </div>
              <div className="flex justify-between p-2 bg-[#faf6ee] rounded-xl border border-[#ede3d4]">
                <span className="font-semibold text-[11px]">Tầng giữa Roux</span>
                <span className="font-mono font-bold text-[#2c221e]">M, E, S</span>
              </div>
              <div className="flex justify-between p-2 bg-[#faf6ee] rounded-xl border border-[#ede3d4]">
                <span className="font-semibold text-[11px]">Xáo 20 bước</span>
                <span className="font-mono font-bold text-[#2c221e]">Space</span>
              </div>
              <div className="flex justify-between p-2 bg-[#faf6ee] rounded-xl border border-[#ede3d4]">
                <span className="font-semibold text-[11px]">Khôi phục</span>
                <span className="font-mono font-bold text-[#2c221e]">Esc</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowKeyHintsModal(false)}
              className="w-full py-1.5 bg-[#e07a5f] hover:bg-[#d4684c] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
