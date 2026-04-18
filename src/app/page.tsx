'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function Home() {
  const [timeOffset, setTimeOffset] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  // Smooth endless escalator effect around the perimeter of the heart
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true); // Ensures client-side hydration for the Live Date clock
    let rafId: number;
    const speed = 0.0025; 
    
    const loop = () => {
      setTimeOffset((prev) => (prev + speed) % (Math.PI * 2));
      rafId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(rafId);
  }, []);

  const totalElements = 25; 
  
  // Calculate the parametric heart equation positions during render
  const hearts = Array.from({ length: totalElements }).map((_, i) => {
    const angle = ((i / totalElements) * Math.PI * 2) + timeOffset;
    
    const x = 16 * Math.pow(Math.sin(angle), 3);
    const y = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle));
    
    // Map Cartesian coordinates to percentage logic!
    // Using 18 bounds allows the text to stay nicely inside the edges of the box 100% responsively.
    return {
      id: i, 
      x: ((x / 18) * 50).toFixed(3),
      y: ((y / 18) * 50).toFixed(3),
      index: i
    };
  });

  // Calculate random stars for the background
  const [stars] = useState(() => {
    const starColors = ['bg-white', 'bg-pink-100', 'bg-purple-100', 'bg-rose-100'];
    return Array.from({ length: 70 }).map((_, i) => ({
      id: `star-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 4 + 3}s`
    }));
  });

  // Automatically updating live countdown mathematically computed via component frames
  let years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0;
  if (mounted) {
    const start = new Date('2023-09-28T00:00:00'.replace(/-/g, "/"));
    const now = new Date();
    
    years = now.getFullYear() - start.getFullYear();
    months = now.getMonth() - start.getMonth();
    days = now.getDate() - start.getDate();
    hours = now.getHours() - start.getHours();
    minutes = now.getMinutes() - start.getMinutes();
    seconds = now.getSeconds() - start.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) { months += 12; years--; }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] relative w-full overflow-hidden px-4 pb-32 pt-8 sm:py-16">
      
      {/* Starry Night Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`absolute rounded-full animate-twinkle ${star.color}`}
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration,
              opacity: 0.8
            }}
          />
        ))}
        {/* Soft immersive spotlight background gradient behind the heart */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vmin] h-[120vmin] sm:w-[45rem] sm:h-[45rem] bg-pink-900/20 rounded-full blur-[80px] sm:blur-[120px]"></div>
      </div>

      {/* Main Structural Flex Wrapper - Flex-col on mobile, Flex-row side-by-side on desktop Web */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-evenly w-full max-w-7xl gap-10 lg:gap-16 flex-1 px-4 lg:px-12">
        
        {/* The 3D Heart Container - Uses standard CSS dimensional scaling */}
        <div 
          id="ui" 
          className="relative transform-style-3d flex items-center justify-center animate-float-heart w-[90vw] h-[90vw] max-w-[55vh] max-h-[55vh] lg:max-w-[600px] lg:max-h-[600px]"
        >
          {/* Words tracking along the heart shape perimeter algorithmically via Percentages */}
          {hearts.map((heart) => (
            <div
              key={heart.id}
              className="absolute transform-style-3d"
              style={{
                left: `calc(50% + ${heart.x}%)`,
                top: `calc(50% + ${heart.y}%)`,
                // Pulls strictly from its exact geometric center regardless of varying word widths
              } as React.CSSProperties}
            >
              <div 
                className="love_word font-bold tracking-[1.5px] whitespace-nowrap select-none"
                style={{ fontSize: 'clamp(0.6rem, 2vmin, 1rem)' }} // flawless bound scaling
              >
                I love You, Achitkaly
              </div>
            </div>
          ))}
        </div>

        {/* Live Love Countdown Counter */}
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 w-full lg:w-auto">
          <p className="text-[12px] sm:text-[14px] md:text-[16px] text-pink-200 font-mono tracking-[0.1em] drop-shadow-[0_0_8px_rgba(234,128,176,0.8)] text-center uppercase">
            Koko is in love with Thel Thel for
          </p>
          
          {/* Only fade in rendering after initial client mount to avoid hydration mismatch errors with the local Date */}
          <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-4 text-pink-50 font-bold drop-shadow-[0_0_20px_rgba(234,128,176,1)] transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            {[
              { label: 'Years', value: years },
              { label: 'Months', value: months },
              { label: 'Days', value: days },
              { label: 'Hrs', value: hours },
              { label: 'Mins', value: minutes },
              { label: 'Secs', value: seconds },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm border border-pink-300/20 rounded-xl px-2.5 py-2 sm:px-4 sm:py-3 min-w-[70px] sm:min-w-[85px] md:min-w-[100px] shadow-[0_0_15px_rgba(234,128,176,0.1)]">
                <span className="text-xl sm:text-3xl md:text-4xl leading-none mb-1 text-white tabular-nums">{item.value.toString().padStart(2, '0')}</span>
                <span className="text-[8px] sm:text-[10px] md:text-[12px] uppercase tracking-widest text-pink-300/90">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src="/wanna-be-yours.mp3" 
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Ultra-Modern Glassmorphic Dual-Track Music Player at the Bottom */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-2 z-20 w-[95vw] sm:w-[85vw] md:w-[70vw] max-w-4xl bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl px-5 py-3 shadow-[0_0_25px_rgba(234,128,176,0.15)]">
        
        {/* Track 1: Original Romantic Text */}
        <div className="flex w-full items-center gap-3 border-b border-white/10 pb-2">
          <button 
            onClick={togglePlay}
            className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-pink-500/20 border border-pink-400/50 text-[10px] sm:text-xs hover:bg-pink-500/40 hover:scale-105 transition-all focus:outline-none drop-shadow-[0_0_10px_rgba(234,128,176,0.8)] z-30 cursor-pointer"
            title="Play Song"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div 
            className="overflow-hidden whitespace-nowrap w-full pointer-events-none"
            style={{
               maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
               WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
            }}
          >
            <div className="inline-block animate-marquee text-pink-200 text-[10px] sm:text-xs md:text-sm font-medium tracking-widest drop-shadow-md pr-full uppercase">
              You are the missing piece to my soul ♥ My heart beats only for you ♥ Every moment with you is a dream come true ♥ I will love you today, tomorrow, and forever 
            </div>
          </div>
        </div>

        {/* Track 2: Lyrics */}
        <div className="flex w-full items-center gap-3 pt-0.5">
          <span className="text-pink-400/80 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">Lyrics</span>
          <div 
            className="overflow-hidden whitespace-nowrap w-full opacity-80"
            style={{
               maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
               WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
            }}
          >
            <div className="inline-block animate-marquee-lyrics text-pink-300 text-[9px] sm:text-[11px] md:text-xs font-mono tracking-wider pr-full">
              I wanna be your vacuum cleaner • Breathing in your dust • I wanna be your Ford Cortina • I will never rust • If you like your coffee hot • Let me be your coffee pot • You call the shots, babe • I just wanna be yours • Secrets I have held in my heart • Are harder to hide than I thought • Maybe I just wanna be yours • Let me be your 'leccy meter • And I'll never run out • Let me be the portable heater • That you'll get cold without • I wanna be your setting lotion • Hold your hair in deep devotion • At least as deep as the Pacific Ocean • I wanna be yours
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
