import type { Quality } from "./Scene3D";

export type Phase = "design" | "launch" | "flight" | "debrief";
export const PHASES: { id: Phase; label: string }[] = [
  { id: "design", label: "Design" },
  { id: "launch", label: "Launch" },
  { id: "flight", label: "Flight" },
  { id: "debrief", label: "Debrief" },
];

export function PhaseBar({
  phase,
  maxIdx,
  rank,
  quality,
  volume,
  onSelect,
  onQuality,
  onVolume,
}: {
  phase: Phase;
  maxIdx: number;
  rank: string;
  quality: Quality;
  volume: number;
  onSelect: (p: Phase) => void;
  onQuality: (q: Quality) => void;
  onVolume: (v: number) => void;
}) {
  return (
    <div className="deck">
      <div className="container deck__in">
        <div className="deck__left">
          <span className="deck__dot" aria-hidden="true" />
          <strong>Mission Simulator</strong>
          <span className="deck__rank mono">{rank}</span>
        </div>

        <nav className="deck__tabs" aria-label="Mission phases">
          {PHASES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              disabled={i > maxIdx}
              aria-current={p.id === phase ? "step" : undefined}
              className={p.id === phase ? "is-active" : ""}
              onClick={() => onSelect(p.id)}
            >
              <span className="mono">0{i + 1}</span> {p.label}
            </button>
          ))}
        </nav>

        <div className="deck__right">
          <div className="seg" role="group" aria-label="Graphics quality">
            <span className="mono">Graphics</span>
            <button type="button" aria-pressed={quality === "high"} onClick={() => onQuality("high")}>High</button>
            <button type="button" aria-pressed={quality === "low"} onClick={() => onQuality("low")}>Low</button>
          </div>
          <label className="vol">
            <span className="mono">{volume === 0 ? "Muted" : "Sound"}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              aria-label="Sound volume"
              onChange={(e) => onVolume(Number(e.target.value) / 100)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
