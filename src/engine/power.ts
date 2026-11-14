import type { MissionDesign } from "../types/mission";

const SOLAR_CONSTANT = 1361; // W/m^2 at 1 AU
const CELL_EFFICIENCY = 0.28;
const SYSTEM_FACTOR = 0.9; // pointing and degradation losses
const BASE_LOAD_W = 50; // housekeeping
const BATTERY_USABLE = 0.8; // depth of discharge

const SUN_DISTANCE_AU: Record<MissionDesign["target"], number> = { LEO: 1, GEO: 1, Moon: 1, Mars: 1.52 };
const ECLIPSE_MIN: Record<MissionDesign["target"], number> = { LEO: 36, GEO: 72, Moon: 45, Mars: 40 };

export function solarPower(areaM2: number, target: MissionDesign["target"]): number {
  const d = SUN_DISTANCE_AU[target];
  return (areaM2 * SOLAR_CONSTANT * CELL_EFFICIENCY * SYSTEM_FACTOR) / (d * d);
}

export function powerLoad(s: MissionDesign["spacecraft"]): number {
  return BASE_LOAD_W + s.instruments.reduce((sum, i) => sum + i.power_W, 0);
}

export function powerBudget(s: MissionDesign["spacecraft"], target: MissionDesign["target"]) {
  const generated_W = solarPower(s.solarArea_m2, target);
  const load_W = powerLoad(s);
  const eclipseNeed_Wh = (load_W * ECLIPSE_MIN[target]) / 60;
  return {
    generated_W,
    load_W,
    powerMargin: (generated_W - load_W) / load_W,
    batteryOk: s.batteryWh * BATTERY_USABLE >= eclipseNeed_Wh,
    eclipseNeed_Wh,
  };
}