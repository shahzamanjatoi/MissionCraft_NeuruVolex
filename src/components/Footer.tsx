import type { PageId } from './Navbar';

export function Footer({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '3.5rem 0 2rem', background: '#04080f', color: 'var(--text-muted)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Mission<span style={{ color: 'var(--accent-cyan)' }}>Craft</span>
            </div>
            <p style={{ fontSize: '0.9rem' }}>
              Design. Launch. Learn. Real-time spacecraft engineering and orbital simulation powered by NASA open datasets.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('home')}>Overview</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('simulator')}>Mission Simulator</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('science')}>NASA Datasets</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Team Neuru Volex</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('team')}>About the Team</span>
              <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('contact')}>Contact & Feedback</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          <span>© 2026 MissionCraft • Team Neuru Volex</span>
          <span>NASA Space Apps Challenge 2026</span>
        </div>
      </div>
    </footer>
  );
}
