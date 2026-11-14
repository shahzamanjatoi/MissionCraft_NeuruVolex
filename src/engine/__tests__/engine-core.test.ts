import { describe, it, expect } from "vitest";
import { wetMass, massMargin } from "../mass";
import { availableDeltaV } from "../propulsion";
import { circularSpeed, hohmannDeltaV, requiredDeltaV, moonDeltaV, marsDeltaV, R_EARTH, LEO_ALTITUDE, GEO_RADIUS } from "../orbit";
import { solarPower, powerBudget } from "../power";

const sc = {
  dryMass_kg: 500, propellantMass_kg: 300, isp_s: 300, solarArea_m2: 2,
  batteryWh: 400, antennaGain_dBi: 10,
  instruments: [{ name: "Camera", mass_kg: 50, power_W: 40 }],
};

describe("mass", () => {
  it("adds propellant and instruments", () => expect(wetMass(sc)).toBe(850));
  it("computes launch margin", () => expect(massMargin(sc, 1000)).toBeCloseTo(0.15, 5));
});

describe("propulsion", () => {
  it("gives delta-v for the example craft", () => {
    const dv = availableDeltaV(sc);
    expect(dv).toBeGreaterThan(1270);
    expect(dv).toBeLessThan(1290);
  });
});

describe("orbit", () => {
  it("circular speed at 400 km is about 7.67 km/s", () => {
    const v = circularSpeed(R_EARTH + LEO_ALTITUDE);
    expect(v).toBeGreaterThan(7650);
    expect(v).toBeLessThan(7700);
  });
  it("LEO to GEO Hohmann is about 3.85 km/s", () => {
    const t = hohmannDeltaV(R_EARTH + LEO_ALTITUDE, GEO_RADIUS).total;
    expect(t).toBeGreaterThan(3800);
    expect(t).toBeLessThan(3900);
  });
  it("Moon: TLI about 3.08 km/s, LOI about 0.82 km/s", () => {
    const m = moonDeltaV();
    expect(m.tli).toBeGreaterThan(3050);
    expect(m.tli).toBeLessThan(3120);
    expect(m.loi).toBeGreaterThan(780);
    expect(m.loi).toBeLessThan(860);
  });
  it("Mars: TMI about 3.57 km/s, capture about 0.9 km/s", () => {
    const m = marsDeltaV();
    expect(m.tmi).toBeGreaterThan(3500);
    expect(m.tmi).toBeLessThan(3650);
    expect(m.moi).toBeGreaterThan(850);
    expect(m.moi).toBeLessThan(960);
  });
  it("needs nothing extra for LEO", () => expect(requiredDeltaV("LEO")).toBe(0));
});

describe("power", () => {
  it("2 m^2 gives about 686 W at Earth", () => expect(solarPower(2, "LEO")).toBeCloseTo(685.9, 0));
  it("Mars gets less sunlight", () => {
    expect(solarPower(2, "Mars") / solarPower(2, "LEO")).toBeCloseTo(1 / (1.52 * 1.52), 3);
  });
  it("battery covers LEO eclipse", () => expect(powerBudget(sc, "LEO").batteryOk).toBe(true));
});