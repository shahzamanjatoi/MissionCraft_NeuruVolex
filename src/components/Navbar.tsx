import { useEffect, useState } from 'react';

export type PageId = 'home' | 'simulator' | 'science' | 'team' | 'contact';

interface NavbarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

const LINKS: { id: PageId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'simulator', label: 'Mission Simulator' },
  { id: 'science', label: 'Science & NASA Data' },
  { id: 'team', label: 'Team' },
  { id: 'contact', label: 'Contact' },
];

export function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const go = (page: PageId) => {
    onNavigate(page);
    setOpen(false);
  };

  // Close the menu with Escape, and when the screen is resized back to desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth > 900 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div
          className="navbar-brand"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          onClick={() => go('home')}
        >
          <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Mission<span style={{ color: 'var(--accent-cyan)' }}>Craft</span>
          </span>
        </div>

        <button
          type="button"
          className={`menu-toggle ${open ? 'open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="primary-nav" className={`nav-links ${open ? 'open' : ''}`}>
          {LINKS.map(({ id, label }) => (
            <button
              key={id}
              className={`nav-link ${activePage === id ? 'active' : ''}`}
              onClick={() => go(id)}
            >
              {label}
            </button>
          ))}
          <button className="btn-primary" onClick={() => go('simulator')}>
            Launch Lab →
          </button>
        </nav>
      </div>
    </header>
  );
}
