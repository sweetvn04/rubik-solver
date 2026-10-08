import * as THREE from 'three';

// Bảng màu sáp / sơn dầu lấy cảm hứng từ phim hoạt hình Scrambled
export const SCRAMBLED_PALETTE = {
  U: '#e5a922', // Vàng nghệ / mustard
  D: '#dfdcce', // Trắng giấy phác thảo / chalk white
  F: '#38934c', // Xanh lá sáp / meadow green
  B: '#2f7ebb', // Xanh lam cerulean / crayon blue
  R: '#9d2825', // Đỏ đô / crimson crayon
  L: '#d86629', // Cam đất / burnt orange
  PAPER: '#f3ede0', // Màu nền giấy thô ngả vàng
  PAPER_GRAIN: '#dfd7c5',
  INK: '#1e1a17', // Viền mực đen phác thảo
} as const;

// Cache textures để không phải sinh lại mỗi frame
const textureCache = new Map<string, THREE.CanvasTexture>();
const bumpCache = new Map<string, THREE.CanvasTexture>();

/**
 * Sinh số ngẫu nhiên có kiểm soát (pseudo-random) dựa trên seed
 */
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Tạo CanvasTexture mô phỏng chất liệu sáp màu vẽ tay trên giấy mỹ thuật thô
 * (Hiệu ứng lấy cảm hứng từ phim ngắn SCRAMBLED)
 */
export function getScrambledFaceTexture(
  colorHex: string,
  key: string,
  isDimmed: boolean = false
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const cacheKey = `${key}_${colorHex}_${isDimmed ? 'dim' : 'norm'}`;

  if (textureCache.has(cacheKey) && bumpCache.has(cacheKey)) {
    return {
      map: textureCache.get(cacheKey)!,
      bumpMap: bumpCache.get(cacheKey)!,
    };
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  // Tạo seeded random dựa trên chuỗi key
  let seedNum = 42;
  for (let i = 0; i < key.length; i++) {
    seedNum = (seedNum * 31 + key.charCodeAt(i)) | 0;
  }
  const rand = createSeededRandom(seedNum);

  // 1. VẼ NỀN GIẤY MỸ THUẬT (ART PAPER SUBSTRATE)
  ctx.fillStyle = SCRAMBLED_PALETTE.PAPER;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Thêm hạt sần giấy (paper texture grain)
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (rand() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // 2. TÍNH TOÁN VÙNG TÔ SÁP MÀU VỚI VIỀN NGUỆCH NGOẠC (HAND-DRAWN WOBBLE BORDER)
  // Để hở viền giấy màu kem bên ngoài khoảng 32 - 42px
  const margin = 38;
  const patchLeft = margin + (rand() - 0.5) * 8;
  const patchTop = margin + (rand() - 0.5) * 8;
  const patchRight = size - margin + (rand() - 0.5) * 8;
  const patchBottom = size - margin + (rand() - 0.5) * 8;
  const patchW = patchRight - patchLeft;
  const patchH = patchBottom - patchTop;

  // 3. LỚP LÓT SƠN/SÁP CƠ BẢN (BASE WASH)
  ctx.save();
  ctx.fillStyle = isDimmed ? '#605a54' : colorHex;
  ctx.globalAlpha = 0.65;
  ctx.fillRect(patchLeft + 4, patchTop + 4, patchW - 8, patchH - 8);
  ctx.restore();

  // 4. VẼ CÁC NÉT ĐÁNH SÁP VÀ VẾT CỌ THÔ (CRAYON / OIL PASTEL HATCHING)
  // Vẽ hàng trăm nét gạch chéo mô phỏng lực tô bằng tay
  const numStrokes = 180;
  const angle = Math.PI / 4 + (rand() - 0.5) * 0.3; // góc nghiêng ~45 độ

  ctx.save();
  bCtx.save();

  for (let i = 0; i < numStrokes; i++) {
    const strokeX = patchLeft + rand() * patchW;
    const strokeY = patchTop + rand() * patchH;
    const len = 40 + rand() * 80;
    const strokeWidth = 3 + rand() * 7;

    const x2 = strokeX + Math.cos(angle) * len;
    const y2 = strokeY + Math.sin(angle) * len;

    // Giới hạn trong vùng patch
    if (x2 < patchLeft || x2 > patchRight || y2 < patchTop || y2 > patchBottom) {
      continue;
    }

    ctx.strokeStyle = isDimmed ? '#4c4641' : colorHex;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    // Đậm nhạt ngẫu nhiên mô phỏng lực ấn tay sáp màu
    ctx.globalAlpha = 0.25 + rand() * 0.55;

    ctx.beginPath();
    // Thêm chút độ cong nhẹ cho nét vẽ tay
    const midX = (strokeX + x2) / 2 + (rand() - 0.5) * 4;
    const midY = (strokeY + y2) / 2 + (rand() - 0.5) * 4;
    ctx.moveTo(strokeX, strokeY);
    ctx.quadraticCurveTo(midX, midY, x2, y2);
    ctx.stroke();

    // Bump map nét sáp nổi
    bCtx.strokeStyle = rand() > 0.5 ? '#b0b0b0' : '#505050';
    bCtx.lineWidth = strokeWidth;
    bCtx.lineCap = 'round';
    bCtx.globalAlpha = 0.4;
    bCtx.beginPath();
    bCtx.moveTo(strokeX, strokeY);
    bCtx.quadraticCurveTo(midX, midY, x2, y2);
    bCtx.stroke();
  }

  // 5. CÁC NÉT GẠCH CHÉO NGƯỢC (CROSS-HATCHING ACCENTS)
  const crossStrokes = 45;
  const crossAngle = -Math.PI / 4 + (rand() - 0.5) * 0.3;
  for (let i = 0; i < crossStrokes; i++) {
    const sx = patchLeft + rand() * patchW;
    const sy = patchTop + rand() * patchH;
    const slen = 30 + rand() * 50;

    ctx.strokeStyle = isDimmed ? '#383430' : colorHex;
    ctx.lineWidth = 2 + rand() * 4;
    ctx.globalAlpha = 0.2 + rand() * 0.4;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(crossAngle) * slen, sy + Math.sin(crossAngle) * slen);
    ctx.stroke();
  }

  // 6. VIỀN RÌA SÁP LEM NGUỆCH NGOẠC (ORGANIC CRAYON BORDER SKETCH)
  ctx.strokeStyle = isDimmed ? '#332f2c' : colorHex;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.5;

  ctx.beginPath();
  const steps = 30;
  for (let side = 0; side < 4; side++) {
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      let px = 0;
      let py = 0;
      const wobble = (rand() - 0.5) * 6;

      if (side === 0) {
        px = patchLeft + t * patchW;
        py = patchTop + wobble;
      } else if (side === 1) {
        px = patchRight + wobble;
        py = patchTop + t * patchH;
      } else if (side === 2) {
        px = patchRight - t * patchW;
        py = patchBottom + wobble;
      } else {
        px = patchLeft + wobble;
        py = patchBottom - t * patchH;
      }

      if (side === 0 && step === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  }
  ctx.closePath();
  ctx.stroke();

  // 7. VIỀN MỰC NGOÀI CÙNG THÔ MỘC (OUTER INK CONTOUR)
  ctx.strokeStyle = SCRAMBLED_PALETTE.INK;
  ctx.lineWidth = 5;
  ctx.globalAlpha = 0.85;
  ctx.strokeRect(6, 6, size - 12, size - 12);

  ctx.restore();
  bCtx.restore();

  // Tạo Three.js CanvasTexture
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  bumpCache.set(cacheKey, bumpTexture);

  return { map: texture, bumpMap: bumpTexture };
}
