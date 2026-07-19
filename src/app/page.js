'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import BrandMark from './components/BrandMark';
import LocaleSwitcher from './components/LocaleSwitcher';
import { useDialogFocus } from './useDialogFocus';

export default function LandingPage() {
  const t = useTranslations('Home');
  const tNav = useTranslations('Nav');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsExiting, setSettingsExiting] = useState(false);
  const [resetConfirming, setResetConfirming] = useState(false);
  const settingsDialogRef = useRef(null);
  const settingsCloseRef = useRef(null);
  const resetTriggerRef = useRef(null);
  const keepDiscoveriesRef = useRef(null);
  const settingsCloseTimerRef = useRef(null);

  const openSettings = () => {
    window.clearTimeout(settingsCloseTimerRef.current);
    setSettingsExiting(false);
    setResetConfirming(false);
    setSettingsOpen(true);
  };

  const closeSettings = useCallback(() => {
    window.clearTimeout(settingsCloseTimerRef.current);
    setSettingsExiting(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    settingsCloseTimerRef.current = window.setTimeout(() => {
      setSettingsOpen(false);
      setSettingsExiting(false);
      setResetConfirming(false);
      settingsCloseTimerRef.current = null;
    }, reducedMotion ? 0 : 200);
  }, []);

  useEffect(() => () => window.clearTimeout(settingsCloseTimerRef.current), []);

  useDialogFocus({
    isOpen: settingsOpen,
    dialogRef: settingsDialogRef,
    initialFocusRef: settingsCloseRef,
    onClose: closeSettings,
  });

  useEffect(() => {
    if (!settingsOpen || settingsExiting || !resetConfirming) return undefined;

    const focusFrame = window.requestAnimationFrame(() => keepDiscoveriesRef.current?.focus());
    return () => window.cancelAnimationFrame(focusFrame);
  }, [resetConfirming, settingsExiting, settingsOpen]);

  const cancelReset = () => {
    setResetConfirming(false);
    window.requestAnimationFrame(() => resetTriggerRef.current?.focus());
  };

  const handleReset = () => {
    localStorage.removeItem('doujeen_progress');
    localStorage.removeItem('doujeen_progress_v2');
    window.location.reload();
  };

  return (
    <main className="aurora-canvas min-h-screen overflow-hidden px-4 pb-8 sm:px-7 lg:px-10">
      <div inert={settingsOpen ? true : undefined} aria-hidden={settingsOpen ? 'true' : undefined}>
        <header className="relative z-30 mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4">
        <BrandMark />
        <nav aria-label="Primary navigation" className="flex items-center gap-1 rounded-full border border-[var(--lab-line)] bg-[var(--lab-surface-60)] p-1.5 sm:gap-2">
          <Link href="/guide" className="lift-control hidden min-h-11 items-center rounded-full px-4 text-sm font-bold text-[var(--lab-ink-soft)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 sm:inline-flex">
            {tNav('notebook')}
          </Link>
          <LocaleSwitcher />
          <Link href="/play" className="lift-control inline-flex min-h-11 items-center rounded-full bg-[var(--lab-action)] px-5 text-sm font-black text-[var(--lab-surface)] shadow-[0_8px_22px_var(--lab-action-shadow)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">
            {tNav('openCanvas')}
          </Link>
          <button
            type="button"
            onClick={openSettings}
            className="lift-control inline-grid h-11 w-11 place-items-center rounded-full text-[var(--lab-muted)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25"
            aria-label={t('openSettings')}
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
          >
            <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.86 2.86-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.55v-.1A1.7 1.7 0 0 0 8.45 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.86-2.86.06-.06A1.7 1.7 0 0 0 4.05 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.2V9.55h.15A1.7 1.7 0 0 0 4.05 8a1.7 1.7 0 0 0-.34-1.88l-.06-.06L6.51 3.2l.06.06A1.7 1.7 0 0 0 8.45 3.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V1.8h4.05v.1A1.7 1.7 0 0 0 15 3.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.86 2.86-.06.06A1.7 1.7 0 0 0 19.4 8a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4.05h-.1A1.7 1.7 0 0 0 19.4 15Z" />
            </svg>
          </button>
        </nav>
        </header>

        <section className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-12 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:py-14">
        <div className="relative z-10 max-w-2xl animate-hero-reveal">
          <div className="eyebrow mb-7 flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--lab-action)] shadow-[0_0_0_6px_var(--lab-pink)]" aria-hidden="true" />
            {t('eyebrow')}
          </div>
          <h1 className="text-[clamp(3.9rem,11vw,7.8rem)] font-black leading-[0.82]">
            <span className="hanzi-text block text-[0.42em] font-black tracking-[-0.06em] text-[var(--lab-ink)]" lang="zh-Hans">中文合成实验室</span>
            <span className="sticker-wordmark mt-5 block pb-[0.18em]">DouJeen</span>
          </h1>
          <p className="mt-7 max-w-[35rem] text-lg font-medium leading-8 text-[var(--lab-ink-soft)] sm:text-xl">
            {t('lead')}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/play" className="lift-control inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--lab-action)] px-8 text-base font-black text-[var(--lab-surface)] shadow-[0_12px_28px_var(--lab-action-shadow)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">
              {t('ctaStart')}
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/guide" className="lift-control inline-flex min-h-14 items-center justify-center rounded-full border border-[var(--lab-line-strong)] bg-[var(--lab-surface-60)] px-8 text-base font-black text-[var(--lab-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">
              {t('ctaNotebook')}
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-2 text-sm font-bold text-[var(--lab-muted)]" aria-label="Game features">
            <li className="pastel-pill rounded-full px-4 py-2">{t('featStarters')}</li>
            <li className="pastel-pill rounded-full px-4 py-2">{t('featTap')}</li>
            <li className="pastel-pill rounded-full px-4 py-2">{t('featHidden')}</li>
          </ul>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[38rem] animate-hero-reveal [animation-delay:120ms]" aria-label="Example: water plus earth makes clay">
          <div className="orbit-line inset-[4%] animate-orbit-drift" aria-hidden="true">
            <span className="absolute left-[13%] top-[4%] h-3 w-3 rounded-full bg-[var(--lab-action)] shadow-[0_0_0_7px_var(--lab-pink)]" />
          </div>
          <div className="orbit-line inset-[17%] [animation:orbit-drift_32s_linear_infinite_reverse]" aria-hidden="true">
            <span className="absolute bottom-[5%] right-[12%] h-2.5 w-2.5 rounded-full bg-[var(--lab-mint-ink)] shadow-[0_0_0_7px_var(--lab-mint)]" />
          </div>

          <div className="surface-panel absolute inset-[23%_8%] flex flex-col items-center justify-center rounded-[3rem] px-5 text-center sm:inset-[22%_10%]">
            <span className="eyebrow">{t('groundedReaction')}</span>
            <div className="mt-7 flex items-center justify-center gap-3 sm:gap-5">
              <span className="hanzi-text inline-grid h-20 w-20 place-items-center rounded-[1.7rem] border border-[var(--lab-line-strong)] bg-[var(--lab-sky)] text-4xl font-black text-[var(--lab-ink)] shadow-[6px_7px_0_var(--lab-surface-soft)] sm:h-24 sm:w-24 sm:text-5xl" lang="zh-Hans">水</span>
              <span className="text-2xl font-light text-[var(--lab-muted)]" aria-hidden="true">+</span>
              <span className="hanzi-text inline-grid h-20 w-20 place-items-center rounded-[1.7rem] border border-[var(--lab-line-strong)] bg-[var(--lab-peach)] text-4xl font-black text-[var(--lab-peach-ink)] shadow-[6px_7px_0_var(--lab-surface-soft)] sm:h-24 sm:w-24 sm:text-5xl" lang="zh-Hans">土</span>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-full bg-[var(--lab-lilac)] px-5 py-3 text-[var(--lab-ink)]">
              <span className="hanzi-text text-2xl font-black" lang="zh-Hans">黏土</span>
              <span className="h-5 w-px bg-[var(--lab-line-strong)]" aria-hidden="true" />
              <span className="text-sm font-black">nián tǔ · clay</span>
            </div>
          </div>

          <span className="absolute right-[2%] top-[20%] rotate-6 rounded-full bg-[var(--lab-sky)] px-4 py-2 text-sm font-black text-[var(--lab-ink)] shadow-[5px_5px_0_var(--lab-surface)]">{t('listen')}</span>
          <span className="absolute bottom-[17%] left-[1%] -rotate-6 rounded-full bg-[var(--lab-peach)] px-4 py-2 text-sm font-black text-[var(--lab-peach-ink)] shadow-[5px_5px_0_var(--lab-surface)]">{t('groundedReactions')}</span>
        </div>
        </section>
      </div>

      {settingsOpen && (
        <div
          className={`fixed inset-x-0 top-0 z-[60] flex h-[100dvh] items-center justify-center overflow-y-auto bg-[var(--lab-overlay)] p-4 backdrop-blur-[6px] sm:p-6 ${settingsExiting ? 'animate-backdrop-exit pointer-events-none' : 'animate-backdrop-enter'}`}
          onClick={closeSettings}
        >
          <div
            ref={settingsDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            aria-describedby="settings-description"
            tabIndex={-1}
            className={`surface-panel relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[2rem] p-5 sm:max-h-[calc(100dvh-3rem)] sm:p-7 ${settingsExiting ? 'animate-modal-exit' : 'animate-modal-enter'}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button ref={settingsCloseRef} type="button" onClick={closeSettings} className="lift-control absolute right-4 top-4 inline-grid h-11 w-11 place-items-center rounded-full bg-[var(--lab-surface-soft)] text-[var(--lab-muted)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25" aria-label={resetConfirming ? t('closeReset') : t('closeSettings')}>×</button>

            {resetConfirming ? (
              <div>
                <div className="flex items-center gap-4 pr-12">
                  <span className="inline-grid h-14 w-14 shrink-0 place-items-center rounded-[1.25rem] bg-[var(--lab-peach)] text-[var(--lab-danger)] shadow-[4px_5px_0_var(--lab-surface-soft)]" aria-hidden="true">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                      <path d="M3 3v5h5" />
                    </svg>
                  </span>
                  <div>
                    <div className="eyebrow">{t('resetEyebrow')}</div>
                    <h2 id="settings-title" className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--lab-ink)]">{t('resetTitle')}</h2>
                  </div>
                </div>
                <p id="settings-description" className="mt-5 max-w-sm text-base leading-7 text-[var(--lab-muted)]">{t('resetDesc')}</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button ref={keepDiscoveriesRef} type="button" onClick={cancelReset} className="lift-control min-h-12 rounded-full border border-[var(--lab-line-strong)] bg-[var(--lab-surface)] px-5 font-black text-[var(--lab-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">{t('keepDiscoveries')}</button>
                  <button type="button" onClick={handleReset} className="lift-control min-h-12 rounded-full bg-[var(--lab-danger)] px-5 font-black text-[var(--lab-surface)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-danger)]/25">{t('resetEverything')}</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="eyebrow">{t('localProgress')}</div>
                <h2 id="settings-title" className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--lab-ink)]">{t('settings')}</h2>
                <p id="settings-description" className="mt-3 max-w-sm text-base leading-7 text-[var(--lab-muted)]">{t('settingsDesc')}</p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={closeSettings} className="lift-control min-h-12 rounded-full border border-[var(--lab-line-strong)] bg-[var(--lab-surface)] px-5 font-black text-[var(--lab-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">{t('keepProgress')}</button>
                  <button ref={resetTriggerRef} type="button" onClick={() => setResetConfirming(true)} className="lift-control min-h-12 rounded-full bg-[var(--lab-danger)] px-5 font-black text-[var(--lab-surface)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-danger)]/25">{t('resetProgress')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
