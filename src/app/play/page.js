'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { BASE_CHARS, RECIPES, getData, getRecipe } from '../data';
import BrandMark from '../components/BrandMark';
import PronunciationButton from '../components/PronunciationButton';
import { usePronunciation } from '../usePronunciation';
import { useDialogFocus } from '../useDialogFocus';

const STARTER_CHARACTERS = Object.keys(BASE_CHARS);
const AVAILABLE_CHARACTERS = new Set([
  ...STARTER_CHARACTERS,
  ...Object.values(RECIPES).map(({ result }) => result),
]);
const COMBINATION_DURATION_MS = 300;
const REACTION_MESSAGE_DURATION_MS = 1600;

const getRandomHint = (library) => {
  const availableRecipes = Object.values(RECIPES).filter(({ ingredients, result }) =>
    !library.includes(result) && ingredients.every((ingredient) => library.includes(ingredient))
  );
  const candidates = availableRecipes.length > 0 ? availableRecipes : Object.values(RECIPES);
  const recipe = candidates[Math.floor(Math.random() * candidates.length)];
  const [first, second] = recipe.ingredients;
  return { name1: getData(first).name, name2: getData(second).name };
};

export default function GamePage() {
  const [library, setLibrary] = useState(STARTER_CHARACTERS);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeItems, setActiveItems] = useState([]);
  const [discovery, setDiscovery] = useState(null);
  const [discoveryClosing, setDiscoveryClosing] = useState(false);
  const [isCombining, setIsCombining] = useState(false);
  const [hint, setHint] = useState(null);
  const [reactionMessage, setReactionMessage] = useState(null);
  const [librarySearch, setLibrarySearch] = useState('');
  const combinationTimerRef = React.useRef(null);
  const reactionMessageTimerRef = React.useRef(null);
  const discoveryCloseTimerRef = React.useRef(null);
  const { playingCharacter, playPronunciation, pronunciationError } = usePronunciation();

  React.useEffect(() => {
    const saved = localStorage.getItem('doujeen_progress');
    let loadedLibrary = [...STARTER_CHARACTERS];
    if (saved) {
      try {
        const { unlocked } = JSON.parse(saved);
        if (Array.isArray(unlocked)) {
          const validUnlocked = unlocked.filter(
            (character) => typeof character === 'string' && AVAILABLE_CHARACTERS.has(character)
          );
          loadedLibrary = [...new Set([...STARTER_CHARACTERS, ...validUnlocked])];
        }
      } catch (error) {
        console.error('Failed to parse progress:', error);
      }
    }

    const timer = window.setTimeout(() => {
      setLibrary(loadedLibrary);
      setHasLoaded(true);
      setHint(getRandomHint(loadedLibrary));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem('doujeen_progress', JSON.stringify({ unlocked: library }));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [library, hasLoaded]);

  React.useEffect(() => () => {
    window.clearTimeout(combinationTimerRef.current);
    window.clearTimeout(reactionMessageTimerRef.current);
    window.clearTimeout(discoveryCloseTimerRef.current);
  }, []);

  const clearReactionMessage = () => {
    window.clearTimeout(reactionMessageTimerRef.current);
    reactionMessageTimerRef.current = null;
    setReactionMessage(null);
  };

  const processItems = (newActive) => {
    setActiveItems(newActive);
    if (newActive.length !== 2) return;

    clearReactionMessage();
    setIsCombining(true);
    const match = getRecipe(newActive[0].char, newActive[1].char);

    combinationTimerRef.current = window.setTimeout(() => {
      if (match) {
        window.clearTimeout(discoveryCloseTimerRef.current);
        setDiscoveryClosing(false);
        setDiscovery(match);
        const nextLibrary = library.includes(match.result) ? library : [...library, match.result];
        setLibrary(nextLibrary);
        setHint(getRandomHint(nextLibrary));
      } else {
        setReactionMessage('Those two do not form a word here. Keep the order in mind.');
        reactionMessageTimerRef.current = window.setTimeout(() => {
          setReactionMessage(null);
          reactionMessageTimerRef.current = null;
        }, REACTION_MESSAGE_DURATION_MS);
      }
      setActiveItems([]);
      setIsCombining(false);
      combinationTimerRef.current = null;
    }, COMBINATION_DURATION_MS);
  };

  const selectItem = (char) => {
    if (isCombining) return;
    processItems([...activeItems, { char, ...getData(char) }].slice(-2));
  };

  const closeDiscovery = React.useCallback(() => {
    window.clearTimeout(discoveryCloseTimerRef.current);
    setDiscoveryClosing(true);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    discoveryCloseTimerRef.current = window.setTimeout(() => {
      setDiscovery(null);
      setDiscoveryClosing(false);
      discoveryCloseTimerRef.current = null;
    }, reducedMotion ? 0 : 200);
  }, []);

  const handleDragStart = (event, char) => {
    event.dataTransfer.setData('text/plain', char);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const char = event.dataTransfer.getData('text/plain');
    if (!char || isCombining) return;
    processItems([...activeItems, { char, ...getData(char) }].slice(-2));
  };

  const discoveredWordCount = library.filter((item) => !BASE_CHARS[item]).length;
  const progressRatio = Math.min(discoveredWordCount / Object.keys(RECIPES).length, 1);
  const filteredLibrary = useMemo(() => {
    const query = librarySearch.trim().toLowerCase();
    if (!query) return library;
    return library.filter((item) => {
      const data = getData(item);
      return item.includes(query) || data.name.toLowerCase().includes(query) || data.pinyin.toLowerCase().includes(query);
    });
  }, [library, librarySearch]);

  return (
    <main className="aurora-canvas flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden">
      <header className="relative z-40 flex min-h-18 shrink-0 items-center justify-between gap-4 border-b border-[var(--lab-line)] bg-[var(--lab-surface-60)] px-4 sm:px-6">
        <BrandMark compact />
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full bg-[var(--lab-mint)] px-4 py-2 text-xs font-black text-[var(--lab-mint-ink)] sm:flex">
            <span>{discoveredWordCount}/{Object.keys(RECIPES).length}</span>
            <span className="font-bold opacity-75">words found</span>
          </div>
          <Link href="/guide" className="lift-control inline-flex min-h-11 items-center rounded-full border border-[var(--lab-line-strong)] bg-[var(--lab-surface)] px-4 text-sm font-black text-[var(--lab-ink)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">
            Answer key
          </Link>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(23rem,29rem)]">
        <section className="relative flex min-h-0 items-center justify-center p-3 sm:p-5 lg:p-7" aria-labelledby="lab-title">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className={`surface-panel relative flex h-full max-h-[42rem] min-h-[17rem] w-full max-w-[48rem] flex-col items-center justify-center overflow-hidden rounded-[2.5rem] p-5 transition-[transform,border-color,background-color] duration-[var(--duration-ui)] ease-[var(--ease-in-out)] sm:rounded-[3.5rem] sm:p-8 ${activeItems.length > 0 ? 'border-[var(--lab-line-strong)] bg-[var(--lab-surface)]' : ''}`}
          >
            <div className="orbit-line -inset-[18%]" aria-hidden="true" />
            <div className="orbit-line inset-[8%]" aria-hidden="true" />

            <div className="absolute left-5 top-5 z-10 sm:left-8 sm:top-7">
              <div className="eyebrow">Ordered reaction</div>
              <h1 id="lab-title" className="mt-1 text-xl font-black tracking-[-0.035em] text-[var(--lab-ink)] sm:text-2xl">Build a real word</h1>
            </div>

            <div className={`relative z-10 mt-7 flex items-center justify-center gap-2 sm:gap-5 ${isCombining ? 'animate-fusion' : ''}`}>
              {[0, 1].map((slotIndex) => {
                const item = activeItems[slotIndex];
                if (item) {
                  return (
                    <React.Fragment key={slotIndex}>
                      {slotIndex === 1 && <span className="text-xl font-light text-[var(--lab-muted)]" aria-hidden="true">+</span>}
                      <button
                        type="button"
                        onClick={() => !isCombining && setActiveItems((current) => current.filter((_, index) => index !== slotIndex))}
                        disabled={isCombining}
                        aria-label={`Remove ${item.char} from position ${slotIndex + 1}`}
                        className="animate-ingredient-enter lift-control relative flex h-28 w-28 flex-col items-center justify-center rounded-[2rem] border border-[var(--lab-line-strong)] bg-[var(--lab-surface)] shadow-[0_16px_40px_var(--lab-shadow)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 sm:h-40 sm:w-40 sm:rounded-[2.5rem]"
                      >
                        <span className="absolute left-3 top-3 text-[10px] font-black text-[var(--lab-muted)]">0{slotIndex + 1}</span>
                        <span className="text-3xl sm:text-5xl">{item.emoji}</span>
                        <span className="hanzi-text mt-1 text-3xl font-black text-[var(--lab-ink)] sm:text-4xl" lang="zh-Hans">{item.char}</span>
                        <span className="mt-1 text-[10px] font-bold text-[var(--lab-muted)] sm:text-xs">{item.pinyin}</span>
                      </button>
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={slotIndex}>
                    {slotIndex === 1 && <span className="text-xl font-light text-[var(--lab-muted)]" aria-hidden="true">+</span>}
                    <div className="relative grid h-28 w-28 place-items-center rounded-[2rem] border border-dashed border-[var(--lab-line-strong)] bg-[var(--lab-surface-40)] text-center sm:h-40 sm:w-40 sm:rounded-[2.5rem]">
                      <span className="absolute left-3 top-3 text-[10px] font-black text-[var(--lab-muted)]">0{slotIndex + 1}</span>
                      <div>
                        <span className="hanzi-text block text-3xl font-black text-[var(--lab-line-strong)]" aria-hidden="true">字</span>
                        <span className="mt-1 block text-[9px] font-black uppercase tracking-[0.12em] text-[var(--lab-muted)]">{slotIndex === 0 ? 'First' : 'Second'}</span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="absolute inset-x-4 bottom-4 z-10 flex justify-center sm:bottom-6">
              {reactionMessage ? (
                <div role="status" aria-live="polite" className="animate-no-reaction max-w-lg rounded-full border border-[var(--lab-peach)] bg-[var(--lab-surface)] px-5 py-3 text-center text-xs font-black text-[var(--lab-peach-ink)] shadow-[0_10px_30px_var(--lab-shadow)] sm:text-sm">
                  {reactionMessage}
                </div>
              ) : hint && (
                <div className="flex items-center gap-3 rounded-full border border-[var(--lab-line)] bg-[var(--lab-surface-90)] px-4 py-3 text-xs font-bold text-[var(--lab-muted)] shadow-[0_10px_30px_var(--lab-shadow)] sm:px-6 sm:text-sm">
                  <span className="inline-grid h-6 w-6 place-items-center rounded-full bg-[var(--lab-mint)] font-black text-[var(--lab-mint-ink)]">?</span>
                  Try <span className="font-black text-[var(--lab-action)]">{hint.name1}</span><span aria-hidden="true">→</span><span className="font-black text-[var(--lab-action)]">{hint.name2}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="surface-panel relative z-30 flex h-[46vh] min-h-0 flex-col overflow-hidden rounded-t-[2rem] border-x-0 border-b-0 lg:m-4 lg:ml-0 lg:h-auto lg:rounded-[2.5rem] lg:border">
          <div className="shrink-0 border-b border-[var(--lab-line)] p-4 sm:p-5 lg:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="eyebrow">Your collection</div>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[var(--lab-ink)]">Word palette</h2>
              </div>
              <div className="text-right sm:hidden">
                <div className="text-lg font-black text-[var(--lab-mint-ink)]">{discoveredWordCount}/{Object.keys(RECIPES).length}</div>
                <div className="text-[9px] font-black uppercase tracking-wider text-[var(--lab-muted)]">Found</div>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--lab-surface-soft)]" aria-label={`${discoveredWordCount} of ${Object.keys(RECIPES).length} words found`}>
              <div className="h-full origin-left rounded-full bg-[var(--lab-mint-bright)] transition-transform duration-[var(--duration-celebration)] ease-[var(--ease-out)]" style={{ transform: `scaleX(${progressRatio})` }} />
            </div>

            <label className="relative mt-4 block">
              <span className="sr-only">Search your word palette</span>
              <svg aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--lab-muted)]" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input value={librarySearch} onChange={(event) => setLibrarySearch(event.target.value)} placeholder="Character, pinyin, or meaning" className="min-h-11 w-full rounded-full border border-[var(--lab-line)] bg-[var(--lab-surface)] py-2 pl-11 pr-4 text-sm font-bold text-[var(--lab-ink)] outline-none placeholder:text-[var(--lab-muted)] focus:border-[var(--lab-action)] focus:ring-4 focus:ring-[var(--lab-action)]/10" />
            </label>
          </div>

          <div className="custom-scrollbar grid min-h-0 flex-1 grid-cols-4 content-start gap-3 overflow-y-auto p-4 sm:grid-cols-6 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLibrary.map((char, index) => {
              const data = getData(char);
              return (
                <div key={char} draggable onDragStart={(event) => handleDragStart(event, char)} className={`group relative min-h-24 select-none rounded-[1.5rem] border bg-[var(--lab-surface)] p-1 touch-manipulation ${index % 3 === 0 ? 'border-[var(--lab-line-strong)]' : 'border-[var(--lab-line)]'}`}>
                  <button type="button" onClick={() => selectItem(char)} className="lift-control relative flex h-full min-h-22 w-full cursor-grab flex-col items-center justify-center rounded-[1.25rem] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25 active:cursor-grabbing" aria-label={`Add ${char}, ${data.name}, to the next position`}>
                    <span className="pointer-events-none text-xl sm:text-2xl">{data.emoji}</span>
                    <span className="hanzi-text pointer-events-none mt-0.5 text-xl font-black leading-tight text-[var(--lab-ink)] sm:text-2xl" lang="zh-Hans">{char}</span>
                    <span className="pointer-events-none mt-0.5 max-w-full truncate px-1 text-[8px] font-bold text-[var(--lab-muted)] sm:text-[9px]">{data.pinyin}</span>
                    <span className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 w-5 place-items-center rounded-full bg-[var(--lab-pink)] text-xs font-black text-[var(--lab-action)] pointer-coarse:grid any-pointer-coarse:grid" aria-hidden="true">+</span>
                  </button>
                  <PronunciationButton character={char} isPlaying={playingCharacter === char} onPlay={playPronunciation} className="absolute -left-1.5 -top-1.5 z-20 h-11 w-11" />
                  <div className="pointer-events-none absolute -top-9 left-1/2 z-50 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--lab-ink)] px-3 py-1.5 text-[10px] font-black text-[var(--lab-surface)] opacity-0 transition-opacity duration-[var(--duration-tooltip)] group-hover:opacity-100 md:block">{data.name}</div>
                </div>
              );
            })}
            {filteredLibrary.length === 0 && (
              <div className="col-span-full py-8 text-center text-sm font-bold text-[var(--lab-muted)]">No matching tiles. Try a shorter search.</div>
            )}
          </div>
        </aside>
      </div>

      {pronunciationError && <div role="status" className="fixed left-1/2 top-20 z-[70] -translate-x-1/2 rounded-full bg-[var(--lab-ink)] px-5 py-3 text-center text-xs font-black text-[var(--lab-surface)] shadow-xl">{pronunciationError}</div>}

      <DiscoveryModal discovery={discovery} isClosing={discoveryClosing} onClose={closeDiscovery} onPlay={playPronunciation} playingCharacter={playingCharacter} />
    </main>
  );
}

function DiscoveryModal({ discovery, isClosing, onClose, onPlay, playingCharacter }) {
  const dialogRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);

  useDialogFocus({
    isOpen: Boolean(discovery) && !isClosing,
    dialogRef,
    initialFocusRef: closeButtonRef,
    onClose,
  });

  if (!discovery) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[var(--lab-overlay)] p-4 ${isClosing ? 'animate-backdrop-exit pointer-events-none' : 'animate-backdrop-enter'}`} onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="discovery-title" tabIndex={-1} onClick={(event) => event.stopPropagation()} className={`surface-panel relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[2.5rem] p-7 text-center sm:p-9 ${isClosing ? 'animate-modal-exit' : 'animate-modal-enter'}`}>
        <div className="animate-celebration-enter text-6xl sm:text-7xl">{discovery.emoji}</div>
        <div className="eyebrow mt-5">New word discovered</div>
        <h2 id="discovery-title" className="hanzi-text mt-2 text-6xl font-black tracking-[-0.05em] text-[var(--lab-ink)] sm:text-7xl" lang="zh-Hans">{discovery.result}</h2>
        <p className="mt-2 text-xl font-black text-[var(--lab-action)]">{discovery.pinyin}</p>
        <p className="mt-1 text-lg font-bold text-[var(--lab-muted)]">{discovery.name}</p>

        <div className="mt-6 flex items-center justify-between gap-4 rounded-[1.5rem] bg-[var(--lab-lilac)] p-4 text-left">
          <p className="text-sm font-bold leading-6 text-[var(--lab-ink-soft)]">Listen once, then repeat the complete word aloud.</p>
          <PronunciationButton character={discovery.result} isPlaying={playingCharacter === discovery.result} onPlay={onPlay} className="h-12 w-12 shrink-0" />
        </div>

        <button ref={closeButtonRef} type="button" onClick={onClose} className="lift-control mt-7 min-h-13 w-full rounded-full bg-[var(--lab-action)] px-6 text-lg font-black text-[var(--lab-surface)] shadow-[0_10px_25px_var(--lab-action-shadow)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)]/25">Keep exploring</button>
      </div>
    </div>
  );
}
