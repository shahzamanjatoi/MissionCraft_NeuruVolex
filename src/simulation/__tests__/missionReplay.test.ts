
import { describe, it, expect } from "vitest";
import {
  createSeededRandom,
  generateMissionEvents,
} from "../missionReplay";

describe("mission replay random generator", () => {
  it("produces the same sequence for the same seed", () => {
    const random1 = createSeededRandom(12345);
    const random2 = createSeededRandom(12345);

    const sequence1 = [random1(), random1(), random1()];
    const sequence2 = [random2(), random2(), random2()];

    expect(sequence1).toEqual(sequence2);
  });

  it("produces different sequences for different seeds", () => {
    const random1 = createSeededRandom(12345);
    const random2 = createSeededRandom(67890);

    const sequence1 = [random1(), random1(), random1()];
    const sequence2 = [random2(), random2(), random2()];

    expect(sequence1).not.toEqual(sequence2);
  });

  it("produces numbers between 0 and 1", () => {
    const random = createSeededRandom(42);

    for (let i = 0; i < 100; i++) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("mission replay event schedule", () => {
  it("generates the same events for the same seed", () => {
    const first = generateMissionEvents(12345, 86400);
    const second = generateMissionEvents(12345, 86400);

    expect(first).toEqual(second);
  });

  it("generates different schedules for different seeds", () => {
    const first = generateMissionEvents(12345, 86400);
    const second = generateMissionEvents(67890, 86400);

    expect(first).not.toEqual(second);
  });

  it("returns four events in chronological order", () => {
    const events = generateMissionEvents(12345, 86400);

    expect(events).toHaveLength(4);

    for (let i = 1; i < events.length; i++) {
      expect(events[i].missionTimeSeconds).toBeGreaterThan(
        events[i - 1].missionTimeSeconds,
      );
    }
  });

  it("rejects an invalid mission duration", () => {
    expect(() => generateMissionEvents(12345, 0)).toThrow();
  });
});
