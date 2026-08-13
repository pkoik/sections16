# Xsolla Web Shop ecosystem prototype

This is a dependency-free HTML/CSS/JavaScript implementation of all 16 states
across the four ecosystem categories from the supplied Figma file.

## Files

- `index.html` — semantic section markup and the shared Rive canvas
- `styles.css` — responsive layouts for 360, 768, 1440, and 1800 px references
- `script.js` — category and feature state, keyboard navigation, and deep links
- `rive-integration.js` — Rive loading, View Model binding, triggers, and responsive resizing
- `assets/` — exact category icons plus `webshopecosystem_01_v04.riv`
- `vendor/` — pinned Rive Canvas runtime 2.39.1 and its WASM files

Serve this directory with a static web server for automatic Rive loading. If
`index.html` is opened directly from disk, the page shows a `.riv` picker because
browsers do not allow JavaScript to fetch neighboring local files.

## Responsive frame mapping

- Up to 767 px: 328 px component with a 296 x 177 px Rive panel
- 768-1439 px: 704 px component with a 672 x 335 px Rive panel
- 1440-1799 px: 1136 px component with a 749 x 335 px Rive panel
- 1800 px and wider: 1434 px component with a 749 x 335 px Rive panel

These caps mirror the four Figma reference frames. The supplied feature
artboards have a fixed native size of 749 x 335 px, so the integration keeps
`Fit.Layout` at that native desktop size and uses centered proportional
`Fit.Contain` rendering for the smaller tablet and mobile panels.

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
