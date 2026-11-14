import { describe, it, expect } from "vitest";
import { createInitialState, gameReducer } from "../gameReducer";
import { INSTRUMENTS } from "../../data/instruments";
import { evaluateMission } from "../../engine";

describe("gameReducer", () => {
  it("starts on the target step with a feasible design", () => {
    const s = createInitialState();
    expect(s.step).toBe("target");
    expect(evaluateMission(s.design).feasible).toBe(true);
  });

  it("starts on the first level", () => {
    expect(createInitialState().design.target).toBe("LEO");
  });

  it("ignores a locked target", () => {
    const s = gameReducer(createInitialState(), { type: "SET_TARGET", target: "Mars" });
    expect(s.design.target).toBe("LEO");
  });

  it("changing to an unlocked target loads its starter design", () => {
    let s = gameReducer(createInitialState(), { type: "UNLOCK_ALL" });
    s = gameReducer(s, { type: "SET_TARGET", target: "Mars" });
    expect(s.design.target).toBe("Mars");
  });

  it("winning a level opens the next and keeps progress after reset", () => {
    let s = createInitialState();
    for (let i = 0; i < 3; i++) s = gameReducer(s, { type: "NEXT" });
    expect(s.step).toBe("results");
    expect(s.completed).toEqual(["LEO"]);
    s = gameReducer(s, { type: "RESET" });
    expect(s.completed).toEqual(["LEO"]);
    s = gameReducer(s, { type: "SET_TARGET", target: "GEO" });
    expect(s.design.target).toBe("GEO");
  });

  it("a failed mission does not complete the level", () => {
    let s = gameReducer(createInitialState(), { type: "SET_NUMBER", field: "solarArea_m2", value: 0 });
    for (let i = 0; i < 3; i++) s = gameReducer(s, { type: "NEXT" });
    expect(s.completed).toEqual([]);
  });

  it("does not mutate the shared starter design", () => {
    const start = createInitialState();
    gameReducer(start, { type: "SET_NUMBER", field: "propellantMass_kg", value: 999 });
    const fresh = createInitialState();
    expect(fresh.design.spacecraft.propellantMass_kg).not.toBe(999);
  });

  it("toggles an instrument on and off", () => {
    const radiometer = INSTRUMENTS.find((i) => i.id === "radiometer")!;
    let s = createInitialState();
    const before = s.design.spacecraft.instruments.length;
    s = gameReducer(s, { type: "TOGGLE_INSTRUMENT", instrument: radiometer });
    expect(s.design.spacecraft.instruments).toHaveLength(before + 1);
    s = gameReducer(s, { type: "TOGGLE_INSTRUMENT", instrument: radiometer });
    expect(s.design.spacecraft.instruments).toHaveLength(before);
  });

  it("removing the solar panels makes the design fail", () => {
    const s = gameReducer(createInitialState(), { type: "SET_NUMBER", field: "solarArea_m2", value: 0 });
    expect(evaluateMission(s.design).feasible).toBe(false);
  });

  it("moves through steps and stops at the ends", () => {
    let s = createInitialState();
    s = gameReducer(s, { type: "BACK" });
    expect(s.step).toBe("target");
    for (let i = 0; i < 6; i++) s = gameReducer(s, { type: "NEXT" });
    expect(s.step).toBe("results");
    expect(gameReducer(s, { type: "RESET" }).step).toBe("target");
  });

  it("never lets a number go below zero", () => {
    const s = gameReducer(createInitialState(), { type: "SET_NUMBER", field: "batteryWh", value: -50 });
    expect(s.design.spacecraft.batteryWh).toBe(0);
  });
});
