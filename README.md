# Webflow Scripts

External script hosting for Webflow sites. Served via [jsDelivr CDN](https://www.jsdelivr.com/).

## Sites

### Design Playground (`/patterns`)

| Script | Location | Purpose |
|--------|----------|---------|
| `design-playground/psCss.min.js` | Header | CSS injection — 11 @property, 25 @keyframes, section styles, responsive, reduced-motion |
| `design-playground/psJs.min.js` | Footer | JS — GSAP animations, text injection, DOM injection, Observer, Draggable, Flip |

**Usage in Webflow Custom Code:**

```html
<!-- Header -->
<script src="https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@v2.9.0/design-playground/psCss.min.js"></script>

<!-- Footer -->
<script defer src="https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@v2.9.0/design-playground/psJs.min.js"></script>
```

### ahwstn (`ahwstn.com`)

| Script | Location | Purpose |
|--------|----------|---------|
| `ahwstn/ahCss.min.js` | Header | CSS injection — @property orbs, easing props, section bg, glass cards, orb @keyframes, view-timeline entrances, link/button/card hovers, nav, form, terminal, reduced-motion |
| `ahwstn/ahJs.min.js` | Footer | JS — Nav scroll observer, hero SplitText cascade, physio char-scrub, mobile nav toggle, terminal boot sequence |

**Usage in Webflow Custom Code:**

```html
<!-- Header -->
<script src="https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@v1.0.0/ahwstn/ahCss.min.js"></script>

<!-- Footer -->
<script defer src="https://cdn.jsdelivr.net/gh/ahwstn/webflow-scripts@v1.0.0/ahwstn/ahJs.min.js"></script>
```

## Versioning

Scripts are version-pinned via GitHub Release tags. jsDelivr caches version-pinned URLs immutably (1 year).

To update: increment version tag, create new GitHub Release, update version number in Webflow Custom Code, republish Webflow site.
