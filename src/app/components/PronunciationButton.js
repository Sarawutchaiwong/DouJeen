'use client';

export default function PronunciationButton({
  character,
  isPlaying,
  onPlay,
  className = '',
}) {
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
      className={`inline-flex items-center justify-center rounded-full border-2 border-white bg-[#74C0FC] text-white shadow-lg transition hover:scale-110 hover:bg-[#5da9e6] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#74C0FC]/30 active:scale-95 ${className}`}
      aria-label={`Listen to ${character} pronunciation`}
      aria-busy={isPlaying}
      title={`Listen to ${character}`}
    >
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
    </button>
  );
}
