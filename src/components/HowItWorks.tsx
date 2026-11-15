import type { ComponentType } from "react";
import { Reveal } from "./Reveal";
import { Activity, Cpu, Orbit } from "./icons";

interface Step {
  title: string;
  description: string;
  chips: string[];
  Icon: ComponentType<{ size?: number }>;
}

const STEPS: Step[] = [
  {
    title: "Design Spacecraft",
    description:
      "Assemble your vehicle piece by piece. Select the hull, engines, and payload components, and watch mass, power, and cost margins update live.",
    chips: ["Hull", "Engines", "Payload"],
    Icon: Cpu,
  },
  {
    title: "Calculate Trajectory & Delta-V",
    description:
      "Apply real orbital mechanics and GMAT reference tables to see whether your propulsion can actually deliver the delta-v your target demands.",
    chips: ["Orbital mechanics", "GMAT tables", "Delta-v budget"],
    Icon: Orbit,
  },
  {
    title: "Launch & Monitor",
    description:
      "Fly the mission. Simulate live telemetry, survive eclipses and battery drain, and follow your spacecraft in 3D orbital animations.",
    chips: ["Live telemetry", "3D orbit view"],
    Icon: Activity,
  },
];

/** "How MissionCraft Works" — three-step workflow grid with glowing number badges. */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[#0b0f19] py-20 md:py-28"
      aria-labelledby="how-it-works-title"
    >
      {/* soft cyan glow behind the section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl"
      />

      <div className="container relative">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Three steps to orbit
          </span>
          <h2 id="how-it-works-title" className="mt-3 text-3xl font-bold text-white md:text-5xl">
            How MissionCraft Works
          </h2>
          <p className="mt-4 text-base text-slate-400 md:text-lg">
            From an empty launch pad to a live mission in the time it takes to build one spacecraft.
          </p>
        </Reveal>

        <ol className="relative m-0 grid list-none grid-cols-1 gap-12 p-0 md:grid-cols-3 md:gap-8">
          {/* connector line running through the badges (desktop only) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[16.7%] right-[16.7%] top-7 hidden h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent md:block"
          />

          {STEPS.map(({ title, description, chips, Icon }, i) => (
            <Reveal as="li" key={title} delay={i * 120} className="relative">
              {/* numbered glowing badge */}
              <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/60 bg-[#0b0f19] text-lg font-bold text-cyan-400 shadow-[0_0_28px_rgba(34,211,238,0.45)]">
                {i + 1}
              </div>

              <div className="-mt-7 h-full rounded-2xl border border-white/10 bg-white/[0.04] px-6 pb-8 pt-12 text-center shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_40px_-12px_rgba(34,211,238,0.5)]">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                  <Icon size={26} />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  <span className="sr-only">Step {i + 1}: </span>
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400 md:text-base">{description}</p>

                <ul className="m-0 mt-5 flex list-none flex-wrap justify-center gap-2 p-0">
                  {chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs font-medium text-cyan-300"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
