import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { type CubieState, CUBE_PALETTE } from '../../types';
import { getScrambledFaceTexture } from '../../engine/crayonTexture';

interface CubieProps {
  cubie: CubieState;
  position: [number, number, number];
}

interface FaceTileProps {
  cubieId: string;
  face: 'U' | 'D' | 'F' | 'B' | 'R' | 'L';
  color: string;
  isDimmed?: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
}

const TILE_SIZE: [number, number, number] = [0.86, 0.86, 0.025];
const TILE_RADIUS = 0.025;
const TILE_OFFSET = 0.485;

function FaceTile({
  cubieId,
  face,
  color,
  isDimmed,
  position,
  rotation,
}: FaceTileProps) {
  const { map, bumpMap } = useMemo(
    () => getScrambledFaceTexture(color, `${cubieId}_${face}`, isDimmed),
    [color, cubieId, face, isDimmed]
  );

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox
        args={TILE_SIZE}
        radius={TILE_RADIUS}
        smoothness={2}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={map}
          bumpMap={bumpMap}
          bumpScale={0.02}
          roughness={0.94}
          metalness={0.02}
        />
      </RoundedBox>
    </group>
  );
}

export function Cubie({ cubie, position }: CubieProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { colors, isDimmed } = cubie;

  return (
    <group ref={groupRef} position={position} name={cubie.id}>
      {/* Khối thân nhựa đen than thô mộc bo góc */}
      <RoundedBox
        args={[0.96, 0.96, 0.96]}
        radius={0.06}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={CUBE_PALETTE.CORE}
          roughness={0.88}
          metalness={0.04}
        />
      </RoundedBox>

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
