
import type {
  MissionEvent,
  MissionState,
  LoadMode,
  MissionSimulationConfig,
} from "../types/simulation";

export function applyMissionEvent(
  state: MissionState,
  event: MissionEvent,
): MissionState {
  if (state.phase === "completed" || state.phase === "failed") {
    return state;
  }

  if (state.eventsTriggered.includes(event.id)) {
    return state;
  }

  let updatedState: MissionState;

  switch (event.type) {
    case "eclipse-start":
      updatedState = { ...state, inEclipse: true };
      break;

    case "eclipse-end":
      updatedState = { ...state, inEclipse: false };
      break;

    case "communication-loss":
      updatedState = { ...state, communicationAvailable: false };
      break;

    case "communication-restored":
      updatedState = { ...state, communicationAvailable: true };
      break;
  }

  return {
    ...updatedState,
    eventsTriggered: [...updatedState.eventsTriggered, event.id],
  };
}

export function changeLoadMode(
  state: MissionState,
  mode: LoadMode,
  config: MissionSimulationConfig,
): MissionState {
  if (state.phase === "completed" || state.phase === "failed") {
    return state;
  }

  const loadW =
  mode === "essential-only"
    ? Math.min(config.essentialLoadW, state.fullLoadW)
    : state.fullLoadW;

  return {
    ...state,
    loadMode: mode,
    loadW,
  };
}
