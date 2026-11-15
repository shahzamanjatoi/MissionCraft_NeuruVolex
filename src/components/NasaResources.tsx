
import { NASA_SOURCES } from "../data";

export function NasaResources() {
  return (
    <section className="nasa-resources">
      <h2>NASA Mission Resources</h2>

      <p>
        Explore the real NASA missions and technical references behind
        MissionCraft.
      </p>

      <div className="nasa-featured-video">
        <h3>Featured NASA Video: Tour of the Moon in 4K</h3>

        <p>
          Explore the lunar surface through a visualization created
          using data collected by NASA's Lunar Reconnaissance Orbiter.
        </p>

        <div>
          <iframe
            src="https://www.youtube-nocookie.com/embed/nr5Pj6GQL2o"
            title="NASA Goddard - Tour of the Moon in 4K"
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              border: 0,
              borderRadius: "12px",
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <p>
          Video credit: NASA Goddard Space Flight Center.
        </p>
      </div>

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
            <span>
              {source.organization} · {source.category}
            </span>
            <span>{source.description}</span>
            <span className="nasa-link">Open reference ↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
