export interface EngineOption {
  id: string;
  name: string;
  isp_s: number;
  description: string;
}

export const ENGINES: EngineOption[] = [
  { id: "mono", name: "Monopropellant", isp_s: 220, description: "Simple and reliable, but uses a lot of fuel." },
  { id: "bi", name: "Bipropellant", isp_s: 320, description: "Good all-round efficiency." },
  { id: "cryo", name: "Cryogenic (LOX/LH2)", isp_s: 450, description: "Most efficient, best for far targets." },
];
