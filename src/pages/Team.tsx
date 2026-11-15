import { useState, useEffect } from "react";
import "../App.css";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  badge: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Shahzaman Jatoi",
    role: "Lead AI & Systems Engineer",
    bio: "Architecting the core simulation engine, FastAPI pipelines, and full-stack MissionCraft architecture.",
    avatar: "/SHAHZAMAN.webp",
    badge: "Mission Commander",
  },
  {
    name: "Alisha",
    role: "3D Visualization Lead",
    bio: "Developing 'Mission Viz', Three.js 3D viewport rendering, and orbital mechanics simulation interfaces.",
    avatar: "/Alisha.webp",
    badge: "Flight Director",
  },
  {
    name: "Yousaif",
    role: "Propulsion & Trajectory Specialist",
    bio: "Integrating NASA open datasets, GMAT trajectory constants, and automated telemetry validation.",
    avatar: "/yousaif.jpg",
    badge: "Navigation Specialist",
  },
  {
    name: "Zara",
    role: "Payload & Science Officer",
    bio: "Curating payload specifications, launch vehicle telemetry, and science operations benchmarks.",
    avatar: "/Zara.webp",
    badge: "Payload Officer",
  },
];

export function TeamPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slideshow every 6 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TEAM_MEMBERS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const member = TEAM_MEMBERS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TEAM_MEMBERS.length) % TEAM_MEMBERS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TEAM_MEMBERS.length);
  };

  return (
    <div
      className="team-page"
      style={{
        padding: "60px 20px",
        maxWidth: "900px",
        margin: "0 auto",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <header style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.8rem", fontWeight: 700, color: "#fff", marginBottom: "10px", letterSpacing: "0.02em" }}>
          Team Neuru Volex
        </h1>
        <p style={{ color: "#9aa6c4", fontSize: "1.1rem", maxWidth: "650px", lineHeight: "1.6", margin: "0 auto" }}>
          NASA Space Apps Challenge 2026 · Mission Crew Introductions
        </p>
      </header>

      {/* Featured Slideshow Card */}
      <div
        className="panel"
        style={{
          background: "linear-gradient(135deg, #131a33 0%, #0d1326 100%)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          borderRadius: "24px",
          padding: "40px",
          width: "100%",
          maxWidth: "700px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          transition: "all 0.4s ease-in-out",
        }}
      >
        {/* Large Prominent Avatar */}
        <div
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid #38bdf8",
            boxShadow: "0 0 25px rgba(56, 189, 248, 0.3)",
            background: "#182043",
            marginBottom: "24px",
            flexShrink: 0,
          }}
        >
          <img
            src={member.avatar}
            alt={member.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>

        {/* Badge */}
        <span
          style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: "999px",
            background: "rgba(56, 189, 248, 0.15)",
            color: "#38bdf8",
            fontSize: "0.8rem",
            fontWeight: 700,
            marginBottom: "16px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {member.badge}
        </span>

        {/* Name & Role */}
        <h2 style={{ fontSize: "2rem", color: "#fff", margin: "0 0 8px", fontWeight: 700 }}>
          {member.name}
        </h2>
        <h3 style={{ color: "#8fb0ff", fontSize: "1.1rem", fontWeight: 600, margin: "0 0 20px" }}>
          {member.role}
        </h3>

        {/* Bio */}
        <p style={{ color: "#9aa6c4", fontSize: "1rem", lineHeight: "1.7", maxWidth: "550px", margin: "0 0 30px" }}>
          {member.bio}
        </p>

        {/* Controls & Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: "10px" }}>
          <button
            onClick={handlePrev}
            style={{
              background: "#1b264f",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#26356e")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1b264f")}
          >
            ← Previous
          </button>

          {/* Slide Indicator Dots */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {TEAM_MEMBERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: idx === currentIndex ? "24px" : "10px",
                  height: "10px",
                  borderRadius: "5px",
                  background: idx === currentIndex ? "#38bdf8" : "#26356e",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            style={{
              background: "#1b264f",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "#38bdf8",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#26356e")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1b264f")}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamPage;