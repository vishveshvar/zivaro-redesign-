# Zivaro — Intelligence in Motion

A standalone homepage experiment built with semantic HTML, CSS and vanilla JavaScript. The visual direction centers on a folded computational membrane, rendered as a field of luminous points and fine threads. Ink and ivory chapters carry the narrative from fragmented information through research, regional understanding and strategic impact.

## Run locally

Requires Node.js 20.19+, 22.12+, or a newer supported release. Validated with Node.js 24.22.3 and npm 11.19.1.

```sh
cd /workspace/zivaro-redesign-/zivaro-concept-01-intelligence-in-motion
npm ci --cache /tmp/npm-cache
npm run dev -- --port 5173
```

Open the development server's printed address in a browser. Use a local server because the JavaScript uses ES modules and npm imports.

```sh
npm run build
npm run preview -- --port 4173
```

The production output is in `dist/`. It can be served by a static web server at its root. Dependencies and fonts are bundled locally, with no runtime CDN requests or API credentials.

## Experience

- Three.js BufferGeometry renders 42,500 shader-driven points on desktop and 18,400 on mobile or lower-core devices. Pointer movement adjusts perspective, while scroll deforms and turns the membrane.
- GSAP and ScrollTrigger coordinate the brief opening assembly, typographic masks, perspective transitions, research symbol rotation and regional connection paths.
- Canvas artwork continues the visual vocabulary through signal convergence, organic healthcare forms and layered business structures.
- Seven research disclosures, two domain dialogs, anchored navigation and a mobile menu support exploration.
- The enquiry dialog validates input and downloads a text brief. It operates locally. Sending enquiries requires a future backend and an approved destination.
- The regional diagram represents the supplied coverage areas abstractly. It does not assert office locations.

## Accessibility and performance

The implementation includes semantic landmarks, a keyboard skip link, visible focus states, native accessible dialogs, labelled form fields and keyboard-operable disclosures. The mobile menu makes background content inert while open. Reduced-motion preferences disable ambient and scroll animation, while a user control pauses ambient animation.

Device pixel ratio and geometry density are capped. Rendering stops when the relevant artwork is outside the viewport or the document is hidden. A procedural Canvas membrane replaces WebGL when it is unavailable. WebGL resources and animation observers are released on page exit.

## Files and dependencies

- `index.html` contains all homepage content and dialogs.
- `css/styles.css` defines the responsive art direction.
- `js/scene.js` implements the 3D geometry, GLSL shaders and Canvas fallback.
- `js/animations.js` contains GSAP choreography and supporting generative artwork.
- `js/main.js` connects navigation, dialogs, motion preferences and brief downloads.
- `vite.config.js` separates renderer and motion dependencies into cacheable build chunks.
- Three.js supplies WebGL rendering. GSAP supplies motion and ScrollTrigger. Vite provides development and builds. Fontsource packages provide Manrope and DM Sans locally. Exact dependency versions are in `package-lock.json`.

## Validation and limits

Browser checks cover the complete page at 1920 × 1080, 1440 × 900, 1280 × 800, 768 × 1024 and 390 × 844. Checks include overflow, WebGL rendering, navigation, disclosures, domain dialogs, enquiry download, reduced motion and forced WebGL fallback. The production build is also exercised.

The concept uses original procedural artwork and prototype editorial copy. It has no backend, analytics, third-party imagery or fabricated business metrics. Browser validation uses Chromium in this cloud environment. Physical-device GPU performance and Safari/Firefox remain unverified.
