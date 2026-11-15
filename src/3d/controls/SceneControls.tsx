import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { CameraViewpoint, SceneTarget } from '../types/scene';
import { CAMERA_PRESETS, EARTH_POSITIONS } from '../utils/sceneConstants';

interface SceneControlsProps {
  enableAutoRotate?: boolean;
  enablePan?: boolean;
  follow: boolean;
  followTargetRef: React.MutableRefObject<THREE.Vector3>;
  target: SceneTarget;
  viewpoint: CameraViewpoint;
  zoomLevel: number;
}

interface CameraTransition {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

/** Configured OrbitControls with appropriate limits for the space scene. */
export function SceneControls({
  enableAutoRotate = false,
  enablePan = true,
  follow,
  followTargetRef,
  target,
  viewpoint,
  zoomLevel,
}: SceneControlsProps) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const previousTarget = useRef(new THREE.Vector3());
  const wasFollowing = useRef(false);
  const targetDelta = useRef(new THREE.Vector3());
  const transitionRef = useRef<CameraTransition | null>(null);
  const previousViewpoint = useRef(viewpoint);
  const previousSceneTarget = useRef(target);
  const previousZoomLevel = useRef(zoomLevel);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (
      previousViewpoint.current !== viewpoint ||
      previousSceneTarget.current !== target
    ) {
      previousViewpoint.current = viewpoint;
      previousSceneTarget.current = target;
      previousZoomLevel.current = zoomLevel;
      const focus = viewpoint === 'earth'
        ? new THREE.Vector3(...EARTH_POSITIONS[target])
        : new THREE.Vector3();
      const cameraPosition = viewpoint === 'overview'
        ? new THREE.Vector3(...CAMERA_PRESETS[target])
        : viewpoint === 'destination'
          ? new THREE.Vector3(...CAMERA_PRESETS[target]).multiplyScalar(0.38)
          : focus.clone().add(new THREE.Vector3(0, 5, 16));

      transitionRef.current = { position: cameraPosition, target: focus };
      return;
    }

    const zoomDelta = zoomLevel - previousZoomLevel.current;
    if (zoomDelta !== 0) {
      previousZoomLevel.current = zoomLevel;
      const focus = controls.target.clone();
      const offset = controls.object.position.clone().sub(focus);
      offset.multiplyScalar(Math.pow(0.82, zoomDelta));
      transitionRef.current = { position: focus.add(offset), target: controls.target.clone() };
    }
  }, [target, viewpoint, zoomLevel]);

  useFrame((_state, delta) => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    const transition = transitionRef.current;
    if (transition) {
      const smoothFactor = 1 - Math.exp(-6 * delta);
      controls.object.position.lerp(transition.position, smoothFactor);
      controls.target.lerp(transition.target, smoothFactor);
      controls.update();

      if (
        controls.object.position.distanceToSquared(transition.position) < 0.0004 &&
        controls.target.distanceToSquared(transition.target) < 0.0004
      ) {
        controls.object.position.copy(transition.position);
        controls.target.copy(transition.target);
        transitionRef.current = null;
        controls.update();
      }
    }

    if (!follow) {
      wasFollowing.current = false;
      return;
    }

    const target = followTargetRef.current;
    if (!wasFollowing.current) {
      previousTarget.current.copy(target);
      wasFollowing.current = true;
      return;
    }

    targetDelta.current.copy(target).sub(previousTarget.current);
    if (targetDelta.current.lengthSq() > 0) {
      controls.target.add(targetDelta.current);
      controls.object.position.add(targetDelta.current);
      if (transitionRef.current) {
        transitionRef.current.target.add(targetDelta.current);
        transitionRef.current.position.add(targetDelta.current);
      }
      previousTarget.current.copy(target);
      controls.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={3.5}
      maxDistance={50}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI - 0.2}
      autoRotate={enableAutoRotate}
      autoRotateSpeed={0.3}
      enablePan={enablePan}
      makeDefault
    />
  );
}
