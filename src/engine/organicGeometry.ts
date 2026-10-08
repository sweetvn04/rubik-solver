import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three-stdlib';

const bodyGeomCache = new Map<string, THREE.BufferGeometry>();
const tileGeomCache = new Map<string, THREE.BufferGeometry>();

function getSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Sinh hình học thân khối: kích thước 0.98 (khít sát với spacing 1.00),
 * bo góc nhẹ nhàng để chỉ tạo rãnh đen mảnh 0.02 giữa các viên.
 */
export function createWobblyBodyGeometry(id: string): THREE.BufferGeometry {
  if (bodyGeomCache.has(id)) {
    return bodyGeomCache.get(id)!;
  }

  const seed = getSeed(id);
  // Thân khối 0.98 ép sát nhau
  const geom = new RoundedBoxGeometry(0.98, 0.98, 0.98, 4, 0.045);
  const pos = geom.attributes.position;
  const normal = geom.attributes.normal;

  const amplitude = 0.007;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);

    const wave =
      Math.sin(x * 5.0 + seed * 0.7) * Math.cos(y * 4.5 + seed * 1.1) +
      Math.sin(z * 5.2 + seed * 1.3) * Math.cos(x * 3.8 + seed * 0.4);

    const disp = wave * amplitude;

    pos.setXYZ(i, x + nx * disp, y + ny * disp, z + nz * disp);
  }

  geom.computeVertexNormals();
  bodyGeomCache.set(id, geom);
  return geom;
}

/**
 * Sinh hình học miếng dán nhãn màu: kích thước 0.93 để phủ kín bề mặt,
 * chỉ chừa lại viền rãnh đen mỏng, đẹp mắt.
 */
export function createWobblyTileGeometry(id: string): THREE.BufferGeometry {
  if (tileGeomCache.has(id)) {
    return tileGeomCache.get(id)!;
  }

  const seed = getSeed(id) + 999;
  const geom = new RoundedBoxGeometry(0.93, 0.93, 0.022, 3, 0.025);
  const pos = geom.attributes.position;
  const normal = geom.attributes.normal;

  const amplitude = 0.004;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);

    const wave =
      Math.sin(x * 6.0 + seed * 0.5) * Math.cos(y * 5.5 + seed * 0.8) +
      Math.cos(z * 6.8 + seed * 1.2);

    const disp = wave * amplitude;

    pos.setXYZ(i, x + nx * disp, y + ny * disp, z + nz * disp);
  }

  geom.computeVertexNormals();
  tileGeomCache.set(id, geom);
  return geom;
}

/**
 * Độ nghiêng và lệch siêu nhẹ (Micro-tilt) cho cảm giác stop-motion
 */
export function getCubieMicroJitter(id: string): {
  rotation: [number, number, number];
  offset: [number, number, number];
} {
  const seed = getSeed(id);
  const s1 = Math.sin(seed * 1.1) * 0.5;
  const s2 = Math.cos(seed * 2.3) * 0.5;
  const s3 = Math.sin(seed * 3.7) * 0.5;

  const maxRot = 0.010; // ~0.5 độ, rất tinh tế
  const maxOff = 0.004;

  return {
    rotation: [s1 * maxRot, s2 * maxRot, s3 * maxRot],
    offset: [s2 * maxOff, s3 * maxOff, s1 * maxOff],
  };
}
