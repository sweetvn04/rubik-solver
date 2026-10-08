import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EnvironmentView } from './EnvironmentView';
import { RubikCube } from './RubikCube';

export function RubikCanvas() {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        frameloop="demand" // Render on-demand: 0% GPU load khi không chạm chuột
        dpr={[1, 1.35]}    // Tối ưu tỷ lệ pixel nhẹ nhàng trên iGPU
        camera={{ position: [5.2, 4.2, 6.0], fov: 36 }}
        gl={{
          antialias: true,
          alpha: false,     // TẮT ALPHA: Cho phép Linux Compositor vẽ trực tiếp, tăng 25% fps
          stencil: false,   // TẮT STENCIL: Tiết kiệm băng thông VRAM
          depth: true,
          powerPreference: 'high-performance',
        }}
      >
        {/* Màu nền scene gắn trực tiếp vào WebGL để thay thế alpha blending */}
        <color attach="background" args={['#f6f2e9']} />

        <EnvironmentView />

        {/* Orbit controls có dampingFactor 0.12 giúp hãm dừng nhanh, GPU hạ về 0% ngay */}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={4.5}
          maxDistance={14}
          dampingFactor={0.12}
          rotateSpeed={0.85}
        />

        {/* Khối Rubik 3D đầy đủ 26 cubies bo góc mềm */}
        <RubikCube />
      </Canvas>
    </div>
  );
}
