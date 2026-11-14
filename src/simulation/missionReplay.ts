export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return function () {
    state = (state + 0x6d2b79f5) >>> 0;

    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

import type { MissionEvent } from "../types/simulation";

export function generateMissionEvents(
  eventSeed: number,
  missionDurationSeconds: number,
): MissionEvent[] {
  if (
    !Number.isFinite(missionDurationSeconds) ||
    missionDurationSeconds <= 0
  ) {
    throw new Error("Mission duration must be positive.");
  }

  const random = createSeededRandom(eventSeed);

  // Generate an eclipse during the first part of the mission.
  const eclipseStart =
    missionDurationSeconds * (0.2 + random() * 0.1);

  // About 36 minutes (a typical low Earth orbit shadow), varying a little by seed.
  const eclipseDuration = 36 * 60 * (0.9 + random() * 0.2);

  // Generate communication loss during the later part.
  const communicationLossStart =
    missionDurationSeconds * (0.6 + random() * 0.1);

  const communicationLossDuration =
    missionDurationSeconds * (0.03 + random() * 0.04);

  const events: MissionEvent[] = [
    {
      id: "eclipse-start",
      type: "eclipse-start",
      missionTimeSeconds: eclipseStart,
      durationSeconds: eclipseDuration,
    },
    {
      id: "eclipse-end",
      type: "eclipse-end",
      missionTimeSeconds: eclipseStart + eclipseDuration,
    },
    {
      id: "communication-loss",
      type: "communication-loss",
      missionTimeSeconds: communicationLossStart,
      durationSeconds: communicationLossDuration,
    },
    {
      id: "communication-restored",
      type: "communication-restored",
      missionTimeSeconds:
        communicationLossStart + communicationLossDuration,
    },
  ];

  return events.sort(
    (a, b) => a.missionTimeSeconds - b.missionTimeSeconds,
  );
}
