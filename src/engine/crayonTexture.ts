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
  CORE: '#1a1715', // Thân nhựa than đen thô mộc
} as const;

// Cache textures và materials dùng chung toàn bộ ứng dụng (Material Pooling)
const textureCache = new Map<string, THREE.CanvasTexture>();
const materialCache = new Map<string, THREE.MeshStandardMaterial>();
let sharedCoreMaterial: THREE.MeshStandardMaterial | null = null;

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
): THREE.CanvasTexture {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i)) | 0;
  const variation = Math.abs(hash) % 2;

  const cacheKey = `${colorHex}_v${variation}_${isDimmed ? 'dim' : 'norm'}`;

  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  // 256x256 sắc nét và siêu nhẹ cho iGPU
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const rand = createSeededRandom(hash + 101);

  // 1. NỀN GIẤY PHÁC THẢO MÀU KEM
  ctx.fillStyle = SCRAMBLED_PALETTE.PAPER;
  ctx.fillRect(0, 0, size, size);

  // Hạt sần giấy tinh tế
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
  const margin = 21;
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
  const numStrokes = 100;
  const mainAngle = Math.PI / 4 + (rand() - 0.5) * 0.25;

  ctx.save();
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

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Lấy vật liệu mặt dùng chung (Material Pooling): Tối ưu tối đa lệnh gọi GPU
 */
export function getSharedFaceMaterial(
  colorHex: string,
  key: string,
  isDimmed: boolean = false
): THREE.MeshStandardMaterial {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i)) | 0;
  const variation = Math.abs(hash) % 2;

  const matKey = `${colorHex}_v${variation}_${isDimmed ? 'dim' : 'norm'}`;

  if (materialCache.has(matKey)) {
    return materialCache.get(matKey)!;
  }

  const map = getScrambledFaceTexture(colorHex, key, isDimmed);
  const mat = new THREE.MeshStandardMaterial({
    map,
    roughness: 0.92,
    metalness: 0.02,
  });

  materialCache.set(matKey, mat);
  return mat;
}

/**
 * Lấy vật liệu thân khối nhựa đen dùng chung cho toàn bộ 26 cubies
 */
export function getSharedCoreMaterial(): THREE.MeshStandardMaterial {
  if (!sharedCoreMaterial) {
    sharedCoreMaterial = new THREE.MeshStandardMaterial({
      color: SCRAMBLED_PALETTE.CORE,
      roughness: 0.92,
      metalness: 0.03,
    });
  }
  return sharedCoreMaterial;
}
