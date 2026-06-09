---
name: feedback-no-pencil-drawings
description: Never use pencil/crayon-style drawings as game card thumbnail images on the hub
metadata:
  type: feedback
---

Never use singular pencil or crayon-style drawings as game thumbnail images on the Game Hub homepage cards. This includes `characters/casey-pointing.png`, `characters/FOX 3.png`, `characters/FOX 1.png`, and `objects/fox.svg`.

**Why:** The user finds these low-quality and not representative of the games. They look bad as card thumbnails.

**How to apply:** When adding or updating a game's thumbnail image in `game-manifest.ts`, always use a rich full-color illustration from `count-backgrounds/`, a dedicated game thumbnail (like `jangles-ball-thumb.png`, `jangles-pac-thumb.png`), or a character image that is a proper polished illustration (like `air-fante-plane.png`, `spaceship-jaime-jeff.png`, `horns-jaime-jeff.png`). For scene images, set `imageVariant: "scene"` in the manifest so the rendering uses full-bleed cover mode with a fade gradient.
