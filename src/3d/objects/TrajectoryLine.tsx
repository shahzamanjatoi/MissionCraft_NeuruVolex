import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { TRAJECTORY } from '../utils/sceneConstants';

interface TrajectoryLineProps {
  points: THREE.Vector3[];
  progress: number;
}

/**
 * Renders a closed elliptical orbit path for the spacecraft.
 * Uses @react-three/drei's <Line> component for clean anti-aliased rendering.
 */
export function TrajectoryLine({ points, progress }: TrajectoryLineProps) {
  const visiblePoints = points.slice(
    0,
    Math.max(2, Math.ceil(points.length * progress)),
  );

  return (
    <>
      <Line
        points={points}
        color="#164e63"
        lineWidth={1.6}
        transparent
        opacity={0.75}
      />
      <Line
        points={visiblePoints}
        color={TRAJECTORY.COLOR}
        lineWidth={TRAJECTORY.LINE_WIDTH}
        transparent
        opacity={TRAJECTORY.OPACITY}
      />
    </>
  );
}
