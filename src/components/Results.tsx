import { TARGETS, nextLevel } from "../data";
import { matchRealMission } from "../engine/matchMission";
import { useGame } from "../store/useGame";

export function Results() {
  const { result: r, state, dispatch } = useGame();
  const match = matchRealMission(state.design);
  const next = nextLevel(state.design.target);
  const nextName = TARGETS.find((t) => t.id === next)?.name;
  const size =
    match.massRatio >= 1 ? `${match.massRatio.toFixed(1)}x as heavy as` : `${(1 / match.massRatio).toFixed(1)}x lighter than`;
  return (
    <section>
      <h2>Mission result</h2>
      <p className={r.feasible ? "verdict good" : "verdict bad"}>
        {r.feasible ? "Mission success! Your design is feasible." : "Mission failed. Your design has problems."}
      </p>
      <p>Target: <strong>{state.design.target}</strong> · Score: <strong>{r.score}/100</strong> · Cost: <strong>${r.cost_musd}M</strong></p>
      {r.feasible && nextName && <p className="unlocked">Level unlocked: {nextName}!</p>}
      {r.warnings.length > 0 ? (
        <>
          <h3>What went wrong</h3>
          <ul>{r.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
        </>
      ) : (
        <p>All checks passed: delta-v, mass, power, battery and communications.</p>
      )}
      <div className="match">
        <h3>Your design is most like a real mission</h3>
        <strong>{match.mission.name}</strong>
        <p>{match.mission.summary}</p>
        <p className="hint">Your spacecraft is about {size} it at launch.</p>
      </div>
      <button type="button" className="primary" onClick={() => dispatch({ type: "RESET" })}>
        {r.feasible && nextName ? "Next level" : "Play again"}
      </button>
    </section>
  );
}
