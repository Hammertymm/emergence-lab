# Emergence Lab v1.7 — Performance Biosphere

A browser-based artificial ecology sandbox focused on observable living systems rather than raw pixel chaos.

## Why v1.7 exists

v1.6 pushed the grid density and lineage rendering too far. On normal laptops it could appear frozen because the browser was spending too much time simulating and drawing thousands of organisms.

v1.7 keeps the lineage/breed idea but rebuilds the defaults around performance and readability.

## Main changes

- Reduced simulation grid to a safer resolution.
- Slower default pace.
- Lower population caps.
- Larger organism markers on a finer-looking grid.
- Safer predator/herbivore/scavenger caps.
- Lower event burst sizes.
- Render frame throttle.
- Same ecosystem layers: plants, herbivores, predators, scavengers, fungi, carrion, soil, moisture and seasons.
- Same lineage colours, but with a clearer visual hierarchy.

## Controls

- Space: pause/resume
- S: step once
- P: hide/show side panel
- H: compact HUD
- F: focus mode
- N: new world

## Run

```powershell
npx serve .
```

Then open the local URL printed by the terminal.

## Design direction

The priority is now: stable simulation first, readable graphics second, deeper realism third. Future versions should add realism without sacrificing observability.
