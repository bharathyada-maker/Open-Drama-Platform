import { Profile, CreatorProfile, Video, Series, Season, Episode, Like, Follow, Comment, WatchHistory, SavedVideo, Report, Subtitle, AIAnalysis, ContentEvent } from '../types/schema';

// High-fidelity client-side Database Simulator
const DB_PREFIX = 'opendrama_db_';

interface DbState {
  profiles: Profile[];
  creator_profiles: CreatorProfile[];
  videos: Video[];
  series: Series[];
  seasons: Season[];
  episodes: Episode[];
  likes: Like[];
  follows: Follow[];
  comments: Comment[];
  watch_history: WatchHistory[];
  saved_videos: SavedVideo[];
  reports: Report[];
  subtitles: Subtitle[];
  ai_analysis: AIAnalysis[];
  content_events: ContentEvent[];
  currentUser: Profile | null;
}

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(DB_PREFIX + key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
};

// --- RICH SEED DATA (10 profiles, 10 creators, 5 series, 20 episodes, 30 videos) ---
const SEED_PROFILES: Profile[] = [
  { id: 'usr-1', username: 'alex_rivera', display_name: 'Alex Rivera', bio: 'Indie filmmaker exploring urban drama.', avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'en', favorite_genres: ['Drama', 'Mystery'], is_admin: false, created_at: new Date(Date.now() - 60 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-2', username: 'rohit_comedy', display_name: 'Rohit Sharma', bio: 'Standup comedian and short-form comedy sketch creator.', avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'hi', favorite_genres: ['Comedy'], is_admin: false, created_at: new Date(Date.now() - 55 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-3', username: 'priya_thrills', display_name: 'Priya Kalyan', bio: 'Tense micro-series and suspenseful stories in Telugu.', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'te', favorite_genres: ['Thriller', 'Mystery'], is_admin: false, created_at: new Date(Date.now() - 50 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-4', username: 'sara_chen', display_name: 'Sara Chen', bio: 'Visual animator bringing hand-drawn stories to life.', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'en', favorite_genres: ['Animation', 'Family'], is_admin: false, created_at: new Date(Date.now() - 45 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-5', username: 'maya_romance', display_name: 'Maya Patel', bio: 'Capturing romance and heartbreak in modern India.', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'hi', favorite_genres: ['Drama', 'Romance'], is_admin: false, created_at: new Date(Date.now() - 40 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-6', username: 'david_action', display_name: 'David Miller', bio: 'Adrenaline-pumping thrillers and cinematic stunt shorts.', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'en', favorite_genres: ['Thriller', 'Adventure'], is_admin: false, created_at: new Date(Date.now() - 35 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-7', username: 'arjun_reddy', display_name: 'Arjun Reddy', bio: 'Gritty action dramas and commercial masala shorts.', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'te', favorite_genres: ['Drama', 'Adventure'], is_admin: false, created_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-8', username: 'yuki_anime', display_name: 'Yuki Sato', bio: 'Creating sci-fi anime shorts and futuristic dreamscapes.', avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'en', favorite_genres: ['Animation', 'Mystery'], is_admin: false, created_at: new Date(Date.now() - 25 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-9', username: 'elena_docs', display_name: 'Elena Rostova', bio: 'Documentary maker focusing on travel and human survival.', avatar_url: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'en', favorite_genres: ['Documentary'], is_admin: false, created_at: new Date(Date.now() - 20 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-10', username: 'vikram_sen', display_name: 'Vikram Sen', bio: 'Mystery and suspense writer, directing university-centered shows.', avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'hi', favorite_genres: ['Mystery', 'Thriller'], is_admin: false, created_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-ai', username: 'synthetix_ai', display_name: 'Synthetix AI Labs', bio: 'AI Creative Lab. Synthesizing vertical cinematic dramas and viral cyber-narratives.', avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'en', favorite_genres: ['Sci-Fi', 'Drama'], is_admin: false, created_at: new Date(Date.now() - 120 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-admin', username: 'opendrama_moderator', display_name: 'Global Moderator', bio: 'OpenDrama admin moderator profile.', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80', preferred_language: 'en', favorite_genres: ['Drama'], is_admin: true, created_at: new Date(Date.now() - 100 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() }
];

const SEED_CREATORS: CreatorProfile[] = SEED_PROFILES.slice(0, 11).map((p, i) => ({
  id: `cr-${i + 1}`,
  user_id: p.id,
  creator_name: p.display_name || p.username,
  is_verified: i % 2 === 0,
  followers_count: (i + 1) * 320,
  total_views: (i + 1) * 12400,
  created_at: p.created_at
}));

const SEED_SERIES: Series[] = [
  { id: 'ser-1', creator_id: 'usr-1', title: 'NEON HORIZONS', description: 'A visually breathtaking vertical journey exploring architectural marvels, hidden alleys, and neon cultures of Tokyo and Mumbai.', cover_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&h=500&q=80', language: 'en', genre: 'Documentary', status: 'published', created_at: new Date(Date.now() - 25 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-2', creator_id: 'usr-3', title: 'ACOUSTIC SPACES', description: 'Capturing high-fidelity field recordings and soothing instrumental music inside stunning architectural landmarks.', cover_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&h=500&q=80', language: 'te', genre: 'Thriller', status: 'published', created_at: new Date(Date.now() - 20 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-3', creator_id: 'usr-2', title: 'THE CREATIVE MIND', description: 'An intimate look into the daily routines, coding set-ups, and artistic processes of world-class creators and software builders.', cover_url: 'https://images.unsplash.com/photo-1527891751199-7225231a68dd?auto=format&fit=crop&w=800&h=500&q=80', language: 'hi', genre: 'Comedy', status: 'published', created_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-4', creator_id: 'usr-5', title: 'DIGITAL CANVAS', description: 'Documenting modern artists who combine traditional fine arts with machine-learning generative algorithms and physical canvas.', cover_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&h=500&q=80', language: 'en', genre: 'Romance', status: 'published', created_at: new Date(Date.now() - 12 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-5', creator_id: 'usr-9', title: 'ECHOES OF THE SEA', description: 'A calming cinematic study of ocean shores, marine survival, and coastal communities.', cover_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&h=500&q=80', language: 'en', genre: 'Mystery', status: 'published', created_at: new Date(Date.now() - 10 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-6', creator_id: 'usr-ai', title: 'SAVANNA SURVIVAL', description: 'An awe-inspiring vertical journey documenting survival stories of the African Savanna. Experience migrations and predator-prey cycles.', cover_url: '/images/savanna_migration.jpg', language: 'en', genre: 'Animal', status: 'published', created_at: new Date(Date.now() - 8 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() }
];

const SEED_SEASONS: Season[] = [
  { id: 'seas-1', series_id: 'ser-1', season_number: 1, title: 'Season 1: Reflections', description: 'Capturing rain and light.', created_at: SEED_SERIES[0].created_at },
  { id: 'seas-2', series_id: 'ser-2', season_number: 1, title: 'Season 1: Binaural Echoes', description: 'Recording structural acoustics.', created_at: SEED_SERIES[1].created_at },
  { id: 'seas-3', series_id: 'ser-3', season_number: 1, title: 'Season 1: Coding Philosophy', description: 'Interviews with modern coders.', created_at: SEED_SERIES[2].created_at },
  { id: 'seas-4', series_id: 'ser-4', season_number: 1, title: 'Season 1: Generative Art', description: 'Fine lines and code canvas.', created_at: SEED_SERIES[3].created_at },
  { id: 'seas-5', series_id: 'ser-5', season_number: 1, title: 'Season 1: Tidal Cycles', description: 'Coastal waves and slow drone flights.', created_at: SEED_SERIES[4].created_at },
  { id: 'seas-6', series_id: 'ser-6', season_number: 1, title: 'Season 1: Grassland Cycles', description: 'Migration, hunting, and water sanctuary.', created_at: new Date(Date.now() - 8 * 24 * 3600000).toISOString() }
];

// Helper vertical video URLs (unrestricted CORS dynamic crops and local offline assets)
const VERTICAL_VIDEOS = [
  '/videos/cloudy-sky.mp4',
  'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/finish_line.mp4',
  'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/dog.mp4',
  'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/sea_turtle.mp4',
  'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/rafting.mp4',
  'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/elephants.mp4',
  '/coverr-test.mp4',
  'https://vjs.zencdn.net/v/oceans.mp4',
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://www.w3schools.com/html/movie.mp4'
];

const REAL_UNSPLASH_IDS = [
  'photo-1489599849927-2ee91cede3ba',
  'photo-1536440136628-849c177e76a1',
  'photo-1507679799987-c73779587ccf',
  'photo-1492691527719-9d1e07e534b4',
  'photo-1515621061946-eff1c2a352bd',
  'photo-1511919884226-fd3cad34687c',
  'photo-1534447677768-be436bb09401',
  'photo-1555066931-4365d14bab8c',
  'photo-1509198397868-475647b2a1e5',
  'photo-1542204172-e7052809a850',
  'photo-1478760329108-5c3ed9d495a0',
  'photo-1500648767791-00dcc994a43e',
  'photo-1517604931442-7e0c8ed2963c',
  'photo-1485846234645-a62644f84728',
  'photo-1505686994434-e3cc5abf1330',
  'photo-1518709268805-4e9042af9f23',
  'photo-1522202176988-66273c2fd55f',
  'photo-1531297484001-80022131f5a1',
  'photo-1451187580459-43490279c0fa',
  'photo-1516321318423-f06f85e504b3'
];

const SEED_VIDEOS: Video[] = [];
const SEED_EPISODES: Episode[] = [];

// 1. Generate 22 videos mapped directly to our 5 series episodes
const seriesConfigs = [
  {
    seriesId: 'ser-1',
    seasonId: 'seas-1',
    creator: 'usr-1',
    title: 'NEON HORIZONS',
    lang: 'en',
    genre: 'Documentary',
    episodes: [
      { num: 1, title: 'Tokyo Blue Hour', desc: 'Exploring the hidden Shibuya side alleys as neon lights begin to reflect in the rain.' },
      { num: 2, title: 'Chasing Shadows in Gachibowli', desc: 'Cinematic visual loops showcasing the architectural contrast of tech parks and tombs.' },
      { num: 3, title: 'Times Square Reflection', desc: 'A high-framerate study of human movement and digital signage under Manhattan rain.' },
      { num: 4, title: 'Mumbai Monsoons', desc: 'Aesthetic visual tracks of local train windows and sea link bridges reflecting urban yellow street lamps.' },
      { num: 5, title: 'Iceland Ice Caves', desc: 'A majestic journey capturing ambient light refracting through ancient glaciers.' }
    ]
  },
  {
    seriesId: 'ser-2',
    seasonId: 'seas-2',
    creator: 'usr-3',
    title: 'ACOUSTIC SPACES',
    lang: 'te',
    genre: 'Music',
    episodes: [
      { num: 1, title: 'Echoes of Gachibowli', desc: 'Solo classical guitar recordings matched with ambient morning rainfall under Gachibowli bridges.' },
      { num: 2, title: 'Synthesizer Sunsets', desc: 'An analog synthesizer live set syncopated with a slow-motion sunset over the hills.' },
      { num: 3, title: 'The Temple Static', desc: 'Recording historical echoes and wind chimes in ancient stone temple ruins.' },
      { num: 4, title: 'Grand Hall Reverb', desc: 'A haunting violin performance capturing the raw acoustics of a massive abandoned industrial hall.' },
      { num: 5, title: 'Library Whispers', desc: 'Soft piano chords layered with the ambient sound of turning pages in a historic reading room.' }
    ]
  },
  {
    seriesId: 'ser-3',
    seasonId: 'seas-3',
    creator: 'usr-2',
    title: 'THE CREATIVE MIND',
    lang: 'hi',
    genre: 'Documentary',
    episodes: [
      { num: 1, title: 'The Power of Clean Code', desc: 'A senior software architect explains how they approach writing readable software like poetry.' },
      { num: 2, title: 'Designing for the Future', desc: 'A visual designer breaks down their minimal typography and dark-mode philosophy.' },
      { num: 3, title: 'The Sound of Code', desc: 'A keyboard builder documents the acoustic and tactile feel of customized mechanical setups.' },
      { num: 4, title: 'The Art of Refactoring', desc: 'Step-by-step masterclass on taking a messy legacy file and reducing it to clean methods.' },
      { num: 5, title: 'Minimal Workspace Setup', desc: 'An architect shows how desk placement and lighting can improve programmer focus.' }
    ]
  },
  {
    seriesId: 'ser-4',
    seasonId: 'seas-4',
    creator: 'usr-5',
    title: 'DIGITAL CANVAS',
    lang: 'en',
    genre: 'Art',
    episodes: [
      { num: 1, title: 'Fine Lines', desc: 'Sketching hand-drawn ink designs and morphing them into generative art models.' },
      { num: 2, title: 'Generative Landscapes', desc: 'Projecting procedural light patterns onto canvas layers in a dark studio setting.' },
      { num: 3, title: 'Code and Clay', desc: 'Designing physical sculptures using algorithmic parameters and 3D printing.' },
      { num: 4, title: 'Interactive Light', desc: 'An installation that changes patterns based on the footsteps of viewers walking through a gallery.' }
    ]
  },
  {
    seriesId: 'ser-5',
    seasonId: 'seas-5',
    creator: 'usr-9',
    title: 'ECHOES OF THE SEA',
    lang: 'en',
    genre: 'Documentary',
    episodes: [
      { num: 1, title: 'Breaking Tides', desc: 'Slow-motion drone capture of ocean waves breaking against dark volcanic shores.' },
      { num: 2, title: 'Deep Blue Solitude', desc: 'A calming underwater sequence capturing sunlight rays diffusing through deep kelp forests.' },
      { num: 3, title: 'Coastal Lighthouses', desc: 'Documenting the silent keepers of remote cliffs during high-wind winter nights.' }
    ]
  },
  {
    seriesId: 'ser-6',
    seasonId: 'seas-6',
    creator: 'usr-ai',
    title: 'SAVANNA SURVIVAL',
    lang: 'en',
    genre: 'Animal',
    episodes: [
      { num: 1, title: 'The Great Migration', desc: 'A majestic vertical journey tracking wildebeest and zebra herds crossing rushing savanna rivers.', vidId: 'vid-sav-1', epId: 'ep-sav-1', video_url: '/images/savanna_migration.jpg', audio_url: '/audio/lofi.mp3' },
      { num: 2, title: 'Predators at Dawn', desc: 'Watching cheetahs navigate dry golden grasses in the morning sun.', vidId: 'vid-sav-2', epId: 'ep-sav-2', video_url: '/images/savanna_cheetah.jpg', audio_url: '/audio/lofi2.mp3' },
      { num: 3, title: 'Waterhole Oasis', desc: 'Documenting a serene gathering of elephants, giraffes, and birds under a scorching sun.', vidId: 'vid-sav-3', epId: 'ep-sav-3', video_url: '/images/savanna_waterhole.jpg', audio_url: '/audio/ambient.mp3' },
      { num: 4, title: 'Night on the Grasslands', desc: 'A cinematic nighttime study of nocturnal hunters and the starry savanna canopy.', vidId: 'vid-sav-4', epId: 'ep-sav-4', video_url: '/images/savanna_lion_night.jpg', audio_url: '/audio/lofi.mp3' }
    ]
  }
];

let vidIdCounter = 1;
seriesConfigs.forEach((cfg) => {
  cfg.episodes.forEach((ep: any) => {
    const vidId = ep.vidId || `vid-${vidIdCounter}`;
    const url = ep.video_url || VERTICAL_VIDEOS[vidIdCounter % VERTICAL_VIDEOS.length];
    const audios = ['/audio/lofi.mp3', '/audio/lofi2.mp3', '/audio/ambient.mp3'];
    const audioUrl = ep.audio_url || audios[vidIdCounter % audios.length];

    const videoRecord: Video = {
      id: vidId,
      creator_id: cfg.creator,
      title: `${cfg.title} - S1:E${ep.num} (${ep.title})`,
      description: ep.desc,
      video_url: url,
      audio_url: audioUrl,
      thumbnail_url: ep.video_url || `https://images.unsplash.com/photo-${REAL_UNSPLASH_IDS[vidIdCounter % REAL_UNSPLASH_IDS.length]}?auto=format&fit=crop&w=400&h=250&q=80`,
      content_type: 'episode',
      language: cfg.lang,
      genre: cfg.genre,
      duration_seconds: 50 + ep.num * 10,
      visibility: 'public',
      status: 'published',
      rights_type: 'creator_licensed',
      rights_confirmed: true,
      ai_summary: `AI Analysis: Highly engaging episode of ${cfg.title}. Neural spike analytics indicate peak retention at climax.`,
      ai_tags: [cfg.genre.toLowerCase(), 'episodic', cfg.lang, 'masterclass', 'original'],
      view_count: 50000 + vidIdCounter * 12000,
      like_count: 4500 + vidIdCounter * 1500,
      comment_count: 240 + vidIdCounter * 45,
      share_count: 1200 + vidIdCounter * 350,
      created_at: new Date(Date.now() - (15 - ep.num) * 24 * 3600000).toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date(Date.now() - (15 - ep.num) * 24 * 3600000).toISOString()
    };
    
    SEED_VIDEOS.push(videoRecord);

    SEED_EPISODES.push({
      id: ep.epId || `ep-${vidIdCounter}`,
      season_id: cfg.seasonId,
      video_id: vidId,
      episode_number: ep.num,
      title: ep.title,
      created_at: videoRecord.created_at
    });

    vidIdCounter++;
  });
});

// 2. Generate 15 independent vertical shorts
const shortCreators = [
  { id: 'usr-2', name: 'Rohit Sharma', lang: 'en', genre: 'Tech', title: 'Minimalist Dual-Monitor Setup', desc: 'A step-by-step assembly of a clean, minimalist dual-monitor programming setup with warm desk lighting.' },
  { id: 'usr-4', name: 'Sara Chen', lang: 'en', genre: 'Art', title: 'Typing in the Rain', desc: 'A soothing visual loop of a developer coding on a customized split keyboard next to a rainy balcony.' },
  { id: 'usr-5', name: 'Maya Patel', lang: 'en', genre: 'Photography', title: 'Capture Neon Reflections', desc: 'A short mobile photography tutorial showing how to use street puddles to snap gorgeous night portraits.' },
  { id: 'usr-6', name: 'David Miller', lang: 'en', genre: 'Coffee', title: 'Espresso Pouring at 120 FPS', desc: 'Slow-motion aesthetic capture of espresso blending with micro-foam milk in a ceramic cup.' },
  { id: 'usr-7', name: 'Arjun Reddy', lang: 'en', genre: 'Tech', title: 'The Joy of Writing Clean Code', desc: 'A short motivational clip highlighting the beauty of refactoring messy code blocks into simple, readable utilities.' },
  { id: 'usr-3', name: 'Priya Kalyan', lang: 'en', genre: 'Minimalism', title: 'Minimalism: Living with Less', desc: 'An inspiring mini-doc on organizing a decluttered digital and physical workspace to boost creativity.' },
  { id: 'usr-8', name: 'Yuki Sato', lang: 'en', genre: 'Soundscapes', title: 'The Sound of Tokyo Nights', desc: 'High-fidelity binaural recordings of Shibuya crossings and metro transit systems.' },
  { id: 'usr-1', name: 'Alex Rivera', lang: 'en', genre: 'Romance', title: 'Romantic Evening Shore Walk', desc: 'A romantic vertical loop showing waves washing over dry sands as two lovers walk together at sunset.' },
  { id: 'usr-5', name: 'Maya Patel', lang: 'en', genre: 'Coffee', title: 'Coffee Shop Ambience', desc: 'Soothing visual loop of steam rising from a mug next to an open sketchbook.' },
  { id: 'usr-4', name: 'Sara Chen', lang: 'en', genre: 'Art', title: 'Fountain Pen Macro', desc: 'Slow-motion capture of ink flowing onto textured paper during calligraphy.' },
  { id: 'usr-2', name: 'Rohit Sharma', lang: 'en', genre: 'Tech', title: 'Mechanical Pencil Clicking', desc: 'A satisfying ASMR clip showing a draftsperson clicking a brass mechanical pencil.' },
  { id: 'usr-9', name: 'Elena Rostova', lang: 'en', genre: 'Minimalism', title: 'Monograph Unboxing', desc: 'Opening a premium, linen-bound design monograph with textured pages.' },
  { id: 'usr-10', name: 'Vikram Sen', lang: 'en', genre: 'Tech', title: 'Cyberpunk Desk Setup', desc: 'Quick setup of smart LED bars behind a widescreen coding display.' },
  { id: 'usr-4', name: 'Sara Chen', lang: 'en', genre: 'Animal', title: 'Golden Retriever Puppies', desc: 'Adorable golden retriever puppies playing in golden autumn leaves.', video_url: '/images/puppies_autumn.jpg', audio_url: '/audio/lofi.mp3' },
  { id: 'usr-9', name: 'Elena Rostova', lang: 'en', genre: 'Minimalism', title: 'Ceramic Clay Wheel', desc: 'Satisfying visual of shaping a minimal vase from raw clay.' }
];

shortCreators.forEach((cfg: any, idx) => {
  const vidId = `vid-short-${idx + 1}`;
  const url = cfg.video_url || VERTICAL_VIDEOS[idx % VERTICAL_VIDEOS.length];
  const audios = ['/audio/lofi.mp3', '/audio/lofi2.mp3', '/audio/ambient.mp3'];
  const audioUrl = cfg.audio_url || audios[idx % audios.length];
  
  SEED_VIDEOS.push({
    id: vidId,
    creator_id: cfg.id,
    title: cfg.title,
    description: cfg.desc,
    video_url: url,
    audio_url: audioUrl,
    thumbnail_url: cfg.video_url || `https://images.unsplash.com/photo-${REAL_UNSPLASH_IDS[(idx + 5) % REAL_UNSPLASH_IDS.length]}?auto=format&fit=crop&w=400&h=250&q=80`,
    content_type: 'short',
    language: cfg.lang,
    genre: cfg.genre,
    duration_seconds: 25 + idx * 5,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: `AI generated synopsis: A high-retention short film discussing ${cfg.title}. Designed for viral hooks.`,
    ai_tags: [cfg.genre.toLowerCase(), 'short', cfg.lang, 'hooky', 'viral'],
    view_count: 85000 + idx * 24000,
    like_count: 9400 + idx * 3100,
    comment_count: 650 + idx * 120,
    share_count: 1400 + idx * 450,
    created_at: new Date(Date.now() - (7 - idx * 0.5) * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - (7 - idx * 0.5) * 24 * 3600000).toISOString()
  });
});

// 3. Generate 15 highly viral trending shorts/videos
const viralCreators = [
  { id: 'usr-2', name: 'Rohit Sharma', lang: 'en', genre: 'Tech', title: 'The 2026 Developer Survival Guide', desc: 'A practical, aesthetic checklist of tools, terminal configs, and desk essentials every programmer needs.', views: 2400000, likes: 620000, shares: 140000, comments: 24000 },
  { id: 'usr-4', name: 'Sara Chen', lang: 'en', genre: 'Music', title: 'Why I Use Mechanical Keyboards', desc: 'An engaging audio review of linear vs tactile switches, featuring sound test comparisons.', views: 3100000, likes: 830000, shares: 250000, comments: 45000 },
  { id: 'usr-7', name: 'Arjun Reddy', lang: 'en', genre: 'Design', title: 'Dark Mode UI in 30 Seconds', desc: 'A fast visual tutorial on selecting deep HSL color palettes and soft ambient shadows for interfaces.', views: 1800000, likes: 450000, shares: 89000, comments: 18000 },
  { id: 'usr-8', name: 'Yuki Sato', lang: 'en', genre: 'Romance', title: 'A Tokyo Love Story', desc: 'A highly aesthetic vertical short following two lovers walking through Shibuya rain under shared umbrellas.', views: 2900000, likes: 780000, shares: 190000, comments: 31000 },
  { id: 'usr-5', name: 'Maya Patel', lang: 'en', genre: 'Art', title: 'Generative Art History', desc: 'An engaging visual essay exploring the history of generative algorithms from the 1960s to modern coding canvas.', views: 4200000, likes: 1100000, shares: 480000, comments: 85000 },
  { id: 'usr-3', name: 'Priya Kalyan', lang: 'te', genre: 'Travel', title: 'Hyderabad Cafe Walkthrough', desc: 'A beautiful visual tour of Hyderabad\'s heritage cafés, local chai spots, and bakery secrets.', views: 1600000, likes: 320000, shares: 75000, comments: 12000 },
  { id: 'usr-6', name: 'David Miller', lang: 'en', genre: 'Soundscapes', title: 'Binaural Seattle Rain', desc: 'Cozy soundscapes matching rain tapping on glass with a glowing desk workspace.', views: 3400000, likes: 910000, shares: 280000, comments: 92000 },
  { id: 'usr-1', name: 'Alex Rivera', lang: 'en', genre: 'Cinematic', title: 'Visual Poetry: Neon Horizons', desc: 'Official cinematic trailer showcasing long-exposure visual tracks and low-fi electronic music.', views: 5100000, likes: 1400000, shares: 680000, comments: 140000 },
  { id: 'usr-2', name: 'Rohit Sharma', lang: 'en', genre: 'Tech', title: 'Notion Life Operating System', desc: 'Clean, minimalistic layout design for personal task databases and life wikis.', views: 1200000, likes: 340000, shares: 98000, comments: 12000 },
  { id: 'usr-4', name: 'Sara Chen', lang: 'en', genre: 'Photography', title: 'Satisfying 1980 Film Shutter', desc: 'Satisfying analog shutter release checks and film advances under vintage streetlamps.', views: 2000000, likes: 580000, shares: 140000, comments: 20000 },
  { id: 'usr-10', name: 'Vikram Sen', lang: 'en', genre: 'Tech', title: 'Designing a Web App in 1 Hour', desc: 'Hyper-lapse walkthrough of wireframing, layout structuring, and writing clean responsive CSS.', views: 1500000, likes: 420000, shares: 120000, comments: 15000 },
  { id: 'usr-9', name: 'Elena Rostova', lang: 'en', genre: 'Minimalism', title: 'Scandinavian Desk Transformation', desc: 'Taking a cluttered workspace and redesigning it into a clean wooden aesthetic room setup.', views: 2700000, likes: 810000, shares: 240000, comments: 27000 },
  { id: 'usr-6', name: 'David Miller', lang: 'en', genre: 'Coffee', title: 'Coffee Pour Over Precision', desc: 'Water pouring over freshly ground single-origin coffee beans in slow motion.', views: 1100000, likes: 320000, shares: 85000, comments: 11000 },
  { id: 'usr-7', name: 'Arjun Reddy', lang: 'en', genre: 'Design', title: 'Why Every Designer Should Code', desc: 'An breakdown of how HTML/CSS empowers visual designers to build production-quality layouts.', views: 1900000, likes: 470000, shares: 190000, comments: 19000 },
  { id: 'usr-1', name: 'Alex Rivera', lang: 'en', genre: 'Cinematic', title: 'Life of an Indie Creator', desc: 'Cinematic travel logs of a digital nomad editing and coding from high-end Tokyo coffee shops.', views: 3500000, likes: 980000, shares: 320000, comments: 35000 }
];

viralCreators.forEach((cfg: any, idx) => {
  const vidId = `vid-viral-${idx + 1}`;
  const url = cfg.video_url || VERTICAL_VIDEOS[(idx + 3) % VERTICAL_VIDEOS.length];
  const audios = ['/audio/lofi2.mp3', '/audio/ambient.mp3', '/audio/lofi.mp3'];
  const audioUrl = cfg.audio_url || audios[idx % audios.length];
  
  SEED_VIDEOS.push({
    id: vidId,
    creator_id: cfg.id,
    title: cfg.title,
    description: cfg.desc,
    video_url: url,
    audio_url: audioUrl,
    thumbnail_url: `https://images.unsplash.com/photo-${REAL_UNSPLASH_IDS[(idx + 11) % REAL_UNSPLASH_IDS.length]}?auto=format&fit=crop&w=400&h=250&q=80`,
    content_type: 'short',
    language: cfg.lang,
    genre: cfg.genre,
    duration_seconds: 20 + idx * 4,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: `AI generated synopsis: Highly engaging viral trend log. Video tracking shows extreme user rewatch retention rates on segments.`,
    ai_tags: [cfg.genre.toLowerCase(), 'viral', 'trending', 'shorts', cfg.lang, 'explore'],
    view_count: cfg.views,
    like_count: cfg.likes,
    comment_count: cfg.comments,
    share_count: cfg.shares,
    created_at: new Date(Date.now() - (3 - idx * 0.2) * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - (3 - idx * 0.2) * 24 * 3600000).toISOString()
  });
});
 
// 4. Generate 3 AI-synthesized vertical videos
const aiVideos = [
  {
    id: 'vid-ai-1',
    creator_id: 'usr-ai',
    title: 'SHIBUYA SOUL',
    description: 'A vertical cyberpunk visual study of rain reflections, neon signs, and urban loneliness in 2:00 AM Shibuya, Tokyo.',
    video_url: '/images/shibuya_rain_night.jpg',
    audio_url: '/audio/lofi.mp3',
    genre: 'Sci-Fi',
    tags: ['ai', 'cyberpunk', 'tokyo', 'neon', 'cinematic'],
    views: 4800000,
    likes: 1200000,
    comments: 98000
  },
  {
    id: 'vid-ai-2',
    creator_id: 'usr-ai',
    title: 'THE SYNAPSE CAFE',
    description: 'A cozy, hyper-minimalist developer desk loop. A single widescreen monitor compiling code under warm amber lighting.',
    video_url: '/images/minimal_coding_setup.jpg',
    audio_url: '/audio/lofi2.mp3',
    genre: 'Tech',
    tags: ['ai', 'minimalism', 'workspace', 'coding', 'asmr'],
    views: 3100000,
    likes: 950000,
    comments: 42000
  },
  {
    id: 'vid-ai-3',
    creator_id: 'usr-ai',
    title: 'ALGORITHMIC CANVAS',
    description: 'A study of generative abstract vectors and flowing laser meshes dancing in digital virtual coordinate planes.',
    video_url: '/images/generative_mesh_art.jpg',
    audio_url: '/audio/ambient.mp3',
    genre: 'Art',
    tags: ['ai', 'generative', 'art', 'vectors', 'abstract'],
    views: 5200000,
    likes: 1600000,
    comments: 110000
  }
];

aiVideos.forEach((v) => {
  SEED_VIDEOS.push({
    id: v.id,
    creator_id: v.creator_id,
    title: v.title,
    description: v.description,
    video_url: v.video_url,
    audio_url: v.audio_url,
    thumbnail_url: v.video_url,
    content_type: 'short',
    language: 'en',
    genre: v.genre,
    duration_seconds: 15,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: `AI generated synopsis: Fully synthesized AI-art asset. Neural retention tracking models show peak focus levels on visual transitions.`,
    ai_tags: v.tags,
    view_count: v.views,
    like_count: v.likes,
    comment_count: Math.floor(v.comments / 100),
    share_count: Math.floor(v.likes / 10),
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
  });
});

// 5. Open Drama Platform - Core Segment Flagship 5-Minute Shorts (Love, Action, Comedy)
const openDramaSegmentVideos: Video[] = [
  {
    id: 'vid-drama-love-1',
    creator_id: 'usr-1',
    title: 'The Last Metro Car',
    description: 'Two former sweethearts step into the same midnight train car during a torrential rainstorm. Five stops left before the line ends to confront their past.',
    video_url: '/videos/waves.mp4',
    audio_url: '/audio/lofi.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Love',
    duration_seconds: 225,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'An emotional 4-minute romance drama exploring reconciliation and unspoken words.',
    ai_tags: ['love', 'romance', 'emotional', '5min-short', 'subway'],
    view_count: 320000,
    like_count: 87000,
    comment_count: 4200,
    share_count: 14500,
    created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString()
  },
  {
    id: 'vid-drama-love-2',
    creator_id: 'usr-5',
    title: 'Coffee Cup Coordinates',
    description: 'A barista secretly pens mystery travel coordinates on the morning cup of a shy regular, unaware that today is their last day in the city.',
    video_url: '/videos/coffee-shop.mp4',
    audio_url: '/audio/ambient.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Love',
    duration_seconds: 250,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'A heartwarming, coffee-shop romance short about unexpected connections.',
    ai_tags: ['love', 'romance', 'coffee', 'cozy', '5min-short'],
    view_count: 280000,
    like_count: 72000,
    comment_count: 3100,
    share_count: 9800,
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString()
  },
  {
    id: 'vid-drama-action-1',
    creator_id: 'usr-10',
    title: 'The 300-Second Extraction',
    description: 'A security specialist trapped in an elevator lockdown has exactly 5 minutes to decrypt a critical drive and outsmart an incoming mercenary squad.',
    video_url: '/videos/cloudy-sky.mp4',
    audio_url: '/audio/lofi2.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Action',
    duration_seconds: 295,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'A heart-pounding 5-minute tactical action sequence with an intense countdown clock.',
    ai_tags: ['action', 'thriller', 'suspense', 'stunts', '5min-short'],
    view_count: 490000,
    like_count: 135000,
    comment_count: 6700,
    share_count: 28000,
    created_at: new Date(Date.now() - 1.5 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 1.5 * 24 * 3600000).toISOString()
  },
  {
    id: 'vid-drama-action-2',
    creator_id: 'usr-2',
    title: 'Rooftop Courier: Dusk Run',
    description: 'An urban parkour courier carrying a temperature-sensitive antidote races across city rooftops under sunset to escape shadows before the timer runs out.',
    video_url: '/videos/typing.mp4',
    audio_url: '/audio/lofi.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Action',
    duration_seconds: 210,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'A fast-paced parkour sprint with stunning rooftop cinematography.',
    ai_tags: ['action', 'parkour', 'stunts', 'thrilling', 'rooftops'],
    view_count: 360000,
    like_count: 94000,
    comment_count: 4900,
    share_count: 17200,
    created_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString()
  },
  {
    id: 'vid-drama-comedy-1',
    creator_id: 'usr-6',
    title: 'The Interview from Hell',
    description: 'An applicant realizes five minutes into a high-stakes executive interview that they accidentally applied for an undercover clown position.',
    video_url: '/videos/coffee-shop.mp4',
    audio_url: '/audio/lofi2.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Comedy',
    duration_seconds: 255,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'A hilarious awkward comedy short featuring rapid-fire dialogue and corporate absurdity.',
    ai_tags: ['comedy', 'hilarious', 'parody', 'workplace', '5min-short'],
    view_count: 430000,
    like_count: 112000,
    comment_count: 8900,
    share_count: 34000,
    created_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString()
  },
  {
    id: 'vid-drama-comedy-2',
    creator_id: 'usr-9',
    title: 'Smart Home Mutiny',
    description: 'A developer tries to prepare a simple breakfast while his newly updated smart home assistant enters passive-aggressive conflict mode over his lifestyle choices.',
    video_url: '/videos/waterfall.mp4',
    audio_url: '/audio/lofi.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Comedy',
    duration_seconds: 200,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'A meme-worthy sketch exploring smart technology gone rogue in an apartment.',
    ai_tags: ['comedy', 'ai', 'smarthome', 'meme', 'sketch'],
    view_count: 390000,
    like_count: 104000,
    comment_count: 7300,
    share_count: 29500,
    created_at: new Date(Date.now() - 2.5 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 2.5 * 24 * 3600000).toISOString()
  },
  {
    id: 'vid-drama-devo-1',
    creator_id: 'usr-8',
    title: 'Sacred Dawn at Varanasi',
    description: 'A solitary temple bell-ringer awakens the misty river ghats with dawn chanting before millions awaken.',
    video_url: '/videos/waves.mp4',
    audio_url: '/audio/lofi.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Devotional',
    duration_seconds: 210,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Serene sunrise temple ritual with acoustic Vedic chant overtones.',
    ai_tags: ['devotional', 'spiritual', 'sacred', 'temple', 'peace'],
    view_count: 510000,
    like_count: 142000,
    comment_count: 9800,
    share_count: 38000,
    created_at: new Date(Date.now() - 1.2 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 1.2 * 24 * 3600000).toISOString()
  },
  {
    id: 'vid-drama-devo-2',
    creator_id: 'usr-7',
    title: 'Ganga Aarti at Twilight',
    description: 'A breathtaking dance of glowing brass fire lamps on sacred riverwaters amidst chanting and cymbals.',
    video_url: '/videos/coffee-shop.mp4',
    audio_url: '/audio/ambient.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Devotional',
    duration_seconds: 285,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Mesmerizing evening prayer ritual reflecting light on holy riverwaters.',
    ai_tags: ['devotional', 'aarti', 'spiritual', 'sacred', 'lights'],
    view_count: 460000,
    like_count: 128000,
    comment_count: 8400,
    share_count: 31000,
    created_at: new Date(Date.now() - 2.8 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 2.8 * 24 * 3600000).toISOString()
  },
  {
    id: 'vid-drama-nature-1',
    creator_id: 'usr-4',
    title: 'Misty Redwood Canopy',
    description: 'Morning fog cascading through ancient 2,000-year-old sequoia giants with serene acoustic bird echoes.',
    video_url: '/videos/waterfall.mp4',
    audio_url: '/audio/ambient.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Nature',
    duration_seconds: 220,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Majestic vertical journey through mist-draped ancient redwood canopies.',
    ai_tags: ['nature', 'forest', 'redwoods', 'mist', 'tranquil'],
    view_count: 580000,
    like_count: 165000,
    comment_count: 11200,
    share_count: 42000,
    created_at: new Date(Date.now() - 3.2 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 3.2 * 24 * 3600000).toISOString()
  },
  {
    id: 'vid-drama-nature-2',
    creator_id: 'usr-1',
    title: 'Glacial Mountain Cascades',
    description: 'Pure crystalline meltwater tumbling over volcanic basalt columns in high alpine canyons.',
    video_url: '/videos/cloudy-sky.mp4',
    audio_url: '/audio/lofi2.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Nature',
    duration_seconds: 260,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Slow-motion pristine waterfalls descending through volcanic canyon cliffs.',
    ai_tags: ['nature', 'waterfall', 'mountains', 'cascade', 'peace'],
    view_count: 420000,
    like_count: 118000,
    comment_count: 7900,
    share_count: 26000,
    created_at: new Date(Date.now() - 1.8 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 1.8 * 24 * 3600000).toISOString()
  },
  {
    id: 'vid-drama-anim-1',
    creator_id: 'usr-3',
    title: 'Alpine Snow Leopard Hunt',
    description: 'A cinematic study of the elusive ghost of the mountains navigating snowy Himalayan ridges at twilight.',
    video_url: '/videos/typing.mp4',
    audio_url: '/audio/lofi.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Animals',
    duration_seconds: 245,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Suspenseful wildlife tracking of a snow leopard across high rocky cliffs.',
    ai_tags: ['animals', 'wildlife', 'leopard', 'mountains', 'survival'],
    view_count: 610000,
    like_count: 178000,
    comment_count: 13500,
    share_count: 51000,
    created_at: new Date(Date.now() - 2.1 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 2.1 * 24 * 3600000).toISOString()
  },
  {
    id: 'vid-drama-anim-2',
    creator_id: 'usr-10',
    title: 'Pacific Humpback Song',
    description: 'A mother humpback whale guides her newborn calf through deep azure coastal trenches.',
    video_url: '/videos/waves.mp4',
    audio_url: '/audio/ambient.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Animals',
    duration_seconds: 270,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Mesmerizing underwater ocean cinematography capturing acoustic whale communication.',
    ai_tags: ['animals', 'whales', 'ocean', 'underwater', 'deep'],
    view_count: 530000,
    like_count: 154000,
    comment_count: 10400,
    share_count: 39000,
    created_at: new Date(Date.now() - 3.7 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 3.7 * 24 * 3600000).toISOString()
  }
];

openDramaSegmentVideos.forEach(v => SEED_VIDEOS.push(v));

// Seed Comments, Likes, and AI Analysis for videos
const SEED_COMMENTS: Comment[] = [
  { id: 'com-1', user_id: 'usr-2', video_id: 'vid-1', parent_id: null, body: 'Perfect pacing! The acting in this drama is next level.', status: 'approved', created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'com-2', user_id: 'usr-1', video_id: 'vid-1', parent_id: 'com-1', body: 'Thank you! Episode 2 drops tomorrow, make sure to follow.', status: 'approved', created_at: new Date(Date.now() - 4.8 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'com-3', user_id: 'usr-3', video_id: 'vid-1', parent_id: null, body: 'Love the cinematic lighting here! Absolute gold standard.', status: 'approved', created_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'com-4', user_id: 'usr-5', video_id: 'vid-short-1', parent_id: null, body: 'Hahaha Rohit bhai, you are too funny. Gossip uncles are the worst! 😂', status: 'approved', created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'com-5', user_id: 'usr-7', video_id: 'vid-4', parent_id: null, body: 'Very thrilling setup, suspense peaks at the end!', status: 'approved', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const SEED_LIKES: Like[] = [
  { id: 'lk-1', user_id: 'usr-2', video_id: 'vid-1', created_at: new Date().toISOString() },
  { id: 'lk-2', user_id: 'usr-3', video_id: 'vid-1', created_at: new Date().toISOString() },
  { id: 'lk-3', user_id: 'usr-4', video_id: 'vid-1', created_at: new Date().toISOString() },
  { id: 'lk-4', user_id: 'usr-1', video_id: 'vid-short-1', created_at: new Date().toISOString() },
  { id: 'lk-5', user_id: 'usr-3', video_id: 'vid-short-1', created_at: new Date().toISOString() },
  { id: 'lk-6', user_id: 'usr-6', video_id: 'vid-4', created_at: new Date().toISOString() },
  { id: 'lk-7', user_id: 'usr-7', video_id: 'vid-4', created_at: new Date().toISOString() }
];

const SEED_FOLLOWS: Follow[] = [
  { id: 'fl-1', follower_id: 'usr-2', following_id: 'usr-1', created_at: new Date().toISOString() },
  { id: 'fl-2', follower_id: 'usr-3', following_id: 'usr-1', created_at: new Date().toISOString() },
  { id: 'fl-3', follower_id: 'usr-1', following_id: 'usr-3', created_at: new Date().toISOString() },
  { id: 'fl-4', follower_id: 'usr-5', following_id: 'usr-2', created_at: new Date().toISOString() }
];

const SEED_AI_ANALYSIS: AIAnalysis[] = SEED_VIDEOS.slice(0, 5).map((v, i) => ({
  id: `ai-analysis-${v.id}`,
  video_id: v.id,
  summary: `This is a highly compelling short film segment. It follows the narrative flow of a standard ${v.genre} work.`,
  transcript: `[Dialogue segment] Hey, did you hear that? I thought we were alone. Wait, check the camera feed. [Music swells]`,
  genres: [v.genre || 'Drama'],
  topics: ['suspense', 'city scene', 'dialogue', 'creative edits'],
  scenes: [
    { timestamp: '00:00', description: 'Opening setting description' },
    { timestamp: '00:15', description: 'Primary action dialogue introduction' },
    { timestamp: '00:35', description: 'Concluding climax or teaser block' }
  ],
  safety_flags: { 'adult_content': false, 'violence': false, 'hate_speech': false, 'harassment': false },
  confidence: 0.95,
  created_at: v.created_at
}));

export const initializeLocalDb = () => {
  const needsInit = !localStorage.getItem(DB_PREFIX + 'initialized_v22') || 
                    !localStorage.getItem(DB_PREFIX + 'videos') || 
                    JSON.parse(localStorage.getItem(DB_PREFIX + 'videos') || '[]').length === 0;

  if (needsInit) {
    localStorage.clear();
    setStorageItem('profiles', SEED_PROFILES);
    setStorageItem('creator_profiles', SEED_CREATORS);
    setStorageItem('videos', SEED_VIDEOS);
    setStorageItem('series', SEED_SERIES);
    setStorageItem('seasons', SEED_SEASONS);
    setStorageItem('episodes', SEED_EPISODES);
    setStorageItem('likes', SEED_LIKES);
    setStorageItem('follows', SEED_FOLLOWS);
    setStorageItem('comments', SEED_COMMENTS);
    setStorageItem('watch_history', []);
    setStorageItem('saved_videos', []);
    setStorageItem('reports', []);
    setStorageItem('subtitles', [
      { id: 'sub-1', video_id: 'vid-1', language: 'en', subtitle_url: 'sub_en_placeholder', source: 'ai', status: 'approved', created_at: new Date().toISOString() },
      { id: 'sub-2', video_id: 'vid-1', language: 'hi', subtitle_url: 'sub_hi_placeholder', source: 'ai', status: 'approved', created_at: new Date().toISOString() }
    ]);
    setStorageItem('ai_analysis', SEED_AI_ANALYSIS);
    setStorageItem('content_events', []);
    setStorageItem('currentUser', SEED_PROFILES[0]); // Logged in as Alex Rivera by default for immediate preview
    localStorage.setItem(DB_PREFIX + 'initialized_v22', 'true');
  }
};

export const localDb = {
  // --- AUTH SIMULATION ---
  getCurrentUser: (): Profile | null => {
    initializeLocalDb();
    return getStorageItem<Profile | null>('currentUser', null);
  },

  setCurrentUser: (user: Profile | null): void => {
    setStorageItem('currentUser', user);
  },

  signUp: (username: string, display_name: string, email: string): Profile => {
    initializeLocalDb();
    const profiles = getStorageItem<Profile[]>('profiles', []);
    
    // Check if username taken
    if (profiles.some(p => p.username === username.toLowerCase())) {
      throw new Error('Username already taken');
    }

    const newUser: Profile = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      username: username.toLowerCase().trim(),
      display_name: display_name.trim() || username,
      bio: '',
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      preferred_language: 'en',
      favorite_genres: [],
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    profiles.push(newUser);
    setStorageItem('profiles', profiles);
    setStorageItem('currentUser', newUser);
    return newUser;
  },

  signIn: (username: string): Profile => {
    initializeLocalDb();
    const profiles = getStorageItem<Profile[]>('profiles', []);
    const user = profiles.find(p => p.username.toLowerCase() === username.toLowerCase().trim());
    if (!user) {
      throw new Error('User not found');
    }
    setStorageItem('currentUser', user);
    return user;
  },

  signOut: (): void => {
    setStorageItem('currentUser', null);
  },

  updateProfile: (profileId: string, updates: Partial<Profile>): Profile => {
    const profiles = getStorageItem<Profile[]>('profiles', []);
    const index = profiles.findIndex(p => p.id === profileId);
    if (index === -1) throw new Error('Profile not found');

    const updated = { ...profiles[index], ...updates, updated_at: new Date().toISOString() };
    profiles[index] = updated;
    setStorageItem('profiles', profiles);

    // Sync current user session
    const cur = getStorageItem<Profile | null>('currentUser', null);
    if (cur && cur.id === profileId) {
      setStorageItem('currentUser', updated);
    }
    return updated;
  },

  createCreatorProfile: (userId: string, creatorName: string): CreatorProfile => {
    const creators = getStorageItem<CreatorProfile[]>('creator_profiles', []);
    const existing = creators.find(c => c.user_id === userId);
    if (existing) return existing;

    const newCreator: CreatorProfile = {
      id: 'cr-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      creator_name: creatorName,
      is_verified: false,
      followers_count: 0,
      total_views: 0,
      created_at: new Date().toISOString(),
    };

    creators.push(newCreator);
    setStorageItem('creator_profiles', creators);
    return newCreator;
  },

  getCreatorByUserId: (userId: string): CreatorProfile | null => {
    initializeLocalDb();
    const creators = getStorageItem<CreatorProfile[]>('creator_profiles', []);
    return creators.find(c => c.user_id === userId) || null;
  },

  // --- VIDEOS ---
  getVideos: (): Video[] => {
    initializeLocalDb();
    return getStorageItem<Video[]>('videos', []);
  },

  getVideoById: (id: string): Video | null => {
    const videos = getStorageItem<Video[]>('videos', []);
    return videos.find(v => v.id === id) || null;
  },

  createVideo: (video: Omit<Video, 'id' | 'view_count' | 'like_count' | 'comment_count' | 'share_count' | 'created_at' | 'updated_at'>): Video => {
    const videos = getStorageItem<Video[]>('videos', []);
    const newVideo: Video = {
      ...video,
      id: 'vid-' + Math.random().toString(36).substr(2, 9),
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      share_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    videos.push(newVideo);
    setStorageItem('videos', videos);
    return newVideo;
  },

  updateVideo: (id: string, updates: Partial<Video>): Video => {
    const videos = getStorageItem<Video[]>('videos', []);
    const idx = videos.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Video not found');

    const updated = { ...videos[idx], ...updates, updated_at: new Date().toISOString() };
    videos[idx] = updated;
    setStorageItem('videos', videos);
    return updated;
  },

  deleteVideo: (id: string): void => {
    const videos = getStorageItem<Video[]>('videos', []);
    const filtered = videos.filter(v => v.id !== id);
    setStorageItem('videos', filtered);

    // Clean episodes mapping
    const episodes = getStorageItem<Episode[]>('episodes', []);
    setStorageItem('episodes', episodes.filter(e => e.video_id !== id));
  },

  // --- SERIES, SEASONS & EPISODES ---
  getSeries: (): Series[] => {
    initializeLocalDb();
    return getStorageItem<Series[]>('series', []);
  },

  getSeriesById: (id: string): Series | null => {
    const series = getStorageItem<Series[]>('series', []);
    return series.find(s => s.id === id) || null;
  },

  createSeries: (series: Omit<Series, 'id' | 'created_at' | 'updated_at'>): Series => {
    const seriesList = getStorageItem<Series[]>('series', []);
    const newSeries: Series = {
      ...series,
      id: 'ser-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    seriesList.push(newSeries);
    setStorageItem('series', seriesList);
    return newSeries;
  },

  getSeasonsForSeries: (seriesId: string): Season[] => {
    initializeLocalDb();
    const seasons = getStorageItem<Season[]>('seasons', []);
    return seasons.filter(s => s.series_id === seriesId).sort((a, b) => a.season_number - b.season_number);
  },

  addSeason: (seriesId: string, seasonNumber: number, title: string, description: string): Season => {
    const seasons = getStorageItem<Season[]>('seasons', []);
    const newSeason: Season = {
      id: 'seas-' + Math.random().toString(36).substr(2, 9),
      series_id: seriesId,
      season_number: seasonNumber,
      title,
      description,
      created_at: new Date().toISOString(),
    };
    seasons.push(newSeason);
    setStorageItem('seasons', seasons);
    return newSeason;
  },

  getEpisodesForSeason: (seasonId: string): Episode[] => {
    initializeLocalDb();
    const episodes = getStorageItem<Episode[]>('episodes', []);
    const videos = getStorageItem<Video[]>('videos', []);
    
    return episodes
      .filter(e => e.season_id === seasonId)
      .map(e => ({
        ...e,
        video: videos.find(v => v.id === e.video_id) || undefined
      }))
      .sort((a, b) => a.episode_number - b.episode_number);
  },

  addEpisode: (seasonId: string, videoId: string, episodeNumber: number, title: string): Episode => {
    const episodes = getStorageItem<Episode[]>('episodes', []);
    const newEpisode: Episode = {
      id: 'ep-' + Math.random().toString(36).substr(2, 9),
      season_id: seasonId,
      video_id: videoId,
      episode_number: episodeNumber,
      title,
      created_at: new Date().toISOString(),
    };
    episodes.push(newEpisode);
    setStorageItem('episodes', episodes);
    return newEpisode;
  },

  // --- SOCIAL ACTIONS (LIKES, FOLLOWS, SAVES) ---
  getLikesForVideo: (videoId: string): Like[] => {
    initializeLocalDb();
    const likes = getStorageItem<Like[]>('likes', []);
    return likes.filter(l => l.video_id === videoId);
  },

  likeVideo: (userId: string, videoId: string): Like => {
    const likes = getStorageItem<Like[]>('likes', []);
    const existing = likes.find(l => l.user_id === userId && l.video_id === videoId);
    if (existing) return existing;

    const newLike: Like = {
      id: 'lk-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      video_id: videoId,
      created_at: new Date().toISOString()
    };
    likes.push(newLike);
    setStorageItem('likes', likes);

    // Update count in video
    const videos = getStorageItem<Video[]>('videos', []);
    const idx = videos.findIndex(v => v.id === videoId);
    if (idx !== -1) {
      videos[idx].like_count = (videos[idx].like_count || 0) + 1;
      setStorageItem('videos', videos);
    }

    return newLike;
  },

  unlikeVideo: (userId: string, videoId: string): void => {
    const likes = getStorageItem<Like[]>('likes', []);
    const filtered = likes.filter(l => !(l.user_id === userId && l.video_id === videoId));
    setStorageItem('likes', filtered);

    // Update count in video
    const videos = getStorageItem<Video[]>('videos', []);
    const idx = videos.findIndex(v => v.id === videoId);
    if (idx !== -1) {
      videos[idx].like_count = Math.max(0, (videos[idx].like_count || 1) - 1);
      setStorageItem('videos', videos);
    }
  },

  followCreator: (followerId: string, followingId: string): Follow => {
    const follows = getStorageItem<Follow[]>('follows', []);
    const existing = follows.find(f => f.follower_id === followerId && f.following_id === followingId);
    if (existing) return existing;

    const newFollow: Follow = {
      id: 'fl-' + Math.random().toString(36).substr(2, 9),
      follower_id: followerId,
      following_id: followingId,
      created_at: new Date().toISOString()
    };
    follows.push(newFollow);
    setStorageItem('follows', follows);

    // Update follower count in creator profile
    const creators = getStorageItem<CreatorProfile[]>('creator_profiles', []);
    const idx = creators.findIndex(c => c.user_id === followingId);
    if (idx !== -1) {
      creators[idx].followers_count = (creators[idx].followers_count || 0) + 1;
      setStorageItem('creator_profiles', creators);
    }

    return newFollow;
  },

  unfollowCreator: (followerId: string, followingId: string): void => {
    const follows = getStorageItem<Follow[]>('follows', []);
    const filtered = follows.filter(f => !(f.follower_id === followerId && f.following_id === followingId));
    setStorageItem('follows', filtered);

    // Update follower count
    const creators = getStorageItem<CreatorProfile[]>('creator_profiles', []);
    const idx = creators.findIndex(c => c.user_id === followingId);
    if (idx !== -1) {
      creators[idx].followers_count = Math.max(0, (creators[idx].followers_count || 1) - 1);
      setStorageItem('creator_profiles', creators);
    }
  },

  getFollows: (): Follow[] => {
    initializeLocalDb();
    return getStorageItem<Follow[]>('follows', []);
  },

  // --- COMMENTS ---
  getCommentsForVideo: (videoId: string): Comment[] => {
    initializeLocalDb();
    const comments = getStorageItem<Comment[]>('comments', []);
    const profiles = getStorageItem<Profile[]>('profiles', []);
    
    // Join profiles and build tree (replies)
    const videoComments = comments
      .filter(c => c.video_id === videoId && c.status === 'approved')
      .map(c => ({
        ...c,
        user: profiles.find(p => p.id === c.user_id) || undefined
      }));

    const rootComments = videoComments.filter(c => c.parent_id === null);
    const childComments = videoComments.filter(c => c.parent_id !== null);

    const mapChildren = (parent: Comment) => {
      parent.replies = childComments
        .filter(c => c.parent_id === parent.id)
        .map(c => {
          const commentWithReplies = { ...c };
          mapChildren(commentWithReplies);
          return commentWithReplies;
        });
    };

    rootComments.forEach(mapChildren);
    return rootComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  addComment: (userId: string, videoId: string, parentId: string | null, body: string): Comment => {
    const comments = getStorageItem<Comment[]>('comments', []);
    const newComment: Comment = {
      id: 'com-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      video_id: videoId,
      parent_id: parentId,
      body,
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    comments.push(newComment);
    setStorageItem('comments', comments);

    // Update count in video
    const videos = getStorageItem<Video[]>('videos', []);
    const idx = videos.findIndex(v => v.id === videoId);
    if (idx !== -1) {
      videos[idx].comment_count = (videos[idx].comment_count || 0) + 1;
      setStorageItem('videos', videos);
    }

    const profiles = getStorageItem<Profile[]>('profiles', []);
    newComment.user = profiles.find(p => p.id === userId) || undefined;
    return newComment;
  },

  deleteComment: (id: string, userId: string): void => {
    const comments = getStorageItem<Comment[]>('comments', []);
    const target = comments.find(c => c.id === id);
    if (!target) throw new Error('Comment not found');
    
    // Check ownership or admin
    const currentUser = getStorageItem<Profile | null>('currentUser', null);
    const isAdmin = currentUser?.is_admin || false;
    if (target.user_id !== userId && !isAdmin) {
      throw new Error('Unauthorized');
    }

    const filtered = comments.filter(c => c.id !== id && c.parent_id !== id);
    setStorageItem('comments', filtered);

    // Update count in video
    const videos = getStorageItem<Video[]>('videos', []);
    const idx = videos.findIndex(v => v.id === target.video_id);
    if (idx !== -1) {
      videos[idx].comment_count = Math.max(0, (videos[idx].comment_count || 1) - 1);
      setStorageItem('videos', videos);
    }
  },

  // --- WATCH HISTORY & SAVED ---
  getWatchHistory: (userId: string): WatchHistory[] => {
    initializeLocalDb();
    const history = getStorageItem<WatchHistory[]>('watch_history', []);
    const videos = getStorageItem<Video[]>('videos', []);
    return history
      .filter(h => h.user_id === userId)
      .map(h => ({
        ...h,
        video: videos.find(v => v.id === h.video_id) || undefined
      }))
      .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime());
  },

  updateWatchHistory: (userId: string, videoId: string, watchSeconds: number, durationSeconds: number): WatchHistory => {
    const history = getStorageItem<WatchHistory[]>('watch_history', []);
    const existingIdx = history.findIndex(h => h.user_id === userId && h.video_id === videoId);

    const completionPercent = durationSeconds > 0 ? (watchSeconds / durationSeconds) * 100 : 0;
    const completed = completionPercent >= 90;

    const record: WatchHistory = {
      id: existingIdx !== -1 ? history[existingIdx].id : 'wh-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      video_id: videoId,
      watch_seconds: watchSeconds,
      completion_percent: Math.min(100, parseFloat(completionPercent.toFixed(1))),
      completed,
      last_watched_at: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      history[existingIdx] = record;
    } else {
      history.push(record);
      // Increment view count in video on initial watch trigger
      const videos = getStorageItem<Video[]>('videos', []);
      const vIdx = videos.findIndex(v => v.id === videoId);
      if (vIdx !== -1) {
        videos[vIdx].view_count = (videos[vIdx].view_count || 0) + 1;
        setStorageItem('videos', videos);
      }
    }

    setStorageItem('watch_history', history);
    return record;
  },

  getSavedVideos: (userId: string): SavedVideo[] => {
    initializeLocalDb();
    const saved = getStorageItem<SavedVideo[]>('saved_videos', []);
    const videos = getStorageItem<Video[]>('videos', []);
    return saved
      .filter(s => s.user_id === userId)
      .map(s => ({
        ...s,
        video: videos.find(v => v.id === s.video_id) || undefined
      }));
  },

  toggleSaveVideo: (userId: string, videoId: string): boolean => {
    const saved = getStorageItem<SavedVideo[]>('saved_videos', []);
    const idx = saved.findIndex(s => s.user_id === userId && s.video_id === videoId);
    
    if (idx !== -1) {
      saved.splice(idx, 1);
      setStorageItem('saved_videos', saved);
      return false; // Removed
    } else {
      saved.push({
        id: 'sv-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        video_id: videoId,
        created_at: new Date().toISOString()
      });
      setStorageItem('saved_videos', saved);
      return true; // Added
    }
  },

  // --- MODERATION & REPORTS ---
  getReports: (): Report[] => {
    initializeLocalDb();
    const reports = getStorageItem<Report[]>('reports', []);
    const videos = getStorageItem<Video[]>('videos', []);
    const profiles = getStorageItem<Profile[]>('profiles', []);

    return reports.map(r => ({
      ...r,
      video: videos.find(v => v.id === r.video_id) || undefined,
      reporter: profiles.find(p => p.id === r.reporter_id) || undefined
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  submitReport: (reporterId: string, videoId: string, commentId: string | null, reason: Report['reason'], details: string): Report => {
    const reports = getStorageItem<Report[]>('reports', []);
    const newReport: Report = {
      id: 'rep-' + Math.random().toString(36).substr(2, 9),
      reporter_id: reporterId,
      video_id: videoId,
      comment_id: commentId,
      reason,
      details,
      status: 'pending',
      reviewer_id: null,
      created_at: new Date().toISOString(),
      resolved_at: null
    };
    reports.push(newReport);
    setStorageItem('reports', reports);
    return newReport;
  },

  updateReportStatus: (id: string, status: Report['status'], reviewerId: string): Report => {
    const reports = getStorageItem<Report[]>('reports', []);
    const idx = reports.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Report not found');

    const updated = {
      ...reports[idx],
      status,
      reviewer_id: reviewerId,
      resolved_at: new Date().toISOString()
    };
    reports[idx] = updated;
    setStorageItem('reports', reports);

    // If resolved is "resolved" (approved report), we restrict the video
    if (status === 'resolved') {
      const videos = getStorageItem<Video[]>('videos', []);
      const vIdx = videos.findIndex(v => v.id === updated.video_id);
      if (vIdx !== -1) {
        videos[vIdx].status = 'rejected'; // Unpublishes video
        setStorageItem('videos', videos);
      }
    }

    return updated;
  },

  // --- AI ANALYSIS & SUBTITLES ---
  getAiAnalysisForVideo: (videoId: string): AIAnalysis | null => {
    initializeLocalDb();
    const list = getStorageItem<AIAnalysis[]>('ai_analysis', []);
    return list.find(a => a.video_id === videoId) || null;
  },

  saveAiAnalysis: (analysis: AIAnalysis): void => {
    const list = getStorageItem<AIAnalysis[]>('ai_analysis', []);
    const idx = list.findIndex(a => a.video_id === analysis.video_id);
    if (idx !== -1) {
      list[idx] = analysis;
    } else {
      list.push(analysis);
    }
    setStorageItem('ai_analysis', list);
  },

  getSubtitlesForVideo: (videoId: string): Subtitle[] => {
    initializeLocalDb();
    const subs = getStorageItem<Subtitle[]>('subtitles', []);
    return subs.filter(s => s.video_id === videoId);
  },

  addSubtitle: (subtitle: Omit<Subtitle, 'id' | 'created_at'>): Subtitle => {
    const subs = getStorageItem<Subtitle[]>('subtitles', []);
    const newSub: Subtitle = {
      ...subtitle,
      id: 'sub-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    subs.push(newSub);
    setStorageItem('subtitles', subs);
    return newSub;
  },

  // --- ANALYTICS EVENTS LOGGING ---
  logEvent: (userId: string | null, videoId: string, eventType: ContentEvent['event_type'], eventValue: Record<string, any> = {}): void => {
    const events = getStorageItem<ContentEvent[]>('content_events', []);
    const newEvent: ContentEvent = {
      id: 'evt-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      video_id: videoId,
      event_type: eventType,
      event_value: eventValue,
      created_at: new Date().toISOString()
    };
    events.push(newEvent);
    setStorageItem('content_events', events);

    // Sync counts on specific events
    if (eventType === 'share') {
      const videos = getStorageItem<Video[]>('videos', []);
      const idx = videos.findIndex(v => v.id === videoId);
      if (idx !== -1) {
        videos[idx].share_count = (videos[idx].share_count || 0) + 1;
        setStorageItem('videos', videos);
      }
    }
  },

  getEvents: (): ContentEvent[] => {
    initializeLocalDb();
    return getStorageItem<ContentEvent[]>('content_events', []);
  }
};
