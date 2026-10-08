import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useRubikStore } from '../../store/useRubikStore';
import { getMoveExecutionInfo } from '../../engine/moveParser';
import { Cubie } from './Cubie';

const SPACING = 1.00;

// Easing hàm bậc 3 mượt mà có độ nảy nhẹ ở điểm dừng (Juicy easeOutCubic)
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function RubikCube() {
  const { invalidate } = useThree();
  const cubies = useRubikStore((s) => s.cubies);
  const currentMove = useRubikStore((s) => s.currentMove);
  const startNextMove = useRubikStore((s) => s.startNextMove);
  const completeCurrentMove = useRubikStore((s) => s.completeCurrentMove);
  const turnDuration = useRubikStore((s) => s.turnDuration);

  // Lưu trữ tham chiếu tới từng group Object3D của 26 cubies
  const cubieRefs = useRef<Map<string, THREE.Group>>(new Map());

  // Tiến trình xoay của move hiện tại: 0.0 -> 1.0
  const progressRef = useRef(0);

  // Lưu trạng thái góc quay bắt đầu của các viên đang xoay
  const activeMoveInfoRef = useRef<ReturnType<typeof getMoveExecutionInfo> | null>(null);

  // Callback đăng ký ref từ component con
  const handleRegisterRef = useCallback((id: string, group: THREE.Group | null) => {
    if (group) {
      cubieRefs.current.set(id, group);
    } else {
      cubieRefs.current.delete(id);
    }
  }, []);

  // Khi currentMove thay đổi, khởi tạo thông tin trục xoay và reset progress
  useEffect(() => {
    if (currentMove) {
      activeMoveInfoRef.current = getMoveExecutionInfo(currentMove);
      progressRef.current = 0;
      invalidate(); // Đánh thức render loop của Three.js
    } else {
      activeMoveInfoRef.current = null;
    }
  }, [currentMove, invalidate]);

  // Vòng lặp animation mượt mà 60fps
  useFrame((_, delta) => {
    // 1. Nếu chưa có move nào đang xoay, kiểm tra hàng đợi
    if (!currentMove) {
      const next = startNextMove();
      if (next) {
        invalidate();
      }
      return;
    }

    // 2. Nếu đang có move, tính toán góc xoay
    const moveInfo = activeMoveInfoRef.current;
    if (!moveInfo) return;

    // Tăng progress dựa trên delta time và turnDuration
    const durationSec = Math.max(0.08, turnDuration / 1000);
    progressRef.current += delta / durationSec;
    const progress = Math.min(1.0, progressRef.current);
    const easedProgress = easeOutCubic(progress);

    const { axis, angle, filter } = moveInfo;
    const currentAngle = angle * easedProgress;
    const deltaQ = new THREE.Quaternion().setFromAxisAngle(axis, currentAngle);

    // Xoay 9 viên (hoặc 18 viên) thỏa mãn bộ lọc tầng
    cubies.forEach((cubie) => {
      if (!filter(cubie.currentPos)) return;

      const group = cubieRefs.current.get(cubie.id);
      if (!group) return;

      // Xoay vị trí quanh trục
      const basePos = new THREE.Vector3(
        cubie.currentPos[0] * SPACING,
        cubie.currentPos[1] * SPACING,
        cubie.currentPos[2] * SPACING
      );
      basePos.applyQuaternion(deltaQ);
      group.position.copy(basePos);

      // Xoay hướng quaternion
      const baseQuat = new THREE.Quaternion(...cubie.quaternion);
      const animatedQuat = new THREE.Quaternion().multiplyQuaternions(deltaQ, baseQuat);
      group.quaternion.copy(animatedQuat);
    });

    // Ép buộc render khung hình này
    invalidate();

    // 3. Khi hoàn tất move (progress đạt 1.0)
    if (progress >= 1.0) {
      progressRef.current = 0;
      completeCurrentMove();
      // Tiếp tục đánh thức frame tiếp theo để kiểm tra hàng đợi
      invalidate();
    }
  });

  return (
    <group name="RubikCubeRoot" scale={0.85}>
      {cubies.map((cubie) => {
        const [x, y, z] = cubie.currentPos;
        const pos: [number, number, number] = [
          x * SPACING,
          y * SPACING,
          z * SPACING,
        ];

        return (
          <Cubie
            key={cubie.id}
            cubie={cubie}
            position={pos}
            quaternion={cubie.quaternion}
            onRegisterRef={handleRegisterRef}
          />
        );
      })}
    </group>
  );
}
