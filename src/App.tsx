import { useState } from "react";
import "./App.css";
import "./simulator.css";
import { GameProvider } from "./store/GameProvider";
import { useGame } from "./store/useGame";
import { LaunchCountdown } from "./components/LaunchCountdown";
import { DesignDesk } from "./components/DesignDesk";
import { LaunchPhase } from "./components/LaunchPhase";
import { FlightPhase } from "./components/FlightPhase";
import { DebriefPhase } from "./components/DebriefPhase";
import { PhaseBar, PHASES, type Phase } from "./components/PhaseBar";
import type { Quality } from "./components/Scene3D";
import { NasaResources } from "./components/NasaResources";
import { Navbar, type PageId } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { TeamPage } from "./pages/TeamPage";
import { ContactPage } from "./pages/ContactPage";
import { beep, setMasterVolume } from "./sfx";

const RANKS = ["Cadet", "Flight Engineer", "Mission Specialist", "Flight Director", "Mission Commander"];

function SimulatorView() {
  const { state, dispatch, simulation } = useGame();
  const [phase, setPhase] = useState<Phase>("design");
  const [maxIdx, setMaxIdx] = useState(0);
  const [quality, setQuality] = useState<Quality>("high");
  const [volume, setVolume] = useState(0.8);
  const [launching, setLaunching] = useState(false);

  const rank = RANKS[Math.min(state.completed.length, RANKS.length - 1)];

  const go = (p: Phase) => {
    const i = PHASES.findIndex((x) => x.id === p);
    setPhase(p);
    // going back to design means the launch gate must be passed again
    setMaxIdx(p === "design" ? 0 : (m: number) => Math.max(m, i));
  };

  // The simulation is generated once the game reaches its final step.
  const startFlight = () => {
    dispatch({ type: "NEXT" });
    dispatch({ type: "NEXT" });
    dispatch({ type: "NEXT" });
    setLaunching(false);
    go("flight");
  };

  return (
    <div className="sim">
      <PhaseBar
        phase={phase}
        maxIdx={maxIdx}
        rank={rank}
        quality={quality}
        volume={volume}
        onSelect={go}
        onQuality={setQuality}
        onVolume={(v) => {
          setVolume(v);
          setMasterVolume(v);
          beep(660, 0.08);
        }}
      />

      <div
        className="container sim-stage"
        key={phase}
        onClickCapture={(e) => {
          if ((e.target as HTMLElement).closest(".opt:not(:disabled)")) beep(520, 0.07, "triangle", 0.05);
        }}
      >
        {phase === "design" && (
          <DesignDesk
            quality={quality}
            onNext={() => {
              beep(640, 0.08, "triangle", 0.05);
              go("launch");
            }}
          />
        )}
        {phase === "launch" && (
          <LaunchPhase quality={quality} onBack={() => go("design")} onLaunch={() => setLaunching(true)} />
        )}
        {phase === "flight" && <FlightPhase quality={quality} onDebrief={() => go("debrief")} />}
        {phase === "debrief" &&
          (simulation ? (
            <DebriefPhase
              simulation={simulation}
              onReplay={() => go("flight")}
              onRedesign={() => go("design")}
              onNextMission={(t) => {
                dispatch({ type: "SET_TARGET", target: t });
                go("design");
              }}
            />
          ) : (
            <p className="hint">No flight data yet. Launch a mission first.</p>
          ))}
      </div>

      {launching && <LaunchCountdown onAbort={() => setLaunching(false)} onDone={startFlight} />}
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
