import type { MissionDesign } from "../types/mission";

export type Instrument = MissionDesign["spacecraft"]["instruments"][number];

export interface InstrumentOption extends Instrument {
  id: string;
  description: string;
}

/** Science instruments the player can add. Mass in kg, power in W. */
export const INSTRUMENTS: InstrumentOption[] = [
  { id: "camera", name: "Narrow-Angle Camera", mass_kg: 50, power_W: 40,
    description: "High-resolution imaging of the surface (LROC-style)." },
  { id: "altimeter", name: "Laser Altimeter", mass_kg: 35, power_W: 45,
    description: "Measures surface height to build terrain maps (LOLA-style)." },
  { id: "radiometer", name: "Thermal Radiometer", mass_kg: 20, power_W: 20,
    description: "Maps surface temperature (Diviner-style)." },
  { id: "spectrometer", name: "Mineral Spectrometer", mass_kg: 30, power_W: 30,
    description: "Identifies what the surface is made of." },
  { id: "magnetometer", name: "Magnetometer", mass_kg: 5, power_W: 5,
    description: "Light and cheap: measures magnetic fields." },
];
