# Emergence Lab v1.1 — Energy Ecology

A browser-based artificial ecology and observatory. This release rebalances the predator/prey crash problem by replacing simple population spawning with a basic energy economy.

## What changed from v1.0

- Predators reproduce much more slowly.
- Predators no longer hunt with guaranteed success.
- Herbivores can gain protection from plant cover.
- Predators enter satiety/rest after successful hunts.
- Dead organisms become nutrients.
- Nutrients feed plant growth.
- Plants, herbivores and predators now form a crude energy chain.
- New field notes explain ecosystem state.
- Better population metrics and charting.
- Screen-first layout retained.

## Run locally

```powershell
npx serve .
```

Open the printed local URL, usually:

```text
http://localhost:3000
```

## Recommended Git commit

```powershell
git add .
git commit -m "Release Emergence Lab v1.1 energy ecology"
git push
```

## Controls

- Drag: paint selected brush
- Mouse wheel: zoom
- Space: pause/resume
- P: hide/show side panel
- H: compact/expand field notes
- F: focus mode

## Design direction

The simulation is now moving away from a fixed cellular automaton and toward an artificial ecology where stability emerges from energy flow, imperfect predation, refuges, reproduction costs, and nutrient cycling.
