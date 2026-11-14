import { describe, it, expect } from "vitest";
import { isTargetUnlocked, nextLevel, previousLevel } from "../levels";

describe("levels", () => {
  it("only the first level is open at the start", () => {
    expect(isTargetUnlocked([], "LEO")).toBe(true);
    expect(isTargetUnlocked([], "GEO")).toBe(false);
    expect(isTargetUnlocked([], "Mars")).toBe(false);
  });
  it("completing a level opens the next one only", () => {
    expect(isTargetUnlocked(["LEO"], "GEO")).toBe(true);
    expect(isTargetUnlocked(["LEO"], "Moon")).toBe(false);
  });
  it("knows the previous and next level", () => {
    expect(previousLevel("LEO")).toBeNull();
    expect(previousLevel("Moon")).toBe("GEO");
    expect(nextLevel("Moon")).toBe("Mars");
    expect(nextLevel("Mars")).toBeNull();
  });
});
