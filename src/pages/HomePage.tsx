import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { PageId } from "../components/Navbar";
import { VideoBackground } from "../components/VideoBackground";
import { Reveal } from "../components/Reveal";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { requiredDeltaV } from "../engine/orbit";

/* ------------------------------------------------------------------ */
/* Slide content                                                       */
/* ------------------------------------------------------------------ */

type PreviewId = "trajectory" | "telemetry" | "replay";

interface Slide {
  badge: string;
  tab: string;
  title: string;
  description: string;
  stats: string[];
  previewTitle: string;
  preview: PreviewId;
}

const SLIDES: Slide[] = [
  {
    badge: "STEP 01 • ORBITAL MECHANICS",
    tab: "Destinations",
    title: "Choose Real Planetary Destinations",
    description:
      "Plan missions across Low Earth Orbit, Geostationary Orbit, the Moon, and Mars—each calibrated with authentic delta-v requirements, solar irradiance, and deep-space comms distances.",
    stats: ["4 Unlockable Targets", "GMAT Trajectory Budgets", "Real Solar Flux Scaling"],
    previewTitle: "Target Trajectory Matrix",
    preview: "trajectory",
  },
  {
    badge: "STEP 02 • LAUNCH & SUBSYSTEMS",
    tab: "Subsystems",
    title: "Engineer Every Spacecraft System",
    description:
      "Select Light, Medium, or Heavy launch vehicles and balance Monopropellant, Bipropellant, or Cryogenic engines alongside high-gain antennas and NASA science instruments.",
    stats: ["6 Live Telemetry Checks", "Mass & Power Margins", "Budget Cap Enforcement"],
    previewTitle: "Subsystem Telemetry",
    preview: "telemetry",
  },
  {
    badge: "STEP 03 • 24-HOUR TELEMETRY REPLAY",
    tab: "Orbital Replay",
    title: "Simulate Orbit, Eclipses & Science Return",
    description:
      "Watch your spacecraft execute a simulated orbital day—surviving Earth shadow eclipses, managing battery drain, and downlinking high-resolution planetary data.",
    stats: ["Real-Time Eclipse Events", "Battery & Comms Curves", "Historical NASA Benchmarks"],
    previewTitle: "24-Hr Orbital Replay",
    preview: "replay",
  },
];

const SLIDE_DURATION_MS = 7000;

/* ------------------------------------------------------------------ */
/* Preview 1 — Target Trajectory Matrix (real delta-v from the engine) */
/* ------------------------------------------------------------------ */

const TRAJECTORY_ROWS = [
  { id: "LEO", name: "Low Earth Orbit", transfer: "Direct insertion", dv: requiredDeltaV("LEO") },
  { id: "GEO", name: "Geostationary", transfer: "Hohmann transfer", dv: requiredDeltaV("GEO") },
  { id: "Moon", name: "The Moon", transfer: "Trans-lunar injection", dv: requiredDeltaV("Moon") },
  { id: "Mars", name: "Mars", transfer: "Hohmann + capture", dv: requiredDeltaV("Mars") },
] as const;

const MAX_DV = Math.max(...TRAJECTORY_ROWS.map((r) => r.dv));

function TrajectoryPreview() {
  return (
    <div className="viz-matrix">
      <div className="viz-matrix__head">
        <span>Target</span>
        <span>Δv after LEO</span>
      </div>
      {TRAJECTORY_ROWS.map((row, i) => {
        const pct = Math.max(row.dv / MAX_DV, 0.025);
        return (
          <div
            key={row.id}
            className="viz-matrix__row"
            style={{ "--i": i, "--pct": pct } as CSSProperties}
          >
            <div className="viz-matrix__name">
              <strong>{row.name}</strong>
              <small>{row.transfer}</small>
            </div>
            <div className="viz-matrix__bar-wrap">
              <div className="viz-matrix__bar" />
              <span className="mono viz-matrix__value">{Math.round(row.dv).toLocaleString("en-US")} m/s</span>
            </div>
          </div>
        );
      })}
      <p className="viz-note">Patched-conic estimates from a 400 km parking orbit.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Preview 2 — Subsystem Telemetry                                     */
/* ------------------------------------------------------------------ */

const TELEMETRY_ROWS = [
  { label: "Delta-v", value: "4,820 / 4,472 m/s", fill: 0.92 },
  { label: "Mass margin", value: "14%", fill: 0.58 },
  { label: "Power margin", value: "22%", fill: 0.72 },
  { label: "Comms link", value: "Strong", fill: 0.85 },
  { label: "Orbit insertion", value: "Nominal", fill: 0.78 },
  { label: "Cost", value: "$83.6M", fill: 0.64 },
];

const RING_RADIUS = 38;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;
const TELEMETRY_SCORE = 97;

function TelemetryPreview() {
  return (
    <div className="viz-telemetry">
      <div className="viz-ring">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={RING_RADIUS} className="viz-ring__track" />
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            className="viz-ring__fill"
            style={
              {
                "--circ": RING_CIRC,
                "--offset": RING_CIRC * (1 - TELEMETRY_SCORE / 100),
              } as CSSProperties
            }
          />
        </svg>
        <div className="viz-ring__label">
          <span className="mono viz-ring__score">{TELEMETRY_SCORE}</span>
          <small>/100</small>
        </div>
      </div>

      <ul className="viz-gauges">
        {TELEMETRY_ROWS.map((row, i) => (
          <li key={row.label} style={{ "--i": i, "--w": `${row.fill * 100}%` } as CSSProperties}>
            <div className="viz-gauges__line">
              <span>{row.label}</span>
              <span className="mono">{row.value}</span>
              <span className="viz-chip">OK</span>
            </div>
            <div className="viz-gauges__track">
              <div className="viz-gauges__fill" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Preview 3 — 24-Hr Orbital Replay                                    */
/* ------------------------------------------------------------------ */

const CHART = { w: 460, h: 170, left: 34, right: 10, top: 12, bottom: 28 };
const PLOT_W = CHART.w - CHART.left - CHART.right;
const PLOT_H = CHART.h - CHART.top - CHART.bottom;

function buildReplaySeries() {
  const ORBIT_H = 1.5;
  const ECLIPSE_START = 0.9; // hours into each orbit when shadow begins
  const STEP = 0.25;
  const points: { t: number; v: number; eclipse: boolean }[] = [];
  let battery = 78;
  for (let t = 0; t <= 24 + 1e-9; t += STEP) {
    const eclipse = t % ORBIT_H >= ECLIPSE_START;
    battery = Math.min(100, Math.max(46, battery + (eclipse ? -4.2 : 3.1)));
    points.push({ t, v: battery, eclipse });
  }
  return points;
}

const REPLAY = buildReplaySeries();
const replayX = (t: number) => CHART.left + (t / 24) * PLOT_W;
const replayY = (v: number) => CHART.top + (1 - (v - 40) / 60) * PLOT_H;

const REPLAY_LINE = REPLAY.map((p, i) => `${i === 0 ? "M" : "L"}${replayX(p.t).toFixed(1)},${replayY(p.v).toFixed(1)}`).join(" ");
const REPLAY_AREA = `${REPLAY_LINE} L${replayX(24).toFixed(1)},${CHART.top + PLOT_H} L${replayX(0).toFixed(1)},${CHART.top + PLOT_H} Z`;

const ECLIPSE_BANDS = (() => {
  const bands: { x: number; w: number }[] = [];
  let start: number | null = null;
  for (const p of REPLAY) {
    if (p.eclipse && start === null) start = p.t;
    if (!p.eclipse && start !== null) {
      bands.push({ x: replayX(start), w: replayX(p.t) - replayX(start) });
      start = null;
    }
  }
  return bands;
})();

const BATTERY_MIN = Math.round(Math.min(...REPLAY.map((p) => p.v)));

function ReplayPreview() {
  return (
    <div className="viz-replay">
      <svg viewBox={`0 0 ${CHART.w} ${CHART.h}`} role="img" aria-label="Simulated battery charge across 24 hours with eclipse bands">
        <defs>
          <linearGradient id="lab-battery-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[100, 70, 40].map((v) => (
          <g key={v}>
            <line x1={CHART.left} x2={CHART.w - CHART.right} y1={replayY(v)} y2={replayY(v)} className="viz-replay__grid" />
            <text x={CHART.left - 6} y={replayY(v) + 3} textAnchor="end" className="viz-replay__axis">
              {v}%
            </text>
          </g>
        ))}
        {[0, 6, 12, 18, 24].map((h) => (
          <text key={h} x={replayX(h)} y={CHART.h - 8} textAnchor="middle" className="viz-replay__axis">
            {h}h
          </text>
        ))}

        {ECLIPSE_BANDS.map((b) => (
          <rect key={b.x} x={b.x} y={CHART.top} width={b.w} height={PLOT_H} className="viz-replay__eclipse" />
        ))}

        <path d={REPLAY_AREA} fill="url(#lab-battery-fill)" />
        <path d={REPLAY_LINE} className="viz-replay__line" pathLength={1} />

        <g className="viz-replay__cursor" style={{ "--travel": `${PLOT_W}px` } as CSSProperties}>
          <line x1={CHART.left} x2={CHART.left} y1={CHART.top} y2={CHART.top + PLOT_H} />
          <circle cx={CHART.left} cy={CHART.top} r={3.5} />
        </g>
      </svg>

      <div className="viz-replay__stats">
        <div>
          <span>Min battery</span>
          <strong className="mono">{BATTERY_MIN}%</strong>
        </div>
        <div>
          <span>Eclipses</span>
          <strong className="mono">{ECLIPSE_BANDS.length}</strong>
        </div>
        <div>
          <span>Data returned</span>
          <strong className="mono">12.4 MB</strong>
        </div>
      </div>

      <ul className="viz-events">
        <li style={{ "--i": 0 } as CSSProperties}>
          <span className="mono">0h 54m</span> Eclipse entry — switching to battery
        </li>
        <li style={{ "--i": 1 } as CSSProperties}>
          <span className="mono">7h 20m</span> Ground-station pass — downlink started
        </li>
        <li style={{ "--i": 2 } as CSSProperties}>
          <span className="mono">23h 59m</span> Replay complete — science archived
        </li>
      </ul>
    </div>
  );
}

const PREVIEWS: Record<PreviewId, () => ReactNode> = {
  trajectory: () => <TrajectoryPreview />,
  telemetry: () => <TelemetryPreview />,
  replay: () => <ReplayPreview />,
};

/* ------------------------------------------------------------------ */
/* Slideshow                                                           */
/* ------------------------------------------------------------------ */

type Direction = "none" | "next" | "prev";
interface SlideView {
  index: number;
  prev: number | null;
  dir: Direction;
}

function MissionLabSlideshow() {
  const [view, setView] = useState<SlideView>({ index: 0, prev: null, dir: "none" });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { ref, visible: inView } = useScrollReveal<HTMLDivElement>({ threshold: 0.3, once: false });

  const next = useCallback(
    () => setView((v) => ({ index: (v.index + 1) % SLIDES.length, prev: v.index, dir: "next" })),
    [],
  );
  const prev = useCallback(
    () => setView((v) => ({ index: (v.index - 1 + SLIDES.length) % SLIDES.length, prev: v.index, dir: "prev" })),
    [],
  );
  const goTo = useCallback(
    (target: number) =>
      setView((v) => (target === v.index ? v : { index: target, prev: v.index, dir: target > v.index ? "next" : "prev" })),
    [],
  );

  // Arrow-key navigation whenever the slideshow is on screen.
  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView, next, prev]);

  const paused = hovered || focused || !inView;

  return (
    <div className="container">
      <Reveal className="lab-header">
        <div>
          <span className="eyebrow">GAMEPLAY WALKTHROUGH</span>
          <h2 className="section-title">Inside the Mission Lab</h2>
        </div>
        <div className="lab-arrows">
          <button type="button" className="slide-arrow-btn" onClick={prev} aria-label="Previous slide">
            ←
          </button>
          <button type="button" className="slide-arrow-btn" onClick={next} aria-label="Next slide">
            →
          </button>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div
          ref={ref}
          className={`slideshow-card lab-show ${paused ? "is-paused" : ""} ${inView ? "in-view" : ""}`}
          role="region"
          aria-roledescription="carousel"
          aria-label="Mission Lab walkthrough"
          style={{ "--slide-duration": `${SLIDE_DURATION_MS}ms` } as CSSProperties}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <div className="lab-progress" role="tablist" aria-label="Walkthrough steps">
            {SLIDES.map((s, i) => {
              const active = i === view.index;
              const done = i < view.index;
              return (
                <button
                  key={s.badge}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`lab-progress__item ${active ? "active" : ""} ${done ? "done" : ""}`}
                  onClick={() => goTo(i)}
                >
                  <span className="lab-progress__bar">
                    {active && (
                      <span
                        key={`${view.index}-${view.prev}`}
                        className="lab-progress__fill"
                        onAnimationEnd={(e) => {
                          if (e.animationName === "lab-progress-fill") next();
                        }}
                      />
                    )}
                  </span>
                  <span className="lab-progress__label">
                    <span className="mono">0{i + 1}</span> {s.tab}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lab-stage" aria-live={paused ? "polite" : "off"}>
            {SLIDES.map((s, i) => {
              const state = i === view.index ? "is-active" : i === view.prev ? "is-leaving" : "";
              return (
                <article
                  key={s.badge}
                  role="tabpanel"
                  aria-hidden={i !== view.index}
                  className={`lab-slide ${state}`}
                  data-dir={view.dir}
                >
                  <div className="lab-copy">
                    <span className="eyebrow mono">{s.badge}</span>
                    <h3 className="lab-title">{s.title}</h3>
                    <p className="lab-desc">{s.description}</p>
                    <div className="lab-pills">
                      {s.stats.map((tag) => (
                        <span key={tag} className="slide-stat-pill">
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lab-preview slideshow-visual">
                    <div className="lab-preview__head">
                      <span className="eyebrow mono">
                        MISSION STAGE 0{i + 1} / 0{SLIDES.length}
                      </span>
                      <span className="lab-live">
                        <i /> LIVE PREVIEW
                      </span>
                    </div>
                    <h4 className="lab-preview__title">{s.previewTitle}</h4>
                    {PREVIEWS[s.preview]()}
                  </div>
                </article>
              );
            })}
          </div>

          <p className="lab-hint">
            <span className="mono">{paused && inView ? "PAUSED" : "AUTO-PLAY"}</span> · Use ← → keys to navigate
          </p>
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const METRICS = [
  { value: "4 Destinations", label: "LEO, GEO, Lunar Orbit & Mars" },
  { value: "6 Subsystems", label: "Mass, Delta-V, Power, Comms, Orbit & Cost" },
  { value: "24-Hr Replay", label: "Live orbital telemetry & eclipse events" },
];

const STEPS = [
  {
    title: "1. Select Planetary Target",
    body: "Evaluate delta-v budgets, solar flux, and communication distance across LEO, GEO, the Moon, and Mars.",
  },
  {
    title: "2. Match Launch Vehicle",
    body: "Balance fairing payload limits and launch costs against mission budget constraints.",
  },
  {
    title: "3. Engineer Spacecraft",
    body: "Configure engines, propellant tanks, antennas, and NASA science instruments with live validation.",
  },
];

export function HomePage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <div>
      {/* 1. Full-viewport video hero with staggered entrance */}
      <section className="hero-video-section">
        <div className="hero-video-layer">
          <VideoBackground variant="hero" />
        </div>
        <div className="hero-video-overlay" />

        <div className="container hero-video-content">
          <span className="hero-pill hero-anim" style={{ "--i": 0 } as CSSProperties}>
            NASA Space Apps Challenge 2026 • Team Neuru Volex
          </span>
          <h1 className="hero-title">
            <span className="hero-word hero-anim" style={{ "--i": 1 } as CSSProperties}>
              Design.
            </span>{" "}
            <span className="hero-word hero-anim" style={{ "--i": 2 } as CSSProperties}>
              Launch.
            </span>{" "}
            <span className="hero-word hero-anim accent" style={{ "--i": 3 } as CSSProperties}>
              Learn.
            </span>
          </h1>
          <p className="hero-subtitle hero-anim" style={{ "--i": 4 } as CSSProperties}>
            Architect interplanetary spacecraft using real orbital mechanics, delta-v budgets,
            and live telemetry simulations powered by NASA mission datasets.
          </p>
          <div className="hero-cta hero-anim" style={{ "--i": 5 } as CSSProperties}>
            <button className="btn-primary btn-lg" onClick={() => onNavigate("simulator")}>
              Start Building Mission →
            </button>
            <button className="btn-secondary-glass" onClick={() => onNavigate("science")}>
              Explore NASA Datasets
            </button>
          </div>
          <div className="scroll-cue hero-anim" style={{ "--i": 6 } as CSSProperties}>
            <span className="scroll-cue__arrow" aria-hidden="true">↓</span> Scroll to explore how MissionCraft works
          </div>
        </div>
      </section>

      {/* 2. Key metrics strip */}
      <section className="section section--metrics">
        <div className="container grid-3 metrics">
          {METRICS.map((m, i) => (
            <Reveal key={m.value} delay={i * 110} className="metric">
              <div className="metric__value">{m.value}</div>
              <div className="metric__label">{m.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. Interactive slideshow */}
      <section className="section section--lab">
        <MissionLabSlideshow />
      </section>

      {/* 4. Concept to orbit */}
      <section className="section">
        <div className="container">
          <Reveal>
            <h2 className="section-title">From Concept to Orbit</h2>
            <p className="section-lead">
              Every engineering choice directly affects launch viability, power margins, and science return.
            </p>
          </Reveal>
          <div className="grid-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 120} className="card step-card">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </Reveal>
            ))}
          </div>

          {/* 5. Launch CTA */}
          <Reveal className="card cta-card" delay={80}>
            <h2>Ready to Launch Your Mission?</h2>
            <p>Enter the Mission Lab, design a flight-ready spacecraft, and test it against real orbital physics.</p>
            <button className="btn-primary btn-lg" onClick={() => onNavigate("simulator")}>
              Launch Mission Simulator →
            </button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
