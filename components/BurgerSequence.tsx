'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';

const FRAME_COUNT = 240;

export default function BurgerSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    let loaded = 0;
    const imgs: HTMLImageElement[] = [];
    
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/sequence/frame_${i}.jpg`;
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
      };
      // Important to push to array first so that order is maintained
      imgs.push(img);
    }
    
    setImages(imgs);
  }, []);

  useEffect(() => {
    if (images.length === 0 || loadedCount < FRAME_COUNT) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const renderFrame = (progress: number) => {
      let frameIndex = Math.floor(progress * FRAME_COUNT);
      if (frameIndex >= FRAME_COUNT) frameIndex = FRAME_COUNT - 1;
      if (frameIndex < 0) frameIndex = 0;
      
      const img = images[frameIndex];
      if (!img) return;
      
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // cover logic for the canvas (fills screen on mobile)
      const scale = Math.max(width / img.width, height / img.height);
      const x = (width / 2) - (img.width / 2) * scale;
      const y = (height / 2) - (img.height / 2) * scale;
      
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    // Render initial frame
    renderFrame(smoothProgress.get());

    const unsubscribe = smoothProgress.on('change', (latest) => {
      renderFrame(latest);
    });

    // Handle resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      renderFrame(smoothProgress.get());
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return () => {
      unsubscribe();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [images, loadedCount, smoothProgress]);

  const isLoading = loadedCount < FRAME_COUNT;
  const loadingProgress = Math.round((loadedCount / FRAME_COUNT) * 100);

  // Define beats mapping (opacity maps to [start, start + 0.1, end - 0.1, end] -> [0, 1, 1, 0])
  // Beat A: 0-20%
  const beatAOpacity = useTransform(smoothProgress, [0, 0.1, 0.1, 0.2], [0, 1, 1, 0]);
  const beatAY = useTransform(smoothProgress, [0, 0.1, 0.1, 0.2], [20, 0, 0, -20]);

  // Beat B: 25-45%
  const beatBOpacity = useTransform(smoothProgress, [0.25, 0.35, 0.35, 0.45], [0, 1, 1, 0]);
  const beatBY = useTransform(smoothProgress, [0.25, 0.35, 0.35, 0.45], [20, 0, 0, -20]);

  // Beat C: 50-70%
  const beatCOpacity = useTransform(smoothProgress, [0.5, 0.6, 0.6, 0.7], [0, 1, 1, 0]);
  const beatCY = useTransform(smoothProgress, [0.5, 0.6, 0.6, 0.7], [20, 0, 0, -20]);

  // Beat D: 75-95%
  const beatDOpacity = useTransform(smoothProgress, [0.75, 0.85, 0.85, 0.95], [0, 1, 1, 0]);
  const beatDY = useTransform(smoothProgress, [0.75, 0.85, 0.85, 0.95], [20, 0, 0, -20]);

  // Scroll to Explore indicator (0 to 10%)
  const indicatorOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full bg-black">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-white/60"></div>
          <div className="mt-8 h-1 w-64 overflow-hidden rounded-full bg-white/10">
            <div 
              className="h-full bg-white transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="mt-4 text-sm font-medium uppercase tracking-widest text-white/40">
            {loadingProgress}% Assembling
          </p>
        </div>
      )}

      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full" />

        {/* Overlays Container */}
        <div className="pointer-events-none absolute inset-0 z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 sm:px-12">
          
          {/* Scroll to Explore Indicator */}
          <motion.div 
            style={{ opacity: indicatorOpacity }}
            className="absolute bottom-12 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Scroll to Explore</span>
            <div className="h-12 w-[1px] bg-gradient-to-b from-white/50 to-transparent" />
          </motion.div>

          {/* Beat A */}
          <motion.div 
            style={{ opacity: beatAOpacity, y: beatAY }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center text-center px-6"
          >
            <h2 className="mb-4 text-5xl font-black uppercase tracking-tighter text-white/90 md:text-7xl lg:text-8xl xl:text-9xl">
              Culinary<br />Architecture
            </h2>
            <p className="max-w-xl text-lg text-white/60 md:text-2xl">
              A symphony of flavors, perfectly assembled.
            </p>
          </motion.div>

          {/* Beat B */}
          <motion.div 
            style={{ opacity: beatBOpacity, y: beatBY }}
            className="absolute left-6 top-1/2 -translate-y-1/2 max-w-2xl text-left md:left-12 lg:left-24"
          >
            <h2 className="mb-4 text-4xl font-black uppercase tracking-tighter text-white/90 md:text-6xl lg:text-7xl xl:text-8xl">
              The<br />Foundation
            </h2>
            <p className="text-lg text-white/60 md:text-2xl">
              Artisan toasted sesame buns framing perfectly caramelized, flame-grilled beef.
            </p>
          </motion.div>

          {/* Beat C */}
          <motion.div 
            style={{ opacity: beatCOpacity, y: beatCY }}
            className="absolute right-6 top-1/2 -translate-y-1/2 max-w-2xl text-right md:right-12 lg:right-24"
          >
            <h2 className="mb-4 text-4xl font-black uppercase tracking-tighter text-white/90 md:text-6xl lg:text-7xl xl:text-8xl">
              Fluid<br />Dynamics
            </h2>
            <p className="text-lg text-white/60 md:text-2xl">
              Suspended droplets of signature sauce and savory juices frozen in mid-air.
            </p>
          </motion.div>

          {/* Beat D */}
          <motion.div 
            style={{ opacity: beatDOpacity, y: beatDY }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center text-center px-6"
          >
            <h2 className="mb-4 text-5xl font-black uppercase tracking-tight text-white/90 md:text-7xl lg:text-8xl xl:text-9xl">
              Taste the Craft
            </h2>
            <p className="mb-8 max-w-xl text-lg text-white/60 md:text-2xl">
              Experience the ultimate gourmet deconstruction.
            </p>
            <button className="pointer-events-auto rounded-full bg-white px-10 py-5 text-sm font-bold uppercase tracking-widest text-black transition-transform hover:scale-105 hover:bg-white/90">
              Order Now
            </button>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}
