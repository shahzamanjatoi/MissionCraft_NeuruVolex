import type { MissionDesign } from "../types/mission";

export type LaunchVehicle = MissionDesign["launchVehicle"];

/** Game-balance rockets. Capacity = kg to a 400 km LEO. Cost in million USD. */
export const LAUNCH_VEHICLES: LaunchVehicle[] = [
  { name: "Light Launcher", payloadToLEO_kg: 2_000, cost_musd: 15 },
  { name: "Medium Launcher", payloadToLEO_kg: 8_000, cost_musd: 40 },
  { name: "Heavy Launcher", payloadToLEO_kg: 22_800, cost_musd: 60 },
];
