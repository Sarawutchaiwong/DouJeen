import Link from 'next/link';

export default function BrandMark({ compact = false, className = '' }) {
  return (
    <Link
      href="/"
      aria-label="DouJeen home"
      className={`group inline-flex min-h-11 items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 ${className}`}
    >
      <span className="brand-glyph transition-transform duration-[var(--duration-ui)] ease-[var(--ease-out)] group-hover:-rotate-3" lang="zh-Hans" aria-hidden="true">汉</span>
      <span className="flex flex-col leading-none">
        <span className={`${compact ? 'text-base' : 'text-lg'} font-black tracking-[-0.04em] text-[var(--lab-ink)]`}>DouJeen</span>
        {!compact && <span className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--lab-muted)]">Word laboratory</span>}
      </span>
    </Link>
  );
}
