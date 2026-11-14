
import { NASA_SOURCES } from "../data";

export function NasaResources() {
  return (
    <section className="nasa-resources">
      <h2>NASA Mission Resources</h2>
      <p>
        Explore the real NASA missions and technical references behind
        MissionCraft.
      </p>

      <div className="cards">
        {NASA_SOURCES.map((source) => (
          <a
            className="card nasa-card"
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noreferrer"
          >
            <strong>{source.title}</strong>
            <span>{source.organization} · {source.category}</span>
            <span>{source.description}</span>
            <span className="nasa-link">Open reference ↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
