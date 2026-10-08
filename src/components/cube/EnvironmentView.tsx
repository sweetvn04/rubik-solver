import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Sinh texture bóng mềm hình tròn loang mờ (Radial Studio Shadow)
 * Triệt tiêu hoàn toàn lỗi lộ viền xám hình chữ nhật của ContactShadows
 */
function createRadialShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const center = size / 2;
  const gradient = ctx.createRadialGradient(
    center,
    center,
    size * 0.08,
    center,
    center,
    center
  );

  // Đậm ở tâm và loang mờ dần ra không khí, không có bất kỳ đường viền gắt nào
  gradient.addColorStop(0, 'rgba(44, 34, 26, 0.48)');
  gradient.addColorStop(0.35, 'rgba(44, 34, 26, 0.28)');
  gradient.addColorStop(0.7, 'rgba(44, 34, 26, 0.08)');
  gradient.addColorStop(1, 'rgba(44, 34, 26, 0.0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function EnvironmentView() {
  const shadowTexture = useMemo(() => createRadialShadowTexture(), []);

  return (
    <>
      {/* Ánh sáng môi trường dịu ấm */}
      <ambientLight intensity={0.95} color="#fff6eb" />

      {/* Đèn chính góc ấm */}
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.8}
        color="#fffaf0"
      />

      {/* Đèn bù dịu từ phía đối diện */}
      <directionalLight
        position={[-6, -2, -6]}
        intensity={0.5}
        color="#d6e8fa"
      />

      {/* Đèn mặt trước */}
      <directionalLight
        position={[0, 4, 8]}
        intensity={0.6}
        color="#fff4e0"
      />

      {/* 
        Bóng tiếp xúc mềm mại tự nhiên (Studio Radial Shadow)
        Đặt ngay sát đáy khối Rubik (y = -1.275) giúp khối tiếp đất hoàn hảo,
        không bao giờ bị lộ tấm hình chữ nhật màu xám!
      */}
      <group position={[0, -1.275, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Lớp bóng đậm sát đáy */}
        <mesh>
          <planeGeometry args={[2.7, 2.7]} />
          <meshBasicMaterial
            map={shadowTexture}
            transparent
            depthWrite={false}
          />
        </mesh>
        {/* Lớp bóng loang rộng êm ái */}
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[3.8, 3.8]} />
          <meshBasicMaterial
            map={shadowTexture}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
}
