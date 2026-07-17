# 004 — Repair broken animation declarations

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: MEDIUM
- **Category**: Correctness and physicality
- **Estimated scope**: 3 files, about 20 lines

## Problem

The active ingredient requests a `zoom-in` animation that has no keyframe in either the app or Tailwind theme, so the card appears without the intended feedback. A landing decoration also uses an invalid shorthand token.

```jsx
// src/app/play/page.js:169-172 — current
className={`
  w-24 h-24 md:w-40 md:h-40 bg-white rounded-[40px] md:rounded-[50px]
  shadow-[0_12px_0_#efefef] flex flex-col items-center justify-center
  animate-[zoom-in_0.4s_ease-out] border-4 border-white ring-8 ring-white/10
  ${!isCombining ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''}
`}
```

```jsx
// src/app/page.js:39 — current
<div className="absolute top-40 -right-60 text-7xl md:text-8xl opacity-20 animate-[bounce_7s_infinite_delay-150ms] select-none pointer-events-none drop-shadow-lg">💧</div>
```

`src/app/globals.css:50-100` defines no `zoom-in` keyframe.

## Target

```css
@keyframes ingredient-enter {
  from { opacity: 0; transform: translateY(8px) scale(0.94); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-ingredient-enter {
  animation: ingredient-enter 200ms cubic-bezier(0.23, 1, 0.32, 1) both;
}
```

Replace the ingredient class with `animate-ingredient-enter motion-feedback`. Replace the malformed landing declaration with two valid utilities: `animate-[bounce_7s_infinite] [animation-delay:150ms]`.

## Repo conventions to follow

- Define app-owned keyframes and helper classes in `src/app/globals.css`.
- Use semantic app animation names such as the existing `.animate-fusion` rather than an undefined generic plugin name.
- Starting scale stays within the audited 0.9–0.97 physical range.

## Steps

1. Add the exact `ingredient-enter` keyframe and helper to `src/app/globals.css` after `fade-in`.
2. Replace `animate-[zoom-in_0.4s_ease-out]` at `src/app/play/page.js:171` with `animate-ingredient-enter motion-feedback`.
3. Replace `animate-[bounce_7s_infinite_delay-150ms]` in `src/app/page.js` with `animate-[bounce_7s_infinite] [animation-delay:150ms] motion-loop`.
4. Confirm there are no remaining references to `zoom-in` or `delay-150ms`.

## Boundaries

- Plan 001 supplies the `motion-feedback` and `motion-loop` reduced-motion behavior.
- Do NOT alter ingredient markup or selection behavior.
- Do NOT add an animation plugin.
- Do NOT alter the other landing decoration timings.

## Verification

- **Mechanical**: `npm run lint && npm run build` exits 0; `rg -n "zoom-in|delay-150ms" src` returns no matches.
- **Feel check**: at 10% playback, add one ingredient and confirm it rises 8px while scaling 0.94→1 and fading in over exactly 200ms. Confirm the water decoration begins 150ms after mount in normal motion and remains still under reduced motion.
- **Done when**: both declarations generate valid CSS and the ingredient entry is visibly present but brief.
