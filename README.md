# Noa Alvarez — Interfaces that show their working

A self-assembling portfolio for a fictional product designer and creative engineer. The page opens black; cursor swarms build it live — drag-selecting sections, typing copy, and drawing the project diagrams with a paint-style tool dock. Scrolling reveals new sections and starts each diagram as its row enters view. The final project, **Volume**, is a real-time 3D wireframe torus you can spin.

**Live:** https://gluansinha-star.github.io/noa-alvarez-portfolio/

## Run locally

There is no build step. Open `index.html`, or serve the folder:

```bash
python -m http.server 4173
```

Then open http://localhost:4173.

## What's inside

- Vanilla HTML/CSS/JS, no dependencies or build pipeline
- Cursor choreography: marquees, typed copy, click ripples, paint tools
- Per-row diagram painting triggered by scroll visibility
- Accessible case-study dialog for all seven projects
- "Seams" measurement overlay with real computed dimensions
- Canvas 3D torus with a cursor demo and pointer interaction
- Reduced-motion and no-JS fallbacks

The site is a design mock; Noa Alvarez and the case studies are fictional.
