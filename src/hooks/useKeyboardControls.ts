import { useEffect } from 'react';
import { useRubikStore } from '../store/useRubikStore';

/**
 * Hook lắng nghe bàn phím để điều khiển khối Rubik trực tiếp:
 * - Phím R, L, U, D, F, B, M: Xoay cùng chiều kim đồng hồ
 * - Giữ Shift + [Phím]: Xoay ngược chiều kim đồng hồ (')
 * - Phím Space: Xáo khối (Scramble)
 * - Phím Escape: Reset về trạng thái giải xong
 */
export function useKeyboardControls(enabled: boolean = true) {
  const enqueueMove = useRubikStore((s) => s.enqueueMove);
  const scramble = useRubikStore((s) => s.scramble);
  const reset = useRubikStore((s) => s.reset);
  const isTutorActive = useRubikStore((s) => s.isTutorActive);
  const tutorNextStep = useRubikStore((s) => s.tutorNextStep);
  const tutorPrevStep = useRubikStore((s) => s.tutorPrevStep);
  const exitTutorMode = useRubikStore((s) => s.exitTutorMode);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua khi người dùng đang nhập dữ liệu trong ô text input
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Không can thiệp nếu đang dùng tổ hợp phím hệ thống (Ctrl, Alt, Meta)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Xử lý riêng khi đang ở chế độ Tutor Mode
      if (isTutorActive) {
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          tutorNextStep();
          return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
          e.preventDefault();
          tutorPrevStep();
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          exitTutorMode();
          return;
        }
        // Khi đang tutor, không cho xoay phím tự do để tránh làm lệch trạng thái
        return;
      }

      const key = e.key.toUpperCase();
      const isShift = e.shiftKey;

      switch (key) {
        case 'R':
        case 'L':
        case 'U':
        case 'D':
        case 'F':
        case 'B':
        case 'M': {
          e.preventDefault();
          const moveNotation = isShift ? `${key}'` : key;
          enqueueMove(moveNotation);
          break;
        }

        case ' ': {
          e.preventDefault();
          scramble();
          break;
        }

        case 'ESCAPE': {
          e.preventDefault();
          reset();
          break;
        }

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    enabled,
    enqueueMove,
    scramble,
    reset,
    isTutorActive,
    tutorNextStep,
    tutorPrevStep,
    exitTutorMode,
  ]);
}
