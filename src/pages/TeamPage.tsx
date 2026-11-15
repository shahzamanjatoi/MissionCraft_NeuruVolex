import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { VideoBackground } from "../components/VideoBackground";

/* ==========================================================================
   Data — edit names, bios and avatar paths here.
   Avatar images go in /public/team/ (e.g. public/team/shahzaman.png).
   Add more paths to `avatars` to get one slide per avatar variation.
   If an image is missing, an illustrated astronaut fallback is shown.
   ========================================================================== */

type ModuleId = "engine" | "viz" | "data" | "payload";

interface Member {
  id: string;
  name: string;
  badge: string;
  title: string;
  bio: string[];
  focus: string[];
  highlights: { title: string; text: string }[];
  module: ModuleId;
  accent: string; // glow colour
  suit: string; // fallback avatar suit colour
  avatars: string[];
}

const MODULES: { id: ModuleId; label: string; hint: string }[] = [
  { id: "engine", label: "Simulation Engine", hint: "Delta-v · mass · power · comms · cost" },
  { id: "viz", label: "Mission Viz", hint: "Three.js 3D trajectory playback" },
  { id: "data", label: "NASA Data & Telemetry", hint: "GMAT constants · telemetry validation" },
  { id: "payload", label: "Payload & Science", hint: "Instruments · launch vehicle specs" },
];

const TEAM: Member[] = [
  {
    id: "shahzaman",
    name: "Shahzaman Jatoi",
    badge: "Mission Commander",
    title: "Lead AI & Systems Engineer",
    bio: [
      "Architecting the core simulation engine, FastAPI pipelines, and full-stack MissionCraft architecture.",
      "Shahzaman turns orbital mechanics into code players can feel — from delta-v budgets and mass and power margins to the 24-hour telemetry replay.",
    ],
    focus: ["Simulation engine", "Full-stack architecture", "GMAT physics modeling"],
    highlights: [
      { title: "Core engine", text: "Delta-v, mass, power, comms and cost checks computed live." },
      { title: "System architecture", text: "FastAPI pipelines wired into the React front end." },
      { title: "Orbital replay", text: "Eclipse, battery and downlink events across a simulated day." },
    ],
    module: "engine",
    accent: "#38bdf8",
    suit: "#7c4a2d",
    avatars: ["/team/shahzaman.png"],
  },
  {
    id: "alisha",
    name: "Alisha",
    badge: "Flight Director",
    title: "3D Visualization Lead",
    bio: [
      "Developing 'Mission Viz', Three.js 3D viewport rendering, and orbital mechanics simulation interfaces.",
      "Alisha makes trajectories visible — turning maneuver data into spatial playback so a transfer orbit can be seen, not just calculated.",
    ],
    focus: ["Mission Viz", "Three.js rendering", "Maneuver playback"],
    highlights: [
      { title: "Mission Viz", text: "A 3D viewport for orbital trajectories and spacecraft state." },
      { title: "Three.js rendering", text: "Real-time scenes driven by the simulation output." },
      { title: "Spatial playback", text: "Scrub through maneuvers to see each burn in context." },
    ],
    module: "viz",
    accent: "#818cf8",
    suit: "#cbd5e1",
    avatars: ["/team/alisha.png"],
  },
  {
    id: "yousaif",
    name: "Yousaif",
    badge: "Navigation Specialist",
    title: "Propulsion & Trajectory Specialist",
    bio: [
      "Integrating NASA open datasets, GMAT trajectory constants, and automated telemetry validation.",
      "Yousaif keeps the numbers honest — checking that propulsion and transfer figures line up with published mission data.",
    ],
    focus: ["NASA open datasets", "GMAT constants", "Telemetry validation"],
    highlights: [
      { title: "NASA open data", text: "Mission and instrument references wired into the app." },
      { title: "Trajectory constants", text: "GMAT-based values behind each destination's delta-v." },
      { title: "Automated validation", text: "Telemetry outputs checked against expected ranges." },
    ],
    module: "data",
    accent: "#2dd4bf",
    suit: "#ea580c",
    avatars: ["/team/yousaif.png"],
  },
  {
    id: "zara",
    name: "Zara",
    badge: "Payload Officer",
    title: "Payload & Science Officer",
    bio: [
      "Curating payload specifications, launch vehicle telemetry, and science operations benchmarks.",
      "Zara connects hardware to science return — which instruments fly, what they weigh, and how much data makes it home.",
    ],
    focus: ["Payload specs", "Launch vehicle data", "Science operations"],
    highlights: [
      { title: "Payload specs", text: "Instrument mass and power curated for the spacecraft builder." },
      { title: "Launch telemetry", text: "Vehicle capacity and cost benchmarks for each launcher." },
      { title: "Science ops", text: "Benchmarks for data generated, stored and returned." },
    ],
    module: "payload",
    accent: "#60a5fa",
    suit: "#4d7c0f",
    avatars: ["/team/zara.png"],
  },
];

/* ==========================================================================
   Typography — ONE place defines the hierarchy used across the whole page.
   Display = Space Grotesk · UI copy = Plus Jakarta Sans · numbers = JetBrains Mono
   ========================================================================== */

const T = {
  eyebrow: "font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.22em] text-sky-400",
  h1: "font-[family-name:var(--font-display)] text-5xl font-bold leading-[1.05] tracking-tight text-slate-50 md:text-7xl",
  name: "font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.05] tracking-tight text-slate-50 md:text-6xl",
  role: "font-[family-name:var(--font-display)] text-xl font-medium text-sky-300 md:text-2xl",
  lead: "font-[family-name:var(--font-body)] text-lg leading-relaxed text-slate-300 md:text-xl",
  body: "font-[family-name:var(--font-body)] text-base leading-relaxed text-slate-300",
  label: "font-[family-name:var(--font-body)] text-sm font-semibold text-slate-100",
  small: "font-[family-name:var(--font-body)] text-sm leading-snug text-slate-400",
  mono: "font-[family-name:var(--font-mono)] text-xs tracking-wider",
} as const;

const GLASS = "rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-md";
const EASE: [number, number, number, number] = [0.22, 0.8, 0.24, 1];

/* ==========================================================================
   Motion variants
   ========================================================================== */

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 34, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};

const maskUp: Variants = {
  hidden: { y: "115%" },
  show: { y: 0, transition: { duration: 0.9, ease: EASE } },
};

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 56 : -56, opacity: 0, scale: 0.98 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
  exit: (dir: number) => ({ x: dir >= 0 ? -56 : 56, opacity: 0, scale: 0.98, transition: { duration: 0.3 } }),
};

/* ==========================================================================
   Avatar (image with illustrated astronaut fallback)
   ========================================================================== */

function AstronautFallback({ member }: { member: Member }) {
  const id = `astro-${member.id}`;
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`${member.name} avatar`}>
      <defs>
        <radialGradient id={`${id}-helmet`} cx="35%" cy="28%" r="85%">
          <stop offset="0" stopColor="#f8fafc" />
          <stop offset="1" stopColor="#94a3b8" />
        </radialGradient>
        <linearGradient id={`${id}-visor`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b1220" />
          <stop offset="1" stopColor={member.accent} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="#0a1120" />
      <circle cx="100" cy="100" r="78" fill={member.accent} opacity="0.12" />
      <path d="M26 204 C26 152 66 136 100 136 C134 136 174 152 174 204Z" fill={member.suit} />
      
      <rect x="78" y="128" width="44" height="16" rx="8" fill="#64748b" />
      <line x1="100" y1="34" x2="100" y2="20" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="18" r="4" fill={member.accent} />
      <circle cx="100" cy="86" r="52" fill={`url(#${id}-helmet)`} />
      <ellipse cx="100" cy="88" rx="38" ry="32" fill={`url(#${id}-visor)`} />
      <path d="M78 76 Q90 66 108 72" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.4" />
      <circle cx="100" cy="176" r="11" fill="#0b1220" stroke={member.accent} strokeWidth="2" />
      <text x="100" y="180.5" textAnchor="middle" fontSize="12" fontWeight="700" fill={member.accent} fontFamily="Space Grotesk, sans-serif">
        {member.name[0]}
      </text>
    </svg>
  );
}

function AvatarImage({ member, src }: { member: Member; src?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <AstronautFallback member={member} />;
  return (
    <img
      src={src}
      alt={`${member.name} avatar`}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

/* ==========================================================================
   Interactive slideshow card (avatars → role highlights → MissionCraft map)
   ========================================================================== */

function MemberShowcase({ member }: { member: Member }) {
  const reduce = useReducedMotion();
  const count = member.avatars.length + 2;
  const [[index, dir], setPage] = useState<[number, number]>([0, 0]);
  const [hovered, setHovered] = useState(false);

  const paginate = useCallback(
    (d: number) => setPage(([i]) => [(i + d + count) % count, d]),
    [count],
  );

  // Auto-advance; pauses on hover/focus and for reduced motion.
  useEffect(() => {
    if (hovered || reduce) return;
    const t = setTimeout(() => paginate(1), 6500);
    return () => clearTimeout(t);
  }, [index, hovered, reduce, paginate]);

  const avatarCount = member.avatars.length;
  const first = member.name.split(" ")[0];

  return (
    <div
      className={`${GLASS} relative flex h-[440px] flex-col overflow-hidden outline-none md:h-[500px]`}
      style={{ boxShadow: `0 0 80px -28px ${member.accent}, inset 0 1px 0 rgba(255,255,255,0.06)` }}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${member.name} showcase`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") paginate(1);
        if (e.key === "ArrowLeft") paginate(-1);
      }}
    >
      <div className="relative min-h-0 flex-1">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={index}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-8"
          >
            {index < avatarCount && (
              <div className="flex flex-col items-center gap-6">
                <div className="relative h-56 w-56 md:h-64 md:w-64">
                  <motion.div
                    className="absolute -inset-4 rounded-full border border-dashed"
                    style={{ borderColor: `${member.accent}88` }}
                    animate={reduce ? undefined : { rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
                  >
                    <span
                      className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full"
                      style={{ background: member.accent, boxShadow: `0 0 14px ${member.accent}` }}
                    />
                  </motion.div>
                  <div
                    className="h-full w-full overflow-hidden rounded-full border-4 bg-slate-900"
                    style={{ borderColor: member.accent, boxShadow: `0 0 40px -6px ${member.accent}` }}
                  >
                    <AvatarImage member={member} src={member.avatars[index]} />
                  </div>
                </div>
                <span
                  className={`${T.mono} rounded-full border px-4 py-1.5 uppercase`}
                  style={{ borderColor: `${member.accent}66`, background: `${member.accent}1f`, color: member.accent }}
                >
                  {member.badge}
                </span>
              </div>
            )}

            {index === avatarCount && (
              <div className="w-full max-w-md">
                <p className={T.eyebrow}>Role highlights</p>
                <ul className="mt-5 flex flex-col gap-3">
                  {member.highlights.map((h, i) => (
                    <motion.li
                      key={h.title}
                      initial={reduce ? false : { opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: EASE }}
                      className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    >
                      <span className={`${T.mono} mt-0.5`} style={{ color: member.accent }}>
                        0{i + 1}
                      </span>
                      <span>
                        <span className={`${T.label} block`}>{h.title}</span>
                        <span className={T.small}>{h.text}</span>
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}

            {index === avatarCount + 1 && (
              <div className="w-full max-w-md">
                <p className={T.eyebrow}>{first}&rsquo;s place in MissionCraft</p>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {MODULES.map((m, i) => {
                    const mine = m.id === member.module;
                    return (
                      <motion.li
                        key={m.id}
                        initial={reduce ? false : { opacity: 0, y: 16 }}
                        animate={{ opacity: mine ? 1 : 0.5, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.09, duration: 0.45, ease: EASE }}
                        className="flex items-center justify-between gap-3 rounded-2xl border p-4"
                        style={
                          mine
                            ? { borderColor: member.accent, background: `${member.accent}1a`, boxShadow: `0 0 28px -10px ${member.accent}` }
                            : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }
                        }
                      >
                        <span>
                          <span className={`${T.label} block`}>{m.label}</span>
                          <span className={T.small}>{m.hint}</span>
                        </span>
                        {mine && (
                          <span className={`${T.mono} uppercase`} style={{ color: member.accent }}>
                            ● Owner
                          </span>
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
        <button
          type="button"
          onClick={() => paginate(-1)}
          aria-label="Previous slide"
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
        >
          ←
        </button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setPage([i, i > index ? 1 : -1])}
              className="h-1.5 cursor-pointer rounded-full border-0 p-0 transition-all"
              style={{ width: i === index ? 30 : 12, background: i === index ? member.accent : "rgba(148,163,184,0.35)" }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => paginate(1)}
          aria-label="Next slide"
          className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
        >
          →
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   One full-height member section
   ========================================================================== */

function MemberSection({
  member,
  index,
  onActive,
}: {
  member: Member;
  index: number;
  onActive: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallax = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [70, -70]);
  const numberY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-40, 40]);
  const flip = index % 2 === 1;
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.section
      ref={ref}
      id={`member-${member.id}`}
      aria-label={member.name}
      onViewportEnter={() => onActive(index)}
      viewport={{ amount: 0.5 }}
      className="relative flex min-h-[calc(100vh-72px)] items-center overflow-hidden py-24"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${flip ? "20%" : "80%"} 50%, ${member.accent}22, transparent 60%)`,
        }}
      />
      <motion.span
        aria-hidden="true"
        style={{ y: numberY }}
        className={`pointer-events-none absolute top-10 select-none font-[family-name:var(--font-display)] text-[10rem] font-bold leading-none text-white/[0.04] md:text-[18rem] ${flip ? "right-6" : "left-6"}`}
      >
        {num}
      </motion.span>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-6 md:grid-cols-2 md:gap-16">
        <motion.div
          variants={stagger}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          className={flip ? "md:order-2" : ""}
        >
          <motion.p variants={rise} className={T.eyebrow}>
            {num} / 0{TEAM.length} · {member.badge}
          </motion.p>

          <h2 className="mt-4 overflow-hidden pb-2">
            <motion.span variants={maskUp} className={`${T.name} block`}>
              {member.name}
            </motion.span>
          </h2>

          <motion.p variants={rise} className={`${T.role} mt-2`}>
            {member.title}
          </motion.p>

          <div className="mt-7 flex flex-col gap-4">
            <motion.p variants={rise} className={T.lead}>
              {member.bio[0]}
            </motion.p>
            {member.bio.slice(1).map((p) => (
              <motion.p key={p} variants={rise} className={T.body}>
                {p}
              </motion.p>
            ))}
          </div>

          <motion.ul variants={rise} className="mt-8 flex flex-wrap gap-2.5">
            {member.focus.map((f) => (
              <li
                key={f}
                className={`${T.small} rounded-full border px-3.5 py-1.5 backdrop-blur-md`}
                style={{ borderColor: `${member.accent}55`, background: `${member.accent}14`, color: "#e2e8f0" }}
              >
                {f}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          style={{ y: parallax }}
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: EASE }}
          className={flip ? "md:order-1" : ""}
        >
          <MemberShowcase member={member} />
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ==========================================================================
   Page
   ========================================================================== */

export function TeamPage() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(-1);

  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  const jump = (id: string) =>
    document.getElementById(`member-${id}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });

  return (
    <div ref={rootRef} className="relative font-[family-name:var(--font-body)] text-slate-200 antialiased">
      <VideoBackground variant="backdrop" />

      {/* Sticky progress rail */}
      <nav aria-label="Team progress" className="pointer-events-none absolute inset-y-0 right-5 z-20 hidden lg:block">
        <div className="pointer-events-auto sticky top-1/2 flex -translate-y-1/2 flex-col items-center gap-5">
          <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-white/10" />
          <motion.div
            className="absolute inset-y-2 left-1/2 w-px origin-top -translate-x-1/2 bg-sky-400"
            style={{ scaleY: progress }}
          />
          {TEAM.map((m, i) => (
            <button
              key={m.id}
              type="button"
              onClick={() => jump(m.id)}
              aria-label={`Go to ${m.name}`}
              aria-current={active === i}
              className="group relative grid h-9 w-9 cursor-pointer place-items-center rounded-full border bg-slate-950/90 p-0 transition"
              style={{
                borderColor: active === i ? m.accent : "rgba(255,255,255,0.15)",
                boxShadow: active === i ? `0 0 16px ${m.accent}88` : "none",
              }}
            >
              <span className={T.mono} style={{ color: active === i ? m.accent : "#94a3b8" }}>
                0{i + 1}
              </span>
              <span
                className={`${T.small} pointer-events-none absolute right-12 whitespace-nowrap rounded-md border border-white/10 bg-slate-900/90 px-2.5 py-1 opacity-0 backdrop-blur-md transition group-hover:opacity-100`}
              >
                {m.name}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Intro */}
      <motion.section
        onViewportEnter={() => setActive(-1)}
        viewport={{ amount: 0.5 }}
        className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-6 py-24 text-center"
      >
        <motion.div
          variants={stagger}
          initial={reduce ? false : "hidden"}
          animate="show"
          className="mx-auto max-w-3xl"
        >
          <motion.p variants={rise} className={T.eyebrow}>
            NASA Space Apps Challenge 2026 · Mission Crew
          </motion.p>
          <h1 className="mt-5 overflow-hidden pb-2">
            <motion.span variants={maskUp} className={`${T.h1} block`}>
              Team <span className="text-sky-400">Neuru Volex</span>
            </motion.span>
          </h1>
          <motion.p variants={rise} className={`${T.lead} mx-auto mt-6 max-w-2xl`}>
            Four engineers making orbital mechanics and spacecraft systems intuitive, interactive, and grounded in real NASA data.
          </motion.p>

          <motion.ul variants={rise} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {TEAM.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => jump(m.id)}
                  className={`${GLASS} flex cursor-pointer items-center gap-3 rounded-full py-1.5 pl-1.5 pr-4 transition hover:border-sky-400/60`}
                >
                  <span className="h-9 w-9 overflow-hidden rounded-full border-2" style={{ borderColor: m.accent }}>
                    <AvatarImage member={m} src={m.avatars[0]} />
                  </span>
                  <span className={T.label}>{m.name}</span>
                </button>
              </li>
            ))}
          </motion.ul>

          <motion.p variants={rise} className={`${T.mono} mt-14 uppercase text-slate-400`}>
            <motion.span
              aria-hidden="true"
              className="mr-2 inline-block"
              animate={reduce ? undefined : { y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              ↓
            </motion.span>
            Scroll to meet the crew
          </motion.p>
        </motion.div>
      </motion.section>

      <div className="relative z-10">
        {TEAM.map((m, i) => (
          <MemberSection key={m.id} member={m} index={i} onActive={setActive} />
        ))}
      </div>
    </div>
  );
}