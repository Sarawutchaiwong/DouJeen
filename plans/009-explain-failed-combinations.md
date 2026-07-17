# 009 — Explain failed combinations

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: MEDIUM
- **Category**: Missed opportunity
- **Estimated scope**: 2 files, about 45 lines

## Problem

An invalid pair follows the same wait as a successful pair, then silently clears. The user cannot tell whether the tap/drop registered or why no discovery appeared.

```js
// src/app/play/page.js:82-92 — current
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
```

There is no failed-combination status in the JSX at `src/app/play/page.js:137-193`.

## Target

After the 300ms fusion from plan 002, invalid combinations show a concise `No reaction — try another pair` status for 1600ms. Use a one-shot, compositor-only nudge rather than an infinite shake:

```css
@keyframes no-reaction {
  0%, 100% { transform: translateX(0); }
  35% { transform: translateX(-4px); }
  70% { transform: translateX(4px); }
}
.animate-no-reaction {
  animation: no-reaction 200ms cubic-bezier(0.77, 0, 0.175, 1) both;
}
```

Under reduced motion, use only `reduced-fade 160ms cubic-bezier(0.23, 1, 0.32, 1)`.

## Repo conventions to follow

- Use local React state in `GamePage`, like `pronunciationError` displayed at `src/app/play/page.js:276-283`.
- Put the keyframe in `src/app/globals.css`.
- Keep copy concise, encouraging, and non-competitive.

## Steps

1. Add `reactionMessage` state and a cleanup-safe timeout ref to `GamePage`.
2. Clear any previous message when a new combination starts.
3. In the invalid branch after the plan-002 fusion completes, set the exact copy and schedule removal after 1600ms.
4. Render the message near the alchemy zone, separate from pronunciation errors, with `role="status"` and `aria-live="polite"`.
5. Add the exact `no-reaction` keyframe/helper and apply `motion-feedback` so plan 001 supplies the reduced behavior.
6. Clear the message timer on component unmount and before scheduling another.

## Boundaries

- Depends on plans 001, 002, and 008.
- Do NOT change recipe matching, hints, or discovery success behavior.
- Do NOT use red/error styling; this is exploratory feedback, not failure punishment.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run lint && npm run build` exits 0; no timer cleanup lint warnings.
- **Feel check**: try multiple invalid pairs rapidly and then a valid pair.
  - One message appears after 300ms and remains for 1600ms.
  - New attempts replace the prior timer; messages never stack.
  - The nudge moves only 4px each direction and runs once.
  - Reduced motion uses a fade only.
- **Done when**: every invalid combination receives visible and screen-reader feedback without delaying the next attempt.
