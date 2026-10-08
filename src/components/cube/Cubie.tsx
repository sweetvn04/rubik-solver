import { useRef } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { type CubieState, CUBE_PALETTE } from '../../types';

interface CubieProps {
  cubie: CubieState;
  position: [number, number, number];
}

const TILE_SIZE: [number, number, number] = [0.82, 0.82, 0.02];
const TILE_RADIUS = 0.04;
const TILE_OFFSET = 0.485;

export function Cubie({ cubie, position }: CubieProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { colors, isDimmed } = cubie;

  const getTileColor = (color?: string) => {
    if (!color) return CUBE_PALETTE.CORE;
    return isDimmed ? CUBE_PALETTE.DIMMED : color;
  };

  return (
    <group ref={groupRef} position={position} name={cubie.id}>
      {/* Khối thân nhựa đen matte mờ bo góc */}
      <RoundedBox
        args={[0.96, 0.96, 0.96]}
        radius={0.07}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={CUBE_PALETTE.CORE}
          roughness={0.45}
          metalness={0.05}
        />
      </RoundedBox>

      {/* Mặt U (Trên cùng: Y = +1) */}
      {colors.U && (
        <group position={[0, TILE_OFFSET, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <RoundedBox
            args={TILE_SIZE}
            radius={TILE_RADIUS}
            smoothness={2}
            castShadow
          >
            <meshStandardMaterial
              color={getTileColor(colors.U)}
              roughness={0.3}
              metalness={0.02}
            />
          </RoundedBox>
        </group>
      )}

      {/* Mặt D (Dưới cùng: Y = -1) */}
      {colors.D && (
        <group position={[0, -TILE_OFFSET, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <RoundedBox
            args={TILE_SIZE}
            radius={TILE_RADIUS}
            smoothness={2}
            receiveShadow
          >
            <meshStandardMaterial
              color={getTileColor(colors.D)}
              roughness={0.3}
              metalness={0.02}
            />
          </RoundedBox>
        </group>
      )}

      {/* Mặt F (Trước mặt: Z = +1) */}
      {colors.F && (
        <group position={[0, 0, TILE_OFFSET]}>
          <RoundedBox
            args={TILE_SIZE}
            radius={TILE_RADIUS}
            smoothness={2}
            castShadow
          >
            <meshStandardMaterial
              color={getTileColor(colors.F)}
              roughness={0.3}
              metalness={0.02}
            />
          </RoundedBox>
        </group>
      )}

      {/* Mặt B (Sau lưng: Z = -1) */}
      {colors.B && (
        <group position={[0, 0, -TILE_OFFSET]} rotation={[0, Math.PI, 0]}>
          <RoundedBox
            args={TILE_SIZE}
            radius={TILE_RADIUS}
            smoothness={2}
            castShadow
          >
            <meshStandardMaterial
              color={getTileColor(colors.B)}
              roughness={0.3}
              metalness={0.02}
            />
          </RoundedBox>
        </group>
      )}

      {/* Mặt R (Bên phải: X = +1) */}
      {colors.R && (
        <group position={[TILE_OFFSET, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <RoundedBox
            args={TILE_SIZE}
            radius={TILE_RADIUS}
            smoothness={2}
            castShadow
          >
            <meshStandardMaterial
              color={getTileColor(colors.R)}
              roughness={0.3}
              metalness={0.02}
            />
          </RoundedBox>
        </group>
      )}

      {/* Mặt L (Bên trái: X = -1) */}
      {colors.L && (
        <group position={[-TILE_OFFSET, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <RoundedBox
            args={TILE_SIZE}
            radius={TILE_RADIUS}
            smoothness={2}
            castShadow
          >
            <meshStandardMaterial
              color={getTileColor(colors.L)}
              roughness={0.3}
              metalness={0.02}
            />
          </RoundedBox>
        </group>
      )}
    </group>
  );
}
