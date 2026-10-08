import * as THREE from 'three';

// Bảng màu sáp / sơn dầu lấy cảm hứng từ phim hoạt hình Scrambled
export const SCRAMBLED_PALETTE = {
  U: '#e29e10', // Vàng nghệ sáp đậm đà (Mustard Gold)
  D: '#dad5c7', // Trắng giấy mỹ thuật / xám chì (Paper White)
  F: '#2c8a45', // Xanh lá sáp tươi đậm (Leaf Green)
  B: '#2574b5', // Xanh lam sáp đậm (Cobalt Crayon Blue)
  R: '#a12424', // Đỏ đô sáp đậm (Deep Crimson)
  L: '#d85e1b', // Cam đất sáp rực rỡ (Burnt Ochre)
  PAPER: '#f0e9dc', // Màu nền giấy mỹ thuật kem ấm
  INK: '#201c19', // Khung viền mực đen
} as const;

// Cache textures tái sử dụng (giảm từ 108 textures xuống chỉ còn 12 textures trong VRAM)
const textureCache = new Map<string, THREE.CanvasTexture>();
const bumpCache = new Map<string, THREE.CanvasTexture>();

function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Sinh CanvasTexture sáp màu nhẹ, sắc nét và siêu tiết kiệm GPU
 */
export function getScrambledFaceTexture(
  colorHex: string,
  key: string,
  isDimmed: boolean = false
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  // Gom nhóm seed theo biến thể (2 biến thể mỗi mặt để vừa có tính ngẫu nhiên, vừa siêu nhẹ)
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i)) | 0;
  const variation = Math.abs(hash) % 2;

  const cacheKey = `${colorHex}_v${variation}_${isDimmed ? 'dim' : 'norm'}`;

  if (textureCache.has(cacheKey) && bumpCache.has(cacheKey)) {
    return {
      map: textureCache.get(cacheKey)!,
      bumpMap: bumpCache.get(cacheKey)!,
    };
  }

  // 256x256 là kích thước lý tưởng cho màn hình web: cực kỳ sắc nét mà nhẹ hơn 512x512 gấp 4 lần!
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const rand = createSeededRandom(hash + 101);

  // 1. NỀN GIẤY PHÁC THẢO MÀU KEM
  ctx.fillStyle = SCRAMBLED_PALETTE.PAPER;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Hạt sần giấy
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (rand() - 0.5) * 10;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // 2. VÙNG SÁP MÀU
  const margin = 21; // tỷ lệ tương ứng 42px trên 512
  const pL = margin + (rand() - 0.5) * 4;
  const pT = margin + (rand() - 0.5) * 4;
  const pR = size - margin + (rand() - 0.5) * 4;
  const pB = size - margin + (rand() - 0.5) * 4;
  const pW = pR - pL;
  const pH = pB - pT;

  const targetColor = isDimmed ? '#504a44' : colorHex;

  // 3. LỚP LÓT MÀU ĐẬM ĐÀ
  ctx.save();
  ctx.fillStyle = targetColor;
  ctx.globalAlpha = 0.94;
  ctx.fillRect(pL, pT, pW, pH);
  ctx.restore();

  // 4. CÁC NÉT ĐÁNH SÁP
  const numStrokes = 120;
  const mainAngle = Math.PI / 4 + (rand() - 0.5) * 0.25;

  ctx.save();
  bCtx.save();

  for (let i = 0; i < numStrokes; i++) {
    const sx = pL + rand() * pW;
    const sy = pT + rand() * pH;
    const len = 18 + rand() * 45;
    const w = 2.5 + rand() * 4;

    const ex = sx + Math.cos(mainAngle) * len;
    const ey = sy + Math.sin(mainAngle) * len;

    if (ex < pL || ex > pR || ey < pT || ey > pB) continue;

    const isDark = rand() > 0.45;
    ctx.strokeStyle = isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)';
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    bCtx.strokeStyle = isDark ? '#404040' : '#c0c0c0';
    bCtx.lineWidth = w;
    bCtx.lineCap = 'round';
    bCtx.globalAlpha = 0.35;
    bCtx.beginPath();
    bCtx.moveTo(sx, sy);
    bCtx.lineTo(ex, ey);
    bCtx.stroke();
  }

  // 5. VIỀN RÌA SÁP NGUỆCH NGOẠC
  ctx.strokeStyle = targetColor;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.95;

  ctx.beginPath();
  const borderSteps = 16;
  for (let side = 0; side < 4; side++) {
    for (let s = 0; s <= borderSteps; s++) {
      const t = s / borderSteps;
      const wobble = (rand() - 0.5) * 3;
      let x = 0;
      let y = 0;

      if (side === 0) {
        x = pL + t * pW;
        y = pT + wobble;
      } else if (side === 1) {
        x = pR + wobble;
        y = pT + t * pH;
      } else if (side === 2) {
        x = pR - t * pW;
        y = pB + wobble;
      } else {
        x = pL + wobble;
        y = pB - t * pH;
      }

      if (side === 0 && s === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();

  // 6. KHUNG VIỀN MỰC
  ctx.strokeStyle = SCRAMBLED_PALETTE.INK;
  ctx.lineWidth = 3.5;
  ctx.globalAlpha = 0.9;
  ctx.strokeRect(4, 4, size - 8, size - 8);

  ctx.restore();
  bCtx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false; // Tắt mipmap generation trên iGPU để tiết kiệm bộ nhớ
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
  bumpTexture.generateMipmaps = false;
  bumpTexture.minFilter = THREE.LinearFilter;
  bumpTexture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  bumpCache.set(cacheKey, bumpTexture);

  return { map: texture, bumpMap: bumpTexture };
}
