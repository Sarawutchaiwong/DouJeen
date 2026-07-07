'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { BASE_CHARS, RECIPES, getData } from '../data';

export default function GuidePage() {
  const [search, setSearch] = useState('');
  const [revealed, setRevealed] = useState({});
  const [progress, setProgress] = useState([]);
  const [sandboxItems, setSandboxItems] = useState([]);
  const [sandboxResult, setSandboxResult] = useState(null);

  useEffect(() => {
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
  }, []);

  const toggleReveal = (key) => {
    setRevealed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const revealAll = () => {
    const all = {};
    Object.keys(RECIPES).forEach(k => { all[k] = true; });
    setRevealed(all);
  };

  const hideAll = () => {
    setRevealed({});
    setSearch('');
  };

  // Add to sandbox "cauldron"
  const addToSandbox = (char) => {
    if (sandboxItems.length >= 2) {
      setSandboxItems([char]);
      setSandboxResult(null);
    } else {
      const newItems = [...sandboxItems, char];
      setSandboxItems(newItems);
      
      if (newItems.length === 2) {
        const combo1 = newItems[0] + newItems[1];
        const combo2 = newItems[1] + newItems[0];
        const match = RECIPES[combo1] || RECIPES[combo2];
        if (match) {
          setTimeout(() => setSandboxResult(match), 300);
        } else {
          setSandboxResult({ result: '?', emoji: '❌', name: 'No Reaction' });
        }
      }
    }
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
              className="bg-white shadow-[0_4px_0_#efefef] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none p-3 rounded-2xl text-[#74C0FC] transition-all border-2 border-zinc-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </Link>
            <div>
              <h1 className="text-xl font-black text-zinc-800 tracking-tight flex items-center gap-2">
                Scientist&apos;s Log <span className="text-[#74C0FC]">🔬</span>
              </h1>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Research & Discovery Manual</p>
            </div>
          </div>

          <Link
            href="/play"
            className="bg-[#74C0FC] text-white shadow-[0_4px_0_#3d8ecf] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none px-6 py-3 rounded-2xl text-sm font-black transition-all"
          >
            LABORATORY
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        

        {/* Base Elements - The Selection Palette */}
        <section className="mb-12">
          <h2 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-6 px-2 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-zinc-200"></span>
            Primary Reagents
            <span className="w-8 h-[2px] bg-zinc-200"></span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(BASE_CHARS).map((item) => (
              <button
                key={item.char}
                onClick={() => addToSandbox(item.char)}
                className="bg-white rounded-3xl p-5 shadow-[0_6px_0_#efefef] border-2 border-transparent hover:border-[#74C0FC] flex flex-col items-center gap-2 transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none group"
              >
                <span className="text-4xl group-hover:animate-bounce">{item.emoji}</span>
                <span className="text-2xl font-black text-zinc-800">{item.char}</span>
                <span className="text-[10px] font-black text-[#74C0FC] uppercase tracking-widest">{item.pinyin}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Controls & Filter */}
        <section className="mb-12 sticky top-24 z-30">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative group">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by element, pinyin, or logic..."
                className="w-full bg-white rounded-3xl px-6 py-4 pl-14 text-sm font-bold text-zinc-700 placeholder:text-zinc-300 border-4 border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.04)] focus:outline-none focus:border-[#74C0FC]/30 transition-all"
              />
              <svg className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#74C0FC] transition-colors" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div className="flex gap-2">
              <button onClick={revealAll} className="bg-zinc-800 text-white px-6 rounded-2xl text-xs font-black hover:bg-zinc-700 transition-colors shadow-lg">SHOW ALL</button>
              <button onClick={hideAll} className="bg-white text-zinc-400 border-2 border-zinc-100 px-6 rounded-2xl text-xs font-black hover:bg-zinc-50 transition-colors shadow-sm">RESET</button>
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
                <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-black ml-auto">{catRecipes.length} Discoveries</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {catRecipes.map(([key, recipe]) => {
                  const char1 = key[0];
                  const char2 = key.length > 2 ? key.slice(1) : key[1];
                  const d1 = getData(char1);
                  const d2 = getData(char2);
                  const isRevealed = revealed[key];
                  const isFound = progress.includes(recipe.result);

                  return (
                    <div
                      key={key}
                      onClick={() => toggleReveal(key)}
                      className={`
                        bg-white rounded-[32px] p-6 shadow-[0_8px_0_#efefef] border-4 border-transparent 
                        hover:border-[#FFD8A8]/50 transition-all text-left cursor-pointer relative group
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
                        <span className="text-zinc-300 font-black">+</span>
                        <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-2 rounded-2xl border-2 border-zinc-100">
                          <span className="text-xl">{d2.emoji}</span>
                          <span className="text-xl font-black text-zinc-800">{char2}</span>
                        </div>
                        <span className="text-zinc-200 font-black">=</span>

                        {isRevealed || isFound ? (
                          <div className="flex items-center gap-2 animate-[fade-in_0.3s_ease-out]">
                            <span className="text-2xl">{recipe.emoji}</span>
                            <span className="text-2xl font-black text-[#74C0FC]">{recipe.result}</span>
                          </div>
                        ) : (
                          <div className="bg-[#FFD8A8]/20 text-[#FFD8A8] px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-[#FFD8A8]/50 group-hover:bg-[#FFD8A8]/30 transition-colors">
                            Reveal Logic
                          </div>
                        )}
                      </div>

                      {/* Scientific Data */}
                      {(isRevealed || isFound) && (
                        <div className="space-y-3 animate-[fade-in_0.4s_ease-out]">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-[#74C0FC] uppercase tracking-widest">{recipe.pinyin}</span>
                            <span className="w-1 h-1 bg-zinc-200 rounded-full"></span>
                            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">{recipe.name}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-zinc-400 font-bold bg-zinc-50/50 p-3 rounded-xl border border-zinc-100 italic">
                            &ldquo;{recipe.note}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {filteredRecipes.length === 0 && (
          <div className="bg-white/40 border-4 border-dashed border-zinc-100 rounded-[40px] p-20 text-center">
            <span className="text-6xl mb-6 block opacity-20">🧪</span>
            <p className="text-zinc-400 font-black uppercase tracking-widest">No matching research entries found.</p>
          </div>
        )}
      </div>
    </main>
  );
}
