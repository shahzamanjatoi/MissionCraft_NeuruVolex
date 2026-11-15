
﻿import { lazy, Suspense } from "react";
import { useGame } from "../store/useGame";
import { LaunchReplay } from "./LaunchReplay";
import { useGame } from "../store/useGame";

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
}

const SceneCanvas = lazy(() =>
  import("../3d/components/SceneCanvas").then((module) => ({
    default: module.SceneCanvas,
  })),
);

const TARGET_NAME: Record<string, string> = {
  LEO: "Low Earth Orbit",
  GEO: "Geostationary Orbit",
  Moon: "Moon",
  Mars: "Mars",
};

export function Results() {
  const {
    state,
    result,
    simulation,
    missionControlChoice,
    setMissionControlChoice,
    dispatch,
  } = useGame();

  const eclipseTelemetry =
    simulation?.telemetry.filter((record) => record.inEclipse) ?? [];

  const eclipseStart = eclipseTelemetry[0];
  const eclipseEnd = eclipseTelemetry[eclipseTelemetry.length - 1];

  const eclipseBatteryUsed =
    eclipseStart && eclipseEnd
      ? eclipseStart.batteryWh - eclipseEnd.batteryWh
      : null;

  return (
    <section>
      <h2 className="step-title">
        <span className="step-num mono">04</span> Mission Results
      </h2>

      <section>
        <h3>Engineering Evaluation</h3>
      <h3>Engineering Evaluation</h3>
      <p className={r.feasible ? "verdict good" : "verdict bad"}>
        {r.feasible
          ? "Engineering checks passed."
          : "Engineering checks found problems."}
      </p>

      <div className="result-kpis">
        <div><span>Target</span><strong className="mono">{state.design.target}</strong></div>
        <div><span>Score</span><strong className="mono">{r.score}/100</strong></div>
        <div><span>Cost</span><strong className="mono">${r.cost_musd}M</strong></div>
      </div>

      {r.warnings.length > 0 && (
        <>
          <h3>Engineering Warnings</h3>
          <ul>
            {r.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </>
      )}

        <p>
          Engineering checks:{" "}
          <strong>
            {result.feasible ? "Passed" : "Not passed"}
          </strong>
        </p>

        <p>
          Target: <strong>{state.design.target}</strong>
        </p>

        <p>
          Score: <strong>{result.score}/100</strong>
        </p>

        <p>
          Cost: <strong>${result.cost_musd.toFixed(1)}M</strong>
        </p>

        <p>
          Thermal:{" "}
          <strong>
            {result.thermalOk ? "Within limits" : "Outside limits"}
          </strong>
        </p>

        <p>
          Thermal margin:{" "}
          <strong>{(result.thermalMargin * 100).toFixed(1)}%</strong>
        </p>

        <p>
          Mission risk:{" "}
          <strong>
            {result.riskLevel} ({(result.riskScore * 100).toFixed(0)}/100)
          </strong>
        </p>

        <p>
          Power margin: <strong>{result.powerMargin.toFixed(2)}</strong>
        </p>

        <p>
          Communication:{" "}
          <strong>{result.commsOk ? "Pass" : "Needs attention"}</strong>
        </p>

        {result.warnings.length > 0 && (
          <>
            <h4>Engineering Warnings</h4>
            <ul>
              {result.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </>
        )}

        {result.riskDrivers.length > 0 && (
          <>
            <h4>Mission Risk Factors</h4>
            <ul>
              {result.riskDrivers.map((driver, index) => (
                <li key={index}>{driver}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section>
        <h3>Mission Control</h3>

        <p>
          During an eclipse, solar panels stop generating power. Choose how
          the spacecraft should manage its power consumption.
        </p>

        <button
          type="button"
          onClick={() => setMissionControlChoice("conserve-power")}
        >
          Conserve Power
        </button>

        <button
          type="button"
          onClick={() => setMissionControlChoice("maintain-full-load")}
        >
          Maintain Full Load
        </button>

        {missionControlChoice ? (
          <p>
            Selected decision:{" "}
            <strong>
              {missionControlChoice === "conserve-power"
                ? "Conserve Power"
                : "Maintain Full Load"}
          <section className="mission-visualization" aria-label="Interactive 3D mission visualization">
            <div className="mission-visualization__heading">
              <div>
                <span className="mission-visualization__eyebrow">MISSION CONTROL / LIVE REPLAY</span>
                <h3>Mission Visualization</h3>
              </div>
              <span className="mission-visualization__target mono">
                {TARGET_NAME[state.design.target]}
              </span>
            </div>
            <Suspense
              fallback={
                <div className="scene-loading" role="status">
                  Initializing mission visualization…
                </div>
              }
            >
              <SceneCanvas
                target={state.design.target}
                simulation={simulation}
                targetName={TARGET_NAME[state.design.target]}
                batteryCapacityWh={state.design.spacecraft.batteryWh}
              />
            </Suspense>
          </section>

          <p>
            Outcome:{" "}
            <strong className="mono">
              {simulation.summary.outcome.toUpperCase()}
            </strong>
          </p>
        ) : (
          <p>Select a decision to run the mission simulation.</p>
        )}
      </section>

      {simulation && (
        <section>
          <h3>Mission Outcome</h3>

          <p>
            Outcome:{" "}
            <strong>{simulation.summary.outcome.toUpperCase()}</strong>
          </p>

          <p>
            Final phase: <strong>{simulation.finalState.phase}</strong>
          </p>

          <p>
            Mission time:{" "}
            <strong>
            Final phase:{" "}
            <strong className="mono">{simulation.summary.phaseReached}</strong>
          </p>

          <p>
            Simulated mission time:{" "}
            <strong className="mono">
              {formatTime(simulation.finalState.elapsedSeconds)}
            </strong>
          </p>

          <h3>Mission Control Decision Record</h3>

          {simulation.finalState.decisions.length > 0 ? (
            <ul>
              {simulation.finalState.decisions.map((decision) => (
                <li key={decision.eventId}>
                  {decision.choiceId === "conserve-power"
                    ? "Conserve Power"
                    : "Maintain Full Load"}{" "}
                  — {formatTime(decision.missionTimeSeconds)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No Mission Control decisions were recorded.</p>
          )}

          <h3>Science Data</h3>

          <ul>
            <li>
              Generated:{" "}
              {simulation.summary.scienceDataGeneratedMB.toFixed(2)} MB
            </li>
            <li>
              Returned to Earth:{" "}
              {simulation.summary.scienceDataReturnedMB.toFixed(2)} MB
            </li>
          </ul>

          <h3>Eclipse Power Report</h3>

          {eclipseStart && eclipseEnd && eclipseBatteryUsed !== null ? (
            <ul>
              <li>
                Battery at eclipse start:{" "}
                {eclipseStart.batteryWh.toFixed(2)} Wh
              </li>
              <li>
                Battery at eclipse end:{" "}
                {eclipseEnd.batteryWh.toFixed(2)} Wh
              </li>
              <li>
                Battery consumed during eclipse:{" "}
                {eclipseBatteryUsed.toFixed(2)} Wh
              </li>
              <li>
                Power load during eclipse:{" "}
                {eclipseEnd.loadW.toFixed(2)} W
              </li>
            </ul>
          ) : (
            <p>Eclipse telemetry is not available.</p>
          )}

          <h3>Spacecraft Status</h3>

          <ul>
            <li>
              Battery: {simulation.finalState.batteryWh.toFixed(2)} Wh
            </li>
            <li>
              Propellant:{" "}
              {simulation.finalState.propellantKg.toFixed(2)} kg
            </li>
            <li>
              Delta-v reserve:{" "}
              {simulation.finalState.deltaVReserveMs.toFixed(2)} m/s
            </li>
            <li>
              Communication:{" "}
              {simulation.finalState.communicationAvailable
                ? "Available"
                : "Unavailable"}
            </li>
          </ul>

          <h3>Mission Events</h3>

          {simulation.events.length > 0 ? (
            <ul>
              {simulation.events.map((event) => (
                <li key={event.id}>
                  {event.type.replaceAll("-", " ")} —{" "}
                  {formatTime(event.missionTimeSeconds)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No mission events recorded.</p>
          )}

          {simulation.summary.failureReasons.length > 0 && (
            <>
              <h3>Mission Failure Reasons</h3>
              <ul>
                {simulation.summary.failureReasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </>
          )}

          <h3>Telemetry History</h3>

          <p>
            {simulation.telemetry.length} telemetry records captured.
          </p>
        </section>
      )}

      <LaunchReplay />

      <button
        type="button"
        onClick={() => dispatch({ type: "RESET" })}
      >
        Play Again
      </button>
    </section>
  );
}