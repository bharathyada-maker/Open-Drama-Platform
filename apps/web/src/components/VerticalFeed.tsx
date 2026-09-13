import React, { useState, useEffect, useRef } from 'react';
import { VerticalPlayer } from './VerticalPlayer';
import { Video } from '../types/schema';
import { Film, ChevronLeft, ChevronRight } from 'lucide-react';

interface VerticalFeedProps {
  videos: Video[];
  initialVideoId?: string | null;
  onCommentsClick: (videoId: string) => void;
  onCreatorClick: (creatorId: string) => void;
}

export const VerticalFeed: React.FC<VerticalFeedProps> = ({
  videos,
  initialVideoId,
  onCommentsClick,
  onCreatorClick
}) => {
  const getInitialIndex = () => {
    if (!initialVideoId) return 0;
    const idx = videos.findIndex(v => v.id === initialVideoId);
    return idx >= 0 ? idx : 0;
  };

  const [activeIndex, setActiveIndex] = useState(getInitialIndex);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync index when initialVideoId or videos list updates
  useEffect(() => {
    if (initialVideoId && containerRef.current) {
      const idx = videos.findIndex(v => v.id === initialVideoId);
      if (idx >= 0 && idx !== activeIndex) {
        setActiveIndex(idx);
        const clientHeight = containerRef.current.clientHeight;
        containerRef.current.scrollTo({
          top: idx * clientHeight,
          behavior: 'auto'
        });
      }
    }
  }, [initialVideoId, videos]);

  // Monitor scrolling to calculate which video is active in view
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    if (clientHeight <= 0) return;
    
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex && index >= 0 && index < videos.length) {
      setActiveIndex(index);
    }
  };

  // Scroll to target video index with wrap-around support so users never get stuck
  const handleScrollTo = (targetIdx: number) => {
    if (!containerRef.current || videos.length === 0) return;
    let normalizedIdx = targetIdx;
    if (normalizedIdx < 0) {
      normalizedIdx = videos.length - 1; // Loop to end
    } else if (normalizedIdx >= videos.length) {
      normalizedIdx = 0; // Loop to beginning
    }

    const clientHeight = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: normalizedIdx * clientHeight,
      behavior: 'smooth'
    });
    setActiveIndex(normalizedIdx);
  };

  // Keyboard navigation support (Arrow Left/Right and Up/Down)
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
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-bg-card text-white hover:bg-white/10 active:scale-95 cursor-pointer shadow-sm text-xs font-semibold transition-all"
          title="Previous Video"
        >
          <ChevronLeft className="w-4 h-4" />
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
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-bg-card text-white hover:bg-white/10 active:scale-95 cursor-pointer shadow-sm text-xs font-semibold transition-all"
          title="Next Video"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* DESKTOP / TABLET TOP POSITION STATUS PILL (OUTSIDE VIDEO WINDOW) */}
      <div className="hidden sm:flex items-center gap-3 py-1.5 px-4 mb-2 rounded-full bg-bg-surface/80 border border-white/10 backdrop-blur-md shadow-md z-20">
        <span className="text-xs font-bold text-white">Video {activeIndex + 1}</span>
        <span className="text-xs text-text-muted">of {videos.length}</span>
        {videos[activeIndex]?.genre && (
          <span className="text-[10px] text-accent-rose font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-rose/10 border border-accent-rose/20">
            {videos[activeIndex].genre}
          </span>
        )}
      </div>

      {/* MAIN VIEWPORT: Horizontal Split Layout with Previous on Left, Video in Center, Next on Right */}
      <div className="relative flex-1 w-full flex items-center justify-center gap-4 sm:gap-6 md:gap-10 lg:gap-14 px-4 py-2 md:py-3 overflow-hidden">
        {/* LEFT EXTERNAL NAVIGATION COLUMN: PREVIOUS BUTTON (OUTSIDE VIDEO WINDOW) */}
        <div className="hidden sm:flex flex-col items-center gap-2 z-30 flex-shrink-0">
          <button
            onClick={() => handleScrollTo(activeIndex - 1)}
            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl border border-white/10 bg-bg-surface/90 hover:bg-white/15 text-white backdrop-blur-xl transition-all shadow-2xl hover:scale-110 active:scale-95 flex flex-col items-center justify-center group cursor-pointer hover:border-accent-rose/50 hover:shadow-accent-rose/20"
            title="Previous Video (Arrow Left / Arrow Up)"
            aria-label="Previous Video"
          >
            <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-white transition-transform group-hover:-translate-x-1" />
            <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5 text-text-secondary group-hover:text-white">Prev</span>
          </button>
          <div className="text-[10px] text-text-muted font-mono bg-bg-surface/60 px-2.5 py-0.5 rounded border border-white/5 shadow-sm">
            <span>← / ↑</span>
          </div>
        </div>

        {/* CENTER: 9:16 VERTICAL VIDEO FEED CONTAINER */}
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

        {/* RIGHT EXTERNAL NAVIGATION COLUMN: NEXT BUTTON (OUTSIDE VIDEO WINDOW) */}
        <div className="hidden sm:flex flex-col items-center gap-2 z-30 flex-shrink-0">
          <button
            onClick={() => handleScrollTo(activeIndex + 1)}
            className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl border border-white/10 bg-bg-surface/90 hover:bg-white/15 text-white backdrop-blur-xl transition-all shadow-2xl hover:scale-110 active:scale-95 flex flex-col items-center justify-center group cursor-pointer hover:border-accent-rose/50 hover:shadow-accent-rose/20"
            title="Next Video (Arrow Right / Arrow Down)"
            aria-label="Next Video"
          >
            <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-white transition-transform group-hover:translate-x-1" />
            <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5 text-text-secondary group-hover:text-white">Next</span>
          </button>
          <div className="text-[10px] text-text-muted font-mono bg-bg-surface/60 px-2.5 py-0.5 rounded border border-white/5 shadow-sm">
            <span>→ / ↓</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalFeed;
