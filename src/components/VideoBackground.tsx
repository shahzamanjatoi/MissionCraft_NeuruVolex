/** Full-screen looping video behind the whole app, with a dark overlay so the panels stay readable. */
export function VideoBackground() {
  return (
    <div className="video-bg" aria-hidden="true">
      <video
        className="video-bg__video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="video-bg__shade" />
    </div>
  );
}