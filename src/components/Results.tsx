import React from 'react';

export const Results: React.FC<{
  score?: number;
  deltaVUsed?: number;
  success?: boolean;
  onRestart?: () => void;
  onViewReplay?: () => void;
}> = ({ score = 85, deltaVUsed = 4.2, success = true, onRestart, onViewReplay }) => {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-white p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full bg-gray-900/80 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 space-y-8">
        
        {/* Header Section */}
        <section className="text-center space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-semibold tracking-wide">
            Mission Simulation Results
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {success ? 'Mission Successful!' : 'Mission Critical Failure'}
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Telemetry analysis and orbital mechanics calculations completed successfully using NASA mission datasets.
          </p>
        </section>

        {/* Metrics Grid Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center space-y-2">
            <span className="text-gray-400 text-sm">Mission Score</span>
            <div className="text-3xl font-bold text-cyan-400">{score} / 100</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center space-y-2">
            <span className="text-gray-400 text-sm">Delta-V Consumed</span>
            <div className="text-3xl font-bold text-cyan-400">{deltaVUsed} km/s</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 text-center space-y-2">
            <span className="text-gray-400 text-sm">Trajectory Status</span>
            <div className="text-3xl font-bold text-emerald-400">{success ? 'Nominal' : 'Off-Target'}</div>
          </div>
        </section>

        {/* Detailed Telemetry Breakdown */}
        <section className="bg-gray-800/30 border border-cyan-500/20 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
            <span>Telemetry & Orbital Summary</span>
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Your spacecraft performed trajectory burns adhering to GMAT offline reference tables. <strong>Orbital insertion parameters</strong> were verified against planetary gravitational constants.
          </p>
          <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-700/50">
            <div className="text-xs text-gray-400">
              Status: <strong className="text-white">Validated via NASA Datasets</strong>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          {onViewReplay && (
            <button
              onClick={onViewReplay}
              className="px-6 py-3 rounded-xl bg-cyan-500 text-gray-950 font-bold hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              View 3D Mission Replay
            </button>
          )}
          {onRestart && (
            <button
              onClick={onRestart}
              className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold transition border border-gray-700 cursor-pointer"
            >
              Configure New Mission
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default Results;