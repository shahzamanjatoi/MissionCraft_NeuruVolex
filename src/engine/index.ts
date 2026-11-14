import type { MissionDesign, MissionResult } from "../types/mission";
import { availableDeltaV } from "./propulsion";
import { requiredDeltaV } from "./orbit";
import { massMargin } from "./mass";
import { powerBudget } from "./power";
import { linkBudget } from "./comms";
import { thermalBudget } from "./thermal";
import { assessRisk } from "./risk";
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
  const thermal = thermalBudget(s, design.target);
  const cost_musd = missionCost(design);

  const dvOk = deltaVAvailable_ms >= deltaVRequired_ms;
  const massOk = mMargin >= 0;
  const powerOk = power.powerMargin >= 0;
  const dvMargin = (deltaVAvailable_ms - deltaVRequired_ms) / Math.max(deltaVRequired_ms, 1000);
  const risk = assessRisk({
    target: design.target,
    dvMargin,
    massMargin: mMargin,
    powerMargin: power.powerMargin,
    linkMargin_dB: link.margin_dB,
    thermalMargin: thermal.thermalMargin,
    instrumentCount: s.instruments.length,
  });

  if (!dvOk) warnings.push("Not enough delta-v: add propellant, use a more efficient engine, or reduce mass.");
  if (!massOk) warnings.push("Spacecraft is too heavy for this launch vehicle.");
  if (!powerOk) warnings.push("Solar panels do not generate enough power for the instruments.");
  if (!power.batteryOk) warnings.push("Battery cannot cover the eclipse period.");
  if (!link.ok) warnings.push("Communications link is too weak: use a higher-gain antenna.");

  if (!thermal.thermalOk) warnings.push("Spacecraft overheats: use fewer instruments or a bigger spacecraft body so it can shed heat.");
  if (risk.level === "high") warnings.push(`High mission risk: ${risk.drivers.join(", ") || "margins are thin"}.`);

  const feasible = dvOk && massOk && powerOk && power.batteryOk && link.ok && thermal.thermalOk;

  const score = computeScore({
    feasible,
    dvAvailable: deltaVAvailable_ms,
    dvRequired: deltaVRequired_ms,
    massMargin: mMargin,
    powerMargin: power.powerMargin,
    batteryOk: power.batteryOk,
    linkMargin_dB: link.margin_dB,
    thermalOk: thermal.thermalOk,
    thermalMargin: thermal.thermalMargin,
    risk: risk.score,
    cost_musd,
  });

  return {
    feasible,
    deltaVAvailable_ms,
    deltaVRequired_ms,
    powerMargin: power.powerMargin,
    massMargin: mMargin,
    commsOk: link.ok,
    thermalMargin: thermal.thermalMargin,
    thermalOk: thermal.thermalOk,
    riskScore: risk.score,
    riskLevel: risk.level,
    riskDrivers: risk.drivers,
    cost_musd,
    score,
    warnings,
  };
}