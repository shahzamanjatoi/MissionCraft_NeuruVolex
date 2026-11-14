
import type { MissionDesign } from "../types/mission";
import type {
  MissionPhase,
  MissionStartSnapshot,
  MissionState,
} from "../types/simulation";
import { availableDeltaV } from "../engine/propulsion";
import { solarPower, powerLoad } from "../engine/power";

export const MISSION_PHASES: MissionPhase[] = [
  "launch",
  "deployment",
  "transfer",
  "arrival",
  "operations",
  "communication",
  "completed",
];

export function createInitialMissionState(
  snapshot: MissionStartSnapshot,
): MissionState {
  const spacecraft = snapshot.design.spacecraft;

  return {
    phase: "launch",
    elapsedSeconds: 0,
    propellantKg: spacecraft.propellantMass_kg,
    deltaVReserveMs: availableDeltaV(spacecraft),
    batteryWh: spacecraft.batteryWh * 0.8,
    solarGenerationW: solarPower(
      spacecraft.solarArea_m2,
      snapshot.design.target,
    ),
    loadW: powerLoad(spacecraft),
    fullLoadW: powerLoad(spacecraft),
    loadMode: "full",
    inEclipse: false,
    communicationAvailable: true,
    dataGeneratedMB: 0,
    dataStoredMB: 0,
    dataTransmittedMB: 0,
    eventsTriggered: [],
    decisions: [],
    failureReasons: [],
  };
}

export function advanceMissionPhase(state: MissionState): MissionState {
  if (state.phase === "completed" || state.phase === "failed") {
    return state;
  }

  const currentIndex = MISSION_PHASES.indexOf(state.phase);
  const nextPhase = MISSION_PHASES[currentIndex + 1];

  if (!nextPhase) {
    return { ...state, phase: "completed" };
  }

  return { ...state, phase: nextPhase };
}

export function failMission(
  state: MissionState,
  reason: string,
): MissionState {
  return {
    ...state,
    phase: "failed",
    failureReasons: [...state.failureReasons, reason],
  };
}

export function getMissionDesign(
  snapshot: MissionStartSnapshot,
): MissionDesign {
  return snapshot.design;
}
