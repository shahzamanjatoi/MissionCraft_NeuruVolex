import { describe, it, expect } from "vitest";
import { deltaV } from "../propulsion";

describe("deltaV", () => {
  it("matches the rocket equation", () => {
    // Isp 300 s, mass ratio 2 gives about 2039 m/s
    expect(deltaV(300, 2000, 1000)).toBeCloseTo(2039, 0);
  });
});