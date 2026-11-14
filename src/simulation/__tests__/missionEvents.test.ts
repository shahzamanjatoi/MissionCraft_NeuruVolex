
import { describe, it, expect } from "vitest";
import type { MissionState, MissionSimulationConfig } from "../../types/simulation";
import { applyMissionEvent, changeLoadMode } from "../missionEvents";

const initialState: MissionState = {
  phase: "operations",
  elapsedSeconds: 0,
  propellantKg: 100,
  deltaVReserveMs: 1000,
  batteryWh: 500,
  solarGenerationW: 200,
  loadW: 100,
  fullLoadW: 100,
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

const config: MissionSimulationConfig = {
  scienceDataGenerationMBPerHour: 10,
  downlinkRateBps: 1000,
  requiredScienceDataMB: 100,
  requiredDataReturnFraction: 0.8,
  essentialLoadW: 40,
};

describe("mission events", () => {
  it("switches to essential-only power mode", () => {
    const result = changeLoadMode(initialState, "essential-only", config);

    expect(result.loadW).toBe(40);
    expect(result.loadMode).toBe("essential-only");
  });

  it("restores full power when switching back", () => {
    const reduced = changeLoadMode(initialState, "essential-only", config);
    const restored = changeLoadMode(reduced, "full", config);

    expect(restored.loadW).toBe(100);
    expect(restored.loadMode).toBe("full");
  });

  it("does not apply the same event twice", () => {
    const event = {
      id: "eclipse-1",
      type: "eclipse-start" as const,
      missionTimeSeconds: 300,
    };

    const first = applyMissionEvent(initialState, event);
    const second = applyMissionEvent(first, event);

    expect(first.inEclipse).toBe(true);
    expect(second.eventsTriggered).toHaveLength(1);
  });
});
