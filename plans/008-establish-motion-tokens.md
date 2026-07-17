# 008 — Establish shared motion tokens

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: LOW
- **Category**: Cohesion and tokens
- **Estimated scope**: 4 files, about 35 replacements

## Problem

Motion values are hand-authored throughout the app: default 150ms transitions plus explicit 300, 400, 500, 550, 600, 700, and 1000ms durations and multiple unrelated cubic-beziers.

```css
/* src/app/globals.css:3-6,102-119 — current */
:root {
  --background: #ffffff;
  --foreground: #171717;
}
.animate-fusion { animation: fusion 1s forwards cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.animate-genz-pop { animation: genz-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
```

Examples of ad-hoc utilities appear at `src/app/page.js:27,46,97,106`, `src/app/play/page.js:151,171,212,231,263,298-300`, and `src/app/guide/page.js:156,219,232`.

## Target

Add the exact shared scale to `:root`:

```css
:root {
  --background: #ffffff;
  --foreground: #171717;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
  --duration-press: 160ms;
  --duration-tooltip: 160ms;
  --duration-ui: 200ms;
  --duration-celebration: 300ms;
}
```

Rules:

- Button/hover/press: `--duration-press` + `--ease-out`.
- Tooltip: `--duration-tooltip` + `--ease-out`.
- Enter/exit UI: `--duration-ui` + `--ease-out`.
- Moving/morphing state: `--duration-ui` + `--ease-in-out`.
- Rare discovery celebration: at most `--duration-celebration`.
- `--ease-drawer` is reserved for future drawer/sheet movement; do not apply it to centered modals.

## Repo conventions to follow

- Global visual variables already live in `src/app/globals.css:3-13`.
- Tailwind arbitrary values may consume CSS variables: `duration-[var(--duration-ui)] ease-[var(--ease-out)]`.
- Do not create a second token file for this small app.

## Steps

1. Add the exact tokens to `:root` in `src/app/globals.css`.
2. Replace explicit custom CSS timing/curves in app-owned animation helpers with the appropriate tokens without changing the target duration assigned by plans 002, 004, and 005.
3. Replace explicit Tailwind UI duration/easing values in `src/app/page.js`, `src/app/play/page.js`, and `src/app/guide/page.js` according to the mapping above.
4. Leave intentional marketing loops at their long seconds-based duration; only their easing should remain coherent.
5. Run searches for `duration-[0-9]`, `ease-[`, and `cubic-bezier` and document any remaining literal as either a long ambient loop or an intentional exception.

## Boundaries

- Execute this before plans 003, 006, 007, 010, 011, and 012.
- Do NOT change visual endpoints or component structure.
- Do NOT use the drawer curve for modals.
- Do NOT add Tailwind config or a dependency.

## Verification

- **Mechanical**: `npm run lint && npm run build` exits 0. The only cubic-bezier literals should be the three token definitions and the reduced-motion fallback if plan 001 is kept self-contained.
- **Feel check**: compare landing CTAs, ingredient cards, guide cards, modals, tooltip, and progress at 10% playback.
  - Similar interactions share timing and curve.
  - Press feedback completes in 160ms.
  - Routine UI finishes at 200ms.
  - Rare celebration never exceeds 300ms except a documented ambient loop.
- **Done when**: every non-looping motion value resolves to the shared scale or has an inline comment explaining its exception.
