import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { type CubieState } from '../../types';
import {
  getSharedFaceMaterial,
  getSharedCoreMaterial,
} from '../../engine/crayonTexture';
import {
  createWobblyBodyGeometry,
  createWobblyTileGeometry,
  getCubieMicroJitter,
} from '../../engine/organicGeometry';

interface CubieProps {
  cubie: CubieState;
  position: [number, number, number];
  quaternion: [number, number, number, number];
  onRegisterRef: (id: string, group: THREE.Group | null) => void;
}

interface FaceTileProps {
  cubieId: string;
  face: 'U' | 'D' | 'F' | 'B' | 'R' | 'L';
  color: string;
  isDimmed?: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
}

const TILE_OFFSET = 0.501;

function FaceTile({
  cubieId,
  face,
  color,
  isDimmed,
  position,
  rotation,
}: FaceTileProps) {
  const material = useMemo(
    () => getSharedFaceMaterial(color, `${cubieId}_${face}`, isDimmed),
    [color, cubieId, face, isDimmed]
  );

  const tileGeom = useMemo(
    () => createWobblyTileGeometry(`${cubieId}_${face}`),
    [cubieId, face]
  );

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={tileGeom} material={material} />
    </group>
  );
}

export function Cubie({
  cubie,
  position,
  quaternion,
  onRegisterRef,
}: CubieProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { colors, isDimmed } = cubie;

  useEffect(() => {
    onRegisterRef(cubie.id, groupRef.current);
    return () => onRegisterRef(cubie.id, null);
  }, [cubie.id, onRegisterRef]);

  const bodyGeom = useMemo(
    () => createWobblyBodyGeometry(cubie.id),
    [cubie.id]
  );

  const coreMaterial = useMemo(() => getSharedCoreMaterial(), []);

  const jitter = useMemo(
    () => getCubieMicroJitter(cubie.id),
    [cubie.id]
  );

  // Áp dụng quaternion toán học kết hợp độ nghiêng thủ công micro-jitter
  const finalQuat = useMemo(() => {
    const baseQ = new THREE.Quaternion(...quaternion);
    const jitQ = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...jitter.rotation)
    );
    return baseQ.multiply(jitQ);
  }, [quaternion, jitter.rotation]);

  const finalPos: [number, number, number] = [
    position[0] + jitter.offset[0],
    position[1] + jitter.offset[1],
    position[2] + jitter.offset[2],
  ];

  return (
    <group
      ref={groupRef}
      position={finalPos}
      quaternion={finalQuat}
      name={cubie.id}
    >
      {/* Thân khối nhựa than đen gọt hữu cơ */}
      <mesh geometry={bodyGeom} material={coreMaterial} />

      {/* Mặt U (Trên cùng: Y = +1) */}
      {colors.U && (
        <FaceTile
          cubieId={cubie.id}
          face="U"
          color={colors.U}
          isDimmed={isDimmed}
          position={[0, TILE_OFFSET, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}

      {/* Mặt D (Dưới cùng: Y = -1) */}
      {colors.D && (
        <FaceTile
          cubieId={cubie.id}
          face="D"
          color={colors.D}
          isDimmed={isDimmed}
          position={[0, -TILE_OFFSET, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      )}

      {/* Mặt F (Trước mặt: Z = +1) */}
      {colors.F && (
        <FaceTile
          cubieId={cubie.id}
          face="F"
          color={colors.F}
          isDimmed={isDimmed}
          position={[0, 0, TILE_OFFSET]}
          rotation={[0, 0, 0]}
        />
      )}

      {/* Mặt B (Sau lưng: Z = -1) */}
      {colors.B && (
        <FaceTile
          cubieId={cubie.id}
          face="B"
          color={colors.B}
          isDimmed={isDimmed}
          position={[0, 0, -TILE_OFFSET]}
          rotation={[0, Math.PI, 0]}
        />
      )}

      {/* Mặt R (Bên phải: X = +1) */}
      {colors.R && (
        <FaceTile
          cubieId={cubie.id}
          face="R"
          color={colors.R}
          isDimmed={isDimmed}
          position={[TILE_OFFSET, 0, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
      )}

      {/* Mặt L (Bên trái: X = -1) */}
      {colors.L && (
        <FaceTile
          cubieId={cubie.id}
          face="L"
          color={colors.L}
          isDimmed={isDimmed}
          position={[-TILE_OFFSET, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      )}
    </group>
  );
}
