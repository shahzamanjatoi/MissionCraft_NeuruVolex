import type { MissionDesign } from "../types/mission";

export type Target = MissionDesign["target"];

export interface TargetOption {
  id: Target;
  name: string;
  description: string;
}

export const TARGETS: TargetOption[] = [
  { id: "LEO", name: "Low Earth Orbit", description: "Easiest target: you start here." },
  { id: "GEO", name: "Geostationary Orbit", description: "High orbit used by weather and TV satellites." },
  { id: "Moon", name: "The Moon", description: "Lunar orbiter. Our main game mission." },
  { id: "Mars", name: "Mars", description: "Hardest: far away, needs lots of delta-v and a big antenna." },
];
