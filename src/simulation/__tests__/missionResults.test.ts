
import { describe, it, expect } from "vitest";
import type {
  MissionState,
  MissionSimulationConfig,
} from "../../types/simulation";
import { summarizeMission } from "../missionResults";

const config: MissionSimulationConfig = {
  scienceDataGenerationMBPerHour: 10,
  downlinkRateBps: 1000000,
  requiredScienceDataMB: 100,
  requiredDataReturnFraction: 0.8,
  essentialLoadW: 40,
};

const state: MissionState = {
  phase: "completed",
  elapsedSeconds: 3600,
  propellantKg: 90,
  deltaVReserveMs: 1500,
  batteryWh: 400,
  solarGenerationW: 200,
  loadW: 100,
  fullLoadW: 100,
  loadMode: "full",
  inEclipse: false,
  communicationAvailable: true,
  dataGeneratedMB: 100,
  dataStoredMB: 0,
  dataTransmittedMB: 90,
  eventsTriggered: [],
  decisions: [],
  failureReasons: [],
};

describe("mission results", () => {
  it("marks a completed mission with enough returned data as success", () => {
    const result = summarizeMission(state, config);

    expect(result.outcome).toBe("success");
    expect(result.scienceDataGeneratedMB).toBe(100);
    expect(result.scienceDataReturnedMB).toBe(90);
  });

  it("marks a mission as partial when some science data was generated but not enough returned", () => {
    const result = summarizeMission(
      { ...state, dataTransmittedMB: 50 },
      config,
    );

    expect(result.outcome).toBe("partial");
    expect(result.failureReasons).toContain(
      "Mission did not return enough science data to Earth.",
    );
  });

  it("marks a mission as partial when it generated some but insufficient data", () => {
    const result = summarizeMission(
      {
        ...state,
        dataGeneratedMB: 50,
        dataTransmittedMB: 50,
      },
      config,
    );

    expect(result.outcome).toBe("partial");
    expect(result.failureReasons).toContain(
      "Mission did not generate the required science data.",
    );
  });

  it("marks a mission with no science data as failure", () => {
    const result = summarizeMission(
      {
        ...state,
        phase: "failed",
        dataGeneratedMB: 0,
        dataTransmittedMB: 0,
      },
      config,
    );

    expect(result.outcome).toBe("failure");
  });

  it("preserves existing mission failure reasons", () => {
    const result = summarizeMission(
      {
        ...state,
        phase: "failed",
        failureReasons: ["Battery depleted."],
      },
      config,
    );

    expect(result.failureReasons).toContain("Battery depleted.");
  });
});
