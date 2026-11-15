
import type {
  MissionStartSnapshot,
  MissionState,
  MissionEvent,
  MissionResultSummary,
} from "../types/simulation";

import {
  createInitialMissionState,
  advanceMissionPhase,
} from "./missionController";

import { applyMissionEvent, changeLoadMode } from "./missionEvents";
import {
  applyMissionControlDecision,
  type MissionControlChoice,
} from "./missionControl";
import { advanceMissionTime } from "./missionSimulation";
import { generateMissionEvents } from "./missionReplay";
import { eclipseSeconds } from "../engine/power";
import {
  appendTelemetry,
  type MissionTelemetryRecord,
} from "./missionTelemetry";
import { summarizeMission } from "./missionResults";

export interface MissionRunnerOptions {
  missionDurationSeconds: number;
  stepSeconds?: number;
  missionControlChoice?: MissionControlChoice;
}

export interface MissionRunOutput {
  finalState: MissionState;
  events: MissionEvent[];
  telemetry: MissionTelemetryRecord[];
  summary: MissionResultSummary;
}

export function runMissionSimulation(
  snapshot: MissionStartSnapshot,
  options: MissionRunnerOptions,
): MissionRunOutput {
  const {
    missionDurationSeconds,
    stepSeconds = 3600,
    missionControlChoice,
  } = options;

  if (
    !Number.isFinite(missionDurationSeconds) ||
    missionDurationSeconds <= 0
  ) {
    throw new Error("Mission duration must be a positive number.");
  }

  if (!Number.isFinite(stepSeconds) || stepSeconds <= 0) {
    throw new Error("Simulation step must be a positive number.");
  }

  const events = generateMissionEvents(
    snapshot.eventSeed,
    missionDurationSeconds,
    eclipseSeconds(snapshot.design.target),
  );

  let state = createInitialMissionState(snapshot);
  let telemetry: MissionTelemetryRecord[] = [
    appendTelemetry([], state)[0],
  ];

  const activePhaseCount = 6;
  const phaseDuration = missionDurationSeconds / activePhaseCount;
  let phaseIndex = 0;
  let eventIndex = 0;

  while (
    state.elapsedSeconds < missionDurationSeconds &&
    state.phase !== "failed"
  ) {
    // Apply all events scheduled for the current mission time.
    while (
      eventIndex < events.length &&
      events[eventIndex].missionTimeSeconds <= state.elapsedSeconds
    ) {
      const event = events[eventIndex];

      state = applyMissionEvent(state, event);

      // Apply the player's power decision when the eclipse begins.
      if (
        event.type === "eclipse-start" &&
        missionControlChoice
      ) {
        state = applyMissionControlDecision(
          state,
          event.id,
          missionControlChoice,
          snapshot.config,
        );
      }

      // Restore full load when the eclipse ends.
      if (event.type === "eclipse-end") {
        state = changeLoadMode(state, "full", snapshot.config);
      }

      eventIndex++;
      telemetry = appendTelemetry(telemetry, state);
    }

    const nextEventTime =
      eventIndex < events.length
        ? events[eventIndex].missionTimeSeconds
        : missionDurationSeconds;

    const nextPhaseBoundary =
      phaseIndex < activePhaseCount
        ? phaseDuration * (phaseIndex + 1)
        : missionDurationSeconds;

    const nextTime = Math.min(
      state.elapsedSeconds + stepSeconds,
      nextEventTime,
      nextPhaseBoundary,
      missionDurationSeconds,
    );

    const durationSeconds = nextTime - state.elapsedSeconds;

    if (durationSeconds <= 0) {
      break;
    }

    state = advanceMissionTime(state, snapshot, {
      durationSeconds,
      inContactWindow: state.phase === "communication",
    });

    telemetry = appendTelemetry(telemetry, state);

    // Advance to the next mission phase at its scheduled boundary.
    if (
      state.phase !== "failed" &&
      state.elapsedSeconds >= nextPhaseBoundary
    ) {
      state = advanceMissionPhase(state);
      phaseIndex++;

      telemetry = appendTelemetry(telemetry, state);
    }
  }

  return {
    finalState: state,
    events,
    telemetry,
    summary: summarizeMission(state, snapshot.config),
  };
}
