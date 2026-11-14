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

export const MU_MOON = 4.9028e12; // m^3/s^2
export const R_MOON = 1_737_400; // m
export const MOON_DISTANCE = 384_400_000; // m, mean Earth-Moon distance
export const MU_MARS = 4.282837e13; // m^3/s^2
export const R_MARS = 3_389_500; // m
export const MU_SUN = 1.32712440018e20; // m^3/s^2
export const AU = 1.495978707e11; // m
export const MARS_ORBIT_RADIUS = 2.279392e11; // m

/** Burn that sends a craft from circular orbit r (around a body) onto a hyperbola with excess speed vInf. */
export function departureDeltaV(r: number, vInf: number, mu = MU_EARTH): number {
  return Math.sqrt(vInf * vInf + (2 * mu) / r) - Math.sqrt(mu / r);
}

/**
 * Patched-conic Earth to Moon: Hohmann-style trans-lunar injection from 400 km LEO,
 * then capture into a 100 km circular lunar orbit. About 3082 + 821 = 3903 m/s.
 */
export function moonDeltaV() {
  const r1 = R_EARTH + LEO_ALTITUDE;
  const a = (r1 + MOON_DISTANCE) / 2;
  const tli = Math.sqrt(MU_EARTH * (2 / r1 - 1 / a)) - Math.sqrt(MU_EARTH / r1);
  const vApogee = Math.sqrt(MU_EARTH * (2 / MOON_DISTANCE - 1 / a));
  const vInf = Math.sqrt(MU_EARTH / MOON_DISTANCE) - vApogee; // relative to the Moon
  const rLunar = R_MOON + 100_000;
  const loi = Math.sqrt(vInf * vInf + (2 * MU_MOON) / rLunar) - Math.sqrt(MU_MOON / rLunar);
  return { tli, loi, total: tli + loi };
}

/**
 * Patched-conic Earth to Mars: Hohmann transfer around the Sun, escape from 400 km LEO,
 * then capture into a 300 km x 1-sol elliptical Mars orbit. About 3569 + 903 = 4472 m/s.
 */
export function marsDeltaV() {
  const a = (AU + MARS_ORBIT_RADIUS) / 2;
  const vInfDepart = Math.sqrt(MU_SUN * (2 / AU - 1 / a)) - Math.sqrt(MU_SUN / AU);
  const vInfArrive = Math.sqrt(MU_SUN / MARS_ORBIT_RADIUS) - Math.sqrt(MU_SUN * (2 / MARS_ORBIT_RADIUS - 1 / a));
  const tmi = departureDeltaV(R_EARTH + LEO_ALTITUDE, vInfDepart);
  const rp = R_MARS + 300_000;
  const ra = R_MARS + 33_793_000;
  const moi =
    Math.sqrt(vInfArrive * vInfArrive + (2 * MU_MARS) / rp) -
    Math.sqrt(MU_MARS * (2 / rp - 2 / (rp + ra)));
  return { tmi, moi, total: tmi + moi };
}

/** Delta-v needed after reaching a 400 km LEO (patched-conic estimates). */
export function requiredDeltaV(target: MissionDesign["target"]): number {
  switch (target) {
    case "LEO":
      return 0;
    case "GEO":
      return hohmannDeltaV(R_EARTH + LEO_ALTITUDE, GEO_RADIUS).total;
    case "Moon":
      return moonDeltaV().total;
    case "Mars":
      return marsDeltaV().total;
  }
}
