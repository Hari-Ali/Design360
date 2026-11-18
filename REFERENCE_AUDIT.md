# Reconstruction audit

The project is a static, eight-route Vite site. Page markup and SVGs come from scripts/generate.mjs and src/data/site.mjs. Layered CSS controls layout at 1600, 1024 and 768 px. app.ts owns dialog, intro, motion preference, scroll restoration and enquiry links. reveals.ts owns ScrollTrigger, media masks, hover tilt, and the statement pin. hero-scene.ts contains the reflective ring. The nested legacy snapshot contains older assets, fonts and a different menu. The checkout has no Git metadata. A source checkpoint was made before editing.

The live website and the 104-second recording informed this audit. The attached text is the assignment with structural selectors rather than a separate full rendered HTML dump. The live DOM and the older local snapshot supplied additional structure. Baseline screenshots were captured at desktop and mobile sizes.

| Section | Current source | Reference structure and evidence | Visual / motion | Repair and verification |
| --- | --- | --- | --- | --- |
| Loader | generate, app, CSS | Geometric logo, corner registration marks, rolling count and belts | Incorrect / incorrect | Original FORM mark, readiness-driven counter and panel reveal. Capture startup. |
| Header / menu | generate, app, CSS | Fixed compact header, narrow white desktop drawer at 1:37, dark mobile menu from supplied markup notes | Incorrect / incorrect | Fixed contrasting controls, staggered character layers, right drawer and mobile sheet. Test input and focus. |
| Hero | generate, CSS, hero-scene | Near-black stage, upper-left sans title, centered angular assembly, lower controls at 0:13 | Incorrect / incorrect | Replace ring and hover burst with graphite assembly and hold/release. Test pointer cancellation and keyboard. |
| About | generate, reveals | Dark editorial text overlapping hero exit at 0:20 | Incorrect / incorrect | Broad line measure and progressive entrance. Capture section. |
| Vision / marquee | generate, reveals | Upper note, transverse type and horizontal white stripes at 0:27 | Incorrect / missing | Replace unrelated statement pin with five scroll-driven bands and a continuous type track. |
| Key facts | generate | Light section with awards and numerical groups | Incorrect / missing | Promote existing verified FORM facts to a light section and animate their numeric values. |
| Work | generate, reveals | Light split editorial lead and large project imagery at 0:34 | Incorrect / incorrect | Use the existing cards in a split layout, with mask and image crop. Remove generic cursor pill and tilt. |
| Services | generate, reveals | Stacked type in light-to-dark progression and floating stone at 0:41–1:09 | Incorrect / missing | Build one scroll stage around original FORM disciplines and a textured Three.js stone. Preserve the disclosures on the Services page. |
| Client stories / team | generate | Live DOM contains testimonials and team media selectors | Missing / missing | Keep the current studio perspective until approved testimonial and team content are available. |
| Perspective gallery | generate | Receding cards on an arc at 1:16, closer aligned cards at 1:23 | Missing / missing | Add synchronized perspective states to an exploration gallery using existing FORM projects. |
| Footer / transition | generate, app, CSS | Dark close with contact links and linework at 1:30; loader-related transition markup described in brief | Incorrect / incorrect | Consolidate the contact band and footer, then use a masked panel route transition. Verify links and browser history. |
## Reference notes and limits

Live computed styles showed Familjen on the hero and about headings and Neue Haas on the header and body. FORM uses Segoe UI for display text, Arial for body text, and a local system monospace stack for metadata. The original font files and brand assets were excluded.

The live DOM exposed three principal work cards, five testimonial slides, and team media within the facts section. The recording confirmed the desktop drawer and showed the services progression and gallery from multiple scroll positions. The desktop project stage now advances existing FORM work cards horizontally. Services and the exploration gallery use independent scroll ranges. The recording supports press-based blast and an angular scene. The 240 ms charge threshold, individual trajectories, and reassembly speed are FORM implementation choices.

The project has no approved FORM testimonials, team footage, award marks, partner marks, booking URL, or social profiles. Key facts use the existing concept counts. The studio perspective occupies the editorial position of client stories. No testimonial carousel or team-video block is shipped. The separately named rendered HTML file was unavailable. The brief supplied selectors and the live site's DOM was inspected directly.
