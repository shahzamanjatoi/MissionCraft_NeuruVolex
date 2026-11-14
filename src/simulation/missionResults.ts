import type {
  MissionSimulationConfig,
  MissionState,
  MissionResultSummary,
} from "../types/simulation";

export function summarizeMission(
  state: MissionState,
  config: MissionSimulationConfig,
): MissionResultSummary {
  const failureReasons = [...state.failureReasons];

  const scienceDataGeneratedMB = state.dataGeneratedMB;
  const scienceDataReturnedMB = state.dataTransmittedMB;

  const returnFraction =
    scienceDataGeneratedMB > 0
      ? scienceDataReturnedMB / scienceDataGeneratedMB
      : 0;

  const generatedEnough =
    scienceDataGeneratedMB >= config.requiredScienceDataMB;

  const returnedEnough =
    returnFraction >= config.requiredDataReturnFraction;

  let outcome: MissionResultSummary["outcome"];

  if (
    state.phase === "completed" &&
    generatedEnough &&
    returnedEnough &&
    state.failureReasons.length === 0
  ) {
    outcome = "success";
  } else if (
    scienceDataGeneratedMB > 0 ||
    scienceDataReturnedMB > 0
  ) {
    outcome = "partial";
  } else {
    outcome = "failure";
  }

  if (!generatedEnough) {
    failureReasons.push("Mission did not generate the required science data.");
  }

  if (!returnedEnough) {
    failureReasons.push("Mission did not return enough science data to Earth.");
  }

  return {
    outcome,
    phaseReached: state.phase,
    scienceDataGeneratedMB,
    scienceDataReturnedMB,
    failureReasons,
  };
}