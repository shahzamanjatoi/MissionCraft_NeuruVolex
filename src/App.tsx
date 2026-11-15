import { useState } from "react";
import "./App.css";
import { GameProvider } from "./store/GameProvider";
import { useGame } from "./store/useGame";
import { STEP_ORDER } from "./store/gameReducer";
import { TargetPicker } from "./components/TargetPicker";
import { RocketPicker } from "./components/RocketPicker";
import { SpacecraftBuilder } from "./components/SpacecraftBuilder";
import { ScoreBoard } from "./components/ScoreBoard";
import { Results } from "./components/Results";
import { NasaResources } from "./components/NasaResources";
import { Navbar, type PageId } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { TeamPage } from "./pages/TeamPage";
import { ContactPage } from "./pages/ContactPage";

function SimulatorView() {
  const { state, dispatch } = useGame();
  const idx = STEP_ORDER.indexOf(state.step);

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div className="simulator-header">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Mission Simulator</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Configure your planetary target, launch vehicle, and spacecraft subsystems.
          </p>
        </div>
        <ol className="steps">
          {STEP_ORDER.map((s, i) => (
            <li key={s} className={i === idx ? "current" : i < idx ? "done" : ""}>
              {s}
            </li>
          ))}
        </ol>
      </div>

      <div className={state.step !== "target" ? "simulator-layout" : ""}>
        <div className="panel">
          {state.step === "target" && <TargetPicker />}
          {state.step === "rocket" && <RocketPicker />}
          {state.step === "spacecraft" && <SpacecraftBuilder />}
          {state.step === "results" && <Results />}

          {state.step !== "results" && (
            <div className="nav">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => dispatch({ type: "BACK" })}
              >
                Back
              </button>
              <button
                type="button"
                className="primary"
                onClick={() => dispatch({ type: "NEXT" })}
              >
                {state.step === "spacecraft" ? "Launch!" : "Next"}
              </button>
            </div>
          )}
        </div>

        {state.step !== "target" && (
          <aside className="sticky-sidebar">
            <ScoreBoard />
          </aside>
        )}
      </div>
    </div>
  );
}

function ScienceView() {
  return (
    <div className="container" style={{ padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: "760px", marginBottom: "2.5rem" }}>
        <span style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase" }}>
          Open Aerospace Data & Physics
        </span>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "0.25rem", marginBottom: "0.75rem" }}>
          Science & NASA Datasets
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          All delta-v budgets, trajectory transfers, payload constraints, and instrument specifications in MissionCraft are grounded in real NASA missions and open datasets.
        </p>
      </div>
      <div className="nasa-grid-wrapper">
        <NasaResources />
      </div>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("home");

  return (
    <GameProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Navbar activePage={activePage} onNavigate={setActivePage} />

        <main style={{ flex: 1 }}>
          {activePage === "home" && <HomePage onNavigate={setActivePage} />}
          {activePage === "simulator" && <SimulatorView />}
          {activePage === "science" && <ScienceView />}
          {activePage === "team" && <TeamPage />}
          {activePage === "contact" && <ContactPage />}
        </main>

        <Footer onNavigate={setActivePage} />
      </div>
    </GameProvider>
  );
}
