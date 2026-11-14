import { useGame } from "../store/useGame";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const GAUGE_R = 52;
const GAUGE_C = 2 * Math.PI * GAUGE_R;

type Tone = "ok" | "warn" | "bad";

function Row({ label, value, ok, fill, tone }: { label: string; value: string; ok: boolean; fill?: number; tone?: Tone }) {
  const t: Tone = tone ?? (ok ? "ok" : "bad");
  return (
    <li className={ok ? "row ok" : "row bad"}>
      <span>{label}</span>
      <strong>{value}</strong>
      <span className="chip"><i aria-hidden="true" />{ok ? "OK" : "FAIL"}</span>
      {fill !== undefined && (
        <span className={`row-bar row-bar--${t}`} aria-hidden="true">
          <i style={{ width: `${Math.round(clamp01(fill) * 100)}%` }} />
        </span>
      )}
    </li>
  );
}

const marginTone = (m: number): Tone => (m < 0 ? "bad" : m < 0.1 ? "warn" : "ok");

export function ScoreBoard() {
  const { result: r } = useGame();
  const score = Math.min(100, Math.max(0, r.score));
  const dvFill = r.deltaVRequired_ms > 0 ? r.deltaVAvailable_ms / r.deltaVRequired_ms : 1;
  return (
    <aside className="scoreboard" aria-label="Live mission check">
      <h2>Live check</h2>
      <div className={`gauge ${r.feasible ? "good" : "bad"}`}>
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="gauge__track" cx="60" cy="60" r={GAUGE_R} />
          <circle className="gauge__fill" cx="60" cy="60" r={GAUGE_R}
            strokeDasharray={GAUGE_C} strokeDashoffset={GAUGE_C * (1 - score / 100)} />
        </svg>
        <div className={r.feasible ? "score good" : "score bad"}>{r.score}<small>/100</small></div>
      </div>
      <ul>
        <Row label="Delta-v" ok={r.deltaVAvailable_ms >= r.deltaVRequired_ms} fill={dvFill}
          value={`${Math.round(r.deltaVAvailable_ms)} / ${Math.round(r.deltaVRequired_ms)} m/s`} />
        <Row label="Mass margin" ok={r.massMargin >= 0} fill={r.massMargin >= 0 ? Math.max(r.massMargin, 0.04) : 0}
          tone={marginTone(r.massMargin)} value={`${(r.massMargin * 100).toFixed(0)}%`} />
        <Row label="Power margin" ok={r.powerMargin >= 0} fill={r.powerMargin >= 0 ? Math.max(r.powerMargin, 0.04) : 0}
          tone={marginTone(r.powerMargin)} value={`${(r.powerMargin * 100).toFixed(0)}%`} />
        <Row label="Comms link" ok={r.commsOk} fill={r.commsOk ? 1 : 0.22} value={r.commsOk ? "Strong" : "Weak"} />
        <li className="row"><span>Cost</span><strong>${r.cost_musd}M</strong><span /></li>
      </ul>
      {r.warnings.length > 0 && (
        <ul className="warnings">{r.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
      )}
    </aside>
  );
}