'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BrandMark from '../components/BrandMark';
import PronunciationButton from '../components/PronunciationButton';
import {
  BIBLIOGRAPHY,
  DISCOVERABLE_ITEMS,
  RECIPES,
  RECIPE_CATEGORIES,
  STARTER_ITEMS,
  getData,
  getRecipeIngredients,
} from '../data';
import { usePronunciation } from '../usePronunciation';

const PROGRESS_KEY = 'doujeen_progress_v2';
const VALID_RECIPE_KEYS = new Set(Object.keys(RECIPES));
const VALID_ITEMS = new Set([...STARTER_ITEMS, ...DISCOVERABLE_ITEMS]);

const CATEGORY_ICONS = {
  'First Reactions': '✨',
  'Weather Cycle': '🌦️',
  'Earth & Materials': '🪨',
  'Human World': '🏘️',
  'Sea Connections': '🌊',
};

export default function GuidePage() {
  const [search, setSearch] = useState('');
  const [unlocked, setUnlocked] = useState(STARTER_ITEMS);
  const [discoveredRecipeKeys, setDiscoveredRecipeKeys] = useState([]);
  const { playingCharacter, playPronunciation, pronunciationError } = usePronunciation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(PROGRESS_KEY);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.unlocked)) {
          setUnlocked([
            ...new Set([
              ...STARTER_ITEMS,
              ...parsed.unlocked.filter((item) => typeof item === 'string' && VALID_ITEMS.has(item)),
            ]),
          ]);
        }
        if (Array.isArray(parsed.discoveredRecipes)) {
          setDiscoveredRecipeKeys([
            ...new Set(parsed.discoveredRecipes.filter((key) => typeof key === 'string' && VALID_RECIPE_KEYS.has(key))),
          ]);
        }
      } catch (error) {
        console.error('Failed to parse discovery progress:', error);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const discoveredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return discoveredRecipeKeys
      .map((key) => [key, RECIPES[key]])
      .filter(([, recipe]) => {
        if (!query) return true;
        const [first, second] = recipe.ingredients;
        return recipe.result.includes(search)
          || recipe.pinyin.toLowerCase().includes(query)
          || recipe.name.toLowerCase().includes(query)
          || recipe.explanation.toLowerCase().includes(query)
          || getData(first).name.toLowerCase().includes(query)
          || getData(second).name.toLowerCase().includes(query);
      });
  }, [discoveredRecipeKeys, search]);

  const discoveredWordCount = unlocked.filter((item) => !STARTER_ITEMS.includes(item)).length;
  const lockedWordCount = Math.max(DISCOVERABLE_ITEMS.length - discoveredWordCount, 0);

  return (
    <main className="relative min-h-screen bg-graph-paper pb-20 font-sans">
      <header className="sticky top-0 z-40 border-b border-[var(--lab-line)] bg-[var(--lab-surface-90)]">
        <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <BrandMark compact />
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[var(--lab-lilac)] px-4 py-2 text-xs font-black text-[var(--lab-ink)] sm:inline-flex">{discoveredWordCount}/{DISCOVERABLE_ITEMS.length} found</span>
            <Link href="/play" className="lift-control inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-[var(--lab-action)] px-5 text-sm font-black text-[var(--lab-surface)] shadow-[0_8px_22px_var(--lab-action-shadow)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">
              Open canvas
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <section className="grid items-end gap-7 md:grid-cols-[1fr_auto]">
          <div>
            <div className="eyebrow">Your spoiler-free learning record</div>
            <h1 className="mt-3 max-w-4xl text-[clamp(2.8rem,7vw,5.8rem)] font-black leading-[0.9] tracking-[-0.065em] text-[var(--lab-ink)]">Discovery <span className="text-[var(--lab-action)]">notebook.</span></h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-[var(--lab-ink-soft)]">Only combinations you have crafted appear here. Review the Chinese, hear it again, and remember why the connection makes sense.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 md:pb-2" aria-label="Notebook summary">
            <span className="rounded-full bg-[var(--lab-mint)] px-4 py-2 text-center text-sm font-black text-[var(--lab-mint-ink)]">{discoveredRecipeKeys.length} recipes</span>
            <span className="pastel-pill rounded-full px-4 py-2 text-center text-sm font-black">{lockedWordCount} hidden</span>
          </div>
        </section>

        <section className="surface-panel mt-10 rounded-[2rem] p-5 sm:p-7" aria-labelledby="starter-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="eyebrow">Always available</div>
              <h2 id="starter-title" className="mt-1 text-2xl font-black tracking-[-0.04em] text-[var(--lab-ink)]">The four starter words</h2>
            </div>
            <span className="text-xs font-bold text-[var(--lab-muted)]">Everything else must be discovered.</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STARTER_ITEMS.map((text) => {
              const item = getData(text);
              return (
                <div key={text} className="relative flex min-h-24 items-center gap-3 rounded-[1.4rem] bg-[var(--lab-lilac)] p-4">
                  <span className="text-3xl" aria-hidden="true">{item.emoji}</span>
                  <span>
                    <span className="hanzi-text block text-2xl font-black text-[var(--lab-ink)]" lang="zh-Hans">{text}</span>
                    <span className="block text-[10px] font-black text-[var(--lab-action)]">{item.pinyin}</span>
                    <span className="block text-xs font-bold text-[var(--lab-muted)]">{item.name}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="sticky top-20 z-30 mt-8 rounded-[1.7rem] border border-[var(--lab-line)] bg-[var(--lab-surface-90)] p-2 shadow-[0_14px_40px_var(--lab-shadow)]">
          <label className="relative block">
            <span className="sr-only">Search your discoveries</span>
            <svg aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--lab-muted)]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search discovered Chinese, pinyin, meaning, or connection" className="min-h-12 w-full rounded-[1.25rem] border border-transparent bg-[var(--lab-surface)] py-3 pl-12 pr-5 text-sm font-bold text-[var(--lab-ink)] outline-none placeholder:text-[var(--lab-muted)] focus:border-[var(--lab-action)] focus:ring-4 focus:ring-[var(--lab-action)]/10" />
          </label>
        </section>

        {discoveredRecipeKeys.length === 0 && (
          <section className="surface-panel mt-10 rounded-[2rem] border-dashed p-8 text-center sm:p-14">
            <div className="text-5xl" aria-hidden="true">🧪</div>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[var(--lab-ink)]">Your first page is waiting.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-6 text-[var(--lab-muted)]">Start on the canvas and combine water with earth. Your notebook records the result only after you discover it.</p>
            <Link href="/play" className="lift-control mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--lab-action)] px-7 font-black text-[var(--lab-surface)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">Craft your first word</Link>
          </section>
        )}

        {discoveredRecipeKeys.length > 0 && discoveredRecipes.length === 0 && (
          <section className="surface-panel mt-10 rounded-[2rem] border-dashed p-10 text-center">
            <p className="font-black text-[var(--lab-muted)]">No discovered recipe matches that search.</p>
          </section>
        )}

        {RECIPE_CATEGORIES.map((category) => {
          const categoryRecipes = discoveredRecipes.filter(([, recipe]) => recipe.category === category);
          if (categoryRecipes.length === 0) return null;

          return (
            <section key={category} className="mt-12" aria-labelledby={`category-${category.replaceAll(' ', '-').toLowerCase()}`}>
              <h2 id={`category-${category.replaceAll(' ', '-').toLowerCase()}`} className="mb-5 flex items-center gap-3 text-xl font-black tracking-[-0.035em] text-[var(--lab-ink)]">
                <span className="inline-grid h-11 w-11 place-items-center rounded-[1rem] bg-[var(--lab-lilac)] text-lg" aria-hidden="true">{CATEGORY_ICONS[category]}</span>
                {category}
                <span className="ml-auto rounded-full border border-[var(--lab-line)] bg-[var(--lab-surface-60)] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--lab-muted)]">{categoryRecipes.length} found</span>
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                {categoryRecipes.map(([key, recipe]) => {
                  const [first, second] = getRecipeIngredients(key);
                  const firstData = getData(first);
                  const secondData = getData(second);
                  const factSource = recipe.factSourceId
                    ? BIBLIOGRAPHY.find(({ id }) => id === recipe.factSourceId)
                    : null;

                  return (
                    <article key={key} className="surface-panel rounded-[1.8rem] p-5">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-black text-[var(--lab-ink)]">
                        <span className="rounded-full bg-[var(--lab-peach)] px-3 py-2" lang="zh-Hans">{firstData.emoji} {first}</span>
                        <span aria-hidden="true">+</span>
                        <span className="rounded-full bg-[var(--lab-sky)] px-3 py-2" lang="zh-Hans">{secondData.emoji} {second}</span>
                        <span aria-hidden="true">→</span>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[1rem] bg-[var(--lab-mint)] text-3xl" aria-hidden="true">{recipe.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="hanzi-text text-3xl font-black tracking-[-0.04em] text-[var(--lab-ink)]" lang="zh-Hans">{recipe.result}</h3>
                          <p className="text-sm font-black text-[var(--lab-action)]">{recipe.pinyin}</p>
                          <p className="text-sm font-bold text-[var(--lab-muted)]">{recipe.name}</p>
                        </div>
                        <PronunciationButton character={recipe.result} isPlaying={playingCharacter === recipe.result} onPlay={playPronunciation} className="h-12 w-12 shrink-0" />
                      </div>

                      <p className="mt-4 text-sm font-bold leading-6 text-[var(--lab-ink-soft)]">{recipe.explanation}</p>
                      <p className="mt-3 text-xs leading-5 text-[var(--lab-muted)]">Dictionary: “{recipe.sourceDefinition}”</p>
                      {factSource && (
                        <a href={factSource.url} target="_blank" rel="noreferrer" className="lift-control mt-3 inline-flex min-h-11 items-center rounded-full px-3 text-xs font-black text-[var(--lab-action)] underline decoration-2 underline-offset-4 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">
                          Why this connection is grounded ↗
                        </a>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        <section aria-labelledby="bibliography-title" className="surface-panel mt-16 rounded-[2rem] p-6 sm:p-8">
          <div className="eyebrow">Sources · no invented vocabulary</div>
          <h2 id="bibliography-title" className="mt-2 text-2xl font-black tracking-[-0.035em] text-[var(--lab-ink)]">Bibliography</h2>
          <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-[var(--lab-muted)]">CC-CEDICT supplies every Chinese headword, reading, and definition. Scientific references explain physical transformations; Infinite Craft is cited only for the interaction model.</p>
          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {BIBLIOGRAPHY.map((source, index) => (
              <li key={source.id} className="rounded-[1.3rem] bg-[var(--lab-lilac)] p-4 text-sm leading-relaxed text-[var(--lab-ink-soft)]">
                <span className="font-black">[{index + 1}] {source.citation}</span>
                <span className="mt-1 block text-xs text-[var(--lab-muted)]">{source.scope}</span>
                <a href={source.url} target="_blank" rel="noreferrer" className="lift-control mt-2 inline-flex min-h-11 items-center font-black text-[var(--lab-action)] underline decoration-2 underline-offset-4 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30">Open source ↗</a>
                {source.license && (
                  <span className="block text-xs text-[var(--lab-muted)]">License: <a href={source.licenseUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center align-middle underline underline-offset-2">{source.license}</a></span>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>

      {pronunciationError && <div role="status" className="fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-full bg-[var(--lab-ink)] px-5 py-3 text-center text-xs font-black text-[var(--lab-surface)] shadow-xl">{pronunciationError}</div>}
    </main>
  );
}
