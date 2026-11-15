import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { MissionScene } from '../scenes/MissionScene';
import { TelemetryOverlay } from './TelemetryOverlay';
import { MissionTimeline } from './MissionTimeline';
import { useMissionScene } from '../hooks/useMissionScene';
import { CAMERA_PRESETS } from '../utils/sceneConstants';
import type { SceneTarget } from '../types/scene';
import type { MissionRunOutput } from '../../simulation/missionRunner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SceneCanvasProps {
  target: SceneTarget;
  simulation: MissionRunOutput | null;
  targetName: string;
  batteryCapacityWh: number;
}

// ─── Loading fallback rendered inside the Canvas ──────────────────────────────

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 8]} />
      <meshBasicMaterial color={0x334466} wireframe />
    </mesh>
  );
}

// ─── Error boundary (class component required by React) ──────────────────────

import { Component, type ReactNode } from 'react';

interface EBProps   { children: ReactNode }
interface EBState   { error: Error | null }

class CanvasErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { error };
  }
  override render() {
    if (this.state.error) {
      return (
        <div className="scene-error">
          <span>⚠️ 3D scene failed to load</span>
          <small>{this.state.error.message}</small>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main exported component ──────────────────────────────────────────────────

/**
 * SceneCanvas — the top-level 3D visualization component.
 *
 * Usage inside Results.tsx:
 *   <SceneCanvas target={state.design.target} simulation={simulation} targetName="Mars" />
 *
 * Renders:
 *  • R3F <Canvas> with ACES filmic tone mapping + shadow support
 *  • Full MissionScene (planet, spacecraft, trajectory, stars, lighting)
 *  • TelemetryOverlay HTML HUD
 *  • MissionTimeline playback controls
 */
export function SceneCanvas({
  target,
  simulation,
  targetName,
  batteryCapacityWh,
}: SceneCanvasProps) {
  const scene = useMissionScene(simulation);
  const camPos = CAMERA_PRESETS[target];
  const [selectedObject, setSelectedObject] = useState<{
    name: string;
    description: string;
  } | null>(null);

  // isThrusting: true during launch / transfer phases
  const isThrusting =
    scene.animFrame.phase === 'launch' ||
    scene.animFrame.phase === 'transfer';

  return (
    <div className="scene-layout">
      <div className="scene-container">
        <CanvasErrorBoundary>
          <Canvas
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
              outputColorSpace: THREE.SRGBColorSpace,
            }}
            camera={{
              position: camPos,
              fov: 50,
              near: 0.1,
              far: 500,
            }}
            dpr={[1, 2]}
            shadows
            style={{ width: '100%', height: '100%', background: '#00000a' }}
          >
            <Suspense fallback={<LoadingFallback />}>
              <MissionScene
                target={target}
                progress={scene.animFrame.progress}
                isThrusting={isThrusting}
                showTrajectory
                onObjectSelect={setSelectedObject}
              />
            </Suspense>
          </Canvas>

          <TelemetryOverlay
            animFrame={scene.animFrame}
            targetName={targetName}
            batteryCapacityWh={batteryCapacityWh}
          />
          {selectedObject && (
            <aside className="scene-object-card" aria-live="polite">
              <button
                type="button"
                className="scene-object-card__close"
                onClick={() => setSelectedObject(null)}
                aria-label="Close object details"
              >
                ×
              </button>
              <span className="scene-hud__label">SELECTED OBJECT</span>
              <strong>{selectedObject.name}</strong>
              <p>{selectedObject.description}</p>
            </aside>
          )}
        </CanvasErrorBoundary>
      </div>

      <MissionTimeline
        frameIndex={scene.frameIndex}
        totalFrames={scene.totalFrames}
        isPlaying={scene.isPlaying}
        currentPhase={scene.animFrame.phase}
        play={scene.play}
        pause={scene.pause}
        reset={scene.reset}
        seekTo={scene.seekTo}
      />
    </div>
  );
}
