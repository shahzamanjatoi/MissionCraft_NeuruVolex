import type { MissionDesign } from "../types/mission";

/** Ready-made designs: a starting point for each target. */
export const STARTER_DESIGNS: Record<MissionDesign["target"], MissionDesign> = {
  LEO: {
    launchVehicle: { name: "Light Launcher", payloadToLEO_kg: 2_000, cost_musd: 15 },
    target: "LEO",
    spacecraft: { dryMass_kg: 300, propellantMass_kg: 50, isp_s: 220, solarArea_m2: 2,
      batteryWh: 150, antennaGain_dBi: 10,
      instruments: [{ name: "Narrow-Angle Camera", mass_kg: 50, power_W: 40 }] },
  },
  GEO: {
    launchVehicle: { name: "Medium Launcher", payloadToLEO_kg: 8_000, cost_musd: 40 },
    target: "GEO",
    spacecraft: { dryMass_kg: 800, propellantMass_kg: 2_200, isp_s: 320, solarArea_m2: 6,
      batteryWh: 600, antennaGain_dBi: 25,
      instruments: [{ name: "Thermal Radiometer", mass_kg: 20, power_W: 20 }] },
  },
  Moon: {
    launchVehicle: { name: "Heavy Launcher", payloadToLEO_kg: 22_800, cost_musd: 60 },
    target: "Moon",
    spacecraft: { dryMass_kg: 500, propellantMass_kg: 1_500, isp_s: 320, solarArea_m2: 6,
      batteryWh: 400, antennaGain_dBi: 10,
      instruments: [{ name: "Narrow-Angle Camera", mass_kg: 50, power_W: 40 }] },
  },
  Mars: {
    launchVehicle: { name: "Heavy Launcher", payloadToLEO_kg: 22_800, cost_musd: 60 },
    target: "Mars",
    spacecraft: { dryMass_kg: 800, propellantMass_kg: 4_000, isp_s: 450, solarArea_m2: 14,
      batteryWh: 600, antennaGain_dBi: 38,
      instruments: [{ name: "Mineral Spectrometer", mass_kg: 30, power_W: 30 }] },
  },
};
