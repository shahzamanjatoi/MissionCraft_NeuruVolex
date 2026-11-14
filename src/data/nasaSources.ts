
export interface NasaSource {
  id: string;
  title: string;
  organization: string;
  description: string;
  url: string;
  category: "mission" | "instrument" | "design-guidance";
}

export const NASA_SOURCES: NasaSource[] = [
  {
    id: "lro-mission",
    title: "Lunar Reconnaissance Orbiter",
    organization: "NASA",
    description:
      "Real lunar orbiter mission used as a reference for MissionCraft's Moon mission.",
    url: "https://science.nasa.gov/mission/lro/",
    category: "mission",
  },
  {
    id: "lro-instruments",
    title: "LRO Spacecraft and Instruments",
    organization: "NASA",
    description:
      "Official descriptions of LROC, LOLA, Diviner and other LRO science instruments.",
    url: "https://science.nasa.gov/mission/lro/spacecraft-and-instruments/",
    category: "instrument",
  },
  {
    id: "lola",
    title: "Lunar Orbiter Laser Altimeter (LOLA)",
    organization: "NASA",
    description:
      "Laser altimetry used to map lunar topography, slopes and surface roughness.",
    url: "https://science.nasa.gov/mission/lro/lola/",
    category: "instrument",
  },
  {
    id: "diviner",
    title: "Diviner Lunar Radiometer Experiment",
    organization: "NASA JPL",
    description:
      "Lunar surface temperature measurements and thermal mapping.",
    url: "https://www.jpl.nasa.gov/missions/diviner-lunar-radiometer-experiment-dlre/",
    category: "instrument",
  },
  {
    id: "cubesat-101",
    title: "CubeSat Launch Initiative Resources",
    organization: "NASA",
    description:
      "Educational and technical resources for CubeSat mission development.",
    url: "https://www.nasa.gov/kennedy/launch-services-program/cubesat-launch-initiative/cubesat-launch-initiative-resources/",
    category: "design-guidance",
  },
  {
    id: "concept-maturity",
    title: "Concept Maturity Level Framework",
    organization: "NASA Ames",
    description:
      "Framework for assessing the maturity and feasibility of mission concepts.",
    url: "https://www.nasa.gov/ames-engineering/spaceflight-division/mission-design-center/about-our-studies/",
    category: "design-guidance",
  },
];
