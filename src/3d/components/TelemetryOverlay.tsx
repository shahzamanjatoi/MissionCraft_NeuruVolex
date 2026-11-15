import type { AnimationFrame } from '../types/scene';
import type { MissionPhase } from '../../types/simulation';

const PHASE_LABEL: Record<MissionPhase, string> = {
  launch:        '🚀 Launch',
  deployment:    '📡 Deployment',
  transfer:      '↗ Transfer Burn',
  arrival:       '🛬 Arrival',
  operations:    '🔭 Science Operations',
  communication: '📶 Downlinking Data',
  completed:     '✅ Mission Complete',
  failed:        '❌ Mission Failed',
};

interface TelemetryOverlayProps {
  animFrame: AnimationFrame;
  targetName: string;
  batteryCapacityWh: number;
}

/** HTML overlay rendered above the WebGL canvas showing live telemetry. */
export function TelemetryOverlay({
  animFrame,
  targetName,
  batteryCapacityWh,
}: TelemetryOverlayProps) {
  const tel = animFrame.telemetry;

  const batteryPct = tel
    ? Math.round((tel.batteryWh / Math.max(1, batteryCapacityWh)) * 100)
    : null;
  const hours = tel ? (tel.elapsedSeconds / 3600).toFixed(1) : '—';

  const phaseOk = animFrame.phase !== 'failed';

  return (
    <div className="scene-hud">
      {/* Target badge */}
      <div className="scene-hud__target">
        <span className="scene-hud__label">TARGET</span>
        <span className="scene-hud__value">{targetName}</span>
      </div>

      {/* Phase */}
      <div className={`scene-hud__phase ${phaseOk ? '' : 'scene-hud__phase--fail'}`}>
        {PHASE_LABEL[animFrame.phase]}
      </div>

      {/* Telemetry grid */}
      {tel && (
        <div className="scene-hud__grid">
          <div className="scene-hud__cell">
            <span>Elapsed</span>
            <strong>{hours} h</strong>
          </div>
          <div className="scene-hud__cell">
            <span>Battery</span>
            <strong>{tel.batteryWh.toFixed(0)} Wh</strong>
          </div>
          <div className="scene-hud__cell">
            <span>Solar</span>
            <strong>{tel.solarGenerationW.toFixed(0)} W</strong>
          </div>
          <div className="scene-hud__cell">
            <span>Comms</span>
            <strong className={tel.communicationAvailable ? 'hud-ok' : 'hud-warn'}>
              {tel.communicationAvailable ? 'NOMINAL' : 'LOST'}
            </strong>
          </div>
          <div className="scene-hud__cell">
            <span>Eclipse</span>
            <strong className={tel.inEclipse ? 'hud-warn' : 'hud-ok'}>
              {tel.inEclipse ? 'YES' : 'NO'}
            </strong>
          </div>
          <div className="scene-hud__cell">
            <span>Data Tx</span>
            <strong>{tel.dataTransmittedMB.toFixed(1)} MB</strong>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {tel && (
        <div className="scene-hud__progress">
          <div
            className="scene-hud__progress-bar"
            style={{ width: `${animFrame.progress * 100}%` }}
          />
        </div>
      )}

      {/* Controls hint */}
      <div className="scene-hud__hint">Drag to orbit · Right-drag to pan · Scroll to zoom</div>

      {/* Battery ring */}
      {batteryPct !== null && (
        <div className="scene-hud__battery">
          <svg viewBox="0 0 36 36" className="scene-hud__battery-ring">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
            <circle
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={tel && tel.batteryWh > 100 ? '#22d3ee' : '#f97316'}
              strokeWidth="2.5"
              strokeDasharray={`${batteryPct} ${100 - batteryPct}`}
              strokeDashoffset="25"
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <span className="scene-hud__battery-pct">⚡</span>
        </div>
      )}
    </div>
  );
}
