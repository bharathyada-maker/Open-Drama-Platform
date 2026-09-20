import React, { useState, useEffect } from 'react';
import { dbClient } from '../lib/dbClient';
import { Video, Series, Profile, CreatorProfile } from '../types/schema';
import { Search, SlidersHorizontal, Eye, Heart, Film, User, Compass, Play } from 'lucide-react';
import { resolveMediaUrl, handleImageError, DEFAULT_THUMBNAIL } from '../lib/mediaUtils';

interface DiscoverProps {
  initialSearchQuery: string;
  setTab: (tab: string) => void;
  onVideoSelect: (videoId: string) => void;
  onCreatorSelect: (creatorId: string) => void;
  onSeriesSelect: (seriesId: string) => void;
}

export const Discover: React.FC<DiscoverProps> = ({ initialSearchQuery, setTab, onVideoSelect, onCreatorSelect, onSeriesSelect }) => {
  const [searchVal, setSearchVal] = useState(initialSearchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'videos' | 'series' | 'creators'>('videos');

  // Filter States
  const [genre, setGenre] = useState<string>('all');
  const [language, setLanguage] = useState<string>('all');
  const [duration, setDuration] = useState<string>('all'); // 'short' (<60s), 'medium' (1-5m), 'long' (>5m)
  const [contentType, setContentType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest'); // 'newest', 'trending', 'most_watched'

  // Master Data States
  const [videos, setVideos] = useState<Video[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Filtered Results States
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<CreatorProfile[]>([]);

  const genresList = ['Love', 'Action', 'Comedy', 'Devotional', 'Nature', 'Animals', 'Drama', 'Thriller', 'Romance', 'Sci-Fi', 'Tech', 'Documentary', 'Adventure', 'Family'];

  // Sync state search input with props initial query
  useEffect(() => {
    setSearchVal(initialSearchQuery);
  }, [initialSearchQuery]);

  // Load master data
  useEffect(() => {
    const loadData = async () => {
      try {
        const v = await dbClient.getVideos();
        const s = await dbClient.getSeries();
        
        // Profiles and creators lists from localStorage for quick lookup
        const rawProfiles = JSON.parse(localStorage.getItem('opendrama_db_profiles') || '[]');
        const rawCreators = JSON.parse(localStorage.getItem('opendrama_db_creator_profiles') || '[]');
        
        setVideos(v);
        setSeriesList(s);
        setCreators(rawCreators);
        setProfiles(rawProfiles);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  // Run filtering logic whenever filters, search, or master data changes
  useEffect(() => {
    const q = searchVal.toLowerCase().trim();

    // 1. FILTER VIDEOS
    let vResults = [...videos].filter(v => v.status === 'published');
    
    // Text search
    if (q) {
      vResults = vResults.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.description?.toLowerCase().includes(q) ||
        v.ai_tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    // Genre filter
    if (genre !== 'all') {
      vResults = vResults.filter(v => v.genre === genre);
    }
    // Language filter
    if (language !== 'all') {
      vResults = vResults.filter(v => v.language === language);
    }
    // Content type
    if (contentType !== 'all') {
      vResults = vResults.filter(v => v.content_type === contentType);
    }
    // Duration
    if (duration !== 'all') {
      if (duration === 'short') {
        vResults = vResults.filter(v => v.duration_seconds < 60);
      } else if (duration === 'medium') {
        vResults = vResults.filter(v => v.duration_seconds >= 60 && v.duration_seconds <= 300);
      } else if (duration === 'long') {
        vResults = vResults.filter(v => v.duration_seconds > 300);
      }
    }
    // Sort
    if (sortBy === 'newest') {
      vResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'most_watched') {
      vResults.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    } else if (sortBy === 'trending') {
      // Calculate a quick momentum sort
      const calcScore = (video: Video) => {
        return (video.view_count || 0) * 0.1 + (video.like_count || 0) * 1.5 + (video.comment_count || 0) * 3;
      };
      vResults.sort((a, b) => calcScore(b) - calcScore(a));
    }

    setFilteredVideos(vResults);

    // 2. FILTER SERIES
    let sResults = [...seriesList];
    if (q) {
      sResults = sResults.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.description?.toLowerCase().includes(q)
      );
    }
    if (genre !== 'all') {
      sResults = sResults.filter(s => s.genre === genre);
    }
    if (language !== 'all') {
      sResults = sResults.filter(s => s.language === language);
    }
    setFilteredSeries(sResults);

    // 3. FILTER CREATORS
    let cResults = [...creators];
    if (q) {
      cResults = cResults.filter(c => 
        c.creator_name.toLowerCase().includes(q)
      );
    }
    // Sort creators by followers count
    cResults.sort((a, b) => b.followers_count - a.followers_count);
    setFilteredCreators(cResults);

  }, [searchVal, genre, language, duration, contentType, sortBy, videos, seriesList, creators]);

  const getProfileByCreatorId = (creatorId: string) => {
    const creator = creators.find(c => c.id === creatorId);
    if (!creator) return null;
    return profiles.find(p => p.id === creator.user_id) || null;
  };

  const getCreatorNameByUserId = (userId: string) => {
    return profiles.find(p => p.id === userId)?.display_name || 'Creator';
  };

  const clearFilters = () => {
    setGenre('all');
    setLanguage('all');
    setDuration('all');
    setContentType('all');
    setSortBy('newest');
  };

  return (
    <div className="min-h-screen bg-bg-dark pb-24 text-slate-100 p-6 animate-fade-in">
      {/* Search Input Bar (Mobile Friendly Override) */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search stories, creators, series or tags..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl glass-input text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-1.5 ${
            showFilters || genre !== 'all' || language !== 'all' || duration !== 'all' || contentType !== 'all' || sortBy !== 'newest'
              ? 'bg-accent-rose/25 border-accent-rose text-accent-rose shadow-md'
              : 'bg-bg-surface border-border-dark text-text-secondary hover:text-white hover:border-slate-400'
          }`}
          title="Toggle Filters"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-semibold">Filters</span>
        </button>
      </div>

      {/* Advanced Drawer Filter Panel */}
      {showFilters && (
        <div className="glass-panel rounded-2xl p-5 mb-6 border border-border-dark/60 animate-fade-in grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
            >
              <option value="all">All Genres</option>
              {genresList.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
            >
              <option value="all">Any Duration</option>
              <option value="short">Short (&lt; 1m)</option>
              <option value="medium">Medium (1-5m)</option>
              <option value="long">Long (&gt; 5m)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Format</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
            >
              <option value="all">All Formats</option>
              <option value="short">Shorts</option>
              <option value="episode">Episodes</option>
              <option value="short_film">Short Films</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
            >
              <option value="newest">Newest Releases</option>
              <option value="trending">Trending Now</option>
              <option value="most_watched">Most Viewed</option>
            </select>
          </div>

          <div className="col-span-2 md:col-span-5 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-bg-card border border-border-dark hover:border-red-400 text-xs font-semibold text-text-secondary hover:text-red-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border-dark mb-6">
        <button
          onClick={() => setActiveSubTab('videos')}
          className={`px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
            activeSubTab === 'videos'
              ? 'border-accent-rose text-accent-rose'
              : 'border-transparent text-text-secondary hover:text-white'
          }`}
        >
          Videos ({filteredVideos.length})
        </button>
        <button
          onClick={() => setActiveSubTab('series')}
          className={`px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
            activeSubTab === 'series'
              ? 'border-accent-rose text-accent-rose'
              : 'border-transparent text-text-secondary hover:text-white'
          }`}
        >
          Series ({filteredSeries.length})
        </button>
        <button
          onClick={() => setActiveSubTab('creators')}
          className={`px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${
            activeSubTab === 'creators'
              ? 'border-accent-rose text-accent-rose'
              : 'border-transparent text-text-secondary hover:text-white'
          }`}
        >
          Creators ({filteredCreators.length})
        </button>
      </div>

      {/* RENDER DYNAMIC GRID */}
      {activeSubTab === 'videos' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => onVideoSelect(video.id)}
              className="bg-bg-surface border border-border-dark/60 rounded-2xl overflow-hidden hover:border-slate-500 transition-all cursor-pointer group shadow-sm flex flex-col h-full"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img
                  src={resolveMediaUrl(video.thumbnail_url) || DEFAULT_THUMBNAIL}
                  alt={video.title}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-slate-100 border border-white/5">
                  {Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}
                </span>
                
                {/* Play Hover overlay */}
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-accent-rose flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold line-clamp-1 text-white mb-0.5 leading-snug">{video.title}</h4>
                  <p className="text-[10px] text-text-muted hover:underline mb-1.5" onClick={(e) => { e.stopPropagation(); onCreatorSelect(video.creator_id); }}>
                    {getCreatorNameByUserId(video.creator_id)}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 text-[10px] text-text-muted border-t border-border-dark/30 pt-2 mt-auto">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{video.view_count}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{video.like_count}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredVideos.length === 0 && (
            <div className="col-span-full py-16 text-center text-text-secondary">
              <Compass className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-xs">No videos match your active search filters.</p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'series' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredSeries.map((series) => {
            const seriesCreator = profiles.find(p => p.id === series.creator_id);
            return (
              <div
                key={series.id}
                onClick={() => onSeriesSelect(series.id)}
                className="bg-bg-surface border border-border-dark/60 rounded-2xl overflow-hidden hover:border-slate-500 transition-all cursor-pointer group shadow-sm flex"
              >
                {/* Cover Image */}
                <div className="w-28 xs:w-32 aspect-[3/4] overflow-hidden bg-black flex-shrink-0 relative">
                  <img
                    src={resolveMediaUrl(series.cover_url) || DEFAULT_THUMBNAIL}
                    alt={series.title}
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-accent-rose text-white border border-accent-rose/10">
                    Series
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1 mb-0.5 leading-snug">{series.title}</h4>
                    <p className="text-[10px] text-text-muted mb-2">
                      by {seriesCreator?.display_name || seriesCreator?.username || 'Creator'}
                    </p>
                    <p className="text-[11px] text-slate-300 line-clamp-2 leading-normal font-light">
                      {series.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-bg-card text-text-secondary border border-border-dark font-medium">
                      {series.genre}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-bg-card text-text-secondary border border-border-dark font-medium uppercase">
                      {series.language}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredSeries.length === 0 && (
            <div className="col-span-full py-16 text-center text-text-secondary">
              <Compass className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-xs">No series found matching your active filter criteria.</p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'creators' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCreators.map((creator) => {
            const profile = getProfileByCreatorId(creator.id);
            if (!profile) return null;
            return (
              <div
                key={creator.id}
                onClick={() => onCreatorSelect(profile.id)}
                className="bg-bg-surface border border-border-dark/60 rounded-2xl p-4 hover:border-slate-500 transition-all cursor-pointer text-center flex flex-col items-center justify-between"
              >
                <div className="flex flex-col items-center">
                  <img
                    src={resolveMediaUrl(profile.avatar_url) || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
                    alt={creator.creator_name}
                    onError={handleImageError}
                    className="w-16 h-16 rounded-2xl bg-bg-card border border-border-dark p-1 object-cover mb-3"
                  />
                  <h4 className="text-sm font-bold text-white line-clamp-1 mb-0.5">{creator.creator_name}</h4>
                  <span className="text-[10px] text-text-muted mb-2">@{profile.username}</span>
                  <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed font-light mb-3">
                    {profile.bio || 'No bio written yet.'}
                  </p>
                </div>

                <div className="w-full border-t border-border-dark/40 pt-3 flex items-center justify-around text-[10px] text-text-secondary">
                  <div className="text-center">
                    <span className="block font-bold text-white">{creator.followers_count}</span>
                    <span>Followers</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-white">{creator.total_views}</span>
                    <span>Views</span>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredCreators.length === 0 && (
            <div className="col-span-full py-16 text-center text-text-secondary">
              <Compass className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-xs">No creators found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default Discover;
