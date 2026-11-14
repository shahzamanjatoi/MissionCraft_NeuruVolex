export interface AntennaOption {
  id: string;
  name: string;
  gain_dBi: number;
  description: string;
}

export const ANTENNAS: AntennaOption[] = [
  { id: "low", name: "Low-gain antenna", gain_dBi: 10, description: "Fine near Earth and the Moon." },
  { id: "mid", name: "Medium-gain antenna", gain_dBi: 25, description: "Good for GEO and the Moon with margin." },
  { id: "high", name: "High-gain dish", gain_dBi: 38, description: "Needed to reach Mars." },
];
