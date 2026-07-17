'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BASE_CHARS, RECIPES, getData } from '../data';
import PronunciationButton from '../components/PronunciationButton';
import { usePronunciation } from '../usePronunciation';
import { useDialogFocus } from '../useDialogFocus';

const STARTER_CHARACTERS = Object.keys(BASE_CHARS);
const AVAILABLE_CHARACTERS = new Set([
  ...STARTER_CHARACTERS,
  ...Object.values(RECIPES).map(({ result }) => result),
]);

const getRandomHint = () => {
  const keys = Object.keys(RECIPES);
  const randomCombo = keys[Math.floor(Math.random() * keys.length)];
  const char1 = randomCombo[0];
  const char2 = randomCombo[1];
  return {
    name1: getData(char1).name,
    name2: getData(char2).name
  };
};

export default function GamePage() {
  const [library, setLibrary] = useState(STARTER_CHARACTERS);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeItems, setActiveItems] = useState([]); 
  const [discovery, setDiscovery] = useState(null);
  const [isCombining, setIsCombining] = useState(false);
  const [hint, setHint] = useState(null);
  const {
    playingCharacter,
    playPronunciation,
    pronunciationError,
  } = usePronunciation();

  React.useEffect(() => {
    // Load progress from localStorage on mount
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
      } catch (e) {
        console.error('Failed to parse progress:', e);
      }
    }

    const timer = setTimeout(() => {
      setLibrary(loadedLibrary);
      setHasLoaded(true);
      setHint(getRandomHint());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!hasLoaded) return;
    try {
      const progress = {
        unlocked: library,
      };
      localStorage.setItem('doujeen_progress', JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, [library, hasLoaded]);

  const processItems = (newActive) => {
    setActiveItems(newActive);

    if (newActive.length === 2) {
      setIsCombining(true);
      const combo1 = newActive[0].char + newActive[1].char;
      const combo2 = newActive[1].char + newActive[0].char;
      const match = RECIPES[combo1] || RECIPES[combo2];

      setTimeout(() => {
        if (match) {
          setDiscovery(match);
          if (!library.includes(match.result)) {
            setLibrary(prev => [...prev, match.result]);
          }
          setHint(getRandomHint()); // New hint after discovery
        }
        setActiveItems([]);
        setIsCombining(false);
      }, 1000);
    }
  };

  const selectItem = (char) => {
    if (isCombining) return;
    const newItem = { char, ...getData(char) };
    const newActive = [...activeItems, newItem].slice(-2);
    processItems(newActive);
  };

  const closeDiscovery = React.useCallback(() => setDiscovery(null), []);

  const handleDragStart = (e, char) => {
    e.dataTransfer.setData('text/plain', char);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const char = e.dataTransfer.getData('text/plain');
    if (!char || isCombining) return;

    const newItem = { char, ...getData(char) };
    const newActive = [...activeItems, newItem].slice(-2);
    processItems(newActive);
  };

  return (
    <main className="h-screen w-full bg-[#FFF9DB] font-sans overflow-hidden flex flex-col lg:flex-row relative">
      
      {/* Background Decor: The "Stage" */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffffff_0%,_transparent_70%)] opacity-40 pointer-events-none"></div>
      
      {/* Floating Header HUD */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-40 pointer-events-none">
        <Link 
          href="/"
          className="pointer-events-auto bg-white shadow-[0_6px_0_#efefef] hover:shadow-[0_4px_0_#efefef] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none p-4 rounded-3xl text-[var(--lab-action)] transition-all border-2 border-zinc-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </Link>
        
        <div className="hidden md:flex flex-col items-end pointer-events-none">
          
        </div>
      </nav>

      {/* Main Game Stage */}
      <section className="flex-1 relative flex flex-col items-center justify-center p-4 z-10">
        
        {/* The Discovery Pot - Refined Centerpiece */}
        <div className="relative group">
          {/* External Glow Rings */}
          <div className="absolute -inset-20 bg-[#74C0FC]/5 rounded-full blur-3xl animate-pulse group-hover:bg-[#74C0FC]/10 transition-colors"></div>
          
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`
              relative w-72 h-72 sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px]
              bg-white/40 backdrop-blur-sm border-[12px] border-dashed border-[#FFD8A8] rounded-[100px] md:rounded-[140px]
              flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${activeItems.length > 0 ? 'scale-105 border-[#74C0FC] bg-white/60 shadow-[0_30px_100px_rgba(116,192,252,0.2)]' : 'shadow-inner'}
            `}
          >
             {/* Combination Slot Visuals */}
             <div className={`flex gap-4 md:gap-8 items-center justify-center ${isCombining ? 'animate-fusion' : ''}`}>
               {activeItems.length === 0 && (
                 <div className="flex flex-col items-center gap-4">
                   <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-8 border-[#FFD8A8] flex items-center justify-center text-4xl font-black text-[var(--lab-peach-ink)]">?</div>
                   <span className="text-[10px] font-black text-[var(--lab-peach-ink)] tracking-[0.5em] uppercase">Combine</span>
                 </div>
               )}
               
               {activeItems.map((item, i) => (
                 <button
                   type="button"
                   key={i} 
                   onClick={() => !isCombining && setActiveItems(prev => prev.filter((_, idx) => idx !== i))}
                   disabled={isCombining}
                   aria-label={`Remove ${item.char} from combination`}
                   className={`
                     w-24 h-24 md:w-40 md:h-40 bg-white rounded-[40px] md:rounded-[50px] 
                     shadow-[0_12px_0_#efefef] flex flex-col items-center justify-center 
                     animate-[zoom-in_0.4s_ease-out] border-4 border-white ring-8 ring-white/10
                     focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)] focus-visible:ring-offset-4
                     ${!isCombining ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : 'cursor-wait'}
                   `}
                 >
                   <span className="text-4xl md:text-6xl mb-1">{item.emoji}</span>
                   <span className="text-2xl md:text-4xl font-black text-zinc-800">{item.char}</span>
                   <span className="text-[8px] md:text-xs font-black text-[var(--lab-muted)] uppercase mt-1">{item.pinyin}</span>
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Floating Hint HUD */}
        {hint && (
          <div className="absolute bottom-4 md:bottom-12 bg-white/90 px-3 py-1.5 md:px-8 md:py-4 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.05)] border-2 border-white backdrop-blur-md animate-[bounce_4s_infinite] flex items-center gap-2 md:gap-4">
            <div className="w-5 h-5 md:w-8 md:h-8 bg-[#B2F2BB] rounded-full flex items-center justify-center text-[var(--lab-mint-ink)] text-[8px] md:text-xs font-black">!</div>
            <p className="text-zinc-600 font-black text-[9px] md:text-sm tracking-tight">
              TRY: <span className="text-[var(--lab-action)]">{hint.name1}</span> + <span className="text-[var(--lab-action)]">{hint.name2}</span>
            </p>
          </div>
        )}
      </section>

      {/* The Journal HUD - Floating Sticker Palette with Breathing Room */}
      <aside className="h-[45vh] w-full border-t-8 border-[#B2F2BB] bg-white/40 shadow-[0_40px_80px_rgba(0,0,0,0.12)] ring-1 ring-white/50 backdrop-blur-3xl flex flex-col z-30 overflow-hidden transition-all relative lg:my-auto lg:ml-12 lg:mr-4 lg:h-[80vh] lg:w-[440px] lg:rounded-[60px] lg:border-8">
        <div className="p-6 md:p-10 bg-white/20 border-b-2 border-[#B2F2BB]/20 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h2 className="text-3xl font-black text-[var(--lab-action)] tracking-tighter leading-none">MY WORDS</h2>
              <span className="text-[10px] font-black text-[var(--lab-muted)] tracking-[0.2em] uppercase mt-1">Sticker Collection</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-[#2b5e32] leading-none">{library.length}</span>
              <span className="text-[8px] font-black text-[var(--lab-muted)] uppercase">Found</span>
            </div>
          </div>
          
          {/* Progress Bar with Glow */}
          <div className="relative w-full h-4 bg-white/50 rounded-full overflow-hidden border-2 border-[#B2F2BB]/30 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#B2F2BB] via-[#8ce99a] to-[#B2F2BB] shadow-[0_0_15px_rgba(178,242,187,0.8)] transition-all duration-1000 ease-out animate-pulse" 
              style={{ width: `${(library.length / (Object.keys(RECIPES).length + 5)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="custom-scrollbar grid flex-1 grid-cols-4 content-start gap-3 overflow-y-auto p-6 md:gap-5 md:p-10 lg:grid-cols-3">
          {library.map((char, index) => {
            const data = getData(char);
            return (
              <div
                key={char}
                draggable
                onDragStart={(e) => handleDragStart(e, char)}
                className={`
                  aspect-square bg-white rounded-[28px] md:rounded-[36px] 
                  shadow-[0_8px_0_#efefef] hover:shadow-[0_4px_0_#efefef]
                  hover:scale-110 hover:-translate-y-2 hover:rotate-2 transition-all duration-300 
                  border-[3px] md:border-[5px] ${index % 2 === 0 ? 'border-[#74C0FC]' : 'border-[#FFD8A8]'}
                  group relative p-1 select-none overflow-visible touch-manipulation
                `}
              >
                <button
                  type="button"
                  onClick={() => selectItem(char)}
                  className="relative flex h-full w-full cursor-grab flex-col items-center justify-center rounded-[24px] active:cursor-grabbing focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)] focus-visible:ring-offset-2"
                  aria-label={`Add ${char} to combination`}
                >
                  <span className="pointer-events-none text-2xl md:text-4xl mb-0.5 transition-transform group-hover:scale-110">{data.emoji}</span>
                  <span className="pointer-events-none text-xl md:text-2xl font-black text-zinc-800 leading-tight">{char}</span>
                  <span className="pointer-events-none text-[7px] md:text-[9px] font-black text-[var(--lab-muted)] uppercase tracking-tighter mt-0.5">{data.pinyin}</span>
                  <span className="pointer-events-none absolute -right-2 -top-2 hidden h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--lab-action)] text-lg font-black text-white shadow-lg pointer-coarse:flex any-pointer-coarse:flex" aria-hidden="true">+</span>
                </button>

                <PronunciationButton
                  character={char}
                  isPlaying={playingCharacter === char}
                  onPlay={playPronunciation}
                  className="absolute -left-2 -top-2 z-20 h-11 w-11"
                />

                {/* Desktop Hover Tooltip - Meaning */}
                <div className="hidden md:flex absolute -top-10 left-1/2 -translate-x-1/2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 bg-zinc-800 text-white text-[10px] font-black py-1.5 px-3 rounded-xl whitespace-nowrap shadow-xl z-50 items-center justify-center">
                  {data.name}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45"></div>
                </div>

                {/* Visual Polish: Corner Shine */}
                <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>
      </aside>

      {pronunciationError && (
        <div
          role="status"
          className="fixed left-1/2 top-5 z-[70] -translate-x-1/2 rounded-full bg-zinc-800 px-5 py-3 text-center text-xs font-black text-white shadow-xl"
        >
          {pronunciationError}
        </div>
      )}

      <DiscoveryModal
        discovery={discovery}
        onClose={closeDiscovery}
        onPlay={playPronunciation}
        playingCharacter={playingCharacter}
      />
    </main>
  );
}

function DiscoveryModal({ discovery, onClose, onPlay, playingCharacter }) {
  const dialogRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);

  useDialogFocus({
    isOpen: Boolean(discovery),
    dialogRef,
    initialFocusRef: closeButtonRef,
    onClose,
  });

  if (!discovery) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FFF9DB]/80 backdrop-blur-md animate-[fade-in_0.3s_ease-out]"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discovery-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="bg-white rounded-[60px] p-8 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-[12px] border-[#B2F2BB] text-center max-w-sm md:max-w-md w-full animate-[bounce-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)] relative max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <div className="text-7xl md:text-9xl mb-6 animate-bounce drop-shadow-xl">{discovery.emoji}</div>
        <h2 id="discovery-title" className="text-xl md:text-2xl font-black text-[var(--lab-action)] mb-6 uppercase tracking-[0.2em]">New Secret Found!</h2>
        
        <div className="bg-zinc-50 p-8 rounded-[40px] mb-8 border-4 border-dashed border-[#B2F2BB]/50">
          <p className="text-6xl md:text-8xl font-black text-zinc-800 mb-2">{discovery.result}</p>
          <p className="text-xl md:text-2xl font-black text-[var(--lab-action)] uppercase tracking-widest">{discovery.pinyin}</p>
          <PronunciationButton
            character={discovery.result}
            isPlaying={playingCharacter === discovery.result}
            onPlay={onPlay}
            className="mx-auto mt-5 h-12 w-12"
          />
        </div>
        
        <div className="mb-8 rounded-[28px] bg-[#FFF9DB] p-5 text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--lab-peach-ink)]">Chinese connection</p>
          <p className="mt-2 text-sm font-bold leading-6 text-zinc-700">
            <span lang="zh-CN" className="font-black text-zinc-900">{discovery.result}</span> means <span className="font-black">{discovery.name}</span>. Say <span className="font-black text-[var(--lab-action)]">{discovery.pinyin}</span> aloud, then tap the speaker and repeat.
          </p>
        </div>

        <p className="text-2xl font-black text-[var(--lab-muted)] mb-8 italic">&ldquo;{discovery.name}&rdquo;</p>
        
        <button 
          ref={closeButtonRef}
          onClick={onClose}
          className="w-full bg-[var(--lab-action)] text-white py-5 rounded-[30px] text-xl font-black shadow-[0_10px_0_var(--lab-action-shadow)] hover:bg-[var(--lab-action-hover)] hover:translate-y-[2px] hover:shadow-[0_8px_0_var(--lab-action-shadow)] active:translate-y-[6px] active:shadow-none transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--lab-action)] focus-visible:ring-offset-4"
        >
          GREAT!
        </button>
      </div>
    </div>
  );
}
