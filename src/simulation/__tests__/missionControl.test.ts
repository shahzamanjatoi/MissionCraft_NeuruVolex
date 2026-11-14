
import { describe, it, expect } from "vitest";
import type {
  MissionSimulationConfig,
  MissionState,
} from "../../types/simulation";
import { applyMissionControlDecision } from "../missionControl";

const state: MissionState = {
  phase: "operations",
  elapsedSeconds: 300,
  propellantKg: 100,
  deltaVReserveMs: 1000,
  batteryWh: 500,
  solarGenerationW: 200,
  loadW: 100,
  fullLoadW: 100,
  loadMode: "full",
  inEclipse: true,
  communicationAvailable: true,
  dataGeneratedMB: 0,
  dataStoredMB: 0,
  dataTransmittedMB: 0,
  eventsTriggered: ["eclipse-1"],
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

describe("mission control decisions", () => {
  it("conserves power when requested", () => {
    const result = applyMissionControlDecision(
      state,
      "eclipse-1",
      "conserve-power",
      config,
    );

    expect(result.loadW).toBe(40);
    expect(result.loadMode).toBe("essential-only");
  });

  it("maintains full load when requested", () => {
    const result = applyMissionControlDecision(
      state,
      "eclipse-1",
      "maintain-full-load",
      config,
    );

    expect(result.loadW).toBe(100);
    expect(result.loadMode).toBe("full");
  });

  it("records the decision and its mission time", () => {
    const result = applyMissionControlDecision(
      state,
      "eclipse-1",
      "conserve-power",
      config,
    );

    expect(result.decisions).toHaveLength(1);
    expect(result.decisions[0].missionTimeSeconds).toBe(300);
  });

  it("does not record a second decision for the same event", () => {
    const first = applyMissionControlDecision(
      state,
      "eclipse-1",
      "conserve-power",
      config,
    );

    const second = applyMissionControlDecision(
      first,
      "eclipse-1",
      "maintain-full-load",
      config,
    );

    expect(second.loadMode).toBe("essential-only");
    expect(second.decisions).toHaveLength(1);
  });
});
