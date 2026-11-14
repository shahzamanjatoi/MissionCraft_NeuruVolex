
import { useGame } from "../store/useGame";
import { LaunchReplay } from "./LaunchReplay";

export function Results() {
  const { result: r, state, simulation, dispatch } = useGame();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <section>
      <h2>Mission Results</h2>

      <h3>Engineering Evaluation</h3>
      <p className={r.feasible ? "verdict good" : "verdict bad"}>
        {r.feasible
          ? "Engineering checks passed."
          : "Engineering checks found problems."}
      </p>

      <p>
        Target: <strong>{state.design.target}</strong> · Score:{" "}
        <strong>{r.score}/100</strong> · Cost:{" "}
        <strong>${r.cost_musd}M</strong>
      </p>

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

          <p>
            Outcome:{" "}
            <strong>
              {simulation.summary.outcome.toUpperCase()}
            </strong>
          </p>

          <p>
            Final phase:{" "}
            <strong>{simulation.summary.phaseReached}</strong>
          </p>

          <p>
            Simulated mission time:{" "}
            <strong>
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
