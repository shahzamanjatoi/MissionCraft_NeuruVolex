import { useGame } from "../store/useGame";

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <li className={ok ? "row ok" : "row bad"}>
      <span>{label}</span>
      <strong>{value}</strong>
      <span className="chip">{ok ? "OK" : "FAIL"}</span>
    </li>
  );
}

export function ScoreBoard() {
  const { result: r } = useGame();
  return (
    <aside className="scoreboard" aria-label="Live mission check">
      <h2>Live check</h2>
      <div className={r.feasible ? "score good" : "score bad"}>{r.score}<small>/100</small></div>
      <ul>
        <Row label="Delta-v" ok={r.deltaVAvailable_ms >= r.deltaVRequired_ms}
          value={`${Math.round(r.deltaVAvailable_ms)} / ${Math.round(r.deltaVRequired_ms)} m/s`} />
        <Row label="Mass margin" ok={r.massMargin >= 0} value={`${(r.massMargin * 100).toFixed(0)}%`} />
        <Row label="Power margin" ok={r.powerMargin >= 0} value={`${(r.powerMargin * 100).toFixed(0)}%`} />
        <Row label="Comms link" ok={r.commsOk} value={r.commsOk ? "Strong" : "Weak"} />
        <Row label="Thermal margin" ok={r.thermalOk} value={`${(r.thermalMargin * 100).toFixed(0)}%`} />
        <Row label="Mission risk" ok={r.riskLevel !== "high"}
          value={`${r.riskLevel[0].toUpperCase()}${r.riskLevel.slice(1)} (${Math.round(r.riskScore * 100)}/100)`} />
        <li className="row"><span>Cost</span><strong>${r.cost_musd}M</strong><span /></li>
      </ul>
      {r.warnings.length > 0 && (
        <ul className="warnings">{r.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
      )}
    </aside>
  );
}