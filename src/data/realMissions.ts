import type { Target } from "./targets";

export interface RealMission {
  id: string;
  name: string;
  target: Target;
  /** Approximate launch mass in kg. */
  launchMassKg: number;
  summary: string;
}

/**
 * Real missions used for the "which real mission does your design resemble?" step.
 * Masses are rounded public figures: double-check them on nasa.gov before the demo.
 */
export const REAL_MISSIONS: RealMission[] = [
  { id: "cubesat-12u", name: "A 12U CubeSat", target: "LEO", launchMassKg: 24,
    summary: "A tiny, low-cost satellite built from standard 10 cm cubes, often made by students." },
  { id: "landsat-8", name: "Landsat 8", target: "LEO", launchMassKg: 2623,
    summary: "Photographs Earth's land to track forests, farms and cities. Launched in 2013." },
  { id: "hubble", name: "Hubble Space Telescope", target: "LEO", launchMassKg: 11110,
    summary: "A large space telescope that has looked at the universe since 1990." },

  { id: "goes-8", name: "GOES-8", target: "GEO", launchMassKg: 2100,
    summary: "An early weather satellite that watches the same part of Earth from high above." },
  { id: "goes-r", name: "GOES-R series", target: "GEO", launchMassKg: 5200,
    summary: "Modern weather satellites that track storms over the Americas." },

  { id: "lunar-prospector", name: "Lunar Prospector", target: "Moon", launchMassKg: 300,
    summary: "A small 1998 orbiter that mapped what the Moon is made of." },
  { id: "lro", name: "Lunar Reconnaissance Orbiter (LRO)", target: "Moon", launchMassKg: 1900,
    summary: "NASA's Moon mapper since 2009, with a camera, laser altimeter and thermal radiometer." },

  { id: "mars-odyssey", name: "Mars Odyssey", target: "Mars", launchMassKg: 730,
    summary: "A Mars orbiter that has studied the planet's minerals since 2001." },
  { id: "mro", name: "Mars Reconnaissance Orbiter (MRO)", target: "Mars", launchMassKg: 2200,
    summary: "A Mars orbiter with a powerful camera that has photographed the surface since 2006." },
];
