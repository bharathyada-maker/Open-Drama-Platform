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
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleScrollTo(activeIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
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
    <div className="relative w-full h-full">
      {/* OUTSIDE-OF-SCREEN NAVIGATION CONTROLS DOCK (DESKTOP) */}
      <div className="hidden sm:flex fixed right-4 md:right-[calc(50%-270px)] top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3">
        {/* Previous Video Button */}
        <button
          onClick={() => handleScrollTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          className={`p-3 rounded-2xl border backdrop-blur-xl transition-all shadow-xl flex items-center justify-center group ${
            activeIndex === 0
              ? 'bg-bg-surface/40 border-white/5 text-text-muted cursor-not-allowed opacity-35'
              : 'bg-bg-surface/90 hover:bg-white border-white/10 hover:border-white text-white hover:text-black hover:scale-110 active:scale-95 shadow-accent-rose/10'
          }`}
          title="Previous Video (Arrow Up)"
        >
          <ChevronUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
        </button>

        {/* Video Position Counter */}
        <div className="px-3 py-1.5 rounded-xl bg-bg-surface/90 border border-white/10 backdrop-blur-xl text-center shadow-lg min-w-[56px]">
          <span className="text-xs font-extrabold text-white">{activeIndex + 1}</span>
          <span className="text-[10px] text-text-muted block -mt-0.5">of {videos.length}</span>
        </div>

        {/* Next Video Button */}
        <button
          onClick={() => handleScrollTo(activeIndex + 1)}
          disabled={activeIndex === videos.length - 1}
          className={`p-3 rounded-2xl border backdrop-blur-xl transition-all shadow-xl flex items-center justify-center group ${
            activeIndex === videos.length - 1
              ? 'bg-bg-surface/40 border-white/5 text-text-muted cursor-not-allowed opacity-35'
              : 'bg-bg-surface/90 hover:bg-white border-white/10 hover:border-white text-white hover:text-black hover:scale-110 active:scale-95 shadow-accent-rose/10'
          }`}
          title="Next Video (Arrow Down)"
        >
          <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
        </button>
      </div>

      {/* MOBILE OUTSIDE-OF-CONTENT FLOATING CONTROLS */}
      <div className="sm:hidden fixed right-2 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2">
        <button
          onClick={() => handleScrollTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          className={`w-9 h-9 rounded-full border backdrop-blur-lg flex items-center justify-center shadow-lg transition-all ${
            activeIndex === 0
              ? 'bg-black/30 border-white/5 text-white/30 cursor-not-allowed'
              : 'bg-black/60 border-white/20 text-white active:scale-90'
          }`}
          title="Previous"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <div className="px-2 py-0.5 rounded-md bg-black/60 border border-white/15 text-[9px] font-bold text-white/90">
          {activeIndex + 1}/{videos.length}
        </div>
        <button
          onClick={() => handleScrollTo(activeIndex + 1)}
          disabled={activeIndex === videos.length - 1}
          className={`w-9 h-9 rounded-full border backdrop-blur-lg flex items-center justify-center shadow-lg transition-all ${
            activeIndex === videos.length - 1
              ? 'bg-black/30 border-white/5 text-white/30 cursor-not-allowed'
              : 'bg-black/60 border-white/20 text-white active:scale-90'
          }`}
          title="Next"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* SCROLLABLE VERTICAL FEED CONTAINER */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y-mandatory no-scrollbar bg-black md:bg-bg-dark flex flex-col items-center py-0 md:py-6 gap-6"
        style={{ height: 'calc(100vh - 64px)' }}
      >
        {videos.map((video, idx) => (
          <div 
            key={video.id} 
            className="h-full w-full md:h-[calc(100vh-140px)] md:max-w-[400px] md:rounded-3xl md:border md:border-border-dark md:overflow-hidden md:shadow-2xl md:shadow-black/80 snap-start flex-shrink-0 relative bg-black"
          >
            <VerticalPlayer
              video={video}
              isActive={idx === activeIndex}
              onCommentsClick={onCommentsClick}
              onCreatorClick={onCreatorClick}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted(!isMuted)}
              onNextEpisode={
                idx < videos.length - 1
                  ? () => handleNextEpisodeTransition(idx)
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default VerticalFeed;
