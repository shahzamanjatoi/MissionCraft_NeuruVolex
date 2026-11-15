# MissionCraft 🚀

### Design. Simulate. Learn.

**MissionCraft** is an interactive space mission design and simulation game developed by **Team Neuru Volex** for the **NASA Space Apps Challenge 2026**.

What would it take to design a spacecraft capable of reaching another destination in space? MissionCraft lets users explore that question by selecting a mission target, choosing a launch vehicle, configuring spacecraft subsystems, and evaluating whether their design can complete its mission.

Instead of simply learning about space missions theoretically, users can experiment with engineering decisions and see how those decisions affect mission performance.

---

## 🌍 Project Overview

MissionCraft turns space mission planning into an interactive learning experience.

Users progress through four main stages:

1. **Choose a target:** Select a destination for the mission.
2. **Select a rocket:** Choose a launch vehicle suitable for the mission.
3. **Design a spacecraft:** Configure its propulsion, power, communication, and science systems.
4. **Evaluate the mission:** Run the engineering evaluation and explore the mission results.

Successful missions unlock more challenging destinations, encouraging users to improve their spacecraft designs and understand the trade-offs involved in space exploration.

## ✨ Key Features

### 1. Mission Destination Selection

Choose from four mission destinations:

- Low Earth Orbit (LEO)
- Geostationary Orbit (GEO)
- Lunar Orbit
- Mars

Destinations are progressively unlocked as users complete missions.

### 2. Rocket Selection

Explore launch vehicle options and understand how rocket capabilities, payload capacity, and launch costs influence mission planning.

### 3. Spacecraft Configuration

Build a spacecraft by configuring important parameters and subsystems, including:

- Propulsion and engine selection
- Antenna and communication systems
- Scientific instruments
- Spacecraft body mass
- Propellant capacity
- Solar panel area
- Battery capacity

A live evaluation panel helps users understand how their design performs against engineering requirements.

### 4. Engineering Evaluation

MissionCraft evaluates spacecraft designs across several engineering dimensions:

| Parameter | Purpose |
|---|---|
| Delta-v | Evaluates whether the spacecraft has sufficient propulsion capability |
| Mass | Checks spacecraft mass against launch vehicle capacity |
| Power | Evaluates solar power generation against system requirements |
| Battery | Checks whether stored energy can support the spacecraft during periods without sunlight |
| Communications | Evaluates communication capability with Earth |
| Cost | Estimates the mission's launch and spacecraft costs |

The evaluation engine produces a mission score out of 100 based on the design's performance.

### 5. Mission Simulation and Replay

The mission simulation demonstrates how a spacecraft progresses through its mission and how operational events affect its performance.

Simulation features include mission phases, telemetry, event history, and mission outcomes.

The replay experience helps users follow mission progress rather than seeing only a final score.

### 6. Interactive Mission Control

Mission Control introduces operational decision-making into the simulation.

During an eclipse, users can choose between:

- **Maintain Full Load:** Keep spacecraft systems operating at full power.
- **Conserve Power:** Reduce power consumption to preserve battery energy.

The simulation evaluates how these decisions affect battery usage and mission performance.

### 7. NASA Science and Learning Resources

MissionCraft incorporates NASA-related educational resources and mission references to connect the game with real-world space exploration.

The project includes a NASA resources section featuring reference materials and educational content, including a featured NASA Moon exploration video.

---

## 🛰️ NASA Data and References

MissionCraft draws inspiration from real space mission design concepts, NASA educational resources, and planetary science references.

Resources used in the project include:

- **NASA Design and Develop Science Missions:** Inspiration for the mission planning process.
- **Concept Maturity Levels (CML):** Reference for structuring mission development stages.
- **Mission Design Lab (MDL):** Inspiration for engineering evaluation criteria.
- **GMAT:** Reference for orbital mechanics and mission analysis.
- **NASA Mission Visualization resources:** Inspiration for visualizing space missions.
- **CubeSat educational resources:** Reference for spacecraft design constraints.
- **NASA Lunar Reconnaissance Orbiter (LRO):** Lunar science and exploration reference.
- **Lunar Orbiter Laser Altimeter (LOLA):** Lunar surface and elevation data reference.
- **DIVINER:** Lunar thermal mapping and science reference.

These resources help connect the educational experience to established space science and engineering concepts.

## 🧰 Technology Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Application logic and type safety |
| Vite | Development and build tooling |
| Vitest | Automated testing |
| CSS | Interface styling |
| NASA resources and datasets | Scientific and educational references |

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/shahzamanjatoi/MissionCraft_NeuruVolex.git
```

Navigate to the project directory:

```bash
cd MissionCraft_NeuruVolex
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm test` | Runs automated tests |
| `npm run lint` | Checks code quality |
| `npm run build` | Builds the production application |

## 📁 Project Structure

```text
MissionCraft/
├── public/          # Static assets
├── src/
│   ├── components/  # Application screens and UI components
│   ├── data/        # Mission targets, rockets, instruments and resources
│   ├── engine/      # Engineering calculations and evaluation
│   ├── simulation/ # Mission simulation, events and telemetry
│   ├── store/       # Application state management
│   └── types/       # Shared TypeScript definitions
├── package.json
├── vite.config.ts
└── README.md
```

## 🎯 Educational Objectives

MissionCraft aims to make space mission engineering more accessible and engaging.

Through interactive experimentation, users can:

- Understand the relationship between spacecraft mass, propulsion, and delta-v.
- Explore the importance of power generation and battery management.
- Learn why communication systems matter during space missions.
- Understand engineering trade-offs and mission constraints.
- Experience how operational decisions can influence mission outcomes.
- Explore real NASA missions and scientific resources.

## ⚠️ Project Status and Limitations

MissionCraft is an educational prototype, not a flight-qualified spacecraft engineering tool.

Engineering calculations and simulation results are intended for learning and experimentation. They should not be treated as validated flight-planning results.

Some advanced capabilities, including the completeness of orbital visualization and validation against professional mission analysis tools, depend on the final implementation.

## 👥 Team

**Team Neuru Volex**

Developed for the NASA Space Apps Challenge 2026.

- Shahzaman
- Zara
- Yousuf
- Alisha

## 🙌 Acknowledgements

We acknowledge NASA and the educational and scientific resources that helped inspire MissionCraft.

The project is built to encourage curiosity, experimentation, and learning about the engineering challenges behind space exploration.

---

**MissionCraft — Design a mission. Make decisions. Explore space.** 🚀
