# Xsolla Web Shop ecosystem prototype

This is a dependency-free HTML/CSS/JavaScript implementation of all 16 states
across the four ecosystem categories from the supplied Figma file.

## Files

- `index.html` — semantic section markup and the shared Rive canvas
- `styles.css` — responsive layouts for 360, 768, 1440, and 1800 px references
- `script.js` — category and feature state, keyboard navigation, and deep links
- `rive-integration.js` — Rive loading, View Model binding, triggers, and responsive resizing
- `assets/` — exact category icons, the active `webshopecosystem_01_v06.riv`, and the retained v04 source
- `vendor/` — pinned Rive Canvas runtime 2.39.1 and its WASM files

Serve this directory with a static web server for automatic Rive loading. If
`index.html` is opened directly from disk, the page shows a `.riv` picker because
browsers do not allow JavaScript to fetch neighboring local files.

## Responsive frame mapping

- Up to 599 px: component width is `100vw - 32px`; the Rive panel uses the 296:177 mobile ratio
- 600-1439 px: component width is `min(100vw - 64px, 704px)`; the Rive panel uses the 672:335 tablet ratio
- 1440-1799 px: 1136 px component with a 749 x 335 px Rive panel
- 1800 px and wider: 1434 px component with a 749 x 335 px Rive panel

These caps mirror the four Figma reference frames. The supplied feature
artboards have a fixed native size of 749 x 335 px. The integration uses
`Fit.Layout` at every size; tablet and mobile apply a proportional
`layoutScaleFactor` based on 672 px and 620 px reference widths respectively.

## Responsive Rive tuning handoff

Desktop rendering at 1440 px and wider is intentionally unchanged. Tablet and
mobile corrections are feature-specific because the visible content is not
centered identically inside every Rive artboard.

`rive-integration.js` calculates the normal responsive `layoutScaleFactor` from
the slot width, then multiplies it by the optional CSS variable
`--rive-layout-scale`. It re-applies the layout after slot, viewport, or device
pixel-ratio changes and calls `resizeDrawingSurfaceToCanvas()`.

Horizontal corrections expand the canvas by the same amount that it is shifted.
This keeps the canvas's right edge attached to the Rive panel and prevents a
left correction from introducing new right-edge clipping. The Rive panel itself
remains the clipping boundary (`overflow: hidden`).

### Tablet adjustments (600-1439 px)

| Feature | Scale | Horizontal correction | Vertical correction |
| --- | ---: | ---: | ---: |
| Payments | 96% | 20 px left | centered |
| Mobile Account | 92% | centered | 8 px down |
| Social Quests | default | 34 px left | centered |
| SDK | default | 60 px left | centered |
| LiveOps | default | 24 px left | centered |
| Analytics | default | 40 px left | centered |
| MMP | default | 40 px left | centered |

All tablet states not listed above use the default centered Rive layout.

### Mobile adjustments (up to 599 px)

| Category / feature | Scale | Horizontal correction | Vertical correction / alignment |
| --- | ---: | ---: | --- |
| Web Shop / Shop Builder | default | centered | 8 px down |
| Web Shop / Catalog | 98% | 6 px left | centered |
| Web Shop / Login | default | centered | 6 px down |
| Web Shop / Payments | 90% | protected overscan | bottom-center alignment |
| Web Shop / Mobile Account | 93% | 4 px left; slot uses card side padding | 8 px down |
| Engage / Social Quests | 90% | 6 px left | 34 px down |
| Monetize / Discord Bot | default | protected overscan | 30 px down |
| Monetize / Buy Button | default | protected overscan | 30 px down |
| Monetize / Offerwall | default | protected overscan | 30 px down |
| Monetize / Subscriptions | default | 8 px left | 16 px down |
| Monetize / SDK | default | 12 px left | 16 px down |
| Operate / LiveOps | 95% | protected overscan | centered |
| Operate / Analytics | default | protected overscan | centered |
| Operate / MMP | 95% | 8 px left | centered |

The remaining mobile features retain their centered scale and position, with
only protective overscan where declared in `styles.css`.

The mobile Rive canvas is intentionally display-only (`pointer-events: none`)
and its slot uses `touch-action: pan-y`. This lets a vertical swipe that starts
over the animation continue scrolling the page. Feature selection remains in
the accessible HTML category and feature tabs above the canvas.

### CSS controls used by the integration

- `--rive-layout-scale` — feature multiplier applied to the calculated Rive layout scale
- `--rive-layout-width-adjustment` — excludes temporary slot expansion from scale calculation
- `--rive-mobile-overscan-x` — extra mobile drawing width used to expose edge artwork
- `--rive-mobile-shift-left` — guarded mobile left correction
- `--rive-mobile-offset-y` — mobile vertical correction
- `--rive-tablet-shift-left` — guarded tablet left correction

When adding another exception, scope it with `data-feature` inside the matching
media query. Do not change the shared canvas position globally: that would move
states whose artwork is already correct.

## Feature state IDs

- Web Shop: `shop-builder`, `catalog`, `login`, `payments`, `mobile-account`
- Engage: `loyalty-program`, `referral-program`, `social-quests`
- Monetize: `discord-bot`, `buy-button`, `offerwall`, `subscriptions`, `sdk`
- Operate: `xsolla-liveops`, `analytics`, `mmp`

Each state is deep-linkable, for example `index.html#loyalty-program`.

## Rive binding

The Web Shop animation uses:

- Artboard: `01MAIN`
- State machine: `State Machine 1`
- View Model: `VM01` (default/`Instance 2`)
- Enum: `enumSelect`
- Enum definition: `Enum01`

The five Web Shop states map as follows:

| HTML state | Enum value | Trigger |
| --- | --- | --- |
| `shop-builder` | `01` | `isIn1` |
| `catalog` | `02` | `isIn2` |
| `login` | `03` | `isIn3` |
| `payments` | `04` | `isIn4` |
| `mobile-account` | `05` | `isIn5` |

The Engage animation uses:

- Artboard: `02MAIN`
- State machine: `State Machine 1`
- View Model: `VM02` (`Instance`)
- Enum: `enumSelect2`
- Enum definition: `Enum01`

The three Engage states map as follows:

| HTML state | Enum value | Trigger |
| --- | --- | --- |
| `loyalty-program` | `01` | `isIn21` |
| `referral-program` | `02` | `isIn22` |
| `social-quests` | `03` | `isIn23` |

The Monetize animation uses:

- Artboard: `03MAIN`
- State machine: `State Machine 1`
- View Model: `VM03` (`Instance`)
- Enum: `enumSelect3`
- Enum definition: `Enum01`

The five Monetize states map as follows:

| HTML state | Enum value | Trigger |
| --- | --- | --- |
| `discord-bot` | `01` | `isIn31` |
| `buy-button` | `02` | `isIn32` |
| `offerwall` | `03` | `isIn33` |
| `subscriptions` | `04` | `isIn34` |
| `sdk` | `05` | `isIn35` |

The Operate animation uses:

- Artboard: `04MAIN`
- State machine: `State Machine 1`
- View Model: `VM04` (`Instance 2`)
- Enum: `enumSelect4`
- Enum definition: `Enum01`

The three Operate states map as follows:

| HTML state | Enum value | Trigger |
| --- | --- | --- |
| `xsolla-liveops` | `01` | `isIn41` |
| `analytics` | `02` | `isIn42` |
| `mmp` | `03` | `isIn43` |

The shared canvas switches artboards and rebinds the matching View Model before
setting the enum and firing its trigger. All 16 ecosystem states now have Rive
content bindings.

Rendering uses the pinned `@rive-app/canvas` 2.39.1 runtime. The normal and
fallback WASM files are both version-matched to that runtime.

The page continues to dispatch an `ecosystem:featurechange` event whenever the
active HTML state changes:

```js
document.addEventListener("ecosystem:featurechange", (event) => {
  const { category, feature, riveState, canvas } = event.detail;
  // rive-integration.js consumes this event.
});
```

The content panel exposes connection and activation diagnostics through
`data-rive-status`, `data-rive-supported`, `data-rive-enum`,
`data-rive-trigger`, `data-rive-activation`, `data-rive-artboard`,
`data-rive-view-model`, and `data-rive-renderer` attributes.
