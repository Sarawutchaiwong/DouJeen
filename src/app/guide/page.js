'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import BrandMark from '../components/BrandMark';
import {
  BASE_CHARS,
  BIBLIOGRAPHY,
  RECIPES,
  RECIPE_CATEGORIES,
  getData,
  getRecipe,
  getRecipeIngredients,
} from '../data';

const CATEGORY_ICONS = {
  'Nature & Weather': '🌦️',
  'People & Places': '🧑‍🤝‍🧑',
  Learning: '📚',
  'Technology & Transport': '🚆',
};

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

    const match = getRecipe(newItems[0], newItems[1]);
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
      const [first, second] = getRecipeIngredients(key);
      const d1 = getData(first);
      const d2 = getData(second);
      return (
        recipe.result.includes(search) ||
        recipe.pinyin.toLowerCase().includes(q) ||
        recipe.name.toLowerCase().includes(q) ||
        recipe.category.toLowerCase().includes(q) ||
        recipe.sourceDefinition.toLowerCase().includes(q) ||
        d1.name.toLowerCase().includes(q) ||
        d2.name.toLowerCase().includes(q)
      );
    });
  }, [search]);

  return (
    <main className="min-h-screen bg-graph-paper font-sans relative pb-20">
      
      <header className="sticky top-0 z-40 border-b border-[var(--lab-line)] bg-[var(--lab-surface-90)]">
        <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <BrandMark compact />
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[var(--lab-lilac)] px-4 py-2 text-xs font-black text-[var(--lab-ink)] sm:inline-flex">46 sourced words</span>
            <Link href="/play" className="lift-control inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[var(--lab-action)] px-5 text-sm font-black text-[var(--lab-surface)] shadow-[0_8px_22px_var(--lab-action-shadow)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">
              Open lab
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="mb-10 grid items-end gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <div className="eyebrow">Dictionary-backed answer key</div>
            <h1 className="mt-3 max-w-3xl text-[clamp(2.8rem,7vw,5.8rem)] font-black leading-[0.9] tracking-[-0.065em] text-[var(--lab-ink)]">The word <span className="text-[var(--lab-action)]">atlas.</span></h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-[var(--lab-ink-soft)]">Explore every valid reaction, reveal definitions at your pace, and verify pronunciation against the cited dictionary source.</p>
          </div>
          <div className="flex gap-2 md:pb-2" aria-label="Answer key summary">
            <span className="pastel-pill rounded-full px-4 py-2 text-sm font-black">4 collections</span>
            <span className="rounded-full bg-[var(--lab-mint)] px-4 py-2 text-sm font-black text-[var(--lab-mint-ink)]">CC-CEDICT</span>
          </div>
        </section>

        {/* Base Elements - The Selection Palette */}
        <details className="surface-panel group mb-10 overflow-hidden rounded-[2rem]">
          <summary className="lift-control flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[var(--lab-action)]/25 sm:px-7">
            <span>
              <span className="eyebrow block">Practice sandbox</span>
              <span className="mt-1 block text-xl font-black tracking-[-0.03em] text-[var(--lab-ink)]">Open the 40-character bank</span>
            </span>
            <span className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--lab-lilac)] text-xl font-black text-[var(--lab-ink)] transition-transform duration-[var(--duration-ui)] ease-[var(--ease-out)] group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <div className="border-t border-[var(--lab-line)] p-4 sm:p-7">
          <p className="mb-5 text-sm font-bold text-[var(--lab-muted)]">
            Combine in the shown order: the first character or word goes on the left.
          </p>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
            {Object.values(BASE_CHARS).map((item) => (
              <button
                key={item.char}
                type="button"
                onClick={() => addToSandbox(item.char)}
                className="lift-control group flex min-h-24 flex-col items-center justify-center gap-1 rounded-[1.4rem] border border-[var(--lab-line)] bg-[var(--lab-surface)] p-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25"
                aria-label={`Add ${item.char}, ${item.name}, to the reagent sandbox`}
              >
                <span className="text-2xl transition-transform duration-[var(--duration-press)] ease-[var(--ease-out)] group-hover:scale-110">{item.emoji}</span>
                <span className="hanzi-text text-xl font-black text-[var(--lab-ink)]" lang="zh-Hans">{item.char}</span>
                <span className="text-[9px] font-black text-[var(--lab-action)]">{item.pinyin}</span>
              </button>
            ))}
          </div>

          <div
            className="mt-6 min-h-32 rounded-[1.7rem] border border-dashed border-[var(--lab-line-strong)] bg-[var(--lab-lilac)]/40 p-6 text-center"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {sandboxItems.length === 0 && (
              <p className="font-black text-[var(--lab-muted)]">Tap two reagents to test a combination.</p>
            )}

            {sandboxItems.length === 1 && (
              <div className="space-y-2">
                <p className="hanzi-text text-4xl font-black text-[var(--lab-ink)]" lang="zh-Hans">{sandboxItems[0]}</p>
                <p className="font-black text-[var(--lab-muted)]">Choose one more reagent.</p>
              </div>
            )}

            {sandboxItems.length === 2 && sandboxResult && (
              <div className="space-y-3">
                <p className="hanzi-text flex flex-wrap items-center justify-center gap-3 text-2xl font-black text-[var(--lab-ink)]" lang="zh-Hans">
                  <span>{sandboxItems[0]}</span>
                  <span aria-hidden="true">+</span>
                  <span>{sandboxItems[1]}</span>
                  <span aria-hidden="true">=</span>
                  <span>{sandboxResult.emoji} {sandboxResult.result}</span>
                </p>
                {sandboxResult.result === '?' ? (
                  <p className="font-black text-[var(--lab-danger)]">No reaction. Try another pair.</p>
                ) : (
                  <p className="font-bold text-[var(--lab-ink-soft)]">
                    Chinese connection: <span lang="zh-Hans" className="font-black">{sandboxResult.result}</span> means {sandboxResult.name}. Say <span className="font-black text-[var(--lab-action)]">{sandboxResult.pinyin}</span> aloud.
                  </p>
                )}
              </div>
            )}

            {sandboxItems.length > 0 && (
              <button
                type="button"
                onClick={clearSandbox}
                className="lift-control mt-5 min-h-11 rounded-full border border-[var(--lab-line-strong)] bg-[var(--lab-surface)] px-5 py-2 text-xs font-black text-[var(--lab-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25"
              >
                CLEAR SANDBOX
              </button>
            )}
          </div>
          </div>
        </details>

        {/* Controls & Filter */}
        <section className="sticky top-20 z-30 mb-12 rounded-[1.7rem] border border-[var(--lab-line)] bg-[var(--lab-surface-90)] p-2 shadow-[0_14px_40px_var(--lab-shadow)]">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1 relative group">
              <label htmlFor="recipe-search" className="sr-only">Search recipes</label>
              <input
                id="recipe-search"
                name="recipe-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by word, pinyin, meaning, or category..."
                className="min-h-12 w-full rounded-[1.25rem] border border-transparent bg-[var(--lab-surface)] px-5 py-3 pl-12 text-sm font-bold text-[var(--lab-ink)] outline-none placeholder:text-[var(--lab-muted)] focus:border-[var(--lab-action)] focus:ring-4 focus:ring-[var(--lab-action)]/10"
              />
              <svg aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--lab-muted)] group-focus-within:text-[var(--lab-action)]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={revealAll} className="lift-control min-h-12 rounded-[1.25rem] bg-[var(--lab-ink)] px-5 py-3 text-xs font-black text-[var(--lab-surface)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">Reveal all</button>
              <button type="button" onClick={hideAll} className="lift-control min-h-12 rounded-[1.25rem] border border-[var(--lab-line)] bg-[var(--lab-surface)] px-5 py-3 text-xs font-black text-[var(--lab-muted)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">Reset</button>
            </div>
          </div>
        </section>

        {/* Categorized Recipes */}
        {RECIPE_CATEGORIES.map(category => {
          const catRecipes = filteredRecipes.filter(([_, r]) => r.category === category);
          if (catRecipes.length === 0) return null;
          
          return (
            <section key={category} className="mb-12">
              <h3 className="mb-5 flex flex-wrap items-center gap-3 text-xl font-black tracking-[-0.035em] text-[var(--lab-ink)]">
                <span className="inline-grid h-10 w-10 place-items-center rounded-[1rem] bg-[var(--lab-lilac)] text-lg" aria-hidden="true">{CATEGORY_ICONS[category]}</span>
                {category}
                <span className="ml-auto rounded-full border border-[var(--lab-line)] bg-[var(--lab-surface-60)] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--lab-muted)]">{catRecipes.length} words</span>
              </h3>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {catRecipes.map(([key, recipe]) => {
                  const [first, second] = getRecipeIngredients(key);
                  const d1 = getData(first);
                  const d2 = getData(second);
                  const isFound = progress.includes(recipe.result);
                  const isRevealed = revealed[key] ?? isFound;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleReveal(key, isFound)}
                      aria-expanded={isRevealed}
                      className={`
                        lift-control surface-panel group relative w-full cursor-pointer rounded-[1.8rem] p-4 text-left sm:p-5
                        focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25
                        ${isFound ? 'border-[var(--lab-mint-bright)]' : ''}
                      `}
                    >
                      {isFound && (
                        <div className="absolute -right-2 -top-2 z-10 inline-flex h-9 items-center gap-1 rounded-full border border-[var(--lab-mint-bright)] bg-[var(--lab-mint)] px-3 text-[10px] font-black uppercase tracking-wider text-[var(--lab-mint-ink)]">
                          <span aria-hidden="true">✓</span> found
                        </div>
                      )}

                      {/* Formula */}
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-[1rem] border border-[var(--lab-line)] bg-[var(--lab-peach)] px-3 py-2">
                          <span className="text-xl">{d1.emoji}</span>
                          <span className="hanzi-text text-xl font-black text-[var(--lab-ink)]" lang="zh-Hans">{first}</span>
                        </div>
                        <span className="text-[var(--lab-muted)] font-black">+</span>
                        <div className="flex items-center gap-1.5 rounded-[1rem] border border-[var(--lab-line)] bg-[var(--lab-mint)] px-3 py-2">
                          <span className="text-xl">{d2.emoji}</span>
                          <span className="hanzi-text text-xl font-black text-[var(--lab-ink)]" lang="zh-Hans">{second}</span>
                        </div>
                        <span className="text-[var(--lab-muted)] font-black">=</span>

                        <div className="grid min-w-[8rem] flex-1">
                          <div
                            aria-hidden={!isRevealed}
                            className={`col-start-1 row-start-1 flex items-center gap-2 transition-[transform,opacity] duration-[var(--duration-ui)] ease-[var(--ease-out)] ${isRevealed ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0'}`}
                          >
                            <span className="text-2xl">{recipe.emoji}</span>
                            <span className="hanzi-text text-2xl font-black text-[var(--lab-action)]" lang="zh-Hans">{recipe.result}</span>
                          </div>
                          <div
                            aria-hidden={isRevealed}
                            className={`col-start-1 row-start-1 justify-self-start rounded-full border border-[var(--lab-line-strong)] bg-[var(--lab-lilac)] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--lab-ink)] transition-[transform,opacity] duration-[var(--duration-ui)] ease-[var(--ease-out)] ${isRevealed ? 'pointer-events-none -translate-y-1 opacity-0' : 'translate-y-0 opacity-100'}`}
                          >
                            Reveal Word
                          </div>
                        </div>
                      </div>

                      {/* Dictionary data */}
                      <div
                        aria-hidden={!isRevealed}
                        className={`grid transition-[grid-template-rows,opacity] duration-[var(--duration-ui)] ease-[var(--ease-out)] ${isRevealed ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-[var(--lab-action)] uppercase tracking-widest">{recipe.pinyin}</span>
                            <span className="h-1 w-1 rounded-full bg-[var(--lab-line-strong)]"></span>
                            <span className="text-xs font-black uppercase tracking-widest text-[var(--lab-muted)]">{recipe.name}</span>
                          </div>
                          <p className="rounded-[1rem] border border-[var(--lab-line)] bg-[var(--lab-surface-soft)] p-3 text-[11px] font-bold leading-relaxed text-[var(--lab-muted)]">
                            CC-CEDICT definition: &ldquo;{recipe.sourceDefinition}&rdquo; <span className="not-italic">[1]</span>
                          </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filteredRecipes.length === 0 && (
          <div className="surface-panel rounded-[2rem] border-dashed p-16 text-center">
            <span className="text-6xl mb-6 block opacity-20">🧪</span>
            <p className="text-[var(--lab-muted)] font-black uppercase tracking-widest">No matching research entries found.</p>
          </div>
        )}

        <section aria-labelledby="bibliography-title" className="surface-panel mt-16 rounded-[2rem] p-6 sm:p-8">
          <div className="eyebrow">Source note · 01</div>
          <h2 id="bibliography-title" className="mt-2 text-2xl font-black tracking-[-0.035em] text-[var(--lab-ink)]">Bibliography</h2>
          <p className="mt-2 text-sm font-bold leading-relaxed text-[var(--lab-muted)]">
            Every Chinese headword, pinyin reading, and English definition in this answer key is sourced from the bibliography below. Tone marks are generated directly from CC-CEDICT&apos;s numbered pinyin.
          </p>
          <ol className="mt-5 space-y-4">
            {BIBLIOGRAPHY.map((source, index) => (
              <li key={source.id} className="rounded-[1.3rem] bg-[var(--lab-lilac)] p-4 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                <span className="font-black">[{index + 1}] {source.citation}</span>{' '}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center px-1 font-black text-[var(--lab-action)] underline decoration-2 underline-offset-4 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30"
                >
                  Source
                </a>
                <span className="block text-[var(--lab-muted)]">{source.scope}</span>
                <span className="block text-[var(--lab-muted)]">
                  License:{' '}
                  <a href={source.licenseUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center align-middle underline underline-offset-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30">
                    {source.license}
                  </a>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
