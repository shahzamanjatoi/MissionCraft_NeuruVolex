import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { getOrbitPoints } from '../utils/orbitPath';
import { TRAJECTORY } from '../utils/sceneConstants';
import type { SceneTarget } from '../types/scene';

interface TrajectoryLineProps {
  target: SceneTarget;
  /** 0–1: how much of the orbit has been travelled (for future progress highlight). */
  progress?: number;
}

/**
 * Renders a closed elliptical orbit path for the spacecraft.
 * Uses @react-three/drei's <Line> component for clean anti-aliased rendering.
 */
export function TrajectoryLine({ target, progress: _progress = 1 }: TrajectoryLineProps) {
  const points = useMemo(() => getOrbitPoints(target), [target]);
  const visiblePoints = points.slice(
    0,
    Math.max(2, Math.ceil(points.length * _progress)),
  );

  return (
    <Line
      points={visiblePoints}
      color={TRAJECTORY.COLOR}
      lineWidth={TRAJECTORY.LINE_WIDTH}
      transparent
      opacity={TRAJECTORY.OPACITY}
      dashed={false}
    />
  );
}
