import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dbClient } from '../lib/dbClient';
import { Video, Series } from '../types/schema';
import { Bookmark, Heart, Film, Play, Eye } from 'lucide-react';

interface SavedProps {
  onVideoSelect: (videoId: string) => void;
  onSeriesSelect: (seriesId: string) => void;
}

export const Saved: React.FC<SavedProps> = ({ onVideoSelect, onSeriesSelect }) => {
  const { user } = useAuth();
  const [savedVideos, setSavedVideos] = useState<Video[]>([]);
  const [savedSeries, setSavedSeries] = useState<Series[]>([]);
  const [activeTab, setActiveTab] = useState<'videos' | 'series'>('videos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSavedContent = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch saved videos
        const savedList = await dbClient.getSavedVideos(user.id);
        const mappedVids = savedList.map(s => s.video).filter(Boolean) as Video[];
        
        // Find saved series (for this MVP, series IDs saved under the same saved list table)
        const allSeries = await dbClient.getSeries();
        const mappedSeries = allSeries.filter(ser => savedList.some(sv => sv.video_id === ser.id));

        setSavedVideos(mappedVids);
        setSavedSeries(mappedSeries);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadSavedContent();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 text-slate-100">
        <div className="w-full max-w-sm bg-bg-surface border border-border-dark rounded-2xl p-6 text-center">
          <Bookmark className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Access Watchlist</h2>
          <p className="text-xs text-text-secondary leading-relaxed mb-4">
            Sign In to save vertical shorts, bookmark episodic series, and build your custom watchlist library.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-slate-100 pb-24 p-6 animate-fade-in max-w-5xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mb-6">
        <Bookmark className="w-6 h-6 text-accent-rose fill-accent-rose" />
        <span>Watchlist Library</span>
      </h1>

      {/* Tabs */}
      <div className="flex border-b border-border-dark mb-6">
        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-3 text-xs font-bold tracking-wide border-b-2 transition-all ${
            activeTab === 'videos' ? 'border-accent-rose text-accent-rose' : 'border-transparent text-text-secondary hover:text-white'
          }`}
        >
          Saved Shorts / Videos ({savedVideos.length})
        </button>
        <button
          onClick={() => setActiveTab('series')}
          className={`px-4 py-3 text-xs font-bold tracking-wide border-b-2 transition-all ${
            activeTab === 'series' ? 'border-accent-rose text-accent-rose' : 'border-transparent text-text-secondary hover:text-white'
          }`}
        >
          Bookmarked Series ({savedSeries.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-text-secondary">Loading saved library...</div>
      ) : (
        <>
          {/* Saved videos grid */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedVideos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => onVideoSelect(vid.id)}
                  className="bg-bg-surface border border-border-dark/60 rounded-2xl overflow-hidden hover:border-slate-500 transition-all cursor-pointer group shadow-sm flex flex-col h-full"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img src={vid.thumbnail_url || ''} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute bottom-1.5 right-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-slate-100 border border-white/5">
                      {Math.floor(vid.duration_seconds / 60)}:{(vid.duration_seconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">{vid.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-text-muted mt-2 border-t border-border-dark/30 pt-2">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{vid.view_count}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{vid.like_count}</span>
                    </div>
                  </div>
                </div>
              ))}
              {savedVideos.length === 0 && (
                <div className="col-span-full py-16 text-center text-text-secondary bg-bg-surface border border-dashed border-border-dark rounded-2xl text-xs">
                  Your saved watchlist is empty.
                </div>
              )}
            </div>
          )}

          {/* Bookmarked series grid */}
          {activeTab === 'series' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedSeries.map((series) => (
                <div
                  key={series.id}
                  onClick={() => onSeriesSelect(series.id)}
                  className="bg-bg-surface border border-border-dark/60 rounded-2xl p-4 flex gap-4 hover:border-slate-500 transition-all cursor-pointer group"
                >
                  <img src={series.cover_url || ''} alt="" className="w-16 h-20 object-cover rounded-xl bg-bg-card flex-shrink-0" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs line-clamp-1 leading-snug group-hover:text-accent-rose transition-colors">{series.title}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">Genre: {series.genre}</p>
                      <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed mt-1 font-light">{series.description}</p>
                    </div>
                  </div>
                </div>
              ))}
              {savedSeries.length === 0 && (
                <div className="col-span-full py-16 text-center text-text-secondary bg-bg-surface border border-dashed border-border-dark rounded-2xl text-xs">
                  Your bookmarked series list is empty.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default Saved;
