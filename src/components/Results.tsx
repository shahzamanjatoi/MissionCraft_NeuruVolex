import { useGame } from "../store/useGame";

export function Results() {
  const { result: r, state, dispatch } = useGame();
  return (
    <section>
      <h2>Mission result</h2>
      <p className={r.feasible ? "verdict good" : "verdict bad"}>
        {r.feasible ? "Mission success! Your design is feasible." : "Mission failed. Your design has problems."}
      </p>
      <p>Target: <strong>{state.design.target}</strong> · Score: <strong>{r.score}/100</strong> · Cost: <strong>${r.cost_musd}M</strong></p>
      {r.warnings.length > 0 ? (
        <>
          <h3>What went wrong</h3>
          <ul>{r.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
        </>
      ) : (
        <p>All checks passed: delta-v, mass, power, battery and communications.</p>
      )}
      <button type="button" className="primary" onClick={() => dispatch({ type: "RESET" })}>Play again</button>
    </section>
  );
}
