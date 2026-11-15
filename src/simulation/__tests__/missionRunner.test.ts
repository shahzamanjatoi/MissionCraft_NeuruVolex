import { describe, it, expect } from "vitest";
import type {
  MissionStartSnapshot,
} from "../../types/simulation";
import { runMissionSimulation } from "../missionRunner";

const snapshot: MissionStartSnapshot = {
  design: {
    launchVehicle: {
      name: "Test Rocket",
      payloadToLEO_kg: 1000,
      cost_musd: 50,
    },
    target: "Moon",
    spacecraft: {
      dryMass_kg: 500,
      propellantMass_kg: 100,
      isp_s: 300,
      solarArea_m2: 10,
      batteryWh: 1000,
      antennaGain_dBi: 20,
      instruments: [
        {
          name: "Camera",
          mass_kg: 10,
          power_W: 50,
        },
      ],
    },
  },
  evaluation: {
    feasible: true,
    deltaVAvailable_ms: 3000,
    deltaVRequired_ms: 2500,
    powerMargin: 1,
    thermalMargin: 1,
    thermalOk: true,
    riskScore: 0.1,
    riskLevel: "low",
    riskDrivers: [],
    massMargin: 0.2,
    commsOk: true,
    cost_musd: 50,
    score: 90,
    warnings: [],
  },
  config: {
    scienceDataGenerationMBPerHour: 10,
    downlinkRateBps: 1000000,
    requiredScienceDataMB: 50,
    requiredDataReturnFraction: 0.8,
    essentialLoadW: 40,
  },
  eventSeed: 12345,
};

describe("mission runner", () => {
  it("runs a mission through to completion", () => {
    const result = runMissionSimulation(snapshot, {
      missionDurationSeconds: 86400,
      stepSeconds: 3600,
    });

    expect(result.finalState.phase).toBe("completed");
    expect(result.summary.outcome).toBe("success");
  });

  it("generates mission events", () => {
    const result = runMissionSimulation(snapshot, {
      missionDurationSeconds: 86400,
    });

    expect(result.events).toHaveLength(4);
    expect(result.finalState.eventsTriggered).toHaveLength(4);
  });

  it("records telemetry throughout the mission", () => {
    const result = runMissionSimulation(snapshot, {
      missionDurationSeconds: 86400,
    });

    expect(result.telemetry.length).toBeGreaterThan(1);
    expect(result.telemetry[0].elapsedSeconds).toBe(0);
    expect(
      result.telemetry[result.telemetry.length - 1].phase,
    ).toBe("completed");
  });

  it("produces the same result when run with the same seed", () => {
    const first = runMissionSimulation(snapshot, {
      missionDurationSeconds: 86400,
    });

    const second = runMissionSimulation(snapshot, {
      missionDurationSeconds: 86400,
    });

    expect(first.events).toEqual(second.events);
    expect(first.finalState).toEqual(second.finalState);
    expect(first.summary).toEqual(second.summary);
  });

  it("rejects an invalid mission duration", () => {
    expect(() =>
      runMissionSimulation(snapshot, {
        missionDurationSeconds: 0,
      }),
    ).toThrow("Mission duration must be a positive number.");
  });

  it("rejects an invalid simulation step", () => {
    expect(() =>
      runMissionSimulation(snapshot, {
        missionDurationSeconds: 86400,
        stepSeconds: 0,
      }),
    ).toThrow("Simulation step must be a positive number.");
  });
});