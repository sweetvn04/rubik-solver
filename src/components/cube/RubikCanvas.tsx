import { useEffect, useMemo, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, invalidate } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { EnvironmentView } from './EnvironmentView';
import { RubikCube } from './RubikCube';
import { isMobileDevice, getOptimizedDPR } from '../../engine/device';
import { useRubikStore } from '../../store/useRubikStore';

interface RubikCanvasProps {
  onResetCamera?: (resetFn: () => void) => void;
}

// Camera góc nhìn chuẩn Roux: F = Xanh lá phía trước, U = Vàng trên cùng
const DEFAULT_CAMERA_POS = new THREE.Vector3(8.1, 6.55, 9.35);
const DEFAULT_CAMERA_POS_MOBILE = new THREE.Vector3(8.1, 6.55, 9.35);

export function RubikCanvas({ onResetCamera }: RubikCanvasProps) {
  const isMobile = useMemo(() => isMobileDevice(), []);
  const dpr = useMemo(() => getOptimizedDPR(), []);
  const isTutorActive = useRubikStore((s) => s.isTutorActive);
  const activeCaseStudy = useRubikStore((s) => s.activeCaseStudy);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Khi đang bật Tutor Mode hoặc Case Study trên màn hình điện thoại, điều chỉnh góc ngắm để khối Rubik nổi lên 1/3 trên màn hình, không bị card che khuất
  const isCaseOrTutor = Boolean((isTutorActive || activeCaseStudy) && isMobile);
  const targetY = isCaseOrTutor ? -0.85 : 0;
  const groupY = isCaseOrTutor ? 0.35 : 0;

  useEffect(() => {
    invalidate();
  }, [targetY, groupY]);

  // Expose hàm reset camera về góc nhìn chuẩn Roux cho parent
  const handleResetCamera = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const targetPos = isMobile ? DEFAULT_CAMERA_POS_MOBILE : DEFAULT_CAMERA_POS;
    controls.object.position.set(targetPos.x, targetPos.y + groupY, targetPos.z);
    controls.target.set(0, targetY, 0);
    controls.update();
    invalidate();
  }, [isMobile, groupY, targetY]);

  useEffect(() => {
    onResetCamera?.(handleResetCamera);
  }, [handleResetCamera, onResetCamera]);

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing touch-none select-none">
      <Canvas
        frameloop="demand" // Render on-demand: 0% GPU load khi không chạm
        dpr={dpr}          // 1.0 trên Mobile, 1.25 trên Desktop (cứu tinh cho GPU)
        camera={{ position: [8.1, 6.55 + groupY, 9.35], fov: isMobile ? 42 : 36 }}
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

        {/* Orbit controls có hỗ trợ cử chỉ cảm ứng trên điện thoại */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          minDistance={4.2}
          maxDistance={14}
          dampingFactor={0.14}
          target={[0, targetY, 0]}
          rotateSpeed={isMobile ? 0.9 : 0.85}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />

        <group position={[0, groupY, 0]}>
          <EnvironmentView />
          {/* Khối Rubik 3D đầy đủ 26 cubies bo góc mềm */}
          <RubikCube />
        </group>
      </Canvas>
    </div>
  );
}
