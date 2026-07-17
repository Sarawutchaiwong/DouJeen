# 011 — Make recipe reveals reversible

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: LOW
- **Category**: Missed opportunity and interruptibility
- **Estimated scope**: 2 files, about 45 lines

## Problem

Recipe details mount with `fade-in`, but hiding a card or pressing RESET unmounts them immediately. Rapid toggles restart keyframes rather than retargeting from the current visual state.

```jsx
// src/app/guide/page.js:218-232 — current
{isRevealed || isFound ? (
  <div className="flex items-center gap-2 animate-[fade-in_0.3s_ease-out]">
) : (
  <div className="bg-[#FFD8A8]/20 text-[#FFD8A8] px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-[#FFD8A8]/50 group-hover:bg-[#FFD8A8]/30 transition-colors">
)}

{(isRevealed || isFound) && (
  <div className="space-y-3 animate-[fade-in_0.4s_ease-out]">
)}
```

## Target

Keep both summary states mounted and use interruptible transitions. Use a grid-row wrapper for details so the layout opens/closes without animating explicit height.

```jsx
<div className="grid">
  <div className={isOpen
    ? 'col-start-1 row-start-1 opacity-100 translate-y-0'
    : 'pointer-events-none col-start-1 row-start-1 opacity-0 translate-y-1'}>
    {/* result */}
  </div>
</div>

<div className={`grid transition-[grid-template-rows,opacity] duration-[var(--duration-ui)] ease-[var(--ease-out)] ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
  <div className="min-h-0 overflow-hidden">{/* details */}</div>
</div>
```

Both summary children use `transition-[transform,opacity]` for exactly 200ms. Under reduced motion, remove translation and grid-row transition; retain opacity for 160ms.

## Repo conventions to follow

- Keep reveal state in the existing `revealed` object.
- `isFound` continues to force content visible.
- Use tokens from plan 008 and `motion-feedback` behavior from plan 001.

## Steps

1. Introduce `const isOpen = isRevealed || isFound` inside the recipe map.
2. Replace the summary conditional with two mounted, overlapping children whose opacity/translate transitions are driven by `isOpen`.
3. Replace conditional detail mounting with the exact grid-row wrapper pattern.
4. Set `aria-hidden={!isOpen}` and prevent hidden summary/details from receiving pointer events.
5. Remove both arbitrary `fade-in` keyframe classes from the recipe card.
6. Add reduced-motion classes/media behavior so translation and row movement are dropped while the 160ms opacity transition remains.

## Boundaries

- Depends on plans 001 and 008.
- Do NOT change search, categories, found-state semantics, copy, or recipe data.
- Do NOT use JS height measurements.
- Do NOT add dependencies.

## Verification

- **Mechanical**: `npm run lint && npm run build` exits 0.
- **Feel check**: toggle one card rapidly, use SHOW ALL, then RESET at 10% playback.
  - Motion retargets from its current state and never restarts from zero.
  - No content overlaps visibly or remains keyboard-accessible while hidden.
  - Details open/close in 200ms without a hard layout jump.
  - Reduced motion uses only opacity and no vertical/layout movement.
- **Done when**: reveal and hide are symmetric, interruptible, accessible, and free of explicit height animation.
