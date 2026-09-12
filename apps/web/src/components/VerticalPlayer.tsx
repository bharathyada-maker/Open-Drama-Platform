import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dbClient } from '../lib/dbClient';
import { Video, Profile, CreatorProfile } from '../types/schema';
import { Heart, MessageCircle, Bookmark, Share2, AlertTriangle, Play, Volume2, VolumeX, Loader2, Plus, Check, Eye, EyeOff, ChevronDown } from 'lucide-react';

interface VerticalPlayerProps {
  video: Video;
  isActive: boolean;
  onCommentsClick: (videoId: string) => void;
  onCreatorClick: (creatorId: string) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

interface SubtitleData {
  time_offset_ms: number;
  duration_ms: number;
  text: string;
}

const resolveMediaUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const base = import.meta.env.BASE_URL || '/';
  const clean = url.startsWith('/') ? url.slice(1) : url;
  return `${base}${clean}`;
};

const AI_SUBTITLES: Record<string, { start: number; end: number; text: string }[]> = {
  'vid-ai-1': [
    { start: 0, end: 3, text: '🎵 [Atmospheric cyberpunk synths swell]' },
    { start: 3, end: 6, text: '"Shibuya. 2:00 AM. Rain slicking the pavement."' },
    { start: 6, end: 10, text: '"The neon signals speak in a silent language..."' },
    { start: 10, end: 13, text: '"...that only the city rain understands."' },
    { start: 13, end: 15, text: '🎵 [Soft vinyl crackle fades out]' }
  ],
  'vid-ai-2': [
    { start: 0, end: 3, text: '"Every line of code is a synapse firing."' },
    { start: 3, end: 7, text: '"In the quiet of the night, the terminal is the only window."' },
    { start: 7, end: 11, text: '"We build complex systems to escape the noise..."' },
    { start: 11, end: 15, text: '"...only to find our peace in the compiling static."' }
  ],
  'vid-ai-3': [
    { start: 0, end: 4, text: '"What happens when art is computed, not drawn?"' },
    { start: 4, end: 8, text: '"A landscape woven from vectors and coordinates..."' },
    { start: 8, end: 12, text: '"...painting the raw geometry of our digital tomorrow."' },
    { start: 12, end: 15, text: '"Designed by code. Animated by light."' }
  ],
  'vid-sav-1': [
    { start: 0, end: 3, text: '🎵 [Serene ambient savanna acoustics playing]' },
    { start: 3, end: 7, text: '"Every year, over a million wildebeests traverse the Serengeti plains."' },
    { start: 7, end: 11, text: '"Crossing the Mara river is the ultimate test of predator and prey survival."' },
    { start: 11, end: 15, text: '"A timeless cycle of life, migration, and raw instinct."' }
  ],
  'vid-sav-2': [
    { start: 0, end: 4, text: '"At first light, the savanna belongs to the silent hunters."' },
    { start: 4, end: 8, text: '"A cheetah scans the golden dry grasses, seeking a single opening."' },
    { start: 8, end: 12, text: '"In this endless landscape, speed is second to patience."' },
    { start: 12, end: 15, text: '🎵 [Peaceful morning acoustic chords rise]' }
  ],
  'vid-sav-3': [
    { start: 0, end: 3, text: '🎵 [Calming waterhole reflections soundscape]' },
    { start: 3, end: 7, text: '"Under a dry scorching sun, the waterhole becomes a sanctuary."' },
    { start: 7, end: 11, text: '"A quiet truce allows giants and predators to share the cooling oasis."' },
    { start: 11, end: 15, text: '"Here, water is more valuable than territory."' }
  ],
  'vid-sav-4': [
    { start: 0, end: 4, text: '"Night falls, and a different savanna awakens under the cosmos."' },
    { start: 4, end: 8, text: '"The pride watches over the dark grasslands, rulers of the shadows."' },
    { start: 8, end: 12, text: '"Under the silver glow of the Milky Way, survival never sleeps."' },
    { start: 12, end: 15, text: '🎵 [Soft night breezes and wind chimes fade]' }
  ],
  'vid-short-14': [
    { start: 0, end: 3, text: '🎵 [Warm upbeat acoustic melody plays]' },
    { start: 3, end: 7, text: '"Two golden retriever brothers exploring the autumn woods."' },
    { start: 7, end: 11, text: '"Crisp leaves, sunny afternoon, and endless tail wags."' },
    { start: 11, end: 15, text: '🎵 [Cheerful puppy playfulness fades out]' }
  ]
};

export const VerticalPlayer: React.FC<VerticalPlayerProps> = ({ video, isActive, onCommentsClick, onCreatorClick, isMuted, onMuteToggle }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastLoadedAudioSrcRef = useRef<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(video.like_count || 0);
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);
  const [isCreatorVerified, setIsCreatorVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Double-tap animate state
  const [showHeartAnimate, setShowHeartAnimate] = useState(false);

  // Analytics checkpoints
  const [checkpoints, setCheckpoints] = useState({ p25: false, p50: false, p75: false, p100: false });

  // Fetch creator info and user relationship states
  useEffect(() => {
    const fetchRelations = async () => {
      try {
        const creatorData = await dbClient.getCreatorProfile(video.creator_id);
        if (creatorData) {
          setIsCreatorVerified(creatorData.is_verified || false);
        }

        // Query profile from user id
        const rawProfiles = JSON.parse(localStorage.getItem('opendrama_db_profiles') || '[]');
        const creatorUser = rawProfiles.find((p: Profile) => p.id === video.creator_id) || null;
        if (creatorUser) {
          setCreatorProfile(creatorUser);
        }

        if (user) {
          const likes = await dbClient.getLikes(video.id);
          setLiked(likes.some(l => l.user_id === user.id));

          const savedList = await dbClient.getSavedVideos(user.id);
          setSaved(savedList.some(s => s.video_id === video.id));

          const followsList = await dbClient.getFollows();
          setFollowing(followsList.some(f => f.follower_id === user.id && f.following_id === video.creator_id));
        }
      } catch (err) {
        console.error('Error fetching relations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRelations();
  }, [video.id, video.creator_id, user]);

  const isAiVideo = video.video_url.includes('/images/');

  // Simulating time progression for AI video
  useEffect(() => {
    if (!isAiVideo || !isActive) return;
    
    let intervalId: any;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1;
          const dur = video.duration_seconds || 15;
          if (next >= dur) {
            handleVideoEnded();
            return 0;
          }
          return next;
        });
      }, 100);
    }
    
    return () => clearInterval(intervalId);
  }, [isAiVideo, isPlaying, isActive]);

  // Sync duration for AI video
  useEffect(() => {
    if (isAiVideo) {
      setDuration(video.duration_seconds || 15);
    }
  }, [isAiVideo, video.duration_seconds]);

  // Unified bulletproof audio synchronizer hook
  useEffect(() => {
    if (!audioRef.current) return;

    if (!video.audio_url) {
      audioRef.current.pause();
      if (videoRef.current) {
        videoRef.current.muted = isMuted;
      }
      return;
    }

    // Only load if the actual audio source path has changed
    if (lastLoadedAudioSrcRef.current !== video.audio_url) {
      lastLoadedAudioSrcRef.current = video.audio_url;
      audioRef.current.src = resolveMediaUrl(video.audio_url);
      audioRef.current.load();
    }

    audioRef.current.muted = isMuted;
    audioRef.current.volume = 1.0;

    if (isActive && isPlaying) {
      audioRef.current.play().catch(e => {
        console.warn('Audio playback waiting for user interaction:', e.message);
      });
      if (videoRef.current) {
        videoRef.current.muted = true;
      }
    } else {
      audioRef.current.pause();
      if (videoRef.current) {
        videoRef.current.muted = isMuted;
      }
    }
  }, [video.id, video.audio_url, isActive, isPlaying, isMuted]);

  // Handle Autoplay Active changes
  useEffect(() => {
    if (isAiVideo) {
      if (isActive) {
        setIsPlaying(true);
        dbClient.logEvent(user?.id || null, video.id, 'play');
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        setCheckpoints({ p25: false, p50: false, p75: false, p100: false });
      }
      return;
    }

    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play()
          .then(() => {
            setIsPlaying(true);
            dbClient.logEvent(user?.id || null, video.id, 'play');
          })
          .catch((e) => {
            // Autoplay blocked: set playing false
            setIsPlaying(false);
          });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsPlaying(false);
        // Reset checkpoints
        setCheckpoints({ p25: false, p50: false, p75: false, p100: false });
      }
    }
  }, [isActive, video.id, user, isAiVideo]);

  const handlePlayPause = () => {
    const nextPlaying = !isPlaying;
    setIsPlaying(nextPlaying);
    dbClient.logEvent(user?.id || null, video.id, nextPlaying ? 'play' : 'pause');

    if (audioRef.current) {
      if (nextPlaying && isActive) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }

    if (!isAiVideo && videoRef.current) {
      if (nextPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    onMuteToggle();
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
      if (!nextMuted && isPlaying) {
        audioRef.current.play().catch(err => console.warn('Play error on unmute:', err));
      }
    }
    if (videoRef.current) {
      videoRef.current.muted = nextMuted || !!video.audio_url;
    }
  };

  const handleTimeUpdate = () => {
    if (isAiVideo) return;
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    const dur = videoRef.current.duration || video.duration_seconds || 1;
    setCurrentTime(curr);
    setDuration(dur);

    // Track percentage checkpoints
    const pct = (curr / dur) * 100;
    
    if (pct >= 25 && !checkpoints.p25) {
      setCheckpoints(prev => ({ ...prev, p25: true }));
      dbClient.logEvent(user?.id || null, video.id, '25_percent');
    }
    if (pct >= 50 && !checkpoints.p50) {
      setCheckpoints(prev => ({ ...prev, p50: true }));
      dbClient.logEvent(user?.id || null, video.id, '50_percent');
    }
    if (pct >= 75 && !checkpoints.p75) {
      setCheckpoints(prev => ({ ...prev, p75: true }));
      dbClient.logEvent(user?.id || null, video.id, '75_percent');
    }
  };

  const handleVideoEnded = () => {
    dbClient.logEvent(user?.id || null, video.id, 'complete');
    // Save to history as completed
    if (user) {
      dbClient.updateWatchHistory(user.id, video.id, Math.floor(duration), Math.floor(duration));
    }
    
    // Auto replay or move next
    if (isAiVideo) {
      setCurrentTime(0);
      setIsPlaying(true);
      dbClient.logEvent(user?.id || null, video.id, 'replay');
      return;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      dbClient.logEvent(user?.id || null, video.id, 'replay');
    }
  };

  // Double tap to like
  let lastTap = 0;
  const handleDoubleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Trigger like
      setShowHeartAnimate(true);
      setTimeout(() => setShowHeartAnimate(false), 800);
      if (!liked && user) {
        handleLikeToggle(e);
      }
    }
    lastTap = now;
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return alert('Please Sign In to like videos.');
    try {
      if (liked) {
        await dbClient.unlikeVideo(user.id, video.id);
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        dbClient.logEvent(user.id, video.id, 'skip', { action: 'unlike' });
      } else {
        await dbClient.likeVideo(user.id, video.id);
        setLiked(true);
        setLikesCount(prev => prev + 1);
        dbClient.logEvent(user.id, video.id, 'like');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return alert('Please Sign In to save videos.');
    try {
      const isSaved = await dbClient.toggleSaveVideo(user.id, video.id);
      setSaved(isSaved);
      dbClient.logEvent(user.id, video.id, 'save');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return alert('Please Sign In to follow creators.');
    try {
      if (following) {
        await dbClient.unfollowCreator(user.id, video.creator_id);
        setFollowing(false);
      } else {
        await dbClient.followCreator(user.id, video.creator_id);
        setFollowing(true);
        dbClient.logEvent(user.id, video.id, 'follow');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}?video=${video.id}`);
    alert('Share link copied to clipboard!');
    dbClient.logEvent(user?.id || null, video.id, 'share');
  };

  const handleReportClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return alert('Please Sign In to file a report.');
    const reason = prompt('Please enter a reason for reporting (copyright, spam, harassment, inappropriate, other):');
    if (!reason) return;
    const details = prompt('Enter additional details:');
    try {
      await dbClient.submitReport(user.id, video.id, null, reason as any, details || '');
      alert('Thank you. The report has been filed and sent to moderators.');
      dbClient.logEvent(user.id, video.id, 'skip', { action: 'report' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetVal = parseFloat(e.target.value);
    setCurrentTime(targetVal);
    if (videoRef.current) {
      videoRef.current.currentTime = targetVal;
    }
  };

  const activeSub = isAiVideo 
    ? (AI_SUBTITLES[video.id] || []).find(s => currentTime >= s.start && currentTime <= s.end)?.text
    : null;

  return (
    <div
      onClick={handlePlayPause}
      onMouseDown={handleDoubleTap}
      className="w-full h-full bg-black relative flex items-center justify-center select-none overflow-hidden group snap-start"
    >
      {/* Audio track simulator */}
      {video.audio_url && (
        <audio
          ref={audioRef}
          src={resolveMediaUrl(video.audio_url)}
          loop
          muted={isMuted}
        />
      )}

      {/* Video / AI image stream container */}
      {isAiVideo ? (
        <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black aspect-[9/16]">
          {/* Ken Burns effect container */}
          <div 
            className="w-full h-full bg-cover bg-center transition-transform ease-out"
            style={{ 
              backgroundImage: `url(${resolveMediaUrl(video.video_url)})`,
              transform: isPlaying 
                ? `scale(${1.08 + Math.sin(currentTime / 2.5) * 0.04}) translate(${Math.cos(currentTime / 3) * 1.5}%, ${Math.sin(currentTime / 3) * 1.5}%)`
                : 'scale(1.05) translate(0%, 0%)',
              filter: 'brightness(0.9) contrast(1.05)',
              transitionDuration: '100ms'
            }}
          />
          {/* Pulsing neon color filter matching the neon horizons vibe */}
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-1000"
            style={{
              background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.08) 70%)',
              opacity: isPlaying ? 0.6 + Math.sin(currentTime * 2) * 0.2 : 0.4
            }}
          />
          {/* Film ambient lighting overlay */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-accent-rose/5 via-transparent to-accent-purple/5 mix-blend-overlay" />
          
          {/* Subtitle kinetic text box */}
          {activeSub && (
            <div className={`absolute bottom-28 left-4 right-4 text-center z-20 pointer-events-none transition-all duration-300 transform ${
              isCinematic ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100'
            }`}>
              <span className="px-4 py-2 rounded-xl bg-black/65 border border-white/10 backdrop-blur-md text-white text-xs md:text-sm font-medium tracking-wide leading-relaxed inline-block shadow-xl max-w-[85%]">
                {activeSub}
              </span>
            </div>
          )}
        </div>
      ) : (
        <video
          ref={videoRef}
          src={resolveMediaUrl(video.video_url)}
          loop
          playsInline
          muted={isMuted || !!video.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={() => videoRef.current && setDuration(videoRef.current.duration)}
          onEnded={handleVideoEnded}
          className="w-full h-full object-cover aspect-[9/16]"
        />
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
          <Loader2 className="w-10 h-10 text-accent-rose animate-spin" />
        </div>
      )}

      {/* Double Tap Heart Glow Overlay */}
      {showHeartAnimate && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <Heart className="w-24 h-24 text-accent-rose fill-accent-rose animate-ping opacity-90" />
        </div>
      )}

      {/* Cinematic gradient shadow overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none transition-opacity duration-300 ${
        isCinematic ? 'opacity-20' : 'opacity-100'
      }`} />

      {/* Top Controls: Mute, Cinematic Mode and Information */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-black/40 text-slate-200 border border-slate-700/30 backdrop-blur-md">
          {video.content_type}
        </span>
        <div className="flex items-center gap-2">
          {/* Cinematic View Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setIsCinematic(!isCinematic); }}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/5 shadow-md transition-all hover:scale-105 active:scale-95"
            title={isCinematic ? "Show Controls" : "Cinematic Mode"}
          >
            {isCinematic ? <Eye className="w-4 h-4 text-accent-rose animate-pulse" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {/* Volume Button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleMuteToggle(e); }}
            className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/5 shadow-md transition-all hover:scale-105 active:scale-95"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-accent-rose animate-pulse" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Overlay Details (Bottom Left) */}
      <div className={`absolute bottom-6 left-4 right-16 z-10 text-white pointer-events-none max-w-sm transition-all duration-300 transform ${
        isCinematic ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100'
      }`}>
        <div className="flex items-center gap-2 mb-3 pointer-events-auto">
          {creatorProfile && (
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={(e) => { e.stopPropagation(); onCreatorClick(video.creator_id); }}
            >
              <img
                src={creatorProfile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${creatorProfile.username}`}
                alt={creatorProfile.username}
                className="w-9 h-9 rounded-xl border border-white/20 bg-bg-card"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold hover:underline">
                    {creatorProfile.display_name || creatorProfile.username}
                  </span>
                  {isCreatorVerified && (
                    <span className="w-3.5 h-3.5 rounded-full bg-accent-rose flex items-center justify-center text-[8px] font-bold text-white">✓</span>
                  )}
                </div>
                <span className="text-[10px] text-text-secondary">@{creatorProfile.username}</span>
              </div>
            </div>
          )}

          {/* Follow Button */}
          {user && user.id !== video.creator_id && (
            <button
              onClick={handleFollowToggle}
              className={`ml-2 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                following
                  ? 'bg-white/10 border border-white/10 text-slate-300'
                  : 'bg-accent-rose text-white hover:opacity-90'
              }`}
            >
              {following ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        <h3 className="text-md font-bold leading-snug drop-shadow-sm mb-1">{video.title}</h3>
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-light mb-2">
          {video.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {video.ai_tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-md font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons Panel (Right Side) */}
      <div className="absolute bottom-16 right-4 flex flex-col items-center gap-5 z-10 text-white">
        {/* Like Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleLikeToggle}
            className={`p-3 rounded-full backdrop-blur-md border shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
              liked
                ? 'bg-accent-rose border-accent-rose text-white shadow-accent-rose/30'
                : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
            }`}
          >
            <Heart className={`w-5.5 h-5.5 ${liked ? 'fill-white' : ''}`} />
          </button>
          <span className="text-[11px] font-bold text-slate-300 drop-shadow">{likesCount}</span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onCommentsClick(video.id); }}
            className="p-3 rounded-full bg-black/40 border border-white/10 hover:bg-black/60 backdrop-blur-md shadow-lg transition-all transform hover:scale-105"
          >
            <MessageCircle className="w-5.5 h-5.5 text-white" />
          </button>
          <span className="text-[11px] font-bold text-slate-300 drop-shadow">{video.comment_count || 0}</span>
        </div>

        {/* Save/Watchlist Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleSaveToggle}
            className={`p-3 rounded-full backdrop-blur-md border shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
              saved
                ? 'bg-accent-purple border-accent-purple text-white shadow-accent-purple/30'
                : 'bg-black/40 border-white/10 text-white hover:bg-black/60'
            }`}
          >
            <Bookmark className={`w-5.5 h-5.5 ${saved ? 'fill-white' : ''}`} />
          </button>
          <span className="text-[11px] font-bold text-slate-300 drop-shadow">Save</span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleShareClick}
            className="p-3 rounded-full bg-black/40 border border-white/10 hover:bg-black/60 backdrop-blur-md shadow-lg transition-all transform hover:scale-105"
          >
            <Share2 className="w-5.5 h-5.5 text-white" />
          </button>
          <span className="text-[11px] font-bold text-slate-300 drop-shadow">Share</span>
        </div>

        {/* Moderation / Report Button */}
        <button
          onClick={handleReportClick}
          className="p-2.5 rounded-full bg-black/40 border border-white/5 text-text-muted hover:text-red-400 backdrop-blur-md shadow-sm transition-colors mt-2"
          title="Report content"
        >
          <AlertTriangle className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Progress Timeline Slider Overlay */}
      <div 
        className="absolute bottom-0 left-0 w-full px-4 py-2 bg-gradient-to-t from-black/60 to-transparent z-15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={currentTime}
            onChange={handleSliderChange}
            className="flex-1 accent-accent-rose bg-white/20 h-1 rounded-lg cursor-pointer outline-none border-none"
          />
          <span className="text-[10px] font-bold font-mono text-slate-300 min-w-[32px]">
            {Math.floor(currentTime)}s
          </span>
        </div>
      </div>
    </div>
  );
};
export default VerticalPlayer;
