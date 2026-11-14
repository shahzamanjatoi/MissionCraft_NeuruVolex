import type { MissionDesign } from "../types/mission";

// Simplified X-band downlink budget for gameplay, not a real link analysis.
const DISTANCE_KM: Record<MissionDesign["target"], number> = {
  LEO: 2_000,
  GEO: 36_000,
  Moon: 384_400,
  Mars: 225_000_000,
};
const FREQ_MHZ = 8_400;
const TX_POWER_DBW = 10; // 10 W transmitter
const GROUND_GAIN_DBI = 50;
const REQUIRED_RX_DBW = -190;
const MIN_MARGIN_DB = 3;

export function pathLossDb(distance_km: number, freq_MHz = FREQ_MHZ): number {
  return 20 * Math.log10(distance_km) + 20 * Math.log10(freq_MHz) + 32.44;
}

export function linkBudget(d: MissionDesign) {
  const loss = pathLossDb(DISTANCE_KM[d.target]);
  const rx_dBW = TX_POWER_DBW + d.spacecraft.antennaGain_dBi + GROUND_GAIN_DBI - loss;
  const margin_dB = rx_dBW - REQUIRED_RX_DBW;
  return { rx_dBW, margin_dB, ok: margin_dB >= MIN_MARGIN_DB };
}