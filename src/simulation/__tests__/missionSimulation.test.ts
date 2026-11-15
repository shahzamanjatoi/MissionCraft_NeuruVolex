import { describe, it, expect } from "vitest";
import type { MissionStartSnapshot } from "../../types/simulation";
import { createInitialMissionState } from "../missionController";
import { advanceMissionTime } from "../missionSimulation";

const snapshot: MissionStartSnapshot = {
  design: {
    launchVehicle: {
      name: "Test Rocket",
      payloadToLEO_kg: 2000,
      cost_musd: 15,
    },
    target: "LEO",
    spacecraft: {
      dryMass_kg: 100,
      propellantMass_kg: 100,
      isp_s: 300,
      solarArea_m2: 1,
      batteryWh: 1000,
      antennaGain_dBi: 25,
      instruments: [],
    },
  },
  evaluation: {
    feasible: true,
    deltaVAvailable_ms: 3000,
    deltaVRequired_ms: 2000,
    powerMargin: 1,
    thermalMargin: 1,
    thermalOk: true,
    riskScore: 0.1,
    riskLevel: "low",
    riskDrivers: [],
    massMargin: 0.5,
    commsOk: true,
    cost_musd: 20,
    score: 80,
    warnings: [],
  },
  config: {
    scienceDataGenerationMBPerHour: 10,
    downlinkRateBps: 100000,
    requiredScienceDataMB: 100,
    requiredDataReturnFraction: 0.8,
    essentialLoadW: 40,
  },
  eventSeed: 12345,
};

const initialState = createInitialMissionState(snapshot);

describe("mission time simulation", () => {
  it("charges the battery when solar power exceeds the load", () => {
    const state = {
      ...initialState,
      phase: "operations" as const,
      batteryWh: 500,
      solarGenerationW: 200,
      loadW: 100,
    };

    const result = advanceMissionTime(state, snapshot, {
      durationSeconds: 3600,
    });

    expect(result.batteryWh).toBe(600);
  });

  it("drains the battery during an eclipse", () => {
    const state = {
      ...initialState,
      phase: "operations" as const,
      batteryWh: 500,
      loadW: 100,
      inEclipse: true,
    };

    const result = advanceMissionTime(state, snapshot, {
      durationSeconds: 3600,
    });

    expect(result.batteryWh).toBe(400);
  });

  it("generates science data during operations", () => {
    const state = {
      ...initialState,
      phase: "operations" as const,
    };

    const result = advanceMissionTime(state, snapshot, {
      durationSeconds: 3600,
    });

    expect(result.dataGeneratedMB).toBe(10);
    expect(result.dataStoredMB).toBe(10);
  });

  it("transmits stored science data when communication is available", () => {
    const state = {
      ...initialState,
      phase: "communication" as const,
      dataStoredMB: 20,
    };

    const result = advanceMissionTime(state, snapshot, {
      durationSeconds: 3600,
      inContactWindow: true,
    });

    expect(result.dataTransmittedMB).toBe(30);
    expect(result.dataStoredMB).toBe(0);
  });

  it("fails the mission when the battery is depleted", () => {
    const state = {
      ...initialState,
      phase: "operations" as const,
      batteryWh: 1,
      loadW: 100,
      inEclipse: true,
    };

    const result = advanceMissionTime(state, snapshot, {
      durationSeconds: 3600,
    });

    expect(result.phase).toBe("failed");
    expect(result.batteryWh).toBe(0);
    expect(result.failureReasons.length).toBeGreaterThan(0);
  });
});