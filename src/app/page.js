'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useDialogFocus } from './useDialogFocus';

export default function LandingPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsExiting, setSettingsExiting] = useState(false);
  const settingsDialogRef = useRef(null);
  const settingsCloseRef = useRef(null);
  const settingsCloseTimerRef = useRef(null);

  const openSettings = () => {
    window.clearTimeout(settingsCloseTimerRef.current);
    setSettingsExiting(false);
    setSettingsOpen(true);
  };

  const closeSettings = useCallback(() => {
    window.clearTimeout(settingsCloseTimerRef.current);
    setSettingsExiting(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    settingsCloseTimerRef.current = window.setTimeout(() => {
      setSettingsOpen(false);
      setSettingsExiting(false);
      settingsCloseTimerRef.current = null;
    }, reducedMotion ? 0 : 200);
  }, []);

  useEffect(() => () => window.clearTimeout(settingsCloseTimerRef.current), []);

  useDialogFocus({
    isOpen: settingsOpen && !settingsExiting,
    dialogRef: settingsDialogRef,
    initialFocusRef: settingsCloseRef,
    onClose: closeSettings,
  });

  const handleReset = () => {
    const confirmation = window.confirm(
      'This action will permanently erase your saved progress. Do you wish to proceed?'
    );
    if (!confirmation) return;
    localStorage.removeItem('doujeen_progress');
    window.location.reload();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[var(--lab-cream)] p-4 sm:p-8 font-sans overflow-x-hidden relative">
      <div aria-hidden="true" className="absolute -left-24 top-1/4 h-72 w-72 rounded-full border-[28px] border-[var(--lab-mint)]/30"></div>
      <div aria-hidden="true" className="absolute -right-16 bottom-16 h-48 w-48 rotate-12 rounded-[56px] border-[20px] border-[var(--lab-peach)]/25"></div>

      <button
        onClick={openSettings}
        className="group fixed right-4 top-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--lab-surface-60)] text-[var(--lab-mint-ink)] transition-[transform,background-color,box-shadow] duration-[var(--duration-press)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-[var(--lab-surface)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)] focus-visible:ring-offset-2 active:scale-95 sm:right-6 sm:top-6"
        aria-label="Open settings"
        aria-haspopup="dialog"
        aria-expanded={settingsOpen}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition-transform duration-[var(--duration-press)] ease-[var(--ease-out)] group-hover:rotate-45">
          ⚙️
        </span>
      </button>

      <div className="flex flex-col items-center text-center max-w-2xl relative z-10">
        <div aria-hidden="true" className="animate-genz-float absolute -left-24 -top-24 select-none text-7xl opacity-20 drop-shadow-lg pointer-events-none md:-left-40 md:-top-32 md:text-9xl">🔥</div>

        {settingsOpen && (
          <div
            className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/20 p-3 sm:p-4 backdrop-blur-sm touch-manipulation ${settingsExiting ? 'animate-backdrop-exit pointer-events-none' : 'animate-backdrop-enter'}`}
            onClick={closeSettings}
          >
            <div
              ref={settingsDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="settings-title"
              tabIndex={-1}
              className={`relative z-10 w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[36px] border border-[var(--lab-line)] bg-[var(--lab-surface)] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)] ${settingsExiting ? 'animate-modal-exit' : 'animate-modal-enter'}`}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                ref={settingsCloseRef}
                onClick={closeSettings}
                className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--lab-surface-soft)] text-zinc-600 transition-colors duration-[var(--duration-press)] ease-[var(--ease-out)] hover:bg-[var(--lab-line)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30"
                aria-label="Close settings"
              >
                ✕
              </button>
              <div className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-zinc-500">Application Settings</div>
              <h2 id="settings-title" className="text-2xl font-black text-zinc-900">Settings</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Manage your saved progress and application state from here.
              </p>
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleReset}
                  className="w-full rounded-[28px] bg-[var(--lab-danger)] px-5 py-3 text-sm font-black uppercase tracking-[0.35em] text-[var(--lab-surface)] transition-[transform,background-color] duration-[var(--duration-press)] ease-[var(--ease-out)] hover:bg-[var(--lab-danger-hover)] active:scale-[0.98] touch-manipulation"
                >
                  Reset Data
                </button>
                <button
                  onClick={closeSettings}
                  className="w-full rounded-[28px] border border-[var(--lab-line)] bg-[var(--lab-surface)] px-5 py-3 text-sm font-black uppercase tracking-[0.35em] text-zinc-700 transition-[transform,background-color] duration-[var(--duration-press)] ease-[var(--ease-out)] hover:bg-[var(--lab-surface-soft)] active:scale-[0.98] touch-manipulation"
                >
                  Exit Settings
                </button>
              </div>
            </div>
          </div>
        )}



        <h1 className="text-[clamp(4rem,20vw,7.5rem)] font-black text-[var(--lab-action)] leading-[0.9] mb-8 tracking-tighter drop-shadow-[0_10px_0_var(--lab-action-depth)]">
          汉字<br />
          <span className="text-[var(--lab-mint-ink)] drop-shadow-[0_10px_0_var(--lab-peach)]">DouJeen</span>
        </h1>

        <p className="text-2xl md:text-3xl text-zinc-600 mb-10 font-bold max-w-lg leading-tight">
          Mix characters. Enhance Your Imagination.<br />
          <span className="underline decoration-[var(--lab-mint)] decoration-8 underline-offset-4">Learn Chinese the vibe way.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4 mb-8">
          <Link
            href="/play"
            className="group relative inline-flex w-full sm:w-auto items-center justify-center px-10 py-4 sm:px-14 sm:py-7 text-xl sm:text-3xl font-black text-[var(--lab-surface)] transition-[transform,background-color,box-shadow] duration-[var(--duration-press)] ease-[var(--ease-out)] bg-[var(--lab-action)] rounded-[40px] hover:bg-[var(--lab-action-hover)] hover:scale-105 active:scale-95 shadow-[0_16px_0_var(--lab-action-shadow)] hover:shadow-[0_8px_0_var(--lab-action-shadow)] hover:translate-y-[8px] active:translate-y-[16px] active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)] focus-visible:ring-offset-4"
          >
            <span className="relative flex items-center gap-3">
              LET&apos;S GO
              <span className="text-3xl group-hover:rotate-12 transition-transform duration-[var(--duration-press)] ease-[var(--ease-out)]">🚀</span>
            </span>
          </Link>
          <Link
            href="/guide"
            className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-3 sm:px-10 sm:py-6 text-lg sm:text-2xl font-black text-[var(--lab-mint-ink)] transition-[transform,background-color,box-shadow,border-color] duration-[var(--duration-press)] ease-[var(--ease-out)] bg-[var(--lab-surface)] rounded-[36px] hover:bg-[var(--lab-surface-soft)] hover:scale-105 active:scale-95 shadow-[0_12px_0_var(--lab-shadow)] hover:shadow-[0_6px_0_var(--lab-shadow)] hover:translate-y-[6px] active:translate-y-[12px] active:shadow-none border-2 border-[var(--lab-mint)]/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)] focus-visible:ring-offset-4"
          >
            ANSWER KEY
          </Link>
        </div>

        <p className="text-sm md:text-base font-black uppercase tracking-[0.25em] text-[var(--lab-muted)] mb-6">
          Dictionary of words and combination clues
        </p>
      </div>

      <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-lg font-black text-[var(--lab-muted)] uppercase tracking-tighter sm:mt-24">
        <span className="hover:text-[var(--lab-action)] transition-colors duration-[var(--duration-press)] ease-[var(--ease-out)] cursor-default">No Exams</span>
        <span className="hover:text-[var(--lab-mint-ink)] transition-colors duration-[var(--duration-press)] ease-[var(--ease-out)] cursor-default">No Stress</span>
        <span className="hover:text-[var(--lab-peach-ink)] transition-colors duration-[var(--duration-press)] ease-[var(--ease-out)] cursor-default">Just Vibes</span>
      </div>
    </main>
  );
}
