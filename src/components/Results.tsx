import { lazy, Suspense } from "react";
import { useGame } from "../store/useGame";
import { LaunchReplay } from "./LaunchReplay";

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
  const { result: r, state, simulation, dispatch } = useGame();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <section>
      <h2 className="step-title">
        <span className="step-num mono">04</span> Mission Results
      </h2>

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

      {simulation && (
        <>
          <hr />
          <h3>Mission Simulation</h3>

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
                key={state.design.target}
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

          <p>
            Final phase:{" "}
            <strong className="mono">{simulation.summary.phaseReached}</strong>
          </p>

          <p>
            Simulated mission time:{" "}
            <strong className="mono">
              {formatTime(simulation.finalState.elapsedSeconds)}
            </strong>
          </p>

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
            <li>
              Still stored:{" "}
              {simulation.finalState.dataStoredMB.toFixed(2)} MB
            </li>
          </ul>

          <h3>Spacecraft Status</h3>
          <ul>
            <li>
              Battery remaining:{" "}
              {simulation.finalState.batteryWh.toFixed(2)} Wh
            </li>
            <li>
              Propellant remaining:{" "}
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
              <h3>Simulation Issues</h3>
              <ul>
                {simulation.summary.failureReasons.map((reason, index) => (
                  <li key={`${reason}-${index}`}>{reason}</li>
                ))}
              </ul>
            </>
          )}

          <h3>Telemetry History</h3>
          <p>
            {simulation.telemetry.length} telemetry records captured during
            the simulation.
          </p>
          <p>
            Final battery:{" "}
            {simulation.telemetry[
              simulation.telemetry.length - 1
            ]?.batteryWh.toFixed(2) ?? "N/A"}{" "}
            Wh
          </p>
        </>
      )}

      <LaunchReplay />
      <button
        type="button"
        className="primary"
        onClick={() => dispatch({ type: "RESET" })}
      >
        Play again
      </button>
    </section>
  );
}