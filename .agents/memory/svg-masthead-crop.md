---
name: SVG masthead crop offset
description: How to correctly crop the New Frontier header SVG so the logo band is visible in the teal masthead strip.
---

## Rule

The uploaded masthead SVG (`new-frontier-header-white.svg`) has **all visible content nested inside `<g transform="matrix(1,0,0,1,0,349)">`**.  
This shifts every element 349 SVG units downward before any other transforms apply.

The logo band ("NEW FRONTIER" display letters + "THE OWL OF MINERVA FLIES AT DUSK" tagline) sits at **absolute SVG y ≈ 393–550** (after the 349-unit group offset).

**Why:** The source SVG was exported as a full A4-portrait layout. The logo occupies only the upper portion of the page, but that portion is still 349 units below the document origin due to page margins baked into the export.

**How to apply:**

At display width 90 % of 1280 px (≈ 1152 px):
- Scale ≈ 0.968 display-px / SVG-unit  (1152 / 1190.25 viewBox width)
- Logo top (SVG y=393) → display y ≈ 380 px from top of `<img>`
- Apply `margin-top: -370px` to the `<img>` inside a flex container with `align-items: flex-start`
- Container height: 165 px, `overflow: hidden`

This shows the logo at the very top of the 165 px masthead strip with ~10 px breathing room above the letters.

If the viewport or `width %` changes, recalculate:
```
display_y_of_logo_top = 393 * (display_width / 1190.25)
margin_top = -(display_y_of_logo_top - desired_top_padding)
```

## White-fill copy

The original SVG has all text paths in `fill="#2d7a75"` (teal). Against the teal masthead, use the pre-generated white-fill copy at `public/assets/new-frontier-header-white.svg` (all fills replaced to `#ffffff` / `rgba(255,255,255,0.65)` via sed). No CSS `filter` needed.
