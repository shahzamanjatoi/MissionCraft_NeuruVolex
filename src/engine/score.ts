const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export interface ScoreInputs {
  feasible: boolean;
  dvAvailable: number;
  dvRequired: number;
  massMargin: number;
  powerMargin: number;
  batteryOk: boolean;
  linkMargin_dB: number;
  thermalOk: boolean;
  thermalMargin: number;
  /** 0 (safe) to 1 (very risky). */
  risk: number;
  cost_musd: number;
}

// A passed check earns half its points; the rest comes from extra margin.
function part(weight: number, pass: boolean, margin: number, goodMargin: number): number {
  return pass ? weight * (0.5 + 0.5 * clamp01(margin / goodMargin)) : 0;
}

export function computeScore(c: ScoreInputs): number {
  const dvMargin = (c.dvAvailable - c.dvRequired) / Math.max(c.dvRequired, 1000);
  const total =
    part(20, c.dvAvailable >= c.dvRequired, dvMargin, 0.2) +
    part(15, c.massMargin >= 0, c.massMargin, 0.15) +
    part(15, c.powerMargin >= 0 && c.batteryOk, c.powerMargin, 0.2) +
    part(15, c.linkMargin_dB >= 3, c.linkMargin_dB, 10) +
    part(10, c.thermalOk, c.thermalMargin, 0.5) +
    10 * clamp01(1 - c.risk) +
    15 * clamp01(1 - c.cost_musd / 500);
  const score = Math.round(total);
  return c.feasible ? score : Math.min(score, 49);
}