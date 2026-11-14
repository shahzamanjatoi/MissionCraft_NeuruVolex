export type PageId = 'home' | 'simulator' | 'science' | 'team' | 'contact';

interface NavbarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export function Navbar({ activePage, onNavigate }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          onClick={() => onNavigate('home')}
        >
          <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Mission<span style={{ color: 'var(--accent-cyan)' }}>Craft</span>
          </span>
        </div>

        <nav className="nav-links">
          <button className={`nav-link ${activePage === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}>
            Home
          </button>
          <button className={`nav-link ${activePage === 'simulator' ? 'active' : ''}`} onClick={() => onNavigate('simulator')}>
            Mission Simulator
          </button>
          <button className={`nav-link ${activePage === 'science' ? 'active' : ''}`} onClick={() => onNavigate('science')}>
            Science & NASA Data
          </button>
          <button className={`nav-link ${activePage === 'team' ? 'active' : ''}`} onClick={() => onNavigate('team')}>
            Team
          </button>
          <button className={`nav-link ${activePage === 'contact' ? 'active' : ''}`} onClick={() => onNavigate('contact')}>
            Contact
          </button>
          <button className="btn-primary" onClick={() => onNavigate('simulator')}>
            Launch Lab →
          </button>
        </nav>
      </div>
    </header>
  );
}
