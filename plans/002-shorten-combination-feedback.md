# 002 — Shorten the combination feedback loop

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: HIGH
- **Category**: Purpose, frequency, and physicality
- **Estimated scope**: 2 files, about 25 lines

## Problem

Every two-character combination blocks input for one second. Its keyframe grows to 1.3, uses a paint-heavy filter, then collapses to `scale(0)`. This affects the highest-frequency product loop.

```js
// src/app/play/page.js:76-92 — current
if (newActive.length === 2) {
  setIsCombining(true);
  const combo1 = newActive[0].char + newActive[1].char;
  const combo2 = newActive[1].char + newActive[0].char;
  const match = RECIPES[combo1] || RECIPES[combo2];

  setTimeout(() => {
    if (match) {
      setDiscovery(match);
      if (!library.includes(match.result)) {
        setLibrary(prev => [...prev, match.result]);
      }
      setHint(getRandomHint()); // New hint after discovery
    }
    setActiveItems([]);
    setIsCombining(false);
  }, 1000);
}
```

```css
/* src/app/globals.css:50-55,102-104 — current */
@keyframes fusion {
  0% { transform: scale(1); }
  20% { transform: scale(1.1) rotate(5deg); }
  40% { transform: scale(0.9) rotate(-5deg); }
  60% { transform: scale(1.3); filter: brightness(1.2); }
  100% { transform: scale(0); opacity: 0; }
}
.animate-fusion { animation: fusion 1s forwards cubic-bezier(0.68, -0.55, 0.265, 1.55); }
```

## Target

Use a 300ms compositor-only fusion and release the state lock at the same time.

```css
@keyframes fusion {
  0% { transform: scale(1) rotate(0); opacity: 1; }
  45% { transform: scale(0.97) rotate(-2deg); opacity: 1; }
  70% { transform: scale(1.04) rotate(2deg); opacity: 1; }
  100% { transform: scale(0.96) rotate(0); opacity: 0; }
}

.animate-fusion {
  animation: fusion 300ms cubic-bezier(0.77, 0, 0.175, 1) both;
}
```

The JS timer must use one named constant: `const COMBINATION_DURATION_MS = 300;`.

## Repo conventions to follow

- Keep custom keyframes in `src/app/globals.css`.
- Keep combination state resolution in `processItems` at `src/app/play/page.js:73-94`.
- Preserve the deliberate playful bounce, but keep scale near the physical range instead of creating/removing matter from zero.

## Steps

1. Add `const COMBINATION_DURATION_MS = 300;` near `getRandomHint` in `src/app/play/page.js`.
2. Replace the literal `1000` timer delay with `COMBINATION_DURATION_MS`.
3. Replace the `fusion` keyframe and `.animate-fusion` declaration with the exact target CSS above.
4. Confirm that no `filter`, `width`, `height`, or layout property is animated by fusion.
5. Leave result semantics unchanged: success opens the discovery modal, failure clears the ingredients.

## Boundaries

- Do NOT add failure messaging here; that belongs to plan 009.
- Do NOT alter recipe resolution or localStorage behavior.
- Do NOT add a dependency.
- If the timeout or fusion keyframe has drifted since `a72402f`, STOP and report.

## Verification

- **Mechanical**: `npm run lint && npm run build` exits 0. Search with `rg -n "1000|filter: brightness|scale\\(0\\)" src/app/play src/app/globals.css`; none of those values may remain in the fusion path.
- **Feel check**: at 10% playback speed, combine valid and invalid pairs repeatedly.
  - Ingredients compress slightly, rebound once, and fade without collapsing to zero.
  - The result resolves after 300ms, not one second.
  - The animation uses only transform and opacity.
  - Reduced-motion behavior from plan 001 remains an opacity-only response.
- **Done when**: the JS lock and visual duration are both exactly 300ms and rapid consecutive combinations do not feel delayed.
