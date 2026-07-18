'use client';

export default function PronunciationButton({
  character,
  isPlaying,
  onPlay,
  className = '',
}) {
  const playbackLabel = isPlaying
    ? `Playing ${character} pronunciation`
    : `Listen to ${character} pronunciation`;

  return (
    <button
      type="button"
      draggable={false}
      onClick={(event) => {
        event.stopPropagation();
        onPlay(character);
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onDragStart={(event) => event.preventDefault()}
      className={`lift-control inline-flex items-center justify-center rounded-full border border-[var(--lab-surface)] bg-[var(--lab-action)] text-[var(--lab-surface)] shadow-[0_7px_18px_var(--lab-action-shadow)] hover:bg-[var(--lab-action-hover)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 focus-visible:ring-offset-2 ${className}`}
      aria-label={playbackLabel}
      aria-busy={isPlaying}
      title={playbackLabel}
    >
      <svg
        aria-hidden="true"
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
        <path className={isPlaying ? 'sound-wave-near' : ''} d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path className={isPlaying ? 'sound-wave-far' : ''} d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    </button>
  );
}
