import { lazy, Suspense, useEffect, useMemo, useRef } from "react";
import type { UseMissionSceneReturn } from "../3d/hooks/useMissionScene";
import type { MissionRunOutput } from "../simulation/missionRunner";
import type { MissionTelemetryRecord } from "../simulation/missionTelemetry";
import type { MissionPhase } from "../types/simulation";
import { useGame } from "../store/useGame";
import type { Quality } from "./Scene3D";

const SceneCanvas = lazy(() => import("../3d/components/SceneCanvas").then((m) => ({ default: m.SceneCanvas })));

const TARGET_NAME: Record<string, string> = {
  LEO: "Low Earth Orbit",
  GEO: "Geostationary Orbit",
  Moon: "Moon",
  Mars: "Mars",
};

const PHASE_NAME: Record<MissionPhase, string> = {
  launch: "Launch",
  deployment: "Deployment",
  transfer: "Transfer",
  arrival: "Arrival",
  operations: "Science operations",
  communication: "Data downlink",
  completed: "Mission complete",
  failed: "Mission failed",
};

type Kind = "info" | "good" | "warn" | "bad";
interface LogLine {
  frame: number;
  t: number;
  kind: Kind;
  text: string;
}

const PHASE_LOG: Record<MissionPhase, [Kind, string]> = {
  launch: ["info", "Ignition sequence start"],
  deployment: ["good", "Spacecraft separated and deployed"],
  transfer: ["good", "Transfer burn underway, coasting to target"],
  arrival: ["good", "Arrival, orbit insertion complete"],
  operations: ["good", "Science operations begin"],
  communication: ["info", "Downlinking science data to Earth"],
  completed: ["good", "Mission objectives complete"],
  failed: ["bad", "Mission failed, spacecraft lost"],
};

function buildLog(tel: MissionTelemetryRecord[]): LogLine[] {
  const out: LogLine[] = [];
  tel.forEach((rec, i) => {
    const prev = i > 0 ? tel[i - 1] : null;
    const push = (kind: Kind, text: string) => out.push({ frame: i, t: rec.elapsedSeconds, kind, text });
    if (!prev || rec.phase !== prev.phase) push(...PHASE_LOG[rec.phase]);
    if (prev) {
      if (rec.inEclipse && !prev.inEclipse) push("warn", "Eclipse: solar output zero, running on battery");
      if (!rec.inEclipse && prev.inEclipse) push("good", "Eclipse ended, panels recharging");
      if (!rec.communicationAvailable && prev.communicationAvailable) push("warn", "Communications lost");
      if (rec.communicationAvailable && !prev.communicationAvailable) push("good", "Communications restored");
      if (rec.batteryWh <= 1 && prev.batteryWh > 1) push("bad", "Battery depleted, spacecraft offline");
    }
  });
  return out;
}

const stamp = (sec: number) => `T+${String(Math.floor(sec / 3600)).padStart(3, "0")}h`;

function FlightAside({
  scene,
  simulation,
  batteryCapacityWh,
  onDebrief,
}: {
  scene: UseMissionSceneReturn;
  simulation: MissionRunOutput;
  batteryCapacityWh: number;
  onDebrief: () => void;
}) {
  const log = useMemo(() => buildLog(simulation.telemetry), [simulation]);
  const visible = log.filter((l) => l.frame <= scene.frameIndex);
  const tel = scene.animFrame.telemetry;
  const pct = tel ? Math.round((tel.batteryWh / Math.max(1, batteryCapacityWh)) * 100) : 100;
  const net = tel ? tel.solarGenerationW - tel.loadW : 0;
  const tone = pct <= 15 ? "bad" : pct < 40 ? "warn" : "ok";
  const finished = scene.totalFrames > 0 && scene.frameIndex >= scene.totalFrames - 1;

  const listRef = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visible.length]);

  const started = useRef(false);
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      scene.play();
    }
  });

  return (
    <div className="fl">
      <div className="fl__phase">
        <div>
          <small className="mono">Phase</small>
          <strong>{PHASE_NAME[scene.animFrame.phase]}</strong>
        </div>
        <span className="mono">{tel ? stamp(tel.elapsedSeconds) : "T+000h"}</span>
      </div>

      <div className="fl__card">
        <div className="fl__row fl__row--head">
          <span className="mono">BATTERY</span>
          <b className={`mono tone-${tone}`}>{pct}%</b>
        </div>
        <div className={`hbar__track tone-${tone}`}>
          <i style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
        </div>
        <dl className="fl__stats mono">
          <div><dt>Generation</dt><dd>{tel ? Math.round(tel.solarGenerationW) : 0} W</dd></div>
          <div><dt>Load</dt><dd>{tel ? Math.round(tel.loadW) : 0} W</dd></div>
          <div><dt>Net</dt><dd className={net >= 0 ? "tone-ok" : "tone-bad"}>{net >= 0 ? "+" : ""}{Math.round(net)} W</dd></div>
          <div><dt>Δv reserve</dt><dd>{tel ? (tel.deltaVReserveMs / 1000).toFixed(2) : "0.00"} km/s</dd></div>
          <div><dt>Data sent</dt><dd>{tel ? tel.dataTransmittedMB.toFixed(1) : "0.0"} MB</dd></div>
        </dl>
      </div>

      <div className="fl__card fl__card--log">
        <div className="fl__row fl__row--head">
          <span className="mono">LIVE LOG</span>
          <b className="mono">{visible.length}</b>
        </div>
        <ul ref={listRef} className="fl__log">
          {visible.map((l, i) => (
            <li key={`${l.frame}-${i}`} className={`k-${l.kind}`}>
              <span className="mono">{stamp(l.t)}</span>
              {l.text}
            </li>
          ))}
        </ul>
      </div>

      <button type="button" className={finished ? "sim-btn sim-btn--next fl__cta is-ready" : "sim-btn sim-btn--ghost fl__cta"} onClick={onDebrief}>
        {finished ? "Open debrief" : "Skip to debrief"}
      </button>
    </div>
  );
}

export function FlightPhase({ quality, onDebrief }: { quality: Quality; onDebrief: () => void }) {
  const { state, simulation } = useGame();
  if (!simulation) return <div className="viewer__fail">Preparing mission simulation…</div>;

  return (
    <div className="flight">
      <Suspense fallback={<div className="scene-loading" role="status">Initializing mission visualization…</div>}>
        <SceneCanvas
          target={state.design.target}
          simulation={simulation}
          targetName={TARGET_NAME[state.design.target]}
          batteryCapacityWh={state.design.spacecraft.batteryWh}
          quality={quality}
          renderAside={(scene) => (
            <FlightAside
              scene={scene}
              simulation={simulation}
              batteryCapacityWh={state.design.spacecraft.batteryWh}
              onDebrief={onDebrief}
            />
          )}
        />
      </Suspense>
    </div>
  );
}
