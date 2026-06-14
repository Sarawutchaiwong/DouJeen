import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9DB] p-8 font-sans overflow-hidden">
      <div className="flex flex-col items-center text-center max-w-2xl relative">
        
        {/* Floating Background Elements (Abstract) */}
        <div className="absolute -top-32 -left-40 text-8xl opacity-10 animate-bounce select-none pointer-events-none">火</div>
        <div className="absolute -bottom-40 -right-40 text-9xl opacity-10 animate-pulse select-none pointer-events-none">山</div>
        <div className="absolute top-40 -right-60 text-7xl opacity-10 animate-bounce delay-150 select-none pointer-events-none">水</div>

        <h1 className="text-6xl md:text-8xl font-black text-[#74C0FC] mb-6 tracking-tight drop-shadow-sm">
          DouJeen
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-600 mb-12 font-medium max-w-lg">
          Combine characters. Discover concepts. <br/>
          <span className="text-[#FFD8A8] font-bold">Learn Chinese through discovery.</span>
        </p>

        <Link 
          href="/play" 
          className="group relative inline-flex items-center justify-center px-16 py-8 text-3xl font-bold text-white transition-all duration-300 bg-[#74C0FC] rounded-[40px] hover:bg-[#5da9e6] hover:scale-105 active:scale-95 shadow-[0_12px_24px_rgba(116,192,252,0.3)] hover:shadow-[0_16px_32px_rgba(116,192,252,0.4)]"
        >
          <span className="relative flex items-center gap-3">
            开始 PLAY 
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-2">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
          </span>
        </Link>

        <div className="mt-20 flex gap-6 text-sm font-bold text-zinc-400 uppercase tracking-widest">
          <span>Explore</span>
          <span className="text-[#B2F2BB]">•</span>
          <span>Combine</span>
          <span className="text-[#B2F2BB]">•</span>
          <span>Evolve</span>
        </div>
      </div>
    </main>
  );
}
