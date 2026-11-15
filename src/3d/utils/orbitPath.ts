import * as THREE from 'three';
import { ORBIT_RADII, TRAJECTORY } from './sceneConstants';
import type { SceneTarget } from '../types/scene';

/**
 * Returns a list of THREE.Vector3 points tracing a full circular orbit
 * in the XZ plane at the visual radius for the given mission target.
 */
export function getOrbitPoints(
  target: SceneTarget,
  segments: number = TRAJECTORY.SEGMENTS,
): THREE.Vector3[] {
  const radius = ORBIT_RADII[target];
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    ));
  }
  return pts;
}

/**
 * Returns the spacecraft's world position on its circular orbit for a
 * given angle (radians).
 */
export function getSpacecraftPosition(
  target: SceneTarget,
  angle: number,
): THREE.Vector3 {
  const radius = ORBIT_RADII[target];
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius,
  );
}

/**
 * Returns a yaw rotation (around Y-axis) that keeps the spacecraft body
 * pointing "forward" along the orbit tangent.
 */
export function getSpacecraftRotation(angle: number): number {
  return -(angle + Math.PI / 2);
}
