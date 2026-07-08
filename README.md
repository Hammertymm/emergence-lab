# Emergence Lab

A browser-based artificial world laboratory.

Version `0.2` turns the original Game of Life demo into a modular simulation platform with multiple experiments.

## Experiments

1. **Cellular Life** — Conway-style cellular automata with selectable rules and pattern stamping.
2. **Falling Matter** — simple sand/water/plant/stone physics.
3. **Slime Trails** — agent trails that self-organise into vein-like networks.

## Run locally

From the project folder:

```powershell
npx serve .
```

Open the local URL it prints, usually:

```text
http://localhost:3000
```

Alternative if Python works on your machine:

```powershell
py -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Controls

- **Experiment** — switch between simulation types.
- **Pause / Step** — stop time or advance one tick.
- **Seed World** — generate a starting condition.
- **Clear** — wipe the world.
- **Cellular Life** — choose rules and stamp famous patterns.
- **Falling Matter** — paint sand, water, plants, stone, or erase.
- **Slime Trails** — inject agents and tune trail decay.
- **Save / Load** — stores each experiment in browser local storage.
- **Export** — exports Life as RLE and other worlds as JSON.

## Direction

Emergence Lab is evolving toward a browser-native artificial life observatory: terrain, ecosystems, genetics, mutation, species history, and AI-generated naturalist reports.
