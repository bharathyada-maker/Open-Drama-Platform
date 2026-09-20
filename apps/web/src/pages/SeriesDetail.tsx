import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dbClient } from '../lib/dbClient';
import { Video, Series, Season, Episode, Profile, WatchHistory } from '../types/schema';
import { ArrowLeft, Play, Bookmark, Clock, Check, Film, Share2, Loader2 } from 'lucide-react';
import { resolveMediaUrl, handleImageError, DEFAULT_THUMBNAIL } from '../lib/mediaUtils';

interface SeriesDetailProps {
  seriesId: string;
  onBack: () => void;
  onEpisodeSelect: (videoId: string, playlistVideoIds: string[]) => void;
  onCreatorSelect: (creatorId: string) => void;
}

export const SeriesDetail: React.FC<SeriesDetailProps> = ({ seriesId, onBack, onEpisodeSelect, onCreatorSelect }) => {
  const { user } = useAuth();
  const [series, setSeries] = useState<Series | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Watch history for progress tracking
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [continueEpisode, setContinueEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      setLoading(true);
      try {
        const s = await dbClient.getSeriesById(seriesId);
        if (!s) return;
        setSeries(s);

        // Fetch creator
        const rawProfiles = JSON.parse(localStorage.getItem('opendrama_db_profiles') || '[]');
        const creator = rawProfiles.find((p: Profile) => p.id === s.creator_id) || null;
        setCreatorProfile(creator);

        // Fetch seasons
        const seas = await dbClient.getSeasons(seriesId);
        setSeasons(seas);

        if (seas.length > 0) {
          setSelectedSeasonId(seas[0].id);
        }

        // Fetch user relations
        if (user) {
          // Check saved status
          const savedList = await dbClient.getSavedVideos(user.id);
          setIsSaved(savedList.some(sv => sv.video_id === s.id)); // Using saved list

          // Fetch watch history
          const wh = await dbClient.getWatchHistory(user.id);
          setWatchHistory(wh);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesDetails();
  }, [seriesId, user]);

  // Load episodes when season selection changes
  useEffect(() => {
    if (!selectedSeasonId) return;
    const fetchEpisodes = async () => {
      try {
        const eps = await dbClient.getEpisodes(selectedSeasonId);
        setEpisodes(eps);

        // Calculate Continue Watching episode based on history
        if (eps.length > 0) {
          const epVideoIds = eps.map(e => e.video_id);
          const relatedHistory = watchHistory
            .filter(h => epVideoIds.includes(h.video_id))
            .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime());

          if (relatedHistory.length > 0) {
            // Find the episode matching the last watched video ID
            const lastWatchedVideoId = relatedHistory[0].video_id;
            const lastEp = eps.find(e => e.video_id === lastWatchedVideoId);
            setContinueEpisode(lastEp || eps[0]);
          } else {
            setContinueEpisode(eps[0]); // Default to first episode
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchEpisodes();
  }, [selectedSeasonId, watchHistory]);

  const handleToggleSaveSeries = async () => {
    if (!user || !series) return alert('Please Sign In to save series.');
    try {
      // For this MVP, we save/unsave the series video identifier
      const wasSaved = await dbClient.toggleSaveVideo(user.id, series.id);
      setIsSaved(wasSaved);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlayEpisode = (video_id: string) => {
    // Gather all video IDs in the current season for next episode sequencing
    const playlistIds = episodes.map(e => e.video_id);
    onEpisodeSelect(video_id, playlistIds);
  };

  const getWatchProgress = (videoId: string) => {
    const record = watchHistory.find(h => h.video_id === videoId);
    return record ? record.completion_percent : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-rose animate-spin" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-bg-dark text-center py-20">
        <p className="text-text-secondary text-sm">Series not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-accent-rose text-white text-xs font-semibold rounded-xl">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-slate-100 pb-24 animate-fade-in relative">
      {/* Background Cover Blurred Banner */}
      <div className="absolute top-0 left-0 w-full h-80 overflow-hidden opacity-10 pointer-events-none">
        <img src={resolveMediaUrl(series.cover_url) || DEFAULT_THUMBNAIL} alt="" onError={handleImageError} className="w-full h-full object-cover blur-2xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 relative z-10">
        {/* Back navigation */}
        <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-white text-sm font-semibold transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </button>

        {/* Series Cover & Info Header Layout */}
        <div className="flex flex-col md:flex-row gap-6 items-start mb-8">
          <div className="w-full md:w-56 aspect-[3/4] bg-bg-card border border-border-dark rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
            <img src={resolveMediaUrl(series.cover_url) || DEFAULT_THUMBNAIL} alt={series.title} onError={handleImageError} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] bg-accent-rose/20 text-accent-rose border border-accent-rose/30 font-bold uppercase tracking-wider">
                {series.genre}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] bg-bg-surface text-text-secondary border border-border-dark font-bold uppercase tracking-wider">
                {series.language}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white mb-2 leading-tight">{series.title}</h1>
            
            {creatorProfile && (
              <p className="text-xs text-text-secondary mb-4">
                Created by{' '}
                <span 
                  onClick={() => onCreatorSelect(series.creator_id)}
                  className="text-accent-rose font-semibold cursor-pointer hover:underline"
                >
                  {creatorProfile.display_name || creatorProfile.username}
                </span>
              </p>
            )}

            <p className="text-sm text-slate-300 font-light leading-relaxed mb-6">
              {series.description}
            </p>

            <div className="flex flex-wrap gap-3">
              {/* Play / Continue button */}
              {continueEpisode ? (
                <button
                  onClick={() => handlePlayEpisode(continueEpisode.video_id)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-bold rounded-xl shadow-lg shadow-accent-rose/25 hover:opacity-95 transition-opacity"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>
                    {getWatchProgress(continueEpisode.video_id) > 0 ? `Continue: S1 Ep ${continueEpisode.episode_number}` : 'Start Watching'}
                  </span>
                </button>
              ) : (
                <div className="px-4 py-3 bg-bg-surface border border-border-dark text-xs text-text-muted rounded-xl">
                  Episodes Coming Soon
                </div>
              )}

              {/* Bookmark save button */}
              <button
                onClick={handleToggleSaveSeries}
                className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                  isSaved
                    ? 'bg-accent-purple/20 border-accent-purple text-accent-purple'
                    : 'bg-bg-surface border-border-dark text-text-secondary hover:text-white'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-accent-purple' : ''}`} />
                <span>{isSaved ? 'Saved to Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Seasons Tab Selector */}
        {seasons.length > 1 && (
          <div className="flex border-b border-border-dark/60 mb-6 overflow-x-auto gap-2">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => setSelectedSeasonId(season.id)}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  selectedSeasonId === season.id
                    ? 'border-accent-rose text-accent-rose'
                    : 'border-transparent text-text-secondary hover:text-white'
                }`}
              >
                Season {season.season_number}
              </button>
            ))}
          </div>
        )}

        {/* Episodes Row Grid index */}
        <div>
          <h3 className="text-md font-bold mb-4 flex items-center gap-2">
            <Film className="w-4 h-4 text-accent-rose" />
            <span>Episodes List</span>
          </h3>

          <div className="space-y-3">
            {episodes.map((episode) => {
              const progress = getWatchProgress(episode.video_id);
              return (
                <div
                  key={episode.id}
                  onClick={() => handlePlayEpisode(episode.video_id)}
                  className="bg-bg-surface border border-border-dark/60 hover:border-slate-500 rounded-xl p-4 flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                    {/* Circle Episode number */}
                    <div className="w-8 h-8 rounded-full bg-bg-card border border-border-dark flex items-center justify-center text-xs font-bold text-text-secondary group-hover:bg-accent-rose group-hover:text-white group-hover:border-accent-rose transition-colors">
                      {episode.episode_number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white leading-snug group-hover:text-accent-rose transition-colors">
                        {episode.title}
                      </h4>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {episode.video?.duration_seconds ? `${Math.floor(episode.video.duration_seconds / 60)}m ${episode.video.duration_seconds % 60}s` : 'Vertical Short'}
                      </p>

                      {/* Watch Progress bar */}
                      {progress > 0 && (
                        <div className="w-full max-w-xs bg-bg-card h-1 rounded-full mt-2 overflow-hidden border border-border-dark">
                          <div
                            className="bg-accent-rose h-full rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Play Action Trigger */}
                  <div className="w-9 h-9 rounded-xl bg-bg-card border border-border-dark flex items-center justify-center text-text-secondary group-hover:bg-gradient-to-r group-hover:from-accent-rose group-hover:to-accent-purple group-hover:text-white group-hover:border-accent-rose transition-all shadow-sm">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>
              );
            })}

            {episodes.length === 0 && (
              <div className="py-12 bg-bg-surface border border-dashed border-border-dark rounded-xl text-center text-xs text-text-muted">
                No episodes have been uploaded to this season yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SeriesDetail;
