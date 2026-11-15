import { lazy, Suspense, type CSSProperties, type ReactNode } from "react";
import { ANTENNAS, ENGINES, INSTRUMENTS, LAUNCH_VEHICLES, TARGETS, isTargetUnlocked, previousLevel } from "../data";
import { requiredDeltaV } from "../engine/orbit";
import { wetMass } from "../engine/mass";
import { powerBudget } from "../engine/power";
import { useGame } from "../store/useGame";
import type { NumericField } from "../store/gameReducer";
import { PlanetIcon, RocketIcon } from "./SpecParts";
import type { Quality } from "./Scene3D";

const SpacecraftPreview = lazy(() => import("./Scene3D").then((m) => ({ default: m.SpacecraftPreview })));

const SLIDERS: { field: NumericField; label: string; unit: string; min: number; max: number; step: number }[] = [
  { field: "dryMass_kg", label: "Body mass", unit: "kg", min: 100, max: 2000, step: 50 },
  { field: "propellantMass_kg", label: "Propellant", unit: "kg", min: 0, max: 8000, step: 50 },
  { field: "solarArea_m2", label: "Solar array", unit: "m²", min: 0, max: 30, step: 1 },
  { field: "batteryWh", label: "Battery", unit: "Wh", min: 0, max: 2000, step: 50 },
];

type Tone = "ok" | "warn" | "bad";

function Opt(props: {
  name: string;
  desc: string;
  stats?: string[];
  selected: boolean;
  disabled?: boolean;
  note?: string;
  icon?: ReactNode;
  onClick: () => void;
}) {
  const { name, desc, stats, selected, disabled, note, icon, onClick } = props;
  return (
    <button
      type="button"
      className={selected ? "opt is-selected spec-card" : "opt spec-card"}
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="opt__head">
        {icon}
        <span className="opt__name">{name}</span>
        <i className="opt__dot" aria-hidden="true" />
      </span>
      <span className="opt__desc">{desc}</span>
      {stats && (
        <span className="opt__stats mono">
          {stats.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </span>
      )}
      {note && <span className="opt__note">{note}</span>}
    </button>
  );
}

function Section({ n, title, meta, children }: { n: string; title: string; meta?: string; children: ReactNode }) {
  return (
    <section className="dsec">
      <header className="dsec__head">
        <h3>
          <span className="mono">{n}</span> {title}
        </h3>
        {meta && <span className="dsec__meta mono">{meta}</span>}
      </header>
      {children}
    </section>
  );
}

function Bar({ label, value, fill, tone }: { label: string; value: string; fill: number; tone: Tone }) {
  const pct = Math.round(Math.min(1, Math.max(0, fill)) * 100);
  return (
    <div className="hbar">
      <div className="hbar__row">
        <span>{label}</span>
        <b className={`mono tone-${tone}`}>{value}</b>
      </div>
      <div className={`hbar__track tone-${tone}`}>
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const marginTone = (m: number): Tone => (m < 0 ? "bad" : m < 0.1 ? "warn" : "ok");

export function DesignDesk({ quality, onNext }: { quality: Quality; onNext: () => void }) {
  const { state, dispatch, result: r } = useGame();
  const d = state.design;
  const s = d.spacecraft;
  const wet = wetMass(s);
  const limit = d.launchVehicle.payloadToLEO_kg;
  const pw = powerBudget(s, d.target);
  const dvRatio = r.deltaVAvailable_ms / Math.max(1, r.deltaVRequired_ms);
  const targetName = TARGETS.find((t) => t.id === d.target)?.name ?? d.target;
  const allOpen = TARGETS.every((t) => isTargetUnlocked(state.completed, t.id));

  return (
    <div className="desk">
      <div className="desk__main">
        <Section n="01" title="Destination" meta={`${Math.round(r.deltaVRequired_ms).toLocaleString("en-US")} m/s needed`}>
          <div className="dsec__grid dsec__grid--4">
            {TARGETS.map((t) => {
              const open = isTargetUnlocked(state.completed, t.id);
              const prev = TARGETS.find((x) => x.id === previousLevel(t.id))?.name;
              const done = state.completed.includes(t.id);
              return (
                <Opt
                  key={t.id}
                  icon={<PlanetIcon target={t.id} />}
                  name={t.name}
                  desc={t.description}
                  stats={[`Δv ${Math.round(requiredDeltaV(t.id)).toLocaleString("en-US")} m/s`, ...(done ? ["cleared"] : [])]}
                  selected={d.target === t.id}
                  disabled={!open}
                  note={open ? undefined : `Locked: clear ${prev} first`}
                  onClick={() => dispatch({ type: "SET_TARGET", target: t.id })}
                />
              );
            })}
          </div>
          {!allOpen && (
            <button type="button" className="link" onClick={() => dispatch({ type: "UNLOCK_ALL" })}>
              Demo mode: unlock all levels
            </button>
          )}
        </Section>

        <Section n="02" title="Launch vehicle" meta={`${limit.toLocaleString("en-US")} kg to orbit`}>
          <div className="dsec__grid">
            {LAUNCH_VEHICLES.map((v, i) => (
              <Opt
                key={v.name}
                icon={<RocketIcon tier={Math.min(i, 2) as 0 | 1 | 2} />}
                name={v.name}
                desc={`Carries ${v.payloadToLEO_kg.toLocaleString("en-US")} kg to low Earth orbit.`}
                stats={[`${v.payloadToLEO_kg.toLocaleString("en-US")} kg`, `$${v.cost_musd}M`]}
                selected={d.launchVehicle.name === v.name}
                onClick={() => dispatch({ type: "SET_LAUNCHER", launchVehicle: v })}
              />
            ))}
          </div>
        </Section>

        <Section n="03" title="Engine" meta="propulsion efficiency">
          <div className="dsec__grid">
            {ENGINES.map((e) => (
              <Opt
                key={e.id}
                name={e.name}
                desc={e.description}
                stats={[`Isp ${e.isp_s} s`]}
                selected={s.isp_s === e.isp_s}
                onClick={() => dispatch({ type: "SET_ISP", isp_s: e.isp_s })}
              />
            ))}
          </div>
        </Section>

        <Section n="04" title="Antenna" meta="communications gain">
          <div className="dsec__grid">
            {ANTENNAS.map((a) => (
              <Opt
                key={a.id}
                name={a.name}
                desc={a.description}
                stats={[`${a.gain_dBi} dBi`]}
                selected={s.antennaGain_dBi === a.gain_dBi}
                onClick={() => dispatch({ type: "SET_ANTENNA", gain_dBi: a.gain_dBi })}
              />
            ))}
          </div>
        </Section>

        <Section n="05" title="Instruments" meta={`${s.instruments.length} installed`}>
          <div className="dsec__grid">
            {INSTRUMENTS.map((i) => (
              <Opt
                key={i.id}
                name={i.name}
                desc={i.description}
                stats={[`${i.mass_kg} kg`, `${i.power_W} W`]}
                selected={s.instruments.some((x) => x.name === i.name)}
                onClick={() => dispatch({ type: "TOGGLE_INSTRUMENT", instrument: i })}
              />
            ))}
          </div>
        </Section>

        <Section n="06" title="Sizing" meta="mass, fuel, power">
          <div className="dsec__sliders">
            {SLIDERS.map((sl) => (
              <label key={sl.field} className="slider">
                <span>{sl.label}</span>
                <input
                  type="range"
                  min={sl.min}
                  max={sl.max}
                  step={sl.step}
                  value={s[sl.field]}
                  style={{ "--p": `${((s[sl.field] - sl.min) / (sl.max - sl.min)) * 100}%` } as CSSProperties}
                  onChange={(e) => dispatch({ type: "SET_NUMBER", field: sl.field, value: Number(e.target.value) })}
                />
                <strong>
                  {s[sl.field]} {sl.unit}
                </strong>
              </label>
            ))}
          </div>
        </Section>
      </div>

      <aside className="desk__side">
        <div className="viewer">
          <div className="viewer__stage">
            <Suspense fallback={<div className="viewer__fail">Loading 3D preview…</div>}>
              <SpacecraftPreview design={d} quality={quality} />
            </Suspense>
          </div>
          <div className="viewer__foot mono">
            <span>Drag to rotate · scroll to zoom</span>
            <span>{targetName}</span>
          </div>
        </div>

        <div className="hud">
          <Bar label="WET MASS" value={`${Math.round(wet).toLocaleString("en-US")} / ${limit.toLocaleString("en-US")} kg`} fill={wet / limit} tone={marginTone(r.massMargin)} />
          <Bar
            label="POWER BALANCE"
            value={`${pw.generated_W - pw.load_W >= 0 ? "+" : ""}${Math.round(pw.generated_W - pw.load_W)} W`}
            fill={pw.generated_W / Math.max(1, pw.load_W)}
            tone={marginTone(r.powerMargin)}
          />
          <Bar
            label="Δv BUDGET"
            value={`${(r.deltaVAvailable_ms / 1000).toFixed(2)} / ${(r.deltaVRequired_ms / 1000).toFixed(2)} km/s`}
            fill={dvRatio}
            tone={dvRatio < 1 ? "bad" : dvRatio < 1.1 ? "warn" : "ok"}
          />
          <div className="hud__row">
            <span>Comms link</span>
            <b className={r.commsOk ? "tone-ok mono" : "tone-bad mono"}>{r.commsOk ? "STRONG" : "WEAK"}</b>
          </div>
          <div className="hud__row">
            <span>Cost</span>
            <b className="mono">${r.cost_musd}M</b>
          </div>
          <div className="hud__row">
            <span>Design score</span>
            <b className="mono">{r.score}/100</b>
          </div>
        </div>

        {r.warnings.length > 0 && (
          <ul className="hud__warn">
            {r.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}

        <button type="button" className="sim-btn sim-btn--next desk__cta" onClick={onNext}>
          Continue to launch pad
        </button>
      </aside>
    </div>
  );
}
