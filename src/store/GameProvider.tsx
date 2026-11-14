import { useMemo, useReducer, type ReactNode } from "react";
import { evaluateMission } from "../engine";
import { GameContext } from "./GameContext";
import { createInitialState, gameReducer } from "./gameReducer";

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  // The result is recomputed from the design every time, so the scoreboard is always live.
  const result = useMemo(() => evaluateMission(state.design), [state.design]);
  const value = useMemo(() => ({ state, result, dispatch }), [state, result]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
