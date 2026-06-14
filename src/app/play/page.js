'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const BASE_CHARS = {
  '火': { char: '火', pinyin: 'huǒ', emoji: '🔥', name: 'Fire' },
  '山': { char: '山', pinyin: 'shān', emoji: '⛰️', name: 'Mountain' },
  '水': { char: '水', pinyin: 'shuǐ', emoji: '💧', name: 'Water' },
  '木': { char: '木', pinyin: 'mù', emoji: '🌲', name: 'Wood' },
  '土': { char: '土', pinyin: 'tǔ', emoji: '🌱', name: 'Earth' },
};

const RECIPES = {
  '火山': { result: '火山', pinyin: 'huǒshān', name: 'Volcano', emoji: '🌋' },
  '火木': { result: '炭', pinyin: 'tàn', name: 'Charcoal', emoji: '🖤' },
  '水木': { result: '树', pinyin: 'shù', name: 'Tree', emoji: '🌳' },
  '水火': { result: '汽', pinyin: 'qì', name: 'Steam', emoji: '💨' },
  '山山': { result: '岭', pinyin: 'lǐng', name: 'Mountain Range', emoji: '🏔️' },
  '木木': { result: '林', pinyin: 'lín', name: 'Grove', emoji: '🎋' },
  '林木': { result: '森林', pinyin: 'sēnlín', name: 'Forest', emoji: '🌲🌲' },
  '火火': { result: '炎', pinyin: 'yán', name: 'Blaze', emoji: '💥' },
  '水水': { result: '冰', pinyin: 'bīng', name: 'Ice', emoji: '🧊' },
  '水土': { result: '泥', pinyin: 'ní', name: 'Mud', emoji: '💩' },
  '山水': { result: '瀑', pinyin: 'pù', name: 'Waterfall', emoji: '🌊' },
  '木火': { result: '灰', pinyin: 'huī', name: 'Ash', emoji: '🌫️' },
  '土山': { result: '岛', pinyin: 'dǎo', name: 'Island', emoji: '🏝️' },
};

export default function GamePage() {
  const [library, setLibrary] = useState(['火', '山', '水', '木', '土']);
  const [activeItems, setActiveItems] = useState([]); 
  const [discovery, setDiscovery] = useState(null);
  const [isCombining, setIsCombining] = useState(false);

  const getData = (char) => {
    return BASE_CHARS[char] || RECIPES[Object.keys(RECIPES).find(k => RECIPES[k].result === char)] || { char, pinyin: '?', emoji: '✨' };
  };

  const handleDragStart = (e, char) => {
    e.dataTransfer.setData('text/plain', char);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const char = e.dataTransfer.getData('text/plain');
    if (!char || isCombining) return;

    const newItem = { char, ...getData(char) };
    const newActive = [...activeItems, newItem].slice(-2);
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
        }
        setActiveItems([]);
        setIsCombining(false);
      }, 1000);
    }
  };

  return (
    <main className="h-screen w-full bg-[#FFF9DB] font-sans overflow-hidden flex flex-col md:flex-row relative">
      
      {/* Background Decor: The "Stage" */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffffff_0%,_transparent_70%)] opacity-40 pointer-events-none"></div>
      
      {/* Floating Header HUD */}
      <nav className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-40 pointer-events-none">
        <Link 
          href="/"
          className="pointer-events-auto bg-white shadow-[0_6px_0_#efefef] hover:shadow-[0_4px_0_#efefef] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none p-4 rounded-3xl text-[#74C0FC] transition-all border-2 border-zinc-100"
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
                 <div className="flex flex-col items-center gap-4 opacity-20">
                   <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-8 border-[#FFD8A8] flex items-center justify-center text-4xl font-black text-[#FFD8A8]">?</div>
                   <span className="text-[10px] font-black text-[#FFD8A8] tracking-[0.5em] uppercase">Combine</span>
                 </div>
               )}
               
               {activeItems.map((item, i) => (
                 <div key={i} className="w-24 h-24 md:w-40 md:h-40 bg-white rounded-[40px] md:rounded-[50px] shadow-[0_12px_0_#efefef] flex flex-col items-center justify-center animate-[zoom-in_0.4s_ease-out] border-4 border-white ring-8 ring-white/10">
                   <span className="text-4xl md:text-6xl mb-1">{item.emoji}</span>
                   <span className="text-2xl md:text-4xl font-black text-zinc-800">{item.char}</span>
                   <span className="text-[8px] md:text-xs font-black text-zinc-300 uppercase mt-1">{item.pinyin}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Floating Hint HUD */}
        <div className="absolute bottom-10 md:bottom-12 bg-white/90 px-8 py-4 rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.05)] border-2 border-white backdrop-blur-md animate-[bounce_4s_infinite] flex items-center gap-4">
          <div className="w-8 h-8 bg-[#B2F2BB] rounded-full flex items-center justify-center text-white text-xs font-black">!</div>
          <p className="text-zinc-600 font-black text-xs md:text-sm tracking-tight">
            TRY: <span className="text-[#74C0FC]">Mountain</span> + <span className="text-[#74C0FC]">Earth</span>
          </p>
        </div>
      </section>

      {/* The Journal HUD - Floating Sticker Palette with Breathing Room */}
      <aside className="w-full md:w-[440px] h-[45vh] md:h-[80vh] md:my-auto md:ml-12 md:mr-4 md:rounded-[60px] bg-white/40 backdrop-blur-3xl border-t-8 md:border-8 border-[#B2F2BB] shadow-[0_40px_80px_rgba(0,0,0,0.12)] flex flex-col z-30 overflow-hidden transition-all ring-1 ring-white/50 relative">
        <div className="p-6 md:p-10 bg-white/20 border-b-2 border-[#B2F2BB]/20 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h2 className="text-3xl font-black text-[#74C0FC] tracking-tighter leading-none">MY WORDS</h2>
              <span className="text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase mt-1">Sticker Collection</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-2xl font-black text-[#2b5e32] leading-none">{library.length}</span>
              <span className="text-[8px] font-black text-zinc-400 uppercase">Found</span>
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
        
        <div className="flex-1 grid grid-cols-4 md:grid-cols-3 gap-3 md:gap-5 p-6 md:p-10 overflow-y-auto custom-scrollbar content-start">
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
                  flex flex-col items-center justify-center cursor-grab active:cursor-grabbing 
                  hover:scale-110 hover:-translate-y-2 hover:rotate-2 transition-all duration-300 
                  border-[3px] md:border-[5px] ${index % 2 === 0 ? 'border-[#74C0FC]' : 'border-[#FFD8A8]'}
                  group relative p-1 select-none overflow-visible
                `}
              >
                <span className="text-2xl md:text-4xl mb-0.5 group-hover:scale-110 group-hover:animate-bounce transition-transform">{data.emoji}</span>
                <span className="text-xl md:text-2xl font-black text-zinc-800 leading-tight">{char}</span>
                <span className="text-[7px] md:text-[9px] font-black text-zinc-300 uppercase tracking-tighter mt-0.5">{data.pinyin}</span>
                
                {/* Visual Polish: Corner Shine */}
                <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Discovery Modal - Premium Game Overlay */}
      {discovery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FFF9DB]/80 backdrop-blur-md animate-[fade-in_0.3s_ease-out]">
          <div className="bg-white rounded-[60px] p-8 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-[12px] border-[#B2F2BB] text-center max-w-sm md:max-w-md w-full animate-[bounce-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)] relative">
            <div className="text-7xl md:text-9xl mb-6 animate-bounce drop-shadow-xl">{discovery.emoji}</div>
            <h2 className="text-xl md:text-2xl font-black text-[#74C0FC] mb-6 uppercase tracking-[0.2em]">New Secret Found!</h2>
            
            <div className="bg-zinc-50 p-8 rounded-[40px] mb-8 border-4 border-dashed border-[#B2F2BB]/50">
              <p className="text-6xl md:text-8xl font-black text-zinc-800 mb-2">{discovery.result}</p>
              <p className="text-xl md:text-2xl font-black text-[#74C0FC] uppercase tracking-widest">{discovery.pinyin}</p>
            </div>
            
            <p className="text-2xl font-black text-zinc-400 mb-10 italic">"{discovery.name}"</p>
            
            <button 
              onClick={() => setDiscovery(null)}
              className="w-full bg-[#74C0FC] text-white py-5 rounded-[30px] text-xl font-black shadow-[0_10px_0_#3d8ecf] hover:translate-y-[2px] hover:shadow-[0_8px_0_#3d8ecf] active:translate-y-[6px] active:shadow-none transition-all"
            >
              GREAT!
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #B2F2BB; border-radius: 20px; }
        
        @keyframes fusion {
          0% { transform: scale(1); }
          20% { transform: scale(1.1) rotate(5deg); }
          40% { transform: scale(0.9) rotate(-5deg); }
          60% { transform: scale(1.3); filter: brightness(1.2); }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-fusion { animation: fusion 1s forwards cubic-bezier(0.68, -0.55, 0.265, 1.55); }
      `}</style>
    </main>
  );
}
