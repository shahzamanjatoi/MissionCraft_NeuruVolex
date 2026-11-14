import type { MissionDesign, MissionResult } from "../types/mission";
import { availableDeltaV } from "./propulsion";
import { requiredDeltaV } from "./orbit";
import { massMargin } from "./mass";
import { powerBudget } from "./power";
import { linkBudget } from "./comms";
import { missionCost } from "./cost";
import { computeScore } from "./score";

export function evaluateMission(design: MissionDesign): MissionResult {
  const s = design.spacecraft;
  const warnings: string[] = [];

  const deltaVAvailable_ms = availableDeltaV(s);
  const deltaVRequired_ms = requiredDeltaV(design.target);
  const mMargin = massMargin(s, design.launchVehicle.payloadToLEO_kg);
  const power = powerBudget(s, design.target);
  const link = linkBudget(design);
  const cost_musd = missionCost(design);

  const dvOk = deltaVAvailable_ms >= deltaVRequired_ms;
  const massOk = mMargin >= 0;
  const powerOk = power.powerMargin >= 0;

  if (!dvOk) warnings.push("Not enough delta-v: add propellant, use a more efficient engine, or reduce mass.");
  if (!massOk) warnings.push("Spacecraft is too heavy for this launch vehicle.");
  if (!powerOk) warnings.push("Solar panels do not generate enough power for the instruments.");
  if (!power.batteryOk) warnings.push("Battery cannot cover the eclipse period.");
  if (!link.ok) warnings.push("Communications link is too weak: use a higher-gain antenna.");

  const feasible = dvOk && massOk && powerOk && power.batteryOk && link.ok;

  const score = computeScore({
    feasible,
    dvAvailable: deltaVAvailable_ms,
    dvRequired: deltaVRequired_ms,
    massMargin: mMargin,
    powerMargin: power.powerMargin,
    batteryOk: power.batteryOk,
    linkMargin_dB: link.margin_dB,
    cost_musd,
  });

  return {
    feasible,
    deltaVAvailable_ms,
    deltaVRequired_ms,
    powerMargin: power.powerMargin,
    massMargin: mMargin,
    commsOk: link.ok,
    cost_musd,
    score,
    warnings,
  };
}