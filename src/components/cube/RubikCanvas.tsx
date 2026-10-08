import { useMemo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EnvironmentView } from './EnvironmentView';
import { RubikCube } from './RubikCube';
import { isMobileDevice, getOptimizedDPR } from '../../engine/device';

export function RubikCanvas() {
  const isMobile = useMemo(() => isMobileDevice(), []);
  const dpr = useMemo(() => getOptimizedDPR(), []);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing touch-none select-none">
      <Canvas
        frameloop="demand" // Render on-demand: 0% GPU load khi không chạm
        dpr={dpr}          // 1.0 trên Mobile, 1.25 trên Desktop (cứu tinh cho GPU)
        camera={{ position: [8.1, 6.55, 9.35], fov: isMobile ? 42 : 36 }}
        gl={{
          antialias: !isMobile, // Tắt antialias trên mobile (màn hình nhỏ PPI cao không cần tới)
          alpha: false,         // Tắt alpha để compositor không phải tính toán hòa trộn
          stencil: false,       // Tắt stencil buffer tiết kiệm băng thông VRAM
          depth: true,
          precision: 'mediump', // Bật 16-bit ALU di động: giảm 50% điện năng và tăng gấp đôi tốc độ shader
          powerPreference: 'high-performance',
        }}
      >
        {/* Màu nền gắn trực tiếp vào WebGL để không tốn công hòa trộn với web */}
        <color attach="background" args={['#f6f2e9']} />

        <EnvironmentView />

        {/* Orbit controls có hỗ trợ cử chỉ cảm ứng trên điện thoại */}
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={4.2}
          maxDistance={14}
          dampingFactor={0.14}
          rotateSpeed={isMobile ? 0.9 : 0.85}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />

        {/* Khối Rubik 3D đầy đủ 26 cubies bo góc mềm */}
        <RubikCube />
      </Canvas>
    </div>
  );
}
