import { createContext, type Dispatch } from "react";
import type { GameAction, GameState } from "./gameReducer";
import type { MissionResult } from "../types/mission";
import type { MissionRunOutput } from "../simulation/missionRunner";

export interface GameContextValue {
  state: GameState;
  result: MissionResult;
  simulation: MissionRunOutput | null;
  dispatch: Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextValue | null>(null);