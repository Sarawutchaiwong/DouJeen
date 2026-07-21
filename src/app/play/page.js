'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  DISCOVERABLE_ITEMS,
  RECIPES,
  STARTER_ITEMS,
  getData,
  getRecipe,
  makeRecipeKey,
} from '../data';
import BrandMark from '../components/BrandMark';
import Glyph from '../components/Glyph';
import LocaleSwitcher from '../components/LocaleSwitcher';
import PronunciationButton from '../components/PronunciationButton';
import { useDialogFocus } from '../useDialogFocus';
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

// Minimum on-screen gap between two node centers, in pixels. Shared by drag-combine
// detection and overlap avoidance so "close enough to combine" and "too close, not
// allowed to rest there" are the same threshold.
const getMinNodeGapPx = (rect) => clamp(Math.min(rect.width, rect.height) * 0.14, 66, 104);
const RING_TRY_ANGLES = 10;

// Once the canvas has used up the hand-placed SPAWN_POINTS, later spawns fall
// back to a golden-angle spiral: each step turns by the same irrational angle
// and grows its radius, so no two spiral points ever land near each other
// (the classic sunflower-seed distribution) without any runtime overlap search.
// WHY: phase/radius tuned offline against the 9 hand-placed SPAWN_POINTS above
// so the spiral's early points don't land near them (plain angle=0 pointed
// straight at an existing point and nearly overlapped it).
const GOLDEN_ANGLE_RAD = 137.508 * (Math.PI / 180);
const SPIRAL_PHASE_RAD = 218 * (Math.PI / 180);
const spiralSpawnPoint = (overflowIndex) => {
  const angle = SPIRAL_PHASE_RAD + overflowIndex * GOLDEN_ANGLE_RAD;
  const radius = 25 + Math.sqrt(overflowIndex) * 9;
  return [
    clamp(50 + radius * Math.cos(angle), EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT),
    clamp(44 + radius * Math.sin(angle), EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT),
  ];
};

// Recipe adjacency: two words are "related" if a recipe links them as
// co-ingredients or as ingredient/result. Used to surface related words in search.
const RELATED = (() => {
  const map = new Map();
  const link = (a, b) => {
    if (a === b) return;
    if (!map.has(a)) map.set(a, new Set());
    map.get(a).add(b);
  };
  for (const recipe of Object.values(RECIPES)) {
    const [a, b] = recipe.ingredients;
    const r = recipe.result;
    link(a, b); link(b, a);
    link(a, r); link(r, a);
    link(b, r); link(r, b);
  }
  return map;
})();

// Text-match score: exact=3, prefix=2, substring=1, none=0. Matches char,
// pinyin, English name, and Thai name so search works in any of them.
const scoreItem = (data, char, query) => {
  const fields = [char, data.pinyin, data.name, data.nameTh]
    .filter(Boolean)
    .map((value) => value.toLowerCase());
  let best = 0;
  for (const field of fields) {
    if (field === query) best = Math.max(best, 3);
    else if (field.startsWith(query)) best = Math.max(best, 2);
    else if (field.includes(query)) best = Math.max(best, 1);
  }
  return best;
};

const HINT_AFTER_FAILS = 3;

// First recipe craftable from words already in the library but not yet discovered.
// Used to nudge a stuck player after repeated failed combines.
const findHint = (library) => {
  const owned = new Set(library);
  for (const recipe of Object.values(RECIPES)) {
    const [first, second] = recipe.ingredients;
    if (owned.has(first) && owned.has(second) && !owned.has(recipe.result)) {
      return { first, second };
    }
  }
  return null;
};

export default function GamePage() {
  const tNav = useTranslations('Nav');
  const tPlay = useTranslations('Play');
  const tSearch = useTranslations('Search');
  const locale = useLocale();
  const wordLabel = useCallback(
    (data) => (locale === 'th' && data.nameTh ? data.nameTh : data.name),
    [locale],
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [library, setLibrary] = useState(STARTER_ITEMS);
  const [discoveredRecipeKeys, setDiscoveredRecipeKeys] = useState([]);
  const [canvasItems, setCanvasItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [collisionTargetId, setCollisionTargetId] = useState(null);
  const [mobileSelection, setMobileSelection] = useState([]);
  const [discovery, setDiscovery] = useState(null);
  const [resetConfirming, setResetConfirming] = useState(false);
  const [reactionMessage, setReactionMessage] = useState(null);
  const [reactionIsHint, setReactionIsHint] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  const canvasRef = useRef(null);
  const nextItemIdRef = useRef(1);
  const canvasItemsRef = useRef([]);
  const libraryRef = useRef(STARTER_ITEMS);
  const selectedIdRef = useRef(null);
  const mobileSelectionRef = useRef([]);
  const dragStateRef = useRef(null);
  const reactionTimerRef = useRef(null);
  const failStreakRef = useRef(0);
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

  const commitMobileSelection = useCallback((next) => {
    mobileSelectionRef.current = next;
    setMobileSelection(next);
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

  const showReactionMessage = useCallback((message, isHint = false) => {
    window.clearTimeout(reactionTimerRef.current);
    setReactionMessage(message);
    setReactionIsHint(isHint);
    reactionTimerRef.current = window.setTimeout(() => setReactionMessage(null), 1800);
  }, []);

  const createCanvasItem = useCallback((text, x, y) => ({
    id: `craft-${nextItemIdRef.current++}`,
    text,
    x,
    y,
  }), []);

  // Finds a spot that doesn't overlap any existing node (excludeIds skips the node's own
  // former slot, e.g. a node being repositioned). Tries the given preferred points first,
  // then rings outward around the first preferred point, then falls back to the golden-angle
  // spiral used for board-filling spawns. WHY: a plain "next slot by item count" (the old
  // approach) breaks the moment items are removed by combining, since a later spawn can land
  // on a slot a surviving node already occupies.
  const findFreeSpot = useCallback((preferredPoints, excludeIds = []) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    const exclude = new Set(excludeIds);
    const others = canvasItemsRef.current.filter(({ id }) => !exclude.has(id));
    const minGap = rect ? getMinNodeGapPx(rect) : 0;
    const fits = (x, y) => !rect || others.every((item) => Math.hypot(
      ((item.x - x) / 100) * rect.width,
      ((item.y - y) / 100) * rect.height,
    ) >= minGap);

    for (const point of preferredPoints) {
      if (fits(...point)) return point;
    }

    const [baseX, baseY] = preferredPoints[0] ?? [50, 44];
    if (rect) {
      for (let ring = 1; ring <= 3; ring++) {
        const radiusPercent = (minGap * ring * 1.1 / Math.min(rect.width, rect.height)) * 100;
        for (let a = 0; a < RING_TRY_ANGLES; a++) {
          const angle = (a / RING_TRY_ANGLES) * Math.PI * 2;
          const x = clamp(baseX + radiusPercent * Math.cos(angle), EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT);
          const y = clamp(baseY + radiusPercent * Math.sin(angle), EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT);
          if (fits(x, y)) return [x, y];
        }
      }
    }

    for (let i = 0; i < MAX_CANVAS_ITEMS * 4; i++) {
      const point = spiralSpawnPoint(i);
      if (fits(...point)) return point;
    }
    return [baseX, baseY];
  }, []);

  const spawnItem = useCallback((text) => {
    const [x, y] = findFreeSpot(SPAWN_POINTS);
    const item = createCanvasItem(text, x, y);

    commitCanvas((current) => [...current, item].slice(-MAX_CANVAS_ITEMS));
    commitSelectedId(null);
  }, [commitCanvas, commitSelectedId, createCanvasItem, findFreeSpot]);

  const resolveCombination = useCallback((firstText, secondText, options = {}) => {
    const match = getRecipe(firstText, secondText);
    if (!match) {
      failStreakRef.current += 1;
      const hint = failStreakRef.current >= HINT_AFTER_FAILS ? findHint(libraryRef.current) : null;
      if (hint) {
        failStreakRef.current = 0;
        showReactionMessage(tPlay('hint', { first: hint.first, second: hint.second }), true);
      } else {
        showReactionMessage(tPlay('noConnection', { first: firstText, second: secondText }));
      }
      commitSelectedId(null);
      return false;
    }
    failStreakRef.current = 0;

    const {
      consumedIds = [],
      placeResult = true,
      resultX = 50,
      resultY = 44,
    } = options;
    const recipeKey = makeRecipeKey(firstText, secondText);
    const isNewWord = !libraryRef.current.includes(match.result);

    if (placeResult) {
      const consumedIdSet = new Set(consumedIds);
      const preferredSpot = [
        clamp(resultX, EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT),
        clamp(resultY, EDGE_PADDING_PERCENT, 100 - EDGE_PADDING_PERCENT),
      ];
      const [x, y] = findFreeSpot([preferredSpot], consumedIds);
      const resultNode = createCanvasItem(match.result, x, y);
      commitCanvas((current) => [
        ...current.filter(({ id }) => !consumedIdSet.has(id)),
        resultNode,
      ].slice(-MAX_CANVAS_ITEMS));
    }

    if (isNewWord) {
      const nextLibrary = [...libraryRef.current, match.result];
      libraryRef.current = nextLibrary;
      setLibrary(nextLibrary);
    }

    setDiscoveredRecipeKeys((current) => current.includes(recipeKey) ? current : [...current, recipeKey]);
    setDiscovery({ ...match, recipeKey, ingredients: [firstText, secondText], isNewWord });
    commitSelectedId(null);
    return true;
  }, [commitCanvas, commitSelectedId, createCanvasItem, findFreeSpot, showReactionMessage, tPlay]);

  const combineNodes = useCallback((firstId, secondId) => {
    if (!firstId || !secondId || firstId === secondId) return false;
    const currentItems = canvasItemsRef.current;
    const first = currentItems.find(({ id }) => id === firstId);
    const second = currentItems.find(({ id }) => id === secondId);
    if (!first || !second) return false;

    return resolveCombination(first.text, second.text, {
      consumedIds: [firstId, secondId],
      resultX: (first.x + second.x) / 2,
      resultY: (first.y + second.y) / 2,
    });
  }, [resolveCombination]);

  const selectMobileItem = useCallback((text) => {
    const [firstText] = mobileSelectionRef.current;
    if (!firstText) {
      commitMobileSelection([text]);
      return;
    }

    commitMobileSelection([]);
    resolveCombination(firstText, text, { placeResult: false });
  }, [commitMobileSelection, resolveCombination]);

  const handleLibrarySelect = useCallback((text) => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      selectMobileItem(text);
      return;
    }
    if (mobileSelectionRef.current.length > 0) commitMobileSelection([]);
    spawnItem(text);
  }, [commitMobileSelection, selectMobileItem, spawnItem]);

  const findCollision = useCallback((itemId, currentX, currentY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    let draggedX = currentX;
    let draggedY = currentY;
    
    if (draggedX === undefined) {
      const dragged = canvasItemsRef.current.find(({ id }) => id === itemId);
      if (!dragged) return null;
      draggedX = dragged.x;
      draggedY = dragged.y;
    }

    const rect = canvas.getBoundingClientRect();
    const collisionDistance = getMinNodeGapPx(rect);

    return canvasItemsRef.current
      .filter(({ id }) => id !== itemId)
      .map((item) => ({
        id: item.id,
        distance: Math.hypot(
          ((item.x - draggedX) / 100) * rect.width,
          ((item.y - draggedY) / 100) * rect.height,
        ),
      }))
      .filter(({ distance }) => distance <= collisionDistance)
      .sort((a, b) => a.distance - b.distance)[0]?.id ?? null;
  }, []);

  // A drag that ends on top of another node but doesn't yield a valid recipe would
  // otherwise leave the two nodes visually stacked. Push the dropped node to the
  // nearest open spot instead.
  const separateFromCollision = useCallback((itemId) => {
    const dragged = canvasItemsRef.current.find(({ id }) => id === itemId);
    if (!dragged) return;
    const [x, y] = findFreeSpot([[dragged.x, dragged.y]], [itemId]);
    commitCanvas((current) => current.map((item) => item.id === itemId ? { ...item, x, y } : item));
  }, [commitCanvas, findFreeSpot]);

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
      lastCollisionId: null,
    };

    // WHY: raise z-index instead of reordering the array. Moving the captured
    // node in the DOM makes iPad Safari drop the pointer capture, so the drag
    // stops tracking the finger. A CSS elevation keeps the element in place.
    setDraggingId(itemId);
  }, []);

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

    const collisionId = findCollision(itemId, x, y);
    if (drag.lastCollisionId !== collisionId) {
      drag.lastCollisionId = collisionId;
      setCollisionTargetId(collisionId);
    }

    commitCanvas((current) => current.map((item) => item.id === itemId ? { ...item, x, y } : item));
  }, [commitCanvas, findCollision]);

  const handlePointerUp = useCallback((event, itemId) => {
    const drag = dragStateRef.current;
    if (!drag || drag.id !== itemId || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    dragStateRef.current = null;
    setDraggingId(null);
    setCollisionTargetId(null);

    if (drag.moved) {
      const collisionId = findCollision(itemId);
      if (collisionId && !combineNodes(itemId, collisionId)) {
        separateFromCollision(itemId);
      }
      return;
    }

    const previousSelectedId = selectedIdRef.current;
    if (previousSelectedId && previousSelectedId !== itemId) {
      combineNodes(previousSelectedId, itemId);
    } else {
      commitSelectedId(previousSelectedId === itemId ? null : itemId);
    }
  }, [combineNodes, commitSelectedId, findCollision, separateFromCollision]);

  const handlePointerCancel = useCallback((event) => {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    dragStateRef.current = null;
    setDraggingId(null);
    setCollisionTargetId(null);
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
    commitMobileSelection([]);
    setDiscovery(null);
    setReactionMessage(null);
  }, [commitCanvas, commitMobileSelection, commitSelectedId]);

  const resetProgress = useCallback(() => {
    libraryRef.current = STARTER_ITEMS;
    setLibrary(STARTER_ITEMS);
    setDiscoveredRecipeKeys([]);
    clearCanvas();
    setLibrarySearch('');
    setResetConfirming(false);
    // The persistence effect rewrites localStorage with the cleared state.
  }, [clearCanvas]);

  const closeDiscovery = useCallback(() => setDiscovery(null), []);
  const closeResetConfirmation = useCallback(() => setResetConfirming(false), []);

  const discoveredWordCount = library.length - STARTER_ITEMS.length;
  const progressRatio = DISCOVERABLE_ITEMS.length === 0 ? 0 : discoveredWordCount / DISCOVERABLE_ITEMS.length;

  const filteredLibrary = useMemo(() => {
    const query = librarySearch.trim().toLowerCase();
    if (!query) return library;

    const inLibrary = new Set(library);
    const directHits = new Set();
    const scored = [];
    for (const char of library) {
      const score = scoreItem(getData(char), char, query);
      if (score > 0) {
        scored.push([char, score]);
        directHits.add(char);
      }
    }
    // Related = recipe-neighbors of direct hits, still in the library, not already matched.
    const related = new Set();
    for (const char of directHits) {
      for (const neighbor of RELATED.get(char) ?? []) {
        if (inLibrary.has(neighbor) && !directHits.has(neighbor)) related.add(neighbor);
      }
    }

    scored.sort((a, b) => b[1] - a[1]);
    return [...scored.map(([char]) => char), ...related];
  }, [library, librarySearch]);

  const hasOpenModal = Boolean(discovery) || resetConfirming;

  return (
    <main className="aurora-canvas flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden">
      <header inert={hasOpenModal ? true : undefined} aria-hidden={hasOpenModal ? 'true' : undefined} className="relative z-40 flex min-h-17 shrink-0 items-center justify-between gap-3 border-b border-[var(--lab-line)] bg-[var(--lab-surface-90)] px-3 sm:px-5">
        <BrandMark compact />
        <div className="flex items-center gap-2">
          <div className="hidden rounded-full bg-[var(--lab-mint)] px-4 py-2 text-xs font-black text-[var(--lab-mint-ink)] sm:block">
            {tPlay('discoveries', { count: discoveredWordCount, total: DISCOVERABLE_ITEMS.length })}
          </div>
          <button type="button" onClick={clearCanvas} className="lift-control inline-flex min-h-11 items-center rounded-full px-3 text-xs font-black text-[var(--lab-muted)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 sm:px-4">
            <span className="sm:hidden">{tPlay('clear')}</span>
            <span className="hidden sm:inline">{tPlay('clearCanvas')}</span>
          </button>
          <button type="button" onClick={() => setResetConfirming(true)} disabled={!hasLoaded} aria-haspopup="dialog" aria-expanded={resetConfirming} className="lift-control inline-flex min-h-11 items-center rounded-full border border-[var(--lab-line-strong)] px-3 text-xs font-black text-[var(--lab-muted)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4">
            <span className="sm:hidden">{tPlay('reset')}</span>
            <span className="hidden sm:inline">{tPlay('resetProgress')}</span>
          </button>
          <Link href="/guide" className="lift-control inline-flex min-h-11 items-center rounded-full border border-[var(--lab-line-strong)] bg-[var(--lab-surface)] px-4 text-xs font-black text-[var(--lab-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 sm:text-sm">
            {tNav('notebook')}
          </Link>
        </div>
      </header>

      <div inert={hasOpenModal ? true : undefined} aria-hidden={hasOpenModal ? 'true' : undefined} className="grid min-h-0 flex-1 grid-rows-[minmax(16rem,1fr)_minmax(0,43vh)] md:grid-cols-[minmax(0,1fr)_20rem] md:grid-rows-none xl:grid-cols-[minmax(0,1fr)_25rem]">
        <section ref={canvasRef} className="relative min-h-0 overflow-hidden border-b border-[var(--lab-line)] md:border-b-0 md:border-r" aria-label="Chinese craft canvas">
          <div className="soft-grid absolute inset-0 opacity-35" aria-hidden="true" />
          <div className="orbit-line -left-[15%] top-[7%] h-[70%] w-[75%]" aria-hidden="true" />

          <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[18rem] md:hidden">
            <div className="eyebrow">{tPlay('quickTapMode')}</div>
            <h1 className="mt-1 text-xl font-black tracking-[-0.04em] text-[var(--lab-ink)]">{tPlay('tapTwoWords')}</h1>
          </div>

          <div className="pointer-events-none absolute left-6 top-6 z-10 hidden max-w-[17rem] md:block">
            <div className="eyebrow">{tPlay('craftCanvas')}</div>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[var(--lab-ink)]">{tPlay('makeMeaningCollide')}</h1>
            <p className="mt-1 text-sm font-bold leading-5 text-[var(--lab-muted)]">{tPlay('canvasInstructions')}</p>
          </div>

          <div className="absolute inset-x-3 bottom-3 top-20 z-10 flex flex-col items-center justify-center md:hidden">
            <div className="flex items-center justify-center gap-2" aria-label="Quick combination slots">
              {[0, 1].map((slotIndex) => {
                const text = mobileSelection[slotIndex];
                const data = text ? getData(text) : null;
                return (
                  <React.Fragment key={slotIndex}>
                    {slotIndex === 1 && <span className="text-xl font-black text-[var(--lab-muted)]" aria-hidden="true">+</span>}
                    {text ? (
                      <button
                        type="button"
                        onClick={() => commitMobileSelection([])}
                        className="animate-ingredient-enter lift-control flex h-24 w-24 flex-col items-center justify-center rounded-[1.6rem] border border-[var(--lab-action)] bg-[var(--lab-surface)] shadow-[0_12px_30px_var(--lab-shadow)] ring-4 ring-[var(--lab-action)]/15 focus:outline-none focus-visible:ring-[6px] focus-visible:ring-[var(--lab-action)]/25"
                        aria-label={`Remove ${text} from the first quick combination slot`}
                      >
                        <span className="text-2xl" aria-hidden="true"><Glyph data={data} /></span>
                        <span className="hanzi-text mt-1 text-2xl font-black leading-none text-[var(--lab-ink)]" lang="zh-Hans">{text}</span>
                        <span className="mt-1 max-w-20 truncate text-[9px] font-black text-[var(--lab-action)]">{data.pinyin}</span>
                      </button>
                    ) : (
                      <div className="grid h-24 w-24 place-items-center rounded-[1.6rem] border border-dashed border-[var(--lab-line-strong)] bg-[var(--lab-surface-60)] text-center">
                        <div>
                          <span className="hanzi-text block text-2xl font-black text-[var(--lab-line-strong)]" aria-hidden="true">字</span>
                          <span className="mt-1 block text-[9px] font-black uppercase tracking-wider text-[var(--lab-muted)]">{slotIndex === 0 ? tPlay('first') : tPlay('second')}</span>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            <p role="status" aria-live="polite" className="mt-3 text-center text-xs font-black text-[var(--lab-muted)]">
              {mobileSelection.length === 0 ? tPlay('chooseFirst') : tPlay('nowTapSecond')}
            </p>
          </div>

          {canvasItems.length === 0 && (
            <div className="pointer-events-none absolute inset-0 hidden place-items-center px-6 pt-16 text-center md:grid">
              <div className="max-w-xs">
                <div className="hanzi-text text-6xl font-black text-[var(--lab-line-strong)]" lang="zh-Hans">水 · 火 · 风 · 土</div>
                <p className="mt-4 text-sm font-black text-[var(--lab-muted)]">{tPlay('chooseStarter')}</p>
                <p className="mt-1 text-xs font-bold text-[var(--lab-muted)]">{tPlay('tryWaterEarth')}</p>
              </div>
            </div>
          )}

          {canvasItems.map((item) => {
            const data = getData(item.text);
            const isSelected = selectedId === item.id;
            const isCollisionTarget = collisionTargetId === item.id;
            const isDragging = draggingId === item.id;
            
            let baseClasses = "craft-node animate-bubbly-pop -translate-x-1/2 -translate-y-1/2 absolute z-20 hidden min-h-14 touch-none select-none items-center gap-2 rounded-[1.15rem] border bg-[var(--lab-surface)] px-3 py-2 text-left shadow-[0_10px_24px_var(--lab-shadow)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 md:flex transition-transform duration-200 ease-out";
            
            if (isCollisionTarget) {
              baseClasses += " scale-110 border-[var(--lab-action)] ring-4 ring-[var(--lab-action)]/40 shadow-[0_0_20px_var(--lab-action-shadow)]";
            } else if (isDragging) {
              baseClasses += " scale-105 rotate-2 border-[var(--lab-line-strong)] shadow-2xl opacity-90";
            } else if (isSelected) {
              baseClasses += " border-[var(--lab-action)] ring-4 ring-[var(--lab-action)]/15";
            } else {
              baseClasses += " border-[var(--lab-line-strong)]";
            }

            return (
              <button
                key={item.id}
                type="button"
                onPointerDown={(event) => handlePointerDown(event, item.id)}
                onPointerMove={(event) => handlePointerMove(event, item.id)}
                onPointerUp={(event) => handlePointerUp(event, item.id)}
                onPointerCancel={handlePointerCancel}
                onClick={(event) => event.detail === 0 && handleKeyboardSelect(item.id)}
                aria-label={`${item.text}, ${wordLabel(data)}. Drag to another word or select to combine.`}
                aria-pressed={isSelected}
                className={baseClasses}
                style={{ left: `${item.x}%`, top: `${item.y}%`, zIndex: isDragging || isCollisionTarget ? 30 : undefined }}
              >
                <span className="text-xl" aria-hidden="true"><Glyph data={data} /></span>
                <span>
                  <span className="hanzi-text block text-xl font-black leading-none text-[var(--lab-ink)]" lang="zh-Hans">{item.text}</span>
                  <span className="mt-1 block text-[9px] font-black leading-none text-[var(--lab-action)]">{data.pinyin}</span>
                </span>
              </button>
            );
          })}

          {reactionMessage && (
            <div
              role="status"
              aria-live="polite"
              className={`animate-no-reaction absolute left-1/2 top-20 z-40 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 text-center text-xs font-black shadow-xl md:top-5 ${reactionIsHint ? 'bg-[var(--lab-mint)] text-[var(--lab-mint-ink)]' : 'bg-[var(--lab-ink)] text-[var(--lab-surface)]'}`}
            >
              {reactionIsHint && (
                <span className="animate-emerge grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--lab-mint-ink)] text-[10px] font-black text-[var(--lab-mint)]" aria-hidden="true">
                  i
                </span>
              )}
              <span className={reactionIsHint ? 'animate-ingredient-enter' : ''} style={reactionIsHint ? { animationDelay: '150ms' } : undefined}>
                {reactionMessage}
              </span>
            </div>
          )}

        </section>

        <aside className="surface-panel relative z-30 flex h-full min-h-0 flex-col overflow-hidden rounded-t-[1.8rem] border-x-0 border-b-0 md:h-auto md:rounded-none md:border-0" aria-labelledby="collection-title">
          <div className="shrink-0 border-b border-[var(--lab-line)] p-4 sm:p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="eyebrow">{tPlay('discoveredWords')}</div>
                <h2 id="collection-title" className="mt-1 text-2xl font-black tracking-[-0.04em] text-[var(--lab-ink)]">{tPlay('yourCollection')}</h2>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {/* Mobile: magnifier opens the spotlight-style search overlay. */}
                <button type="button" onClick={() => setSearchOpen(true)} aria-label={tSearch('label')} aria-haspopup="dialog" className="lift-control inline-grid h-11 w-11 place-items-center rounded-full border border-[var(--lab-line-strong)] bg-[var(--lab-surface)] text-[var(--lab-muted)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 md:hidden">
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
                </button>
                <div className="text-right md:hidden">
                  <div className="text-lg font-black text-[var(--lab-mint-ink)]">{discoveredWordCount}/{DISCOVERABLE_ITEMS.length}</div>
                  <div className="text-[9px] font-black uppercase tracking-wider text-[var(--lab-muted)]">{tPlay('found')}</div>
                </div>
                <LocaleSwitcher />
              </div>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--lab-surface-soft)]" aria-label={`${discoveredWordCount} of ${DISCOVERABLE_ITEMS.length} words discovered`}>
              <div className="h-full origin-left rounded-full bg-[var(--lab-mint-bright)] transition-transform duration-[var(--duration-celebration)] ease-[var(--ease-out)]" style={{ transform: `scaleX(${progressRatio})` }} />
            </div>

            {/* Desktop: inline search field. */}
            <label className="relative mt-3 hidden md:block">
              <span className="sr-only">{tSearch('label')}</span>
              <svg aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--lab-muted)]" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input value={librarySearch} onChange={(event) => setLibrarySearch(event.target.value)} placeholder={tSearch('placeholder')} className="min-h-11 w-full rounded-full border border-[var(--lab-line)] bg-[var(--lab-surface)] py-2 pl-11 pr-4 text-base font-bold text-[var(--lab-ink)] outline-none placeholder:text-[var(--lab-muted)] focus:border-[var(--lab-action)] focus:ring-4 focus:ring-[var(--lab-action)]/10 sm:text-sm" />
            </label>

          </div>

          <div className="custom-scrollbar grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto p-3 sm:gap-3 sm:p-4 md:grid-cols-1 xl:grid-cols-2">
            {filteredLibrary.map((text) => {
              const data = getData(text);
              const isStarter = STARTER_ITEMS.includes(text);
              return (
                <div key={text} className="group relative flex min-h-18 overflow-hidden rounded-[1.25rem] border border-[var(--lab-line)] bg-[var(--lab-surface)]">
                  <button
                    type="button"
                    onClick={() => handleLibrarySelect(text)}
                    aria-label={`Select ${text}, ${wordLabel(data)}, for crafting`}
                    aria-pressed={mobileSelection[0] === text ? true : undefined}
                    className={`lift-control flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[var(--lab-action)]/25 ${mobileSelection[0] === text ? 'bg-[var(--lab-sky)] ring-2 ring-inset ring-[var(--lab-action)]/25 md:bg-transparent md:ring-0' : ''}`}
                  >
                    <span className="text-xl sm:text-2xl" aria-hidden="true"><Glyph data={data} /></span>
                    <span className="min-w-0">
                      <span className="hanzi-text block truncate text-lg font-black leading-tight text-[var(--lab-ink)]" lang="zh-Hans">{text}</span>
                      <span className="block truncate text-[9px] font-black text-[var(--lab-action)]">{data.pinyin}</span>
                      <span className="block truncate text-[9px] font-bold text-[var(--lab-muted)]">{wordLabel(data)}{data.hskLevel ? ` · ${data.hskLevel}` : ''}</span>
                    </span>
                    {isStarter && <span className="sr-only">Starter word</span>}
                  </button>
                  <PronunciationButton character={text} isPlaying={playingCharacter === text} onPlay={playPronunciation} className="m-1.5 h-11 w-11 shrink-0 self-center" />
                </div>
              );
            })}
            {filteredLibrary.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm font-bold text-[var(--lab-muted)]">{tSearch('empty')}</div>
            )}
          </div>
        </aside>
      </div>

      {pronunciationError && <div role="status" className="fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-full bg-[var(--lab-ink)] px-5 py-3 text-center text-xs font-black text-[var(--lab-surface)] shadow-xl">{pronunciationError}</div>}
      {discovery && (
        <DiscoveryModal
          discovery={discovery}
          playingCharacter={playingCharacter}
          onPlay={playPronunciation}
          onClose={closeDiscovery}
        />
      )}
      {resetConfirming && (
        <ResetProgressModal
          onClose={closeResetConfirmation}
          onConfirm={resetProgress}
        />
      )}
      {searchOpen && (
        <SearchOverlay
          query={librarySearch}
          onQueryChange={setLibrarySearch}
          results={filteredLibrary}
          wordLabel={wordLabel}
          onSelect={(text) => { handleLibrarySelect(text); setSearchOpen(false); }}
          onClose={() => setSearchOpen(false)}
          t={tSearch}
        />
      )}
    </main>
  );
}

function SearchOverlay({ query, onQueryChange, results, wordLabel, onSelect, onClose, t }) {
  const inputRef = useRef(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('label')}
      onKeyDown={(event) => { if (event.key === 'Escape') onClose(); }}
      onClick={onClose}
      className="animate-backdrop-enter fixed inset-0 z-[80] flex flex-col items-center bg-[var(--lab-overlay)] px-3 pb-6 pt-[calc(env(safe-area-inset-top)+3rem)] backdrop-blur-xl"
    >
      {/* Spotlight-style floating panel */}
      <div className="animate-modal-enter flex min-h-0 w-full max-w-lg flex-col" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-2 rounded-[1.5rem] border border-[var(--lab-line)] bg-[var(--lab-surface)] px-3 py-2 shadow-[0_18px_50px_var(--lab-shadow)]">
          <svg aria-hidden="true" className="ml-1 shrink-0 text-[var(--lab-muted)]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t('placeholder')}
            enterKeyHint="search"
            aria-label={t('label')}
            className="min-h-11 min-w-0 flex-1 bg-transparent text-lg font-bold text-[var(--lab-ink)] outline-none placeholder:text-[var(--lab-muted)]"
          />
          <button type="button" onClick={onClose} className="lift-control shrink-0 rounded-full px-3 py-2 text-sm font-black text-[var(--lab-action)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">
            {t('cancel')}
          </button>
        </div>

        <div className="custom-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto rounded-[1.5rem] border border-[var(--lab-line)] bg-[var(--lab-surface)] p-2 shadow-[0_18px_50px_var(--lab-shadow)]">
          {results.length === 0 ? (
            <p className="py-10 text-center text-sm font-bold text-[var(--lab-muted)]">{t('empty')}</p>
          ) : (
            results.map((text) => {
              const data = getData(text);
              return (
                <button
                  key={text}
                  type="button"
                  onClick={() => onSelect(text)}
                  className="lift-control flex w-full items-center gap-3 rounded-[1.15rem] px-3 py-3 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[var(--lab-action)]/25"
                >
                  <span className="text-2xl" aria-hidden="true"><Glyph data={data} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="hanzi-text block truncate text-lg font-black leading-tight text-[var(--lab-ink)]" lang="zh-Hans">{text}</span>
                    <span className="block truncate text-[10px] font-black text-[var(--lab-action)]">{data.pinyin}</span>
                  </span>
                  <span className="shrink-0 truncate text-xs font-bold text-[var(--lab-muted)]">{wordLabel(data)}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function useModalController({ initialFocusRef, onClose }) {
  const [closing, setClosing] = useState(false);
  const dialogRef = useRef(null);
  const closingRef = useRef(false);
  const closeTimerRef = useRef(null);

  const requestClose = useCallback((afterClose) => {
    if (closingRef.current) return;

    closingRef.current = true;
    setClosing(true);
    const completion = typeof afterClose === 'function' ? afterClose : onClose;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    closeTimerRef.current = window.setTimeout(completion, prefersReducedMotion ? 0 : 240);
  }, [onClose]);

  const closeModal = useCallback(() => requestClose(), [requestClose]);

  React.useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  useDialogFocus({
    isOpen: true,
    dialogRef,
    initialFocusRef,
    onClose: closeModal,
  });

  return { closing, dialogRef, requestClose };
}

function ModalShell({ labelledBy, describedBy, dialogRef, closing, onClose, maxWidth = 'max-w-lg', children }) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-[80] flex h-[100dvh] items-center justify-center overflow-y-auto bg-[var(--lab-overlay)] p-4 backdrop-blur-[6px] sm:p-6 ${closing ? 'pointer-events-none animate-backdrop-exit' : 'animate-backdrop-enter'}`}
      onClick={() => onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={`surface-panel relative max-h-[calc(100dvh-2rem)] w-full ${maxWidth} overflow-y-auto rounded-[2.25rem] p-5 shadow-[0_28px_90px_var(--lab-shadow)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2.75rem] sm:p-8 ${closing ? 'animate-modal-exit' : 'animate-modal-enter'}`}
      >
        {children}
      </div>
    </div>
  );
}

function DiscoveryModal({ discovery, playingCharacter, onPlay, onClose }) {
  const primaryActionRef = useRef(null);
  const t = useTranslations('Play');
  const locale = useLocale();
  const discoveryName = locale === 'th' && discovery.nameTh ? discovery.nameTh : discovery.name;
  const { closing, dialogRef, requestClose } = useModalController({ initialFocusRef: primaryActionRef, onClose });
  const [first, second] = discovery.ingredients;
  const firstData = getData(first);
  const secondData = getData(second);

  return (
    <ModalShell
      labelledBy="discovery-title"
      describedBy="discovery-description"
      dialogRef={dialogRef}
      closing={closing}
      onClose={requestClose}
    >
      <>
          <button
            type="button"
            onClick={() => requestClose()}
            className="lift-control absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full text-xl font-black text-[var(--lab-muted)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 sm:right-5 sm:top-5"
            aria-label={t('closeDiscovery')}
          >
            ×
          </button>

          <div className="text-center">
            <div className="relative mx-auto h-20 w-20 sm:h-24 sm:w-24" aria-hidden="true">
              <div className="animate-vortex absolute -inset-7 rounded-full blur-[3px]" />
              <div className="animate-emerge relative grid h-full w-full place-items-center rounded-[1.7rem] bg-[var(--lab-mint)] text-4xl shadow-[0_10px_0_var(--lab-lilac)] sm:text-5xl" style={{ animationDelay: '1050ms' }}>
                <Glyph data={discovery} />
              </div>
            </div>
            <div className="eyebrow mt-6">{discovery.isNewWord ? t('newWord') : t('craftedAgain')}</div>
            <h2 id="discovery-title" className="hanzi-text mt-2 text-5xl font-black tracking-[-0.06em] text-[var(--lab-ink)] sm:text-6xl" lang="zh-Hans">
              {discovery.result}
            </h2>
            <p className="mt-1 text-lg font-black text-[var(--lab-action)]">{discovery.pinyin}</p>
            <p className="mt-1 text-sm font-bold text-[var(--lab-muted)]">
              {discoveryName}{discovery.hskLevel ? ` · ${discovery.hskLevel}` : ''}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 rounded-[1.35rem] bg-[var(--lab-lilac)] px-3 py-3 text-sm font-black text-[var(--lab-ink-soft)] sm:px-5">
            <span lang="zh-Hans"><Glyph data={firstData} /> {first}</span>
            <span aria-hidden="true">+</span>
            <span lang="zh-Hans"><Glyph data={secondData} /> {second}</span>
            <span aria-hidden="true">→</span>
            <span lang="zh-Hans"><Glyph data={discovery} /> {discovery.result}</span>
          </div>

          <p id="discovery-description" className="mt-4 text-center text-sm font-bold leading-6 text-[var(--lab-muted)]">
            {locale === 'th' && discovery.explanationTh ? discovery.explanationTh : discovery.explanation}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PronunciationButton
              character={discovery.result}
              isPlaying={playingCharacter === discovery.result}
              onPlay={onPlay}
              className="h-13 w-full shrink-0 rounded-full sm:w-14"
            />
            <button
              ref={primaryActionRef}
              type="button"
              onClick={() => requestClose()}
              className="lift-control min-h-13 flex-1 rounded-full bg-[var(--lab-action)] px-6 py-3 text-sm font-black text-white shadow-[0_7px_0_var(--lab-action-depth)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/30"
            >
              {t('keepExploring')}
            </button>
          </div>
      </>
    </ModalShell>
  );
}

function ResetProgressModal({ onClose, onConfirm }) {
  const cancelButtonRef = useRef(null);
  const t = useTranslations('Play');
  const { closing, dialogRef, requestClose } = useModalController({ initialFocusRef: cancelButtonRef, onClose });

  return (
    <ModalShell
      labelledBy="reset-title"
      describedBy="reset-description"
      dialogRef={dialogRef}
      closing={closing}
      onClose={requestClose}
      maxWidth="max-w-md"
    >
      <>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] bg-[var(--lab-peach)] text-4xl shadow-[0_10px_0_var(--lab-lilac)]" aria-hidden="true">
            ↺
          </div>
          <div className="mt-6 text-center">
            <div className="eyebrow">{t('resetEyebrow')}</div>
            <h2 id="reset-title" className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--lab-ink)]">
              {t('resetTitle')}
            </h2>
            <p id="reset-description" className="mt-3 text-sm font-bold leading-6 text-[var(--lab-muted)]">
              {t('resetDesc')}
            </p>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={() => requestClose()}
              className="lift-control min-h-13 flex-1 rounded-full border border-[var(--lab-line-strong)] bg-[var(--lab-surface)] px-5 py-3 text-sm font-black text-[var(--lab-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25"
            >
              {t('keepDiscoveries')}
            </button>
            <button
              type="button"
              onClick={() => requestClose(onConfirm)}
              className="lift-control min-h-13 flex-1 rounded-full bg-[var(--lab-danger)] px-5 py-3 text-sm font-black text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-danger)]/25"
            >
              {t('resetEverything')}
            </button>
          </div>
      </>
    </ModalShell>
  );
}
