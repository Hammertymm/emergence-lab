# Emergence Lab v1.6 — Lineage Optics

A browser-based artificial ecology focused on readable emergence: smaller sharper cells, colour-graduated animal breeds, fungi, scavengers, carrion, soil fertility, seasons, disease, wildfire and living field notes.

## Run

```powershell
npx serve .
```

Open the local URL shown by `serve`.

## What changed in v1.6

- Sharper main-world rendering with a larger simulation grid.
- Smaller visible pixels for finer ecological detail.
- Herbivores now have colour-graduated breeds.
- Predators now have colour-graduated breeds.
- Scavengers now have colour-graduated breeds.
- Breed names appear in the Living Registry.
- Added a Breed Map layer.
- Increased population capacity to suit the finer world grid.
- Reduced predator pressure slightly so lineages have time to emerge.

## Core loop

Sun and climate feed plants. Herbivores graze plants. Predators hunt herbivores. Scavengers and fungi recycle carrion into soil nutrients. Soil fertility feeds the next plant wave.

## Shortcuts

- Space: pause
- S: step
- P: hide/show panel
- H: compact HUD
- F: focus mode
- N: new world

## Design direction

The project is moving away from noisy arcade pixels and toward an observable living diorama: smaller cells, sharper rendering, visible breed divergence, and slow ecological feedback loops.
