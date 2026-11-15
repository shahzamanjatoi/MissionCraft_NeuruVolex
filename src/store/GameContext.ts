
import { createContext, type Dispatch, type SetStateAction } from "react";
import type { GameAction, GameState } from "./gameReducer";
import type { MissionResult } from "../types/mission";
import type { MissionRunOutput } from "../simulation/missionRunner";
import type { MissionControlChoice } from "../simulation/missionControl";

export interface GameContextValue {
  state: GameState;
  result: MissionResult;
  simulation: MissionRunOutput | null;
  missionControlChoice: MissionControlChoice | null;
  setMissionControlChoice: Dispatch<
    SetStateAction<MissionControlChoice | null>
  >;
  dispatch: Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextValue | null>(null);
