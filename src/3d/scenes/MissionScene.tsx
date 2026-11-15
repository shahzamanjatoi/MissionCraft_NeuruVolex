import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Planet } from '../objects/Planet';
import { EarthAtmosphere } from '../objects/EarthAtmosphere';
import { Spacecraft } from '../objects/Spacecraft';
import { TrajectoryLine } from '../objects/TrajectoryLine';
import { StarField } from '../objects/StarField';
import { SceneControls } from '../controls/SceneControls';
import { EARTH_POSITIONS, SUN_POSITION } from '../utils/sceneConstants';
import { getOrbitPoints } from '../utils/orbitPath';
import { sampleIllustrativeTrajectory } from '../adapters/illustrativeTrajectoryAdapter';
import type { CameraViewpoint, SceneTarget } from '../types/scene';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MissionSceneProps {
  target: SceneTarget;
  progress: number;
  followSpacecraft: boolean;
  viewpoint: CameraViewpoint;
  zoomLevel: number;
  isThrusting?: boolean;
  showTrajectory?: boolean;
  onObjectSelect?: (selection: { name: string; description: string }) => void;
}

// ─── Planet helper ────────────────────────────────────────────────────────────

function getPlanetType(target: SceneTarget): 'Earth' | 'Moon' | 'Mars' {
  switch (target) {
    case 'LEO':
    case 'GEO':
      return 'Earth';
    case 'Moon':
      return 'Moon';
    case 'Mars':
      return 'Mars';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * MissionScene — the full 3D scene assembled inside an R3F <Canvas>.
 *
 * Renders:
 *  • Deep-space star field
 *  • Sun (directional light source + visible glow mesh)
 *  • Primary planet for the mission target
 *  • Blue atmospheric glow (Earth only)
 *  • Circular spacecraft orbit trajectory
 *  • Procedurally modelled spacecraft orbiting the planet
 *  • OrbitControls for free camera navigation
 */
export function MissionScene({
  target,
  progress,
  followSpacecraft,
  viewpoint,
  zoomLevel,
  isThrusting = false,
  showTrajectory = true,
  onObjectSelect,
}: MissionSceneProps) {
  const planetType = getPlanetType(target);
  const trajectoryPoints = useMemo(() => getOrbitPoints(target), [target]);
  const trajectorySample = useMemo(
    () => sampleIllustrativeTrajectory(target, progress),
    [target, progress],
  );
  const spacecraftPositionRef = useRef(new THREE.Vector3());
  const originEarthPosition = EARTH_POSITIONS[target];

  // Sun glow sphere — purely decorative, far away
  const sunColor = useMemo(() => new THREE.Color(1.6, 1.4, 0.9), []);

  return (
    <>
      {/* ── Camera reset target ───────────────────────────────────────────── */}
      {/* (Camera position is set via Canvas prop; controlled by OrbitControls) */}

      {/* ── Lighting ─────────────────────────────────────────────────────── */}
      {/* Very dark ambient — space is almost black without the sun */}
      <ambientLight intensity={0.07} />

      {/* Hemisphere for subtle cold-space fill on the shadow side */}
      <hemisphereLight
        args={[0x0a1a2e, 0x000000, 0.12]}
      />

      {/* Primary sun: bright directional light */}
      <directionalLight
        position={SUN_POSITION}
        intensity={1.0}
        color={0xfff5e0}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={500}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Point light co-located with sun so specular highlights work on curved surfaces */}
      <pointLight position={SUN_POSITION} intensity={0.15} color={0xfff8e8} distance={300} />

      {/* ── Sun glow sphere ──────────────────────────────────────────────── */}
      <mesh position={SUN_POSITION}>
        <sphereGeometry args={[2.8, 16, 8]} />
        <meshBasicMaterial color={sunColor} fog={false} />
      </mesh>
      {/* Halo around the sun (additive, slightly larger) */}
      <mesh position={SUN_POSITION}>
        <sphereGeometry args={[5.0, 12, 6]} />
        <meshBasicMaterial
          color={new THREE.Color(1.2, 1.0, 0.5)}
          transparent
          opacity={0.12}
          side={THREE.FrontSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── Star field ───────────────────────────────────────────────────── */}
      <StarField />

      {/* ── Primary planet ───────────────────────────────────────────────── */}
      {planetType !== 'Earth' && (
        <>
          <Planet
            type="Earth"
            position={originEarthPosition}
            onSelect={() => onObjectSelect?.({
              name: 'Earth',
              description: 'Mission origin. Select the destination body to explore its mission orbit.',
            })}
          />
          <EarthAtmosphere position={originEarthPosition} />
        </>
      )}
      <Planet
        type={planetType}
        onSelect={() => onObjectSelect?.({
          name: planetType,
          description: `${planetType} is the selected mission destination. The spacecraft orbit and telemetry replay are shown around this body.`,
        })}
      />

      {/* ── Atmospheric glow (Earth only) ────────────────────────────────── */}
      {planetType === 'Earth' && <EarthAtmosphere />}

      {/* ── Spacecraft orbit trajectory ──────────────────────────────────── */}
      {showTrajectory && (
        <TrajectoryLine points={trajectoryPoints} progress={progress} />
      )}

      {/* ── Spacecraft ───────────────────────────────────────────────────── */}
      <Spacecraft
        trajectoryPosition={trajectorySample.position}
        trajectoryDirection={trajectorySample.direction}
        positionRef={spacecraftPositionRef}
        isThrusting={isThrusting}
        onSelect={() => onObjectSelect?.({
          name: 'Mission spacecraft',
          description: 'Mission telemetry is shown below. The displayed orbit is an illustrative scene path because the simulation does not provide spacecraft coordinates or velocity.',
        })}
      />

      {/* ── Camera controls ──────────────────────────────────────────────── */}
      <SceneControls
        follow={followSpacecraft}
        followTargetRef={spacecraftPositionRef}
        target={target}
        viewpoint={viewpoint}
        zoomLevel={zoomLevel}
      />

    </>
  );
}
