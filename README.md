# Emergence Lab v1.0

A browser-based artificial world observatory.

Emergence Lab simulates a small living world made from interacting systems:

- procedural terrain
- water flow
- climate and rain
- nutrients
- plant growth
- herbivores
- predators
- reproduction
- mutation
- ecosystem collapse and recovery
- AI-style naturalist field notes
- population history chart
- save/load
- screenshot and JSON export

The goal is not to be a normal game. The goal is to watch complex behaviour emerge from simple local rules.

## Run locally

From the project folder:

```powershell
npx serve .
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:3000
```

Alternative with Python:

```powershell
py -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Install over your current version

Unzip this folder over:

```text
C:\Projects\emergence-lab
```

Then commit:

```powershell
git add .
git commit -m "Release Emergence Lab v1.0"
git push
```

## Controls

| Action | Control |
|---|---|
| Pause/resume | Space |
| Focus mode | F |
| Hide/show side panel | P |
| Save | S |
| Load | L |
| Rain event | R |
| Meteor event | M |
| Select brushes | 1-6 |
| Zoom | Mouse wheel |
| Paint | Click/drag |
| Pan | Shift+drag or middle mouse drag |

Brushes:

1. Plant
2. Water
3. Stone
4. Herbivore
5. Predator
6. Eraser

## What is simulated?

### Terrain

Each new world generates a terrain field. Terrain controls where water gathers, where plants survive, and where organisms can move.

### Water

Water flows downhill across the map and evaporates slowly. Rain events add new surface water.

### Nutrients

Nutrients help plants grow. Dead organisms and meteor events return nutrients to the soil.

### Plants

Plants consume water and nutrients. They spread seeds and can collapse if the environment becomes too dry or overgrazed.

### Herbivores

Herbivores seek plants, eat, spend energy, reproduce, mutate, and die.

### Predators

Predators hunt herbivores. If they overhunt, prey collapse and predators starve.

### Mutation

Offspring inherit DNA values with occasional mutation. DNA affects speed, vision, efficiency, fear, and size.

### AI Naturalist

The field notes system watches the simulation and writes short observations about population pressure, drought, collapse risk, and stability.

## Project direction

v1.0 is the first complete snapshot of the project as a platform rather than a one-off demo.

Future directions:

- persistent world gallery
- proper species classification
- evolutionary tree
- Web Worker simulation thread
- PixiJS/WebGPU renderer
- longer timeline and rewind
- real AI-generated observation reports
- shareable world seeds
- Vercel deployment

## Design principle

Every new feature should interact with existing systems. Avoid isolated gimmicks. The project becomes interesting when water, plants, animals, climate, nutrients, and mutation all affect each other.
