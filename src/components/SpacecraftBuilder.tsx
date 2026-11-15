import type { CSSProperties } from "react";
import { ANTENNAS, ENGINES, INSTRUMENTS } from "../data";
import { useGame } from "../store/useGame";
import type { NumericField } from "../store/gameReducer";
import { SpecMeter } from "./SpecParts";

const SLIDERS: { field: NumericField; label: string; unit: string; min: number; max: number; step: number }[] = [
  { field: "dryMass_kg", label: "Spacecraft body mass", unit: "kg", min: 100, max: 2000, step: 50 },
  { field: "propellantMass_kg", label: "Propellant", unit: "kg", min: 0, max: 8000, step: 50 },
  { field: "solarArea_m2", label: "Solar panel area", unit: "m²", min: 0, max: 30, step: 1 },
  { field: "batteryWh", label: "Battery", unit: "Wh", min: 0, max: 2000, step: 50 },
];

const MAX_ISP = Math.max(...ENGINES.map((e) => e.isp_s));
const MAX_GAIN = Math.max(...ANTENNAS.map((a) => a.gain_dBi));

export function SpacecraftBuilder() {
  const { state, dispatch } = useGame();
  const s = state.design.spacecraft;
  return (
    <section>
      <h2 className="step-title">
        <span className="step-num mono">03</span> Design your spacecraft
      </h2>

      <h3>Engine</h3>
      <div className="cards">
        {ENGINES.map((e) => (
          <button key={e.id} type="button" className={`${s.isp_s === e.isp_s ? "card selected" : "card"} spec-card`}
            onClick={() => dispatch({ type: "SET_ISP", isp_s: e.isp_s })}>
            <strong className="spec-card__title">{e.name}</strong>
            <span className="spec-card__desc">{e.description}</span>
            <SpecMeter label="Efficiency (Isp)" value={e.isp_s / MAX_ISP} text={`${e.isp_s} s`} />
          </button>
        ))}
      </div>

      <h3>Antenna</h3>
      <div className="cards">
        {ANTENNAS.map((a) => (
          <button key={a.id} type="button" className={`${s.antennaGain_dBi === a.gain_dBi ? "card selected" : "card"} spec-card`}
            onClick={() => dispatch({ type: "SET_ANTENNA", gain_dBi: a.gain_dBi })}>
            <strong className="spec-card__title">{a.name}</strong>
            <span className="spec-card__desc">{a.description}</span>
            <SpecMeter label="Gain" value={a.gain_dBi / MAX_GAIN} text={`${a.gain_dBi} dBi`} />
          </button>
        ))}
      </div>

      <h3>Instruments</h3>
      <div className="cards">
        {INSTRUMENTS.map((i) => {
          const on = s.instruments.some((x) => x.name === i.name);
          return (
            <button key={i.id} type="button" aria-pressed={on} className={`${on ? "card selected" : "card"} spec-card`}
              onClick={() => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: i })}>
              <strong className="spec-card__title">{i.name}</strong>
              <span className="spec-card__desc">{i.description}</span>
              <span className="spec-card__badges">
                <span className="badge mono">{i.mass_kg} kg</span>
                <span className="badge mono">{i.power_W} W</span>
              </span>
            </button>
          );
        })}
      </div>

      <h3>Sizes</h3>
      {SLIDERS.map((sl) => (
        <label key={sl.field} className="slider">
          <span>{sl.label}</span>
          <input type="range" min={sl.min} max={sl.max} step={sl.step} value={s[sl.field]}
            style={{ "--p": `${((s[sl.field] - sl.min) / (sl.max - sl.min)) * 100}%` } as CSSProperties}
            onChange={(e) => dispatch({ type: "SET_NUMBER", field: sl.field, value: Number(e.target.value) })} />
          <strong>{s[sl.field]} {sl.unit}</strong>
        </label>
      ))}
    </section>
  );
}