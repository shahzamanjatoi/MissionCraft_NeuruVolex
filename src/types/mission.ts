export interface MissionDesign {
  launchVehicle: { name: string; payloadToLEO_kg: number; cost_musd: number };
  target: "LEO" | "GEO" | "Moon" | "Mars";
  spacecraft: {
    dryMass_kg: number;
    propellantMass_kg: number;
    isp_s: number;
    solarArea_m2: number;
    batteryWh: number;
    antennaGain_dBi: number;
    instruments: { name: string; mass_kg: number; power_W: number }[];
  };
}

export interface MissionResult {
  feasible: boolean;
  deltaVAvailable_ms: number;
  deltaVRequired_ms: number;
  powerMargin: number;
  massMargin: number;
  commsOk: boolean;
  cost_musd: number;
  score: number;
  warnings: string[];
}