import { LAUNCH_VEHICLES } from "../data";
import { useGame } from "../store/useGame";

export function RocketPicker() {
  const { state, dispatch } = useGame();
  return (
    <section>
      <h2>2. Pick your rocket</h2>
      <div className="cards">
        {LAUNCH_VEHICLES.map((v) => (
          <button key={v.name} type="button"
            className={state.design.launchVehicle.name === v.name ? "card selected" : "card"}
            onClick={() => dispatch({ type: "SET_LAUNCHER", launchVehicle: v })}>
            <strong>{v.name}</strong>
            <span>Carries {v.payloadToLEO_kg.toLocaleString()} kg to orbit</span>
            <span>Costs ${v.cost_musd}M</span>
          </button>
        ))}
      </div>
    </section>
  );
}
