import * as THREE from 'three';
import { getSpacecraftPosition } from '../utils/orbitPath';
import type { SceneTarget } from '../types/scene';

export interface TrajectorySample {
  position: THREE.Vector3;
  direction: THREE.Vector3;
}

export const TRAJECTORY_SOURCE = 'Illustrative scene orbit';

export function sampleIllustrativeTrajectory(
  target: SceneTarget,
  progress: number,
): TrajectorySample {
  const angle = THREE.MathUtils.clamp(progress, 0, 1) * Math.PI * 2;

  return {
    position: getSpacecraftPosition(target, angle),
    direction: new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)),
  };
}
