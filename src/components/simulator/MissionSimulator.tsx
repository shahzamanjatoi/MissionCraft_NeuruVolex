
import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  Fuel,
  Gauge,
  Orbit,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Rocket,
  Satellite,
  ShieldCheck,
  Signal,
  Zap,
} from "lucide-react";

// ----------------------------------
// Types
// ----------------------------------

export type MissionTelemetry = {
  altitudeKm: number;
  velocityKmS: number;
  fuelPercent: number;
  fuelBurnKgS: number;
  deltaVUsed: number;
  deltaVAvailable: number;
  thrustRatio: number;
  progress: number;
  elapsedSeconds: number;
  orbitLabel: string;
  status: "ready" | "running" | "paused" | "success" | "failure";
};

export type MissionResult = {
  outcome: "success" | "failure";
  title: string;
  message: string;
  achievedAltitudeKm: number;
  finalVelocityKmS: number;
  fuelRemainingPercent: number;
  deltaVUsed: number;
  durationSeconds: number;
};

type Props = {
  telemetry: MissionTelemetry;
  missionName: string;
  missionId: string;
  missionResult?: MissionResult | null;
  threeDView?: ReactNode;
  onLaunch: () => void;
  onAbort: () => void;
  onReplay: () => void;
};

// ----------------------------------
// Helpers
// ----------------------------------

const clamp = (value: number) =>
  Math.max(0, Math.min(100, value));

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(
    secs
  ).padStart(2, "0")}`;
};

// ----------------------------------
// Status indicator
// ----------------------------------

function StatusIndicator({
  label,
  active = true,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
      <span
        className={`h-2 w-2 rounded-full ${
          active
            ? "bg-emerald-400 animate-pulse"
            : "bg-amber-400"
        }`}
      />
      <span className="text-[10px] font-bold tracking-widest text-emerald-300">
        {label}
      </span>
    </div>
  );
}

// ----------------------------------
// Telemetry card
// ----------------------------------

function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  color = "text-cyan-400",
}: {
  label: string;
  value: string;
  unit: string;
  icon: typeof Activity;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-cyan-500/20 bg-gray-900/70 p-4 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest text-gray-500">
          {label}
        </span>
        <Icon size={16} className={color} />
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`font-mono text-2xl font-bold ${color}`}>
          {value}
        </span>
        <span className="text-xs text-gray-500">{unit}</span>
      </div>

      <div className="mt-3 h-px bg-gradient-to-r from-cyan-500/40 to-transparent" />
    </motion.div>
  );
}

// ----------------------------------
// Circular gauge
// ----------------------------------

function OrbitalGauge({
  label,
  value,
  unit,
  color = "#22d3ee",
}: {
  label: string;
  value: number;
  unit: string;
  color?: string;
}) {
  const normalized = clamp(value);
  const circumference = 2 * Math.PI * 42;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg
          viewBox="0 0 100 100"
          className="-rotate-90"
        >
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#1f2937"
            strokeWidth="7"
          />

          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{
              strokeDashoffset:
                circumference -
                (normalized / 100) * circumference,
            }}
            transition={{ duration: 0.8 }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-2xl font-bold text-white">
            {normalized.toFixed(0)}
          </span>
          <span className="text-[9px] tracking-widest text-gray-500">
            {unit}
          </span>
        </div>
      </div>

      <span className="text-xs font-bold tracking-widest text-gray-400">
        {label}
      </span>
    </div>
  );
}

// ----------------------------------
// Delta-V budget
// ----------------------------------

function DeltaVBudget({
  used,
  available,
}: {
  used: number;
  available: number;
}) {
  const remaining = Math.max(0, available - used);
  const percentage =
    available > 0 ? clamp((used / available) * 100) : 0;

  return (
    <section className="rounded-xl border border-cyan-500/20 bg-gray-900/70 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="text-cyan-400" size={18} />
          <h3 className="text-sm font-bold text-white">
            DELTA-V BUDGET
          </h3>
        </div>

        <span className="font-mono text-xs text-cyan-400">
          {percentage.toFixed(1)}% USED
        </span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] text-gray-500">CONSUMED</p>
          <p className="mt-1 font-mono text-sm text-cyan-400">
            {used.toFixed(0)} m/s
          </p>
        </div>

        <div>
          <p className="text-[10px] text-gray-500">REMAINING</p>
          <p className="mt-1 font-mono text-sm text-emerald-400">
            {remaining.toFixed(0)} m/s
          </p>
        </div>

        <div>
          <p className="text-[10px] text-gray-500">TOTAL</p>
          <p className="mt-1 font-mono text-sm text-white">
            {available.toFixed(0)} m/s
          </p>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------
// Launch sequence
// ----------------------------------

function LaunchSequence({
  running,
  onLaunch,
  onAbort,
}: {
  running: boolean;
  onLaunch: () => void;
  onAbort: () => void;
}) {
  const [countdown, setCountdown] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = window.setTimeout(() => {
      setCountdown((current) =>
        current === null ? null : current - 1
      );
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown !== 0) return;

    setCountdown(null);
    onLaunch();
  }, [countdown, onLaunch]);

  const startCountdown = () => {
    if (!running) setCountdown(3);
  };

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gray-900/80 p-6 text-center shadow-[0_0_30px_rgba(34,211,238,0.08)]">
      <div className="flex items-center justify-center gap-2">
        <Rocket className="text-cyan-400" />
        <h3 className="text-sm font-bold tracking-[0.2em] text-white">
          LAUNCH AUTHORIZATION
        </h3>
      </div>

      <AnimatePresence mode="wait">
        {countdown !== null ? (
          <motion.div
            key={countdown}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="my-5 font-mono text-7xl font-black text-cyan-400"
          >
            {countdown === 0 ? "GO" : countdown}
          </motion.div>
        ) : (
          <motion.p
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="my-5 text-sm text-gray-400"
          >
            {running
              ? "MISSION IN PROGRESS"
              : "ALL SYSTEMS READY · AWAITING IGNITION"}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap justify-center gap-3">
        {!running && (
          <button
            onClick={startCountdown}
            disabled={countdown !== null}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-black text-gray-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            <Play size={16} />
            INITIATE LAUNCH
          </button>
        )}

        {running && (
          <button
            onClick={onAbort}
            className="flex items-center gap-2 rounded-lg border border-red-500/40 px-6 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10"
          >
            <Pause size={16} />
            ABORT MISSION
          </button>
        )}
      </div>
    </div>
  );
}

// ----------------------------------
// Mission result modal
// ----------------------------------

function MissionResultModal({
  result,
  onClose,
  onReplay,
}: {
  result: MissionResult;
  onClose: () => void;
  onReplay: () => void;
}) {
  const success = result.outcome === "success";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0b1220] p-7 shadow-[0_0_80px_rgba(34,211,238,0.15)]"
      >
        {success &&
          Array.from({ length: 16 }).map((_, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-cyan-300"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 23) % 100}%`,
              }}
              animate={{
                y: [0, -35, 15],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.12,
              }}
            />
          ))}

        <div className="relative z-10">
          <div className="mb-5 flex justify-center">
            {success ? (
              <CheckCircle2
                size={60}
                className="text-emerald-400"
              />
            ) : (
              <AlertTriangle
                size={60}
                className="text-red-400"
              />
            )}
          </div>

          <h2
            className={`text-center text-3xl font-black tracking-widest ${
              success ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {result.title}
          </h2>

          <p className="mt-3 text-center text-sm text-gray-400">
            {result.message}
          </p>

          <div className="my-7 grid grid-cols-2 gap-3">
            {[
              ["ALTITUDE", `${result.achievedAltitudeKm} km`],
              ["VELOCITY", `${result.finalVelocityKmS} km/s`],
              ["FUEL REMAINING", `${result.fuelRemainingPercent}%`],
              ["DELTA-V USED", `${result.deltaVUsed} m/s`],
              ["DURATION", formatTime(result.durationSeconds)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
              >
                <p className="text-[10px] tracking-widest text-gray-500">
                  {label}
                </p>
                <p className="mt-2 font-mono text-lg text-white">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onReplay}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 text-sm font-bold text-black hover:bg-cyan-300"
            >
              <RotateCcw size={16} />
              3D MISSION REPLAY
            </button>

            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 px-5 py-3 text-sm text-gray-300 hover:bg-white/5"
            >
              CLOSE
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ----------------------------------
// Main mission simulator
// ----------------------------------

export default function MissionSimulator({
  telemetry,
  missionName,
  missionId,
  missionResult,
  threeDView,
  onLaunch,
  onAbort,
  onReplay,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "telemetry" | "3d"
  >("overview");

  const [showResult, setShowResult] = useState(true);

  const running = telemetry.status === "running";

  const tabs = [
    { id: "overview", label: "OVERVIEW" },
    { id: "telemetry", label: "TELEMETRY" },
    { id: "3d", label: "3D VIEW" },
  ] as const;

  return (
    <main className="min-h-screen bg-[#0b0f19] p-4 text-white md:p-7">

      {/* Header */}

      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Satellite size={20} />
            <span className="text-xs font-black tracking-[0.25em]">
              MISSIONCRAFT / FLIGHT OPERATIONS
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-black tracking-wider md:text-4xl">
            MISSION SIMULATOR
          </h1>

          <p className="mt-2 text-xs text-gray-500">
            {missionName} · {missionId}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusIndicator
            label={running ? "MISSION ACTIVE" : "SYSTEM NOMINAL"}
          />
          <StatusIndicator label="TELEMETRY LOCKED" />
        </div>
      </header>

      {/* Navigation */}

      <nav className="mb-6 flex gap-2 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-3 text-xs font-bold tracking-widest ${
              activeTab === tab.id
                ? "text-cyan-400"
                : "text-gray-500 hover:text-white"
            }`}
          >
            {tab.label}

            {activeTab === tab.id && (
              <motion.div
                layoutId="mission-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Animated content */}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

              <div className="space-y-5 xl:col-span-2">

                {/* Spacecraft visual */}

                <section className="relative min-h-[280px] overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#101b2a]">

                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400 animate-[spin_30s_linear_infinite]" />
                    <div className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-400 animate-[spin_20s_linear_infinite_reverse]" />
                  </div>

                  <div className="relative z-10 flex items-center justify-between p-5">
                    <div>
                      <p className="text-[10px] tracking-widest text-cyan-400">
                        ORBITAL TRACKING
                      </p>
                      <p className="mt-1 text-sm font-bold">
                        {telemetry.orbitLabel}
                      </p>
                    </div>

                    <Crosshair className="text-cyan-400" />
                  </div>

                  <div className="relative z-10 flex min-h-[190px] items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 24,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="flex h-36 w-36 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/5 shadow-[0_0_60px_rgba(34,211,238,0.15)]"
                    >
                      <Orbit size={68} className="text-cyan-300" />
                    </motion.div>

                    <motion.div
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_20px_#22d3ee]"
                    />
                  </div>

                  <div className="relative z-10 flex justify-between border-t border-white/10 px-5 py-3">
                    <span className="text-[10px] text-gray-500">
                      ORBITAL RADAR / ACTIVE
                    </span>
                    <span className="text-[10px] text-cyan-400">
                      TRACKING LOCK
                    </span>
                  </div>
                </section>

                {/* Metrics */}

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  <MetricCard
                    label="ALTITUDE"
                    value={telemetry.altitudeKm.toFixed(1)}
                    unit="KM"
                    icon={Orbit}
                  />

                  <MetricCard
                    label="VELOCITY"
                    value={telemetry.velocityKmS.toFixed(2)}
                    unit="KM/S"
                    icon={Activity}
                  />

                  <MetricCard
                    label="FUEL REMAINING"
                    value={telemetry.fuelPercent.toFixed(1)}
                    unit="%"
                    icon={Fuel}
                    color="text-emerald-400"
                  />
                </div>

                <DeltaVBudget
                  used={telemetry.deltaVUsed}
                  available={telemetry.deltaVAvailable}
                />
              </div>

              {/* Right control panel */}

              <aside className="space-y-5">

                <section className="rounded-xl border border-cyan-500/20 bg-gray-900/70 p-5">
                  <h3 className="mb-5 text-sm font-bold tracking-widest">
                    FLIGHT INSTRUMENTS
                  </h3>

                  <div className="flex justify-around">
                    <OrbitalGauge
                      label="THRUST"
                      value={telemetry.thrustRatio}
                      unit="%"
                    />

                    <OrbitalGauge
                      label="FUEL"
                      value={telemetry.fuelPercent}
                      unit="%"
                      color="#34d399"
                    />
                  </div>
                </section>

                <LaunchSequence
                  running={running}
                  onLaunch={onLaunch}
                  onAbort={onAbort}
                />

                <section className="rounded-xl border border-white/10 bg-gray-900/70 p-4">
                  <h3 className="mb-3 text-xs font-bold tracking-widest text-gray-400">
                    FLIGHT STATUS
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">MISSION TIME</span>
                      <span className="font-mono text-cyan-400">
                        {formatTime(telemetry.elapsedSeconds)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">FUEL BURN</span>
                      <span className="font-mono text-white">
                        {telemetry.fuelBurnKgS.toFixed(2)} kg/s
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">PROPULSION</span>
                      <span className="text-emerald-400">ONLINE</span>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          )}

          {activeTab === "telemetry" && (
            <div className="grid gap-5 md:grid-cols-2">
              <MetricCard
                label="ALTITUDE"
                value={telemetry.altitudeKm.toFixed(2)}
                unit="KM"
                icon={Orbit}
              />

              <MetricCard
                label="VELOCITY"
                value={telemetry.velocityKmS.toFixed(3)}
                unit="KM/S"
                icon={Activity}
              />

              <MetricCard
                label="FUEL BURN RATE"
                value={telemetry.fuelBurnKgS.toFixed(3)}
                unit="KG/S"
                icon={Fuel}
              />

              <MetricCard
                label="MISSION ELAPSED"
                value={formatTime(telemetry.elapsedSeconds)}
                unit="MM:SS"
                icon={Radio}
              />

              <div className="md:col-span-2">
                <DeltaVBudget
                  used={telemetry.deltaVUsed}
                  available={telemetry.deltaVAvailable}
                />
              </div>
            </div>
          )}

          {activeTab === "3d" && (
            <section className="min-h-[480px] overflow-hidden rounded-2xl border border-cyan-500/20 bg-gray-900/70">
              {threeDView ?? (
                <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 p-6 text-center">
                  <Satellite size={48} className="text-cyan-400" />
                  <h3 className="font-bold tracking-widest">
                    3D SPACECRAFT VIEW
                  </h3>
                  <p className="max-w-md text-sm text-gray-500">
                    Mount your existing Three.js or React Three Fiber
                    spacecraft scene here.
                  </p>
                </div>
              )}
            </section>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Mission progress */}

      <section className="mt-6 rounded-xl border border-white/10 bg-gray-900/70 p-5">
        <div className="mb-3 flex justify-between">
          <span className="text-xs font-bold tracking-widest text-gray-400">
            MISSION OBJECTIVE PROGRESS
          </span>
          <span className="font-mono text-sm text-cyan-400">
            {clamp(telemetry.progress).toFixed(0)}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-gray-800">
          <motion.div
            animate={{ width: `${clamp(telemetry.progress)}%` }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
          />
        </div>
      </section>

      {/* Result modal */}

      <AnimatePresence>
        {missionResult && showResult && (
          <MissionResultModal
            result={missionResult}
            onClose={() => setShowResult(false)}
            onReplay={() => {
              setShowResult(false);
              onReplay();
            }}
          />
        )}
      </AnimatePresence>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[10px] tracking-widest text-gray-600">
        <span>MISSIONCRAFT · TEAM NEURU VOLEX</span>
        <span>SPACE APPS CHALLENGE 2026</span>
        <span>FLIGHT SYSTEMS v1.0</span>
      </footer>
    </main>
  );
}
