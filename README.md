# MissionCraft

**Design a space mission, then see if it works.**
Built by **Team Neuru Volex** for the **NASA Space Apps Challenge 2026**.

MissionCraft is a browser game. You pick a destination, choose a rocket, build a spacecraft, and launch. A physics and engineering engine checks your design and gives you a score, then tells you which real NASA mission your design resembles.

## How to play

1. **Choose a target.** Low Earth Orbit, Geostationary Orbit, the Moon or Mars. Only Low Earth Orbit is open at the start.
2. **Pick a rocket.** Bigger rockets carry more but cost more.
3. **Design your spacecraft.** Choose the engine, antenna and science instruments, and set the body mass, propellant, solar panel area and battery size. A live check panel shows what passes or fails as you build.
4. **Launch.** See your score, what went wrong (if anything), and the real mission your design is most like.

Finishing a mission successfully unlocks the next level (LEO → GEO → Moon → Mars). A "demo mode" link on the first screen unlocks every level at once.

## What the engine checks

Every time the design changes, `evaluateMission` runs these checks:

| Check | What it asks |
| --- | --- |
| Delta-v | Can the engine and propellant push the craft to the target? (rocket equation) |
| Mass | Is the spacecraft light enough for the chosen rocket? |
| Power | Do the solar panels make enough power for the instruments? |
| Battery | Can the battery cover the time in Earth's shadow? |
| Communications | Is the radio link to Earth strong enough? |
| Cost | Rocket and spacecraft cost in million USD |

**Score (0 to 100):** delta-v 25 points, mass 20, power and battery 20, communications 20, cost 15. A passed check earns half its points, and extra safety margin earns the rest. A design that fails any check is capped at 49.

## Run it on your computer

You need [Node.js](https://nodejs.org) (version 20 or newer).

```bash
git clone https://github.com/shahzamanjatoi/MissionCraft_NeuruVolex.git
cd MissionCraft_NeuruVolex
npm install
npm run dev
```

Open the address it prints (usually http://localhost:5173).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the game locally |
| `npm test` | Run all tests |
| `npm run lint` | Check code style |
| `npm run build` | Make the production version |

## Project layout

```
src/
  engine/      Physics and scoring (mass, propulsion, orbit, power, comms, cost, score)
  data/        Game content: launchers, instruments, engines, antennas, targets,
               starter designs, levels, real NASA missions
  store/       Game state (the reducer holds the design and the current step)
  components/  Screens: target, rocket, spacecraft builder, live score panel, results
  types/       Shared TypeScript types
```

## NASA and partner resources we build on

| Resource | What we take from it | Owner |
| --- | --- | --- |
| Design and Develop Science Missions | Four-part game structure (launch, space, ground, user) | Yousuf |
| Concept Maturity Levels (CML) | Game stages, from rough idea to point design | Zara |
| Mission Design Lab (MDL) | Scoring areas such as power, propulsion, communications and cost | Shahzaman |
| GMAT | Reference for checking orbit and manoeuvre maths | Shahzaman |
| Mission Viz | Look and camera of the 3D view | Alisha |
| Telescope game | UI flow, locked options and real-mission match | Yousuf, Zara |
| CubeSat 101 | Starter mission and real size and power limits | Zara |
| 2023 VR challenge | Judging checklist | Whole team |
| CSA games | Tutorials and hints | Yousuf |

## Status and honest limits

**Working now:** the physics and scoring engine, game content, level unlocking, the full play flow, the real-mission match, and automated tests.

**Not finished yet:**

- **3D view** of the orbit (in progress).
- **GMAT check.** The Moon and Mars delta-v numbers are rounded textbook values and have not yet been verified against GMAT.
- **Thermal and risk checks.** The engine does not model heat or risk yet.
- **Real-mission masses** are rounded public figures and should be double-checked.

## Team

Shahzaman, Yousuf, Zara and Alisha: **Team Neuru Volex**.

Built with React, TypeScript and Vite.
