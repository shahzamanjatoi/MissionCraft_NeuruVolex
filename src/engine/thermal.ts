import type { MissionDesign } from "../types/mission";
import { dryTotalMass } from "./mass";
import { powerLoad } from "./power";

type Target = MissionDesign["target"];

// Simplified radiator model for gameplay, not a real thermal analysis.
// Every watt the spacecraft uses ends up as heat, and the craft can only get rid
// of that heat by radiating it to space from a few cool-facing panels.
const STEFAN_BOLTZMANN = 5.670374e-8; // W/m^2/K^4
const EMISSIVITY = 0.8;
const MAX_TEMP_K = 313; // 40 C: upper limit for onboard electronics
const BUS_DENSITY_KG_M3 = 150; // average density of a small spacecraft
const RADIATOR_FRACTION = 0.2; // share of the body surface that can face cold space

/**
 * Effective temperature of what the radiator "sees" (Earth glow, sunlit Moon, deep space).
 * Warmer surroundings mean less heat can be rejected.
 */
const SINK_TEMP_K: Record<Target, number> = { LEO: 270, GEO: 220, Moon: 300, Mars: 230 };

/** Body surface area (m^2) of a cube-like craft with the given mass. */
export function bodyArea(mass_kg: number): number {
  const volume = mass_kg / BUS_DENSITY_KG_M3;
  return 6 * Math.pow(volume, 2 / 3);
}

/** Heat (W) the radiators can shed at the maximum allowed temperature. */
export function radiatorCapacity(s: MissionDesign["spacecraft"], target: Target): number {
  const area = bodyArea(dryTotalMass(s)) * RADIATOR_FRACTION;
  const sink = SINK_TEMP_K[target];
  return EMISSIVITY * STEFAN_BOLTZMANN * area * (MAX_TEMP_K ** 4 - sink ** 4);
}

/** Thermal margin: 0.2 means the radiators can shed 20% more heat than the craft makes. */
export function thermalBudget(s: MissionDesign["spacecraft"], target: Target) {
  const heat_W = powerLoad(s);
  const capacity_W = radiatorCapacity(s, target);
  return { heat_W, capacity_W, thermalMargin: (capacity_W - heat_W) / heat_W, thermalOk: capacity_W >= heat_W };
}