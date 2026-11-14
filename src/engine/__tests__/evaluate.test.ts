import { describe, it, expect } from "vitest";
import { evaluateMission } from "../index";
import { missionCost } from "../cost";
import { linkBudget } from "../comms";
import type { MissionDesign } from "../../types/mission";

const moon: MissionDesign = {
  launchVehicle: { name: "Test rocket", payloadToLEO_kg: 22800, cost_musd: 60 },
  target: "Moon",
  spacecraft: {
    dryMass_kg: 500, propellantMass_kg: 1500, isp_s: 320, solarArea_m2: 6,
    batteryWh: 400, antennaGain_dBi: 10,
    instruments: [{ name: "Camera", mass_kg: 50, power_W: 40 }],
  },
};

describe("cost", () => {
  it("adds launch, spacecraft and instrument cost", () => expect(missionCost(moon)).toBeCloseTo(111.5, 1));
});

describe("comms", () => {
  it("a small antenna works at the Moon", () => {
    const l = linkBudget(moon);
    expect(l.margin_dB).toBeGreaterThan(37);
    expect(l.margin_dB).toBeLessThan(38);
    expect(l.ok).toBe(true);
  });
  it("Mars needs a bigger antenna", () => {
    const small = { ...moon, target: "Mars" as const };
    const big = { ...small, spacecraft: { ...small.spacecraft, antennaGain_dBi: 35 } };
    expect(linkBudget(small).ok).toBe(false);
    expect(linkBudget(big).ok).toBe(true);
  });
});

describe("evaluateMission", () => {
  it("passes a well-designed Moon mission", () => {
    const r = evaluateMission(moon);
    expect(r.feasible).toBe(true);
    expect(r.warnings).toHaveLength(0);
    expect(r.score).toBeGreaterThan(50);
  });
  it("fails with too little propellant and says why", () => {
    const r = evaluateMission({ ...moon, spacecraft: { ...moon.spacecraft, propellantMass_kg: 200 } });
    expect(r.feasible).toBe(false);
    expect(r.score).toBeLessThan(50);
    expect(r.warnings.join(" ")).toContain("delta-v");
  });
});