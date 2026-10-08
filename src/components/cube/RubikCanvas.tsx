import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EnvironmentView } from './EnvironmentView';
import { RubikCube } from './RubikCube';

export function RubikCanvas() {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [5.2, 4.2, 6.0], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
      >
        <EnvironmentView />

        {/* Orbit controls with smooth damping */}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={4.5}
          maxDistance={14}
          dampingFactor={0.05}
          rotateSpeed={0.8}
        />

        {/* Khối Rubik 3D đầy đủ 26 cubies bo góc mềm */}
        <RubikCube />
      </Canvas>
    </div>
  );
}
