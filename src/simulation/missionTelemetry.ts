
import type {
  MissionPhase,
  MissionState,
} from "../types/simulation";

export interface MissionTelemetryRecord {
  elapsedSeconds: number;
  phase: MissionPhase;
  batteryWh: number;
  propellantKg: number;
  deltaVReserveMs: number;
  solarGenerationW: number;
  loadW: number;
  inEclipse: boolean;
  communicationAvailable: boolean;
  dataGeneratedMB: number;
  dataStoredMB: number;
  dataTransmittedMB: number;
}

export function captureTelemetry(
  state: MissionState,
): MissionTelemetryRecord {
  return {
    elapsedSeconds: state.elapsedSeconds,
    phase: state.phase,
    batteryWh: state.batteryWh,
    propellantKg: state.propellantKg,
    deltaVReserveMs: state.deltaVReserveMs,
    solarGenerationW: state.inEclipse ? 0 : state.solarGenerationW,
    loadW: state.loadW,
    inEclipse: state.inEclipse,
    communicationAvailable: state.communicationAvailable,
    dataGeneratedMB: state.dataGeneratedMB,
    dataStoredMB: state.dataStoredMB,
    dataTransmittedMB: state.dataTransmittedMB,
  };
}

export function appendTelemetry(
  history: MissionTelemetryRecord[],
  state: MissionState,
  maxRecords = 1000,
): MissionTelemetryRecord[] {
  if (!Number.isInteger(maxRecords) || maxRecords < 1) {
    throw new Error("Maximum telemetry records must be a positive integer.");
  }

  const updatedHistory = [
    ...history,
    captureTelemetry(state),
  ];

  return updatedHistory.slice(-maxRecords);
}
