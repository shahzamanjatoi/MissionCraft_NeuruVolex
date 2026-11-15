import type { MissionPhase } from '../../types/simulation';

interface MissionTimelineProps {
  frameIndex: number;
  totalFrames: number;
  isPlaying: boolean;
  currentPhase: MissionPhase;
  play: () => void;
  pause: () => void;
  reset: () => void;
  seekTo: (index: number) => void;
}

const PHASE_COLOR: Record<MissionPhase, string> = {
  launch:        '#facc15',
  deployment:    '#a78bfa',
  transfer:      '#38bdf8',
  arrival:       '#34d399',
  operations:    '#4ade80',
  communication: '#60a5fa',
  completed:     '#22d3ee',
  failed:        '#f87171',
};

/** Timeline scrubber below the 3D canvas for controlling mission playback. */
export function MissionTimeline({
  frameIndex,
  totalFrames,
  isPlaying,
  currentPhase,
  play,
  pause,
  reset,
  seekTo,
}: MissionTimelineProps) {
  const finished = frameIndex >= totalFrames - 1;

  return (
    <div className="scene-timeline">
      {/* Buttons */}
      <div className="scene-timeline__buttons">
        <button
          type="button"
          className="scene-timeline__btn"
          onClick={reset}
          title="Reset"
          aria-label="Reset to start"
        >
          ⟳
        </button>
        <button
          type="button"
          className={`scene-timeline__btn scene-timeline__btn--play ${isPlaying ? 'scene-timeline__btn--active' : ''}`}
          onClick={isPlaying ? pause : play}
          aria-label={isPlaying ? 'Pause' : finished ? 'Replay' : 'Play'}
        >
          {isPlaying ? '⏸' : finished ? '↺ Replay' : '▶ Play'}
        </button>
      </div>

      {/* Scrubber */}
      <div className="scene-timeline__scrubber">
        <input
          type="range"
          min={0}
          max={Math.max(0, totalFrames - 1)}
          value={frameIndex}
          onChange={(e) => seekTo(Number(e.target.value))}
          className="scene-timeline__range"
          style={{
            '--scrubber-color': PHASE_COLOR[currentPhase],
            '--scrubber-pct': `${totalFrames > 1 ? (frameIndex / (totalFrames - 1)) * 100 : 0}%`,
          } as React.CSSProperties}
          aria-label="Mission time scrubber"
        />
        <div className="scene-timeline__phase-pill" style={{ background: PHASE_COLOR[currentPhase] }}>
          {currentPhase.toUpperCase()}
        </div>
      </div>

      {/* Frame counter */}
      <div className="scene-timeline__counter">
        Frame {frameIndex + 1} / {totalFrames}
      </div>
    </div>
  );
}
