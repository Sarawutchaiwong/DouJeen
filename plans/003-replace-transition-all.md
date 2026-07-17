# 003 — Replace broad transition-all declarations

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 3 files, 15 class replacements

## Problem

Fifteen interactive surfaces use `transition-all`, allowing layout, borders, shadows, and unrelated properties to animate implicitly.

```jsx
// src/app/play/page.js:148-153 — current
className={`
  relative w-72 h-72 sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px]
  bg-white/40 backdrop-blur-sm border-[12px] border-dashed border-[#FFD8A8] rounded-[100px] md:rounded-[140px]
  flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
  ${activeItems.length > 0 ? 'scale-105 border-[#74C0FC] bg-white/60 shadow-[0_30px_100px_rgba(116,192,252,0.2)]' : 'shadow-inner'}
`}
```

Other occurrences are at `src/app/page.js:27,97,106`, `src/app/play/page.js:127,196,212,231,263,318`, and `src/app/guide/page.js:100,114,137,156,195`.

## Target

Each surface transitions only the properties it changes. Use these exact patterns after plan 008 defines the tokens:

```txt
Buttons/cards: transition-[transform,background-color,box-shadow,border-color] duration-[var(--duration-press)] ease-[var(--ease-out)]
Drop zone: transition-[transform,background-color,box-shadow,border-color] duration-[var(--duration-ui)] ease-[var(--ease-in-out)]
Tooltip: transition-opacity duration-[var(--duration-tooltip)] ease-[var(--ease-out)]
Input: transition-[border-color,box-shadow] duration-[var(--duration-ui)] ease-[var(--ease-out)]
```

Remove the responsive aside transition entirely. Defer the progress bar at `src/app/play/page.js:212` to plan 007.

## Repo conventions to follow

- Continue using Tailwind arbitrary transition-property utilities; do not introduce component CSS solely for these declarations.
- Preserve the current hover, active, focus, color, border, and shadow end states.
- Use the tokens introduced by plan 008 rather than literal durations or curves.

## Steps

1. In `src/app/page.js`, replace the three `transition-all` instances with the button/card target pattern.
2. In `src/app/play/page.js`, use the button/card target for the home button, library cards, and discovery button.
3. Use the drop-zone target at `src/app/play/page.js:151`; remove the 700ms duration and overshooting curve.
4. Remove `transition-all` from the responsive aside at `src/app/play/page.js:196`; viewport breakpoint layout must snap, not tween dimensions.
5. Replace the tooltip at `src/app/play/page.js:263` with the tooltip target. Do not change its visibility behavior.
6. Leave `src/app/play/page.js:212` unchanged for plan 007.
7. In `src/app/guide/page.js`, use the button/card target at lines 100, 114, 137, and 195; use the input target at line 156.
8. Run `rg -n "transition-all" src/app`; only the progress bar may remain until plan 007 is executed.

## Boundaries

- Depends on plan 008.
- Do NOT redesign hover/active values or markup.
- Do NOT change responsive breakpoints.
- Do NOT touch the progress animation in this plan.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run lint && npm run build` exits 0. After plan 007, `rg -n "transition-all" src/app` must return no matches.
- **Feel check**: inspect landing CTAs, library cards, guide cards, tooltip, and drop zone at 10% playback speed.
  - Transform/color/shadow changes remain smooth.
  - No dimensions tween while resizing across the `lg` breakpoint.
  - Drop-zone feedback completes in 200ms and remains interruptible when ingredients are added/removed quickly.
- **Done when**: no interactive surface uses `transition-all` and all previous visual end states are preserved.
