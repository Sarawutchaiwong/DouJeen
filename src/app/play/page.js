'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  DISCOVERABLE_ITEMS,
  RECIPES,
  STARTER_ITEMS,
  getData,
  getRecipe,
  makeRecipeKey,
} from '../data';
import BrandMark from '../components/BrandMark';
import PronunciationButton from '../components/PronunciationButton';
import { usePronunciation } from '../usePronunciation';

const PROGRESS_KEY = 'doujeen_progress_v2';
const AVAILABLE_ITEMS = new Set([...STARTER_ITEMS, ...DISCOVERABLE_ITEMS]);
const AVAILABLE_RECIPE_KEYS = new Set(Object.keys(RECIPES));
const MAX_CANVAS_ITEMS = 60;
const EDGE_PADDING_PERCENT = 7;

const SPAWN_POINTS = [
  [50, 44], [38, 35], [62, 35], [38, 56], [62, 56],
  [27, 45], [73, 45], [50, 24], [50, 66],
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function GamePage() {
  const [library, setLibrary] = useState(STARTER_ITEMS);
  const [discoveredRecipeKeys, setDiscoveredRecipeKeys] = useState([]);
  const [canvasItems, setCanvasItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [discovery, setDiscovery] = useState(null);
  const [reactionMessage, setReactionMessage] = useState(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  const canvasRef = useRef(null);
  const nextItemIdRef = useRef(1);
  const canvasItemsRef = useRef([]);
  const libraryRef = useRef(STARTER_ITEMS);
  const selectedIdRef = useRef(null);
  const dragStateRef = useRef(null);
  const reactionTimerRef = useRef(null);
  const { playingCharacter, playPronunciation, pronunciationError } = usePronunciation();

  const commitCanvas = useCallback((updater) => {
    setCanvasItems((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      canvasItemsRef.current = next;
      return next;
    });
  }, []);

  const commitSelectedId = useCallback((next) => {
    selectedIdRef.current = next;
    setSelectedId(next);
  }, []);

  React.useEffect(() => {
    let loadedLibrary = [...STARTER_ITEMS];
    let loadedRecipeKeys = [];

    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.unlocked)) {
          loadedLibrary = [
            ...new Set([
              ...STARTER_ITEMS,
              ...parsed.unlocked.filter((item) => typeof item === 'string' && AVAILABLE_ITEMS.has(item)),
            ]),
          ];
        }
        if (Array.isArray(parsed.discoveredRecipes)) {
          loadedRecipeKeys = [
            ...new Set(parsed.discoveredRecipes.filter((key) => typeof key === 'string' && AVAILABLE_RECIPE_KEYS.has(key))),
          ];
        }
      }
    } catch (error) {
      console.error('Failed to parse discovery progress:', error);
    }

    const timer = window.setTimeout(() => {
      libraryRef.current = loadedLibrary;
      setLibrary(loadedLibrary);
      setDiscoveredRecipeKeys(loadedRecipeKeys);
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({
        unlocked: library,
        discoveredRecipes: discoveredRecipeKeys,
      }));
    } catch (error) {
      console.error('Failed to save discovery progress:', error);
    }
  }, [discoveredRecipeKeys, hasLoaded, library]);

  React.useEffect(() => () => window.clearTimeout(reactionTimerRef.current), []);

  const showReactionMessage = useCallback((message) => {
    window.clearTimeout(reactionTimerRef.current);
    setReactionMessage(message);
    reactionTimerRef.current = window.setTimeout(() => setReactionMessage(null), 1800);
  }, []);

  const createCanvasItem = useCallback((text, x, y) => ({
    id: `craft-${nextItemIdRef.current++}`,
    text,
    x,
    y,
  }), []);

  const spawnItem = useCallback((text) => {
    const point = SPAWN_POINTS[canvasItemsRef.current.length % SPAWN_POINTS.length];
    const offset = Math.floor(canvasItemsRef.current.length / SPAWN_POINTS.length) * 2;
    const item = createCanvasItem(
      text,
      clamp(point[0] + offset, EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT),
      clamp(point[1] + offset, EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT),
    );

    commitCanvas((current) => [...current, item].slice(-MAX_CANVAS_ITEMS));
    commitSelectedId(null);
  }, [commitCanvas, commitSelectedId, createCanvasItem]);

  const combineNodes = useCallback((firstId, secondId) => {
    if (!firstId || !secondId || firstId === secondId) return;
    const currentItems = canvasItemsRef.current;
    const first = currentItems.find(({ id }) => id === firstId);
    const second = currentItems.find(({ id }) => id === secondId);
    if (!first || !second) return;

    const match = getRecipe(first.text, second.text);
    if (!match) {
      showReactionMessage(`No real-world connection for ${first.text} + ${second.text} yet.`);
      commitSelectedId(null);
      return;
    }

    const recipeKey = makeRecipeKey(first.text, second.text);
    const isNewWord = !libraryRef.current.includes(match.result);
    const resultNode = createCanvasItem(
      match.result,
      clamp((first.x + second.x) / 2, EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT),
      clamp((first.y + second.y) / 2, EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT),
    );

    commitCanvas((current) => [
      ...current.filter(({ id }) => id !== firstId && id !== secondId),
      resultNode,
    ]);

    if (isNewWord) {
      const nextLibrary = [...libraryRef.current, match.result];
      libraryRef.current = nextLibrary;
      setLibrary(nextLibrary);
    }

    setDiscoveredRecipeKeys((current) => current.includes(recipeKey) ? current : [...current, recipeKey]);
    setDiscovery({ ...match, recipeKey, ingredients: [first.text, second.text], isNewWord });
    commitSelectedId(null);
  }, [commitCanvas, commitSelectedId, createCanvasItem, showReactionMessage]);

  const findCollision = useCallback((itemId) => {
    const canvas = canvasRef.current;
    const dragged = canvasItemsRef.current.find(({ id }) => id === itemId);
    if (!canvas || !dragged) return null;

    const rect = canvas.getBoundingClientRect();
    const collisionDistance = clamp(Math.min(rect.width, rect.height) * 0.14, 66, 104);

    return canvasItemsRef.current
      .filter(({ id }) => id !== itemId)
      .map((item) => ({
        id: item.id,
        distance: Math.hypot(
          ((item.x - dragged.x) / 100) * rect.width,
          ((item.y - dragged.y) / 100) * rect.height,
        ),
      }))
      .filter(({ distance }) => distance <= collisionDistance)
      .sort((a, b) => a.distance - b.distance)[0]?.id ?? null;
  }, []);

  const handlePointerDown = useCallback((event, itemId) => {
    if (event.button !== 0) return;
    const item = canvasItemsRef.current.find(({ id }) => id === itemId);
    if (!item) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStateRef.current = {
      id: itemId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };

    commitCanvas((current) => [
      ...current.filter(({ id }) => id !== itemId),
      item,
    ]);
  }, [commitCanvas]);

  const handlePointerMove = useCallback((event, itemId) => {
    const drag = dragStateRef.current;
    const canvas = canvasRef.current;
    if (!drag || drag.id !== itemId || drag.pointerId !== event.pointerId || !canvas) return;

    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 5) {
      drag.moved = true;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT);

    commitCanvas((current) => current.map((item) => item.id === itemId ? { ...item, x, y } : item));
  }, [commitCanvas]);

  const handlePointerUp = useCallback((event, itemId) => {
    const drag = dragStateRef.current;
    if (!drag || drag.id !== itemId || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    dragStateRef.current = null;

    if (drag.moved) {
      const collisionId = findCollision(itemId);
      if (collisionId) combineNodes(itemId, collisionId);
      return;
    }

    const previousSelectedId = selectedIdRef.current;
    if (previousSelectedId && previousSelectedId !== itemId) {
      combineNodes(previousSelectedId, itemId);
    } else {
      commitSelectedId(previousSelectedId === itemId ? null : itemId);
    }
  }, [combineNodes, commitSelectedId, findCollision]);

  const handlePointerCancel = useCallback((event) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    dragStateRef.current = null;
  }, []);

  const handleKeyboardSelect = useCallback((itemId) => {
    const previousSelectedId = selectedIdRef.current;
    if (previousSelectedId && previousSelectedId !== itemId) {
      combineNodes(previousSelectedId, itemId);
    } else {
      commitSelectedId(previousSelectedId === itemId ? null : itemId);
    }
  }, [combineNodes, commitSelectedId]);

  const clearCanvas = useCallback(() => {
    commitCanvas([]);
    commitSelectedId(null);
    setDiscovery(null);
    setReactionMessage(null);
  }, [commitCanvas, commitSelectedId]);

  const discoveredWordCount = library.length - STARTER_ITEMS.length;
  const progressRatio = DISCOVERABLE_ITEMS.length === 0 ? 0 : discoveredWordCount / DISCOVERABLE_ITEMS.length;

  const filteredLibrary = useMemo(() => {
    const query = librarySearch.trim().toLowerCase();
    if (!query) return library;
    return library.filter((item) => {
      const data = getData(item);
      return item.includes(query)
        || data.name.toLowerCase().includes(query)
        || data.pinyin.toLowerCase().includes(query);
    });
  }, [library, librarySearch]);

  return (
    <main className="aurora-canvas flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden">
      <header className="relative z-40 flex min-h-17 shrink-0 items-center justify-between gap-3 border-b border-[var(--lab-line)] bg-[var(--lab-surface-90)] px-3 sm:px-5">
        <BrandMark compact />
        <div className="flex items-center gap-2">
          <div className="hidden rounded-full bg-[var(--lab-mint)] px-4 py-2 text-xs font-black text-[var(--lab-mint-ink)] sm:block">
            {discoveredWordCount}/{DISCOVERABLE_ITEMS.length} discoveries
          </div>
          <button type="button" onClick={clearCanvas} className="lift-control inline-flex min-h-11 items-center rounded-full px-3 text-xs font-black text-[var(--lab-muted)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 sm:px-4">
            Clear canvas
          </button>
          <Link href="/guide" className="lift-control inline-flex min-h-11 items-center rounded-full border border-[var(--lab-line-strong)] bg-[var(--lab-surface)] px-4 text-xs font-black text-[var(--lab-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 sm:text-sm">
            Notebook
          </Link>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(16rem,1fr)_minmax(0,43vh)] md:grid-cols-[minmax(0,1fr)_20rem] md:grid-rows-none xl:grid-cols-[minmax(0,1fr)_25rem]">
        <section ref={canvasRef} className="relative min-h-0 overflow-hidden border-b border-[var(--lab-line)] md:border-b-0 md:border-r" aria-labelledby="craft-canvas-title">
          <div className="soft-grid absolute inset-0 opacity-35" aria-hidden="true" />
          <div className="orbit-line -left-[15%] top-[7%] h-[70%] w-[75%]" aria-hidden="true" />

          <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[17rem] sm:left-6 sm:top-6">
            <div className="eyebrow">Chinese craft canvas</div>
            <h1 id="craft-canvas-title" className="mt-1 text-xl font-black tracking-[-0.04em] text-[var(--lab-ink)] sm:text-2xl">Make meaning collide.</h1>
            <p className="mt-1 text-xs font-bold leading-5 text-[var(--lab-muted)] sm:text-sm">Tap a word to place it. Drag two words together—or select one, then another—to combine.</p>
          </div>

          {canvasItems.length === 0 && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 pt-16 text-center">
              <div className="max-w-xs">
                <div className="hanzi-text text-6xl font-black text-[var(--lab-line-strong)]" lang="zh-Hans">水 · 火 · 风 · 土</div>
                <p className="mt-4 text-sm font-black text-[var(--lab-muted)]">Choose a starter word from your collection.</p>
                <p className="mt-1 text-xs font-bold text-[var(--lab-muted)]">Try water + earth first.</p>
              </div>
            </div>
          )}

          {canvasItems.map((item) => {
            const data = getData(item.text);
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onPointerDown={(event) => handlePointerDown(event, item.id)}
                onPointerMove={(event) => handlePointerMove(event, item.id)}
                onPointerUp={(event) => handlePointerUp(event, item.id)}
                onPointerCancel={handlePointerCancel}
                onClick={(event) => event.detail === 0 && handleKeyboardSelect(item.id)}
                aria-label={`${item.text}, ${data.name}. Drag to another word or select to combine.`}
                aria-pressed={isSelected}
                className={`craft-node absolute z-20 flex min-h-14 touch-none select-none items-center gap-2 rounded-[1.15rem] border bg-[var(--lab-surface)] px-3 py-2 text-left shadow-[0_10px_24px_var(--lab-shadow)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 ${isSelected ? 'border-[var(--lab-action)] ring-4 ring-[var(--lab-action)]/15' : 'border-[var(--lab-line-strong)]'}`}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                <span className="text-xl" aria-hidden="true">{data.emoji}</span>
                <span>
                  <span className="hanzi-text block text-xl font-black leading-none text-[var(--lab-ink)]" lang="zh-Hans">{item.text}</span>
                  <span className="mt-1 block text-[9px] font-black leading-none text-[var(--lab-action)]">{data.pinyin}</span>
                </span>
              </button>
            );
          })}

          {reactionMessage && (
            <div role="status" aria-live="polite" className="animate-no-reaction absolute left-1/2 top-5 z-40 max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-[var(--lab-ink)] px-5 py-3 text-center text-xs font-black text-[var(--lab-surface)] shadow-xl">
              {reactionMessage}
            </div>
          )}

          {discovery && (
            <DiscoveryCard
              discovery={discovery}
              playingCharacter={playingCharacter}
              onPlay={playPronunciation}
              onClose={() => setDiscovery(null)}
            />
          )}
        </section>

        <aside className="surface-panel relative z-30 flex h-full min-h-0 flex-col overflow-hidden rounded-t-[1.8rem] border-x-0 border-b-0 md:h-auto md:rounded-none md:border-0" aria-labelledby="collection-title">
          <div className="shrink-0 border-b border-[var(--lab-line)] p-4 sm:p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="eyebrow">Discovered words</div>
                <h2 id="collection-title" className="mt-1 text-2xl font-black tracking-[-0.04em] text-[var(--lab-ink)]">Your collection</h2>
              </div>
              <div className="text-right md:hidden">
                <div className="text-lg font-black text-[var(--lab-mint-ink)]">{discoveredWordCount}/{DISCOVERABLE_ITEMS.length}</div>
                <div className="text-[9px] font-black uppercase tracking-wider text-[var(--lab-muted)]">Found</div>
              </div>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--lab-surface-soft)]" aria-label={`${discoveredWordCount} of ${DISCOVERABLE_ITEMS.length} words discovered`}>
              <div className="h-full origin-left rounded-full bg-[var(--lab-mint-bright)] transition-transform duration-[var(--duration-celebration)] ease-[var(--ease-out)]" style={{ transform: `scaleX(${progressRatio})` }} />
            </div>

            <label className="relative mt-3 block">
              <span className="sr-only">Search discovered words</span>
              <svg aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--lab-muted)]" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input value={librarySearch} onChange={(event) => setLibrarySearch(event.target.value)} placeholder="Chinese, pinyin, or meaning" className="min-h-11 w-full rounded-full border border-[var(--lab-line)] bg-[var(--lab-surface)] py-2 pl-11 pr-4 text-sm font-bold text-[var(--lab-ink)] outline-none placeholder:text-[var(--lab-muted)] focus:border-[var(--lab-action)] focus:ring-4 focus:ring-[var(--lab-action)]/10" />
            </label>
          </div>

          <div className="custom-scrollbar grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto p-3 sm:gap-3 sm:p-4 md:grid-cols-1 xl:grid-cols-2">
            {filteredLibrary.map((text) => {
              const data = getData(text);
              const isStarter = STARTER_ITEMS.includes(text);
              return (
                <div key={text} className="group relative flex min-h-18 overflow-hidden rounded-[1.25rem] border border-[var(--lab-line)] bg-[var(--lab-surface)]">
                  <button type="button" onClick={() => spawnItem(text)} className="lift-control flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[var(--lab-action)]/25" aria-label={`Place ${text}, ${data.name}, on the craft canvas`}>
                    <span className="text-xl sm:text-2xl" aria-hidden="true">{data.emoji}</span>
                    <span className="min-w-0">
                      <span className="hanzi-text block truncate text-lg font-black leading-tight text-[var(--lab-ink)]" lang="zh-Hans">{text}</span>
                      <span className="block truncate text-[9px] font-black text-[var(--lab-action)]">{data.pinyin}</span>
                      <span className="block truncate text-[9px] font-bold text-[var(--lab-muted)]">{data.name}</span>
                    </span>
                    {isStarter && <span className="sr-only">Starter word</span>}
                  </button>
                  <PronunciationButton character={text} isPlaying={playingCharacter === text} onPlay={playPronunciation} className="m-1.5 h-11 w-11 shrink-0 self-center" />
                </div>
              );
            })}
            {filteredLibrary.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm font-bold text-[var(--lab-muted)]">No discovered word matches that search.</div>
            )}
          </div>
        </aside>
      </div>

      {pronunciationError && <div role="status" className="fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-full bg-[var(--lab-ink)] px-5 py-3 text-center text-xs font-black text-[var(--lab-surface)] shadow-xl">{pronunciationError}</div>}
    </main>
  );
}

function DiscoveryCard({ discovery, playingCharacter, onPlay, onClose }) {
  const [first, second] = discovery.ingredients;
  const firstData = getData(first);
  const secondData = getData(second);

  return (
    <section aria-label={`Discovered ${discovery.result}`} aria-live="polite" className="animate-ingredient-enter surface-panel absolute inset-x-3 bottom-3 z-40 mx-auto max-w-xl rounded-[1.6rem] p-3 shadow-[0_18px_50px_var(--lab-shadow)] sm:inset-x-6 sm:bottom-6 sm:p-4">
      <button type="button" onClick={onClose} className="lift-control absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-full text-lg font-black text-[var(--lab-muted)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25" aria-label="Close discovery card">×</button>
      <div className="flex items-center gap-3 pr-11">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[1rem] bg-[var(--lab-mint)] text-3xl" aria-hidden="true">{discovery.emoji}</span>
        <div className="min-w-0">
          <div className="eyebrow">{discovery.isNewWord ? 'New word discovered' : 'Crafted again'}</div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <h2 className="hanzi-text text-3xl font-black tracking-[-0.04em] text-[var(--lab-ink)]" lang="zh-Hans">{discovery.result}</h2>
            <span className="text-sm font-black text-[var(--lab-action)]">{discovery.pinyin}</span>
            <span className="text-sm font-bold text-[var(--lab-muted)]">{discovery.name}</span>
          </div>
        </div>
        <PronunciationButton character={discovery.result} isPlaying={playingCharacter === discovery.result} onPlay={onPlay} className="h-12 w-12 shrink-0" />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[1rem] bg-[var(--lab-lilac)] px-3 py-2 text-xs font-black text-[var(--lab-ink-soft)]">
        <span lang="zh-Hans">{firstData.emoji} {first}</span><span aria-hidden="true">+</span><span lang="zh-Hans">{secondData.emoji} {second}</span><span aria-hidden="true">→</span><span lang="zh-Hans">{discovery.emoji} {discovery.result}</span>
      </div>
      <p className="mt-2 text-xs font-bold leading-5 text-[var(--lab-muted)]">{discovery.explanation}</p>
    </section>
  );
}
