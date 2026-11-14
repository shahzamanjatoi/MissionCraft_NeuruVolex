import type { MissionDesign } from "../types/mission";
import { REAL_MISSIONS, type RealMission } from "../data/realMissions";
import { wetMass } from "./mass";

export interface MissionMatch {
  mission: RealMission;
  /** Your launch mass divided by the real mission's, e.g. 1.2 means 20% heavier. */
  massRatio: number;
}

/** Finds the real mission, going to the same target, closest in launch mass. */
export function matchRealMission(design: MissionDesign): MissionMatch {
  const mass = wetMass(design.spacecraft);
  const sameTarget = REAL_MISSIONS.filter((m) => m.target === design.target);
  const pool = sameTarget.length > 0 ? sameTarget : REAL_MISSIONS;
  const distance = (m: RealMission) => Math.abs(Math.log(mass / m.launchMassKg));
  const mission = pool.reduce((best, m) => (distance(m) < distance(best) ? m : best));
  return { mission, massRatio: mass / mission.launchMassKg };
}
