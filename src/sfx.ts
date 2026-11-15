/** Tiny Web Audio sound effects. No audio files needed. */
let ctx: AudioContext | null = null;
let muted = false;
let master = 0.8;

function audio(): AudioContext | null {
  if (muted || master === 0) return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function setMuted(value: boolean) {
  muted = value;
}

/** 0 to 1. 0 mutes everything. */
export function setMasterVolume(value: number) {
  master = Math.min(1, Math.max(0, value));
}

export function beep(freq = 660, duration = 0.09, type: OscillatorType = "sine", volume = 0.05) {
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume * master, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

/** Low engine rumble for ignition. */
export function rumble(duration = 1.6) {
  const c = audio();
  if (!c) return;
  const length = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(180, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(900, c.currentTime + duration);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.35 * master), c.currentTime + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
}
