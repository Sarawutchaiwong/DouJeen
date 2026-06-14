'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9DB] p-8 font-sans overflow-hidden relative">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#B2F2BB] blur-[120px] rounded-full opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#74C0FC] blur-[120px] rounded-full opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-[#FFD8A8] blur-[100px] rounded-full opacity-20"></div>

      <div className="flex flex-col items-center text-center max-w-2xl relative z-10">
        
        {/* Floating Physics-style Elements */}
        <div className="absolute -top-32 -left-40 text-8xl md:text-9xl opacity-20 animate-[bounce_6s_infinite] select-none pointer-events-none drop-shadow-lg">🔥</div>
        <div className="absolute -bottom-40 -right-40 text-9xl md:text-[12rem] opacity-20 animate-[bounce_8s_infinite_reverse] select-none pointer-events-none drop-shadow-lg">🌋</div>
        <div className="absolute top-40 -right-60 text-7xl md:text-8xl opacity-20 animate-[bounce_7s_infinite_delay-150ms] select-none pointer-events-none drop-shadow-lg">💧</div>

        <div className="flex flex-col items-center animate-[zoom-in_0.8s_ease-out]">
          <div className="bg-[#B2F2BB] text-[#2b5e32] px-6 py-2 rounded-full text-sm font-black tracking-widest uppercase mb-6 shadow-sm rotate-[-2deg]">
            New Discovery Game 🧪
          </div>
          
          <h1 className="text-7xl md:text-[120px] font-black text-[#74C0FC] leading-[0.9] mb-8 tracking-tighter drop-shadow-[0_10px_0_#5da9e6]">
            汉字<br/>
            <span className="text-white drop-shadow-[0_10px_0_#FFD8A8]">DouJeen</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-zinc-600 mb-12 font-bold max-w-lg leading-tight">
            Mix characters. Unlock the universe.<br/>
            <span className="underline decoration-[#B2F2BB] decoration-8 underline-offset-4">Learn Chinese the vibe way.</span>
          </p>

          <Link 
            href="/play" 
            className="group relative inline-flex items-center justify-center px-16 py-8 text-4xl font-black text-white transition-all duration-300 bg-[#74C0FC] rounded-[48px] hover:bg-[#5da9e6] hover:scale-110 active:scale-90 shadow-[0_20px_0_#3d8ecf] hover:shadow-[0_10px_0_#3d8ecf] hover:translate-y-[10px] active:translate-y-[20px] active:shadow-none"
          >
            <span className="relative flex items-center gap-4">
              LET'S GO
              <span className="text-4xl group-hover:rotate-12 transition-transform">🚀</span>
            </span>
          </Link>
        </div>

        <div className="mt-24 flex flex-wrap justify-center gap-8 text-lg font-black text-zinc-400 uppercase tracking-tighter opacity-50">
          <span className="hover:text-[#74C0FC] transition-colors cursor-default">No Exams</span>
          <span className="hover:text-[#B2F2BB] transition-colors cursor-default">No Stress</span>
          <span className="hover:text-[#FFD8A8] transition-colors cursor-default">Just Vibes</span>
        </div>
      </div>
    </main>
  );
}
