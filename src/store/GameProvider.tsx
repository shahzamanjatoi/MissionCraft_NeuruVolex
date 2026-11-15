
import {
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { evaluateMission } from "../engine";
import { runMissionSimulation } from "../simulation/missionRunner";
import type { MissionControlChoice } from "../simulation/missionControl";
import type { MissionSimulationConfig } from "../types/simulation";
import { GameContext } from "./GameContext";
import { createInitialState, gameReducer } from "./gameReducer";

// Prototype gameplay assumptions, not official NASA mission parameters.
const SIMULATION_CONFIG: MissionSimulationConfig = {
  scienceDataGenerationMBPerHour: 10,
  downlinkRateBps: 1_000_000,
  requiredScienceDataMB: 50,
  requiredDataReturnFraction: 0.8,
  essentialLoadW: 40,
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialState,
  );

  const [missionControlChoice, setMissionControlChoice] =
    useState<MissionControlChoice | null>(null);

  useEffect(() => {
    if (state.step !== "results") {
      setMissionControlChoice(null);
    }
  }, [state.step]);

  const result = useMemo(
    () => evaluateMission(state.design),
    [state.design],
  );

  const simulation = useMemo(() => {
    if (state.step !== "results" || !missionControlChoice) {
      return null;
    }

    return runMissionSimulation(
      {
        design: state.design,
        evaluation: result,
        config: SIMULATION_CONFIG,
        eventSeed: 2026,
      },
      {
        missionDurationSeconds: 24 * 60 * 60,
        stepSeconds: 60 * 60,
        missionControlChoice,
      },
    );
  }, [state.step, state.design, result, missionControlChoice]);

  const value = useMemo(
    () => ({
      state,
      result,
      simulation,
      missionControlChoice,
      setMissionControlChoice,
      dispatch,
    }),
    [state, result, simulation, missionControlChoice],
  );

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
