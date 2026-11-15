import { lazy, Suspense } from "react";
import { LAUNCH_VEHICLES } from "../data";
import { wetMass } from "../engine/mass";
import { powerBudget } from "../engine/power";
import { useGame } from "../store/useGame";
import type { Quality } from "./Scene3D";

const LaunchPad3D = lazy(() => import("./Scene3D").then((m) => ({ default: m.LaunchPad3D })));

export function LaunchPhase({ quality, onBack, onLaunch }: { quality: Quality; onBack: () => void; onLaunch: () => void }) {
  const { state, result: r } = useGame();
  const d = state.design;
  const s = d.spacecraft;
  const wet = Math.round(wetMass(s));
  const limit = d.launchVehicle.payloadToLEO_kg;
  const pw = powerBudget(s, d.target);
  const tier = Math.min(Math.max(LAUNCH_VEHICLES.findIndex((v) => v.name === d.launchVehicle.name), 0), 2) as 0 | 1 | 2;

  const rows = [
    { label: "Mass", go: r.massMargin >= 0, detail: `${wet.toLocaleString("en-US")} / ${limit.toLocaleString("en-US")} kg` },
    { label: "Power", go: r.powerMargin >= 0, detail: `${Math.round(pw.generated_W)} / ${Math.round(pw.load_W)} W` },
    { label: "Δv", go: r.deltaVAvailable_ms >= r.deltaVRequired_ms, detail: `${(r.deltaVAvailable_ms / 1000).toFixed(2)} / ${(r.deltaVRequired_ms / 1000).toFixed(2)} km/s` },
    { label: "Comms", go: r.commsOk, detail: r.commsOk ? "Link strong" : "Link weak" },
  ];
  const blocked = r.massMargin < 0;
  const allGo = rows.every((x) => x.go);

  return (
    <div className="pad">
      <div className="pad__main">
        <div className="pad__title">
          <h2>{d.launchVehicle.name} on the pad</h2>
          <span className="mono">
            {wet.toLocaleString("en-US")} kg · limit {limit.toLocaleString("en-US")} kg · Δv {(r.deltaVAvailable_ms / 1000).toFixed(2)} km/s
          </span>
        </div>
        <div className="viewer__stage viewer__stage--pad">
          <Suspense fallback={<div className="viewer__fail">Loading launch pad…</div>}>
            <LaunchPad3D tier={tier} quality={quality} />
          </Suspense>
        </div>
      </div>

      <aside className="pad__side">
        <div className="gng">
          <div className="gng__head">
            <strong>GO / NO-GO</strong>
            <span className={allGo ? "mono tone-ok" : "mono tone-bad"}>{allGo ? "ALL STATIONS GO" : "NOT READY"}</span>
          </div>
          <ul>
            {rows.map((x) => (
              <li key={x.label} className={x.go ? "go" : "nogo"}>
                <span>{x.label}</span>
                <small className="mono">{x.detail}</small>
                <b className="mono">{x.go ? "GO" : "NO-GO"}</b>
              </li>
            ))}
            <li className="info">
              <span>Cost</span>
              <small className="mono">mission total</small>
              <b className="mono">${r.cost_musd}M</b>
            </li>
          </ul>
        </div>

        {blocked ? (
          <p className="gate gate--bad">The vehicle cannot leave the pad. Drop mass or move up to a larger launcher.</p>
        ) : !allGo ? (
          <p className="gate gate--warn">Not every station is GO. You may still launch, but expect the mission to struggle.</p>
        ) : (
          <p className="gate gate--ok">All stations are GO. Ready for countdown.</p>
        )}

        <div className="pad__actions">
          <button type="button" className="sim-btn sim-btn--ghost" onClick={onBack}>
            Back to design
          </button>
          <button type="button" className="sim-btn sim-btn--launch" disabled={blocked} onClick={onLaunch}>
            {allGo ? "Begin countdown" : "Launch anyway"}
          </button>
        </div>
      </aside>
    </div>
  );
}
