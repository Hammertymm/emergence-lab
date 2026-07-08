# Emergence Lab v1.2 — Recovery Ecology

A browser-based artificial world simulator focused on stable ecosystem emergence.

## What changed from v1.1

v1.1 overcorrected the predator/prey system. Predators could still exhaust herbivores, then collapse the world. v1.2 adds stronger recovery and balance systems:

- More land-biased world generation.
- Better organism seeding.
- Predator population caps tied to herbivore population.
- Slower predator reproduction.
- Predator rest/cooldown after hunting.
- Hunting failure affected by vegetation cover.
- Herbivore emergency reseeding if the world collapses.
- Predator reseeding only when herbivore population can support it.
- Clearer terrain colours.
- Smaller screen-first interface.

## Run locally

```powershell
npx serve .
```

Open the printed local URL, usually:

```text
http://localhost:3000
```

## Controls

- Space: pause/resume
- S: single step
- P: hide/show side panel
- F: focus mode
- R: rain
- L: seed life
- Click/drag: paint selected brush

## Notes

This version is designed to remain alive longer rather than immediately collapse. Extinction can still happen under high climate stress or heavy predator injection, but the world now has recovery mechanisms.
