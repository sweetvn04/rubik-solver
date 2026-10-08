import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three-stdlib';

// Cache geometry theo id và thông số để tối ưu hiệu năng
const bodyGeomCache = new Map<string, THREE.BufferGeometry>();
const tileGeomCache = new Map<string, THREE.BufferGeometry>();

/**
 * Tạo seed số từ chuỗi id
 */
function getSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Sinh hình học bo góc biến dạng hữu cơ (Organic Clay / Hand-carved Wobble)
 * Mô phỏng khối đồ chơi nặn bằng tay hoặc gọt bằng gỗ thủ công trong phim Scrambled
 */
export function createWobblyBodyGeometry(id: string): THREE.BufferGeometry {
  if (bodyGeomCache.has(id)) {
    return bodyGeomCache.get(id)!;
  }

  const seed = getSeed(id);
  // RoundedBox với các phân đoạn đa giác vừa phải để biến dạng mượt mà
  const geom = new RoundedBoxGeometry(0.96, 0.96, 0.96, 4, 0.08);
  const pos = geom.attributes.position;
  const normal = geom.attributes.normal;

  // Biên độ biến dạng (khoảng 2.2% kích thước viên)
  const amplitude = 0.022;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // Tính toán độ lồi lõm hữu cơ bằng sóng điều hòa 3D kết hợp seed
    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);

    // Sóng biến dạng dọc theo vector pháp tuyến (normal)
    const wave =
      Math.sin(x * 5.2 + seed * 0.7) * Math.cos(y * 4.8 + seed * 1.1) +
      Math.sin(z * 5.6 + seed * 1.3) * Math.cos(x * 3.9 + seed * 0.4);

    const disp = wave * amplitude;

    pos.setXYZ(i, x + nx * disp, y + ny * disp, z + nz * disp);
  }

  geom.computeVertexNormals();
  bodyGeomCache.set(id, geom);
  return geom;
}

/**
 * Sinh hình học miếng dán nhãn màu vẽ tay hơi méo mó, lồi lõm nhẹ
 */
export function createWobblyTileGeometry(id: string): THREE.BufferGeometry {
  if (tileGeomCache.has(id)) {
    return tileGeomCache.get(id)!;
  }

  const seed = getSeed(id) + 999;
  const geom = new RoundedBoxGeometry(0.86, 0.86, 0.026, 3, 0.03);
  const pos = geom.attributes.position;
  const normal = geom.attributes.normal;

  const amplitude = 0.012;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);

    const wave =
      Math.sin(x * 6.5 + seed * 0.5) * Math.cos(y * 6.1 + seed * 0.8) +
      Math.cos(z * 7.2 + seed * 1.2);

    const disp = wave * amplitude;

    pos.setXYZ(i, x + nx * disp, y + ny * disp, z + nz * disp);
  }

  geom.computeVertexNormals();
  tileGeomCache.set(id, geom);
  return geom;
}

/**
 * Tính toán độ lệch ngẫu nhiên nhẹ (Micro-tilt & Micro-offset) cho từng viên
 * để tạo cảm giác các viên không nằm thẳng tắp công nghiệp
 */
export function getCubieMicroJitter(id: string): {
  rotation: [number, number, number];
  offset: [number, number, number];
} {
  const seed = getSeed(id);
  const s1 = (Math.sin(seed * 1.1) * 0.5 + 0.5) - 0.5;
  const s2 = (Math.sin(seed * 2.3) * 0.5 + 0.5) - 0.5;
  const s3 = (Math.sin(seed * 3.7) * 0.5 + 0.5) - 0.5;

  // Góc nghiêng siêu nhẹ (~ 0.6 - 1.2 độ)
  const maxRot = 0.018; // radian
  // Độ lệch vị trí siêu nhẹ (~ 0.01 đơn vị)
  const maxOff = 0.012;

  return {
    rotation: [s1 * maxRot, s2 * maxRot, s3 * maxRot],
    offset: [s2 * maxOff, s3 * maxOff, s1 * maxOff],
  };
}
