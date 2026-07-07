'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleReset = () => {
    const confirmation = window.confirm(
      'This action will permanently erase your saved progress. Do you wish to proceed?'
    );
    if (!confirmation) return;
    localStorage.removeItem('doujeen_progress');
    window.location.reload();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9DB] p-8 font-sans overflow-hidden relative">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B2F2BB] blur-[120px] rounded-full opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#74C0FC] blur-[120px] rounded-full opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-[#FFD8A8] blur-[100px] rounded-full opacity-20"></div>

      <button
        onClick={() => setSettingsOpen(true)}
        className="group fixed right-4 top-4 z-30 inline-flex items-center gap-2 rounded-full border border-[#74C0FC]/20 bg-white/90 px-3 py-2.5 text-[#2b5e32] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white hover:shadow-[0_12px_30px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-4 focus:ring-[#74C0FC]/20 active:scale-95 sm:right-6 sm:top-6 sm:px-4 sm:py-3"
        aria-label="Open settings"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#74C0FC] text-xl text-white transition-transform duration-300 group-hover:rotate-45">
          ⚙️
        </span>
      </button>

      <div className="flex flex-col items-center text-center max-w-2xl relative z-10">
        {/* Floating Physics-style Elements */}
        <div className="absolute -top-32 -left-40 text-8xl md:text-9xl opacity-20 animate-[bounce_6s_infinite] select-none pointer-events-none drop-shadow-lg">🔥</div>
        <div className="absolute -bottom-40 -right-40 text-9xl md:text-[12rem] opacity-20 animate-[bounce_8s_infinite_reverse] select-none pointer-events-none drop-shadow-lg">🌋</div>
        <div className="absolute top-40 -right-60 text-7xl md:text-8xl opacity-20 animate-[bounce_7s_infinite_delay-150ms] select-none pointer-events-none drop-shadow-lg">💧</div>

        {settingsOpen && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-[36px] border border-zinc-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.18)] animate-genz-pop">
              <div className="pointer-events-none absolute -top-8 right-6 flex items-center gap-3">
                
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 transition hover:bg-zinc-200"
                aria-label="Close settings"
              >
                ✕
              </button>
              <div className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-zinc-500">Application Settings</div>
              <h2 className="text-2xl font-black text-zinc-900">Settings</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Manage your saved progress and application state from here.
              </p>
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleReset}
                  className="w-full rounded-[28px] bg-[#ff5f5f] px-5 py-3 text-sm font-black uppercase tracking-[0.35em] text-white transition hover:bg-[#e64545]"
                >
                  Reset Data
                </button>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="w-full rounded-[28px] border border-zinc-200 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.35em] text-zinc-700 transition hover:bg-zinc-100"
                >
                  Exit Settings
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#B2F2BB] text-[#2b5e32] px-6 py-2 rounded-full text-sm font-black tracking-widest uppercase mb-6 shadow-sm rotate-[-2deg]">
          New Discovery Game 🧪
        </div>

        <h1 className="text-7xl md:text-[120px] font-black text-[#74C0FC] leading-[0.9] mb-8 tracking-tighter drop-shadow-[0_10px_0_#5da9e6]">
          汉字<br />
          <span className="text-white drop-shadow-[0_10px_0_#FFD8A8]">DouJeen</span>
        </h1>

        <p className="text-2xl md:text-3xl text-zinc-600 mb-10 font-bold max-w-lg leading-tight">
          Mix characters. Enhance Your Imagination.<br />
          <span className="underline decoration-[#B2F2BB] decoration-8 underline-offset-4">Learn Chinese the vibe way.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-4 mb-8">
          <Link
            href="/play"
            className="group relative inline-flex w-full sm:w-auto items-center justify-center px-10 py-4 sm:px-14 sm:py-7 text-xl sm:text-3xl font-black text-white transition-all duration-300 bg-[#74C0FC] rounded-[40px] hover:bg-[#5da9e6] hover:scale-105 active:scale-95 shadow-[0_16px_0_#3d8ecf] hover:shadow-[0_8px_0_#3d8ecf] hover:translate-y-[8px] active:translate-y-[16px] active:shadow-none"
          >
            <span className="relative flex items-center gap-3">
              LET&apos;S GO
              <span className="text-3xl group-hover:rotate-12 transition-transform">🚀</span>
            </span>
          </Link>
          <Link
            href="/guide"
            className="inline-flex w-full sm:w-auto items-center justify-center px-8 py-3 sm:px-10 sm:py-6 text-lg sm:text-2xl font-black text-[#2b5e32] transition-all duration-300 bg-white rounded-[36px] hover:bg-[#fdf7df] hover:scale-105 active:scale-95 shadow-[0_12px_0_#efefef] hover:shadow-[0_6px_0_#efefef] hover:translate-y-[6px] active:translate-y-[12px] active:shadow-none border-2 border-[#B2F2BB]/50"
          >
            ANSWER KEY
          </Link>
        </div>

        <p className="text-sm md:text-base font-black uppercase tracking-[0.25em] text-zinc-400 mb-6">
          Dictionary of words and combination clues
        </p>
      </div>

      <div className="mt-24 flex flex-wrap justify-center gap-8 text-lg font-black text-zinc-400 uppercase tracking-tighter opacity-50">
        <span className="hover:text-[#74C0FC] transition-colors cursor-default">No Exams</span>
        <span className="hover:text-[#B2F2BB] transition-colors cursor-default">No Stress</span>
        <span className="hover:text-[#FFD8A8] transition-colors cursor-default">Just Vibes</span>
      </div>
    </main>
  );
}
