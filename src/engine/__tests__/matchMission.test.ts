import { describe, it, expect } from "vitest";
import { matchRealMission } from "../matchMission";
import { STARTER_DESIGNS } from "../../data/presets";

describe("matchRealMission", () => {
  it("matches the Moon starter design to LRO", () => {
    expect(matchRealMission(STARTER_DESIGNS.Moon).mission.id).toBe("lro");
  });
  it("always returns a mission for the same target", () => {
    for (const t of ["LEO", "GEO", "Moon", "Mars"] as const) {
      expect(matchRealMission(STARTER_DESIGNS[t]).mission.target).toBe(t);
    }
  });
  it("a very light Moon craft matches Lunar Prospector", () => {
    const d = structuredClone(STARTER_DESIGNS.Moon);
    d.spacecraft.dryMass_kg = 150;
    d.spacecraft.propellantMass_kg = 100;
    expect(matchRealMission(d).mission.id).toBe("lunar-prospector");
  });
});
