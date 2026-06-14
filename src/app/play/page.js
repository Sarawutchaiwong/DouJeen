'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function GamePage() {
  const [discovered, setDiscovered] = useState(['火', '山', '水', '木']);

  return (
    <main className="min-h-screen flex bg-[#FFF9DB] font-sans">
      {/* Sidebar: Collection */}
      <aside className="w-80 bg-white/50 backdrop-blur-md border-r-4 border-[#B2F2BB] p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#74C0FC]">Your Library</h2>
          <span className="bg-[#B2F2BB] text-[#2b5e32] px-3 py-1 rounded-full text-sm font-bold">
            {discovered.length}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {discovered.map((char) => (
            <div 
              key={char}
              className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl cursor-grab active:cursor-grabbing hover:scale-110 transition-transform border-2 border-transparent hover:border-[#74C0FC]"
            >
              {char}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Alchemy Zone */}
      <section className="flex-1 relative flex flex-col items-center justify-center p-12">
        <Link 
          href="/"
          className="absolute top-8 right-8 text-[#74C0FC] font-bold hover:underline underline-offset-4"
        >
          Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-[#74C0FC] mb-2">The Alchemy Zone</h1>
          <p className="text-zinc-500 font-medium">Drag characters here to combine them!</p>
        </div>

        {/* The Drop Zone */}
        <div className="w-[500px] h-[500px] bg-white/30 border-4 border-dashed border-[#FFD8A8] rounded-[60px] flex items-center justify-center relative overflow-hidden shadow-inner">
           <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FFD8A8 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
           
           <div className="flex flex-col items-center gap-4 text-[#FFD8A8]">
             <div className="w-24 h-24 rounded-full border-4 border-[#FFD8A8] flex items-center justify-center text-4xl font-bold animate-pulse">
               +
             </div>
             <span className="font-bold tracking-widest uppercase text-sm">Experimental Space</span>
           </div>
        </div>

        {/* Status / Hints */}
        <div className="mt-12 bg-white/80 px-8 py-4 rounded-[24px] shadow-sm border-2 border-[#B2F2BB]">
          <p className="text-[#2b5e32] font-medium">
            Hint: Try mixing <span className="font-bold">火 (Fire)</span> and <span className="font-bold">山 (Mountain)</span>...
          </p>
        </div>
      </section>
    </main>
  );
}
