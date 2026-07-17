# 001 — Respect reduced-motion preferences

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 4 files, about 35 class/CSS edits

## Problem

The application has movement and perpetual animations on every route but no `prefers-reduced-motion` handling. This conflicts with the project requirement that motion remain compatible with reduced-motion preferences.

```css
/* src/app/globals.css:102-119 — current */
.animate-fusion { animation: fusion 1s forwards cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-sparkle { animation: sparkle 0.6s ease-out forwards; }
.animate-genz-pop { animation: genz-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
.animate-genz-float { animation: genz-float 3.8s ease-in-out infinite; }
```

```jsx
// src/app/page.js:21-22,37-39 — current
<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B2F2BB] blur-[120px] rounded-full opacity-40 animate-pulse"></div>
<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#74C0FC] blur-[120px] rounded-full opacity-30 animate-pulse delay-1000"></div>
<div className="absolute -top-32 -left-40 text-8xl md:text-9xl opacity-20 animate-[bounce_6s_infinite] select-none pointer-events-none drop-shadow-lg">🔥</div>
```

The same issue occurs at `src/app/play/page.js:143,156,171,186,212,258,298-300` and `src/app/guide/page.js:139,200,219,232`.

## Target

Keep opacity/color feedback but remove position, scale, rotation, and perpetual movement when the OS requests reduced motion.

```css
@keyframes reduced-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .motion-loop { animation: none !important; }
  .motion-feedback {
    animation: reduced-fade 160ms cubic-bezier(0.23, 1, 0.32, 1) both !important;
    transform: none !important;
  }
}
```

`motion-loop` marks perpetual decoration. `motion-feedback` marks state feedback that must remain visible as a 160ms opacity change.

## Repo conventions to follow

- Global keyframes and animation helpers live in `src/app/globals.css:50-119`.
- Page motion is attached through Tailwind/class names, for example `animate-fusion` at `src/app/play/page.js:156`.
- Preserve the established playful motion when reduced motion is not requested.

## Steps

1. In `src/app/globals.css`, add `reduced-fade` and the exact media query shown above after the animation helpers.
2. In `src/app/page.js`, add `motion-loop` to both pulsing background gradients and all three perpetual emoji decorations. Add `motion-feedback` to the settings panel.
3. In `src/app/play/page.js`, add `motion-loop` to the pot glow, hint, progress pulse, library hover-bounce emoji, and discovery emoji. Add `motion-feedback` to fusion, ingredient entry, modal backdrop, and modal panel.
4. In `src/app/guide/page.js`, add `motion-loop` to hover-bounce reagent emoji and floating found stars. Add `motion-feedback` to both recipe reveal blocks.
5. Do not globally set `animation-duration: 0.01ms`; it removes useful opacity feedback and can break animation lifecycle assumptions.

## Boundaries

- Do NOT alter normal-motion timings or keyframes in this plan.
- Do NOT change markup structure, interaction behavior, or audio behavior.
- Do NOT add a motion dependency.
- If the cited classes have drifted since commit `a72402f`, STOP and report instead of improvising.

## Verification

- **Mechanical**: run `npm run lint` and `npm run build`; both must exit 0.
- **Feel check**: visit `/`, `/play`, and `/guide` with normal motion, then emulate `prefers-reduced-motion: reduce` in DevTools.
  - Normal mode retains the existing animations.
  - Reduced mode has no looping bounce, pulse, float, scale, rotation, or translation.
  - Combining, opening a modal, and revealing a recipe still give a brief opacity response.
  - Test on an iPad/tablet with Reduce Motion enabled; all controls must remain responsive and visible.
- **Done when**: every motion surface found by `rg -n "animate-|animation:" src/app` is either marked as a loop/feedback or explicitly documented as color-only, and reduced mode contains no positional motion.
