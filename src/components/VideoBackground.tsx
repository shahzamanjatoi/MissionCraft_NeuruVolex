import { useState } from "react";

interface VideoBackgroundProps {
  /** "hero" fills its parent; "backdrop" is a fixed, dimmed backdrop for app screens. */
  variant?: "hero" | "backdrop";
}

/** Looping space video. Falls back to NASA orbital stream & CSS starfield if /hero.mp4 isn't present. */
export function VideoBackground({ variant = "hero" }: VideoBackgroundProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`video-bg video-bg--${variant} ${failed ? "video-bg--fallback" : ""}`}
      aria-hidden="true"
    >
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
          <source src="/hero.mp4" type="video/mp4" />
          <source
            src="https://images-assets.nasa.gov/video/GSFC_20180921_LRO_m12953_Moon/GSFC_20180921_LRO_m12953_Moon~orig.mp4"
            type="video/mp4"
            onError={() => setFailed(true)}
          />
        </video>
      )}
      <div className="video-bg__shade" />
    </div>
  );
}
