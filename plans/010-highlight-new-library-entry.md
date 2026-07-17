# 010 — Highlight a newly collected character

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 2 files, about 35 lines

## Problem

A successful recipe appends its result to the library behind the discovery modal. After closing the modal, the new card has no spatial or visual connection to the celebration.

```js
// src/app/play/page.js:83-88 — current
if (match) {
  setDiscovery(match);
  if (!library.includes(match.result)) {
    setLibrary(prev => [...prev, match.result]);
  }
  setHint(getRandomHint());
}
```

```jsx
// src/app/play/page.js:218-235 — current
{library.map((char, index) => {
  const data = getData(char);
  return (
    <div
      key={char}
      draggable
      onDragStart={(e) => handleDragStart(e, char)}
      onClick={() => selectItem(char)}
      className={`
        aspect-square bg-white rounded-[28px] md:rounded-[36px]
        shadow-[0_8px_0_#efefef] hover:shadow-[0_4px_0_#efefef]
        flex flex-col items-center justify-center cursor-grab active:cursor-grabbing
        hover:scale-110 hover:-translate-y-2 hover:rotate-2 transition-all duration-300
        border-[3px] md:border-[5px] ${index % 2 === 0 ? 'border-[#74C0FC]' : 'border-[#FFD8A8]'}
        group relative p-1 select-none overflow-visible touch-manipulation
      `}
    >
```

## Target

Track only a genuinely new result as `newlyCollectedChar`. After the discovery modal closes, its card performs one 300ms entry accent and is scrolled into view if necessary.

```css
@keyframes collection-arrive {
  from { opacity: 0; transform: translateY(8px) scale(0.94); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-collection-arrive {
  animation: collection-arrive 300ms cubic-bezier(0.23, 1, 0.32, 1) both;
}
```

Clear the highlight after 1200ms. Under reduced motion, keep only the 160ms fade.

## Repo conventions to follow

- Library state remains in `GamePage`.
- Card refs may use a `Map` held in `useRef`; do not query by interpolated CSS selector.
- Use existing mint/sky-blue border and ring colors; do not add a new palette color.

## Steps

1. Add `newlyCollectedChar` state, a card-ref map, and one cleanup-safe 1200ms timer.
2. Set `newlyCollectedChar` only inside the branch that appends a character not already in `library`.
3. When the discovery modal finishes closing, call `scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' })` for that card. Detect reduced motion with `window.matchMedia('(prefers-reduced-motion: reduce)')` and clean its listener if retained.
4. Apply `animate-collection-arrive motion-feedback` plus a temporary mint ring only to the matching card.
5. Clear the highlighted state after 1200ms and clean the timer on unmount.
6. Add the exact keyframe/helper to `src/app/globals.css`.

## Boundaries

- Depends on plans 001, 005, and 008.
- Do NOT reorder the library or alter persistence.
- Do NOT replay the accent for characters already unlocked.
- Do NOT force smooth scrolling under reduced motion.

## Verification

- **Mechanical**: `npm run lint && npm run build` exits 0.
- **Feel check**: discover a new result with the collection panel both visible and scrolled away.
  - Closing the modal reveals/scrolls to the new card.
  - The accent runs once for 300ms and the ring clears after 1200ms.
  - Rediscovering the same recipe does not replay it.
  - iPad/tablet scrolling remains contained inside the collection panel.
  - Reduced motion scrolls instantly and fades without transform.
- **Done when**: a new collection item is easy to locate without stealing interaction or replaying on old items.
