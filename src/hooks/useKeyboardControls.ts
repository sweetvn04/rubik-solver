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
  }, [enabled, enqueueMove, scramble, reset]);
}
