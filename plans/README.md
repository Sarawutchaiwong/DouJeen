# DouJeen animation improvement plans

Audit source commit: `a72402f`

These plans are implementation specifications only. Source code has not been changed. Every executor must stop if the cited code has drifted from the stamped commit instead of improvising. Changes made by a dependency listed in the table are the only expected drift: in that case, use the dependency plan's documented target as the current excerpt and stop for any additional mismatch.

## Status

| # | Plan | Severity | Status | Dependencies |
| --- | --- | --- | --- | --- |
| 001 | [Respect reduced-motion preferences](001-respect-reduced-motion.md) | HIGH | TODO | None |
| 002 | [Shorten the combination feedback loop](002-shorten-combination-feedback.md) | HIGH | TODO | 008 recommended first |
| 003 | [Replace broad transition-all declarations](003-replace-transition-all.md) | MEDIUM | TODO | 008 |
| 004 | [Repair broken animation declarations](004-repair-broken-keyframes.md) | MEDIUM | TODO | 001 |
| 005 | [Give modals balanced enter and exit motion](005-make-modals-interruptible.md) | MEDIUM | TODO | 001, 008 |
| 006 | [Calm perpetual decorative motion](006-calm-perpetual-motion.md) | MEDIUM | TODO | 008; coordinate with 007 |
| 007 | [Animate progress with transforms](007-composite-progress-bar.md) | MEDIUM | TODO | 008 |
| 008 | [Establish shared motion tokens](008-establish-motion-tokens.md) | LOW | TODO | None |
| 009 | [Explain failed combinations](009-explain-failed-combinations.md) | MEDIUM | TODO | 001, 002, 008 |
| 010 | [Highlight a newly collected character](010-highlight-new-library-entry.md) | LOW | TODO | 001, 005, 008 |
| 011 | [Make recipe reveals reversible](011-make-recipe-reveal-reversible.md) | LOW | TODO | 001, 008 |
| 012 | [Clarify pronunciation playback state](012-clarify-pronunciation-playback.md) | LOW | TODO | 006 |

## Recommended execution order

1. **008** — establish the shared token vocabulary used by later plans.
2. **001** — add the accessibility contract before introducing or changing motion.
3. **002**, then **009** — repair the core combine timing, then add invalid-pair feedback against the new 300ms lifecycle.
4. **004** — restore the missing ingredient entry and valid landing declaration.
5. **003**, **007**, then **006** — narrow transitions, convert progress to transform, and remove excess loops without editing the same progress classes twice.
6. **005**, then **010** — add deterministic modal exit and use its close completion to reveal the new library card.
7. **011** — make guide reveal/hide reversible.
8. **012** — replace the final state-specific pulse after ambient pulse cleanup.

## Integration checkpoints

- After 001–004: run lint/build and test normal/reduced motion on `/`, `/play`, and `/guide`.
- After 003/006/007: `rg -n "transition-all|duration-1000|animate-pulse|animate-bounce|animate-float" src/app` must contain only documented intentional exceptions.
- After 005/009/010: stress-test timers by opening/closing modals and combining repeatedly; no stale timeout may update an unmounted component.
- Final: test mouse, keyboard, phone, and iPad/tablet. Use the DevTools Animations panel at 10% playback and the Rendering panel's reduced-motion emulation.
