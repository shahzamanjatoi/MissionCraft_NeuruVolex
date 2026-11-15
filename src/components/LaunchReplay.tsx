
import { useEffect, useState } from "react";
import { useGame } from "../store/useGame";
import type { MissionEventType, MissionPhase } from "../types/simulation";

const STEP_MS = 120;

const PHASE_LABEL: Record<MissionPhase, string> = {
  launch: "Launch",
  deployment: "Deployment",
  transfer: "Transfer",
  arrival: "Arrival",
  operations: "Science operations",
  communication: "Sending data to Earth",
  completed: "Mission complete",
  failed: "Mission failed",
};

const EVENT_LABEL: Record<MissionEventType, string> = {
  "eclipse-start": "Entered Earth's shadow (no solar power)",
  "eclipse-end": "Back in sunlight",
  "communication-loss": "Radio link to Earth lost",
  "communication-restored": "Radio link restored",
};

const OUTCOME_LABEL = {
  success: "Success",
  partial: "Partial success",
  failure: "Failure",
} as const;

const W = 600;
const H = 120;

export function LaunchReplay() {
  // Use the SAME simulation that Results.tsx receives from GameProvider.
  const { simulation: run } = useGame();

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const last = Math.max(0, (run?.telemetry.length ?? 0) - 1);

  const missionSeconds =
    run?.telemetry[last]?.elapsedSeconds ?? 86400;

  // Reset the replay whenever a new mission simulation is supplied.
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [run]);

  // Advance the replay while it is playing.
  useEffect(() => {
    if (!playing || !run || last === 0) return;

    const id = setInterval(() => {
      setIndex((i) => Math.min(i + 1, last));
    }, STEP_MS);

    return () => clearInterval(id);
  }, [playing, last, run]);

  // The simulation may not be available yet.
  if (!run || run.telemetry.length === 0) return null;

  const finished = index >= last;
  const running = playing && !finished;

  const frame = run.telemetry[Math.min(index, last)];

  const maxBattery = Math.max(
    1,
    ...run.telemetry.map((t) => t.batteryWh),
  );

  const x = (seconds: number) =>
    (seconds / Math.max(1, missionSeconds)) * W;

  const y = (wh: number) =>
    H - (wh / maxBattery) * (H - 8) - 4;

  const line = run.telemetry
    .map(
      (t) =>
        `${x(t.elapsedSeconds).toFixed(1)},${y(t.batteryWh).toFixed(1)}`,
    )
    .join(" ");

  const eclipse = run.events.find(
    (e) => e.type === "eclipse-start",
  );

  const commLoss = run.events.find(
    (e) => e.type === "communication-loss",
  );

  function play() {
    if (finished) setIndex(0);
    setPlaying(true);
  }

  return (
    <section className="replay">
      <h3>Mission replay</h3>

      <p className="replay-note">
        One simulated day after launch. Press play to watch your spacecraft.
      </p>

      <div className="replay-controls">
        <button
          type="button"
          className="primary"
          onClick={running ? () => setPlaying(false) : play}
        >
          {running ? "Pause" : finished ? "Replay" : "Play"}
        </button>

        <input
          type="range"
          min={0}
          max={last}
          value={Math.min(index, last)}
          onChange={(e) => {
            setPlaying(false);
            setIndex(Number(e.target.value));
          }}
          aria-label="Mission time"
        />

        <span>
          Hour {(frame.elapsedSeconds / 3600).toFixed(1)} of{" "}
          {(missionSeconds / 3600).toFixed(1)}
        </span>
      </div>

      <p
        className={
          frame.phase === "failed" ? "verdict bad" : "verdict good"
        }
      >
        {PHASE_LABEL[frame.phase]}
      </p>

      <div className="replay-stats">
        <div>
          <span>Battery</span>
          <strong>{frame.batteryWh.toFixed(0)} Wh</strong>
        </div>

        <div>
          <span>Solar power</span>
          <strong>{frame.solarGenerationW.toFixed(0)} W</strong>
        </div>

        <div>
          <span>Power use</span>
          <strong>{frame.loadW.toFixed(0)} W</strong>
        </div>

        <div>
          <span>Data returned</span>
          <strong>{frame.dataTransmittedMB.toFixed(1)} MB</strong>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="replay-chart"
        role="img"
        aria-label="Battery charge over the mission"
      >
        {eclipse && (
          <rect
            x={x(eclipse.missionTimeSeconds)}
            y={0}
            width={x(eclipse.durationSeconds ?? 0)}
            height={H}
            className="replay-eclipse"
          />
        )}

        {commLoss && (
          <rect
            x={x(commLoss.missionTimeSeconds)}
            y={0}
            width={x(commLoss.durationSeconds ?? 0)}
            height={H}
            className="replay-commloss"
          />
        )}

        <polyline
          points={line}
          className="replay-line"
          fill="none"
        />

        <line
          x1={x(frame.elapsedSeconds)}
          x2={x(frame.elapsedSeconds)}
          y1={0}
          y2={H}
          className="replay-cursor"
        />
      </svg>

      <p className="replay-legend">
        Line: battery charge. Blue band: Earth's shadow.
        Orange band: radio link lost.
      </p>

      <h4>What happened</h4>

      <ul className="replay-events">
        {run.events.map((e) => (
          <li
            key={e.id}
            className={
              e.missionTimeSeconds <= frame.elapsedSeconds ? "done" : ""
            }
          >
            Hour {(e.missionTimeSeconds / 3600).toFixed(1)}:{" "}
            {EVENT_LABEL[e.type]}
          </li>
        ))}
      </ul>

      {finished && (
        <div className="replay-summary">
          <p>
            Replay result:{" "}
            <strong>{OUTCOME_LABEL[run.summary.outcome]}</strong>
            {" · "}Science data made{" "}
            <strong>
              {run.summary.scienceDataGeneratedMB.toFixed(0)} MB
            </strong>
            , sent home{" "}
            <strong>
              {run.summary.scienceDataReturnedMB.toFixed(0)} MB
            </strong>
          </p>

          {run.summary.failureReasons.length > 0 && (
            <ul>
              {run.summary.failureReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
