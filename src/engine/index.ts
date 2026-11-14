import type { MissionDesign, MissionResult } from "../types/mission";

// TEMP stub: returns fake numbers so the UI and simulation can start now.
export function evaluateMission(_design: MissionDesign): MissionResult {
  return {
    feasible: true,
    deltaVAvailable_ms: 4000,
    deltaVRequired_ms: 3900,
    powerMargin: 0.2,
    massMargin: 0.15,
    commsOk: true,
    cost_musd: 120,
    score: 75,
    warnings: [],
  };
}