import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const SplashScreen: React.FC = () => {
  const { navigateTo } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigateTo('role-selection');
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigateTo]);

  return (
    <div className="bg-background min-h-screen flex flex-col justify-between items-center px-4 py-8 overflow-hidden select-none">
      <div className="w-full flex justify-end">
        <button
          onClick={() => navigateTo('role-selection')}
          className="text-xs font-label-bold text-on-surface-variant hover:text-primary px-3 py-1.5 rounded-full hover:bg-surface-container-high transition-colors"
        >
          Skip →
        </button>
      </div>

      {/* Center Hero */}
      <main className="w-full flex-grow flex flex-col justify-center items-center text-center animate-fade-in-up">
        {/* Logo emblem */}
        <div className="mb-6 w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-outline-variant bg-surface-container-lowest relative p-2 ring-8 ring-primary/5">
          <div className="w-full h-full rounded-full flex items-center justify-center bg-primary/5">
            <span className="material-symbols-outlined text-6xl text-primary font-light" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
              home_pin
            </span>
          </div>
        </div>

        {/* Brand Title & Tagline */}
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tight">
          FindBack
        </h1>
        <p className="font-body-lg text-lg text-on-surface-variant max-w-sm">
          Lost things find their way home.
        </p>
      </main>

      {/* Footer SLA Chip (Matching Stitch Image 2) */}
      <footer className="w-full pb-8 flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="inline-flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-full shadow-[0_4px_12px_rgba(2,36,72,0.05)] border border-outline-variant/60">
          <span className="material-symbols-outlined text-primary text-[20px] filled">
            timer
          </span>
          <span className="font-label-bold text-sm text-on-surface">24hr Recovery SLA</span>
        </div>
      </footer>
    </div>
  );
};
