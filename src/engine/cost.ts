import type { MissionDesign } from "../types/mission";
import { dryTotalMass, instrumentMass } from "./mass";

// Game-balance numbers, not real costing.
const SPACECRAFT_MUSD_PER_KG = 0.08;
const INSTRUMENT_MUSD_PER_KG = 0.15;

export function missionCost(d: MissionDesign): number {
  const s = d.spacecraft;
  const total =
    d.launchVehicle.cost_musd +
    dryTotalMass(s) * SPACECRAFT_MUSD_PER_KG +
    instrumentMass(s) * INSTRUMENT_MUSD_PER_KG;
  return Math.round(total * 10) / 10;
}