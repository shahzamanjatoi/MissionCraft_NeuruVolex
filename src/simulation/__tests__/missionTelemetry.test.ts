
import { describe, it, expect } from "vitest";
import type { MissionState } from "../../types/simulation";
import {
  captureTelemetry,
  appendTelemetry,
} from "../missionTelemetry";

const state: MissionState = {
  phase: "operations",
  elapsedSeconds: 600,
  propellantKg: 90,
  deltaVReserveMs: 1500,
  batteryWh: 400,
  solarGenerationW: 200,
  loadW: 100,
  fullLoadW: 100,
  loadMode: "full",
  inEclipse: false,
  communicationAvailable: true,
  dataGeneratedMB: 15,
  dataStoredMB: 10,
  dataTransmittedMB: 5,
  eventsTriggered: [],
  decisions: [],
  failureReasons: [],
};

describe("mission telemetry", () => {
  it("captures the spacecraft state", () => {
    const record = captureTelemetry(state);

    expect(record.elapsedSeconds).toBe(600);
    expect(record.batteryWh).toBe(400);
    expect(record.propellantKg).toBe(90);
    expect(record.phase).toBe("operations");
  });

  it("records zero solar generation during an eclipse", () => {
    const eclipseState = { ...state, inEclipse: true };

    const record = captureTelemetry(eclipseState);

    expect(record.inEclipse).toBe(true);
    expect(record.solarGenerationW).toBe(0);
  });

  it("adds a telemetry record without changing the old history", () => {
    const history = [captureTelemetry(state)];
    const updated = appendTelemetry(history, {
      ...state,
      elapsedSeconds: 1200,
      batteryWh: 350,
    });

    expect(history).toHaveLength(1);
    expect(updated).toHaveLength(2);
    expect(updated[1].elapsedSeconds).toBe(1200);
    expect(updated[1].batteryWh).toBe(350);
  });

  it("keeps only the latest records when the limit is reached", () => {
    const first = appendTelemetry([], state, 2);
    const second = appendTelemetry(
      first,
      { ...state, elapsedSeconds: 1200 },
      2,
    );
    const third = appendTelemetry(
      second,
      { ...state, elapsedSeconds: 1800 },
      2,
    );

    expect(third).toHaveLength(2);
    expect(third[0].elapsedSeconds).toBe(1200);
    expect(third[1].elapsedSeconds).toBe(1800);
  });
});
