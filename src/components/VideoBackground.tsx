import { useState } from "react";

interface VideoBackgroundProps {
  /** "hero" fills its parent; "backdrop" is a fixed, dimmed backdrop for app screens. */
  variant?: "hero" | "backdrop";
}

/** Looping space video. Falls back to a CSS starfield if the video can't load. */
export function VideoBackground({ variant = "hero" }: VideoBackgroundProps) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`video-bg video-bg--${variant} ${failed ? "video-bg--fallback" : ""}`} aria-hidden="true">
      {!failed && (
        <video
          className="video-bg__video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
        >
          <source src="/hero.mp4" type="video/mp4" onError={() => setFailed(true)} />
        </video>
      )}
      <div className="video-bg__shade" />
    </div>
  );
}