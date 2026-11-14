import type { MissionDesign } from "../types/mission";

type Spacecraft = MissionDesign["spacecraft"];

export function instrumentMass(s: Spacecraft): number {
  return s.instruments.reduce((sum, i) => sum + i.mass_kg, 0);
}

/** Mass after all propellant is burned. */
export function dryTotalMass(s: Spacecraft): number {
  return s.dryMass_kg + instrumentMass(s);
}

/** Mass at launch, including propellant. */
export function wetMass(s: Spacecraft): number {
  return dryTotalMass(s) + s.propellantMass_kg;
}

/** Spare launch capacity as a fraction. 0.15 means 15% spare; negative means too heavy. */
export function massMargin(s: Spacecraft, payloadToLEO_kg: number): number {
  return (payloadToLEO_kg - wetMass(s)) / payloadToLEO_kg;
}