import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dbClient } from '../lib/dbClient';
import { Video, Series, CreatorProfile, WatchHistory } from '../types/schema';
import { VerticalFeed } from '../components/VerticalFeed';
import { Play, TrendingUp, Users, Clock, Flame, Compass, ChevronRight, Check, Sparkles } from 'lucide-react';

interface HomeProps {
  setTab: (tab: string) => void;
  onVideoSelect: (videoId: string) => void;
  onCreatorSelect: (creatorId: string) => void;
  onSeriesSelect: (seriesId: string) => void;
  onCommentsClick: (videoId: string) => void;
  onGenreSelect?: (genre: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setTab, onVideoSelect, onCreatorSelect, onSeriesSelect, onCommentsClick, onGenreSelect }) => {
  const { user } = useAuth();
  const [feedMode, setFeedMode] = useState<'for_you' | 'explore'>('explore');

  // Content Lists
  const [videos, setVideos] = useState<Video[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);

  // Category selection
  const genresList = ['Love', 'Action', 'Comedy', 'Devotional', 'Nature', 'Animals', 'Drama', 'Thriller', 'Romance', 'Sci-Fi', 'Tech', 'Documentary', 'Animation'];

  useEffect(() => {
    const loadContent = async () => {
      try {
        const v = await dbClient.getVideos();
        const s = await dbClient.getSeries();
        
        const rawCreators = JSON.parse(localStorage.getItem('opendrama_db_creator_profiles') || '[]');
        
        setVideos(v.filter(item => item.status === 'published'));
        setSeriesList(s);
        setCreators(rawCreators);

        if (user) {
          const history = await dbClient.getWatchHistory(user.id);
          setWatchHistory(history);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadContent();
  }, [user]);

  // Filters for sections
  const trendingVideos = [...videos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 6);
  const newReleases = [...videos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);
  
  // Custom recommendation: match user's preferred genres or history genres
  const recommendedVideos = [...videos]
    .filter(v => {
      if (!user || user.favorite_genres.length === 0) return true;
      return user.favorite_genres.includes(v.genre || '');
    })
    .slice(0, 6);

  const getCreatorName = (creatorId: string) => {
    const profiles = JSON.parse(localStorage.getItem('opendrama_db_profiles') || '[]');
    return profiles.find((p: any) => p.id === creatorId)?.display_name || 'Creator';
  };

  return (
    <div className="min-h-screen bg-bg-dark text-slate-100 pb-24">
      {/* Header Toggle (For You vs Explore) */}
      <div className="flex justify-center border-b border-border-dark py-3.5 sticky top-16 bg-bg-dark z-10">
        <div className="flex bg-bg-surface border border-border-dark p-1 rounded-2xl">
          <button
            onClick={() => setFeedMode('explore')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              feedMode === 'explore'
                ? 'bg-gradient-to-r from-accent-rose to-accent-purple text-white shadow-md'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            Explore
          </button>
          <button
            onClick={() => setFeedMode('for_you')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              feedMode === 'for_you'
                ? 'bg-gradient-to-r from-accent-rose to-accent-purple text-white shadow-md'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            For You Feed
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE MODE */}
      {feedMode === 'for_you' ? (
        <div className="h-[calc(100vh-184px)] md:h-[calc(100vh-128px)] w-full">
          <VerticalFeed
            videos={videos}
            onCommentsClick={onCommentsClick}
            onCreatorClick={onCreatorSelect}
          />
        </div>
      ) : (
        /* EXPLORE MODE LANDING PAGE GRID */
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-10 animate-fade-in">
          
          {/* 1. Continue Watching (Only if history is populated) */}
          {user && watchHistory.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-accent-purple" />
                <span>Continue Watching</span>
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {watchHistory.slice(0, 4).map((hist) => {
                  if (!hist.video) return null;
                  return (
                    <div
                      key={hist.id}
                      onClick={() => onVideoSelect(hist.video_id)}
                      className="bg-bg-surface border border-border-dark rounded-2xl p-3 flex gap-3 cursor-pointer hover:border-slate-500 transition-all flex-shrink-0 w-80 shadow-md group"
                    >
                      <div className="w-24 h-16 rounded-xl overflow-hidden bg-bg-card relative flex-shrink-0">
                        <img src={hist.video.thumbnail_url || ''} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1 leading-snug">{hist.video.title}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">Progress: {hist.completion_percent}%</p>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-bg-card h-1 rounded-full overflow-hidden border border-border-dark mt-2">
                          <div className="bg-accent-purple h-full" style={{ width: `${hist.completion_percent}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Hero Promo Banner Featuring Neon Horizons */}
          <div className="glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center min-h-[240px] shadow-2xl shadow-accent-rose/10 border border-accent-rose/30 bg-gradient-to-br from-bg-surface to-bg-card">
            {/* Visual background highlights */}
            <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-screen pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542204172-e7052809a850?auto=format&fit=crop&w=800&q=80')" }} />
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-accent-purple/20 via-accent-rose/5 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent-rose/15 blur-[90px]" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-accent-purple/10 blur-[90px]" />
            
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-accent-rose text-white border border-accent-rose/40 max-w-fit mb-3 animate-pulse shadow-glow">
              Flagship Series
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight max-w-xl tracking-tight drop-shadow-lg">
              NEON HORIZONS
            </h2>
            <p className="text-xs text-slate-200 mt-2.5 max-w-md font-normal leading-relaxed drop-shadow-sm">
              A visually breathtaking vertical journey exploring architectural marvels, hidden rain-slicked alleys, and glowing street cultures of Tokyo and Mumbai. 
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => onSeriesSelect('ser-1')}
                className="px-5 py-2.5 bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-bold rounded-xl shadow-lg shadow-accent-rose/30 hover:shadow-accent-rose/50 hover:scale-105 active:scale-95 transition-all"
              >
                Watch Series
              </button>
              <button
                onClick={() => setFeedMode('for_you')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold rounded-xl hover:scale-105 active:scale-95 transition-all"
              >
                View Feed
              </button>
            </div>
          </div>

          {/* 2. Trending Now Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-accent-rose" />
                <span>Trending Now</span>
              </h3>
              <button onClick={() => setTab('discover')} className="text-xs text-text-muted hover:text-accent-rose flex items-center gap-0.5 font-semibold transition-colors">
                <span>View All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {trendingVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onVideoSelect(video.id)}
                  className="bg-bg-surface border border-border-dark/60 rounded-2xl overflow-hidden hover:border-slate-500 transition-all cursor-pointer group shadow-sm flex flex-col h-full"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img 
                      src={video.thumbnail_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&h=250&q=80'} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&h=250&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <span className="absolute bottom-1 right-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono text-slate-100 border border-white/5">
                      {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-bold text-white line-clamp-1 mb-0.5">{video.title}</h4>
                      <p className="text-[9px] text-text-muted">{getCreatorName(video.creator_id)}</p>
                    </div>
                    <span className="text-[9px] text-text-muted mt-2 block border-t border-border-dark/30 pt-1.5">{video.view_count} views</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Browse by Genres (Chips Layout) */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">Browse by Category</h3>
            <div className="flex flex-wrap gap-2">
              {genresList.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    if (onGenreSelect) {
                      onGenreSelect(g);
                    } else {
                      setTab('discover');
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-bg-surface border border-border-dark text-xs font-semibold text-text-secondary hover:text-white hover:border-accent-rose transition-all hover:bg-bg-card"
                >
                  {g}
                </button>
              ))}
            </div>
          </section>

          {/* 4. Rising Creators Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-accent-rose" />
              <span>Rising Creators</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {creators.slice(0, 4).map((creator) => {
                // Find avatar from profiles
                const profiles = JSON.parse(localStorage.getItem('opendrama_db_profiles') || '[]');
                const p = profiles.find((item: any) => item.id === creator.user_id);
                return (
                  <div
                    key={creator.id}
                    onClick={() => onCreatorSelect(creator.user_id)}
                    className="bg-bg-surface border border-border-dark hover:border-slate-500 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all"
                  >
                    <img
                      src={p?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${creator.creator_name}`}
                      alt=""
                      className="w-12 h-12 rounded-xl bg-bg-card border border-border-dark p-0.5 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate leading-snug">{creator.creator_name}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5 truncate">{creator.followers_count} followers</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 5. Recommended/Because You Watched */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">Because You Watched</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendedVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onVideoSelect(video.id)}
                  className="bg-bg-surface border border-border-dark/60 rounded-2xl overflow-hidden hover:border-slate-500 transition-all cursor-pointer group shadow-sm flex flex-col h-full"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    <img 
                      src={video.thumbnail_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&h=250&q=80'} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&h=250&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <span className="absolute bottom-1 right-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono text-slate-100 border border-white/5">
                      {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-bold text-white line-clamp-1 mb-0.5">{video.title}</h4>
                      <p className="text-[9px] text-text-muted">{getCreatorName(video.creator_id)}</p>
                    </div>
                    <span className="text-[9px] text-text-muted mt-2 block border-t border-border-dark/30 pt-1.5">{video.view_count} views</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Popular Series Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">Popular Series Playlist</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {seriesList.slice(0, 3).map((series) => (
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
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
export default Home;
