# FORM Studio

FORM is an eight-page static creative studio site. It uses Vite, TypeScript, GSAP ScrollTrigger, and Three.js. The homepage uses a readiness-driven geometric intro, graphite hold-to-blast hero, light work sequence, atmospheric service stage, and perspective project gallery.

## Setup and deployment

Use Node 22.12 or later.

```sh
npm ci
npm run dev
npm run lint
npm run build
npm test
npm run preview
```

Deploy the contents of `dist/` to a static host. Serve the generated HTML files and asset directories from the domain root. Each route has its own HTML file, so it works on direct entry and needs no SPA rewrite rule. The existing enquiry form opens a local email draft. Replace the example address in `src/data/site.mjs` before launch.

## Source

| File | Responsibility |
| --- | --- |
| `src/data/site.mjs` | Studio, portfolio, and service content |
| `scripts/generate.mjs` | Shared page templates and local artwork |
| `src/styles/main.css`, `src/styles/reconstruction.css` | Shared layout, responsive scene composition, menu, loader, and route transitions |
| `src/scripts/app.ts` | Dialog, focus, motion settings, intro, and enquiry draft |
| `src/scripts/reveals.ts` | ScrollTrigger timelines for section reveals, bands, counters, work, services and the gallery |
| `src/three/hero-scene.ts` | Graphite assembly, hold-to-blast, procedural stone, and WebGL lifecycle |

Edit templates and data before running the build. The top-level HTML files and artwork in `public/assets/` are generated. The production output excludes the nested reference snapshot.

See [the reference audit and motion map](REFERENCE_AUDIT.md) for section-level behavior and differences. See [performance and QA notes](PERFORMANCE_NOTES.md) for verified behavior and remaining limits.
