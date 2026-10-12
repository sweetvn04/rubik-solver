import React, { useState, useMemo } from 'react';
import { useRubikStore } from '../../store/useRubikStore';
import { ROUX_LESSONS, type Lesson } from '../../data/lessonsData';
import { CMLL_ALGORITHMS, type CMLLCase } from '../../engine/solver/cmllData';
import {
  TWO_LOOK_OLL_CASES,
  TWO_LOOK_PLL_CASES,
  LSE_BAD_EDGE_RULES,
  LSE_EO_CASES,
  LSE_UL_UR_GUIDE,
  LSE_L4E_INTUITIVE_GUIDE,
  LSE_L4E_CASES,
  type TwoLookCornerCase,
  type EOCase,
} from '../../data/rouxReferenceData';
import {
  FAST_EO_GUIDE,
  DOTS_SKIPPING_GUIDE,
  EOLR_GUIDE,
  PRO_TECHNIQUES,
  OH_CMLL_ALGORITHMS,
  SUB_X_ROADMAP,
  MEYER_4X4_GUIDE,
} from '../../data/rouxAdvancedData';
import { parseAlgorithm } from '../../engine/moveParser';
import { invertMove } from '../../engine/tutorHelper';
import { CubeDiagram2D } from './CubeDiagram2D';
import { CMLLDiagram, EODiagram, L4EDiagram, ULURDiagram, L4EIntuitiveDiagram } from './ReferenceDiagrams';
import {
  X,
  BookOpen,
  Sparkles,
  Search,
  Play,
  RotateCcw,
  CheckCircle,
  Lightbulb,
  Layers,
  ChevronRight,
  ChevronLeft,
  MonitorPlay,
  Info,
  GraduationCap,
  Compass,
  Flame,
  Trophy,
  Zap,
  Hand,
  Box,
} from 'lucide-react';

interface LessonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CMLL_GROUPS = ['ALL', 'O', 'H', 'Pi', 'T', 'U', 'L', 'S', 'As'] as const;

export const LessonDrawer: React.FC<LessonDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'two_look' | 'lse_guide' | 'cmll' | 'pro_tips'>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(ROUX_LESSONS[0]);
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-step navigator cho tab Giáo trình
  const [stepIndex, setStepIndex] = useState(0);
  const [showNote, setShowNote] = useState(false);

  // Sub-tabs cho 2-Look CMLL
  const [twoLookSubTab, setTwoLookSubTab] = useState<'oll' | 'pll'>('oll');

  // Chế độ 2 Tay (2H) vs 1 Tay (OH) cho tab CMLL
  const [cmllMode, setCmllMode] = useState<'2h' | 'oh'>('2h');

  // Sub-tabs & filter cho Cẩm nang LSE
  const [lseSubTab, setLseSubTab] = useState<'eo' | 'fast_eo' | 'ulur' | 'dots_skip' | 'l4e' | 'eolr'>('eo');
  const [eoFilter, setEoFilter] = useState<'all' | 'base' | '2bad' | '4bad' | '6bad'>('all');
  const [l4eFilter, setL4eFilter] = useState<'all' | 'intuitive' | '1_white_edge' | '1_white_edge_center' | 'special'>('all');

  // Sub-tabs cho Tab Nâng cao & Pro
  const [proSubTab, setProSubTab] = useState<'techniques' | 'sub_x' | 'meyer'>('techniques');


  const enqueueAlgorithm = useRubikStore((s) => s.enqueueAlgorithm);
  const reset = useRubikStore((s) => s.reset);
  const isAnimating = useRubikStore((s) => s.isAnimating);
  const moveQueue = useRubikStore((s) => s.moveQueue);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Khi đổi bài học thì reset về sub-step đầu tiên
  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setStepIndex(0);
    setShowNote(false);
  };

  // Lọc danh sách 45 CMLL (Hỗ trợ chuyển đổi giữa 2 Tay 2H và 1 Tay OH)
  const filteredCMLL = useMemo(() => {
    const sourceList = cmllMode === 'oh'
      ? OH_CMLL_ALGORITHMS.map((oh) => ({
          group: oh.group as CMLLCase['group'],
          name: oh.name,
          alg: oh.alg,
          description: oh.notes,
          standard2HAlg: oh.standard2HAlg,
        }))
      : CMLL_ALGORITHMS;

    return sourceList.filter((c) => {
      const matchGroup = selectedGroup === 'ALL' || c.group === selectedGroup;
      const matchQuery =
        searchQuery.trim() === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.alg.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchGroup && matchQuery;
    });
  }, [cmllMode, selectedGroup, searchQuery]);

  // Lọc danh sách EO cases
  const filteredEOCases = useMemo(() => {
    if (eoFilter === 'all') return LSE_EO_CASES;
    if (eoFilter === 'base') return LSE_EO_CASES.filter((c) => c.code.startsWith('3/1'));
    if (eoFilter === '2bad') return LSE_EO_CASES.filter((c) => c.badCount === 2);
    if (eoFilter === '4bad') return LSE_EO_CASES.filter((c) => c.badCount === 4 && !c.code.startsWith('3/1'));
    if (eoFilter === '6bad') return LSE_EO_CASES.filter((c) => c.badCount === 6);
    return LSE_EO_CASES;
  }, [eoFilter]);

  // Lọc danh sách L4E cases
  const filteredL4ECases = useMemo(() => {
    if (l4eFilter === 'all' || l4eFilter === 'intuitive') return LSE_L4E_CASES;
    return LSE_L4E_CASES.filter((c) => c.group === l4eFilter);
  }, [l4eFilter]);

  // Hành động: Chạy công thức giải trực tiếp lên khối Rubik
  const handleRunAlg = (alg: string, name: string) => {
    if (isAnimating || moveQueue.length > 0) return;
    enqueueAlgorithm(alg);
    showToast(`Đang xoay thuật toán: ${name}`);
  };

  // Hành động: Dàn dựng thế cờ (Setup case) để người dùng tự tập
  const handleSetupCase = (algOrSetup: string, name: string, isAlreadySetupMoves = false) => {
    if (isAnimating || moveQueue.length > 0) return;
    let setupMovesStr = algOrSetup;
    if (!isAlreadySetupMoves) {
      const moves = parseAlgorithm(algOrSetup);
      setupMovesStr = [...moves].reverse().map((m) => invertMove(m.raw)).join(' ');
    }
    reset();
    setTimeout(() => {
      enqueueAlgorithm(setupMovesStr);
      showToast(`Đã thiết lập thế cờ: ${name} để bạn luyện tập!`);
    }, 150);
  };

  // Hành động: Chạy demo sub-step trên khối Rubik 3D
  const handleRunStepDemo = () => {
    if (isAnimating || moveQueue.length > 0) return;
    const step = selectedLesson.steps[stepIndex];
    if (!step) return;

    if (step.setupAlg) {
      const moves = parseAlgorithm(step.setupAlg);
      const setupMoves = [...moves].reverse().map((m) => invertMove(m.raw)).join(' ');
      reset();
      setTimeout(() => {
        enqueueAlgorithm(setupMoves);
        if (step.demoAlg) {
          setTimeout(() => {
            enqueueAlgorithm(step.demoAlg!);
            showToast(`Đang minh hoạ: ${step.title}`);
          }, 300);
        }
      }, 150);
    } else if (step.demoAlg) {
      enqueueAlgorithm(step.demoAlg);
      showToast(`Đang minh hoạ: ${step.title}`);
    }
  };

  if (!isOpen) return null;

  const currentStep = selectedLesson.steps[stepIndex];
  const totalSteps = selectedLesson.steps.length;

  return (
    <div className="fixed inset-0 z-40 flex justify-end pointer-events-none animate-in fade-in duration-200">
      {/* Backdrop mờ nhẹ */}
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-2xs transition-opacity pointer-events-auto"
        onClick={onClose}
      />

      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed top-4 right-4 sm:right-[430px] z-50 px-3.5 py-2 bg-[#2c221e] text-white text-xs font-semibold rounded-xl shadow-lg border border-[#e8dfcf]/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-3.5 h-3.5 text-[#2a9d8f]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Drawer Panel */}
      <aside className="relative z-50 w-full sm:w-[440px] md:w-[480px] h-full bg-[#faf6ee] shadow-2xl flex flex-col pointer-events-auto border-l border-[#ebdcca] overflow-hidden">
        {/* 1. Header chính */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebdcca] bg-[#f5efe4]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#e07a5f]/15 flex items-center justify-center text-[#e07a5f]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2c221e]">Cẩm Nang & Giáo Trình Roux</h2>
              <p className="text-[10px] text-[#706459]">Hệ thống kiến thức chuẩn rouxmethodvn</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8c7b6c] hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-xl transition-all cursor-pointer"
            title="Đóng thư viện"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Thanh 4 Tabs chính */}
        <div className="flex border-b border-[#ebdcca] bg-[#f5efe4]/90 p-1.5 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 min-w-[90px] py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'lessons'
                ? 'bg-white text-[#2c221e] shadow-xs border border-[#e2d8c7]'
                : 'text-[#7a6f64] hover:text-[#2c221e]'
            }`}
          >
            <Layers className="w-3 h-3 text-[#e07a5f]" />
            <span>4 Bước Roux</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('two_look')}
            className={`flex-1 min-w-[95px] py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'two_look'
                ? 'bg-white text-[#2c221e] shadow-xs border border-[#e2d8c7]'
                : 'text-[#7a6f64] hover:text-[#2c221e]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-[#e76f51]" />
            <span>2-Look CMLL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lse_guide')}
            className={`flex-1 min-w-[125px] py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'lse_guide'
                ? 'bg-white text-[#2c221e] shadow-xs border border-[#e2d8c7]'
                : 'text-[#7a6f64] hover:text-[#2c221e]'
            }`}
            title="Cẩm nang hoàn chỉnh LSE: EO (Lật cạnh), UL/UR (2 cánh), L4E (4 cạnh cuối)"
          >
            <Compass className="w-3.5 h-3.5 text-[#2a9d8f]" />
            <span>LSE (EO • UL/UR • L4E)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cmll')}
            className={`flex-1 min-w-[85px] py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'cmll'
                ? 'bg-white text-[#2c221e] shadow-xs border border-[#e2d8c7]'
                : 'text-[#7a6f64] hover:text-[#2c221e]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#3d5a80]" />
            <span>45 CMLL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pro_tips')}
            className={`flex-1 min-w-[95px] py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'pro_tips'
                ? 'bg-white text-[#2c221e] shadow-xs border border-[#e2d8c7]'
                : 'text-[#7a6f64] hover:text-[#2c221e]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#e63946]" />
            <span>Nâng Cao & Pro</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. TAB 1: GIÁO TRÌNH 4 BƯỚC
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'lessons' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
            {/* Bộ chọn nhanh 4 bước */}
            <div className="grid grid-cols-4 gap-1.5">
              {ROUX_LESSONS.map((l) => {
                const isSelected = selectedLesson.id === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleSelectLesson(l)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-[#e07a5f] shadow-xs ring-1 ring-[#e07a5f]'
                        : 'bg-[#faf6ee] border-[#e8dfcf] hover:bg-white'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-[#e07a5f] uppercase tracking-wider">
                      Bước {l.stepNumber}
                    </span>
                    <span className="text-xs font-bold text-[#2c221e] truncate mt-0.5">
                      {l.phaseId.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sub-step navigator */}
            <div className="bg-white rounded-2xl border border-[#e8dfcf] shadow-sm flex flex-col overflow-hidden">
              {/* Header bài học */}
              <div className="p-3 sm:p-4 border-b border-[#f0e8db] flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#2c221e]">{selectedLesson.title}</h3>
                  <p className="text-[11px] text-[#a06030] font-semibold mt-0.5">{selectedLesson.subtitle}</p>
                </div>
                <span className="px-2 py-0.5 bg-[#f4ebe1] text-[#935c34] text-[10px] font-bold rounded-full border border-[#e5d4c3] shrink-0 font-mono">
                  {selectedLesson.avgMoves}
                </span>
              </div>

              {/* Sub-step navigator header */}
              {totalSteps > 0 && (
                <div className="flex items-center justify-between px-3 py-2 bg-[#faf6ee] border-b border-[#f0e8db]">
                  <button
                    type="button"
                    onClick={() => { setStepIndex(Math.max(0, stepIndex - 1)); setShowNote(false); }}
                    disabled={stepIndex === 0}
                    className="p-1 rounded-lg hover:bg-[#efe8dc] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#5c4f43]" />
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {selectedLesson.steps.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setStepIndex(i); setShowNote(false); }}
                          className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                            i === stepIndex
                              ? 'bg-[#e07a5f] w-4'
                              : 'bg-[#e0d5c5] hover:bg-[#c4b5a0]'
                          }`}
                          title={`Phần ${i + 1}`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono text-[#7a6f64] font-semibold">
                      {stepIndex + 1}/{totalSteps}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setStepIndex(Math.min(totalSteps - 1, stepIndex + 1)); setShowNote(false); }}
                    disabled={stepIndex === totalSteps - 1}
                    className="p-1 rounded-lg hover:bg-[#efe8dc] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 text-[#5c4f43]" />
                  </button>
                </div>
              )}

              {/* Thanh chọn nhanh từng phần con có nhãn rõ ràng */}
              {totalSteps > 1 && (
                <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 bg-[#faf6ee]/70 border-b border-[#f0e8db] text-[10px]">
                  {selectedLesson.steps.map((st, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setStepIndex(i); setShowNote(false); }}
                      className={`px-2 py-1 rounded-lg shrink-0 font-bold transition-all cursor-pointer ${
                        i === stepIndex
                          ? 'bg-[#e07a5f] text-white shadow-xs'
                          : 'bg-white text-[#5c4f43] border border-[#e2d8c7] hover:bg-[#f5efe4]'
                      }`}
                    >
                      {st.title.split(':')[0].split('—')[0].trim()}
                    </button>
                  ))}
                </div>
              )}

              {/* Lối tắt mở Cẩm nang chuyên sâu khi đang ở Bước 4 LSE */}
              {selectedLesson.id === 'step4' && (
                <div className="p-2.5 bg-[#fbf5ec] border-b border-[#ebdcca] flex items-center gap-1.5 flex-wrap text-[11px]">
                  <span className="font-bold text-[#8c6d48] shrink-0 text-[10px]">Mở cẩm nang chuyên sâu:</span>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('lse_guide'); setLseSubTab('eo'); }}
                    className="px-2 py-1 font-bold rounded-lg bg-white text-[#247c72] border border-[#cbe3dd] hover:bg-[#eef5f3] cursor-pointer shadow-2xs"
                  >
                    4a. 10 Thế EO
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('lse_guide'); setLseSubTab('ulur'); }}
                    className="px-2 py-1 font-bold rounded-lg bg-white text-[#e07a5f] border border-[#f2d6c9] hover:bg-[#fdf8f5] cursor-pointer shadow-2xs"
                  >
                    4b. Đặt Cánh UL/UR
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('lse_guide'); setLseSubTab('l4e'); }}
                    className="px-2 py-1 font-bold rounded-lg bg-white text-[#3d5a80] border border-[#cbd5e1] hover:bg-[#f0f4f8] cursor-pointer shadow-2xs"
                  >
                    4c. L4E (Tự nghiệm & 23 Thế)
                  </button>
                </div>
              )}

              {/* Nội dung sub-step hiện tại */}
              {currentStep && (
                <div className="p-3 sm:p-4 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#eef5f3] text-[#247c72] border border-[#cbe3dd]">
                        Phần {stepIndex + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">
                        {currentStep.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[#5c4f43] leading-relaxed mt-2">
                      {currentStep.description}
                    </p>
                  </div>

                  {/* SVG 2D Mini Diagram */}
                  {currentStep.diagram && (
                    <div className="p-3 bg-[#faf6ee] rounded-xl border border-[#ebdcca] flex flex-col items-center gap-2">
                      <CubeDiagram2D {...currentStep.diagram} />
                      <span className="text-[10px] text-[#8c7b6c] italic text-center">
                        Sơ đồ mặt U và các cạnh bên tương ứng
                      </span>
                    </div>
                  )}

                  {/* Nút Chạy Demo trên 3D */}
                  {(currentStep.demoAlg || currentStep.setupAlg) && (
                    <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                      {currentStep.demoAlg && (
                        <div className="flex-1 px-2.5 py-1.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono text-xs text-[#a06030] font-bold truncate">
                          {currentStep.demoAlg}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleRunStepDemo}
                        disabled={isAnimating || moveQueue.length > 0}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <MonitorPlay className="w-3.5 h-3.5" />
                        <span>Xem Demo 3D</span>
                      </button>
                    </div>
                  )}

                  {/* Note toggle */}
                  {currentStep.note && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowNote(!showNote)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#a06030] hover:text-[#e07a5f] cursor-pointer"
                      >
                        <Info className="w-3 h-3" />
                        <span>{showNote ? 'Ẩn mẹo thực chiến' : 'Xem mẹo thực chiến'}</span>
                      </button>
                      {showNote && (
                        <p className="mt-1 text-[11px] text-[#706459] bg-[#faf6ee] p-2 rounded-lg border border-[#ebdcca] italic">
                          💡 {currentStep.note}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Nút liên kết trực tiếp sang Cẩm nang LSE khi ở Bước 4 */}
                  {selectedLesson.id === 'step4' && (
                    <div className="pt-2 border-t border-[#f4ebe1]">
                      {stepIndex <= 1 && (
                        <button
                          type="button"
                          onClick={() => { setActiveTab('lse_guide'); setLseSubTab('eo'); }}
                          className="w-full flex items-center justify-between p-2.5 bg-[#eaf4f2] hover:bg-[#dbeee9] text-[#247c72] rounded-xl border border-[#cde5e0] transition-all cursor-pointer font-bold text-xs"
                        >
                          <span>👉 Mở Cẩm Nang 10 Thế EO (Chi tiết & Trực quan)</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      {stepIndex === 2 && (
                        <button
                          type="button"
                          onClick={() => { setActiveTab('lse_guide'); setLseSubTab('ulur'); }}
                          className="w-full flex items-center justify-between p-2.5 bg-[#fdf5f2] hover:bg-[#faeae5] text-[#e07a5f] rounded-xl border border-[#f5cfc4] transition-all cursor-pointer font-bold text-xs"
                        >
                          <span>👉 Mở Cẩm Nang Bước 4b (UL/UR với 5 thế cờ & Sơ đồ)</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                      {stepIndex >= 3 && (
                        <button
                          type="button"
                          onClick={() => { setActiveTab('lse_guide'); setLseSubTab('l4e'); }}
                          className="w-full flex items-center justify-between p-2.5 bg-[#f0f4f8] hover:bg-[#e2eaf2] text-[#3d5a80] rounded-xl border border-[#cbd5e1] transition-all cursor-pointer font-bold text-xs"
                        >
                          <span>👉 Mở Cẩm Nang Bước 4c (L4E Tự Nghiệm 3 Bước & 23 Thế Cờ)</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Khối Key Takeaways / Kỹ thuật cốt lõi */}
            <div className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs">
              <h4 className="text-xs font-bold text-[#2c221e] flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-[#e07a5f]" />
                <span>Quy tắc cốt lõi của bước này:</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-[#5c4f43]">
                {selectedLesson.keyTechniques.map((tech, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e07a5f] shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{tech}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            4. TAB 2: CẨM NANG 2-LOOK CMLL (CHUẨN ROUXMETHODVN)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'two_look' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
            {/* Banner giới thiệu 2-Look */}
            <div className="p-3 bg-[#fcf8f2] rounded-2xl border border-[#ebdcca]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#2c221e]">
                <GraduationCap className="w-4 h-4 text-[#e76f51]" />
                <span>2-Look CMLL: Dễ học, không cần nhớ 45 công thức!</span>
              </div>
              <p className="text-[11px] text-[#706459] mt-1 leading-snug">
                Người mới chỉ cần nhớ <strong>7 công thức OLL góc</strong> để lật mặt vàng lên trên, sau đó áp dụng <strong>2 công thức PLL góc</strong> (T-Perm hoặc Y-Perm) để hoán vị 4 góc đúng vị trí 100%.
              </p>
            </div>

            {/* Sub-tab chuyển Step 1 (OLL) vs Step 2 (PLL) */}
            <div className="flex bg-[#faf6ee] p-1 rounded-xl border border-[#e4d9c7] gap-1">
              <button
                type="button"
                onClick={() => setTwoLookSubTab('oll')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  twoLookSubTab === 'oll'
                    ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                Bước 1: OLL Góc (7 thế)
              </button>
              <button
                type="button"
                onClick={() => setTwoLookSubTab('pll')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  twoLookSubTab === 'pll'
                    ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                Bước 2: PLL Góc (2 thế)
              </button>
            </div>

            {/* Danh sách các case 2-Look */}
            <div className="space-y-2.5">
              {(twoLookSubTab === 'oll' ? TWO_LOOK_OLL_CASES : TWO_LOOK_PLL_CASES).map((caseItem: TwoLookCornerCase) => (
                <div
                  key={caseItem.id}
                  className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs hover:border-[#d4c5af] transition-all flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#fbece7] text-[#c45335] border border-[#f5d3c8]">
                          {caseItem.type === 'oll' ? 'OLL Góc' : 'PLL Góc'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">
                          {caseItem.name}
                        </h4>
                      </div>
                      <p className="text-[11px] font-semibold text-[#a06030] mt-0.5">
                        {caseItem.vietnameseName}
                      </p>
                    </div>

                    {/* Sơ đồ CMLL mặt U & 4 viền chuẩn Speedcubing */}
                    <div className="flex flex-col items-center shrink-0">
                      <CMLLDiagram alg={caseItem.alg} size={52} />
                      <span className="text-[9px] text-[#8c7b6c] mt-0.5 font-medium">Mặt U & viền</span>
                    </div>
                  </div>

                  {/* Cách nhận biết */}
                  <div className="text-[11px] text-[#5c4f43] bg-[#faf6ee] p-2 rounded-xl border border-[#ebdcca] leading-snug">
                    <span className="font-bold text-[#2c221e]">🔍 Nhận biết: </span>
                    {caseItem.recognition}
                  </div>

                  {/* Công thức WCA Mono */}
                  <div className="p-2 bg-[#fcf9f2] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030] select-all break-all">
                    {caseItem.alg}
                  </div>

                  {/* Nút Tập & Chạy giải */}
                  <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                    <button
                      type="button"
                      onClick={() => handleSetupCase(caseItem.setupAlg || caseItem.alg, caseItem.name, !!caseItem.setupAlg)}
                      className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all hover:scale-102 active:scale-98 cursor-pointer"
                      title="Thiết lập thế cờ này lên Rubik để bạn tự xoay luyện tập"
                    >
                      <RotateCcw className="w-3 h-3 text-[#3d5a80]" />
                      <span>Tập thế này</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRunAlg(caseItem.alg, caseItem.name)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
                      title="Tự động xoay công thức này"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Chạy giải</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            5. TAB 3: CẨM NANG LSE (EO, UL/UR & L4E ĐẦY ĐỦ)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'lse_guide' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
            {/* Thanh điều hướng LSE 2 nhóm rõ ràng: Cốt lõi & Tốc độ */}
            <div className="flex flex-col gap-2 bg-[#faf6ee] p-2 rounded-2xl border border-[#e4d9c7]">
              {/* Nhóm 1: 3 Bước Cốt Lõi cho Người Mới (Bắt buộc) */}
              <div>
                <div className="text-[10px] font-bold text-[#8c7b6c] px-1 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>🌱 3 BƯỚC CỐT LÕI (DÀNH CHO NGƯỜI MỚI)</span>
                  <span className="text-[9px] text-[#b09e8d] font-normal">Roux Standard</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLseSubTab('eo')}
                    className={`py-2 px-1 text-center font-bold text-xs rounded-xl transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      lseSubTab === 'eo'
                        ? 'bg-[#247c72] text-white shadow-xs'
                        : 'bg-white text-[#247c72] hover:bg-[#eef5f3] border border-[#cde5e0]'
                    }`}
                  >
                    <span className="text-[9px] opacity-80 uppercase tracking-wide">Bước 4a</span>
                    <span className="text-xs">10 Thế EO</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLseSubTab('ulur')}
                    className={`py-2 px-1 text-center font-bold text-xs rounded-xl transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      lseSubTab === 'ulur'
                        ? 'bg-[#e07a5f] text-white shadow-xs'
                        : 'bg-white text-[#e07a5f] hover:bg-[#fdf8f5] border border-[#f4dec7]'
                    }`}
                  >
                    <span className="text-[9px] opacity-80 uppercase tracking-wide">Bước 4b</span>
                    <span className="text-xs">Hai Cánh UL/UR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLseSubTab('l4e')}
                    className={`py-2 px-1 text-center font-bold text-xs rounded-xl transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      lseSubTab === 'l4e'
                        ? 'bg-[#3d5a80] text-white shadow-xs'
                        : 'bg-white text-[#3d5a80] hover:bg-[#f0f4f8] border border-[#cbd5e1]'
                    }`}
                  >
                    <span className="text-[9px] opacity-80 uppercase tracking-wide">Bước 4c</span>
                    <span className="text-xs">L4E Cột M (23 Thế)</span>
                  </button>
                </div>
              </div>

              {/* Nhóm 2: Kỹ Thuật Tốc Độ & Speedcubing */}
              <div className="pt-1.5 border-t border-[#ebdcca]">
                <div className="text-[10px] font-bold text-[#8c7b6c] px-1 mb-1 uppercase tracking-wider">
                  ⚡ KỸ THUẬT TỐC ĐỘ (PRO & SPEEDCUBING)
                </div>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setLseSubTab('fast_eo')}
                    className={`py-1.5 px-1 font-bold rounded-lg transition-all cursor-pointer text-center truncate ${
                      lseSubTab === 'fast_eo'
                        ? 'bg-white text-[#2b72a6] shadow-2xs border border-[#b2d5e5]'
                        : 'text-[#7a6f64] hover:text-[#2c221e] hover:bg-white/60'
                    }`}
                  >
                    Nhìn FD &lt;1s
                  </button>
                  <button
                    type="button"
                    onClick={() => setLseSubTab('dots_skip')}
                    className={`py-1.5 px-1 font-bold rounded-lg transition-all cursor-pointer text-center truncate ${
                      lseSubTab === 'dots_skip'
                        ? 'bg-white text-[#e07a5f] shadow-2xs border border-[#f2d6c9]'
                        : 'text-[#7a6f64] hover:text-[#2c221e] hover:bg-white/60'
                    }`}
                  >
                    Né D-Dots & Ez
                  </button>
                  <button
                    type="button"
                    onClick={() => setLseSubTab('eolr')}
                    className={`py-1.5 px-1 font-bold rounded-lg transition-all cursor-pointer text-center truncate ${
                      lseSubTab === 'eolr'
                        ? 'bg-white text-[#9d0208] shadow-2xs border border-[#f8c9c9]'
                        : 'text-[#7a6f64] hover:text-[#2c221e] hover:bg-white/60'
                    }`}
                  >
                    EOLR Master
                  </button>
                </div>
              </div>
            </div>

            {/* ── NỘI DUNG 4a: EO (EDGE ORIENTATION) ── */}
            {lseSubTab === 'eo' && (
              <div className="space-y-3">
                {/* Hộp Quy tắc đếm Bad Edge */}
                <div className="p-3 bg-[#f5f8fa] rounded-2xl border border-[#cbe0ec]">
                  <h4 className="text-xs font-bold text-[#1f4e78] flex items-center gap-1.5 mb-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#2b72a6]" />
                    <span>{LSE_BAD_EDGE_RULES.title}</span>
                  </h4>
                  <ul className="space-y-1 text-[11px] text-[#335570]">
                    {LSE_BAD_EDGE_RULES.principles.map((pr, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#2b72a6] shrink-0 mt-1.5" />
                        <span className="leading-snug">{pr}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hộp Cảnh báo & Hướng dẫn Căn chỉnh (AUF) thế 1/1 */}
                <div className="p-3 bg-[#fff9f2] rounded-2xl border border-[#f3d9b8] shadow-2xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-[#d97706] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-[#92400e]">
                        Mẹo sống còn thế 1/1: Quy tắc 2 cạnh chéo nhau qua tâm
                      </h4>
                      <p className="text-[11px] text-[#78350f] mt-0.5 leading-snug">
                        Gặp 1 cạnh sai ở U và 1 cạnh sai ở D? Hai cạnh này <strong>BẮT BUỘC phải nằm chéo nhau</strong> (1 phía trước, 1 phía sau):
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-white/90 rounded-xl border border-[#fae4cd] space-y-1">
                      <div className="font-bold text-[#b45309] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#e07a5f]" />
                        <span>Thế 1/1 (F) — Cạnh đáy ở trước (DF)</span>
                      </div>
                      <p className="text-[10.5px] text-[#5c4f43] leading-relaxed">
                        • Nhận biết: Sticker <strong>FD</strong> có màu Vàng/Trắng.<br />
                        • Căn chỉnh tầng U: Xoay U để đưa cạnh sai ở U ra <strong>sau lưng (UB)</strong>!<br />
                        • <span className="font-semibold text-[#b91c1c]">Lỗi kinh điển:</span> Nếu cạnh đỉnh đang ở <strong>UF</strong> (trước mặt), <strong>xoay U2 trước</strong> rồi mới làm <code className="font-mono bg-[#fdf0e6] px-1 py-0.5 rounded text-[#c2410c]">M' U' M U' M' U' M'</code>.
                      </p>
                    </div>

                    <div className="p-2 bg-white/90 rounded-xl border border-[#fae4cd] space-y-1">
                      <div className="font-bold text-[#2a9d8f] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#2a9d8f]" />
                        <span>Thế 1/1 (B) — Cạnh đáy ở sau (DB)</span>
                      </div>
                      <p className="text-[10.5px] text-[#5c4f43] leading-relaxed">
                        • Nhận biết: Sticker <strong>FD</strong> KHÔNG CÓ màu Vàng/Trắng.<br />
                        • Căn chỉnh tầng U: Xoay U để đưa cạnh sai ở U về <strong>trước mặt (UF)</strong>!<br />
                        • <span className="font-semibold text-[#b91c1c]">Lưu ý:</span> Nếu cạnh đỉnh đang ở <strong>UB</strong> (sau lưng), <strong>xoay U2 trước</strong> rồi mới làm <code className="font-mono bg-[#eaf4f2] px-1 py-0.5 rounded text-[#247c72]">M' U' M' U' M U' M'</code>.
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#8c6b4f] bg-white/60 p-2 rounded-xl border border-[#f3d9b8] leading-tight">
                    ⚡ <strong>Lưu ý finger-trick:</strong> <code className="font-mono font-bold text-[#c2410c]">M'</code> là ngón giữa gạt từ đáy lên đỉnh (theo chiều xoay R). Đừng gạt ngược từ trên xuống (<code className="font-mono text-[#78350f]">M</code>) sẽ làm sai thuật toán!
                  </div>
                </div>

                {/* Bộ lọc nhóm thế EO */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                  {[
                    { id: 'all', label: 'Tất cả (11 thế)' },
                    { id: 'base', label: 'Cơ bản 3/1' },
                    { id: '2bad', label: '2 Cạnh sai' },
                    { id: '4bad', label: '4 Cạnh sai' },
                    { id: '6bad', label: '6 Cạnh sai (4/2)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setEoFilter(f.id as any)}
                      className={`px-2 py-1 font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                        eoFilter === f.id
                          ? 'bg-[#2a9d8f] text-white shadow-2xs'
                          : 'bg-[#faf6ee] text-[#5c4f43] hover:bg-[#f0e7d8] border border-[#e2d8c7]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Danh sách các thế EO */}
                <div className="space-y-2.5">
                  {filteredEOCases.map((caseItem: EOCase) => (
                    <div
                      key={caseItem.id}
                      className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs hover:border-[#d4c5af] transition-all flex flex-col gap-2"
                    >
                      {/* Header thế EO */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 text-xs font-mono font-black rounded-md bg-[#eaf4f2] text-[#247c72] border border-[#cde5e0]">
                              {caseItem.code}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">
                              {caseItem.name}
                            </h4>
                          </div>
                          <div className="text-[10px] text-[#706459] font-medium mt-0.5">
                            Số cạnh sai: {caseItem.badCount} ({caseItem.badU} ở U, {caseItem.badD} ở D)
                          </div>
                          <div className="mt-1.5 flex items-center gap-1">
                            <span className="text-[10px] font-bold text-[#8c7b6c]">Trigger:</span>
                            <span className="px-2 py-0.5 font-mono font-bold text-[11px] bg-[#faf6ee] text-[#e07a5f] rounded-lg border border-[#ebdcca]">
                              {caseItem.triggerAlg}
                            </span>
                          </div>
                        </div>

                        {/* Hình minh hoạ Bad Edge tầng U & tầng D */}
                        <EODiagram diagramU={caseItem.diagramU} diagramD={caseItem.diagramD} />
                      </div>

                      {/* Hướng dẫn nhận biết & cách đặt khối */}
                      <p className="text-[11px] text-[#5c4f43] bg-[#faf6ee] p-2 rounded-xl border border-[#ebdcca] leading-snug">
                        {caseItem.recognitionTip}
                      </p>

                      {/* Chuỗi hoàn tất toàn bộ */}
                      <div className="flex items-center justify-between text-[11px] px-2 py-1.5 bg-[#fcf9f2] rounded-xl border border-[#ebdcca]">
                        <span className="font-semibold text-[#8c7b6c]">Chuỗi giải đầy đủ:</span>
                        <span className="font-mono font-bold text-xs text-[#a06030]">
                          {caseItem.fullSolution}
                        </span>
                      </div>

                      {/* Nút Tập & Chạy giải */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                        <button
                          type="button"
                          onClick={() => handleSetupCase(caseItem.setupAlg, caseItem.code, true)}
                          className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all hover:scale-102 active:scale-98 cursor-pointer"
                          title="Thiết lập thế cờ này lên Rubik"
                        >
                          <RotateCcw className="w-3 h-3 text-[#3d5a80]" />
                          <span>Tập thế {caseItem.code}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRunAlg(caseItem.fullSolution, caseItem.code)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
                          title="Tự động xoay giải EO"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Giải EO</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── NỘI DUNG 4b: UL & UR (HAI CÁNH BÊN HÔNG) ── */}
            {lseSubTab === 'ulur' && (
              <div className="space-y-3">
                {/* 1. BANNER MỤC TIÊU & QUY TẮC BẤT BIẾN */}
                <div className="p-3 bg-[#fdfaf5] rounded-2xl border border-[#ebdcca] shadow-2xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Compass className="w-4 h-4 text-[#e07a5f] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">
                        {LSE_UL_UR_GUIDE.title}
                      </h4>
                      <p className="text-[11px] text-[#706459] mt-0.5 leading-snug">
                        {LSE_UL_UR_GUIDE.objective}
                      </p>
                    </div>
                  </div>

                  {/* Quy tắc bất biến */}
                  <div className="p-2.5 bg-[#faf6ee] rounded-xl border border-[#ede3d5] text-[11px] space-y-1">
                    <div className="font-bold text-[#a06030] flex items-center gap-1">
                      <span>💡 3 Quy tắc bất biến của Bước 4b:</span>
                    </div>
                    <ul className="space-y-1 text-[#5c4f43]">
                      {LSE_UL_UR_GUIDE.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e07a5f] shrink-0 mt-1.5" />
                          <span className="leading-relaxed">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 2. NHẬN DIỆN 3 TRƯỜNG HỢP BAN ĐẦU */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#2c221e] flex items-center gap-1.5">
                    <span>🔍 3 Tình huống ban đầu khi bắt đầu Bước 4b:</span>
                  </div>
                  {LSE_UL_UR_GUIDE.initialCases.map((cs) => (
                    <div
                      key={cs.caseType}
                      className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-[#2c221e]">{cs.title}</h5>
                        <p className="text-[11px] text-[#5c4f43] mt-1 leading-snug">
                          {cs.description}
                        </p>
                        <div className="mt-1 text-[10px] font-bold text-[#247c72]">
                          👉 {cs.nextAction}
                        </div>
                      </div>
                      <ULURDiagram caseType={cs.caseType} />
                    </div>
                  ))}
                </div>

                {/* 3. PHƯƠNG PHÁP 3 GIAI ĐOẠN TỰ NGHIỆM */}
                <div className="p-3 bg-[#f0f7f9] rounded-2xl border border-[#cbe3dd] space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#247c72]" />
                    <h5 className="text-xs font-bold text-[#1b4965]">
                      Lộ trình 3 giai đoạn tự nghiệm hoàn tất 2 cánh:
                    </h5>
                  </div>
                  <div className="space-y-2">
                    {LSE_UL_UR_GUIDE.phases.map((ph) => (
                      <div key={ph.step} className="p-2.5 bg-white rounded-xl border border-[#d2e7ee] text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[#1b4965]">
                          <span className="w-4 h-4 rounded-full bg-[#e3f2fd] text-[#1976d2] text-[10px] flex items-center justify-center font-mono">
                            {ph.step}
                          </span>
                          <span>{ph.title}</span>
                        </div>
                        <p className="text-[#334155] pl-5.5 leading-relaxed">
                          {ph.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. CÁC THẾ CỜ THỰC CHIẾN TIÊU BIỂU */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#2c221e]">
                    ⚡ Các thế cờ UL/UR thực chiến tiêu biểu (Có Demo 3D):
                  </div>
                  {LSE_UL_UR_GUIDE.samples.map((sample) => (
                    <div
                      key={sample.id}
                      className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs hover:border-[#d4c5af] transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-[#2c221e]">
                            {sample.name}
                          </h5>
                          <p className="text-[11px] text-[#5c4f43] mt-1 leading-snug">
                            {sample.condition}
                          </p>
                        </div>
                        <ULURDiagram caseType={sample.caseType} />
                      </div>

                      {/* Công thức */}
                      <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030] select-all break-all flex items-center justify-between">
                        <span>{sample.alg}</span>
                      </div>

                      <div className="text-[10px] text-[#706459] italic">
                        💡 {sample.tip}
                      </div>

                      {/* Nút Tập & Chạy giải */}
                      <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                        <button
                          type="button"
                          onClick={() => handleSetupCase(sample.setupAlg, sample.name, true)}
                          className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all hover:scale-102 active:scale-98 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-[#3d5a80]" />
                          <span>Tập thế này</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRunAlg(sample.alg, sample.name)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Chạy giải</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 5. NÚT CHUYỂN TIẾP TRỰC TIẾP SANG BƯỚC 4c (L4E) */}
                <div className="p-3 bg-[#fdf5f2] rounded-2xl border border-[#f5cfc4] flex items-center justify-between gap-2">
                  <div className="text-[11px] text-[#822a2a] leading-tight">
                    <strong>Đã hoàn thành 2 cánh UL & UR?</strong>
                    <div className="text-[10px] text-[#a06030] mt-0.5">Khối Rubik giờ chỉ còn đúng 4 cạnh trên cột giữa M!</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLseSubTab('l4e')}
                    className="px-3 py-2 text-xs font-bold bg-[#3d5a80] hover:bg-[#2b4360] text-white rounded-xl shadow-xs transition-all shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <span>Mở Bước 4c (L4E)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── NỘI DUNG 4c: L4E (CỘT M) ── */}
            {lseSubTab === 'l4e' && (
              <div className="space-y-3">
                {/* 1. KHỐI HƯỚNG DẪN TỰ NGHIỆM 3 GIAI ĐOẠN (CHI TIẾT & CÓ SƠ ĐỒ) */}
                <div className="p-3.5 bg-[#fdfaf5] rounded-2xl border border-[#ebdcca] shadow-2xs space-y-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#e07a5f] mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">
                        {LSE_L4E_INTUITIVE_GUIDE.title}
                      </h4>
                      <p className="text-[11px] text-[#706459] mt-0.5 leading-snug">
                        {LSE_L4E_INTUITIVE_GUIDE.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Bản chất & Nguyên lý cốt lõi */}
                  <div className="p-2.5 bg-[#faf6ee] rounded-xl border border-[#ede3d5] text-[11px] space-y-1">
                    <div className="font-bold text-[#a06030] flex items-center gap-1">
                      <span>💡 Bản chất của Bước L4E (Dễ hiểu cho người mới):</span>
                    </div>
                    <ul className="space-y-1 text-[#5c4f43]">
                      {LSE_L4E_INTUITIVE_GUIDE.concept.map((cp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e07a5f] shrink-0 mt-1.5" />
                          <span className="leading-relaxed">{cp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3 Giai đoạn tự nghiệm — CÓ SƠ ĐỒ CẮT LỚP CỘT M */}
                  <div className="space-y-2.5 pt-1">
                    <div className="text-xs font-bold text-[#2c221e]">
                      📐 Lộ trình 3 giai đoạn tự nghiệm (Kèm Sơ đồ Cột M):
                    </div>
                    {LSE_L4E_INTUITIVE_GUIDE.stages.map((st) => (
                      <div
                        key={st.id}
                        className="p-3 bg-white rounded-xl border border-[#ede3d5] shadow-2xs flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-[#2c221e]">
                              <span className="w-4 h-4 rounded-full bg-[#f4ece1] text-[#a06030] text-[10px] flex items-center justify-center font-mono shrink-0">
                                {st.stepNumber}
                              </span>
                              <h5 className="text-xs font-bold text-[#2c221e]">{st.title}</h5>
                            </div>
                            <p className="text-[11px] text-[#247c72] font-semibold mt-1 pl-5.5">
                              🎯 Mục tiêu: {st.goal}
                            </p>
                          </div>
                          {/* Sơ đồ minh họa cột M cho từng giai đoạn */}
                          <L4EIntuitiveDiagram stage={st.stage} />
                        </div>

                        {/* Các tình huống cụ thể trong giai đoạn */}
                        <div className="space-y-1.5 pt-1 border-t border-[#f7f2ea]">
                          {st.cases.map((cs, cIdx) => (
                            <div key={cIdx} className="p-2 bg-[#fdfaf5] rounded-lg border border-[#f0e8db] text-[11px] space-y-0.5">
                              <div className="font-bold text-[#2c221e] flex items-center justify-between">
                                <span>{cs.name}</span>
                                <span className="font-mono text-[#e07a5f] bg-white px-1.5 py-0.5 rounded border border-[#ebdcca] text-[10px]">
                                  {cs.action}
                                </span>
                              </div>
                              <p className="text-[#5c4f43] text-[10px] leading-relaxed">
                                {cs.detail}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 4 BÀI TẬP TỰ NGHIỆM THỰC HÀNH TRỰC TIẾP TRÊN 3D */}
                  <div className="space-y-2 pt-1 border-t border-[#ede3d5]">
                    <div className="text-xs font-bold text-[#2c221e] flex items-center justify-between">
                      <span>🧪 Bài tập Tự nghiệm Thực hành (Demo 3D):</span>
                      <span className="text-[10px] font-normal text-[#8c7b6c]">Bấm để xem và xoay thử</span>
                    </div>
                    {LSE_L4E_INTUITIVE_GUIDE.exercises.map((ex) => (
                      <div
                        key={ex.id}
                        className="p-2.5 bg-white rounded-xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-[#2c221e]">{ex.name}</h5>
                            <p className="text-[11px] text-[#5c4f43] mt-0.5 leading-snug">
                              {ex.scenario}
                            </p>
                          </div>
                          <span className="font-mono font-bold text-xs text-[#a06030] bg-[#faf6ee] px-2 py-1 rounded-lg border border-[#ebdcca] shrink-0">
                            {ex.solution}
                          </span>
                        </div>

                        <p className="text-[10px] text-[#706459] italic">
                          💡 {ex.tip}
                        </p>

                        <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                          <button
                            type="button"
                            onClick={() => handleSetupCase(ex.setupAlg, ex.name, true)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-lg border border-[#e2d8c7] transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3 text-[#3d5a80]" />
                            <span>Tập thế này</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRunAlg(ex.solution, ex.name)}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-lg shadow-xs transition-all cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Chạy giải</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cam kết tính chính xác toán học & Quy ước hướng cầm */}
                  <div className="p-2.5 bg-[#f0f7f9] rounded-xl border border-[#cbe3dd] text-[11px] text-[#1b4965] space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-[#1b4965]">
                      <Info className="w-3.5 h-3.5 text-[#247c72] shrink-0" />
                      <span>Cam kết chuẩn xác 100% công thức (Roux Standard):</span>
                    </div>
                    <p className="leading-relaxed text-[#2c5364]">
                      Toàn bộ 23 công thức và các bước tự nghiệm đều được trích xuất nguyên gốc từ giáo trình <strong>RouxMethodVN</strong> và đã kiểm chứng toán học 100% Solved trên mô phỏng 54-facelet.
                    </p>
                    <p className="leading-relaxed text-[#2c5364] font-semibold">
                      👉 <strong>Lưu ý bất biến:</strong> Luôn giữ mặt <strong>F là Xanh lá (Lục)</strong> trước mặt, mặt <strong>U là Vàng</strong> ở trên, mặt <strong>D là Trắng</strong> ở đáy khi xoay các công thức!
                    </p>
                  </div>
                </div>

                {/* 2. THANH LỌC NHÓM CÁC THẾ L4E */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setL4eFilter('all')}
                    className={`px-2.5 py-1 font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                      l4eFilter === 'all'
                        ? 'bg-[#3d5a80] text-white shadow-xs'
                        : 'bg-white text-[#5c4f43] hover:bg-[#faf6ee] border border-[#e2d8c7]'
                    }`}
                  >
                    Tất cả (23)
                  </button>
                  <button
                    type="button"
                    onClick={() => setL4eFilter('intuitive')}
                    className={`px-2.5 py-1 font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                      l4eFilter === 'intuitive'
                        ? 'bg-[#e07a5f] text-white shadow-xs'
                        : 'bg-white text-[#5c4f43] hover:bg-[#faf6ee] border border-[#e2d8c7]'
                    }`}
                  >
                    💡 Tự nghiệm (3 bước)
                  </button>
                  <button
                    type="button"
                    onClick={() => setL4eFilter('1_white_edge')}
                    className={`px-2.5 py-1 font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                      l4eFilter === '1_white_edge'
                        ? 'bg-[#247c72] text-white shadow-xs'
                        : 'bg-white text-[#5c4f43] hover:bg-[#faf6ee] border border-[#e2d8c7]'
                    }`}
                  >
                    Nhóm 1: 1 Cạnh trắng (8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setL4eFilter('1_white_edge_center')}
                    className={`px-2.5 py-1 font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                      l4eFilter === '1_white_edge_center'
                        ? 'bg-[#c57b32] text-white shadow-xs'
                        : 'bg-white text-[#5c4f43] hover:bg-[#faf6ee] border border-[#e2d8c7]'
                    }`}
                  >
                    Nhóm 2: Cạnh + Tâm trắng (8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setL4eFilter('special')}
                    className={`px-2.5 py-1 font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                      l4eFilter === 'special'
                        ? 'bg-[#8338ec] text-white shadow-xs'
                        : 'bg-white text-[#5c4f43] hover:bg-[#faf6ee] border border-[#e2d8c7]'
                    }`}
                  >
                    Nhóm 3: Đặc biệt & Dots (7)
                  </button>
                </div>

                {/* 3. DANH SÁCH CÁC THẾ L4E ĐƯỢC LỌC */}
                {l4eFilter !== 'intuitive' && (
                  <div className="space-y-2.5">
                    {filteredL4ECases.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs hover:border-[#d4c5af] transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${
                                caseItem.group === '1_white_edge'
                                  ? 'bg-[#eef5f3] text-[#247c72] border-[#cbe3dd]'
                                  : caseItem.group === '1_white_edge_center'
                                  ? 'bg-[#fcf3ea] text-[#c57b32] border-[#f4dec7]'
                                  : 'bg-[#f5eefc] text-[#8338ec] border-[#e4d2fa]'
                              }`}>
                                {caseItem.groupName}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">
                                {caseItem.name}
                              </h4>
                            </div>
                            <p className="text-[11px] text-[#5c4f43] mt-1 leading-snug">
                              {caseItem.recognition}
                            </p>
                          </div>

                          {/* Sơ đồ hoán vị cột M */}
                          <L4EDiagram caseId={caseItem.id} />
                        </div>

                        {/* Công thức */}
                        <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030] select-all break-all flex items-center justify-between">
                          <span>{caseItem.alg}</span>
                        </div>

                        <div className="text-[10px] text-[#706459] italic">
                          💡 {caseItem.tip}
                        </div>

                        {/* Nút Tập & Chạy giải */}
                        <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                          <button
                            type="button"
                            onClick={() => handleSetupCase(caseItem.setupAlg, caseItem.name, true)}
                            className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all hover:scale-102 active:scale-98 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3 text-[#3d5a80]" />
                            <span>Tập thế này</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRunAlg(caseItem.alg, caseItem.name)}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Chạy giải</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── NỘI DUNG FAST EO: NHẬN BIẾT NHANH EO QUA FD ── */}
            {lseSubTab === 'fast_eo' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#f0f7f9] rounded-2xl border border-[#c4e0e8]">
                  <h4 className="text-xs font-bold text-[#1b4965] flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5 text-[#2b72a6]" />
                    <span>{FAST_EO_GUIDE.title}</span>
                  </h4>
                  <p className="text-[11px] text-[#2c5364] leading-snug">
                    {FAST_EO_GUIDE.principle}
                  </p>
                  <div className="mt-2 p-2 bg-white/80 rounded-xl font-mono text-[11px] font-bold text-[#1b4965] border border-[#d2e7ee]">
                    👉 {FAST_EO_GUIDE.formula}
                  </div>
                </div>

                <div className="space-y-2">
                  {FAST_EO_GUIDE.steps.map((st, i) => (
                    <div key={i} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs">
                      <h5 className="text-xs font-bold text-[#2c221e] mb-1">{st.title}</h5>
                      <p className="text-[11px] text-[#5c4f43] whitespace-pre-line leading-relaxed">
                        {st.content}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-[#e8dfcf] overflow-hidden shadow-2xs">
                  <div className="p-2.5 bg-[#faf6ee] border-b border-[#ebdcca] text-xs font-bold text-[#2c221e]">
                    Bảng tra cứu nhanh [U Bad] + [Sticker FD]
                  </div>
                  <div className="divide-y divide-[#f2e9dc]">
                    {FAST_EO_GUIDE.lookupTable.map((row, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-1.5 py-0.5 rounded-md bg-[#faf6ee] border border-[#e2d8c7] font-mono font-bold text-[#a06030]">
                            {row.uBadCount} Bad ở U
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                            row.fdStatus === 'bad'
                              ? 'bg-[#ffe8e8] text-[#c92a2a] border border-[#fcc2c2]'
                              : 'bg-[#e6fcf5] text-[#0ca678] border border-[#b2f2bb]'
                          }`}>
                            FD: {row.fdStatus.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-right flex-1 min-w-0">
                          <span className="font-bold text-[#2c221e] block truncate">{row.inferredCase}</span>
                          <span className="text-[10px] text-[#706459] block truncate">{row.explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── NỘI DUNG DOTS SKIPPING & EZ L4E ── */}
            {lseSubTab === 'dots_skip' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#fdf8f5] rounded-2xl border border-[#f2d6c9]">
                  <h4 className="text-xs font-bold text-[#b23a1a] flex items-center gap-1.5 mb-1">
                    <Flame className="w-3.5 h-3.5 text-[#e07a5f]" />
                    <span>{DOTS_SKIPPING_GUIDE.title}</span>
                  </h4>
                  <p className="text-[11px] text-[#7a4e3f] leading-snug">
                    {DOTS_SKIPPING_GUIDE.overview}
                  </p>
                </div>

                <div className="space-y-2">
                  {DOTS_SKIPPING_GUIDE.patterns.map((pt) => (
                    <div key={pt.id} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-1.5">
                      <h5 className="text-xs font-bold text-[#2c221e]">{pt.name}</h5>
                      <p className="text-[11px] text-[#5c4f43]">{pt.condition}</p>
                      <div className="p-2 bg-[#fff5f5] rounded-xl border border-[#ffc9c9] text-[10px] text-[#c92a2a]">
                        ⚠️ {pt.standardRule}
                      </div>
                      <div className="p-2 bg-[#f0fbf7] rounded-xl border border-[#b2f2bb] text-[10px] text-[#0ca678]">
                        ✨ <strong>Né Dots:</strong> {pt.skipTrick}
                      </div>
                      <div className="p-1.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030] text-center">
                        {pt.formula}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-[#e8dfcf] p-3 shadow-2xs space-y-2">
                  <h5 className="text-xs font-bold text-[#2c221e]">Các thế Ez L4E siêu tốc</h5>
                  {DOTS_SKIPPING_GUIDE.ezL4ECases.map((ez) => (
                    <div key={ez.id} className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] text-[11px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#2c221e]">{ez.name}</span>
                        <span className="font-mono font-bold text-[#e07a5f]">{ez.moves}</span>
                      </div>
                      <p className="text-[10px] text-[#706459]">{ez.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── NỘI DUNG EOLR MASTER ── */}
            {lseSubTab === 'eolr' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#fdf2f2] rounded-2xl border border-[#f8c9c9]">
                  <h4 className="text-xs font-bold text-[#a61e1e] flex items-center gap-1.5 mb-1">
                    <Trophy className="w-3.5 h-3.5 text-[#e63946]" />
                    <span>{EOLR_GUIDE.title}</span>
                  </h4>
                  <p className="text-[11px] text-[#822a2a] leading-snug">
                    {EOLR_GUIDE.overview}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-[#fa5252] text-white text-[10px] font-bold rounded-full">
                    ⚡ {EOLR_GUIDE.efficiency}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-[#2c221e]">Các thế EOLR thực chiến tiêu biểu</div>
                  {EOLR_GUIDE.samples.map((sample) => (
                    <div key={sample.id} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#eef5f3] text-[#247c72] border border-[#cbe3dd]">
                            Nhóm {sample.eoGroup}
                          </span>
                          <h5 className="text-xs font-bold text-[#2c221e] mt-1">{sample.name}</h5>
                        </div>
                        <span className="text-[10px] font-bold text-[#2b72a6] shrink-0 font-mono">
                          {sample.savedMoves}
                        </span>
                      </div>

                      <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030] flex items-center justify-between">
                        <span>Solution: {sample.solution}</span>
                      </div>

                      <p className="text-[10px] text-[#706459] italic">
                        💡 {sample.tip}
                      </p>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                        <button
                          type="button"
                          onClick={() => handleSetupCase(sample.setupAlg, sample.name, true)}
                          className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all hover:scale-102 active:scale-98 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-[#3d5a80]" />
                          <span>Tập thế này</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRunAlg(sample.solution, sample.name)}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Chạy EOLR</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            6. TAB 4: TRA CỨU & LUYỆN TẬP 45 CMLL NÂNG CAO (2H & OH)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'cmll' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
            {/* Chuyển đổi chế độ 2 Tay (2H) vs 1 Tay (OH) */}
            <div className="flex bg-[#faf6ee] p-1 rounded-xl border border-[#e4d9c7] gap-1">
              <button
                type="button"
                onClick={() => setCmllMode('2h')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  cmllMode === '2h'
                    ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                <span>Hai Tay (2H Chuẩn)</span>
              </button>
              <button
                type="button"
                onClick={() => setCmllMode('oh')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  cmllMode === 'oh'
                    ? 'bg-[#3d5a80] text-white shadow-2xs'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                <Hand className="w-3.5 h-3.5 text-[#e07a5f]" />
                <span>Một Tay (OH Tối Ưu)</span>
              </button>
            </div>

            {cmllMode === 'oh' && (
              <div className="p-2.5 bg-[#f0f4f8] rounded-xl border border-[#cbd5e1] text-[11px] text-[#334155] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3d5a80] shrink-0" />
                <span>
                  <strong>Chế độ OH (One-Handed):</strong> Tối ưu hóa finger-trick 1 tay, né các move F và M phức tạp, ưu tiên tối đa các move &lt;R, U, D, r&gt;.
                </span>
              </div>
            )}

            {/* Thanh tìm kiếm & Lọc nhóm */}
            <div className="flex flex-col gap-2 bg-white p-3 rounded-2xl border border-[#e8dfcf] shadow-2xs">
              <div className="flex items-center gap-2 bg-[#faf6ee] px-2.5 py-1.5 rounded-xl border border-[#e4d9c7]">
                <Search className="w-3.5 h-3.5 text-[#8c7b6c]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên (Sune, T-Perm...) hoặc công thức..."
                  className="w-full text-xs text-[#2c221e] bg-transparent outline-none placeholder:text-[#a89b8d]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-[#8c7b6c] hover:text-[#2c221e]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Thanh lọc theo 8 nhóm CMLL */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                {CMLL_GROUPS.map((grp) => {
                  const isGrpSelected = selectedGroup === grp;
                  return (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedGroup(grp)}
                      className={`px-2.5 py-1 font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                        isGrpSelected
                          ? 'bg-[#3d5a80] text-white shadow-xs'
                          : 'bg-[#faf6ee] text-[#5c4f43] hover:bg-[#f0e7d8] border border-[#e2d8c7]'
                      }`}
                    >
                      {grp === 'ALL' ? (cmllMode === 'oh' ? 'Tất cả OH (42)' : 'Tất cả (45)') : `Nhóm ${grp}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Danh sách các thế cờ CMLL */}
            <div className="flex flex-col gap-2.5">
              {filteredCMLL.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#8c7b6c]">
                  Không tìm thấy thế cờ CMLL nào khớp với từ khóa tìm kiếm.
                </div>
              ) : (
                filteredCMLL.map((caseItem: any) => (
                  <div
                    key={caseItem.name}
                    className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs hover:border-[#d4c5af] transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#eef5f3] text-[#247c72] border border-[#cbe3dd]">
                            Nhóm {caseItem.group}
                          </span>
                          {cmllMode === 'oh' && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff]">
                              OH 1-Hand
                            </span>
                          )}
                          <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">
                            {caseItem.name}
                          </h4>
                        </div>
                        {caseItem.description && (
                          <p className="text-[11px] text-[#706459] mt-1 leading-snug">
                            {caseItem.description}
                          </p>
                        )}
                        {cmllMode === 'oh' && caseItem.standard2HAlg && (
                          <p className="text-[10px] text-[#8c7b6c] mt-0.5 font-mono">
                            2H gốc: <span className="text-[#a06030]">{caseItem.standard2HAlg}</span>
                          </p>
                        )}
                      </div>

                      {/* Sơ đồ 4 góc mặt U & 4 viền chuẩn Speedcubing */}
                      <div className="flex flex-col items-center shrink-0">
                        <CMLLDiagram alg={caseItem.alg} size={54} />
                        <span className="text-[9px] text-[#8c7b6c] mt-0.5 font-medium">Mặt U & viền</span>
                      </div>
                    </div>

                    {/* Công thức WCA Mono nổi bật */}
                    <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030] select-all break-all">
                      {caseItem.alg}
                    </div>

                    {/* 2 Nút thao tác: Tập case này (Setup) & Chạy công thức */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                      <button
                        type="button"
                        onClick={() => handleSetupCase(caseItem.alg, caseItem.name)}
                        className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all hover:scale-102 active:scale-98 cursor-pointer"
                        title="Xoay khối Rubik về thế cờ này để bạn tự tay giải thử"
                      >
                        <RotateCcw className="w-3 h-3 text-[#3d5a80]" />
                        <span>Tập thế cờ này</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRunAlg(caseItem.alg, caseItem.name)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
                        title="Tự động xoay công thức này trên khối 3D"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Chạy giải</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            7. TAB 5: NÂNG CAO & PRO TIPS (NMC, SUB-X, MEYER 4X4)
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'pro_tips' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
            {/* Sub-tabs Pro Tips */}
            <div className="flex bg-[#faf6ee] p-1 rounded-xl border border-[#e4d9c7] gap-1">
              <button
                type="button"
                onClick={() => setProSubTab('techniques')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  proSubTab === 'techniques'
                    ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                Kỹ Thuật Pro
              </button>
              <button
                type="button"
                onClick={() => setProSubTab('sub_x')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  proSubTab === 'sub_x'
                    ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                Lộ Trình Sub-X
              </button>
              <button
                type="button"
                onClick={() => setProSubTab('meyer')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  proSubTab === 'meyer'
                    ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                Roux 4x4 (Meyer)
              </button>
            </div>

            {/* ── NỘI DUNG 1: CÁC KỸ THUẬT PRO ── */}
            {proSubTab === 'techniques' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#fdfaf4] rounded-2xl border border-[#ebdcca] text-xs text-[#706459]">
                  Tổng hợp 4 kỹ thuật đỉnh cao được các speedcuber hàng đầu phát triển để tối ưu hóa triệt để số lượt xoay (Movecount) và mở rộng không gian giải Roux.
                </div>

                {PRO_TECHNIQUES.map((tech) => (
                  <div key={tech.id} className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-[#eef5f3] text-[#247c72] border border-[#cbe3dd]">
                          Kỹ thuật Pro
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#2c221e] mt-1">{tech.title}</h4>
                        <p className="text-[11px] font-semibold text-[#a06030]">{tech.vietnameseTitle}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#5c4f43] leading-relaxed">
                      {tech.summary}
                    </p>

                    <div className="p-2.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca] text-[11px] text-[#2c221e] whitespace-pre-line leading-relaxed font-mono">
                      {tech.howItWorks}
                    </div>

                    {tech.scramble && (
                      <div className="p-2 bg-[#fcf9f2] rounded-xl border border-[#ebdcca] text-[10px] space-y-1">
                        <div className="font-semibold text-[#8c7b6c]">Ví dụ thực chiến:</div>
                        <div className="font-mono text-[#5c4f43] break-all">Scramble: {tech.scramble}</div>
                        <div className="font-mono font-bold text-[#e07a5f] break-all">{tech.solution}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[10px]">
                      <div className="p-2 bg-[#f0fbf7] rounded-xl border border-[#b2f2bb] text-[#0ca678]">
                        <strong className="block mb-0.5">Ưu điểm:</strong>
                        <ul className="list-disc list-inside space-y-0.5">
                          {tech.pros.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                      <div className="p-2 bg-[#fff5f5] rounded-xl border border-[#ffc9c9] text-[#c92a2a]">
                        <strong className="block mb-0.5">Nhược điểm:</strong>
                        <ul className="list-disc list-inside space-y-0.5">
                          {tech.cons.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── NỘI DUNG 2: LỘ TRÌNH SUB-X ── */}
            {proSubTab === 'sub_x' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#f0f7f9] rounded-2xl border border-[#c4e0e8]">
                  <h4 className="text-xs font-bold text-[#1b4965] flex items-center gap-1.5 mb-1">
                    <Trophy className="w-3.5 h-3.5 text-[#2b72a6]" />
                    <span>Lộ trình tiến bộ Sub-X theo chuẩn RouxMethodVN</span>
                  </h4>
                  <p className="text-[11px] text-[#2c5364] leading-snug">
                    Phân bổ mục tiêu số lượt xoay (Movecount) và thời gian cho từng phase từ lúc mới chơi đến mốc Sub-10 đẳng cấp thế giới.
                  </p>
                </div>

                <div className="space-y-3">
                  {SUB_X_ROADMAP.map((stage, idx) => (
                    <div key={idx} className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-[#f2e9dc] pb-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#e07a5f] uppercase tracking-wider">
                            Cấp độ {idx + 1}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">{stage.level}</h4>
                        </div>
                        <span className="px-2.5 py-1 bg-[#2a9d8f]/10 text-[#2a9d8f] text-xs font-bold rounded-xl border border-[#2a9d8f]/20 font-mono">
                          {stage.timeRange}
                        </span>
                      </div>

                      {/* Bảng mục tiêu Movecount */}
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                        <div className="p-1.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca]">
                          <span className="text-[#8c7b6c] block text-[9px]">FB Target</span>
                          <strong className="text-[#a06030] font-mono">{stage.fbMoveTarget}</strong>
                        </div>
                        <div className="p-1.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca]">
                          <span className="text-[#8c7b6c] block text-[9px]">SB Target</span>
                          <strong className="text-[#a06030] font-mono">{stage.sbMoveTarget}</strong>
                        </div>
                        <div className="p-1.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca]">
                          <span className="text-[#8c7b6c] block text-[9px]">CMLL</span>
                          <strong className="text-[#2b72a6] font-mono text-[9px] truncate block">{stage.cmllTarget}</strong>
                        </div>
                        <div className="p-1.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca]">
                          <span className="text-[#8c7b6c] block text-[9px]">LSE</span>
                          <strong className="text-[#0ca678] font-mono text-[9px] truncate block">{stage.lseTarget}</strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#706459] bg-[#fcf9f2] p-2 rounded-xl border border-[#ebdcca]">
                        ⏱️ <strong>Phân bổ thời gian (FB-SB-CMLL-LSE):</strong> <span className="font-mono font-bold text-[#2c221e]">{stage.timeSplit}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#2c221e] block">Trọng tâm kỹ năng:</span>
                        <ul className="space-y-0.5 text-[11px] text-[#5c4f43]">
                          {stage.coreFocus.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-[#e07a5f] shrink-0 mt-1.5" />
                              <span className="leading-snug">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-2 bg-[#fdf8f5] rounded-xl border border-[#f2d6c9] text-[10px] text-[#a06030]">
                        💡 <strong>Lời khuyên:</strong> {stage.advice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── NỘI DUNG 3: MEYER METHOD 4X4X4 ── */}
            {proSubTab === 'meyer' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#fdf2f2] rounded-2xl border border-[#f8c9c9]">
                  <h4 className="text-xs font-bold text-[#a61e1e] flex items-center gap-1.5 mb-1">
                    <Box className="w-3.5 h-3.5 text-[#e63946]" />
                    <span>Phương Pháp Meyer (Roux trên Rubik 4×4×4)</span>
                  </h4>
                  <p className="text-[11px] text-[#822a2a] leading-snug">
                    Sáng tạo bởi Richard Meyer (Mỹ) nhằm đưa trọn vẹn tư duy Block-building và xoay tầng M của Roux lên khối lớn 4×4×4.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {MEYER_4X4_GUIDE.map((step) => (
                    <div key={step.stepNumber} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#fde8e8] text-[#c92a2a] text-xs font-bold flex items-center justify-center shrink-0">
                          {step.stepNumber}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">{step.title}</h4>
                      </div>

                      <p className="text-[11px] text-[#5c4f43] pl-8">
                        <strong>Mục tiêu:</strong> {step.objective}
                      </p>

                      <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] text-[11px] text-[#2c221e] ml-8">
                        ⚠️ <strong>Nguyên tắc:</strong> {step.keyRule}
                      </div>

                      <p className="text-[10px] italic text-[#706459] pl-8">
                        💡 {step.tips}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
