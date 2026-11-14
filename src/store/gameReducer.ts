import type { MissionDesign } from "../types/mission";
import type { InstrumentOption } from "../data/instruments";
import { STARTER_DESIGNS } from "../data/presets";

export type GameStep = "target" | "rocket" | "spacecraft" | "results";
export const STEP_ORDER: GameStep[] = ["target", "rocket", "spacecraft", "results"];

export type NumericField = "dryMass_kg" | "propellantMass_kg" | "solarArea_m2" | "batteryWh";

export interface GameState {
  step: GameStep;
  design: MissionDesign;
}

export type GameAction =
  | { type: "SET_TARGET"; target: MissionDesign["target"] }
  | { type: "SET_LAUNCHER"; launchVehicle: MissionDesign["launchVehicle"] }
  | { type: "SET_ISP"; isp_s: number }
  | { type: "SET_ANTENNA"; gain_dBi: number }
  | { type: "SET_NUMBER"; field: NumericField; value: number }
  | { type: "TOGGLE_INSTRUMENT"; instrument: InstrumentOption }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESET" };

export function createInitialState(): GameState {
  return { step: "target", design: structuredClone(STARTER_DESIGNS.Moon) };
}

function withSpacecraft(state: GameState, patch: Partial<MissionDesign["spacecraft"]>): GameState {
  return { ...state, design: { ...state.design, spacecraft: { ...state.design.spacecraft, ...patch } } };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_TARGET":
      // Loading a starter design gives the player a working base to improve.
      return { ...state, design: structuredClone(STARTER_DESIGNS[action.target]) };
    case "SET_LAUNCHER":
      return { ...state, design: { ...state.design, launchVehicle: { ...action.launchVehicle } } };
    case "SET_ISP":
      return withSpacecraft(state, { isp_s: action.isp_s });
    case "SET_ANTENNA":
      return withSpacecraft(state, { antennaGain_dBi: action.gain_dBi });
    case "SET_NUMBER":
      return withSpacecraft(state, { [action.field]: Math.max(0, action.value) });
    case "TOGGLE_INSTRUMENT": {
      const current = state.design.spacecraft.instruments;
      const { name, mass_kg, power_W } = action.instrument;
      const has = current.some((i) => i.name === name);
      return withSpacecraft(state, {
        instruments: has ? current.filter((i) => i.name !== name) : [...current, { name, mass_kg, power_W }],
      });
    }
    case "NEXT": {
      const i = STEP_ORDER.indexOf(state.step);
      return { ...state, step: STEP_ORDER[Math.min(i + 1, STEP_ORDER.length - 1)] };
    }
    case "BACK": {
      const i = STEP_ORDER.indexOf(state.step);
      return { ...state, step: STEP_ORDER[Math.max(i - 1, 0)] };
    }
    case "RESET":
      return createInitialState();
  }
}
