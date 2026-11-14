import { describe, it, expect } from "vitest";
import { evaluateMission } from "../index";
import { thermalBudget, radiatorCapacity, bodyArea } from "../thermal";
import { assessRisk, riskLevel } from "../risk";
import { computeScore } from "../score";
import { STARTER_DESIGNS, INSTRUMENTS } from "../../data";
import type { MissionDesign } from "../../types/mission";

const allInstruments = INSTRUMENTS.map(({ name, mass_kg, power_W }) => ({ name, mass_kg, power_W }));
const moon = STARTER_DESIGNS.Moon;

describe("thermal", () => {
  it("a bigger body has more surface to shed heat", () => {
    expect(bodyArea(1000)).toBeGreaterThan(bodyArea(100));
  });

  it("a warmer surrounding sheds less heat than a cold one", () => {
    const s = moon.spacecraft;
    expect(radiatorCapacity(s, "Moon")).toBeLessThan(radiatorCapacity(s, "GEO"));
  });

  it("every starter design stays cool enough", () => {
    for (const d of Object.values(STARTER_DESIGNS)) expect(thermalBudget(d.spacecraft, d.target).thermalOk).toBe(true);
  });

  it("heat equals the electrical load", () => {
    const t = thermalBudget(moon.spacecraft, "Moon");
    expect(t.heat_W).toBe(50 + 40); // housekeeping + camera
  });

  it("a small body packed with instruments overheats at the Moon", () => {
    const hot: MissionDesign = {
      ...moon,
      spacecraft: { ...moon.spacecraft, dryMass_kg: 100, instruments: allInstruments },
    };
    const r = evaluateMission(hot);
    expect(r.thermalOk).toBe(false);
    expect(r.thermalMargin).toBeLessThan(0);
    expect(r.feasible).toBe(false);
    expect(r.warnings.join(" ")).toContain("overheats");
  });

  it("a bigger body cures the overheating", () => {
    const small = { ...moon, spacecraft: { ...moon.spacecraft, dryMass_kg: 100, instruments: allInstruments } };
    const big = { ...small, spacecraft: { ...small.spacecraft, dryMass_kg: 1500 } };
    expect(evaluateMission(small).thermalOk).toBe(false);
    expect(evaluateMission(big).thermalOk).toBe(true);
  });
});

describe("risk", () => {
  const comfortable = {
    target: "LEO" as const, dvMargin: 0.5, massMargin: 0.5, powerMargin: 1,
    linkMargin_dB: 30, thermalMargin: 2, instrumentCount: 0,
  };

  it("is zero for a close target with big margins and no instruments", () => {
    expect(assessRisk(comfortable).score).toBe(0);
  });

  it("rises as the target gets further away", () => {
    const at = (target: "LEO" | "GEO" | "Moon" | "Mars") => assessRisk({ ...comfortable, target }).score;
    expect(at("GEO")).toBeGreaterThan(at("LEO"));
    expect(at("Moon")).toBeGreaterThan(at("GEO"));
    expect(at("Mars")).toBeGreaterThan(at("Moon"));
  });

  it("rises with thin margins and names the cause", () => {
    const thin = assessRisk({ ...comfortable, powerMargin: 0.01, dvMargin: 0.01 });
    expect(thin.score).toBeGreaterThan(assessRisk(comfortable).score);
    expect(thin.drivers).toContain("thin delta-v margin");
    expect(thin.drivers).toContain("thin power margin");
  });

  it("rises with the number of instruments", () => {
    expect(assessRisk({ ...comfortable, instrumentCount: 5 }).score).toBeGreaterThan(
      assessRisk({ ...comfortable, instrumentCount: 1 }).score,
    );
  });

  it("stays between 0 and 1 even for a terrible design", () => {
    const worst = assessRisk({
      target: "Mars", dvMargin: -5, massMargin: -5, powerMargin: -5, linkMargin_dB: -50,
      thermalMargin: -5, instrumentCount: 20,
    });
    expect(worst.score).toBeLessThanOrEqual(1);
    expect(worst.score).toBeGreaterThanOrEqual(0);
    expect(worst.level).toBe("high");
  });

  it("maps scores to levels", () => {
    expect(riskLevel(0.1)).toBe("low");
    expect(riskLevel(0.45)).toBe("moderate");
    expect(riskLevel(0.8)).toBe("high");
  });

  it("evaluateMission reports risk for starter designs without warnings", () => {
    for (const d of Object.values(STARTER_DESIGNS)) {
      const r = evaluateMission(d);
      expect(r.riskLevel).toBe("low");
      expect(r.warnings).toEqual([]);
    }
  });

  it("a risky but working design is flagged without failing", () => {
    const edgy: MissionDesign = {
      ...moon,
      spacecraft: { ...moon.spacecraft, propellantMass_kg: 1250, instruments: allInstruments, dryMass_kg: 600, solarArea_m2: 6 },
    };
    const r = evaluateMission(edgy);
    expect(r.riskScore).toBeGreaterThan(evaluateMission(moon).riskScore);
  });
});

describe("score weights", () => {
  const perfect = {
    feasible: true, dvAvailable: 10_000, dvRequired: 3_000, massMargin: 0.5, powerMargin: 1, batteryOk: true,
    linkMargin_dB: 30, thermalOk: true, thermalMargin: 2, risk: 0, cost_musd: 0,
  };
  it("a perfect, free design scores 100", () => expect(computeScore(perfect)).toBe(100));
  it("risk costs up to 10 points", () => expect(computeScore({ ...perfect, risk: 1 })).toBe(90));
  it("an overheating design is capped below 50", () => {
    expect(computeScore({ ...perfect, feasible: false, thermalOk: false, thermalMargin: -0.5 })).toBeLessThan(50);
  });
});