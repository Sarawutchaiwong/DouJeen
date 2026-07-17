# 012 — Clarify pronunciation playback state

- **Status**: TODO
- **Commit**: a72402f
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 2 files, about 35 lines

## Problem

While audio plays, the speaker icon uses a generic opacity pulse. Pulse is ambiguous, continues for the entire clip, and provides no clear relationship to sound output.

```jsx
// src/app/components/PronunciationButton.js:24-40 — current
<svg
  aria-hidden="true"
  className={isPlaying ? 'animate-pulse' : ''}
  xmlns="http://www.w3.org/2000/svg"
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="3"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M11 5 6 9H2v6h4l5 4V5Z" />
  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
  <path d="M18.5 5.5a9 9 0 0 1 0 13" />
</svg>
```

## Target

Keep the speaker body fixed. Animate the two wave paths with staggered opacity only while playing:

```css
@keyframes sound-wave {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
.sound-wave-near { animation: sound-wave 800ms linear infinite; }
.sound-wave-far { animation: sound-wave 800ms linear 80ms infinite; }

@media (prefers-reduced-motion: reduce) {
  .sound-wave-near,
  .sound-wave-far { animation: none; opacity: 1; }
}
```

When idle, both paths have opacity 1 and no animation. Keep `aria-busy={isPlaying}` and update the title/label to distinguish `Playing …` from `Listen to …`.

## Repo conventions to follow

- The button remains reusable and controlled through `isPlaying`.
- Put shared keyframes in `src/app/globals.css`.
- Constant state indication uses linear easing; it does not move, scale, or rotate.

## Steps

1. Add the exact `sound-wave` keyframe/classes and reduced-motion override to `src/app/globals.css`.
2. In `PronunciationButton`, remove `animate-pulse` from the root SVG.
3. Give the near and far wave `<path>` elements conditional classes `sound-wave-near` and `sound-wave-far` only when `isPlaying`.
4. Set `aria-label` and `title` to `Playing ${character} pronunciation` while playing, otherwise retain `Listen to ${character} pronunciation`.
5. Do not alter `usePronunciation` playback or interruption behavior.

## Boundaries

- Execute after plan 006.
- Do NOT animate the whole button or speaker body during playback.
- Do NOT add audio visualization APIs or dependencies.
- Do NOT change the TTS request path.

## Verification

- **Mechanical**: `npm run lint && npm run build` exits 0; `rg -n "animate-pulse" src/app/components/PronunciationButton.js` returns no matches.
- **Feel check**: play several characters and interrupt one by starting another.
  - Only the active button displays wave opacity motion.
  - The first button stops immediately when another begins.
  - Waves use an 80ms stagger and linear 800ms cycle.
  - Reduced motion shows static full-opacity waves while preserving `aria-busy` and label changes.
- **Done when**: playback state is unmistakable without pulsing or positional motion.
