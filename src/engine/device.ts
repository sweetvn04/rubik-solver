/**
 * Nhận diện chính xác thiết bị di động thực sự (Mobile Phone / Phablet)
 * Không bị nhận nhầm trên laptop có màn hình cảm ứng hoặc Linux touch driver
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || '';
  const isMobileUA =
    /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
    (/iPad|Macintosh/i.test(userAgent) && 'ontouchstart' in window);

  const isSmallScreen = window.innerWidth <= 768;

  // Chỉ coi là mobile khi vừa có mobile UserAgent HOẶC màn hình nhỏ hơn 768px
  return isMobileUA && isSmallScreen;
}

/**
 * Tỉ lệ DPR tối ưu:
 * - Desktop: Cho phép lên tới 2.0 (mịn màng, không một gợn răng cưa)
 * - Mobile: 1.0 đến 1.25 (tiết kiệm pin)
 */
export function getOptimizedDPR(): number {
  if (typeof window === 'undefined') return 1;
  const rawDPR = window.devicePixelRatio || 1;
  return isMobileDevice() ? Math.min(rawDPR, 1.25) : Math.min(rawDPR, 2.0);
}
