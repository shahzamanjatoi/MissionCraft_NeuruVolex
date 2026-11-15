import { useGame } from "../store/useGame";

export function PreflightBoard() {
  const { result: r } = useGame();
  const checks = [
    { label: "Delta-v", go: r.deltaVAvailable_ms >= r.deltaVRequired_ms, detail: `${Math.round(r.deltaVAvailable_ms)} / ${Math.round(r.deltaVRequired_ms)} m/s` },
    { label: "Mass", go: r.massMargin >= 0, detail: `${(r.massMargin * 100).toFixed(0)}% margin` },
    { label: "Power", go: r.powerMargin >= 0, detail: `${(r.powerMargin * 100).toFixed(0)}% margin` },
    { label: "Comms", go: r.commsOk, detail: r.commsOk ? "Link strong" : "Link weak" },
  ];
  const allGo = checks.every((c) => c.go);
  return (
    <div className={allGo ? "sim-preflight is-go" : "sim-preflight is-hold"} role="status" aria-live="polite">
      <div className="sim-preflight__head">
        <strong>Pre-flight poll</strong>
        <span className="mono">{allGo ? "ALL STATIONS GO" : "HOLD: fix the red stations"}</span>
      </div>
      <ul>
        {checks.map((c) => (
          <li key={c.label} className={c.go ? "go" : "nogo"}>
            <i aria-hidden="true" />
            <span>{c.label}</span>
            <b className="mono">{c.go ? "GO" : "NO-GO"}</b>
            <small className="mono">{c.detail}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
