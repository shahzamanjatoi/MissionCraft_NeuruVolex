import { useState } from 'react';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '760px' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Contact & Feedback</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
        Have questions about MissionCraft or our NASA Space Apps Challenge 2026 submission? Send a note to Team Neuru Volex.
      </p>

      {submitted ? (
        <div className="card" style={{ borderColor: 'var(--accent-cyan)', textAlign: 'center', padding: '2.5rem' }}>
          <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>Transmission Received</h3>
          <p style={{ color: 'var(--text-muted)' }}>Thank you for reaching out to Team Neuru Volex.</p>
        </div>
      ) : (
        <form
          className="card"
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <input required placeholder="Your Name" style={{ padding: '0.85rem', borderRadius: '8px', background: '#060b14', border: '1px solid var(--border-subtle)', color: 'white' }} />
          <input required type="email" placeholder="Email Address" style={{ padding: '0.85rem', borderRadius: '8px', background: '#060b14', border: '1px solid var(--border-subtle)', color: 'white' }} />
          <textarea required rows={4} placeholder="Your Message or Mission Feedback" style={{ padding: '0.85rem', borderRadius: '8px', background: '#060b14', border: '1px solid var(--border-subtle)', color: 'white' }} />
          <button type="submit" className="btn-primary">Send Message →</button>
        </form>
      )}
    </div>
  );
}
