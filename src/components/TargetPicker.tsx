import { TARGETS, isTargetUnlocked, previousLevel } from "../data";
import { useGame } from "../store/useGame";

export function TargetPicker() {
  const { state, dispatch } = useGame();
  const allOpen = TARGETS.every((t) => isTargetUnlocked(state.completed, t.id));
  return (
    <section>
      <h2>1. Choose your target</h2>
      <p className="hint">Finish a level to unlock the next one.</p>
      <div className="cards">
        {TARGETS.map((t) => {
          const open = isTargetUnlocked(state.completed, t.id);
          const prev = previousLevel(t.id);
          const prevName = TARGETS.find((x) => x.id === prev)?.name;
          const done = state.completed.includes(t.id);
          return (
            <button key={t.id} type="button" disabled={!open}
              className={state.design.target === t.id ? "card selected" : "card"}
              onClick={() => dispatch({ type: "SET_TARGET", target: t.id })}>
              <strong>{t.name}{done ? " ✓" : ""}</strong>
              <span>{t.description}</span>
              {!open && <span className="locked">Locked: finish {prevName} first</span>}
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
