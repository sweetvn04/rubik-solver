import React, { useState, useMemo } from 'react';
import {
  X,
  Check,
  AlertCircle,
  Sparkles,
  Trash2,
  CheckCircle2,
  Palette,
  ArrowRight,
  Compass,
} from 'lucide-react';
import {
  COLOR_U,
  COLOR_D,
  COLOR_F,
  COLOR_B,
  COLOR_L,
  COLOR_R,
  COLOR_ID_TO_HEX,
  COLOR_NAMES,
  FACELETS,
  validateCubeState,
  createSolvedSolverState,
  type ColorId,
  type SolverCubeState,
} from '../../engine/solver/cubeState';
import { useRubikStore } from '../../store/useRubikStore';

interface CubeInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 6 mặt định nghĩa theo chuẩn Roux
type FaceKey = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

interface FaceMeta {
  key: FaceKey;
  name: string;
  sub: string;
  centerColor: ColorId;
  centerIndex: number;
  indices: [
    number, number, number,
    number, number, number,
    number, number, number
  ];
}

const FACES: FaceMeta[] = [
  {
    key: 'U',
    name: 'Mặt U (Trên)',
    sub: 'Màu Vàng hướng lên trên',
    centerColor: COLOR_U,
    centerIndex: FACELETS.U_C,
    indices: [
      FACELETS.U_BL, FACELETS.U_B, FACELETS.U_BR,
      FACELETS.U_L,  FACELETS.U_C, FACELETS.U_R,
      FACELETS.U_FL, FACELETS.U_F, FACELETS.U_FR,
    ],
  },
  {
    key: 'F',
    name: 'Mặt F (Trước)',
    sub: 'Màu Xanh lá nhìn trực diện mắt bạn',
    centerColor: COLOR_F,
    centerIndex: FACELETS.F_C,
    indices: [
      FACELETS.F_UL, FACELETS.F_U, FACELETS.F_UR,
      FACELETS.F_L,  FACELETS.F_C, FACELETS.F_R,
      FACELETS.F_DL, FACELETS.F_D, FACELETS.F_DR,
    ],
  },
  {
    key: 'R',
    name: 'Mặt R (Phải)',
    sub: 'Màu Cam ở bên tay phải',
    centerColor: COLOR_R,
    centerIndex: FACELETS.R_C,
    indices: [
      FACELETS.R_UF, FACELETS.R_U, FACELETS.R_UB,
      FACELETS.R_F,  FACELETS.R_C, FACELETS.R_B,
      FACELETS.R_DF, FACELETS.R_D, FACELETS.R_DB,
    ],
  },
  {
    key: 'B',
    name: 'Mặt B (Sau)',
    sub: 'Màu Xanh lam ở mặt sau lưng',
    centerColor: COLOR_B,
    centerIndex: FACELETS.B_C,
    indices: [
      FACELETS.B_UR, FACELETS.B_U, FACELETS.B_UL,
      FACELETS.B_R,  FACELETS.B_C, FACELETS.B_L,
      FACELETS.B_DR, FACELETS.B_D, FACELETS.B_DL,
    ],
  },
  {
    key: 'L',
    name: 'Mặt L (Trái)',
    sub: 'Màu Đỏ ở bên tay trái',
    centerColor: COLOR_L,
    centerIndex: FACELETS.L_C,
    indices: [
      FACELETS.L_UB, FACELETS.L_U, FACELETS.L_UF,
      FACELETS.L_B,  FACELETS.L_C, FACELETS.L_F,
      FACELETS.L_DB, FACELETS.L_D, FACELETS.L_DF,
    ],
  },
  {
    key: 'D',
    name: 'Mặt D (Dưới)',
    sub: 'Màu Trắng ở đáy dưới',
    centerColor: COLOR_D,
    centerIndex: FACELETS.D_C,
    indices: [
      FACELETS.D_FL, FACELETS.D_F, FACELETS.D_FR,
      FACELETS.D_L,  FACELETS.D_C, FACELETS.D_R,
      FACELETS.D_BL, FACELETS.D_B, FACELETS.D_BR,
    ],
  },
];

const COLOR_OPTIONS: Array<{ id: ColorId; name: string; keyHint: string }> = [
  { id: COLOR_U, name: 'Vàng', keyHint: '1' },
  { id: COLOR_D, name: 'Trắng', keyHint: '2' },
  { id: COLOR_F, name: 'Xanh lá', keyHint: '3' },
  { id: COLOR_B, name: 'Xanh lam', keyHint: '4' },
  { id: COLOR_L, name: 'Đỏ', keyHint: '5' },
  { id: COLOR_R, name: 'Cam', keyHint: '6' },
];

export const CubeInputModal: React.FC<CubeInputModalProps> = ({ isOpen, onClose }) => {
  // Trạng thái 54 facelet (null nếu chưa tô)
  const [facelets, setFacelets] = useState<(number | null)[]>(() => {
    // Khởi tạo mặc định theo trạng thái đã giải
    return Array.from(createSolvedSolverState());
  });

  const [activeColor, setActiveColor] = useState<ColorId>(COLOR_U);
  const [activeFaceKey, setActiveFaceKey] = useState<FaceKey>('F');
  const [viewMode, setViewMode] = useState<'single' | 'net'>('single');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const applyCustomCubeState = useRubikStore((s) => s.applyCustomCubeState);

  // Kiểm tra tính hợp lệ real-time
  const validation = useMemo(() => {
    return validateCubeState(facelets);
  }, [facelets]);

  if (!isOpen) return null;

  // Xử lý tô màu vào 1 sticker
  const handleStickerClick = (faceletIndex: number, isCenter: boolean) => {
    if (isCenter) return; // Không cho đổi màu tâm
    setSubmitError(null);
    setFacelets((prev) => {
      const next = [...prev];
      // Nếu đã mang màu active thì bỏ màu, ngược lại gán màu active
      next[faceletIndex] = activeColor;
      return next;
    });
  };

  // Nạp trạng thái đã giải
  const handleResetToSolved = () => {
    setSubmitError(null);
    setFacelets(Array.from(createSolvedSolverState()));
  };

  // Xóa trắng toàn bộ (trừ 6 tâm cố định)
  const handleClearAll = () => {
    setSubmitError(null);
    const cleared = new Array(54).fill(null);
    // Giữ nguyên 6 tâm chuẩn
    FACES.forEach((f) => {
      cleared[f.centerIndex] = f.centerColor;
    });
    setFacelets(cleared);
  };

  // Xác nhận nạp vào 3D Rubik và bắt đầu Tutor
  const handleApply = () => {
    if (!validation.isValid) {
      setSubmitError(validation.message || 'Khối Rubik chưa hợp lệ');
      return;
    }

    const solverCube = new Uint8Array(54);
    for (let i = 0; i < 54; i++) {
      solverCube[i] = facelets[i] as number;
    }

    const res = applyCustomCubeState(solverCube as SolverCubeState);
    if (!res.success) {
      setSubmitError(res.message || 'Không thể áp dụng trạng thái này.');
      return;
    }

    onClose();
  };

  const currentFace = FACES.find((f) => f.key === activeFaceKey) || FACES[1];

  // Helper render 1 lưới 3x3 cho 1 mặt
  const renderFaceGrid = (face: FaceMeta, cellSizeClass = 'w-12 h-12 text-sm') => {
    return (
      <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#2c221e]/5 rounded-2xl border border-[#e8dfcf] shrink-0">
        {face.indices.map((idx, posIndex) => {
          const isCenter = idx === face.centerIndex;
          const colorId = facelets[idx];
          const hasColor = colorId !== null && colorId !== undefined;
          const bgHex = hasColor ? COLOR_ID_TO_HEX[colorId as ColorId] : '#f1ebe1';

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleStickerClick(idx, isCenter)}
              disabled={isCenter}
              title={
                isCenter
                  ? `Tâm ${face.name}: Cố định chuẩn`
                  : `Ô số ${posIndex + 1} (${hasColor ? COLOR_NAMES[colorId as ColorId] : 'Chưa tô'})`
              }
              className={`${cellSizeClass} rounded-xl border flex items-center justify-center transition-all relative select-none cursor-pointer ${
                isCenter
                  ? 'border-black/20 shadow-inner cursor-default opacity-95 ring-2 ring-black/10'
                  : 'border-black/15 hover:scale-105 active:scale-95 hover:border-black/35 shadow-xs'
              }`}
              style={{ backgroundColor: bgHex }}
            >
              {isCenter && (
                <span className="text-[10px] font-extrabold uppercase px-1 py-0.2 bg-black/30 text-white rounded-md backdrop-blur-xs">
                  {face.key}
                </span>
              )}
              {!hasColor && !isCenter && (
                <span className="w-2 h-2 rounded-full bg-[#d4c8ba]" />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-auto select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2b241e]/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl max-h-[92dvh] bg-[#fbf8f1] rounded-3xl border border-[#e8dfcf] shadow-2xl flex flex-col overflow-hidden text-[#332b25]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#ebdcca] bg-white/70 backdrop-blur-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#e07a5f] flex items-center justify-center text-white shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#2c221e] tracking-tight">
                Nhập Khối Rubik Ngoài Đời Thật
              </h2>
              <p className="text-[11px] text-[#8c7b6c]">
                Tô màu 6 mặt để app nhận diện và hướng dẫn tiếp tục giải
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8c7b6c] hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-xl transition-all cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5">
          {/* Lời nhắc quy chuẩn định hướng Roux */}
          <div className="p-2.5 bg-[#faf6ee] rounded-2xl border border-[#ebdcca] flex items-start gap-2 text-xs text-[#5c4f43]">
            <Compass className="w-4 h-4 text-[#e07a5f] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Quy ước Roux chuẩn:</strong> Giữ mặt{' '}
              <span className="font-bold text-[#38934c]">Xanh lá (F)</span> đối diện mắt bạn,
              mặt <span className="font-bold text-[#b58514]">Vàng (U)</span> hướng lên trên.
              6 tâm đã cố định sẵn để bạn không bao giờ bị lệch phương hướng.
            </div>
          </div>

          {/* Bảng chọn màu (Color Palette Bar) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c7b6c]">
                1. Chọn màu sáp để tô:
              </span>
              <span className="text-[10px] text-[#a89b8d]">
                Click ô màu để chọn, sau đó click vào ô Rubik
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = activeColor === c.id;
                const count = validation.counts[c.id];
                const isExact = count === 9;
                const isOverflow = count > 9;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveColor(c.id)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-[#e07a5f] shadow-md ring-2 ring-[#e07a5f] scale-102'
                        : 'bg-[#faf6ee] border-[#e8dfcf] hover:bg-white'
                    }`}
                  >
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border border-black/15 shadow-inner flex items-center justify-center"
                      style={{ backgroundColor: COLOR_ID_TO_HEX[c.id] }}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 text-black/70 stroke-[3]" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-[#2c221e]">
                      {c.name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                        isExact
                          ? 'bg-[#eef5f3] text-[#247c72] border border-[#cbe3dd]'
                          : isOverflow
                          ? 'bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]'
                          : 'bg-[#f4ebe1] text-[#935c34]'
                      }`}
                    >
                      {count}/9
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Chế độ xem: Từng mặt vs Toàn bộ lưới 2D Net */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8c7b6c]">
              2. Tô màu các mặt Rubik:
            </span>
            <div className="flex bg-[#efe8dc] p-0.5 rounded-xl text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'single'
                    ? 'bg-white text-[#2c221e] shadow-xs'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                Từng mặt
              </button>
              <button
                type="button"
                onClick={() => setViewMode('net')}
                className={`px-2.5 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'net'
                    ? 'bg-white text-[#2c221e] shadow-xs'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                Trải phẳng (Net)
              </button>
            </div>
          </div>

          {/* CHẾ ĐỘ 1: XEM TỪNG MẶT (DỄ BẤM TRÊN MOBILE) */}
          {viewMode === 'single' && (
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#e8dfcf] shadow-xs flex flex-col gap-3">
              {/* Tab chuyển nhanh 6 mặt */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {FACES.map((f) => {
                  const isCurrent = f.key === activeFaceKey;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setActiveFaceKey(f.key)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 font-bold rounded-xl shrink-0 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#3d5a80] text-white shadow-xs'
                          : 'bg-[#faf6ee] text-[#5c4f43] hover:bg-[#f0e7d8] border border-[#e2d8c7]'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20"
                        style={{ backgroundColor: COLOR_ID_TO_HEX[f.centerColor] }}
                      />
                      <span>Mặt {f.key}</span>
                    </button>
                  );
                })}
              </div>

              {/* Lưới 3x3 to rõ của mặt đang chọn */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                {renderFaceGrid(currentFace, 'w-14 h-14 sm:w-16 sm:h-16 text-base')}

                <div className="flex flex-col gap-1.5 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-[#2c221e]">
                    {currentFace.name}
                  </h4>
                  <p className="text-xs text-[#8c7b6c] max-w-xs">
                    {currentFace.sub}
                  </p>
                  <p className="text-[11px] text-[#a06030] font-semibold mt-1">
                    Ô ở chính giữa là tâm ({currentFace.key}) — không thể đổi màu.
                  </p>

                  {/* Nút sang mặt tiếp theo */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const idx = FACES.findIndex((f) => f.key === activeFaceKey);
                        const nextIdx = (idx + 1) % FACES.length;
                        setActiveFaceKey(FACES[nextIdx].key);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-[#f2e9dc] text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all cursor-pointer"
                    >
                      <span>Sang mặt tiếp theo</span>
                      <ArrowRight className="w-3 h-3 text-[#3d5a80]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CHẾ ĐỘ 2: TRẢI PHẲNG (NET VIEW TRÊN DESKTOP) */}
          {viewMode === 'net' && (
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#e8dfcf] shadow-xs flex flex-col items-center justify-center overflow-x-auto">
              <div className="flex flex-col items-center gap-1">
                {/* Hàng 1: U */}
                <div className="flex items-center">
                  <div className="w-[110px]" />
                  {renderFaceGrid(FACES[0], 'w-7 h-7 text-xs')}
                  <div className="w-[220px]" />
                </div>

                {/* Hàng 2: L, F, R, B */}
                <div className="flex items-center gap-1">
                  {renderFaceGrid(FACES[4], 'w-7 h-7 text-xs')}
                  {renderFaceGrid(FACES[1], 'w-7 h-7 text-xs')}
                  {renderFaceGrid(FACES[2], 'w-7 h-7 text-xs')}
                  {renderFaceGrid(FACES[3], 'w-7 h-7 text-xs')}
                </div>

                {/* Hàng 3: D */}
                <div className="flex items-center">
                  <div className="w-[110px]" />
                  {renderFaceGrid(FACES[5], 'w-7 h-7 text-xs')}
                  <div className="w-[220px]" />
                </div>
              </div>
            </div>
          )}

          {/* Công cụ hỗ trợ nhanh */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[#8c7b6c]">Công cụ nhanh:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetToSolved}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#faf6ee] hover:bg-white text-[#5c4f43] border border-[#e2d8c7] transition-all cursor-pointer"
                title="Khôi phục trạng thái đã giải để bạn chỉ cần sửa vài viên đang xáo"
              >
                <Sparkles className="w-3 h-3 text-[#2a9d8f]" />
                <span>Nạp Đã Giải</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#faf6ee] hover:bg-[#fee2e2] text-[#991b1b] border border-[#fecaca] transition-all cursor-pointer"
                title="Xóa trắng để tô màu lại từ đầu"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa trắng</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer & Status Bar */}
        <div className="p-4 sm:p-5 border-t border-[#ebdcca] bg-[#fdfbf7] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Thông báo hợp lệ / lỗi */}
          <div className="w-full sm:w-auto flex-1 flex items-center gap-2">
            {submitError ? (
              <div className="flex items-center gap-1.5 text-xs text-[#b91c1c] font-semibold">
                <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
                <span>{submitError}</span>
              </div>
            ) : !validation.isValid ? (
              <div className="flex items-center gap-1.5 text-xs text-[#c2410c] font-semibold">
                <AlertCircle className="w-4 h-4 text-[#f97316] shrink-0" />
                <span>{validation.message}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[#1e5b52] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#2a9d8f] shrink-0" />
                <span>Khối hợp lệ 100%! Sẵn sàng hướng dẫn giải.</span>
              </div>
            )}
          </div>

          {/* Nút hành động */}
          <div className="w-full sm:w-auto flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-[#5c4f43] hover:bg-[#efe8dc] rounded-xl transition-all cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!validation.isValid}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Nạp & Hướng Dẫn Giải (Tutor)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
