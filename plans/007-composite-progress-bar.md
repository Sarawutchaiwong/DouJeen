# 007 — Animate progress with transforms

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: MEDIUM
- **Category**: Performance and easing
- **Estimated scope**: 1 file, about 8 lines

## Problem

The collection progress bar transitions `width` through `transition-all` for one second and runs a pulse concurrently. Width changes trigger layout and paint.

```jsx
// src/app/play/page.js:210-214 — current
<div className="relative w-full h-4 bg-white/50 rounded-full overflow-hidden border-2 border-[#B2F2BB]/30 shadow-inner">
  <div
    className="h-full bg-gradient-to-r from-[#B2F2BB] via-[#8ce99a] to-[#B2F2BB] shadow-[0_0_15px_rgba(178,242,187,0.8)] transition-all duration-1000 ease-out animate-pulse"
    style={{ width: `${(library.length / (Object.keys(RECIPES).length + 5)) * 100}%` }}
  ></div>
</div>
```

## Target

Compute a clamped ratio and animate only `transform` from the left edge.

```js
const progressRatio = Math.min(
  library.length / (Object.keys(RECIPES).length + 5),
  1
);
```

```jsx
<div
  className="h-full origin-left bg-gradient-to-r from-[#B2F2BB] via-[#8ce99a] to-[#B2F2BB] shadow-[0_0_15px_rgba(178,242,187,0.8)] transition-transform duration-[var(--duration-celebration)] ease-[var(--ease-out)]"
  style={{ transform: `scaleX(${progressRatio})` }}
/>
```

`--duration-celebration` is exactly `300ms` from plan 008. Do not pulse the bar.

## Repo conventions to follow

- Keep the progress calculation in `GamePage`; no new component is necessary.
- Preserve the existing gradient, glow, container, and recipe denominator.
- Use motion tokens from plan 008.

## Steps

1. In `src/app/play/page.js`, compute `progressRatio` immediately before the JSX return or with the other derived values; clamp it to 1 exactly as shown.
2. Replace inline width with `transform: scaleX(...)`.
3. Add `origin-left` and the exact transform transition classes.
4. Remove `transition-all`, `duration-1000`, `ease-out`, and `animate-pulse` from the bar.
5. Ensure plan 006 does not separately remove or overwrite the new classes.

## Boundaries

- Depends on plan 008.
- Do NOT change library totals, recipe data, visuals, or persistence.
- Do NOT animate the container width or height.
- Do NOT add a dependency.

## Verification

- **Mechanical**: `npm run lint && npm run build` exits 0. `rg -n "duration-1000|transition-all|style=\\{\\{ width" src/app/play/page.js` returns no progress-bar match.
- **Feel check**: discover a word while recording Performance and at 10% animation playback.
  - The fill grows left-to-right over exactly 300ms.
  - The container does not reflow and neighboring content does not move.
  - The bar remains still after reaching the new ratio.
  - Reduced motion removes movement while leaving the final ratio visible.
- **Done when**: progress uses only a transform transition and generates no layout event per animation frame.
