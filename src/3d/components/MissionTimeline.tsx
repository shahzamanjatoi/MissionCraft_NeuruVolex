import type { MissionPhase } from '../../types/simulation';
import type { MissionTelemetryRecord } from '../../simulation/missionTelemetry';
import {
  getMissionPhaseSegments,
  MISSION_PHASE_COLORS,
  MISSION_PHASE_LABELS,
} from '../utils/missionPhaseDisplay';
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from '../types/scene';

interface MissionTimelineProps {
  frameIndex: number;
  totalFrames: number;
  isPlaying: boolean;
  currentPhase: MissionPhase;
  telemetry: MissionTelemetryRecord[];
  playbackSpeed: PlaybackSpeed;
  play: () => void;
  pause: () => void;
  reset: () => void;
  seekTo: (index: number) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
}

/** Timeline scrubber below the 3D canvas for controlling mission playback. */
export function MissionTimeline({
  frameIndex,
  totalFrames,
  isPlaying,
  currentPhase,
  telemetry,
  playbackSpeed,
  play,
  pause,
  reset,
  seekTo,
  setPlaybackSpeed,
}: MissionTimelineProps) {
  const finished = frameIndex >= totalFrames - 1;
  const phaseSegments = getMissionPhaseSegments(telemetry);

  return (
    <div className="scene-timeline">
      <div className="scene-timeline__controls">
        <button
          type="button"
          className="scene-timeline__btn"
          onClick={reset}
          title="Restart mission"
          aria-label="Restart mission"
          disabled={totalFrames === 0}
        >
          ↺
        </button>
        <button
          type="button"
          className={`scene-timeline__btn scene-timeline__btn--play ${isPlaying ? 'scene-timeline__btn--active' : ''}`}
          onClick={isPlaying ? pause : play}
          aria-label={isPlaying ? 'Pause' : finished ? 'Replay' : 'Play'}
          disabled={totalFrames < 2}
        >
          {isPlaying ? 'Pause' : finished ? 'Replay' : 'Play'}
        </button>
        <label className="scene-timeline__speed">
          <span>Speed</span>
          <select
            aria-label="Playback speed"
            value={playbackSpeed}
            onChange={(event) => {
              const nextSpeed = PLAYBACK_SPEEDS.find(
                (speed) => String(speed) === event.target.value,
              );
              if (nextSpeed !== undefined) setPlaybackSpeed(nextSpeed);
            }}
          >
            {PLAYBACK_SPEEDS.map((speed) => (
              <option key={speed} value={speed}>{speed}×</option>
            ))}
          </select>
        </label>
      </div>

      <div className="scene-timeline__track">
        <div className="scene-timeline__phases" role="group" aria-label="Mission phases">
          {phaseSegments.map((segment) => {
            const frameCount = segment.endIndex - segment.startIndex + 1;
            const isCurrent = frameIndex >= segment.startIndex &&
              frameIndex <= segment.endIndex;
            const phaseLabel = MISSION_PHASE_LABELS[segment.phase];
            const phaseStartHours = (
              telemetry[segment.startIndex].elapsedSeconds / 3600
            ).toFixed(1);

            return (
              <button
                key={`${segment.phase}-${segment.startIndex}`}
                type="button"
                className="scene-timeline__phase-segment"
                style={{
                  flexGrow: frameCount,
                  '--phase-color': MISSION_PHASE_COLORS[segment.phase],
                } as React.CSSProperties}
                aria-label={`Jump to ${phaseLabel} phase`}
                aria-current={isCurrent ? 'step' : undefined}
                title={`${phaseLabel} · ${phaseStartHours} h`}
                onClick={() => seekTo(segment.startIndex)}
              >
                <span />
              </button>
            );
          })}
        </div>
        <div className="scene-timeline__scrubber">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalFrames - 1)}
            value={frameIndex}
            onChange={(event) => seekTo(Number(event.target.value))}
            className="scene-timeline__range"
            style={{
              '--scrubber-color': MISSION_PHASE_COLORS[currentPhase],
              '--scrubber-pct': `${totalFrames > 1 ? (frameIndex / (totalFrames - 1)) * 100 : 0}%`,
            } as React.CSSProperties}
            aria-label="Mission time scrubber"
            disabled={totalFrames < 2}
          />
          <div
            className="scene-timeline__phase-pill"
            style={{ '--phase-color': MISSION_PHASE_COLORS[currentPhase] } as React.CSSProperties}
          >
            {MISSION_PHASE_LABELS[currentPhase]}
          </div>
        </div>
      </div>

      <div className="scene-timeline__counter">
        {telemetry[frameIndex]
          ? `${(telemetry[frameIndex].elapsedSeconds / 3600).toFixed(1)} h`
          : 'No telemetry'}
        <span>Frame {totalFrames > 0 ? frameIndex + 1 : 0} / {totalFrames}</span>
      </div>
    </div>
  );
}
