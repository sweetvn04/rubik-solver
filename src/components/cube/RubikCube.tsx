import { useState } from 'react';
import { createInitialCubies } from '../../engine/cubeModel';
import { Cubie } from './Cubie';

const SPACING = 1.02; // Khoảng cách giữa các viên tạo khe hở xúc giác tự nhiên

export function RubikCube() {
  const [cubies] = useState(() => createInitialCubies());

  return (
    <group name="RubikCubeRoot">
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
