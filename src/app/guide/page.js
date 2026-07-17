'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { BASE_CHARS, RECIPES, getData } from '../data';

export default function GuidePage() {
  const [search, setSearch] = useState('');
  const [revealed, setRevealed] = useState({});
  const [progress, setProgress] = useState([]);
  const [sandboxItems, setSandboxItems] = useState([]);
  const [sandboxResult, setSandboxResult] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem('doujeen_progress');
        if (!saved) return;
        const { unlocked } = JSON.parse(saved);
        if (Array.isArray(unlocked)) {
          setProgress(unlocked);
        }
      } catch (e) {
        console.error('Failed to parse progress:', e);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const toggleReveal = (key, defaultVisible = false) => {
    setRevealed(prev => ({
      ...prev,
      [key]: !(prev[key] ?? defaultVisible),
    }));
  };

  const revealAll = () => {
    const all = {};
    Object.keys(RECIPES).forEach(k => { all[k] = true; });
    setRevealed(all);
  };

  const hideAll = () => {
    const all = {};
    Object.keys(RECIPES).forEach(k => { all[k] = false; });
    setRevealed(all);
    setSearch('');
  };

  const addToSandbox = (char) => {
    const newItems = sandboxItems.length >= 2
      ? [char]
      : [...sandboxItems, char];

    setSandboxItems(newItems);

    if (newItems.length < 2) {
      setSandboxResult(null);
      return;
    }

    const combo1 = newItems[0] + newItems[1];
    const combo2 = newItems[1] + newItems[0];
    const match = RECIPES[combo1] || RECIPES[combo2];
    setSandboxResult(match || { result: '?', emoji: '🧪', name: 'No reaction' });
  };

  const clearSandbox = () => {
    setSandboxItems([]);
    setSandboxResult(null);
  };

  const filteredRecipes = useMemo(() => {
    const entries = Object.entries(RECIPES);
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(([key, recipe]) => {
      const char1 = key[0];
      const char2 = key.length > 2 ? key.slice(1) : key[1];
      const d1 = getData(char1);
      const d2 = getData(char2);
      return (
        recipe.result.includes(search) ||
        recipe.pinyin.toLowerCase().includes(q) ||
        recipe.name.toLowerCase().includes(q) ||
        recipe.category.toLowerCase().includes(q) ||
        recipe.note.toLowerCase().includes(q) ||
        d1.name.toLowerCase().includes(q) ||
        d2.name.toLowerCase().includes(q)
      );
    });
  }, [search]);

  const categories = ['States of Matter', 'Materials', 'Physical Mixes & Biology'];

  return (
    <main className="min-h-screen bg-graph-paper font-sans relative pb-20">
      
      {/* Scientist Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-4 border-[#74C0FC]/20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="bg-white shadow-[0_4px_0_#efefef] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none p-3 rounded-2xl text-[var(--lab-action)] transition-all border-2 border-zinc-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </Link>
            <div>
              <h1 className="text-xl font-black text-zinc-800 tracking-tight flex items-center gap-2">
                Scientist&apos;s Log <span className="text-[#74C0FC]">🔬</span>
              </h1>
              <p className="text-[10px] font-black text-[var(--lab-muted)] uppercase tracking-widest">Research & Discovery Manual</p>
            </div>
          </div>

          <Link
            href="/play"
            className="bg-[var(--lab-action)] text-white shadow-[0_4px_0_var(--lab-action-shadow)] hover:bg-[var(--lab-action-hover)] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none px-6 py-3 rounded-2xl text-sm font-black transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30"
          >
            LABORATORY
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        

        {/* Base Elements - The Selection Palette */}
        <section className="mb-12">
          <h2 className="text-xs font-black text-[var(--lab-muted)] uppercase tracking-[0.3em] mb-6 px-2 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-zinc-200"></span>
            Primary Reagents
            <span className="w-8 h-[2px] bg-zinc-200"></span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(BASE_CHARS).map((item) => (
              <button
                key={item.char}
                type="button"
                onClick={() => addToSandbox(item.char)}
                className="bg-white rounded-3xl p-5 shadow-[0_6px_0_#efefef] border-2 border-transparent hover:border-[var(--lab-action)] flex flex-col items-center gap-2 transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none group focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30"
                aria-label={`Add ${item.char}, ${item.name}, to the reagent sandbox`}
              >
                <span className="text-4xl group-hover:animate-bounce">{item.emoji}</span>
                <span className="text-2xl font-black text-zinc-800">{item.char}</span>
                <span className="text-[10px] font-black text-[var(--lab-action)] uppercase tracking-widest">{item.pinyin}</span>
              </button>
            ))}
          </div>

          <div
            className="mt-6 min-h-32 rounded-[32px] border-4 border-dashed border-[var(--lab-sky)]/40 bg-white/80 p-6 text-center shadow-sm"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {sandboxItems.length === 0 && (
              <p className="font-black text-[var(--lab-muted)]">Tap two reagents to test a combination.</p>
            )}

            {sandboxItems.length === 1 && (
              <div className="space-y-2">
                <p className="text-4xl font-black text-zinc-800">{sandboxItems[0]}</p>
                <p className="font-black text-[var(--lab-muted)]">Choose one more reagent.</p>
              </div>
            )}

            {sandboxItems.length === 2 && sandboxResult && (
              <div className="space-y-3">
                <p className="flex items-center justify-center gap-3 text-2xl font-black text-zinc-800">
                  <span>{sandboxItems[0]}</span>
                  <span aria-hidden="true">+</span>
                  <span>{sandboxItems[1]}</span>
                  <span aria-hidden="true">=</span>
                  <span>{sandboxResult.emoji} {sandboxResult.result}</span>
                </p>
                {sandboxResult.result === '?' ? (
                  <p className="font-black text-[var(--lab-danger)]">No reaction. Try another pair.</p>
                ) : (
                  <p className="font-bold text-zinc-700">
                    Chinese connection: <span lang="zh-Hans" className="font-black">{sandboxResult.result}</span> means {sandboxResult.name}. Say <span className="font-black text-[var(--lab-action)]">{sandboxResult.pinyin}</span> aloud.
                  </p>
                )}
              </div>
            )}

            {sandboxItems.length > 0 && (
              <button
                type="button"
                onClick={clearSandbox}
                className="mt-5 min-h-11 rounded-2xl border-2 border-zinc-200 bg-white px-5 py-2 text-xs font-black text-zinc-700 hover:bg-zinc-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30"
              >
                CLEAR SANDBOX
              </button>
            )}
          </div>
        </section>

        {/* Controls & Filter */}
        <section className="mb-12 sticky top-24 z-30">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <label htmlFor="recipe-search" className="sr-only">Search recipes</label>
              <input
                id="recipe-search"
                name="recipe-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by element, pinyin, or logic..."
                className="w-full bg-white rounded-3xl px-6 py-4 pl-14 text-sm font-bold text-zinc-700 placeholder:text-[var(--lab-muted)] border-4 border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus:outline-none focus:border-[var(--lab-action)]/50 transition-all"
              />
              <svg aria-hidden="true" className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--lab-muted)] group-focus-within:text-[var(--lab-action)] transition-colors" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={revealAll} className="min-h-11 bg-zinc-800 text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-zinc-700 transition-colors shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30">SHOW ALL</button>
              <button type="button" onClick={hideAll} className="min-h-11 bg-white text-[var(--lab-muted)] border-2 border-zinc-100 px-6 py-3 rounded-2xl text-xs font-black hover:bg-zinc-50 transition-colors shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30">RESET</button>
            </div>
          </div>
        </section>

        {/* Categorized Recipes */}
        {categories.map(category => {
          const catRecipes = filteredRecipes.filter(([_, r]) => r.category === category);
          if (catRecipes.length === 0) return null;
          
          return (
            <section key={category} className="mb-12">
              <h3 className="text-lg font-black text-zinc-800 mb-6 flex items-center gap-3">
                {category === 'States of Matter' ? '🧪' : category === 'Materials' ? '🔬' : '🌱'}
                {category}
                <span className="text-[10px] text-[var(--lab-muted)] uppercase tracking-widest font-black ml-auto">{catRecipes.length} Discoveries</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {catRecipes.map(([key, recipe]) => {
                  const char1 = key[0];
                  const char2 = key.length > 2 ? key.slice(1) : key[1];
                  const d1 = getData(char1);
                  const d2 = getData(char2);
                  const isFound = progress.includes(recipe.result);
                  const isRevealed = revealed[key] ?? isFound;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleReveal(key, isFound)}
                      aria-expanded={isRevealed}
                      className={`
                        w-full bg-white rounded-[32px] p-6 shadow-[0_8px_0_#efefef] border-4 border-transparent
                        hover:border-[#FFD8A8]/50 transition-all text-left cursor-pointer relative group
                        focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30
                        ${isFound ? 'ring-2 ring-[#B2F2BB]/50' : ''}
                      `}
                    >
                      {isFound && (
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-xl border-2 border-[#B2F2BB] z-10 animate-float">
                          ⭐
                        </div>
                      )}

                      {/* Formula */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-2 rounded-2xl border-2 border-zinc-100">
                          <span className="text-xl">{d1.emoji}</span>
                          <span className="text-xl font-black text-zinc-800">{char1}</span>
                        </div>
                        <span className="text-[var(--lab-muted)] font-black">+</span>
                        <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-2 rounded-2xl border-2 border-zinc-100">
                          <span className="text-xl">{d2.emoji}</span>
                          <span className="text-xl font-black text-zinc-800">{char2}</span>
                        </div>
                        <span className="text-[var(--lab-muted)] font-black">=</span>

                        {isRevealed ? (
                          <div className="flex items-center gap-2 animate-[fade-in_0.3s_ease-out]">
                            <span className="text-2xl">{recipe.emoji}</span>
                            <span className="text-2xl font-black text-[var(--lab-action)]">{recipe.result}</span>
                          </div>
                        ) : (
                          <div className="bg-[#FFD8A8]/35 text-[var(--lab-peach-ink)] px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-[#FFD8A8] group-hover:bg-[#FFD8A8]/50 transition-colors">
                            Reveal Logic
                          </div>
                        )}
                      </div>

                      {/* Scientific Data */}
                      {isRevealed && (
                        <div className="space-y-3 animate-[fade-in_0.4s_ease-out]">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-[var(--lab-action)] uppercase tracking-widest">{recipe.pinyin}</span>
                            <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{recipe.name}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-[var(--lab-muted)] font-bold bg-zinc-50/50 p-3 rounded-xl border border-zinc-100 italic">
                            &ldquo;{recipe.note}&rdquo;
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filteredRecipes.length === 0 && (
          <div className="bg-white/40 border-4 border-dashed border-zinc-100 rounded-[40px] p-20 text-center">
            <span className="text-6xl mb-6 block opacity-20">🧪</span>
            <p className="text-[var(--lab-muted)] font-black uppercase tracking-widest">No matching research entries found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
