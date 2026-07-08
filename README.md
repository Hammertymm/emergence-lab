# Emergence Lab v1.3 — Slow Ecology

A browser-based artificial ecosystem observatory.

## What changed in v1.3

This release deliberately slows the simulation down and improves readability.

- Softer, less noisy visuals
- Slower default simulation pace
- Larger, clearer organism hierarchy
- Fungi/decomposer layer
- Carrion and nutrient recycling
- More stable grazing and predator pressure
- Recovery protocols for ecosystem collapse
- Better field notes
- Screen-first UI retained

## Run locally

```powershell
npx serve .
```

Open the local URL shown in the terminal.

## Controls

- Space: pause/resume
- S: step once
- P: hide/show panel
- F: focus mode
- N: new world

## Ecosystem model

Energy flows through:

Sun → plants → herbivores → predators → carrion → fungi → nutrients → plants

This is still stylised, but v1.3 shifts the project away from fast pixel noise and toward a slower living diorama that is easier to observe.
