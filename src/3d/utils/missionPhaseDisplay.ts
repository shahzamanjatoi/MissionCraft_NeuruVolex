import type { MissionPhase } from '../../types/simulation';
import type { MissionTelemetryRecord } from '../../simulation/missionTelemetry';

export interface MissionPhaseSegment {
  phase: MissionPhase;
  startIndex: number;
  endIndex: number;
}

export function getMissionPhaseSegments(
  telemetry: readonly Pick<MissionTelemetryRecord, 'phase'>[],
): MissionPhaseSegment[] {
  return telemetry.reduce<MissionPhaseSegment[]>((segments, frame, index) => {
    const currentSegment = segments[segments.length - 1];
    if (currentSegment?.phase === frame.phase) {
      currentSegment.endIndex = index;
    } else {
      segments.push({ phase: frame.phase, startIndex: index, endIndex: index });
    }
    return segments;
  }, []);
}

export const MISSION_PHASE_LABELS: Record<MissionPhase, string> = {
  launch: 'Launch',
  deployment: 'Deployment',
  transfer: 'Transfer burn',
  arrival: 'Arrival',
  operations: 'Science operations',
  communication: 'Communications',
  completed: 'Mission complete',
  failed: 'Mission failed',
};

export const MISSION_PHASE_COLORS: Record<MissionPhase, string> = {
  launch: '#facc15',
  deployment: '#a78bfa',
  transfer: '#38bdf8',
  arrival: '#34d399',
  operations: '#4ade80',
  communication: '#60a5fa',
  completed: '#22d3ee',
  failed: '#f87171',
};
