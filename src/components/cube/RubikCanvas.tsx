import { Canvas } from '@react-three/fiber';
import { OrbitControls, RoundedBox } from '@react-three/drei';
import { EnvironmentView } from './EnvironmentView';

export function RubikCanvas() {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        shadows
        camera={{ position: [4.5, 3.8, 5.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <EnvironmentView />

        {/* Orbit controls with smooth damping */}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={4}
          maxDistance={12}
          dampingFactor={0.05}
          rotateSpeed={0.8}
        />

        {/* Temporary Cozy Center Cube to verify R3F + RoundedBox setup */}
        <group position={[0, 0, 0]}>
          <RoundedBox
            args={[1, 1, 1]}
            radius={0.08}
            smoothness={4}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#f59e0b"
              roughness={0.35}
              metalness={0.05}
            />
          </RoundedBox>
        </group>
      </Canvas>
    </div>
  );
}
