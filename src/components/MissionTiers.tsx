import { Reveal } from "./Reveal";
import { ArrowRight, Check, Rocket } from "./icons";

interface Tier {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  features: string[];
  cta: string;
  featured?: boolean;
  action: "start" | "upgrade";
}

// Edit the copy / prices here.
const TIERS: Tier[] = [
  {
    name: "Free Cadet",
    tagline: "Everything you need to fly your first mission.",
    price: "Free",
    priceNote: "forever",
    features: [
      "Core mission simulator",
      "Standard planetary targets",
      "Basic telemetry",
      "Public NASA datasets",
    ],
    cta: "Get Started",
    action: "start",
  },
  {
    name: "Pro Commander",
    tagline: "Advanced tools for serious mission designers.",
    price: "Pro",
    priceNote: "per month — pricing coming soon",
    features: [
      "Advanced 3D Mission Viz canvas",
      "Heavy orbital telemetry playback",
      "Extended multi-planetary mission design tools",
      "Priority export features",
    ],
    cta: "Upgrade to Pro",
    featured: true,
    action: "upgrade",
  },
];

interface MissionTiersProps {
  onGetStarted: () => void;
  onUpgrade: () => void;
}

/** "Mission Tiers" — two-tier comparison with a glowing featured Pro card. */
export function MissionTiers({ onGetStarted, onUpgrade }: MissionTiersProps) {
  return (
    <section
      id="mission-tiers"
      className="relative overflow-hidden bg-[#0b0f19] py-20 md:py-28"
      aria-labelledby="mission-tiers-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl"
      />

      <div className="container relative">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center md:mb-16">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Choose your rank
          </span>
          <h2 id="mission-tiers-title" className="mt-3 text-3xl font-bold text-white md:text-5xl">
            Mission Tiers
          </h2>
          <p className="mt-4 text-base text-slate-400 md:text-lg">
            Start free as a Cadet, then step up to Commander when your missions outgrow the basics.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-8 md:grid-cols-2">
          {TIERS.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 140} className="h-full">
              <article
                className={[
                  "relative flex h-full flex-col rounded-2xl p-8 backdrop-blur-xl",
                  tier.featured
                    ? "border-2 border-cyan-400 bg-cyan-400/[0.06] shadow-[0_0_55px_-8px_rgba(34,211,238,0.55)] md:-my-3 md:py-11"
                    : "border border-white/10 bg-white/[0.04]",
                ].join(" ")}
              >
                {tier.featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-cyan-400 px-4 py-1 text-xs font-bold uppercase tracking-wider text-gray-950 shadow-[0_0_20px_rgba(34,211,238,0.6)]">
                    Most capable
                  </span>
                )}

                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                  <Rocket size={22} />
                </div>

                <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{tier.tagline}</p>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${tier.featured ? "text-cyan-400" : "text-white"}`}>
                    {tier.price}
                  </span>
                  <span className="text-sm text-slate-500">{tier.priceNote}</span>
                </div>

                <ul className="m-0 mt-8 flex flex-1 list-none flex-col gap-3.5 p-0">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-300 md:text-base">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-400">
                        <Check size={13} strokeWidth={3} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={tier.action === "start" ? onGetStarted : onUpgrade}
                  className="mt-10 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-cyan-400 px-6 py-3.5 text-base font-semibold text-gray-950 transition hover:bg-cyan-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                >
                  {tier.cta}
                  <ArrowRight size={18} />
                </button>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
