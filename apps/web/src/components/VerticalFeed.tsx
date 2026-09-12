import React, { useState, useEffect, useRef } from 'react';
import { VerticalPlayer } from './VerticalPlayer';
import { Video } from '../types/schema';
import { Film, ChevronUp, ChevronDown } from 'lucide-react';

interface VerticalFeedProps {
  videos: Video[];
  onCommentsClick: (videoId: string) => void;
  onCreatorClick: (creatorId: string) => void;
}

export const VerticalFeed: React.FC<VerticalFeedProps> = ({ videos, onCommentsClick, onCreatorClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor scrolling to calculate which video is active in view
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    
    // Safety check if clientHeight is 0
    if (clientHeight <= 0) return;
    
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex && index >= 0 && index < videos.length) {
      setActiveIndex(index);
    }
  };

  const handleScrollTo = (targetIdx: number) => {
    if (!containerRef.current || targetIdx < 0 || targetIdx >= videos.length) return;
    const clientHeight = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: targetIdx * clientHeight,
      behavior: 'smooth'
    });
    setActiveIndex(targetIdx);
  };

  const handleNextEpisodeTransition = (idx: number) => {
    handleScrollTo(idx + 1);
  };

  // Keyboard navigation support (Arrow Up / Arrow Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'PageDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleScrollTo(activeIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'PageUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleScrollTo(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, videos.length]);

  if (videos.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center bg-bg-dark py-20 px-6 text-center text-text-secondary" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center mb-4 border border-border-dark">
          <Film className="w-6 h-6 text-text-muted" />
        </div>
        <h4 className="text-lg font-bold text-white mb-1">No videos found</h4>
        <p className="text-xs max-w-xs leading-relaxed">There are no videos matching the active channel feed.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black md:bg-bg-dark select-none relative overflow-hidden">
      {/* MOBILE TOP NAVIGATION BAR: Completely OUTSIDE the video window */}
      <div className="sm:hidden w-full flex items-center justify-between px-4 py-2.5 bg-bg-surface border-b border-border-dark z-30 flex-shrink-0 shadow-lg">
        <button
          onClick={() => handleScrollTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            activeIndex === 0
              ? 'bg-bg-card/40 border-white/5 text-text-muted/40 cursor-not-allowed'
              : 'bg-bg-card border-white/10 text-white hover:bg-white/10 active:scale-95 cursor-pointer shadow-sm'
          }`}
          title="Previous Video"
        >
          <ChevronUp className="w-4 h-4 -rotate-90" />
          <span>Prev</span>
        </button>

        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-bg-card border border-white/10 text-xs font-bold text-white shadow-sm">
          <span>{activeIndex + 1}</span>
          <span className="text-text-muted font-normal">/ {videos.length}</span>
          {videos[activeIndex]?.genre && (
            <span className="text-[10px] text-accent-rose font-medium uppercase tracking-wider ml-1 pl-2 border-l border-white/10">
              {videos[activeIndex].genre}
            </span>
          )}
        </div>

        <button
          onClick={() => handleScrollTo(activeIndex + 1)}
          disabled={activeIndex === videos.length - 1}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            activeIndex === videos.length - 1
              ? 'bg-bg-card/40 border-white/5 text-text-muted/40 cursor-not-allowed'
              : 'bg-bg-card border-white/10 text-white hover:bg-white/10 active:scale-95 cursor-pointer shadow-sm'
          }`}
          title="Next Video"
        >
          <span>Next</span>
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </button>
      </div>

      {/* MAIN VIEWPORT: Centered Video Window with External Navigation Controls */}
      <div className="relative flex-1 w-full flex items-center justify-center gap-4 lg:gap-8 px-2 py-2 md:py-4 overflow-hidden">
        {/* THE SCROLLABLE VERTICAL VIDEO FEED CONTAINER */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full w-full max-w-[390px] md:max-w-[420px] overflow-y-scroll snap-y-mandatory no-scrollbar flex flex-col items-center gap-6 rounded-2xl md:rounded-3xl shadow-2xl"
        >
          {videos.map((video, idx) => (
            <div
              key={video.id}
              className="h-full w-full rounded-2xl md:rounded-3xl border border-border-dark overflow-hidden snap-start flex-shrink-0 relative bg-black shadow-2xl shadow-black/90"
            >
              <VerticalPlayer
                video={video}
                isActive={idx === activeIndex}
                onCommentsClick={onCommentsClick}
                onCreatorClick={onCreatorClick}
                isMuted={isMuted}
                onMuteToggle={() => setIsMuted(!isMuted)}
              />
            </div>
          ))}
        </div>

        {/* DESKTOP / TABLET EXTERNAL NAVIGATION DOCK (FLEX SIBLING TO THE VIDEO CONTAINER) */}
        <div className="hidden sm:flex flex-col items-center gap-3 z-30 flex-shrink-0">
          {/* Previous Video Button */}
          <button
            onClick={() => handleScrollTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className={`w-14 h-14 p-2 rounded-2xl border backdrop-blur-xl transition-all shadow-xl flex flex-col items-center justify-center group ${
              activeIndex === 0
                ? 'bg-bg-surface/30 border-white/5 text-text-muted/40 cursor-not-allowed'
                : 'bg-bg-surface/90 hover:bg-white border-white/10 hover:border-white text-white hover:text-black hover:scale-110 active:scale-95 shadow-accent-rose/10 cursor-pointer'
            }`}
            title="Previous Video (Arrow Up / k)"
          >
            <ChevronUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Prev</span>
          </button>

          {/* Video Position Pill */}
          <div className="px-3.5 py-2.5 rounded-2xl bg-bg-surface/90 border border-white/10 backdrop-blur-xl text-center shadow-lg min-w-[64px]">
            <span className="text-sm font-extrabold text-white block">{activeIndex + 1}</span>
            <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">of {videos.length}</span>
          </div>

          {/* Next Video Button */}
          <button
            onClick={() => handleScrollTo(activeIndex + 1)}
            disabled={activeIndex === videos.length - 1}
            className={`w-14 h-14 p-2 rounded-2xl border backdrop-blur-xl transition-all shadow-xl flex flex-col items-center justify-center group ${
              activeIndex === videos.length - 1
                ? 'bg-bg-surface/30 border-white/5 text-text-muted/40 cursor-not-allowed'
                : 'bg-bg-surface/90 hover:bg-white border-white/10 hover:border-white text-white hover:text-black hover:scale-110 active:scale-95 shadow-accent-rose/10 cursor-pointer'
            }`}
            title="Next Video (Arrow Down / j)"
          >
            <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">Next</span>
          </button>

          {/* Keyboard shortcut hint */}
          <div className="text-[10px] text-text-muted font-mono bg-bg-surface/50 px-2 py-1 rounded-lg border border-white/5 mt-1">
            <span>↑ / ↓</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VerticalFeed;
