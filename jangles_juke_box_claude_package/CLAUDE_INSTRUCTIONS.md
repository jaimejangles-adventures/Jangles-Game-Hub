# Jangles Juke Box Skin Package for Claude

Use this folder as the visual and coding handoff for the Jangles game player skin.

## Files

- `assets/jangles-juke-box-title-reference.png`  
  The title/logo reference. Use this style for the title. Important: the purple **G** in `JANGLES` should sit about **4px lower** than the surrounding letters.

- `assets/jangles-juke-box-player-mockup.png`  
  The target player mockup. Recreate this look in code, but keep the existing game logic.

- `src/components/JanglesJukeBoxPlayer.jsx`  
  A clean React component example showing the intended structure.

- `src/components/JanglesJukeBoxPlayer.css`  
  CSS skin for the storybook beach UI.

## What to do in the real app

Do **not** rebuild the game logic. Use this as a styling/component reference and apply the same class structure or equivalent CSS to the existing game screen.

Preserve all current functionality:

- stop number
- question text
- instruction text
- timer
- clues panel
- play button
- waveform/progress bar
- time labels
- answer options, if the current game already has them
- audio behavior
- scoring / navigation logic

## Design target

The final screen should feel like a flat Jaime Jangles picture-book game UI, not a glossy jukebox or casino skin.

Use:

- soft sky-blue background
- simple white clouds
- Barbados/coastal beach feeling
- turquoise water near the bottom
- sandy shore
- blue seaside house with purple roof on the right
- palm trees
- simple picnic tables
- tropical leaves/flowers in corners
- cream notebook-style clues panel
- rounded audio player
- navy/dark-blue readable text
- playful title letters with thick black outlines

Avoid:

- characters
- fish
- boat
- fishing rods
- Barbados flag
- glossy 3D effects
- casino/neon styling
- overly busy decoration

## Title requirements

Title text must read exactly:

`JANGLES JUKE BOX`

Use the Jaime Jangles-style color order:

- `JANGLES`: J pink, A yellow, N blue, G purple, L green, E orange, S red
- `JUKE BOX`: same color family; use a clean matching arrangement

The title should be built as editable text/spans in code if possible, not baked as one full-screen image. If an image is used, use `assets/jangles-juke-box-title-reference.png` only as reference or crop/extract the logo carefully.
