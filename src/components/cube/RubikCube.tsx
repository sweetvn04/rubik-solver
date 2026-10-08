import { useState } from 'react';
import { createInitialCubies } from '../../engine/cubeModel';
import { Cubie } from './Cubie';

const SPACING = 1.00; // Khít sát tuyệt đối, rãnh đen mảnh tinh tế

export function RubikCube() {
  const [cubies] = useState(() => createInitialCubies());

  return (
    <group name="RubikCubeRoot" scale={0.85}>
      {cubies.map((cubie) => {
        const [x, y, z] = cubie.currentPos;
        const pos: [number, number, number] = [
          x * SPACING,
          y * SPACING,
          z * SPACING,
        ];

        return <Cubie key={cubie.id} cubie={cubie} position={pos} />;
      })}
    </group>
  );
}
