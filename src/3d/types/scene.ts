import type { MissionTelemetryRecord } from '../../simulation/missionTelemetry';
import type { MissionPhase } from '../../types/simulation';
import type { MissionDesign } from '../../types/mission';

// ─── Target Types ────────────────────────────────────────────────────────────

export type SceneTarget = MissionDesign['target'];

export type PlanetType = 'Earth' | 'Moon' | 'Mars';

// ─── Camera ──────────────────────────────────────────────────────────────────

export type CameraMode = 'free' | 'follow' | 'overview';

// ─── Animation ───────────────────────────────────────────────────────────────

export interface AnimationFrame {
  /** Index into telemetry[] array */
  frameIndex: number;
  /** Current telemetry snapshot (null before first frame) */
  telemetry: MissionTelemetryRecord | null;
  /** Current mission phase label */
  phase: MissionPhase;
  /** 0–1 progress through total telemetry history */
  progress: number;
}

// ─── Scene Config ─────────────────────────────────────────────────────────────

export interface SceneConfig {
  target: SceneTarget;
  showTrajectory: boolean;
  showHUD: boolean;
  cameraMode: CameraMode;
}

// ─── Planet Config ────────────────────────────────────────────────────────────

export interface PlanetConfig {
  radius: number;
  textureUrl: string | null;
  roughness: number;
  metalness: number;
  atmosphereColor?: string;
  atmosphereOpacity?: number;
}
