import { LAUNCH_VEHICLES } from "../data";
import { useGame } from "../store/useGame";
import { CheckMark, RocketIcon, SpecMeter, StepHead } from "./SpecParts";

const MAX_PAYLOAD = Math.max(...LAUNCH_VEHICLES.map((v) => v.payloadToLEO_kg));

export function RocketPicker() {
  const { state, dispatch } = useGame();
  return (
    <section>
      <StepHead n={2} title="Pick your rocket" hint="Bigger rockets lift more mass but cost more of your budget." />
      <div className="cards">
        {LAUNCH_VEHICLES.map((v, i) => (
          <button key={v.name} type="button"
            className={`${state.design.launchVehicle.name === v.name ? "card selected" : "card"} spec-card`}
            onClick={() => dispatch({ type: "SET_LAUNCHER", launchVehicle: v })}>
            {state.design.launchVehicle.name === v.name && <CheckMark />}
            <span className="spec-card__top">
              <RocketIcon tier={Math.min(i, 2) as 0 | 1 | 2} />
              <span className="badge badge--cost mono">${v.cost_musd}M</span>
            </span>
            <strong className="spec-card__title">{v.name}</strong>
            <span className="spec-card__desc">
              Carries <b className="mono">{v.payloadToLEO_kg.toLocaleString()} kg</b> to orbit
            </span>
            <SpecMeter label="Payload to LEO" value={v.payloadToLEO_kg / MAX_PAYLOAD} text={`${v.payloadToLEO_kg.toLocaleString()} kg`} />
          </button>
        ))}
      </div>
    </section>
  );
}