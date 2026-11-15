import { OrbitControls } from '@react-three/drei';

interface SceneControlsProps {
  enableAutoRotate?: boolean;
  enablePan?: boolean;
}

/** Configured OrbitControls with appropriate limits for the space scene. */
export function SceneControls({
  enableAutoRotate = false,
  enablePan = true,
}: SceneControlsProps) {
  return (
    <OrbitControls
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
