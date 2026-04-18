'use client';

import React, { useEffect, useState } from 'react';

export default function Home() {
  const [timeOffset, setTimeOffset] = useState(0);
  const [mounted, setMounted] = useState(false);

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

  const hearts = Array.from({ length: totalElements }).map((_, i) => {
    const getPos = (ang: number) => {
      const px = 16 * Math.pow(Math.sin(ang), 3);
      const py = -(13 * Math.cos(ang) - 5 * Math.cos(2 * ang) - 2 * Math.cos(3 * ang) - Math.cos(4 * ang));
      return { px, py };
    };

    const angle = ((i / totalElements) * Math.PI * 2) + timeOffset;
    const pos = getPos(angle);
    const nextPos = getPos(angle + 0.01);

    // Calculate tangent angle for rotation so text points along the curve
    const dx = nextPos.px - pos.px;
    const dy = nextPos.py - pos.py;
    const rotation = Math.atan2(dy, dx) * (180 / Math.PI);

    // Map Cartesian coordinates to percentage logic
    return {
      id: i,
      x: ((pos.px / 18) * 50).toFixed(3),
      y: ((pos.py / 18) * 50).toFixed(3),
      rotation: rotation.toFixed(2),
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
    // using Number arguments (year, monthIndex, day) safely works across all browsers
    const start = new Date(2023, 8, 28); // Sep 28, 2023 
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
              className="absolute transform-style-3d whitespace-nowrap"
              style={{
                left: `calc(50% + ${heart.x}%)`,
                top: `calc(50% + ${heart.y}%)`,
                transform: `translate(-50%, -50%) rotate(${heart.rotation}deg)`,
                // Pulls strictly from its exact geometric center regardless of varying word widths
              } as React.CSSProperties}
            >
              <div
                className="love_word font-bold tracking-[1.5px] select-none"
                style={{ fontSize: 'clamp(0.4rem, 1.2vmin, 0.8rem)' }} // scaled down slightly to fit curve
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

      {/* Ultra-Modern Glassmorphic Sliding Lyrics Reader at the Bottom */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-2 z-20 w-[95vw] sm:w-[85vw] md:w-[70vw] max-w-4xl bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl px-5 py-3 shadow-[0_0_25px_rgba(234,128,176,0.15)]">
        
        {/* Track 1: Original Romantic Text */}
        <div className="flex w-full items-center gap-3 border-b border-white/10 pb-2">
          <div 
            className="overflow-hidden whitespace-nowrap w-full pointer-events-none"
            style={{
               maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
               WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
            }}
          >
            <div className="inline-block animate-marquee text-pink-200 text-[10px] sm:text-xs md:text-sm font-medium tracking-widest drop-shadow-md pr-full uppercase">
              I carry your heart with me ♥ I carry it in my heart ♥ I am never without it ♥ anywhere I go you go, my dear ♥ and whatever is done by only me is your doing, my darling ♥ I fear no fate, for you are my fate, my sweet ♥ I want no world, for beautiful you are my world, my true ♥ here is the deepest secret nobody knows ♥ here is the root of the root and the bud of the bud and the sky of the sky of a tree called life ♥ and this is the wonder that's keeping the stars apart ♥ I carry your heart with me ♥ I carry it in my heart ♥ Poet- E. E. CUMMINGS
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
