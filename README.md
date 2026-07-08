# Emergence Lab

A modular browser-based artificial world observatory.

Current experiments:

1. **Cellular Life** — Conway-style cellular automata with rules and pattern stamping.
2. **Falling Matter** — simple sand, water, stone, and plant physics.
3. **Slime Trails** — agent swarms leaving self-organising trails.
4. **Ecosystem** — plants, herbivores, predators, energy, reproduction, death, mutation, and climate events.

## Run locally

```powershell
npx serve .
```

Open the URL it prints, usually:

```text
http://localhost:3000
```

Alternative if Python is available:

```powershell
py -m http.server 8000
```

## v0.4 additions

- Experiment presets
- PNG screenshot export
- Keyboard shortcuts
- Live metrics panel
- Population/history sparkline
- Brush cursor overlay
- Extra ecosystem events
- Cleaner two-column controls

## Controls

- **Space** — play/pause
- **R** — seed/randomise
- **C** — clear
- **S** — save current experiment locally
- **L** — load saved experiment
- **E** — export current world data
- **1-4** — switch experiments
- **Click/drag** — draw, pour, inject agents, or seed ecosystem biomass

## Suggested Git workflow

```powershell
git add .
git commit -m "Add observatory upgrades"
git push
```

## Direction

Emergence Lab is intended to grow into a browser-native artificial-life platform: simulations first, then persistent worlds, evolutionary trees, AI naturalist reports, and shareable world seeds.
