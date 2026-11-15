import type { Target } from "../data/targets";

/** Rocket silhouette that grows with the launcher tier (0 = light, 2 = heavy). */
export function RocketIcon({ tier }: { tier: 0 | 1 | 2 }) {
  const t = tier === 1 ? 30 : 22; // booster nose height
  const booster = (x: number) => `M${x} ${t + 8} C${x} ${t + 2} ${x + 3} ${t - 2} ${x + 5} ${t - 4} C${x + 7} ${t - 2} ${x + 10} ${t + 2} ${x + 10} ${t + 8} V50 H${x}Z`;
  return (
    <svg viewBox="0 0 64 64" className="spec-icon" aria-hidden="true">
      {tier >= 1 && (
        <>
          <path className="si-body" d={booster(10)} />
          <path className="si-body" d={booster(44)} />
          <path className="si-flame" d="M12 51 Q15 59 18 51Z M46 51 Q49 59 52 51Z" />
        </>
      )}
      <path className="si-body" d="M32 3 C38 11 40 22 40 34 V52 H24 V34 C24 22 26 11 32 3Z" />
      <path className="si-body" d="M24 42 L16 55 L24 51Z M40 42 L48 55 L40 51Z" />
      <circle className="si-window" cx="32" cy="22" r="3.4" />
      <path className="si-flame" d="M27 53 Q32 63 37 53Z" />
    </svg>
  );
}

/** Small illustrated planet/orbit icon for each mission target. */
export function PlanetIcon({ target }: { target: Target }) {
  const id = `planet-${target}`;
  const grad = (a: string, b: string) => (
    <defs>
      <radialGradient id={id} cx="35%" cy="30%" r="80%">
        <stop offset="0" stopColor={a} />
        <stop offset="1" stopColor={b} />
      </radialGradient>
    </defs>
  );

  if (target === "LEO") {
    return (
      <svg viewBox="0 0 64 64" className="spec-icon" aria-hidden="true">
        {grad("#7dd3fc", "#0c4a6e")}
        <circle cx="32" cy="32" r="18" fill={`url(#${id})`} />
        <path d="M22 27 q6 -7 13 -2 q-2 7 -9 6z M36 38 q6 -2 8 3 q-5 4 -8 -3z" fill="#4ade80" opacity="0.55" />
        <ellipse cx="32" cy="32" rx="28" ry="9" transform="rotate(-22 32 32)" fill="none" stroke="#38bdf8" strokeWidth="1.3" strokeDasharray="3 3" />
        <circle cx="54" cy="24" r="2.4" fill="#f8fafc" />
      </svg>
    );
  }
  if (target === "GEO") {
    return (
      <svg viewBox="0 0 64 64" className="spec-icon" aria-hidden="true">
        {grad("#7dd3fc", "#0c4a6e")}
        <circle cx="32" cy="32" r="11" fill={`url(#${id})`} />
        <circle cx="32" cy="32" r="27" fill="none" stroke="#38bdf8" strokeWidth="1.3" strokeDasharray="2 4" />
        <rect x="55" y="29" width="6" height="6" rx="1" fill="#f8fafc" />
        <path d="M52 32 h3 M61 32 h3" stroke="#38bdf8" strokeWidth="1.5" />
      </svg>
    );
  }
  if (target === "Moon") {
    return (
      <svg viewBox="0 0 64 64" className="spec-icon" aria-hidden="true">
        {grad("#e2e8f0", "#475569")}
        <circle cx="32" cy="32" r="21" fill={`url(#${id})`} />
        <circle cx="25" cy="26" r="4.5" fill="#334155" opacity="0.5" />
        <circle cx="39" cy="35" r="6" fill="#334155" opacity="0.45" />
        <circle cx="28" cy="42" r="3" fill="#334155" opacity="0.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="spec-icon" aria-hidden="true">
      {grad("#fdba74", "#9a3412")}
      <circle cx="32" cy="32" r="19" fill={`url(#${id})`} />
      <path d="M17 34 q8 -6 14 0 q7 5 16 -2 q-1 10 -9 13 q-9 3 -21 -11z" fill="#7c2d12" opacity="0.5" />
      <ellipse cx="32" cy="15" rx="7" ry="2.6" fill="#f8fafc" opacity="0.8" />
    </svg>
  );
}

/** Labelled horizontal meter (0–1) used on spec cards. */
export function SpecMeter({ label, value, text }: { label: string; value: number; text: string }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <span className="meter">
      <span className="meter__line">
        <span>{label}</span>
        <span className="mono">{text}</span>
      </span>
      <span className="meter__track">
        <i style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
}

/** Shared header for each simulator step. */
export function StepHead({ n, title, hint }: { n: number; title: string; hint?: string }) {
  return (
    <div className="sim-step-head">
      <span className="sim-step-head__n mono">Step {n} of 4</span>
      <h2 className="step-title">{title}</h2>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="sim-lock" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="1.6" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
    </svg>
  );
}

export function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" className="sim-check" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}
