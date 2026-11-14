import "./App.css";
import { GameProvider } from "./store/GameProvider";
import { useGame } from "./store/useGame";
import { STEP_ORDER } from "./store/gameReducer";
import { TargetPicker } from "./components/TargetPicker";
import { RocketPicker } from "./components/RocketPicker";
import { SpacecraftBuilder } from "./components/SpacecraftBuilder";
import { ScoreBoard } from "./components/ScoreBoard";
import { Results } from "./components/Results";
import { VideoBackground } from "./components/VideoBackground";
import { NasaResources } from "./components/NasaResources";

function Game() {
  const { state, dispatch } = useGame();
  const idx = STEP_ORDER.indexOf(state.step);
  return (
    <div className="app">
      <header>
        <h1>MissionCraft</h1>
        <p>Design a space mission. Team Neuru Volex · NASA Space Apps 2026</p>
        <ol className="steps">
          {STEP_ORDER.map((s, i) => (
            <li key={s} className={i === idx ? "current" : i < idx ? "done" : ""}>{s}</li>
          ))}
        </ol>
      </header>
      <main>
        <div className="panel">
          {state.step === "target" && <TargetPicker />}
          {state.step === "rocket" && <RocketPicker />}
          {state.step === "spacecraft" && <SpacecraftBuilder />}
          {state.step === "results" && <Results />}
          {state.step !== "results" && (
            <div className="nav">
              <button type="button" disabled={idx === 0} onClick={() => dispatch({ type: "BACK" })}>Back</button>
              <button type="button" className="primary" onClick={() => dispatch({ type: "NEXT" })}>
                {state.step === "spacecraft" ? "Launch!" : "Next"}
              </button>
            </div>
          )}
        </div>
        {state.step !== "target" && <ScoreBoard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <VideoBackground />
      <>
      <Game />
      <NasaResources />
      </>
    </GameProvider>
  );
}
