import type { MissionDesign, RiskLevel } from "../types/mission";

type Target = MissionDesign["target"];

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Mission distance and difficulty: the further out, the more can go wrong. */
const TARGET_RISK: Record<Target, number> = { LEO: 0, GEO: 0.25, Moon: 0.5, Mars: 1 };

export interface RiskInputs {
  target: Target;
  /** Fractional margins (0.1 = 10% spare). dB for the link margin. */
  dvMargin: number;
  massMargin: number;
  powerMargin: number;
  linkMargin_dB: number;
  thermalMargin: number;
  instrumentCount: number;
}

// Each margin counts as risky until it reaches its comfortable size.
const MARGINS: { key: keyof RiskInputs; label: string; weight: number; comfortable: number }[] = [
  { key: "dvMargin", label: "thin delta-v margin", weight: 0.25, comfortable: 0.2 },
  { key: "massMargin", label: "little spare launch capacity", weight: 0.15, comfortable: 0.15 },
  { key: "powerMargin", label: "thin power margin", weight: 0.2, comfortable: 0.3 },
  { key: "linkMargin_dB", label: "weak radio link margin", weight: 0.15, comfortable: 10 },
  { key: "thermalMargin", label: "little spare cooling", weight: 0.05, comfortable: 0.5 },
];
const MARGIN_SHARE = 0.8;
const TARGET_SHARE = 0.12;
const COMPLEXITY_SHARE = 0.08;
const FULL_COMPLEXITY_INSTRUMENTS = 5;

export function riskLevel(score: number): RiskLevel {
  return score < 0.3 ? "low" : score < 0.6 ? "moderate" : "high";
}

/**
 * Overall mission risk from 0 (safe) to 1 (very risky): thin margins, a far-away
 * target and a complicated spacecraft all add risk. `drivers` names the biggest causes.
 */
export function assessRisk(r: RiskInputs) {
  let marginRisk = 0;
  const contributions: { label: string; value: number }[] = [];
  for (const m of MARGINS) {
    const value = m.weight * clamp01(1 - (r[m.key] as number) / m.comfortable);
    marginRisk += value;
    contributions.push({ label: m.label, value });
  }
  const targetRisk = TARGET_RISK[r.target];
  const complexity = clamp01(r.instrumentCount / FULL_COMPLEXITY_INSTRUMENTS);
  contributions.push({ label: "a distant, difficult target", value: (TARGET_SHARE / MARGIN_SHARE) * targetRisk });
  contributions.push({ label: "many instruments to keep running", value: (COMPLEXITY_SHARE / MARGIN_SHARE) * complexity });

  const score = clamp01(MARGIN_SHARE * marginRisk + TARGET_SHARE * targetRisk + COMPLEXITY_SHARE * complexity);
  const drivers = contributions
    .filter((c) => c.value > 0.05)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((c) => c.label);
  return { score, level: riskLevel(score), drivers };
}