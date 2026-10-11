import React, { useState, useMemo } from 'react';
import { useRubikStore } from '../../store/useRubikStore';
import { ROUX_LESSONS, type Lesson } from '../../data/lessonsData';
import { CMLL_ALGORITHMS, type CMLLCase } from '../../engine/solver/cmllData';
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
} from 'lucide-react';

interface LessonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CMLL_GROUPS = ['ALL', 'O', 'H', 'Pi', 'T', 'U', 'L', 'S', 'As'] as const;

export const LessonDrawer: React.FC<LessonDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'cmll'>('lessons');
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(ROUX_LESSONS[0]);
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Sub-step navigator
  const [stepIndex, setStepIndex] = useState(0);
  const [showNote, setShowNote] = useState(false);

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

  // Lọc danh sách CMLL theo nhóm và từ khóa
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

  // Hành động: Chạy công thức giải trực tiếp lên khối Rubik
  const handleRunAlg = (alg: string, name: string) => {
    if (isAnimating || moveQueue.length > 0) return;
    enqueueAlgorithm(alg);
    showToast(`Đang xoay thuật toán: ${name}`);
  };

  // Hành động: Dàn dựng thế cờ CMLL (Setup case) để người dùng tự tập
  const handleSetupCase = (alg: string, name: string) => {
    if (isAnimating || moveQueue.length > 0) return;
    const moves = parseAlgorithm(alg);
    // Để tạo ra thế cờ từ trạng thái giải, ta đảo ngược toàn bộ chuỗi move từ cuối lên đầu
    const setupMoves = [...moves].reverse().map((m) => invertMove(m.raw)).join(' ');
    reset();
    setTimeout(() => {
      enqueueAlgorithm(setupMoves);
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
        if (step.demoAlg) {
          enqueueAlgorithm(step.demoAlg);
          showToast(`Demo: ${step.title}`);
        }
      }, 200 + setupMoves.split(' ').length * 30);
      enqueueAlgorithm(setupMoves.split(' ').filter(Boolean).join(' '));
    } else if (step.demoAlg) {
      enqueueAlgorithm(step.demoAlg);
      showToast(`Demo: ${step.title}`);
    }
  };

  if (!isOpen) return null;

  const currentStep = selectedLesson.steps[stepIndex];
  const totalSteps = selectedLesson.steps.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-start pointer-events-auto select-none animate-in fade-in duration-200">
      {/* Backdrop mờ phía sau */}
      <div
        className="fixed inset-0 bg-[#2b241e]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel chính */}
      <aside className="relative z-10 w-full max-w-md sm:max-w-lg h-full bg-[#fbf8f1] border-r border-[#e8dfcf] shadow-2xl flex flex-col overflow-hidden text-[#332b25]">
        {/* Toast thông báo nhanh */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 bg-[#2a9d8f] text-white text-xs font-semibold rounded-xl shadow-lg border border-[#238b7f] animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* 1. Header Drawer */}
        <div className="p-4 sm:p-5 border-b border-[#ebdcca] bg-white/60 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e07a5f] flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#2c221e] tracking-tight">
                Thư Viện Roux Method VN
              </h2>
              <p className="text-[11px] text-[#8c7b6c]">
                Giáo trình & 45 Công thức CMLL tra cứu
              </p>
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

        {/* 2. Thanh chuyển Tab (Giáo trình vs Tra cứu 45 CMLL) */}
        <div className="flex border-b border-[#ebdcca] bg-[#f5efe4]/80 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'lessons'
                ? 'bg-white text-[#2c221e] shadow-xs border border-[#e2d8c7]'
                : 'text-[#7a6f64] hover:text-[#2c221e]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#e07a5f]" />
            <span>Giáo trình 4 Bước</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cmll')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'cmll'
                ? 'bg-white text-[#2c221e] shadow-xs border border-[#e2d8c7]'
                : 'text-[#7a6f64] hover:text-[#2c221e]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2a9d8f]" />
            <span>Tra cứu 45 CMLL</span>
          </button>
        </div>

        {/* 3. Nội dung TAB 1: GIÁO TRÌNH 4 BƯỚC */}
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

            {/* ── PHẦN CHÍNH: SUB-STEP NAVIGATOR ── */}
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
                    {/* Dot indicators */}
                    <div className="flex items-center gap-1">
                      {selectedLesson.steps.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setStepIndex(i); setShowNote(false); }}
                          className={`rounded-full transition-all cursor-pointer ${
                            i === stepIndex
                              ? 'w-4 h-2 bg-[#e07a5f]'
                              : 'w-2 h-2 bg-[#d4c8ba] hover:bg-[#c0b4a4]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-[#8c7b6c] tabular-nums">
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

              {/* Sub-step content */}
              {currentStep && (
                <div className="p-3 sm:p-4 flex flex-col gap-3">

                  {/* Diagram + mô tả cạnh nhau */}
                  <div className="flex items-start gap-3">
                    {/* 2D Diagram SVG */}
                    {currentStep.diagram && (
                      <div className="shrink-0">
                        <CubeDiagram2D {...currentStep.diagram} />
                      </div>
                    )}

                    {/* Tiêu đề + mô tả */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#2c221e] leading-snug mb-1">
                        {currentStep.title}
                      </h4>
                      <p className="text-[11px] text-[#54483e] leading-relaxed">
                        {currentStep.description}
                      </p>
                    </div>
                  </div>

                  {/* Note toggle */}
                  {currentStep.note && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowNote(!showNote)}
                        className="flex items-center gap-1 text-[11px] text-[#3d5a80] font-semibold hover:text-[#2c4f70] cursor-pointer"
                      >
                        <Info className="w-3 h-3" />
                        {showNote ? 'Ẩn ghi chú' : 'Xem ghi chú'}
                      </button>
                      {showNote && (
                        <div className="mt-1.5 px-2.5 py-2 bg-[#eef5f3] rounded-xl border border-[#cbe3dd] text-[11px] text-[#1e5b52] leading-relaxed">
                          {currentStep.note}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nút Demo trên Rubik 3D */}
                  {currentStep.demoAlg && (
                    <button
                      type="button"
                      onClick={handleRunStepDemo}
                      disabled={isAnimating || moveQueue.length > 0}
                      className="flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-bold bg-[#3d5a80] hover:bg-[#344d6d] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition-all hover:scale-101 active:scale-99 cursor-pointer"
                      title="Xem kỹ thuật này được minh hoạ trực tiếp trên khối Rubik 3D"
                    >
                      <MonitorPlay className="w-3.5 h-3.5" />
                      <span>Xem Demo trên Rubik 3D</span>
                      <span className="font-mono text-[10px] opacity-70 ml-1">
                        {currentStep.demoAlg}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Thông tin tổng quan bài học (thu gọn) */}
            <details className="group bg-[#faf6ee] rounded-2xl border border-[#e8dfcf] overflow-hidden">
              <summary className="px-3 py-2.5 text-xs font-bold text-[#5c4f43] cursor-pointer flex items-center gap-1.5 hover:bg-[#f4ede2] transition-colors list-none">
                <ChevronRight className="w-3.5 h-3.5 text-[#e07a5f] transition-transform group-open:rotate-90" />
                Xem thêm: Mục tiêu & Kỹ thuật then chốt
              </summary>
              <div className="px-3 pb-3 flex flex-col gap-2 border-t border-[#f0e8db]">
                {/* Mô tả cốt lõi */}
                <p className="text-xs text-[#54483e] leading-relaxed pt-2">{selectedLesson.description}</p>

                {/* Mục tiêu */}
                <div className="p-2.5 bg-white rounded-xl border border-[#ece1cf]">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8c7b6c] mb-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#2a9d8f]" />
                    Mục tiêu cần đạt:
                  </h4>
                  <ul className="text-xs text-[#42372f] space-y-1">
                    {selectedLesson.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#a06030] font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Kỹ thuật then chốt */}
                <div className="p-2.5 bg-white rounded-xl border border-[#ebdcca]">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#3d5a80] mb-1.5 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-[#3d5a80]" />
                    Kỹ thuật then chốt:
                  </h4>
                  <ul className="text-xs text-[#42372f] space-y-1">
                    {selectedLesson.keyTechniques.map((tech, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#3d5a80] font-bold">•</span>
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro Tips */}
                <div className="p-2.5 bg-[#fff7ed] rounded-xl border border-[#fed7aa]/60">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#c2410c] mb-1 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-[#f97316]" />
                    Lời khuyên từ Cuber:
                  </h4>
                  <ul className="text-xs text-[#7c2d12] space-y-1">
                    {selectedLesson.proTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span>💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* 4. Nội dung TAB 2: TRA CỨU & LUYỆN TẬP 45 CMLL */}
        {activeTab === 'cmll' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
            {/* Thanh tìm kiếm & Lọc nhóm */}
            <div className="flex flex-col gap-2 bg-white p-3 rounded-2xl border border-[#e8dfcf] shadow-2xs">
              {/* Ô Search */}
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
