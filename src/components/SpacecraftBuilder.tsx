import { ANTENNAS, ENGINES, INSTRUMENTS } from "../data";
import { useGame } from "../store/useGame";
import type { NumericField } from "../store/gameReducer";

const SLIDERS: { field: NumericField; label: string; unit: string; min: number; max: number; step: number }[] = [
  { field: "dryMass_kg", label: "Spacecraft body mass", unit: "kg", min: 100, max: 2000, step: 50 },
  { field: "propellantMass_kg", label: "Propellant", unit: "kg", min: 0, max: 8000, step: 50 },
  { field: "solarArea_m2", label: "Solar panel area", unit: "m²", min: 0, max: 30, step: 1 },
  { field: "batteryWh", label: "Battery", unit: "Wh", min: 0, max: 2000, step: 50 },
];

export function SpacecraftBuilder() {
  const { state, dispatch } = useGame();
  const s = state.design.spacecraft;
  return (
    <section>
      <h2>3. Design your spacecraft</h2>

      <h3>Engine</h3>
      <div className="cards">
        {ENGINES.map((e) => (
          <button key={e.id} type="button" className={s.isp_s === e.isp_s ? "card selected" : "card"}
            onClick={() => dispatch({ type: "SET_ISP", isp_s: e.isp_s })}>
            <strong>{e.name}</strong><span>{e.description}</span><span>Isp {e.isp_s} s</span>
          </button>
        ))}
      </div>

      <h3>Antenna</h3>
      <div className="cards">
        {ANTENNAS.map((a) => (
          <button key={a.id} type="button" className={s.antennaGain_dBi === a.gain_dBi ? "card selected" : "card"}
            onClick={() => dispatch({ type: "SET_ANTENNA", gain_dBi: a.gain_dBi })}>
            <strong>{a.name}</strong><span>{a.description}</span><span>{a.gain_dBi} dBi</span>
          </button>
        ))}
      </div>

      <h3>Instruments</h3>
      <div className="cards">
        {INSTRUMENTS.map((i) => {
          const on = s.instruments.some((x) => x.name === i.name);
          return (
            <button key={i.id} type="button" aria-pressed={on} className={on ? "card selected" : "card"}
              onClick={() => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: i })}>
              <strong>{i.name}</strong><span>{i.description}</span>
              <span>{i.mass_kg} kg · {i.power_W} W</span>
            </button>
          );
        })}
      </div>

      <h3>Sizes</h3>
      {SLIDERS.map((sl) => (
        <label key={sl.field} className="slider">
          <span>{sl.label}</span>
          <input type="range" min={sl.min} max={sl.max} step={sl.step} value={s[sl.field]}
            onChange={(e) => dispatch({ type: "SET_NUMBER", field: sl.field, value: Number(e.target.value) })} />
          <strong>{s[sl.field]} {sl.unit}</strong>
        </label>
      ))}
    </section>
  );
}
