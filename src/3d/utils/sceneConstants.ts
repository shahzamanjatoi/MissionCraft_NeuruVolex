import type { SceneTarget } from '../types/scene';

// ─── Planetary Visual Scale (scene units, not real km) ───────────────────────
// Earth radius = 2.0 scene units.  All other bodies scale from that.

export const SCENE = {
  EARTH_RADIUS: 2.0,
  MOON_RADIUS: 0.545,   // actual ratio ~0.273 × Earth
  MARS_RADIUS: 1.064,   // actual ratio ~0.532 × Earth
} as const;

// ─── Spacecraft Orbit Radii (scene units) ────────────────────────────────────
// Visually compressed from reality so both planet and orbit are on-screen.

export const ORBIT_RADII: Record<SceneTarget, number> = {
  LEO: 2.65,   // 400 km altitude above Earth (barely above surface)
  GEO: 5.2,    // 35,786 km; compressed from actual ~6.6 × Earth-radius
  Moon: 1.4,   // spacecraft around the Moon
  Mars: 2.3,   // spacecraft around Mars
};

// ─── Camera Positions ─────────────────────────────────────────────────────────

export const CAMERA_PRESETS: Record<SceneTarget, [number, number, number]> = {
  LEO:  [0, 4,  10],
  GEO:  [0, 7,  18],
  Moon: [0, 6,  20],
  Mars: [0, 10, 32],
};

export const EARTH_POSITIONS: Record<SceneTarget, [number, number, number]> = {
  LEO: [0, 0, 0],
  GEO: [0, 0, 0],
  Moon: [-5.5, 0, 0],
  Mars: [-9, 0, 0],
};

// ─── Sun (Directional Light) Position ────────────────────────────────────────

export const SUN_POSITION: [number, number, number] = [80, 20, 40];

// ─── Material Defaults Per Planet ────────────────────────────────────────────

export const PLANET_MATERIAL = {
  Earth: { roughness: 0.80, metalness: 0.00 },
  Moon:  { roughness: 0.95, metalness: 0.00 },
  Mars:  { roughness: 0.90, metalness: 0.00 },
} as const;

// ─── Atmosphere ───────────────────────────────────────────────────────────────

export const ATMOSPHERE = {
  INNER_SCALE:   1.016,   // inner backside sphere scale factor
  OUTER_SCALE:   1.030,   // outer frontside sphere scale factor
  INNER_OPACITY: 0.35,
  OUTER_OPACITY: 0.12,
  COLOR_HEX:     0x4fc3f7, // light blue
} as const;

// ─── Trajectory Line ──────────────────────────────────────────────────────────

export const TRAJECTORY = {
  SEGMENTS:   128,
  COLOR:      '#67e8f9',
  LINE_WIDTH: 2.4,
  OPACITY:    0.98,
} as const;

// ─── Spacecraft ───────────────────────────────────────────────────────────────

export const SPACECRAFT_SCALE = 0.072;
export const SPACECRAFT_ORBIT_SPEED = 0.22; // radians / second (visual)

// ─── Texture Paths ────────────────────────────────────────────────────────────
// Loaded from public/textures/.  Falls back to procedural if file is missing.

export const TEXTURE_PATHS = {
  EARTH_DAY:    '/textures/earth_daymap.jpg',
  EARTH_NIGHT:  '/textures/earth_nightmap.png',
  EARTH_NORMAL: '/textures/earth_normal.jpg',
  MOON:         '/textures/moon.jpg',
} as const;
