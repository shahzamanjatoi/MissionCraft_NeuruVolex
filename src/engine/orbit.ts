import type { MissionDesign } from "../types/mission";

export const MU_EARTH = 3.986004418e14; // m^3/s^2
export const R_EARTH = 6_378_137; // m
export const LEO_ALTITUDE = 400_000; // m
export const GEO_RADIUS = 42_164_000; // m

export function circularSpeed(radius_m: number, mu = MU_EARTH): number {
  return Math.sqrt(mu / radius_m);
}

/** Two-burn Hohmann transfer between circular orbits. */
export function hohmannDeltaV(r1: number, r2: number, mu = MU_EARTH) {
  const a = (r1 + r2) / 2;
  const burn1 = Math.sqrt(mu * (2 / r1 - 1 / a)) - Math.sqrt(mu / r1);
  const burn2 = Math.sqrt(mu / r2) - Math.sqrt(mu * (2 / r2 - 1 / a));
  return { burn1, burn2, total: Math.abs(burn1) + Math.abs(burn2) };
}

/**
 * Delta-v needed after reaching a 400 km LEO.
 * Moon and Mars values are rough textbook figures: verify against GMAT.
 */
export function requiredDeltaV(target: MissionDesign["target"]): number {
  switch (target) {
    case "LEO":
      return 0;
    case "GEO":
      return hohmannDeltaV(R_EARTH + LEO_ALTITUDE, GEO_RADIUS).total;
    case "Moon":
      return 3100 + 900; // trans-lunar injection + lunar orbit insertion
    case "Mars":
      return 3600 + 1000; // trans-Mars injection + capture into elliptical orbit
  }
}