
import type {
  MissionStartSnapshot,
  MissionState,
} from "../types/simulation";
import { failMission } from "./missionController";

export interface MissionTimeStepOptions {
  durationSeconds: number;
  inContactWindow?: boolean;
}

export function advanceMissionTime(
  state: MissionState,
  snapshot: MissionStartSnapshot,
  options: MissionTimeStepOptions,
): MissionState {
  if (state.phase === "completed" || state.phase === "failed") {
    return state;
  }

  const { durationSeconds, inContactWindow = false } = options;

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    throw new Error("Mission duration must be a positive number.");
  }

  const durationHours = durationSeconds / 3600;

  // Solar panels generate no power during an eclipse.
  const availablePowerW = state.inEclipse ? 0 : state.solarGenerationW;

  // Calculate battery energy after power generation and consumption.
  const energyChangeWh =
    ((availablePowerW - state.loadW) * durationSeconds) / 3600;

  const batteryCapacityWh = snapshot.design.spacecraft.batteryWh * 0.8;
  const newBatteryWh = state.batteryWh + energyChangeWh;

  const updatedTime = state.elapsedSeconds + durationSeconds;

  if (newBatteryWh < 0) {
    return failMission(
      {
        ...state,
        elapsedSeconds: updatedTime,
        batteryWh: 0,
      },
      "Battery depleted: insufficient power to continue the mission.",
    );
  }

  const batteryWh = Math.min(batteryCapacityWh, newBatteryWh);

  // Generate science data during operations and communication phases.
  const generatesScience =
    state.phase === "operations" || state.phase === "communication";

  const newlyGeneratedMB = generatesScience
    ? snapshot.config.scienceDataGenerationMBPerHour * durationHours
    : 0;

  const dataGeneratedMB = state.dataGeneratedMB + newlyGeneratedMB;
  let dataStoredMB = state.dataStoredMB + newlyGeneratedMB;
  let dataTransmittedMB = state.dataTransmittedMB;

  // Transmit stored science data when communication is available.
  if (inContactWindow && state.communicationAvailable) {
    const downlinkCapacityMB =
      (snapshot.config.downlinkRateBps * durationSeconds) / 8 / 1_000_000;

    const transmittedMB = Math.min(dataStoredMB, downlinkCapacityMB);

    dataStoredMB -= transmittedMB;
    dataTransmittedMB += transmittedMB;
  }

  return {
    ...state,
    elapsedSeconds: updatedTime,
    batteryWh,
    dataGeneratedMB,
    dataStoredMB,
    dataTransmittedMB,
  };
}
