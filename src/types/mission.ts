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

export type RiskLevel = "low" | "moderate" | "high";

export interface MissionResult {
  feasible: boolean;
  deltaVAvailable_ms: number;
  deltaVRequired_ms: number;
  powerMargin: number;
  massMargin: number;
  commsOk: boolean;
  /** Spare cooling as a fraction: 0.2 means radiators shed 20% more heat than the craft makes. */
  thermalMargin: number;
  thermalOk: boolean;
  /** Overall mission risk, 0 (safe) to 1 (very risky). */
  riskScore: number;
  riskLevel: RiskLevel;
  /** The biggest causes of risk, in plain words. */
  riskDrivers: string[];
  cost_musd: number;
  score: number;
  warnings: string[];
}