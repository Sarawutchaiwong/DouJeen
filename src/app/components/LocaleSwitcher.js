'use client';

import { useTransition } from 'react';
import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { setLocaleCookie } from '../../i18n/locale';

// Toggle EN <-> TH. Persists via server action, then refreshes so server
// components re-read the cookie and re-render in the new locale.
export default function LocaleSwitcher({ className = '' }) {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = locale === 'en' ? 'th' : 'en';
    startTransition(async () => {
      await setLocaleCookie(next);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={t('label')}
      className={`lift-control inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--lab-line-strong)] bg-[var(--lab-surface)] px-3 text-xs font-black text-[var(--lab-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 disabled:opacity-50 sm:px-4 ${className}`}
    >
      <Globe aria-hidden="true" strokeWidth={2.5} className="h-4 w-4 text-[var(--lab-action)]" />
      {t('switchTo')}
    </button>
  );
}
