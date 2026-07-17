# 005 — Give modals balanced enter and exit motion

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: MEDIUM
- **Category**: Interruptibility and physicality
- **Estimated scope**: 3 files, about 90 lines

## Problem

The discovery modal enters from `scale(0.3)` with a 500ms overshoot, while both settings and discovery modals unmount immediately on close. The result is an exaggerated entrance followed by a hard disappearance.

```css
/* src/app/globals.css:58-62 — current */
@keyframes bounce-in {
  0% { transform: scale(0.3); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); }
}
```

```jsx
// src/app/play/page.js:295-299 — current
function DiscoveryModal({ discovery, onClose, onPlay, playingCharacter }) {
  if (!discovery) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FFF9DB]/80 backdrop-blur-md animate-[fade-in_0.3s_ease-out]">
      <div className="bg-white rounded-[60px] p-8 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-[12px] border-[#B2F2BB] text-center max-w-sm md:max-w-md w-full animate-[bounce-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)] relative">
```

The settings modal is conditionally mounted at `src/app/page.js:41-80` and uses `animate-genz-pop` without an exit phase.

## Target

```css
@keyframes modal-enter {
  from { opacity: 0; transform: translateY(8px) scale(0.94); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes modal-exit {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(4px) scale(0.97); }
}
@keyframes backdrop-enter { from { opacity: 0; } to { opacity: 1; } }
@keyframes backdrop-exit { from { opacity: 1; } to { opacity: 0; } }

.animate-modal-enter { animation: modal-enter 300ms cubic-bezier(0.23, 1, 0.32, 1) both; }
.animate-modal-exit { animation: modal-exit 200ms cubic-bezier(0.23, 1, 0.32, 1) both; }
.animate-backdrop-enter { animation: backdrop-enter 200ms cubic-bezier(0.23, 1, 0.32, 1) both; }
.animate-backdrop-exit { animation: backdrop-exit 160ms cubic-bezier(0.23, 1, 0.32, 1) both; }
```

Use explicit `open | closing | closed` phases. A close request sets `closing`; a single 200ms timer performs the unmount. Repeated close requests during `closing` do nothing.

## Repo conventions to follow

- Keep modal keyframes in `src/app/globals.css` with existing animation helpers.
- Keep modal state local to each page/component; do not introduce global state.
- Preserve centered transform origin; centered modals are intentionally exempt from trigger-origin behavior.

## Steps

1. Add the exact four keyframes and four helper classes to `src/app/globals.css`.
2. In `src/app/page.js`, replace `settingsOpen` with a phase state initialized to `closed`, plus a timeout ref cleaned up on unmount.
3. Opening settings sets phase to `open`. Closing sets `closing`, then `closed` after 200ms. Render while phase is not `closed`.
4. Apply `animate-backdrop-enter`/`animate-backdrop-exit` to the settings backdrop and `animate-modal-enter motion-feedback`/`animate-modal-exit motion-feedback` to its panel according to phase.
5. In `DiscoveryModal`, add local `closing` state and a cleaned timeout ref. Its close button starts exit; call the parent `onClose` only after 200ms.
6. Apply the same backdrop and panel phase classes to discovery modal. Remove the old arbitrary `fade-in` and `bounce-in` classes.
7. Prevent duplicate timers and clear pending timers during unmount.

## Boundaries

- Do NOT change modal content, focus styling, reset behavior, recipe behavior, or audio controls.
- Do NOT add a presence/motion dependency.
- Do NOT change centered transform origin.
- If modal ownership has drifted from commit `a72402f`, STOP and report.

## Verification

- **Mechanical**: `npm run lint && npm run build` exits 0. React lint must report no effect/ref cleanup issues.
- **Feel check**: open and close both modals repeatedly, including closing before the 300ms entrance finishes.
  - Entry begins at scale 0.94 and completes in 300ms without a large overshoot.
  - Exit begins from the current visual state and unmounts after 200ms.
  - Repeated close clicks do not create duplicate timers or errors.
  - At 10% speed, backdrop exit finishes before or with panel exit, never after a blank panel disappears.
  - Reduced motion keeps only the short fade from plan 001.
- **Done when**: neither modal snaps out, no modal starts below scale 0.9, and lifecycle cleanup is deterministic.
