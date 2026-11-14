import type { MissionDesign } from "../types/mission";
import { dryTotalMass, wetMass } from "./mass";

const G0 = 9.80665;

export function deltaV(isp_s: number, startMass_kg: number, endMass_kg: number): number {
  return isp_s * G0 * Math.log(startMass_kg / endMass_kg);
}

export function availableDeltaV(s: MissionDesign["spacecraft"]): number {
  return deltaV(s.isp_s, wetMass(s), dryTotalMass(s));
}