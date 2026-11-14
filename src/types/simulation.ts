
import type { MissionDesign, MissionResult } from "./mission";

export type MissionPhase =
  | "launch"
  | "deployment"
  | "transfer"
  | "arrival"
  | "operations"
  | "communication"
  | "completed"
  | "failed";

export type LoadMode = "full" | "essential-only";

export type MissionEventType =
  | "eclipse-start"
  | "eclipse-end"
  | "communication-loss"
  | "communication-restored";

export interface MissionDecision {
  eventId: string;
  choiceId: string;
  missionTimeSeconds: number;
}

export interface MissionSimulationConfig {
  scienceDataGenerationMBPerHour: number;
  downlinkRateBps: number;
  requiredScienceDataMB: number;
  requiredDataReturnFraction: number;
  essentialLoadW: number;
}

export interface MissionStartSnapshot {
  design: MissionDesign;
  evaluation: MissionResult;
  config: MissionSimulationConfig;
  eventSeed: number;
}

export interface MissionState {
  phase: MissionPhase;
  elapsedSeconds: number;
  propellantKg: number;
  deltaVReserveMs: number;
  batteryWh: number;
  solarGenerationW: number;
  loadW: number;
  fullLoadW: number;
  loadMode: LoadMode;
  inEclipse: boolean;
  communicationAvailable: boolean;
  dataGeneratedMB: number;
  dataStoredMB: number;
  dataTransmittedMB: number;
  eventsTriggered: string[];
  decisions: MissionDecision[];
  failureReasons: string[];
}

export interface MissionEvent {
  id: string;
  type: MissionEventType;
  missionTimeSeconds: number;
  durationSeconds?: number;
}

export interface MissionResultSummary {
  outcome: "success" | "partial" | "failure";
  phaseReached: MissionPhase;
  scienceDataGeneratedMB: number;
  scienceDataReturnedMB: number;
  failureReasons: string[];
}
