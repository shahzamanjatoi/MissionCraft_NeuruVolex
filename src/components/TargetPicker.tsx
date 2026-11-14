import { TARGETS } from "../data";
import { useGame } from "../store/useGame";

export function TargetPicker() {
  const { state, dispatch } = useGame();
  return (
    <section>
      <h2>1. Choose your target</h2>
      <div className="cards">
        {TARGETS.map((t) => (
          <button key={t.id} type="button"
            className={state.design.target === t.id ? "card selected" : "card"}
            onClick={() => dispatch({ type: "SET_TARGET", target: t.id })}>
            <strong>{t.name}</strong>
            <span>{t.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
