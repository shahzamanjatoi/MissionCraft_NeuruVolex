export function TeamPage() {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
        Team <span style={{ color: 'var(--accent-cyan)' }}>Neuru Volex</span>
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '720px', marginBottom: '3rem' }}>
        Built for the NASA Space Apps Challenge 2026 to make orbital mechanics and spacecraft systems engineering intuitive, interactive, and grounded in real NASA data.
      </p>
      <div className="grid-3">
        <div className="card">
          <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 700 }}>SYSTEMS & SIMULATION</span>
          <h3 style={{ margin: '0.4rem 0' }}>Shahzaman Jatoi</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Full-stack architecture, GMAT trajectory physics modeling, and real-time spacecraft simulation engine.
          </p>
        </div>
        <div className="card">
          <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 700 }}>3D VISUALIZATION</span>
          <h3 style={{ margin: '0.4rem 0' }}>Alisha</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            3D orbital trajectory visualization (Mission Viz) and spatial maneuver playback.
          </p>
        </div>
        <div className="card">
          <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: 700 }}>NASA OPEN DATA</span>
          <h3 style={{ margin: '0.4rem 0' }}>MissionCraft Research</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Curated payload specifications, launch vehicle telemetry, and historical NASA mission benchmarks.
          </p>
        </div>
      </div>
    </div>
  );
}
