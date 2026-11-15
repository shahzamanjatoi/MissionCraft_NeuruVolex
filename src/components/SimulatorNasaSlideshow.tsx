import { useCallback, useMemo, useState } from "react";
import { NASA_SOURCES, REAL_MISSIONS } from "../data";
import type { Target } from "../data/targets";
import { useGame } from "../store/useGame";
import type { GameStep } from "../store/gameReducer";

type Kind = "mission" | "instrument" | "guidance";

interface RefSlide {
  id: string;
  kind: Kind;
  title: string;
  org: string;
  summary: string;
  targets: Target[] | "all";
  url: string;
  launchMassKg?: number;
}

const KIND_LABEL: Record<Kind, string> = {
  mission: "MISSION",
  instrument: "INSTRUMENT",
  guidance: "DESIGN GUIDANCE",
};

const sourceUrl = (id: string) => NASA_SOURCES.find((s) => s.id === id)?.url ?? "https://www.nasa.gov/";

/**
 * Public NASA pages for real missions that have no entry in nasaSources.ts.
 * Please re-check these links before the demo.
 */
const MISSION_LINKS: Record<string, string> = {
  lro: sourceUrl("lro-mission"),
  "cubesat-12u": sourceUrl("cubesat-101"),
  hubble: "https://science.nasa.gov/mission/hubble/",
  "landsat-8": "https://landsat.gsfc.nasa.gov/",
  "goes-8": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1994-022A",
  "goes-r": "https://www.goes-r.gov/",
  "lunar-prospector": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1998-001A",
  mro: "https://science.nasa.gov/mission/mars-reconnaissance-orbiter/",
  "mars-odyssey": "https://science.nasa.gov/mission/mars-odyssey/",
};

const SOURCE_TARGETS: Record<string, Target[] | "all"> = {
  "lro-instruments": ["Moon"],
  lola: ["Moon"],
  diviner: ["Moon"],
  "cubesat-101": ["LEO"],
  "concept-maturity": "all",
};

const ALL_SLIDES: RefSlide[] = [
  ...REAL_MISSIONS.map<RefSlide>((m) => ({
    id: m.id,
    kind: "mission",
    title: m.name,
    org: "NASA",
    summary: m.summary,
    targets: [m.target],
    url: MISSION_LINKS[m.id] ?? "https://www.nasa.gov/",
    launchMassKg: m.launchMassKg,
  })),
  ...NASA_SOURCES.filter((s) => s.id !== "lro-mission").map<RefSlide>((s) => ({
    id: s.id,
    kind: s.category === "instrument" ? "instrument" : s.category === "mission" ? "mission" : "guidance",
    title: s.title,
    org: s.organization,
    summary: s.description,
    targets: SOURCE_TARGETS[s.id] ?? "all",
    url: s.url,
  })),
];

const PREFERRED_KINDS: Record<GameStep, Kind[]> = {
  target: ["mission", "guidance", "instrument"],
  rocket: ["mission", "guidance", "instrument"],
  spacecraft: ["instrument", "mission", "guidance"],
  results: ["mission", "guidance", "instrument"],
};

const isRelevant = (s: RefSlide, target: Target) => s.targets === "all" || s.targets.includes(target);
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export function SimulatorNasaSlideshow() {
  const { state } = useGame();
  const target = state.design.target;
  const step = state.step;

  const [showAll, setShowAll] = useState(false);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<"next" | "prev" | "none">("none");

  // Start from the first slide whenever the filter inputs change.
  const listKey = `${target}|${step}|${showAll}`;
  const [prevKey, setPrevKey] = useState(listKey);
  if (prevKey !== listKey) {
    setPrevKey(listKey);
    setIndex(0);
    setDir("none");
  }

  const slides = useMemo(() => {
    const pref = PREFERRED_KINDS[step];
    const pool = showAll ? ALL_SLIDES : ALL_SLIDES.filter((s) => isRelevant(s, target));
    return [...pool].sort((a, b) => {
      const rel = Number(isRelevant(b, target)) - Number(isRelevant(a, target));
      return rel || pref.indexOf(a.kind) - pref.indexOf(b.kind);
    });
  }, [target, step, showAll]);

  const count = slides.length;
  const slide = slides[Math.min(index, count - 1)];

  const go = useCallback(
    (delta: 1 | -1) => {
      setDir(delta === 1 ? "next" : "prev");
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  const sc = state.design.spacecraft;
  const myMass = sc.dryMass_kg + sc.propellantMass_kg + sc.instruments.reduce((sum, i) => sum + i.mass_kg, 0);

  if (!slide) return null;
  const relevant = isRelevant(slide, target);
  const maxMass = Math.max(myMass, slide.launchMassKg ?? 0, 1);

  return (
    <section
      className="ref-show"
      aria-roledescription="carousel"
      aria-label="NASA mission reference"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <header className="ref-show__head">
        <div>
          <span className="eyebrow">NASA MISSION REFERENCE</span>
          <h2 className="ref-show__title">Real missions behind your design</h2>
        </div>
        <div className="ref-show__controls">
          <div className="ref-toggle" role="group" aria-label="Slide filter">
            <button type="button" className={!showAll ? "active" : ""} aria-pressed={!showAll} onClick={() => setShowAll(false)}>
              For {target}
            </button>
            <button type="button" className={showAll ? "active" : ""} aria-pressed={showAll} onClick={() => setShowAll(true)}>
              All
            </button>
          </div>
          <button type="button" className="slide-arrow-btn" onClick={() => go(-1)} aria-label="Previous reference">←</button>
          <button type="button" className="slide-arrow-btn" onClick={() => go(1)} aria-label="Next reference">→</button>
        </div>
      </header>

      <article key={slide.id} className={`ref-slide ref-slide--${dir}`}>
        <div className="ref-slide__copy">
          <div className="ref-slide__tags">
            <span className="badge mono">{KIND_LABEL[slide.kind]}</span>
            {relevant && (
              <span className="badge badge--ok">
                ● {slide.targets === "all" ? "Useful for every target" : `Relevant to ${target}`}
              </span>
            )}
          </div>
          <h3>{slide.title}</h3>
          <p>{slide.summary}</p>
          <a className="btn-primary ref-slide__link" href={slide.url} target="_blank" rel="noreferrer">
            View NASA Source ↗
          </a>
        </div>

        <div className="ref-slide__specs">
          <span className="ref-slide__specs-title mono">MISSION TELEMETRY</span>
          <dl>
            <div><dt>Organization</dt><dd className="mono">{slide.org}</dd></div>
            <div><dt>Reference target</dt><dd className="mono">{slide.targets === "all" ? "Any" : slide.targets.join(" / ")}</dd></div>
            {slide.launchMassKg !== undefined && (
              <div><dt>Launch mass</dt><dd className="mono">{fmt(slide.launchMassKg)} kg</dd></div>
            )}
          </dl>

          {slide.launchMassKg !== undefined && (
            <div className="ref-compare">
              <div className="ref-compare__row">
                <span>{slide.title.replace(/\s*\(.*\)/, "")}</span>
                <span className="ref-compare__track"><i style={{ width: `${(slide.launchMassKg / maxMass) * 100}%` }} /></span>
                <span className="mono">{fmt(slide.launchMassKg)} kg</span>
              </div>
              <div className="ref-compare__row ref-compare__row--you">
                <span>Your design</span>
                <span className="ref-compare__track"><i style={{ width: `${(myMass / maxMass) * 100}%` }} /></span>
                <span className="mono">{fmt(myMass)} kg</span>
              </div>
            </div>
          )}
        </div>
      </article>

      <footer className="ref-show__foot">
        <div className="ref-dots" role="tablist" aria-label="Choose reference">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === slide.id}
              aria-label={s.title}
              className={s.id === slide.id ? "active" : ""}
              onClick={() => {
                setDir(i > index ? "next" : "prev");
                setIndex(i);
              }}
            />
          ))}
        </div>
        <span className="mono ref-show__count">
          {String(Math.min(index, count - 1) + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
      </footer>
    </section>
  );
}