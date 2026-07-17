# 006 — Calm perpetual decorative motion

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: MEDIUM
- **Category**: Purpose and frequency
- **Estimated scope**: 3 files, about 15 class edits

## Problem

Several independent loops compete with the combine/discover action: pulsing landing gradients, three bouncing hero emoji, pot glow, hint bounce, progress pulse, discovery emoji bounce, hover bounce, and floating found stars.

```jsx
// src/app/page.js:21-22,37-39 — current
<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B2F2BB] blur-[120px] rounded-full opacity-40 animate-pulse"></div>
<div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#74C0FC] blur-[120px] rounded-full opacity-30 animate-pulse delay-1000"></div>
<div className="absolute -top-32 -left-40 text-8xl md:text-9xl opacity-20 animate-[bounce_6s_infinite] select-none pointer-events-none drop-shadow-lg">🔥</div>
<div className="absolute -bottom-40 -right-40 text-9xl md:text-[12rem] opacity-20 animate-[bounce_8s_infinite_reverse] select-none pointer-events-none drop-shadow-lg">🌋</div>
<div className="absolute top-40 -right-60 text-7xl md:text-8xl opacity-20 animate-[bounce_7s_infinite_delay-150ms] select-none pointer-events-none drop-shadow-lg">💧</div>
```

```jsx
// src/app/play/page.js:186,300 — current
<div className="absolute bottom-4 md:bottom-12 bg-white/90 px-3 py-1.5 md:px-8 md:py-4 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.05)] border-2 border-white backdrop-blur-md animate-[bounce_4s_infinite] flex items-center gap-2 md:gap-4">
<div className="text-7xl md:text-9xl mb-6 animate-bounce drop-shadow-xl">{discovery.emoji}</div>
```

Found-star and reagent hover loops are at `src/app/guide/page.js:139,200`.

## Target

- Landing page: retain exactly one ambient loop, the fire emoji using `animate-genz-float motion-loop`; remove animation from both gradients, volcano, and water.
- Play page: no perpetual ambient loop. State-change animation from fusion/modal remains sufficient.
- Guide page: no perpetual loop. Found stars are static; reagent emoji uses a short transform transition, not `animate-bounce`.

For reagent emoji use:

```txt
transition-transform duration-[var(--duration-press)] ease-[var(--ease-out)] group-hover:scale-105
```

## Repo conventions to follow

- Preserve the “Bubbly Exploration” illustrations and positions; only remove excess movement.
- Keep rare discovery celebration motion; remove only loops that continue indefinitely or restart on every hover.
- Use tokens from plan 008 for the remaining hover transform.

## Steps

1. In `src/app/page.js`, remove `animate-pulse` from both gradient blobs. Replace the fire bounce with `animate-genz-float motion-loop`; remove animation classes from volcano and water.
2. In `src/app/play/page.js`, remove perpetual animation from pot glow, hint, progress bar, discovery emoji, and library-card emoji. Preserve their static styling.
3. In `src/app/guide/page.js`, replace reagent `group-hover:animate-bounce` with the exact short transform pattern above.
4. Remove `animate-float` from found stars so their achievement badge remains still and readable.
5. Leave pronunciation playback animation for plan 012 because it communicates an active state rather than decoration.

## Boundaries

- Depends on plan 008; coordinate the progress-bar class with plan 007.
- Do NOT delete decorative elements.
- Do NOT remove fusion, modal, ingredient-entry, or recipe-reveal feedback.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run lint && npm run build` exits 0. Search `rg -n "infinite|animate-pulse|animate-bounce|animate-float" src/app`; remaining matches must be either the single landing ambient loop or the pronunciation state pending plan 012.
- **Feel check**: leave each route open for 20 seconds.
  - Landing has one slow floating accent and no competing pulses.
  - Play stays calm until the user acts.
  - Guide badges and reagent emoji do not loop.
  - Discovery remains the strongest visual event.
- **Done when**: each page has at most one ambient loop and `/play` has none while idle.
