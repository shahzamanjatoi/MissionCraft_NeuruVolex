import { TARGETS, isTargetUnlocked, previousLevel } from "../data";
import { requiredDeltaV } from "../engine/orbit";
import { useGame } from "../store/useGame";
import { CheckMark, LockIcon, PlanetIcon, SpecMeter, StepHead } from "./SpecParts";

const MAX_DV = requiredDeltaV("Mars");

export function TargetPicker() {
  const { state, dispatch } = useGame();
  const allOpen = TARGETS.every((t) => isTargetUnlocked(state.completed, t.id));
  return (
    <section>
      <StepHead n={1} title="Choose your target" hint="Clear a level to unlock the next, each destination demands more delta-v." />
      <div className="cards">
        {TARGETS.map((t) => {
          const open = isTargetUnlocked(state.completed, t.id);
          const prev = previousLevel(t.id);
          const prevName = TARGETS.find((x) => x.id === prev)?.name;
          const done = state.completed.includes(t.id);
          const dv = requiredDeltaV(t.id);
          return (
            <button key={t.id} type="button" disabled={!open} data-target={t.id} aria-pressed={state.design.target === t.id}
              className={`${state.design.target === t.id ? "card selected" : "card"} spec-card`}
              onClick={() => dispatch({ type: "SET_TARGET", target: t.id })}>
              <span className="spec-card__top">
                <PlanetIcon target={t.id} />
                <span className="spec-card__badges">
                  <span className="badge badge--cost mono">{Math.round(dv).toLocaleString("en-US")} m/s</span>
                  {done && <span className="badge badge--ok">✓ Cleared</span>}
                </span>
              </span>
              {state.design.target === t.id && open && <CheckMark />}
              <strong className="spec-card__title">{t.name}</strong>
              <span className="spec-card__desc">{t.description}</span>
              <SpecMeter label="Delta-v difficulty" value={dv / MAX_DV} text={dv === 0 ? "baseline" : `${Math.round((dv / MAX_DV) * 100)}%`} />
              {!open && (
                <span className="locked sim-locked"><LockIcon /> Finish {prevName} to unlock</span>
              )}
            </button>
          );
        })}
      </div>
      {!allOpen && (
        <button type="button" className="link" onClick={() => dispatch({ type: "UNLOCK_ALL" })}>
          Demo mode: unlock all levels
        </button>
      )}
    </section>
  );
}