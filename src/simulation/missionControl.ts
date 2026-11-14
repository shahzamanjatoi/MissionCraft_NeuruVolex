
import type {
  MissionSimulationConfig,
  MissionState,
} from "../types/simulation";
import { changeLoadMode } from "./missionEvents";

export type MissionControlChoice =
  | "conserve-power"
  | "maintain-full-load";

export function applyMissionControlDecision(
  state: MissionState,
  eventId: string,
  choiceId: MissionControlChoice,
  config: MissionSimulationConfig,
): MissionState {
  if (state.phase === "completed" || state.phase === "failed") {
    return state;
  }

  // Prevent multiple decisions for the same event.
  if (state.decisions.some((decision) => decision.eventId === eventId)) {
    return state;
  }

  const loadMode =
    choiceId === "conserve-power" ? "essential-only" : "full";

  const updatedState = changeLoadMode(state, loadMode, config);

  return {
    ...updatedState,
    decisions: [
      ...updatedState.decisions,
      {
        eventId,
        choiceId,
        missionTimeSeconds: state.elapsedSeconds,
      },
    ],
  };
}
