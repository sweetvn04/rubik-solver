import { ContactShadows } from '@react-three/drei';

export function EnvironmentView() {
  return (
    <>
      {/* Ánh sáng môi trường dịu ấm */}
      <ambientLight intensity={0.95} color="#fff6eb" />

      {/* Đèn chính góc ấm (Không bật castShadow thời gian thực để bảo vệ iGPU) */}
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
        Bóng tiếp xúc mềm:
        frames={1} -> CHỈ RENDER 1 LẦN DUY NHẤT LÚC LOAD, KHÔNG TỐN GPU MỖI FRAME!
      */}
      <ContactShadows
        frames={1}
        position={[0, -2.2, 0]}
        opacity={0.35}
        scale={8}
        blur={2.4}
        far={4.5}
        color="#3d2f23"
      />
    </>
  );
}
