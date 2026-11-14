import { describe, it, expect } from "vitest";
import { evaluateMission } from "../../engine";
import { STARTER_DESIGNS, INSTRUMENTS, LAUNCH_VEHICLES, TARGETS } from "../index";

describe("game data", () => {
  it("has unique instrument ids", () => {
    const ids = INSTRUMENTS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has a starter design for every target", () => {
    for (const t of TARGETS) expect(STARTER_DESIGNS[t.id].target).toBe(t.id);
  });

  it.each(TARGETS.map((t) => t.id))("starter design for %s is feasible", (id) => {
    const r = evaluateMission(STARTER_DESIGNS[id]);
    expect(r.warnings).toEqual([]);
    expect(r.feasible).toBe(true);
  });

  it("launchers get more expensive with capacity", () => {
    const costs = LAUNCH_VEHICLES.map((v) => v.cost_musd);
    expect([...costs].sort((a, b) => a - b)).toEqual(costs);
  });
});
