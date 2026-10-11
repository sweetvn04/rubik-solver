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
  LSE_L4E_CASES,
  type TwoLookCornerCase,
  type EOCase,
} from '../../data/rouxReferenceData';
import { parseAlgorithm } from '../../engine/moveParser';
import { invertMove } from '../../engine/tutorHelper';
import { CubeDiagram2D } from './CubeDiagram2D';
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
} from 'lucide-react';

interface LessonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CMLL_GROUPS = ['ALL', 'O', 'H', 'Pi', 'T', 'U', 'L', 'S', 'As'] as const;

export const LessonDrawer: React.FC<LessonDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'two_look' | 'lse_guide' | 'cmll'>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(ROUX_LESSONS[0]);
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-step navigator cho tab Giáo trình
  const [stepIndex, setStepIndex] = useState(0);
  const [showNote, setShowNote] = useState(false);

  // Sub-tabs cho 2-Look CMLL
  const [twoLookSubTab, setTwoLookSubTab] = useState<'oll' | 'pll'>('oll');

  // Sub-tabs & filter cho Cẩm nang LSE
  const [lseSubTab, setLseSubTab] = useState<'eo' | 'ulur' | 'l4e'>('eo');
  const [eoFilter, setEoFilter] = useState<'all' | 'base' | '2bad' | '4bad' | '6bad'>('all');

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

  // Lọc danh sách 45 CMLL
  const filteredCMLL = useMemo(() => {
    return CMLL_ALGORITHMS.filter((c) => {
      const matchGroup = selectedGroup === 'ALL' || c.group === selectedGroup;
      const matchQuery =
        searchQuery.trim() === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.alg.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchGroup && matchQuery;
    });
  }, [selectedGroup, searchQuery]);

  // Lọc danh sách EO cases
  const filteredEOCases = useMemo(() => {
    if (eoFilter === 'all') return LSE_EO_CASES;
    if (eoFilter === 'base') return LSE_EO_CASES.filter((c) => c.code.startsWith('3/1'));
    if (eoFilter === '2bad') return LSE_EO_CASES.filter((c) => c.badCount === 2);
    if (eoFilter === '4bad') return LSE_EO_CASES.filter((c) => c.badCount === 4 && !c.code.startsWith('3/1'));
    if (eoFilter === '6bad') return LSE_EO_CASES.filter((c) => c.badCount === 6);
    return LSE_EO_CASES;
  }, [eoFilter]);

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
            className={`flex-1 min-w-[95px] py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'lse_guide'
                ? 'bg-white text-[#2c221e] shadow-xs border border-[#e2d8c7]'
                : 'text-[#7a6f64] hover:text-[#2c221e]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#2a9d8f]" />
            <span>Cẩm nang LSE</span>
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
                          title={`Sub-step ${i + 1}`}
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

                    {/* Mini 3x3 Grid Preview mặt U */}
                    <div className="w-10 h-10 p-0.5 bg-[#1a1715] rounded-md grid grid-cols-3 gap-0.5 shrink-0 shadow-2xs">
                      {caseItem.topFaceMatrix.flatMap((row, rIdx) =>
                        row.map((cell, cIdx) => (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            className={`w-full h-full rounded-[1px] ${
                              cell === 'Y' ? 'bg-[#e5a922]' : 'bg-[#7a7267]'
                            }`}
                          />
                        ))
                      )}
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
            {/* Sub-tabs LSE */}
            <div className="flex bg-[#faf6ee] p-1 rounded-xl border border-[#e4d9c7] gap-1">
              <button
                type="button"
                onClick={() => setLseSubTab('eo')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lseSubTab === 'eo'
                    ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                4a: Định hướng EO
              </button>
              <button
                type="button"
                onClick={() => setLseSubTab('ulur')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lseSubTab === 'ulur'
                    ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                4b: UL & UR
              </button>
              <button
                type="button"
                onClick={() => setLseSubTab('l4e')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lseSubTab === 'l4e'
                    ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]'
                    : 'text-[#7a6f64] hover:text-[#2c221e]'
                }`}
              >
                4c: Cột M (L4E)
              </button>
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
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
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
                        </div>

                        {/* Badge trigger ngắn */}
                        <span className="px-2 py-1 font-mono font-bold text-xs bg-[#faf6ee] text-[#e07a5f] rounded-lg border border-[#ebdcca] shrink-0">
                          {caseItem.triggerAlg}
                        </span>
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

            {/* ── NỘI DUNG 4b: UL & UR ── */}
            {lseSubTab === 'ulur' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#fdfaf4] rounded-2xl border border-[#ebdcca]">
                  <h4 className="text-xs font-bold text-[#2c221e] flex items-center gap-1.5 mb-1">
                    <Compass className="w-3.5 h-3.5 text-[#e07a5f]" />
                    <span>{LSE_UL_UR_GUIDE.title}</span>
                  </h4>
                  <p className="text-[11px] text-[#706459] leading-snug">
                    {LSE_UL_UR_GUIDE.objective}
                  </p>
                </div>

                <div className="space-y-2">
                  {LSE_UL_UR_GUIDE.steps.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-[#eef5f3] text-[#247c72] text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-[#2c221e]">{st.title}</h5>
                      </div>
                      <p className="text-[11px] text-[#5c4f43] pl-7 leading-relaxed">
                        {st.content}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-[#faf6ee] rounded-2xl border border-[#ebdcca] text-xs text-[#706459]">
                  💡 <strong>Quy tắc bất biến:</strong> Suốt bước 4b chỉ được phép xoay <code>U</code>, <code>U'</code>, <code>U2</code> và <code>M</code>, <code>M2</code>. Tuyệt đối không xoay R, L, F, B để bảo vệ toàn bộ First Block, Second Block và CMLL.
                </div>
              </div>
            )}

            {/* ── NỘI DUNG 4c: L4E (CỘT M) ── */}
            {lseSubTab === 'l4e' && (
              <div className="space-y-2.5">
                <div className="p-3 bg-[#fcf8f2] rounded-2xl border border-[#ebdcca] text-xs text-[#706459]">
                  Sau khi giải xong UL và UR, khối Rubik chỉ còn đúng 4 cạnh trên cột giữa M (DF, DB, UF, UB). Dưới đây là các thế cờ L4E kinh điển:
                </div>

                {LSE_L4E_CASES.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-2"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">
                        {caseItem.name}
                      </h4>
                      <p className="text-[11px] text-[#5c4f43] mt-1 leading-snug">
                        {caseItem.recognition}
                      </p>
                    </div>

                    {/* Công thức */}
                    <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030] select-all break-all">
                      {caseItem.alg}
                    </div>

                    <div className="text-[10px] italic text-[#706459]">
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

        {/* ─────────────────────────────────────────────────────────────
            6. TAB 4: TRA CỨU & LUYỆN TẬP 45 CMLL NÂNG CAO
           ───────────────────────────────────────────────────────────── */}
        {activeTab === 'cmll' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
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
                      {grp === 'ALL' ? 'Tất cả (45)' : `Nhóm ${grp}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Danh sách 45 thế cờ CMLL */}
            <div className="flex flex-col gap-2.5">
              {filteredCMLL.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#8c7b6c]">
                  Không tìm thấy thế cờ CMLL nào khớp với từ khóa tìm kiếm.
                </div>
              ) : (
                filteredCMLL.map((caseItem: CMLLCase) => (
                  <div
                    key={caseItem.name}
                    className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs hover:border-[#d4c5af] transition-all flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#eef5f3] text-[#247c72] border border-[#cbe3dd]">
                            Nhóm {caseItem.group}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">
                            {caseItem.name}
                          </h4>
                        </div>
                        {caseItem.description && (
                          <p className="text-[11px] text-[#706459] mt-0.5">
                            {caseItem.description}
                          </p>
                        )}
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
      </aside>
    </div>
  );
};
