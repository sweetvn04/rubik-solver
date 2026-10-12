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
  ChevronDown,
  MonitorPlay,
  Info,
  GraduationCap,
  Compass,
  Flame,
  Trophy,
  Zap,
  Hand,
  Box,
  Map,
  Library,
} from 'lucide-react';

interface LessonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CMLL_GROUPS = ['ALL', 'O', 'H', 'Pi', 'T', 'U', 'L', 'S', 'As'] as const;

// Màu sắc cho từng bước Roux
const STEP_COLORS = {
  1: { bg: 'bg-[#e8f4e8]', text: 'text-[#2d6a4f]', border: 'border-[#a8d5b8]', accent: 'bg-[#2d6a4f]', light: 'bg-[#d8f0e3]' },
  2: { bg: 'bg-[#e8f0f8]', text: 'text-[#1d4e89]', border: 'border-[#a8c8e8]', accent: 'bg-[#1d4e89]', light: 'bg-[#d5e6f5]' },
  3: { bg: 'bg-[#f8e8f0]', text: 'text-[#7b2d6e]', border: 'border-[#e0a8cc]', accent: 'bg-[#7b2d6e]', light: 'bg-[#f5d5e9]' },
  4: { bg: 'bg-[#fff3e0]', text: 'text-[#b45309]', border: 'border-[#f6c87a]', accent: 'bg-[#b45309]', light: 'bg-[#fde9c0]' },
};

export const LessonDrawer: React.FC<LessonDrawerProps> = ({ isOpen, onClose }) => {
  // ── Tabs chính: 3 tabs thay vì 5 ──
  const [mainTab, setMainTab] = useState<'journey' | 'reference' | 'pro_tips'>('journey');

  // ── Journey tab: accordion state ──
  const [openStep, setOpenStep] = useState<number>(1); // Bước đang mở
  const [stepIndices, setStepIndices] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [showNote, setShowNote] = useState(false);

  // ── Bước 4 LSE: sub-tab riêng ──
  const [lse4SubTab, setLse4SubTab] = useState<'4a_eo' | '4b_ulur' | '4c_l4e'>('4a_eo');

  // ── Reference tab ──
  const [refTab, setRefTab] = useState<'two_look' | 'cmll45' | 'eo_ref' | 'ulur_ref' | 'l4e_ref' | 'fast_eo' | 'dots_skip' | 'eolr'>('two_look');
  const [twoLookSubTab, setTwoLookSubTab] = useState<'oll' | 'pll'>('oll');
  const [cmllMode, setCmllMode] = useState<'2h' | 'oh'>('2h');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [eoFilter, setEoFilter] = useState<'all' | 'base' | '2bad' | '4bad' | '6bad'>('all');
  const [l4eFilter, setL4eFilter] = useState<'all' | 'intuitive' | '1_white_edge' | '1_white_edge_center' | 'special'>('all');

  // ── Pro Tips tab ──
  const [proSubTab, setProSubTab] = useState<'techniques' | 'sub_x' | 'meyer'>('techniques');

  // ── Toast ──
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const enqueueAlgorithm = useRubikStore((s) => s.enqueueAlgorithm);
  const reset = useRubikStore((s) => s.reset);
  const isAnimating = useRubikStore((s) => s.isAnimating);
  const moveQueue = useRubikStore((s) => s.moveQueue);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Thay đổi sub-step trong từng bước
  const setStepIndex = (step: number, idx: number) => {
    setStepIndices(prev => ({ ...prev, [step]: idx }));
    setShowNote(false);
  };

  // Toggle accordion
  const toggleStep = (step: number) => {
    setOpenStep(prev => prev === step ? 0 : step);
    setShowNote(false);
  };

  // Memoized
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

  const filteredEOCases = useMemo(() => {
    if (eoFilter === 'all') return LSE_EO_CASES;
    if (eoFilter === 'base') return LSE_EO_CASES.filter((c) => c.code.startsWith('3/1'));
    if (eoFilter === '2bad') return LSE_EO_CASES.filter((c) => c.badCount === 2);
    if (eoFilter === '4bad') return LSE_EO_CASES.filter((c) => c.badCount === 4 && !c.code.startsWith('3/1'));
    if (eoFilter === '6bad') return LSE_EO_CASES.filter((c) => c.badCount === 6);
    return LSE_EO_CASES;
  }, [eoFilter]);

  const filteredL4ECases = useMemo(() => {
    if (l4eFilter === 'all' || l4eFilter === 'intuitive') return LSE_L4E_CASES;
    return LSE_L4E_CASES.filter((c) => c.group === l4eFilter);
  }, [l4eFilter]);

  // ── Actions ──
  const handleRunAlg = (alg: string, name: string) => {
    if (isAnimating || moveQueue.length > 0) return;
    enqueueAlgorithm(alg);
    showToast(`Đang xoay: ${name}`);
  };

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
      showToast(`Đã thiết lập thế cờ: ${name}`);
    }, 150);
  };

  const handleRunStepDemo = (lesson: Lesson, stepIdx: number) => {
    if (isAnimating || moveQueue.length > 0) return;
    const step = lesson.steps[stepIdx];
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
            showToast(`Minh hoạ: ${step.title}`);
          }, 300);
        }
      }, 150);
    } else if (step.demoAlg) {
      enqueueAlgorithm(step.demoAlg);
      showToast(`Minh hoạ: ${step.title}`);
    }
  };

  if (!isOpen) return null;

  // ── Helper render: Sub-step pill list ──
  const renderSubStepPills = (lesson: Lesson, stepNum: number) => {
    const idx = stepIndices[stepNum] || 0;
    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10.5px]">
        {lesson.steps.map((st, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setStepIndex(stepNum, i)}
            className={`px-2 py-1 rounded-lg shrink-0 font-bold transition-all cursor-pointer ${
              i === idx
                ? `${STEP_COLORS[stepNum as keyof typeof STEP_COLORS].accent} text-white shadow-xs`
                : 'bg-white text-[#5c4f43] border border-[#e2d8c7] hover:bg-[#f5efe4]'
            }`}
          >
            {st.title.split(':')[0].split('—')[0].trim()}
          </button>
        ))}
      </div>
    );
  };

  // ── Helper render: Step content ──
  const renderStepContent = (lesson: Lesson, stepNum: number) => {
    const idx = stepIndices[stepNum] || 0;
    const currentStep = lesson.steps[idx];
    if (!currentStep) return null;
    const colors = STEP_COLORS[stepNum as keyof typeof STEP_COLORS];

    return (
      <div className="flex flex-col gap-3 pt-2">
        {/* Sub-step title */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${colors.bg} ${colors.text} border ${colors.border}`}>
            Phần {idx + 1}/{lesson.steps.length}
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-[#2c221e]">{currentStep.title}</h4>
        </div>

        <p className="text-xs text-[#5c4f43] leading-relaxed">{currentStep.description}</p>

        {/* Diagram 2D */}
        {currentStep.diagram && (
          <div className="p-3 bg-[#faf6ee] rounded-xl border border-[#ebdcca] flex flex-col items-center gap-2">
            <CubeDiagram2D {...currentStep.diagram} />
            <span className="text-[10px] text-[#8c7b6c] italic text-center">Sơ đồ trạng thái khối Rubik</span>
          </div>
        )}

        {/* Demo nút */}
        {(currentStep.demoAlg || currentStep.setupAlg) && (
          <div className="flex items-center gap-2">
            {currentStep.demoAlg && (
              <div className="flex-1 px-2.5 py-1.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono text-xs text-[#a06030] font-bold truncate">
                {currentStep.demoAlg}
              </div>
            )}
            <button
              type="button"
              onClick={() => handleRunStepDemo(lesson, idx)}
              disabled={isAnimating || moveQueue.length > 0}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>Demo 3D</span>
            </button>
          </div>
        )}

        {/* Note */}
        {currentStep.note && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowNote(!showNote)}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#a06030] hover:text-[#e07a5f] cursor-pointer"
            >
              <Info className="w-3 h-3" />
              <span>{showNote ? 'Ẩn mẹo' : 'Xem mẹo thực chiến'}</span>
            </button>
            {showNote && (
              <p className="mt-1 text-[11px] text-[#706459] bg-[#faf6ee] p-2 rounded-lg border border-[#ebdcca] italic">
                💡 {currentStep.note}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Helper render: Accordion item ──
  const renderAccordionStep = (lesson: Lesson, stepNum: number) => {
    const isOpen = openStep === stepNum;
    const colors = STEP_COLORS[stepNum as keyof typeof STEP_COLORS];
    const phaseIcons = ['', '🟩', '🟦', '🟣', '🟡'];

    return (
      <div
        key={stepNum}
        className={`rounded-2xl border overflow-hidden transition-all ${isOpen ? `border-[${colors.border}] shadow-sm` : 'border-[#e8dfcf]'}`}
      >
        {/* Accordion header */}
        <button
          type="button"
          onClick={() => toggleStep(stepNum)}
          className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all cursor-pointer ${
            isOpen ? `${colors.bg}` : 'bg-white hover:bg-[#faf6ee]'
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Step badge */}
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs text-white ${colors.accent}`}>
              {stepNum}
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-bold ${isOpen ? colors.text : 'text-[#2c221e]'} truncate`}>
                {phaseIcons[stepNum]} {lesson.title}
              </div>
              <div className="text-[10px] text-[#706459] truncate">{lesson.subtitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
              {lesson.avgMoves}
            </span>
            <ChevronDown className={`w-4 h-4 ${colors.text} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Accordion body */}
        {isOpen && (
          <div className="p-3 sm:p-4 bg-white border-t border-[#f0e8db] flex flex-col gap-3">
            {/* Description tổng quan */}
            <p className="text-[11px] text-[#5c4f43] leading-relaxed bg-[#faf6ee] p-2.5 rounded-xl border border-[#ebdcca]">
              {lesson.description}
            </p>

            {/* Bước 4 LSE có sub-nav đặc biệt */}
            {stepNum === 4 ? (
              <>
                {/* Sub-tabs cho bước 4 */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: '4a_eo' as const, label: '4a. EO', sub: '10 thế', color: 'bg-[#247c72] text-white', inactive: 'bg-white text-[#247c72] border border-[#cde5e0] hover:bg-[#eef5f3]' },
                    { id: '4b_ulur' as const, label: '4b. UL/UR', sub: '2 cánh', color: 'bg-[#e07a5f] text-white', inactive: 'bg-white text-[#e07a5f] border border-[#f4dec7] hover:bg-[#fdf8f5]' },
                    { id: '4c_l4e' as const, label: '4c. L4E', sub: 'Cột M', color: 'bg-[#3d5a80] text-white', inactive: 'bg-white text-[#3d5a80] border border-[#cbd5e1] hover:bg-[#f0f4f8]' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setLse4SubTab(tab.id)}
                      className={`py-2.5 px-1 rounded-xl font-bold text-[11px] text-center flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                        lse4SubTab === tab.id ? tab.color : tab.inactive
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[9px] font-normal ${lse4SubTab === tab.id ? 'opacity-80' : 'opacity-60'}`}>{tab.sub}</span>
                    </button>
                  ))}
                </div>

                {/* Nội dung 4a: EO */}
                {lse4SubTab === '4a_eo' && (
                  <div className="space-y-3">
                    {/* Giới thiệu nhanh */}
                    <div className="p-3 bg-[#eaf4f2] rounded-xl border border-[#cde5e0] text-[11px] text-[#1b4965]">
                      <div className="font-bold mb-1">🎯 Bước 4a: Edge Orientation (EO) — Lật cạnh về đúng hướng</div>
                      <p className="leading-relaxed">Kiểm tra 6 cạnh cuối: cạnh nào có màu Vàng/Trắng ở mặt bên F/B/L/R là <strong>Bad Edge</strong>. Mục tiêu: đưa tất cả về 0 Bad Edges.</p>
                    </div>

                    {/* Quy tắc 1/1 warning */}
                    <div className="p-3 bg-[#fff9f2] rounded-xl border border-[#f3d9b8] space-y-2">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-[#d97706] mt-0.5 shrink-0" />
                        <h4 className="text-xs font-bold text-[#92400e]">Mẹo sống còn — Quy tắc Chéo thế 1/1</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                        <div className="p-2 bg-white/90 rounded-xl border border-[#fae4cd]">
                          <div className="font-bold text-[#b45309] mb-1">Thế 1/1 (F) — Cạnh sai ở DF</div>
                          <p className="text-[#5c4f43] leading-relaxed">Sticker <strong>FD</strong> có màu Vàng/Trắng → Cạnh U sai phải ở <strong>UB (sau lưng)</strong>. Nếu đang ở UF → xoay <code className="font-mono bg-amber-50 px-1 rounded">U2</code> trước!</p>
                        </div>
                        <div className="p-2 bg-white/90 rounded-xl border border-[#fae4cd]">
                          <div className="font-bold text-[#2a9d8f] mb-1">Thế 1/1 (B) — Cạnh sai ở DB</div>
                          <p className="text-[#5c4f43] leading-relaxed">Sticker <strong>FD</strong> KHÔNG có Vàng/Trắng → Cạnh U sai phải ở <strong>UF (trước mặt)</strong>. Nếu đang ở UB → xoay <code className="font-mono bg-teal-50 px-1 rounded">U2</code> trước!</p>
                        </div>
                      </div>
                    </div>

                    {/* Bộ lọc EO */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                      {[
                        { id: 'all', label: 'Tất cả (11)' },
                        { id: 'base', label: 'Cơ bản 3/1' },
                        { id: '2bad', label: '2 Cạnh sai' },
                        { id: '4bad', label: '4 Cạnh sai' },
                        { id: '6bad', label: '6 Cạnh sai' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setEoFilter(f.id as any)}
                          className={`px-2 py-1 font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                            eoFilter === f.id
                              ? 'bg-[#247c72] text-white shadow-xs'
                              : 'bg-white text-[#5c4f43] border border-[#e2d8c7] hover:bg-[#faf6ee]'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* EO Cases list */}
                    <div className="space-y-2">
                      {filteredEOCases.map((caseItem: EOCase) => (
                        <div key={caseItem.id} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 text-xs font-mono font-black rounded-md bg-[#eaf4f2] text-[#247c72] border border-[#cde5e0]">{caseItem.code}</span>
                                <h4 className="text-xs font-bold text-[#2c221e]">{caseItem.name}</h4>
                              </div>
                              <div className="text-[10px] text-[#706459] mt-0.5">Số cạnh sai: {caseItem.badCount} ({caseItem.badU} U, {caseItem.badD} D)</div>
                              <div className="mt-1 flex items-center gap-1">
                                <span className="text-[10px] font-bold text-[#8c7b6c]">Trigger:</span>
                                <span className="px-2 py-0.5 font-mono font-bold text-[11px] bg-[#faf6ee] text-[#e07a5f] rounded-lg border border-[#ebdcca]">{caseItem.triggerAlg}</span>
                              </div>
                            </div>
                            <EODiagram diagramU={caseItem.diagramU} diagramD={caseItem.diagramD} />
                          </div>
                          <p className="text-[11px] text-[#5c4f43] bg-[#faf6ee] p-2 rounded-xl border border-[#ebdcca] leading-snug">{caseItem.recognitionTip}</p>
                          <div className="flex items-center justify-between text-[11px] px-2 py-1.5 bg-[#fcf9f2] rounded-xl border border-[#ebdcca]">
                            <span className="font-semibold text-[#8c7b6c]">Chuỗi giải đầy đủ:</span>
                            <span className="font-mono font-bold text-xs text-[#a06030]">{caseItem.fullSolution}</span>
                          </div>
                          <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                            <button type="button" onClick={() => handleSetupCase(caseItem.setupAlg, caseItem.code, true)} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all cursor-pointer">
                              <RotateCcw className="w-3 h-3 text-[#3d5a80]" /><span>Tập thế {caseItem.code}</span>
                            </button>
                            <button type="button" onClick={() => handleRunAlg(caseItem.fullSolution, caseItem.code)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs transition-all cursor-pointer">
                              <Play className="w-3 h-3 fill-current" /><span>Giải EO</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nội dung 4b: UL/UR */}
                {lse4SubTab === '4b_ulur' && (
                  <div className="space-y-3">
                    {/* Mục tiêu */}
                    <div className="p-3 bg-[#fdfaf5] rounded-2xl border border-[#ebdcca] space-y-2">
                      <div className="flex items-start gap-2">
                        <Compass className="w-4 h-4 text-[#e07a5f] mt-0.5 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-[#2c221e]">{LSE_UL_UR_GUIDE.title}</h4>
                          <p className="text-[11px] text-[#706459] mt-0.5 leading-snug">{LSE_UL_UR_GUIDE.objective}</p>
                        </div>
                      </div>
                      <div className="p-2.5 bg-[#faf6ee] rounded-xl border border-[#ede3d5] text-[11px] space-y-1">
                        <div className="font-bold text-[#a06030]">💡 3 Quy tắc bất biến:</div>
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

                    {/* 3 tình huống ban đầu */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#2c221e]">🔍 3 Tình huống ban đầu:</div>
                      {LSE_UL_UR_GUIDE.initialCases.map((cs) => (
                        <div key={cs.caseType} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-[#2c221e]">{cs.title}</h5>
                            <p className="text-[11px] text-[#5c4f43] mt-1 leading-snug">{cs.description}</p>
                            <div className="mt-1 text-[10px] font-bold text-[#247c72]">👉 {cs.nextAction}</div>
                          </div>
                          <ULURDiagram caseType={cs.caseType} />
                        </div>
                      ))}
                    </div>

                    {/* 3 giai đoạn tự nghiệm */}
                    <div className="p-3 bg-[#f0f7f9] rounded-2xl border border-[#cbe3dd] space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#247c72]" />
                        <h5 className="text-xs font-bold text-[#1b4965]">Lộ trình 3 giai đoạn tự nghiệm:</h5>
                      </div>
                      {LSE_UL_UR_GUIDE.phases.map((ph) => (
                        <div key={ph.step} className="p-2.5 bg-white rounded-xl border border-[#d2e7ee] text-[11px] space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[#1b4965]">
                            <span className="w-4 h-4 rounded-full bg-[#e3f2fd] text-[#1976d2] text-[10px] flex items-center justify-center font-mono">{ph.step}</span>
                            <span>{ph.title}</span>
                          </div>
                          <p className="text-[#334155] pl-5.5 leading-relaxed">{ph.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Thế cờ mẫu có demo */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#2c221e]">⚡ Thế cờ thực chiến tiêu biểu:</div>
                      {LSE_UL_UR_GUIDE.samples.map((sample) => (
                        <div key={sample.id} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-[#2c221e]">{sample.name}</h5>
                              <p className="text-[11px] text-[#5c4f43] mt-1 leading-snug">{sample.condition}</p>
                            </div>
                            <ULURDiagram caseType={sample.caseType} />
                          </div>
                          <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030]">{sample.alg}</div>
                          <p className="text-[10px] text-[#706459] italic">💡 {sample.tip}</p>
                          <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                            <button type="button" onClick={() => handleSetupCase(sample.setupAlg, sample.name, true)} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] transition-all cursor-pointer">
                              <RotateCcw className="w-3 h-3 text-[#3d5a80]" /><span>Tập thế này</span>
                            </button>
                            <button type="button" onClick={() => handleRunAlg(sample.alg, sample.name)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs transition-all cursor-pointer">
                              <Play className="w-3 h-3 fill-current" /><span>Chạy giải</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Nút chuyển sang 4c */}
                    <button type="button" onClick={() => setLse4SubTab('4c_l4e')} className="w-full flex items-center justify-between p-3 bg-[#f0f4f8] hover:bg-[#e2eaf2] text-[#3d5a80] rounded-2xl border border-[#cbd5e1] transition-all cursor-pointer font-bold text-xs">
                      <span>✅ Xong 2 cánh? Tiếp tục Bước 4c (L4E Cột M) →</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Nội dung 4c: L4E */}
                {lse4SubTab === '4c_l4e' && (
                  <div className="space-y-3">
                    {/* Tự nghiệm 3 bước */}
                    <div className="p-3.5 bg-[#fdfaf5] rounded-2xl border border-[#ebdcca] shadow-2xs space-y-3">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-[#e07a5f] mt-0.5 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-[#2c221e]">{LSE_L4E_INTUITIVE_GUIDE.title}</h4>
                          <p className="text-[11px] text-[#706459] mt-0.5 leading-snug">{LSE_L4E_INTUITIVE_GUIDE.subtitle}</p>
                        </div>
                      </div>

                      {/* Concept */}
                      <div className="p-2.5 bg-[#faf6ee] rounded-xl border border-[#ede3d5] text-[11px] space-y-1">
                        <div className="font-bold text-[#a06030]">💡 Bản chất L4E:</div>
                        <ul className="space-y-1 text-[#5c4f43]">
                          {LSE_L4E_INTUITIVE_GUIDE.concept.map((cp, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#e07a5f] shrink-0 mt-1.5" />
                              <span className="leading-relaxed">{cp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Stages */}
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-[#2c221e]">📐 3 Giai đoạn tự nghiệm (Kèm sơ đồ):</div>
                        {LSE_L4E_INTUITIVE_GUIDE.stages.map((st) => (
                          <div key={st.id} className="p-3 bg-white rounded-xl border border-[#ede3d5] flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 font-bold text-[#2c221e]">
                                  <span className="w-4 h-4 rounded-full bg-[#f4ece1] text-[#a06030] text-[10px] flex items-center justify-center font-mono shrink-0">{st.stepNumber}</span>
                                  <h5 className="text-xs font-bold">{st.title}</h5>
                                </div>
                                <p className="text-[11px] text-[#247c72] font-semibold mt-1 pl-5">🎯 {st.goal}</p>
                              </div>
                              <L4EIntuitiveDiagram stage={st.stage} />
                            </div>
                            <div className="space-y-1 pt-1 border-t border-[#f7f2ea]">
                              {st.cases.map((cs, cIdx) => (
                                <div key={cIdx} className="p-2 bg-[#fdfaf5] rounded-lg border border-[#f0e8db] text-[11px] space-y-0.5">
                                  <div className="font-bold text-[#2c221e] flex items-center justify-between">
                                    <span>{cs.name}</span>
                                    <span className="font-mono text-[#e07a5f] bg-white px-1.5 py-0.5 rounded border border-[#ebdcca] text-[10px]">{cs.action}</span>
                                  </div>
                                  <p className="text-[#5c4f43] text-[10px] leading-relaxed">{cs.detail}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bài tập demo */}
                      <div className="space-y-2 pt-1 border-t border-[#ede3d5]">
                        <div className="text-xs font-bold text-[#2c221e]">🧪 Bài tập Demo 3D:</div>
                        {LSE_L4E_INTUITIVE_GUIDE.exercises.map((ex) => (
                          <div key={ex.id} className="p-2.5 bg-white rounded-xl border border-[#e8dfcf] flex flex-col gap-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-bold text-[#2c221e]">{ex.name}</h5>
                                <p className="text-[11px] text-[#5c4f43] mt-0.5 leading-snug">{ex.scenario}</p>
                              </div>
                              <span className="font-mono font-bold text-xs text-[#a06030] bg-[#faf6ee] px-2 py-1 rounded-lg border border-[#ebdcca] shrink-0">{ex.solution}</span>
                            </div>
                            <p className="text-[10px] text-[#706459] italic">💡 {ex.tip}</p>
                            <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                              <button type="button" onClick={() => handleSetupCase(ex.setupAlg, ex.name, true)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-lg border border-[#e2d8c7] cursor-pointer">
                                <RotateCcw className="w-3 h-3 text-[#3d5a80]" /><span>Tập</span>
                              </button>
                              <button type="button" onClick={() => handleRunAlg(ex.solution, ex.name)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-lg shadow-xs cursor-pointer">
                                <Play className="w-3 h-3 fill-current" /><span>Chạy</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 23 Thế L4E */}
                    <div className="p-2.5 bg-[#f0f4f8] rounded-xl border border-[#cbd5e1] text-[11px] text-[#334155] flex items-center gap-2">
                      <Info className="w-4 h-4 text-[#3d5a80] shrink-0" />
                      <span>Bảng tra cứu 23 thế L4E tối ưu → mở tab <strong>Tra cứu → L4E</strong> để xem đầy đủ</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Bước 1-3: Sub-step navigator chuẩn */
              <>
                {renderSubStepPills(lesson, stepNum)}
                {renderStepContent(lesson, stepNum)}
              </>
            )}

            {/* Key techniques */}
            <div className="p-3 bg-[#faf6ee] rounded-xl border border-[#ebdcca]">
              <h4 className="text-xs font-bold text-[#2c221e] flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-[#e07a5f]" />
                Kỹ thuật cốt lõi bước này:
              </h4>
              <ul className="space-y-1.5 text-xs text-[#5c4f43]">
                {lesson.keyTechniques.map((tech, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.accent} shrink-0 mt-1.5`} />
                    <span className="leading-relaxed">{tech}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── Reference tab content helpers ──
  const renderEORefContent = () => (
    <div className="space-y-3">
      <div className="p-3 bg-[#f5f8fa] rounded-2xl border border-[#cbe0ec]">
        <h4 className="text-xs font-bold text-[#1f4e78] flex items-center gap-1.5 mb-1.5">
          <Compass className="w-3.5 h-3.5 text-[#2b72a6]" />
          {LSE_BAD_EDGE_RULES.title}
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
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
        {[
          { id: 'all', label: 'Tất cả (11)' },
          { id: 'base', label: 'Cơ bản 3/1' },
          { id: '2bad', label: '2 Cạnh sai' },
          { id: '4bad', label: '4 Cạnh sai' },
          { id: '6bad', label: '6 Cạnh sai' },
        ].map((f) => (
          <button key={f.id} type="button" onClick={() => setEoFilter(f.id as any)} className={`px-2 py-1 font-bold rounded-lg shrink-0 cursor-pointer transition-all ${eoFilter === f.id ? 'bg-[#2a9d8f] text-white' : 'bg-[#faf6ee] text-[#5c4f43] border border-[#e2d8c7] hover:bg-[#f0e7d8]'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filteredEOCases.map((caseItem: EOCase) => (
          <div key={caseItem.id} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 text-xs font-mono font-black rounded-md bg-[#eaf4f2] text-[#247c72] border border-[#cde5e0]">{caseItem.code}</span>
                  <h4 className="text-xs font-bold text-[#2c221e]">{caseItem.name}</h4>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-[10px] font-bold text-[#8c7b6c]">Trigger:</span>
                  <span className="px-2 py-0.5 font-mono font-bold text-[11px] bg-[#faf6ee] text-[#e07a5f] rounded-lg border border-[#ebdcca]">{caseItem.triggerAlg}</span>
                </div>
              </div>
              <EODiagram diagramU={caseItem.diagramU} diagramD={caseItem.diagramD} />
            </div>
            <p className="text-[11px] text-[#5c4f43] bg-[#faf6ee] p-2 rounded-xl border border-[#ebdcca] leading-snug">{caseItem.recognitionTip}</p>
            <div className="flex items-center justify-between text-[11px] px-2 py-1.5 bg-[#fcf9f2] rounded-xl border border-[#ebdcca]">
              <span className="font-semibold text-[#8c7b6c]">Chuỗi giải đầy đủ:</span>
              <span className="font-mono font-bold text-xs text-[#a06030]">{caseItem.fullSolution}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
              <button type="button" onClick={() => handleSetupCase(caseItem.setupAlg, caseItem.code, true)} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] cursor-pointer">
                <RotateCcw className="w-3 h-3 text-[#3d5a80]" /><span>Tập thế {caseItem.code}</span>
              </button>
              <button type="button" onClick={() => handleRunAlg(caseItem.fullSolution, caseItem.code)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs cursor-pointer">
                <Play className="w-3 h-3 fill-current" /><span>Giải EO</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderL4ERefContent = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
        {[
          { id: 'all', label: 'Tất cả (23)' },
          { id: '1_white_edge', label: 'Nhóm 1 (8)' },
          { id: '1_white_edge_center', label: 'Nhóm 2 (8)' },
          { id: 'special', label: 'Đặc biệt (7)' },
        ].map((f) => (
          <button key={f.id} type="button" onClick={() => setL4eFilter(f.id as any)} className={`px-2.5 py-1 font-bold rounded-lg shrink-0 cursor-pointer transition-all ${l4eFilter === f.id ? 'bg-[#3d5a80] text-white' : 'bg-white text-[#5c4f43] border border-[#e2d8c7] hover:bg-[#faf6ee]'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filteredL4ECases.map((caseItem) => (
          <div key={caseItem.id} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${caseItem.group === '1_white_edge' ? 'bg-[#eef5f3] text-[#247c72] border-[#cbe3dd]' : caseItem.group === '1_white_edge_center' ? 'bg-[#fcf3ea] text-[#c57b32] border-[#f4dec7]' : 'bg-[#f5eefc] text-[#8338ec] border-[#e4d2fa]'}`}>{caseItem.groupName}</span>
                  <h4 className="text-xs font-bold text-[#2c221e]">{caseItem.name}</h4>
                </div>
                <p className="text-[11px] text-[#5c4f43] mt-1 leading-snug">{caseItem.recognition}</p>
              </div>
              <L4EDiagram caseId={caseItem.id} />
            </div>
            <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030]">{caseItem.alg}</div>
            <p className="text-[10px] text-[#706459] italic">💡 {caseItem.tip}</p>
            <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
              <button type="button" onClick={() => handleSetupCase(caseItem.setupAlg, caseItem.name, true)} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] cursor-pointer">
                <RotateCcw className="w-3 h-3 text-[#3d5a80]" /><span>Tập thế này</span>
              </button>
              <button type="button" onClick={() => handleRunAlg(caseItem.alg, caseItem.name)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs cursor-pointer">
                <Play className="w-3 h-3 fill-current" /><span>Chạy giải</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────
  //  MAIN RENDER
  // ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-40 flex justify-end pointer-events-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/25 backdrop-blur-2xs transition-opacity pointer-events-auto" onClick={onClose} />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 sm:right-[430px] z-50 px-3.5 py-2 bg-[#2c221e] text-white text-xs font-semibold rounded-xl shadow-lg border border-[#e8dfcf]/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-3.5 h-3.5 text-[#2a9d8f]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Drawer */}
      <aside className="relative z-50 w-full sm:w-[440px] md:w-[480px] h-full bg-[#faf6ee] shadow-2xl flex flex-col pointer-events-auto border-l border-[#ebdcca] overflow-hidden">
        
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebdcca] bg-[#f5efe4]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#e07a5f]/15 flex items-center justify-center text-[#e07a5f]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2c221e]">Hướng dẫn Roux từng bước</h2>
              <p className="text-[10px] text-[#706459]">Chuẩn giáo trình rouxmethodvn</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-[#8c7b6c] hover:text-[#2c221e] hover:bg-[#efe8dc] rounded-xl transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 3 Main Tabs ── */}
        <div className="flex border-b border-[#ebdcca] bg-[#f5efe4]/90 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => setMainTab('journey')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mainTab === 'journey' ? 'bg-white text-[#e07a5f] shadow-xs border border-[#f2d6c9]' : 'text-[#7a6f64] hover:text-[#2c221e] hover:bg-white/60'}`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Hành trình</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab('reference')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mainTab === 'reference' ? 'bg-white text-[#3d5a80] shadow-xs border border-[#cbd5e1]' : 'text-[#7a6f64] hover:text-[#2c221e] hover:bg-white/60'}`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>Tra cứu</span>
          </button>
          <button
            type="button"
            onClick={() => setMainTab('pro_tips')}
            className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mainTab === 'pro_tips' ? 'bg-white text-[#e63946] shadow-xs border border-[#f8c9c9]' : 'text-[#7a6f64] hover:text-[#2c221e] hover:bg-white/60'}`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Pro Tips</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════
             TAB 1: HÀNH TRÌNH — Accordion 4 bước Roux
            ═══════════════════════════════════════════════════════════ */}
        {mainTab === 'journey' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-2.5">
            {/* Banner intro */}
            <div className="p-3 bg-gradient-to-r from-[#fdf5ec] to-[#f5f0ff] rounded-2xl border border-[#e4d8f8] text-[11px] text-[#4a3060]">
              <div className="font-bold text-xs mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#7b2d6e]" />
                Phương pháp Roux — 4 bước hoàn thiện
              </div>
              <p className="leading-relaxed opacity-80">Click vào từng bước để mở hướng dẫn chi tiết. Bạn có thể vừa xem diagram, vừa bấm Demo 3D để luyện tập ngay trên khối Rubik bên cạnh.</p>
            </div>

            {/* Accordion 4 bước */}
            {ROUX_LESSONS.map((lesson) =>
              renderAccordionStep(lesson, lesson.stepNumber)
            )}

            {/* Footer */}
            <div className="p-3 bg-white rounded-2xl border border-[#e8dfcf] text-center">
              <p className="text-[11px] text-[#706459]">
                🎉 Hoàn thành cả 4 bước = giải được Rubik theo Roux!<br />
                <span className="text-[10px] opacity-70">Xem tab <strong>Tra cứu</strong> để tra công thức CMLL, EO, L4E đầy đủ</span>
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
             TAB 2: TRA CỨU — Reference library
            ═══════════════════════════════════════════════════════════ */}
        {mainTab === 'reference' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Sub-tab scrollable bar */}
            <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-[#ebdcca] bg-[#f5efe4]/60 text-[11px] shrink-0">
              {[
                { id: 'two_look', label: '2-Look CMLL', color: 'bg-[#e76f51] text-white' },
                { id: 'cmll45', label: '45 CMLL', color: 'bg-[#3d5a80] text-white' },
                { id: 'eo_ref', label: 'EO (11 thế)', color: 'bg-[#247c72] text-white' },
                { id: 'ulur_ref', label: 'UL/UR', color: 'bg-[#e07a5f] text-white' },
                { id: 'l4e_ref', label: 'L4E (23)', color: 'bg-[#8338ec] text-white' },
                { id: 'fast_eo', label: 'Nhìn FD <1s', color: 'bg-[#2b72a6] text-white' },
                { id: 'dots_skip', label: 'Né D-Dots', color: 'bg-[#e07a5f] text-white' },
                { id: 'eolr', label: 'EOLR Master', color: 'bg-[#e63946] text-white' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRefTab(tab.id as any)}
                  className={`px-2.5 py-1.5 font-bold rounded-lg shrink-0 transition-all cursor-pointer ${refTab === tab.id ? tab.color : 'bg-white text-[#5c4f43] border border-[#e2d8c7] hover:bg-[#faf6ee]'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
              
              {/* 2-Look CMLL */}
              {refTab === 'two_look' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#fcf8f2] rounded-2xl border border-[#ebdcca]">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#2c221e]">
                      <GraduationCap className="w-4 h-4 text-[#e76f51]" />
                      2-Look CMLL: Dễ học, không cần nhớ 45 công thức!
                    </div>
                    <p className="text-[11px] text-[#706459] mt-1 leading-snug">
                      Người mới chỉ cần nhớ <strong>7 công thức OLL góc</strong> để lật mặt vàng lên, sau đó dùng <strong>2 công thức PLL góc</strong> (T-Perm / Y-Perm) để hoán vị 4 góc.
                    </p>
                  </div>
                  <div className="flex bg-[#faf6ee] p-1 rounded-xl border border-[#e4d9c7] gap-1">
                    <button type="button" onClick={() => setTwoLookSubTab('oll')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${twoLookSubTab === 'oll' ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]' : 'text-[#7a6f64]'}`}>Bước 1: OLL Góc (7 thế)</button>
                    <button type="button" onClick={() => setTwoLookSubTab('pll')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${twoLookSubTab === 'pll' ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]' : 'text-[#7a6f64]'}`}>Bước 2: PLL Góc (2 thế)</button>
                  </div>
                  <div className="space-y-2.5">
                    {(twoLookSubTab === 'oll' ? TWO_LOOK_OLL_CASES : TWO_LOOK_PLL_CASES).map((caseItem: TwoLookCornerCase) => (
                      <div key={caseItem.id} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#fbece7] text-[#c45335] border border-[#f5d3c8]">{caseItem.type === 'oll' ? 'OLL Góc' : 'PLL Góc'}</span>
                              <h4 className="text-xs font-bold text-[#2c221e]">{caseItem.name}</h4>
                            </div>
                            <p className="text-[11px] font-semibold text-[#a06030] mt-0.5">{caseItem.vietnameseName}</p>
                          </div>
                          <div className="flex flex-col items-center shrink-0">
                            <CMLLDiagram alg={caseItem.alg} size={52} />
                            <span className="text-[9px] text-[#8c7b6c] mt-0.5">Mặt U & viền</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-[#5c4f43] bg-[#faf6ee] p-2 rounded-xl border border-[#ebdcca] leading-snug">
                          <span className="font-bold text-[#2c221e]">🔍 Nhận biết: </span>{caseItem.recognition}
                        </div>
                        <div className="p-2 bg-[#fcf9f2] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030] select-all break-all">{caseItem.alg}</div>
                        <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                          <button type="button" onClick={() => handleSetupCase(caseItem.setupAlg || caseItem.alg, caseItem.name, !!caseItem.setupAlg)} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] cursor-pointer">
                            <RotateCcw className="w-3 h-3 text-[#3d5a80]" /><span>Tập thế này</span>
                          </button>
                          <button type="button" onClick={() => handleRunAlg(caseItem.alg, caseItem.name)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs cursor-pointer">
                            <Play className="w-3 h-3 fill-current" /><span>Chạy giải</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 45 CMLL */}
              {refTab === 'cmll45' && (
                <div className="space-y-3">
                  <div className="flex bg-[#faf6ee] p-1 rounded-xl border border-[#e4d9c7] gap-1">
                    <button type="button" onClick={() => setCmllMode('2h')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${cmllMode === '2h' ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]' : 'text-[#7a6f64]'}`}>Hai Tay (2H Chuẩn)</button>
                    <button type="button" onClick={() => setCmllMode('oh')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${cmllMode === 'oh' ? 'bg-[#3d5a80] text-white shadow-2xs' : 'text-[#7a6f64]'}`}>
                      <Hand className="w-3.5 h-3.5 text-[#e07a5f]" />Một Tay (OH)
                    </button>
                  </div>
                  {cmllMode === 'oh' && (
                    <div className="p-2.5 bg-[#f0f4f8] rounded-xl border border-[#cbd5e1] text-[11px] text-[#334155] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#3d5a80] shrink-0" />
                      <span><strong>Chế độ OH:</strong> Tối ưu finger-trick 1 tay, ưu tiên <code>&lt;R, U, D, r&gt;</code>.</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 bg-white p-3 rounded-2xl border border-[#e8dfcf] shadow-2xs">
                    <div className="flex items-center gap-2 bg-[#faf6ee] px-2.5 py-1.5 rounded-xl border border-[#e4d9c7]">
                      <Search className="w-3.5 h-3.5 text-[#8c7b6c]" />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm theo tên (Sune, T-Perm...) hoặc công thức..." className="w-full text-xs text-[#2c221e] bg-transparent outline-none placeholder:text-[#a89b8d]" />
                      {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="text-[#8c7b6c] hover:text-[#2c221e]"><X className="w-3 h-3" /></button>}
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                      {CMLL_GROUPS.map((grp) => (
                        <button key={grp} type="button" onClick={() => setSelectedGroup(grp)} className={`px-2.5 py-1 font-bold rounded-lg shrink-0 cursor-pointer transition-all ${selectedGroup === grp ? 'bg-[#3d5a80] text-white shadow-xs' : 'bg-[#faf6ee] text-[#5c4f43] border border-[#e2d8c7] hover:bg-[#f0e7d8]'}`}>
                          {grp === 'ALL' ? (cmllMode === 'oh' ? 'Tất cả OH (42)' : 'Tất cả (45)') : `Nhóm ${grp}`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {filteredCMLL.length === 0 ? (
                      <div className="text-center py-10 text-xs text-[#8c7b6c]">Không tìm thấy thế cờ CMLL nào.</div>
                    ) : (
                      filteredCMLL.map((caseItem: any) => (
                        <div key={caseItem.name} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#eef5f3] text-[#247c72] border border-[#cbe3dd]">Nhóm {caseItem.group}</span>
                                {cmllMode === 'oh' && <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff]">OH 1-Hand</span>}
                                <h4 className="text-xs font-bold text-[#2c221e]">{caseItem.name}</h4>
                              </div>
                              {caseItem.description && <p className="text-[11px] text-[#706459] mt-1 leading-snug">{caseItem.description}</p>}
                              {cmllMode === 'oh' && caseItem.standard2HAlg && <p className="text-[10px] text-[#8c7b6c] mt-0.5 font-mono">2H gốc: <span className="text-[#a06030]">{caseItem.standard2HAlg}</span></p>}
                            </div>
                            <div className="flex flex-col items-center shrink-0">
                              <CMLLDiagram alg={caseItem.alg} size={54} />
                              <span className="text-[9px] text-[#8c7b6c] mt-0.5">Mặt U & viền</span>
                            </div>
                          </div>
                          <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030] select-all break-all">{caseItem.alg}</div>
                          <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                            <button type="button" onClick={() => handleSetupCase(caseItem.alg, caseItem.name)} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] cursor-pointer">
                              <RotateCcw className="w-3 h-3 text-[#3d5a80]" /><span>Tập thế cờ này</span>
                            </button>
                            <button type="button" onClick={() => handleRunAlg(caseItem.alg, caseItem.name)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs cursor-pointer">
                              <Play className="w-3 h-3 fill-current" /><span>Chạy giải</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* EO Reference */}
              {refTab === 'eo_ref' && renderEORefContent()}

              {/* UL/UR Reference */}
              {refTab === 'ulur_ref' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#fdfaf5] rounded-2xl border border-[#ebdcca] space-y-2">
                    <div className="flex items-start gap-2">
                      <Compass className="w-4 h-4 text-[#e07a5f] mt-0.5 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-[#2c221e]">{LSE_UL_UR_GUIDE.title}</h4>
                        <p className="text-[11px] text-[#706459] mt-0.5 leading-snug">{LSE_UL_UR_GUIDE.objective}</p>
                      </div>
                    </div>
                    <ul className="space-y-1 text-[11px] text-[#5c4f43]">
                      {LSE_UL_UR_GUIDE.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#e07a5f] shrink-0 mt-1.5" />
                          <span className="leading-relaxed">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-[#2c221e]">⚡ Thế cờ thực chiến (Demo 3D):</div>
                    {LSE_UL_UR_GUIDE.samples.map((sample) => (
                      <div key={sample.id} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-[#2c221e]">{sample.name}</h5>
                            <p className="text-[11px] text-[#5c4f43] mt-1 leading-snug">{sample.condition}</p>
                          </div>
                          <ULURDiagram caseType={sample.caseType} />
                        </div>
                        <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030]">{sample.alg}</div>
                        <p className="text-[10px] text-[#706459] italic">💡 {sample.tip}</p>
                        <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                          <button type="button" onClick={() => handleSetupCase(sample.setupAlg, sample.name, true)} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] cursor-pointer">
                            <RotateCcw className="w-3 h-3 text-[#3d5a80]" /><span>Tập thế này</span>
                          </button>
                          <button type="button" onClick={() => handleRunAlg(sample.alg, sample.name)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs cursor-pointer">
                            <Play className="w-3 h-3 fill-current" /><span>Chạy giải</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* L4E Reference */}
              {refTab === 'l4e_ref' && renderL4ERefContent()}

              {/* Fast EO */}
              {refTab === 'fast_eo' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#f0f7f9] rounded-2xl border border-[#c4e0e8]">
                    <h4 className="text-xs font-bold text-[#1b4965] flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-[#2b72a6]" />{FAST_EO_GUIDE.title}
                    </h4>
                    <p className="text-[11px] text-[#2c5364] leading-snug">{FAST_EO_GUIDE.principle}</p>
                    <div className="mt-2 p-2 bg-white/80 rounded-xl font-mono text-[11px] font-bold text-[#1b4965] border border-[#d2e7ee]">👉 {FAST_EO_GUIDE.formula}</div>
                  </div>
                  <div className="space-y-2">
                    {FAST_EO_GUIDE.steps.map((st, i) => (
                      <div key={i} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs">
                        <h5 className="text-xs font-bold text-[#2c221e] mb-1">{st.title}</h5>
                        <p className="text-[11px] text-[#5c4f43] whitespace-pre-line leading-relaxed">{st.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl border border-[#e8dfcf] overflow-hidden shadow-2xs">
                    <div className="p-2.5 bg-[#faf6ee] border-b border-[#ebdcca] text-xs font-bold text-[#2c221e]">Bảng tra cứu nhanh [U Bad] + [Sticker FD]</div>
                    <div className="divide-y divide-[#f2e9dc]">
                      {FAST_EO_GUIDE.lookupTable.map((row, i) => (
                        <div key={i} className="p-2.5 flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-1.5 py-0.5 rounded-md bg-[#faf6ee] border border-[#e2d8c7] font-mono font-bold text-[#a06030]">{row.uBadCount} Bad ở U</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${row.fdStatus === 'bad' ? 'bg-[#ffe8e8] text-[#c92a2a] border border-[#fcc2c2]' : 'bg-[#e6fcf5] text-[#0ca678] border border-[#b2f2bb]'}`}>FD: {row.fdStatus.toUpperCase()}</span>
                          </div>
                          <div className="text-right flex-1 min-w-0">
                            <div className="font-bold text-[#2c221e] text-[10px]">{row.inferredCase}</div>
                            <div className="text-[10px] text-[#706459]">{row.explanation}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dots Skip */}
              {refTab === 'dots_skip' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#fdf8f5] rounded-2xl border border-[#f2d6c9]">
                    <h4 className="text-xs font-bold text-[#b23a1a] flex items-center gap-1.5 mb-1">
                      <Flame className="w-3.5 h-3.5 text-[#e07a5f]" />{DOTS_SKIPPING_GUIDE.title}
                    </h4>
                    <p className="text-[11px] text-[#7a4e3f] leading-snug">{DOTS_SKIPPING_GUIDE.overview}</p>
                  </div>
                  <div className="space-y-2">
                    {DOTS_SKIPPING_GUIDE.patterns.map((pt) => (
                      <div key={pt.id} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-1.5">
                        <h5 className="text-xs font-bold text-[#2c221e]">{pt.name}</h5>
                        <p className="text-[11px] text-[#5c4f43]">{pt.condition}</p>
                        <div className="p-2 bg-[#fff5f5] rounded-xl border border-[#ffc9c9] text-[10px] text-[#c92a2a]">⚠️ {pt.standardRule}</div>
                        <div className="p-2 bg-[#f0fbf7] rounded-xl border border-[#b2f2bb] text-[10px] text-[#0ca678]">✨ <strong>Né Dots:</strong> {pt.skipTrick}</div>
                        <div className="p-1.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030] text-center">{pt.formula}</div>
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

              {/* EOLR */}
              {refTab === 'eolr' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#fdf2f2] rounded-2xl border border-[#f8c9c9]">
                    <h4 className="text-xs font-bold text-[#a61e1e] flex items-center gap-1.5 mb-1">
                      <Trophy className="w-3.5 h-3.5 text-[#e63946]" />{EOLR_GUIDE.title}
                    </h4>
                    <p className="text-[11px] text-[#822a2a] leading-snug">{EOLR_GUIDE.overview}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-[#fa5252] text-white text-[10px] font-bold rounded-full">⚡ {EOLR_GUIDE.efficiency}</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="text-xs font-bold text-[#2c221e]">Các thế EOLR thực chiến</div>
                    {EOLR_GUIDE.samples.map((sample) => (
                      <div key={sample.id} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-[#eef5f3] text-[#247c72] border border-[#cbe3dd]">Nhóm {sample.eoGroup}</span>
                            <h5 className="text-xs font-bold text-[#2c221e] mt-1">{sample.name}</h5>
                          </div>
                          <span className="text-[10px] font-bold text-[#2b72a6] font-mono">{sample.savedMoves}</span>
                        </div>
                        <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] font-mono font-bold text-xs text-[#a06030]">Solution: {sample.solution}</div>
                        <p className="text-[10px] text-[#706459] italic">💡 {sample.tip}</p>
                        <div className="flex items-center gap-2 pt-1 border-t border-[#f4ebe1]">
                          <button type="button" onClick={() => handleSetupCase(sample.setupAlg, sample.name, true)} className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#faf6ee] hover:bg-white text-[#5c4f43] rounded-xl border border-[#e2d8c7] cursor-pointer">
                            <RotateCcw className="w-3 h-3 text-[#3d5a80]" /><span>Tập thế này</span>
                          </button>
                          <button type="button" onClick={() => handleRunAlg(sample.solution, sample.name)} className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-[#e07a5f] hover:bg-[#d4684c] text-white rounded-xl shadow-xs cursor-pointer">
                            <Play className="w-3 h-3 fill-current" /><span>Chạy EOLR</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
             TAB 3: PRO TIPS
            ═══════════════════════════════════════════════════════════ */}
        {mainTab === 'pro_tips' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
            <div className="flex bg-[#faf6ee] p-1 rounded-xl border border-[#e4d9c7] gap-1">
              <button type="button" onClick={() => setProSubTab('techniques')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${proSubTab === 'techniques' ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]' : 'text-[#7a6f64]'}`}>Kỹ Thuật Pro</button>
              <button type="button" onClick={() => setProSubTab('sub_x')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${proSubTab === 'sub_x' ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]' : 'text-[#7a6f64]'}`}>Lộ Trình Sub-X</button>
              <button type="button" onClick={() => setProSubTab('meyer')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${proSubTab === 'meyer' ? 'bg-white text-[#2c221e] shadow-2xs border border-[#e2d8c7]' : 'text-[#7a6f64]'}`}>Roux 4x4 (Meyer)</button>
            </div>

            {proSubTab === 'techniques' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#fdfaf4] rounded-2xl border border-[#ebdcca] text-xs text-[#706459]">
                  Tổng hợp 4 kỹ thuật đỉnh cao được các speedcuber hàng đầu phát triển để tối ưu hóa Movecount và mở rộng không gian giải Roux.
                </div>
                {PRO_TECHNIQUES.map((tech) => (
                  <div key={tech.id} className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs space-y-2">
                    <div>
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-[#eef5f3] text-[#247c72] border border-[#cbe3dd]">Kỹ thuật Pro</span>
                      <h4 className="text-xs font-bold text-[#2c221e] mt-1">{tech.title}</h4>
                      <p className="text-[11px] font-semibold text-[#a06030]">{tech.vietnameseTitle}</p>
                    </div>
                    <p className="text-[11px] text-[#5c4f43] leading-relaxed">{tech.summary}</p>
                    <div className="p-2.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca] text-[11px] text-[#2c221e] whitespace-pre-line leading-relaxed font-mono">{tech.howItWorks}</div>
                    {tech.scramble && (
                      <div className="p-2 bg-[#fcf9f2] rounded-xl border border-[#ebdcca] text-[10px] space-y-1">
                        <div className="font-semibold text-[#8c7b6c]">Ví dụ thực chiến:</div>
                        <div className="font-mono text-[#5c4f43] break-all">Scramble: {tech.scramble}</div>
                        <div className="font-mono font-bold text-[#e07a5f] break-all">{tech.solution}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 bg-[#f0fbf7] rounded-xl border border-[#b2f2bb] text-[#0ca678]">
                        <strong className="block mb-0.5">Ưu điểm:</strong>
                        <ul className="list-disc list-inside space-y-0.5">{tech.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
                      </div>
                      <div className="p-2 bg-[#fff5f5] rounded-xl border border-[#ffc9c9] text-[#c92a2a]">
                        <strong className="block mb-0.5">Nhược điểm:</strong>
                        <ul className="list-disc list-inside space-y-0.5">{tech.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {proSubTab === 'sub_x' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#f0f7f9] rounded-2xl border border-[#c4e0e8]">
                  <h4 className="text-xs font-bold text-[#1b4965] flex items-center gap-1.5 mb-1">
                    <Trophy className="w-3.5 h-3.5 text-[#2b72a6]" />Lộ trình tiến bộ Sub-X theo RouxMethodVN
                  </h4>
                  <p className="text-[11px] text-[#2c5364] leading-snug">Phân bổ mục tiêu Movecount và thời gian từng phase, từ mới chơi đến Sub-10 đẳng cấp thế giới.</p>
                </div>
                <div className="space-y-3">
                  {SUB_X_ROADMAP.map((stage, idx) => (
                    <div key={idx} className="p-3.5 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-[#f2e9dc] pb-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#e07a5f] uppercase tracking-wider">Cấp độ {idx + 1}</span>
                          <h4 className="text-xs font-bold text-[#2c221e]">{stage.level}</h4>
                        </div>
                        <span className="px-2.5 py-1 bg-[#2a9d8f]/10 text-[#2a9d8f] text-xs font-bold rounded-xl border border-[#2a9d8f]/20 font-mono">{stage.timeRange}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                        {[['FB Target', stage.fbMoveTarget], ['SB Target', stage.sbMoveTarget], ['CMLL', stage.cmllTarget], ['LSE', stage.lseTarget]].map(([label, val]) => (
                          <div key={label} className="p-1.5 bg-[#faf6ee] rounded-xl border border-[#ebdcca]">
                            <span className="text-[#8c7b6c] block text-[9px]">{label}</span>
                            <strong className="text-[#a06030] font-mono">{val}</strong>
                          </div>
                        ))}
                      </div>
                      <div className="text-[11px] text-[#706459] bg-[#fcf9f2] p-2 rounded-xl border border-[#ebdcca]">
                        ⏱️ <strong>Phân bổ (FB-SB-CMLL-LSE):</strong> <span className="font-mono font-bold text-[#2c221e]">{stage.timeSplit}</span>
                      </div>
                      <ul className="space-y-0.5 text-[11px] text-[#5c4f43]">
                        {stage.coreFocus.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#e07a5f] shrink-0 mt-1.5" />
                            <span className="leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="p-2 bg-[#fdf8f5] rounded-xl border border-[#f2d6c9] text-[10px] text-[#a06030]">
                        💡 <strong>Lời khuyên:</strong> {stage.advice}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {proSubTab === 'meyer' && (
              <div className="space-y-3">
                <div className="p-3 bg-[#fdf2f2] rounded-2xl border border-[#f8c9c9]">
                  <h4 className="text-xs font-bold text-[#a61e1e] flex items-center gap-1.5 mb-1">
                    <Box className="w-3.5 h-3.5 text-[#e63946]" />Phương Pháp Meyer (Roux trên Rubik 4×4×4)
                  </h4>
                  <p className="text-[11px] text-[#822a2a] leading-snug">Sáng tạo bởi Richard Meyer (Mỹ) nhằm đưa Block-building và tầng M của Roux lên khối 4×4×4.</p>
                </div>
                <div className="space-y-2.5">
                  {MEYER_4X4_GUIDE.map((step) => (
                    <div key={step.stepNumber} className="p-3 bg-white rounded-2xl border border-[#e8dfcf] shadow-2xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#fde8e8] text-[#c92a2a] text-xs font-bold flex items-center justify-center shrink-0">{step.stepNumber}</span>
                        <h4 className="text-xs font-bold text-[#2c221e]">{step.title}</h4>
                      </div>
                      <p className="text-[11px] text-[#5c4f43] pl-8"><strong>Mục tiêu:</strong> {step.objective}</p>
                      <div className="p-2 bg-[#faf6ee] rounded-xl border border-[#ebdcca] text-[11px] text-[#2c221e] ml-8">⚠️ <strong>Nguyên tắc:</strong> {step.keyRule}</div>
                      <p className="text-[10px] italic text-[#706459] pl-8">💡 {step.tips}</p>
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
