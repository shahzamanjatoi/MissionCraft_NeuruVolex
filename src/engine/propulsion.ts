const G0 = 9.80665;

export function deltaV(isp_s: number, startMass_kg: number, endMass_kg: number): number {
  return isp_s * G0 * Math.log(startMass_kg / endMass_kg);
}