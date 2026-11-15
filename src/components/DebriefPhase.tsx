import { TARGETS, nextLevel } from "../data";
import { wetMass } from "../engine/mass";
import type { MissionRunOutput } from "../simulation/missionRunner";
import { useGame } from "../store/useGame";

function grade(score: number, outcome: "success" | "partial" | "failure"): string {
  const base = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : score >= 40 ? "D" : "F";
  if (outcome === "failure") return "F";
  if (outcome === "partial" && (base === "A" || base === "B")) return "C";
  return base;
}

export function DebriefPhase({
  simulation,
  onReplay,
  onRedesign,
  onNextMission,
}: {
  simulation: MissionRunOutput;
  onReplay: () => void;
  onRedesign: () => void;
  onNextMission: (target: (typeof TARGETS)[number]["id"]) => void;
}) {
  const { state, result: r } = useGame();
  const sum = simulation.summary;
  const outcome = sum.outcome;
  const g = grade(r.score, outcome);
  const stars = outcome === "success" ? (r.score >= 90 ? 3 : r.score >= 70 ? 2 : 1) : outcome === "partial" ? 1 : 0;
  const title = outcome === "success" ? "Mission success" : outcome === "partial" ? "Partial success" : "Mission ended";
  const tone = outcome === "success" ? "ok" : outcome === "partial" ? "warn" : "bad";
  const d = state.design;
  const next = nextLevel(d.target);
  const nextName = TARGETS.find((t) => t.id === next)?.name;
  const cleared = state.completed.includes(d.target);
  const targetName = TARGETS.find((t) => t.id === d.target)?.name ?? d.target;
  const returned = sum.scienceDataReturnedMB;
  const generated = sum.scienceDataGeneratedMB;

  return (
    <div className="deb">
      <div className="deb__main">
        <p className="deb__kicker mono">Mission 0{TARGETS.findIndex((t) => t.id === d.target) + 1} · {targetName} · debrief</p>
        <h2 className={`deb__title tone-${tone}`}>{title}</h2>

        <div className="deb__stars" role="img" aria-label={`${stars} of 3 stars`}>
          {[0, 1, 2].map((n) => (
            <svg key={n} viewBox="0 0 24 24" className={n < stars ? "on" : ""} style={{ animationDelay: `${n * 220 + 250}ms` }}>
              <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" />
            </svg>
          ))}
        </div>

        <div className="deb__score">
          <div>
            <small className="mono">SCORE</small>
            <strong className="mono">{r.score}</strong>
          </div>
          <div className={`deb__grade tone-${tone}`}>
            <small className="mono">GRADE</small>
            <strong>{g}</strong>
          </div>
        </div>

        <div className="deb__chips">
          {cleared && <span className="chip-ok">Level cleared</span>}
          {cleared && next && <span className="chip-ok">{nextName} unlocked</span>}
          {!cleared && <span className="chip-warn">Level not cleared. Redesign and try again.</span>}
        </div>

        {sum.failureReasons.length > 0 && (
          <ul className="deb__reasons">
            {sum.failureReasons.map((x, i) => (
              <li key={`${x}-${i}`}>{x}</li>
            ))}
          </ul>
        )}

        <div className="deb__actions">
          <button type="button" className="sim-btn sim-btn--next" onClick={onReplay}>
            Replay flight
          </button>
          <button type="button" className="sim-btn sim-btn--ghost" onClick={onRedesign}>
            Redesign
          </button>
          {cleared && next && (
            <button type="button" className="sim-btn sim-btn--launch" onClick={() => onNextMission(next)}>
              Next mission: {nextName}
            </button>
          )}
        </div>
      </div>

      <aside className="deb__side">
        <dl className="deb__table">
          <div><dt>Mission outcome</dt><dd className={`tone-${tone}`}>{outcome === "success" ? "Orbit achieved" : outcome === "partial" ? "Partial return" : "No orbit achieved"}</dd></div>
          <div><dt>Final phase</dt><dd className="mono">{sum.phaseReached}</dd></div>
          <div><dt>Launcher</dt><dd>{d.launchVehicle.name}</dd></div>
          <div><dt>Wet mass</dt><dd className="mono">{Math.round(wetMass(d.spacecraft)).toLocaleString("en-US")} kg</dd></div>
          <div><dt>Δv available</dt><dd className="mono">{(r.deltaVAvailable_ms / 1000).toFixed(2)} km/s</dd></div>
          <div><dt>Instruments</dt><dd className="mono">{d.spacecraft.instruments.length}</dd></div>
          <div><dt>Science generated</dt><dd className="mono">{generated.toFixed(1)} MB</dd></div>
          <div><dt>Science returned</dt><dd className="mono">{returned.toFixed(1)} MB</dd></div>
          <div><dt>Battery at end</dt><dd className="mono">{Math.round(simulation.finalState.batteryWh)} Wh</dd></div>
          <div><dt>Mission cost</dt><dd className="mono">${r.cost_musd}M</dd></div>
        </dl>
      </aside>
    </div>
  );
}
