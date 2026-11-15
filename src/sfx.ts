/** Tiny Web Audio sound effects. No audio files needed. */
let ctx: AudioContext | null = null;
let masterNode: GainNode | null = null;
let muted = false;
let master = 0.8;

const BOOST = 6; // callers pass small gains (0.04 to 0.05); this makes them audible

function audio(): AudioContext | null {
  if (muted || master === 0) return null;
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new Ctor();
      masterNode = ctx.createGain();
      masterNode.gain.value = master;
      masterNode.connect(ctx.destination);
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
  if (ctx && masterNode) masterNode.gain.setTargetAtTime(master, ctx.currentTime, 0.05);
}

export function beep(freq = 660, duration = 0.09, type: OscillatorType = "sine", volume = 0.05) {
  const c = audio();
  if (!c || !masterNode) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(Math.min(1, volume * BOOST), c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain).connect(masterNode);
  osc.start();
  osc.stop(c.currentTime + duration);
}

/** Rising arpeggio, used when the debrief opens. */
export function chime() {
  [523, 659, 784, 1047].forEach((f, i) => window.setTimeout(() => beep(f, 0.3, "triangle", 0.05), i * 120));
}

/** Low engine rumble for ignition. */
export function rumble(duration = 1.6) {
  const c = audio();
  if (!c || !masterNode) return;
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
  gain.gain.exponentialRampToValueAtTime(0.9, c.currentTime + 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  src.connect(filter).connect(gain).connect(masterNode);
  src.start();
}


let track: { stop: () => void } | null = null;
let trackBuf: AudioBuffer | null = null;
let trackToken = 0;

/** Looping space music for the flight phase. Fades in, follows the Sound slider. */
export async function startSpaceTrack() {
  const c = audio();
  if (!c || !masterNode || track) return;
  const token = ++trackToken;
  try {
    if (!trackBuf) {
      const res = await fetch(import.meta.env.BASE_URL + "sounds/Deep_space_loop.mp3");
      trackBuf = await c.decodeAudioData(await res.arrayBuffer());
    }
  } catch {
    return;
  }
  if (token !== trackToken || track || !masterNode) return;

  const src = c.createBufferSource();
  src.buffer = trackBuf;
  src.loop = true;
  const gain = c.createGain();
  gain.gain.value = 0.0001;
  gain.gain.setTargetAtTime(0.9, c.currentTime, 1.0);
  src.connect(gain).connect(masterNode);
  src.start();
  track = {
    stop() {
      gain.gain.setTargetAtTime(0.0001, c.currentTime, 0.4);
      window.setTimeout(() => {
        try { src.stop(); } catch { /* already stopped */ }
        gain.disconnect();
      }, 1800);
    },
  };
}

export function stopSpaceTrack() {
  trackToken++;
  track?.stop();
  track = null;
}

