import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useRubikStore } from '../../store/useRubikStore';
import { getMoveExecutionInfo } from '../../engine/moveParser';
import { isCubieInPhase, isCubieInCaseStudy, type FocusPhaseId } from '../../engine/highlightRules';
import type { Move } from '../../types';
import { Cubie } from './Cubie';

const SPACING = 1.00;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function RubikCube() {
  const { invalidate } = useThree();
  const cubies = useRubikStore((s) => s.cubies);
  const moveQueue = useRubikStore((s) => s.moveQueue);
  const currentMove = useRubikStore((s) => s.currentMove);
  const startNextMove = useRubikStore((s) => s.startNextMove);
  const completeCurrentMove = useRubikStore((s) => s.completeCurrentMove);
  const turnDuration = useRubikStore((s) => s.turnDuration);

  // Focus Mode State & Tutor Current Phase
  const isTutorActive = useRubikStore((s) => s.isTutorActive);
  const tutorPhases = useRubikStore((s) => s.tutorPhases);
  const tutorCurrentIndex = useRubikStore((s) => s.tutorCurrentIndex);
  const tutorAllMoves = useRubikStore((s) => s.tutorAllMoves);
  const isFocusMode = useRubikStore((s) => s.isFocusMode);
  const activeCaseStudy = useRubikStore((s) => s.activeCaseStudy);

  let currentPhaseId: FocusPhaseId = 'all';
  if (isTutorActive && isFocusMode) {
    if (tutorCurrentIndex < tutorAllMoves.length) {
      const activePhase = tutorPhases.find(
        (p) => tutorCurrentIndex >= p.startIndex && tutorCurrentIndex < p.endIndex
      );
      if (activePhase) {
        currentPhaseId = activePhase.id;
      }
    }
  }

  // Cập nhật lại khung hình khi chuyển phase, đổi case study hoặc bật/tắt Focus
  useEffect(() => {
    invalidate();
  }, [currentPhaseId, isFocusMode, activeCaseStudy?.id, invalidate]);

  const cubieRefs = useRef<Map<string, THREE.Group>>(new Map());
  const progressRef = useRef(0);
  const activeMoveRef = useRef<Move | null>(null);

  const handleRegisterRef = useCallback((id: string, group: THREE.Group | null) => {
    if (group) {
      cubieRefs.current.set(id, group);
    } else {
      cubieRefs.current.delete(id);
    }
  }, []);

  // Đánh thức canvas bất cứ khi nào có thay đổi trong hàng đợi hoặc move đang chạy
  useEffect(() => {
    if (moveQueue.length > 0 || currentMove) {
      invalidate();
    }
  }, [moveQueue.length, currentMove, invalidate]);

  useFrame((_, delta) => {
    // 1. Lấy move hiện tại hoặc bắt đầu move tiếp theo từ hàng đợi
    let move = currentMove;
    if (!move) {
      if (moveQueue.length > 0) {
        move = startNextMove();
      }
      if (!move) {
        if (progressRef.current !== 0 || activeMoveRef.current !== null) {
          progressRef.current = 0;
          activeMoveRef.current = null;
        }
        return;
      }
    }

    if (move !== activeMoveRef.current) {
      progressRef.current = 0;
      activeMoveRef.current = move;
    }

    const moveInfo = getMoveExecutionInfo(move);
    if (!moveInfo) return;

    // Giới hạn delta (tối đa 35ms) để tránh giật frame khi vừa thức dậy sau lúc ngủ demand
    const safeDelta = Math.min(delta, 0.035);
    const durationMs = move.duration ?? turnDuration;
    const durationSec = Math.max(0.04, durationMs / 1000);
    progressRef.current += safeDelta / durationSec;
    const progress = Math.min(1.0, progressRef.current);
    const easedProgress = easeOutCubic(progress);

    const { axis, angle, filter } = moveInfo;
    const currentAngle = angle * easedProgress;
    const deltaQ = new THREE.Quaternion().setFromAxisAngle(axis, currentAngle);

    // Xoay các cubie thuộc tầng tương ứng
    cubies.forEach((cubie) => {
      if (!filter(cubie.currentPos)) return;

      const group = cubieRefs.current.get(cubie.id);
      if (!group) return;

      const basePos = new THREE.Vector3(
        cubie.currentPos[0] * SPACING,
        cubie.currentPos[1] * SPACING,
        cubie.currentPos[2] * SPACING
      );
      basePos.applyQuaternion(deltaQ);
      group.position.copy(basePos);

      const baseQuat = new THREE.Quaternion(...cubie.quaternion);
      const animatedQuat = new THREE.Quaternion().multiplyQuaternions(deltaQ, baseQuat);
      group.quaternion.copy(animatedQuat);
    });

    // Tiếp tục render khung hình tiếp theo
    invalidate();

    if (progress >= 1.0) {
      progressRef.current = 0;
      activeMoveRef.current = null;
      completeCurrentMove();
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

        let isDimmed = false;
        if (isFocusMode) {
          if (activeCaseStudy) {
            isDimmed = !isCubieInCaseStudy(cubie, activeCaseStudy);
          } else if (isTutorActive) {
            isDimmed = !isCubieInPhase(cubie, currentPhaseId);
          }
        }

        return (
          <Cubie
            key={cubie.id}
            cubie={{ ...cubie, isDimmed }}
            position={pos}
            quaternion={cubie.quaternion}
            onRegisterRef={handleRegisterRef}
          />
        );
      })}
    </group>
  );
}
