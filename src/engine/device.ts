/**
 * Tiện ích nhận diện thiết bị để tối ưu hóa tài nguyên phần cứng
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    window.innerWidth < 768 ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0)
  );
}

/**
 * Lấy tỉ lệ DPR lý tưởng:
 * - Mobile: Luôn là 1.0 (tránh render 3x/4x gây cháy iGPU/mobile GPU)
 * - Desktop: Tối đa 1.25 (đủ mịn mà cực nhẹ)
 */
export function getOptimizedDPR(): number {
  if (typeof window === 'undefined') return 1;
  return isMobileDevice() ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
}
