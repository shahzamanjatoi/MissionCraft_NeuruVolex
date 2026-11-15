import { describe, it, expect } from "vitest";
import { generateMissionEvents } from "../missionReplay";
import { runMissionSimulation } from "../missionRunner";
import { evaluateMission } from "../../engine";
import { eclipseSeconds } from "../../engine/power";
import { STARTER_DESIGNS, TARGETS } from "../../data";

const CONFIG = {
  scienceDataGenerationMBPerHour: 10,
  downlinkRateBps: 1_000_000,
  requiredScienceDataMB: 50,
  requiredDataReturnFraction: 0.8,
  essentialLoadW: 40,
};

describe("eclipse length", () => {
  it("uses the given eclipse length when one is passed", () => {
    const events = generateMissionEvents(12345, 86400, 2160);
    const start = events.find((e) => e.type === "eclipse-start")!;
    const end = events.find((e) => e.type === "eclipse-end")!;
    expect(start.durationSeconds).toBe(2160);
    expect(end.missionTimeSeconds - start.missionTimeSeconds).toBe(2160);
  });

  it("keeps the random eclipse when no length is passed", () => {
    const start = generateMissionEvents(12345, 86400).find((e) => e.type === "eclipse-start")!;
    expect(start.durationSeconds).toBeGreaterThanOrEqual(86400 * 0.05);
    expect(start.durationSeconds).toBeLessThan(86400 * 0.1);
  });

  it("does not move the other events when the eclipse length is set", () => {
    const random = generateMissionEvents(12345, 86400);
    const fixed = generateMissionEvents(12345, 86400, 2160);
    const comms = (ev: typeof random) => ev.filter((e) => e.type.startsWith("communication"));
    expect(comms(fixed)).toEqual(comms(random));
  });

  it("matches the engine's eclipse length for each target", () => {
    expect(eclipseSeconds("LEO")).toBe(36 * 60);
    expect(eclipseSeconds("GEO")).toBe(72 * 60);
    expect(eclipseSeconds("Moon")).toBe(45 * 60);
    expect(eclipseSeconds("Mars")).toBe(40 * 60);
  });
});

describe("a design that passes the engineering checks survives the simulation", () => {
  it.each(TARGETS.map((t) => t.id))("starter design for %s", (id) => {
    const design = STARTER_DESIGNS[id];
    const evaluation = evaluateMission(design);
    expect(evaluation.feasible).toBe(true);
    for (const eventSeed of [2026, 12345, 1, 99]) {
      const run = runMissionSimulation(
        { design, evaluation, config: CONFIG, eventSeed },
        { missionDurationSeconds: 86_400 },
      );
      expect(run.summary.failureReasons).toEqual([]);
      expect(run.summary.outcome).toBe("success");
    }
  });
});