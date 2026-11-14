import { useState, useEffect } from "react";
import type { PageId } from "../components/Navbar";
import { VideoBackground } from "../components/VideoBackground";

const SLIDES = [
  {
    badge: "STEP 01 • ORBITAL MECHANICS",
    title: "Choose Real Planetary Destinations",
    description:
      "Plan missions across Low Earth Orbit, Geostationary Orbit, the Moon, and Mars—each calibrated with authentic delta-v requirements, solar irradiance, and deep-space comms distances.",
    stats: ["4 Unlockable Targets", "GMAT Trajectory Budgets", "Real Solar Flux Scaling"],
  },
  {
    badge: "STEP 02 • LAUNCH & SUBSYSTEMS",
    title: "Engineer Every Spacecraft System",
    description:
      "Select Light, Medium, or Heavy launch vehicles and balance Monopropellant, Bipropellant, or Cryogenic engines alongside high-gain antennas and NASA science instruments.",
    stats: ["6 Live Telemetry Checks", "Mass & Power Margins", "Budget Cap Enforcement"],
  },
  {
    badge: "STEP 03 • 24-HOUR TELEMETRY REPLAY",
    title: "Simulate Orbit, Eclipses & Science Return",
    description:
      "Watch your spacecraft execute a simulated orbital day—surviving Earth shadow eclipses, managing battery drain, and downlinking high-resolution planetary data.",
    stats: ["Real-Time Eclipse Events", "Battery & Comms Curves", "Historical NASA Benchmarks"],
  },
];

export function HomePage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <div>
      {/* 1. Full-Viewport Video Hero (Scrolls up naturally when you scroll down) */}
      <section className="hero-video-section">
        <div className="hero-video-layer">
          <VideoBackground />
        </div>
        <div className="hero-video-overlay" />

        <div className="container hero-video-content">
          <span className="hero-pill">
            NASA Space Apps Challenge 2026 • Team Neuru Volex
          </span>
          <h1 className="hero-title">
            Design. Launch. <span style={{ color: "var(--accent-cyan)" }}>Learn.</span>
          </h1>
          <p className="hero-subtitle">
            Architect interplanetary spacecraft using real orbital mechanics, delta-v budgets,
            and live telemetry simulations powered by NASA mission datasets.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ fontSize: "1.05rem", padding: "0.9rem 1.85rem" }} onClick={() => onNavigate("simulator")}>
              Start Building Mission →
            </button>
            <button
              className="btn-secondary-glass"
              onClick={() => onNavigate("science")}
            >
              Explore NASA Datasets
            </button>
          </div>
          <div className="scroll-cue">↓ Scroll to explore how MissionCraft works</div>
        </div>
      </section>

      {/* 2. Key Metrics Strip */}
      <section style={{ padding: "3.5rem 0", borderBottom: "1px solid var(--border-subtle)", background: "#060b14" }}>
        <div className="container grid-3" style={{ textAlign: "center" }}>
          <div>
            <div style={{ fontSize: "2.35rem", fontWeight: 800, color: "var(--accent-cyan)" }}>4 Destinations</div>
            <div style={{ color: "var(--text-muted)" }}>LEO, GEO, Lunar Orbit & Mars</div>
          </div>
          <div>
            <div style={{ fontSize: "2.35rem", fontWeight: 800, color: "var(--accent-cyan)" }}>6 Subsystems</div>
            <div style={{ color: "var(--text-muted)" }}>Mass, Delta-V, Power, Comms, Orbit & Cost</div>
          </div>
          <div>
            <div style={{ fontSize: "2.35rem", fontWeight: 800, color: "var(--accent-cyan)" }}>24-Hr Replay</div>
            <div style={{ color: "var(--text-muted)" }}>Live orbital telemetry & eclipse events</div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Feature Slideshow */}
      <section style={{ padding: "5rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
            <div>
              <span style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em" }}>
                GAMEPLAY WALKTHROUGH
              </span>
              <h2 style={{ fontSize: "2.15rem", fontWeight: 800, marginTop: "0.25rem" }}>
                Inside the Mission Lab
              </h2>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="slide-arrow-btn"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                aria-label="Previous slide"
              >
                ←
              </button>
              <button
                type="button"
                className="slide-arrow-btn"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
                aria-label="Next slide"
              >
                →
              </button>
            </div>
          </div>

          <div className="slideshow-card">
            <div className="slideshow-grid">
              <div>
                <span style={{ color: "var(--accent-cyan)", fontSize: "0.85rem", fontWeight: 700 }}>
                  {slide.badge}
                </span>
                <h3 style={{ fontSize: "1.85rem", fontWeight: 800, margin: "0.5rem 0 1rem" }}>
                  {slide.title}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", marginBottom: "1.75rem" }}>
                  {slide.description}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem" }}>
                  {slide.stats.map((tag) => (
                    <span key={tag} className="slide-stat-pill">
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="slideshow-visual">
                <div style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: 700, marginBottom: "0.75rem" }}>
                  MISSION STAGE 0{currentSlide + 1} / 0{SLIDES.length}
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
                  {currentSlide === 0 && "Target Trajectory & Delta-V Matrix"}
                  {currentSlide === 1 && "Payload Mass & Power Margin Telemetry"}
                  {currentSlide === 2 && "Orbital Eclipse & Data Downlink Replay"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {SLIDES.map((s, index) => (
                    <button
                      key={s.badge}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className={`slide-tab-btn ${index === currentSlide ? "active" : ""}`}
                    >
                      <span>0{index + 1}. {s.title}</span>
                      <span>{index === currentSlide ? "●" : "○"}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Structured Game Details Grid */}
      <section style={{ padding: "5rem 0" }}>
        <div className="container">
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>From Concept to Orbit</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem" }}>
            Every engineering choice directly affects launch viability, power margins, and science return.
          </p>
          <div className="grid-3">
            <div className="card">
              <h3 style={{ marginBottom: "0.5rem", color: "var(--accent-cyan)" }}>1. Select Planetary Target</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Evaluate delta-v budgets, solar flux, and communication distance across LEO, GEO, the Moon, and Mars.
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: "0.5rem", color: "var(--accent-cyan)" }}>2. Match Launch Vehicle</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Balance fairing payload limits and launch costs against mission budget constraints.
              </p>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: "0.5rem", color: "var(--accent-cyan)" }}>3. Engineer Spacecraft</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Configure engines, propellant tanks, antennas, and NASA science instruments with live validation.
              </p>
            </div>
          </div>

          {/* Bottom Callout Banner */}
          <div className="card" style={{ marginTop: "3.5rem", padding: "2.75rem", textAlign: "center", background: "linear-gradient(135deg, #0d1422 0%, #101d33 100%)" }}>
            <h2 style={{ fontSize: "1.9rem", fontWeight: 800, marginBottom: "0.6rem" }}>Ready to Launch Your Mission?</h2>
            <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto 1.75rem" }}>
              Enter the Mission Lab, design a flight-ready spacecraft, and test it against real orbital physics.
            </p>
            <button className="btn-primary" onClick={() => onNavigate("simulator")}>
              Launch Mission Simulator →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
