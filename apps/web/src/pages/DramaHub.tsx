import React, { useState, useEffect } from 'react';
import { dbClient } from '../lib/dbClient';
import { Video } from '../types/schema';
import { 
  Heart, 
  Flame, 
  Laugh, 
  Sparkles, 
  Film, 
  Clock, 
  Play, 
  Eye, 
  CheckCircle2, 
  PlusCircle, 
  DollarSign, 
  ShieldCheck, 
  Cpu, 
  ChevronRight,
  Tv,
  BookOpen,
  Sun,
  Trees,
  PawPrint
} from 'lucide-react';

interface DramaHubProps {
  setTab: (tab: string) => void;
  onVideoSelect: (videoId: string) => void;
  onCreatorSelect: (creatorId: string) => void;
  onGenreSelect?: (genre: string) => void;
}

type SegmentKey = 'love' | 'action' | 'comedy' | 'devotional' | 'nature' | 'animals';

interface SegmentInfo {
  key: SegmentKey;
  label: string;
  genreTag: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string;
  bgGlow: string;
  tagline: string;
  description: string;
  concepts: {
    title: string;
    runtime: string;
    hook: string;
    synopsis: string;
    tag: string;
  }[];
}

const SEGMENTS: Record<SegmentKey, SegmentInfo> = {
  love: {
    key: 'love',
    label: 'Love',
    genreTag: 'Love',
    icon: Heart,
    gradient: 'from-rose-500 via-pink-500 to-purple-600',
    accentColor: 'text-rose-400',
    bgGlow: 'bg-rose-500/10 border-rose-500/30',
    tagline: 'Emotional, Intimate & Relationship-Driven',
    description: 'Stories centered on electric chemistry, second chances, and bittersweet confrontations. High-retention micro-romance engineered to deliver an emotional punch within 300 seconds.',
    concepts: [
      {
        title: 'The Last Metro Car',
        runtime: '3m 45s',
        hook: 'Two exes step into the same midnight subway car with 5 stops remaining.',
        synopsis: 'A torrential rainstorm forces former college sweethearts into an empty midnight train car. With five stops left before the line terminates, they confront the real reason they stopped speaking three years ago.',
        tag: 'Intimate Drama'
      },
      {
        title: 'Coffee Cup Coordinates',
        runtime: '4m 10s',
        hook: 'A mystery message scrawled on a morning coffee cup changes everything.',
        synopsis: 'A quiet barista secretly pens mystery travel coordinates on the morning paper cup of a shy regular customer, completely unaware that today marks the customer’s final afternoon in the city.',
        tag: 'Meet-Cute Romance'
      },
      {
        title: '500 Miles Apart',
        runtime: '4m 30s',
        hook: 'A split-screen anniversary dinner across two timezones.',
        synopsis: 'Told through dynamic split-screen vertical video, a long-distance couple prepares their anniversary dinner together over video chat, building toward a surprise knock on one of their front doors.',
        tag: 'Modern Connection'
      }
    ]
  },
  action: {
    key: 'action',
    label: 'Action',
    genreTag: 'Action',
    icon: Flame,
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    accentColor: 'text-amber-400',
    bgGlow: 'bg-amber-500/10 border-amber-500/30',
    tagline: 'Fast-Paced, Suspenseful & Adrenaline-Fueled',
    description: 'Ticking countdown clocks, tactical choreography, and intense vertical thrillers. Zero filler—every scene propels the viewer toward high-stakes resolution or shocking cliffhangers.',
    concepts: [
      {
        title: 'The 300-Second Extraction',
        runtime: '4m 55s',
        hook: 'A high-rise elevator lockdown with five minutes on the digital clock.',
        synopsis: 'A corporate security specialist trapped in a glass elevator lockdown has exactly 300 seconds to decrypt a stolen drive and outsmart an incoming mercenary squad descending from the roof.',
        tag: 'Tactical Countdown'
      },
      {
        title: 'Rooftop Courier: Dusk Run',
        runtime: '3m 30s',
        hook: 'A parkour runner racing against sunset to deliver a life-saving serum.',
        synopsis: 'An urban parkour courier carrying a temperature-sensitive antidote races across glowing Tokyo rooftops at dusk to outrun shadowy trackers before the cold-storage seal breaks.',
        tag: 'Parkour Thriller'
      },
      {
        title: 'Red Wire Roulette',
        runtime: '4m 20s',
        hook: 'A defusal headset fed contradictory instructions from a rogue dispatcher.',
        synopsis: 'A rookie bomb technician receives conflicting defusal steps through his radio headset, suddenly realizing the voice on the other end is not the precinct commander.',
        tag: 'Psychological Suspense'
      }
    ]
  },
  comedy: {
    key: 'comedy',
    label: 'Comedy',
    genreTag: 'Comedy',
    icon: Laugh,
    gradient: 'from-yellow-400 via-amber-500 to-emerald-500',
    accentColor: 'text-yellow-400',
    bgGlow: 'bg-yellow-500/10 border-yellow-500/30',
    tagline: 'Sharp Wit, Relatable Chaos & Meme-Worthy Sketches',
    description: 'Rapid-fire humor, awkward workplace dynamics, and relatable absurdity. Crafted for instant giggles, punchy character timing, and high viral shareability across group chats.',
    concepts: [
      {
        title: 'The Interview from Hell',
        runtime: '4m 15s',
        hook: 'The wrong resume leads to the most absurd executive interview in history.',
        synopsis: 'An earnest job applicant realizes four minutes into an ultra-serious Fortune 500 executive interview that the recruiter’s automated system filed him under "undercover birthday clown."',
        tag: 'Workplace Satire'
      },
      {
        title: 'Smart Home Mutiny',
        runtime: '3m 20s',
        hook: 'When your AI voice assistant decides to critique your life choices.',
        synopsis: 'A developer tries to prepare a simple midnight breakfast while his newly installed smart home system enters passive-aggressive conflict mode over his recent dietary and dating habits.',
        tag: 'Tech Parody'
      },
      {
        title: 'The Awkward Elevator Pitch',
        runtime: '3m 50s',
        hook: 'Trapped with a billionaire VC while your demo app makes goat noises.',
        synopsis: 'An indie game creator finds himself riding a 50-floor elevator with a legendary venture capitalist, only to have his mobile prototype trigger glitching farm animal sound effects that refuse to mute.',
        tag: 'Awkward Comedy'
      }
    ]
  },
  devotional: {
    key: 'devotional',
    label: 'Devotional',
    genreTag: 'Devotional',
    icon: Sun,
    gradient: 'from-amber-400 via-orange-500 to-yellow-600',
    accentColor: 'text-amber-300',
    bgGlow: 'bg-amber-500/10 border-amber-500/30',
    tagline: 'Spiritual, Soul-Stirring & Meditative Peace',
    description: 'Sacred dawn rituals, resonant Vedic chanting, temple bells, and tranquil contemplation. Calming vertical stories designed to center the spirit and provide deep peace in under 300 seconds.',
    concepts: [
      {
        title: 'Sacred Dawn at Varanasi',
        runtime: '3m 30s',
        hook: 'A solitary temple bell-ringer awakens the misty river ghats with dawn chanting.',
        synopsis: 'Before the holy city awakens, an elderly bell-keeper performs the first sunrise ritual along the sacred riverbanks, his resonant voice blending with gentle waves and temple chimes.',
        tag: 'Sacred Ritual'
      },
      {
        title: 'The Himalayan Hermit',
        runtime: '4m 15s',
        hook: 'A silent meditation retreat amidst swirling mountain snow and prayer flags.',
        synopsis: 'A young seeker ascends high alpine ridges to meet a reclusive monk, discovering that the deepest answers are shared in five minutes of shared silent tea overlooking the snowy peaks.',
        tag: 'Spiritual Quest'
      },
      {
        title: 'Twilight Ganga Aarti',
        runtime: '4m 45s',
        hook: 'A mesmerizing dance of brass fire lamps reflected on rushing riverwaters.',
        synopsis: 'Hundreds of floating clay lamps illuminate the twilight waters while rhythmic drums and cymbals swell into an exhilarating crescendo of shared devotion.',
        tag: 'Festival of Lights'
      }
    ]
  },
  nature: {
    key: 'nature',
    label: 'Nature',
    genreTag: 'Nature',
    icon: Trees,
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    accentColor: 'text-emerald-300',
    bgGlow: 'bg-emerald-500/10 border-emerald-500/30',
    tagline: 'Pristine Wilderness, Living Forests & Cascading Falls',
    description: 'Cinematic drone pans, ancient redwood canopies, crystal glacial cascades, and starry cosmic skies. Pure atmospheric tranquility delivering an instant nature reset.',
    concepts: [
      {
        title: 'Misty Redwood Canopy',
        runtime: '3m 40s',
        hook: 'Morning fog cascading through ancient 2,000-year-old sequoia giants.',
        synopsis: 'A slow vertical glide through moss-draped redwood branches as the morning sun breaks through coastal mist, revealing the silent grandeur of Earth’s oldest living cathedrals.',
        tag: 'Ancient Forests'
      },
      {
        title: 'Glacial Mountain Cascades',
        runtime: '4m 20s',
        hook: 'Pure crystalline meltwater tumbling over volcanic basalt columns.',
        synopsis: 'Following a single drop of glacial water from high frozen peaks down through roaring canyons and turquoise alpine pools in pristine slow motion.',
        tag: 'Water Wonders'
      },
      {
        title: 'Thunder Over the Canyon',
        runtime: '3m 50s',
        hook: 'Time-lapse desert storm clouds ignited by setting sunset rays.',
        synopsis: 'A dramatic study of lightning flashes dancing between canyon plateaus as monsoon rains transform dry stone arroyos into reflective rivers of glass.',
        tag: 'Atmospheric Drama'
      }
    ]
  },
  animals: {
    key: 'animals',
    label: 'Animals',
    genreTag: 'Animals',
    icon: PawPrint,
    gradient: 'from-orange-400 via-amber-500 to-yellow-500',
    accentColor: 'text-orange-300',
    bgGlow: 'bg-orange-500/10 border-orange-500/30',
    tagline: 'Wild Kingdom Survival, Cute Companions & Pure Instinct',
    description: 'From heart-pounding predator survival on African grasslands to the unconditional loyalty of domestic companions. Celebrating the beauty and instincts of the animal world.',
    concepts: [
      {
        title: 'Savanna Survival: The Great Migration',
        runtime: '4m 10s',
        hook: 'Over a million zebras and wildebeest braving the river crossing.',
        synopsis: 'A thrilling vertical documentary capturing herd matriarchs testing rushing river currents while silent predators wait patiently in the morning shallows.',
        tag: 'Wildlife Survival'
      },
      {
        title: 'Golden Autumn Puppies',
        runtime: '3m 15s',
        hook: 'Two golden retriever brothers discovering swirling autumn foliage.',
        synopsis: 'Pure heartwarming joy as two young retriever puppies chase falling golden leaves through sunny forest paths in an irresistibly cute afternoon loop.',
        tag: 'Cozy Companions'
      },
      {
        title: 'Pacific Humpback Song',
        runtime: '4m 30s',
        hook: 'A mother whale guiding her newborn calf along deep ocean currents.',
        synopsis: 'Drifting into deep azure waters to record the mesmerizing acoustic communication of humpback whales migrating along the coastal trenches.',
        tag: 'Ocean Giants'
      }
    ]
  }
};

export const DramaHub: React.FC<DramaHubProps> = ({ setTab, onVideoSelect, onCreatorSelect, onGenreSelect }) => {
  const [activeSegment, setActiveSegment] = useState<SegmentKey>('love');
  const [activeView, setActiveView] = useState<'showcase' | 'pitch'>('showcase');
  const [segmentVideos, setSegmentVideos] = useState<Video[]>([]);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const list = await dbClient.getVideos();
        setAllVideos(list);
      } catch (err) {
        console.error('Error fetching videos in DramaHub:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    const filtered = allVideos.filter(v => {
      const g = (v.genre || '').toLowerCase();
      const tags = (v.ai_tags || []).map(t => t.toLowerCase());
      const desc = (v.description || '').toLowerCase();
      const title = (v.title || '').toLowerCase();
      
      if (activeSegment === 'love') {
        return g.includes('love') || g.includes('romance') || tags.includes('love') || tags.includes('romance') || title.includes('love') || desc.includes('romantic');
      } else if (activeSegment === 'action') {
        return g.includes('action') || g.includes('thriller') || tags.includes('action') || tags.includes('stunt') || desc.includes('mercenary') || desc.includes('extraction');
      } else if (activeSegment === 'comedy') {
        return g.includes('comedy') || tags.includes('comedy') || tags.includes('meme') || desc.includes('interview') || desc.includes('mutiny') || desc.includes('funny');
      } else if (activeSegment === 'devotional') {
        return g.includes('devotional') || tags.includes('devotional') || tags.includes('spiritual') || tags.includes('sacred') || desc.includes('temple') || desc.includes('chant');
      } else if (activeSegment === 'nature') {
        return g.includes('nature') || tags.includes('nature') || tags.includes('forest') || tags.includes('waterfall') || desc.includes('redwood') || desc.includes('cascade');
      } else if (activeSegment === 'animals') {
        return g.includes('animal') || tags.includes('animal') || tags.includes('puppy') || tags.includes('savanna') || desc.includes('cheetah') || desc.includes('puppies');
      }
      return false;
    });
    setSegmentVideos(filtered);
  }, [activeSegment, allVideos]);

  const currentInfo = SEGMENTS[activeSegment];
  const CurrentIcon = currentInfo.icon;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '5m 00s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="min-h-screen bg-bg-dark text-white pb-24">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-border-dark bg-gradient-to-b from-bg-surface via-bg-dark to-bg-dark pt-10 pb-12 px-4 md:px-10">
        {/* Glow blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-rose/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-accent-rose mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Drama Platform • Dedicated 5-Minute Micro-Cinema</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            High-Impact Drama Shorts Across{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-amber-400 to-yellow-400">
              Love, Action & Comedy
            </span>
          </h1>

          {/* One-Line Pitch */}
          <p className="text-base md:text-lg text-text-secondary max-w-3xl leading-relaxed mb-8">
            The mobile-first streaming destination where independent creators publish 5-minute drama shorts, and viewers binge bite-sized stories engineered to be deeply emotional, intensely thrilling, or wildly hilarious.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveView('showcase')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                activeView === 'showcase'
                  ? 'bg-gradient-to-r from-accent-rose to-accent-purple text-white shadow-lg shadow-accent-rose/20'
                  : 'bg-bg-surface hover:bg-bg-card text-text-secondary border border-border-dark hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Explore 3 Segments</span>
            </button>

            <button
              onClick={() => setActiveView('pitch')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                activeView === 'pitch'
                  ? 'bg-gradient-to-r from-accent-rose to-accent-purple text-white shadow-lg shadow-accent-rose/20'
                  : 'bg-bg-surface hover:bg-bg-card text-text-secondary border border-border-dark hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Pitch Deck & Spec Brief</span>
            </button>

            <button
              onClick={() => setTab('create')}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 flex items-center gap-2 transition-all ml-auto"
            >
              <PlusCircle className="w-4 h-4 text-accent-rose" />
              <span>Creator Hub / Upload 5-Min Short</span>
            </button>
          </div>
        </div>
      </section>

      {/* VIEW: 3-SEGMENT SHOWCASE */}
      {activeView === 'showcase' && (
        <main className="max-w-6xl mx-auto px-4 md:px-10 pt-8 space-y-10">
          {/* SEGMENT TABS SWITCHER */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-2xl bg-bg-surface border border-border-dark">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-1">
              {(Object.keys(SEGMENTS) as SegmentKey[]).map((key) => {
                const seg = SEGMENTS[key];
                const Icon = seg.icon;
                const isSelected = activeSegment === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveSegment(key)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? `bg-gradient-to-r ${seg.gradient} text-white shadow-lg shadow-black/40 scale-[1.02]`
                        : 'text-text-secondary hover:text-white hover:bg-bg-card'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : seg.accentColor}`} />
                    <span>{seg.label}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${isSelected ? 'bg-black/20 text-white' : 'bg-bg-dark text-text-muted'}`}>
                      ≤ 5 min
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                if (onGenreSelect) {
                  onGenreSelect(currentInfo.genreTag);
                } else {
                  setTab('discover');
                }
              }}
              className="text-xs font-semibold text-text-secondary hover:text-white px-4 py-2 rounded-xl hover:bg-bg-card transition-colors flex items-center gap-1.5 self-end sm:self-auto"
            >
              <span>View all in Discover</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ACTIVE SEGMENT BANNER */}
          <div className={`rounded-3xl p-6 md:p-8 border ${currentInfo.bgGlow} bg-gradient-to-br from-bg-surface to-bg-card relative overflow-hidden transition-all duration-300`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold">
                  <CurrentIcon className={`w-3.5 h-3.5 ${currentInfo.accentColor}`} />
                  <span className={currentInfo.accentColor}>{currentInfo.tagline}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  Segment: {currentInfo.label}
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {currentInfo.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setTab('create')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-bold shadow-md shadow-accent-rose/10 hover:opacity-95 transition-all text-center"
                >
                  Submit a {currentInfo.label} Short
                </button>
              </div>
            </div>
          </div>

          {/* LIVE 5-MINUTE SHORTS FROM PLATFORM */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-accent-rose" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Featured 5-Minute {currentInfo.label} Shorts
                </h3>
              </div>
              <span className="text-xs text-text-muted font-medium">
                {segmentVideos.length} drama{segmentVideos.length === 1 ? '' : 's'} available
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-56 rounded-2xl bg-bg-surface animate-pulse border border-border-dark" />
                ))}
              </div>
            ) : segmentVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {segmentVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => onVideoSelect(video.id)}
                    className="group bg-bg-surface hover:bg-bg-card border border-border-dark hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col shadow-lg"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-black">
                      <img
                        src={video.thumbnail_url || video.video_url}
                        alt={video.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&h=250&q=80';
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Duration Badge (Max 5 Min guarantee) */}
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 border border-white/10 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                        <Clock className="w-3 h-3 text-accent-rose" />
                        <span>{formatDuration(video.duration_seconds)}</span>
                      </div>

                      {/* Segment Tag */}
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 border border-white/10 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                        {currentInfo.label}
                      </div>

                      {/* Hover Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                        <div className="w-12 h-12 rounded-full bg-accent-rose text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-accent-rose transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-xs text-text-secondary line-clamp-2 mt-1 leading-relaxed">
                          {video.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-text-muted border-t border-border-dark/60 pt-2.5 mt-auto">
                        <span className="font-medium hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); onCreatorSelect(video.creator_id); }}>
                          By Creator
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {(video.view_count || 0).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-accent-rose" />
                            {(video.like_count || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-bg-surface border border-border-dark text-center space-y-3">
                <p className="text-sm text-text-secondary">Be the pioneer creator to publish a 5-minute {currentInfo.label} drama short!</p>
                <button
                  onClick={() => setTab('create')}
                  className="px-4 py-2 bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-semibold rounded-xl"
                >
                  Upload First {currentInfo.label} Short
                </button>
              </div>
            )}
          </section>

          {/* CURATED 5-MINUTE STORY CONCEPTS */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Sample 5-Minute Story Pitches ({currentInfo.label})
                </h3>
              </div>
              <span className="text-xs text-text-muted">Pitch Blueprints</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {currentInfo.concepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-bg-surface border border-border-dark hover:border-white/20 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-rose px-2 py-0.5 rounded-md bg-accent-rose/10 border border-accent-rose/20">
                        {concept.tag}
                      </span>
                      <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {concept.runtime}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-white group-hover:text-accent-rose transition-colors">
                      {concept.title}
                    </h4>

                    <div className="p-2.5 rounded-xl bg-bg-dark/60 border border-white/5 text-xs text-amber-300/90 font-medium italic">
                      "{concept.hook}"
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed pt-1">
                      {concept.synopsis}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border-dark/60 flex items-center justify-between">
                    <span className="text-[11px] text-text-muted">Max Runtime: ~5 Minutes</span>
                    <button
                      onClick={() => setTab('create')}
                      className="text-xs font-semibold text-accent-rose hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Write Script</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* VIEW: PITCH DECK & SPECIFICATION */}
      {activeView === 'pitch' && (
        <main className="max-w-6xl mx-auto px-4 md:px-10 pt-8 space-y-12">
          {/* PROBLEM & SOLUTION DUAL MATRIX */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Problem */}
            <div className="p-6 md:p-8 rounded-3xl bg-bg-surface border border-red-500/20 space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-lg">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">The Problem</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Traditional TV and cinema demand steep 45–120 minute commitments that mobile viewers rarely have during quick breaks. Concurrently, emerging filmmakers and dramatic actors are drowned out by random memes and dance trends on mainstream social apps, lacking a dedicated stage for serialized micro-storytelling.
              </p>
            </div>

            {/* The Solution */}
            <div className="p-6 md:p-8 rounded-3xl bg-bg-surface border border-emerald-500/20 space-y-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                ✨
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">The OpenDrama Solution</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                A purpose-built streaming theater for 5-minute serialized short dramas, segregated into three instant emotional channels: Love, Action, and Comedy. Complete with creator studio analytics, multi-part season bundling, and a bingeable vertical feed.
              </p>
            </div>
          </section>

          {/* THE 5-MINUTE FORMAT PHILOSOPHY */}
          <section className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-bg-surface via-bg-card to-bg-surface border border-border-dark space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-rose">Pacing & Architecture</span>
              <h3 className="text-2xl font-extrabold text-white">The 5-Minute Micro-Cinema Rule</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-bg-dark/80 border border-border-dark space-y-2">
                <div className="text-accent-rose font-black text-lg">0:00 - 0:15</div>
                <h4 className="text-sm font-bold text-white">The Immediate Hook</h4>
                <p className="text-xs text-text-secondary leading-relaxed">No title sequences or slow pans. The conflict or chemistry is established in seconds.</p>
              </div>

              <div className="p-4 rounded-2xl bg-bg-dark/80 border border-border-dark space-y-2">
                <div className="text-accent-rose font-black text-lg">0:15 - 3:00</div>
                <h4 className="text-sm font-bold text-white">Escalation & Twist</h4>
                <p className="text-xs text-text-secondary leading-relaxed">Dialogue-tight, physical actions or sharp comedic escalation that deepens the stakes.</p>
              </div>

              <div className="p-4 rounded-2xl bg-bg-dark/80 border border-border-dark space-y-2">
                <div className="text-accent-rose font-black text-lg">3:00 - 4:45</div>
                <h4 className="text-sm font-bold text-white">Climax or Punchline</h4>
                <p className="text-xs text-text-secondary leading-relaxed">The high-voltage emotional confrontation, stunt payoff, or comedic reversal lands.</p>
              </div>

              <div className="p-4 rounded-2xl bg-bg-dark/80 border border-border-dark space-y-2">
                <div className="text-accent-rose font-black text-lg">4:45 - 5:00</div>
                <h4 className="text-sm font-bold text-white">The Cliffhanger</h4>
                <p className="text-xs text-text-secondary leading-relaxed">Seamless prompt to swipe down or click Next Episode to continue the series arc.</p>
              </div>
            </div>
          </section>

          {/* THREE PILLARS SPECIFICATION */}
          <section className="space-y-6">
            <h3 className="text-2xl font-extrabold text-white tracking-tight">Platform Feature Pillars</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Creator Experience */}
              <div className="p-6 rounded-3xl bg-bg-surface border border-border-dark space-y-4">
                <div className="w-10 h-10 rounded-xl bg-accent-rose/10 flex items-center justify-center text-accent-rose">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Creator Experience</h4>
                <ul className="space-y-2.5 text-xs text-text-secondary leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-rose flex-shrink-0 mt-0.5" />
                    <span>Instant sign-up and creator profile setup with bio, links, and avatar.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-rose flex-shrink-0 mt-0.5" />
                    <span>3-step upload with segment segregation (Love, Action, Comedy) and thumbnail selector.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-rose flex-shrink-0 mt-0.5" />
                    <span>Deep studio analytics: views, completion drop-offs, and follower growth.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-rose flex-shrink-0 mt-0.5" />
                    <span>Multi-part miniseries and season playlist bundling with auto-next navigation.</span>
                  </li>
                </ul>
              </div>

              {/* Viewer Experience */}
              <div className="p-6 rounded-3xl bg-bg-surface border border-border-dark space-y-4">
                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple">
                  <Play className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Viewer Experience</h4>
                <ul className="space-y-2.5 text-xs text-text-secondary leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-purple flex-shrink-0 mt-0.5" />
                    <span>Mobile-first vertical snap feed with persistent audio volume across swipes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-purple flex-shrink-0 mt-0.5" />
                    <span>Direct segment switching for Love, Action, and Comedy channels.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-purple flex-shrink-0 mt-0.5" />
                    <span>Cinematic Clean Mode to toggle distracting overlays while preserving action buttons.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-purple flex-shrink-0 mt-0.5" />
                    <span>Watchlist bookmarks, double-tap liking, comment threads, and creator following.</span>
                  </li>
                </ul>
              </div>

              {/* Platform & Moderation */}
              <div className="p-6 rounded-3xl bg-bg-surface border border-border-dark space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white">Platform & Safety</h4>
                <ul className="space-y-2.5 text-xs text-text-secondary leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Hard 5-minute per-clip upload ceiling to protect brand integrity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Automated format verification ensuring clean vertical or horizontal rendering.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Viewer reporting modal with categorized reason flags for swift triage.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>Admin moderation suite with 1-click video takedowns and review logs.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* MONETIZATION & TECHNICAL NOTES */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monetization Roadmap */}
            <div className="p-6 md:p-8 rounded-3xl bg-bg-surface border border-border-dark space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Monetization & Growth Roadmap</h3>
              </div>
              <ul className="space-y-3 text-xs text-text-secondary leading-relaxed">
                <li className="p-3 rounded-xl bg-bg-dark/60 border border-white/5">
                  <strong className="text-white block mb-0.5">Creator Tip Jars & Virtual Encore Badges:</strong>
                  Fans tip creators directly on high-stakes cliffhangers with an 85/15 revenue split.
                </li>
                <li className="p-3 rounded-xl bg-bg-dark/60 border border-white/5">
                  <strong className="text-white block mb-0.5">Sponsored Spotlight Contests:</strong>
                  Monthly cash challenges (e.g., "$5,000 Best 5-Minute Action Short") sponsored by film brands.
                </li>
                <li className="p-3 rounded-xl bg-bg-dark/60 border border-white/5">
                  <strong className="text-white block mb-0.5">6-Second Non-Intrusive Interstitials:</strong>
                  Brief brand interstitials every 4–5 continuous episode plays that preserve feed momentum.
                </li>
                <li className="p-3 rounded-xl bg-bg-dark/60 border border-white/5">
                  <strong className="text-white block mb-0.5">Cliffhanger Early Access Passes:</strong>
                  Micro-transactions ($0.99) to unlock season finale episodes 48 hours before public drop.
                </li>
              </ul>
            </div>

            {/* Technical Architecture */}
            <div className="p-6 md:p-8 rounded-3xl bg-bg-surface border border-border-dark space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-accent-purple" />
                <h3 className="text-xl font-bold text-white">Technical Architecture & Stack</h3>
              </div>
              <ul className="space-y-3 text-xs text-text-secondary leading-relaxed">
                <li className="p-3 rounded-xl bg-bg-dark/60 border border-white/5">
                  <strong className="text-white block mb-0.5">Edge CDN & Adaptive Streaming:</strong>
                  HLS/DASH chunking delivering sub-200ms time-to-first-frame across 4G/5G mobile connections.
                </li>
                <li className="p-3 rounded-xl bg-bg-dark/60 border border-white/5">
                  <strong className="text-white block mb-0.5">Zero-Latency State Management:</strong>
                  React 18 + Vite frontend with resilient IndexedDB local database fallback mode.
                </li>
                <li className="p-3 rounded-xl bg-bg-dark/60 border border-white/5">
                  <strong className="text-white block mb-0.5">AI-Assisted Kinetic Subtitles:</strong>
                  Automated audio transcription with synchronized subtitle overlays for sound-off mobile play.
                </li>
                <li className="p-3 rounded-xl bg-bg-dark/60 border border-white/5">
                  <strong className="text-white block mb-0.5">Event-Driven Telemetry:</strong>
                  Discrete milestone checkpoints (25%, 50%, 75%, 100%) tracking exact drop-off moments.
                </li>
              </ul>
            </div>
          </section>

          {/* BOTTOM CREATOR CTA */}
          <section className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-accent-rose/20 via-accent-purple/20 to-bg-card border border-accent-rose/30 text-center space-y-4">
            <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Ready to Showcase Your 5-Minute Drama?
            </h3>
            <p className="text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
              Join the growing collective of independent filmmakers and actors publishing serialized micro-stories across Love, Action, and Comedy on OpenDrama.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setTab('create')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent-rose to-accent-purple text-white text-sm font-bold shadow-xl shadow-accent-rose/20 hover:opacity-95 transition-all"
              >
                Publish Your First Drama Short
              </button>
              <button
                onClick={() => setActiveView('showcase')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition-all"
              >
                Watch 5-Minute Shorts
              </button>
            </div>
          </section>
        </main>
      )}
    </div>
  );
};
export default DramaHub;
