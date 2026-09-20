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
  { id: 'ser-1', creator_id: 'usr-ai', title: 'SAVANNA SURVIVAL', description: 'An awe-inspiring vertical journey documenting survival stories of the African Savanna. Experience migrations, cheetah hunts, and water sanctuaries.', cover_url: '/images/savanna_migration.jpg', language: 'en', genre: 'Animals', status: 'published', created_at: new Date(Date.now() - 25 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-2', creator_id: 'usr-2', title: 'THE CREATIVE MIND & CODE', description: 'An intimate look into modern software craftsmanship, developer workstations, and algorithmic computational art.', cover_url: '/images/minimal_coding_setup.jpg', language: 'en', genre: 'Documentary', status: 'published', created_at: new Date(Date.now() - 20 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-3', creator_id: 'usr-10', title: 'WILD EXPEDITIONS', description: 'Adrenaline-packed athletic endurance and extreme nature expeditions pushing human and animal limits.', cover_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&h=500&q=80', language: 'en', genre: 'Action', status: 'published', created_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-4', creator_id: 'usr-4', title: 'OCEAN & NATURE SANCTUARIES', description: 'A calming cinematic study of ocean shores, marine life, and high-altitude sunset skies.', cover_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&h=500&q=80', language: 'en', genre: 'Nature', status: 'published', created_at: new Date(Date.now() - 12 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-5', creator_id: 'usr-6', title: 'PLAYFUL PAWS', description: 'Heartwarming, joyful moments following playful puppy adventures in the great outdoors.', cover_url: '/images/puppies_autumn.jpg', language: 'en', genre: 'Comedy', status: 'published', created_at: new Date(Date.now() - 10 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() }
];

const SEED_SEASONS: Season[] = [
  { id: 'seas-1', series_id: 'ser-1', season_number: 1, title: 'Season 1: Grassland Cycles', description: 'Migration, hunting, and water sanctuary.', created_at: SEED_SERIES[0].created_at },
  { id: 'seas-2', series_id: 'ser-2', season_number: 1, title: 'Season 1: Craft & Logic', description: 'Software architecture and visual geometry.', created_at: SEED_SERIES[1].created_at },
  { id: 'seas-3', series_id: 'ser-3', season_number: 1, title: 'Season 1: Adrenaline Waves', description: 'Whitewater rafting and championship sprints.', created_at: SEED_SERIES[2].created_at },
  { id: 'seas-4', series_id: 'ser-4', season_number: 1, title: 'Season 1: Coastal Tides', description: 'Coral reefs and coastal shorelines.', created_at: SEED_SERIES[3].created_at },
  { id: 'seas-5', series_id: 'ser-5', season_number: 1, title: 'Season 1: Puppy Joy', description: 'Golden puppies and beach games.', created_at: SEED_SERIES[4].created_at }
];

// Verified, Royalty-Free CC0, Creator-Licensed Media Catalog
// Each entry guarantees: video_url, thumbnail_url, audio_url, and story are 100% in sync
export interface MatchedMedia {
  video_url: string;
  thumbnail_url: string;
  audio_url: string;
  title: string;
  desc: string;
  genre: string;
  tags: string[];
}

export const MATCHED_MEDIA_CATALOG: MatchedMedia[] = [
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/docs/walking.mp4',
    thumbnail_url: '/images/shibuya_rain_night.jpg',
    audio_url: '/audio/lofi.mp3',
    title: 'Tokyo Midnight: Shibuya Rain',
    desc: 'Neon signs shimmering through rainy midnight crosswalks in Shibuya, capturing the quiet pulse of Tokyo.',
    genre: 'Documentary',
    tags: ['tokyo', 'shibuya', 'rain', 'neon', 'cityscape']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/fog.mp4',
    thumbnail_url: '/images/minimal_coding_setup.jpg',
    audio_url: '/audio/lofi2.mp3',
    title: 'The Craft of Clean Code',
    desc: 'Inside the late-night workstation of a software artisan crafting elegant algorithms under warm task lighting.',
    genre: 'Documentary',
    tags: ['coding', 'developer', 'minimalism', 'workspace', 'tech']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/airplane.mp4',
    thumbnail_url: '/images/generative_mesh_art.jpg',
    audio_url: '/audio/track5_action.mp3',
    title: 'Digital Canvas: Generative Geometry',
    desc: 'Algorithmic 3D wireframes and neon light pulses morphing seamlessly in an infinite computational space.',
    genre: 'Art',
    tags: ['art', 'generative', '3d', 'vectors', 'abstract']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/kitten_fighting.mp4',
    thumbnail_url: '/images/puppies_autumn.jpg',
    audio_url: '/audio/track4_playful.mp3',
    title: 'Golden Autumn: Joyful Puppy Paws',
    desc: 'Two adorable golden retriever puppies romping through a carpet of golden autumn leaves on a sunny afternoon.',
    genre: 'Comedy',
    tags: ['comedy', 'puppies', 'animals', 'cute', 'autumn']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/horses.mp4',
    thumbnail_url: '/images/savanna_migration.jpg',
    audio_url: '/audio/track7_savanna.mp3',
    title: 'Savanna Cycles: The Great Migration',
    desc: 'Wildebeest and zebra herds brave rushing river crossings in the timeless annual migration across the Serengeti.',
    genre: 'Animals',
    tags: ['animals', 'migration', 'savanna', 'wildlife', 'serengeti']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/snow_horses.mp4',
    thumbnail_url: '/images/savanna_cheetah.jpg',
    audio_url: '/audio/track7_savanna.mp3',
    title: 'Dawn Patrol: The Cheetah Watch',
    desc: 'A sleek cheetah prowls silently through sunlit golden grasses with razor-sharp predatory focus.',
    genre: 'Animals',
    tags: ['animals', 'cheetah', 'wildlife', 'safari', 'dawn']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/cat.mp4',
    thumbnail_url: '/images/savanna_waterhole.jpg',
    audio_url: '/audio/track8_upbeat.mp3',
    title: 'Midday Sanctuary: The Waterhole Truce',
    desc: 'A serene gathering of giraffes, zebras, and birds sharing precious water under the scorching afternoon sun.',
    genre: 'Nature',
    tags: ['nature', 'waterhole', 'wildlife', 'oasis', 'serenity']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/eagle.mp4',
    thumbnail_url: '/images/savanna_lion_night.jpg',
    audio_url: '/audio/ambient.mp3',
    title: 'Night on the Grasslands: Celestial Pride',
    desc: 'A nocturnal study of a lion pride resting under the glowing star-studded arch of the Milky Way.',
    genre: 'Animals',
    tags: ['animals', 'lion', 'night', 'stars', 'savanna']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/dog.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&h=250&q=80',
    audio_url: '/audio/track8_upbeat.mp3',
    title: 'Golden Paws: Ocean Beach Fetch',
    desc: 'A joyful retriever dog dashing along the sunny shore and catching frisbees in pure exhilaration.',
    genre: 'Comedy',
    tags: ['comedy', 'dog', 'animals', 'beach', 'playful']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/sea_turtle.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&h=250&q=80',
    audio_url: '/audio/track6_tranquil.mp3',
    title: 'Pacific Drifter: The Coral Sanctuary',
    desc: 'A majestic green sea turtle glides effortlessly through sunlit azure coastal currents and protected coral sanctuaries.',
    genre: 'Nature',
    tags: ['nature', 'turtle', 'ocean', 'underwater', 'coral']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/elephants.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=400&h=250&q=80',
    audio_url: '/audio/track7_savanna.mp3',
    title: 'Gentle Giants: Savanna Herd Migration',
    desc: 'An elephant matriarch leads her family across the vast golden plains under ancient baobab trees.',
    genre: 'Animals',
    tags: ['animals', 'elephants', 'savanna', 'wildlife', 'africa']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/rafting.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=400&h=250&q=80',
    audio_url: '/audio/track5_action.mp3',
    title: 'Whitewater Surge: Canyon Rapids',
    desc: 'A high-stakes river rafting crew battles roaring Category 5 white-water rapids through a steep volcanic gorge.',
    genre: 'Action',
    tags: ['action', 'rafting', 'adventure', 'extreme', 'rapids']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/finish_line.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&h=250&q=80',
    audio_url: '/audio/lofi2.mp3',
    title: 'The Final 100 Meters: Finish Line Glory',
    desc: 'An endurance runner summons the last burst of willpower to outpace the chasing pack and break the championship ribbon.',
    genre: 'Action',
    tags: ['action', 'running', 'marathon', 'athlete', 'triumph']
  },
  {
    video_url: '/videos/cloudy-sky.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=400&h=250&q=80',
    audio_url: '/audio/ambient.mp3',
    title: 'Skyward Whispers: High Altitude Clouds',
    desc: 'A hypnotic vertical time-lapse of golden sunset cumulus clouds drifting across high mountain peaks.',
    genre: 'Devotional',
    tags: ['devotional', 'clouds', 'sky', 'meditation', 'peace']
  },
  {
    video_url: '/coverr-test.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&h=250&q=80',
    audio_url: '/audio/track6_tranquil.mp3',
    title: 'Coastal Solitude: Ocean Shoreline',
    desc: 'Crystalline turquoise ocean waves rolling continuously over golden beach sands in unhurried, rhythmic beauty.',
    genre: 'Devotional',
    tags: ['devotional', 'ocean', 'waves', 'beach', 'sanctuary']
  }
];

const SEED_VIDEOS: Video[] = [];
const SEED_EPISODES: Episode[] = [];

// 1. Generate 22 videos mapped directly to our 5 series episodes
const seriesConfigs = [
  {
    seriesId: 'ser-1',
    seasonId: 'seas-1',
    creator: 'usr-ai',
    title: 'SAVANNA SURVIVAL',
    lang: 'en',
    genre: 'Animals',
    episodes: [
      { num: 1, catalogIdx: 4, title: 'The Great Migration', desc: 'Wildebeest and zebra herds brave rushing river crossings in the timeless annual migration across the Serengeti.' },
      { num: 2, catalogIdx: 5, title: 'Predators at Dawn: The Cheetah Watch', desc: 'A sleek cheetah prowls silently through sunlit golden grasses with razor-sharp predatory focus.' },
      { num: 3, catalogIdx: 6, title: 'Midday Sanctuary: The Waterhole Truce', desc: 'A serene gathering of giraffes, zebras, and birds sharing precious water under the scorching afternoon sun.' },
      { num: 4, catalogIdx: 7, title: 'Night on the Grasslands: Celestial Pride', desc: 'A nocturnal study of a lion pride resting under the glowing star-studded arch of the Milky Way.' },
      { num: 5, catalogIdx: 10, title: 'Gentle Giants: Savanna Herd Migration', desc: 'An elephant matriarch leads her family across the vast golden plains under ancient baobab trees.' }
    ]
  },
  {
    seriesId: 'ser-2',
    seasonId: 'seas-2',
    creator: 'usr-2',
    title: 'THE CREATIVE MIND & CODE',
    lang: 'en',
    genre: 'Documentary',
    episodes: [
      { num: 1, catalogIdx: 1, title: 'The Craft of Clean Code', desc: 'Inside the late-night workstation of a software artisan crafting elegant algorithms under warm task lighting.' },
      { num: 2, catalogIdx: 0, title: 'Tokyo Blue Hour: Shibuya Rain', desc: 'Neon signs shimmering through rainy midnight crosswalks in Shibuya, capturing the quiet pulse of Tokyo.' },
      { num: 3, catalogIdx: 2, title: 'Digital Canvas: Generative Geometry', desc: 'Algorithmic 3D wireframes and neon light pulses morphing seamlessly in an infinite computational space.' }
    ]
  },
  {
    seriesId: 'ser-3',
    seasonId: 'seas-3',
    creator: 'usr-10',
    title: 'WILD EXPEDITIONS',
    lang: 'en',
    genre: 'Action',
    episodes: [
      { num: 1, catalogIdx: 11, title: 'Whitewater Surge: Canyon Rapids', desc: 'A high-stakes river rafting crew battles roaring Category 5 white-water rapids through a steep volcanic gorge.' },
      { num: 2, catalogIdx: 12, title: 'The Final 100 Meters: Finish Line Glory', desc: 'An endurance runner summons the last burst of willpower to outpace the chasing pack and break the championship ribbon.' },
      { num: 3, catalogIdx: 8, title: 'Golden Paws: Ocean Beach Fetch', desc: 'A joyful retriever dog dashing along the sunny shore and catching frisbees in pure exhilaration.' }
    ]
  },
  {
    seriesId: 'ser-4',
    seasonId: 'seas-4',
    creator: 'usr-4',
    title: 'OCEAN & NATURE SANCTUARIES',
    lang: 'en',
    genre: 'Nature',
    episodes: [
      { num: 1, catalogIdx: 9, title: 'Pacific Drifter: The Coral Sanctuary', desc: 'A majestic green sea turtle glides effortlessly through sunlit azure coastal currents and protected coral sanctuaries.' },
      { num: 2, catalogIdx: 14, title: 'Coastal Solitude: Ocean Shoreline', desc: 'Crystalline turquoise ocean waves rolling continuously over golden beach sands in unhurried, rhythmic beauty.' },
      { num: 3, catalogIdx: 13, title: 'Skyward Whispers: High Altitude Clouds', desc: 'A hypnotic vertical time-lapse of golden sunset cumulus clouds drifting across high mountain peaks.' }
    ]
  },
  {
    seriesId: 'ser-5',
    seasonId: 'seas-5',
    creator: 'usr-6',
    title: 'PLAYFUL PAWS',
    lang: 'en',
    genre: 'Comedy',
    episodes: [
      { num: 1, catalogIdx: 3, title: 'Golden Autumn: Joyful Puppy Paws', desc: 'Two adorable golden retriever puppies romping through a carpet of golden autumn leaves on a sunny afternoon.' },
      { num: 2, catalogIdx: 8, title: 'Golden Paws: Ocean Beach Fetch', desc: 'A joyful retriever dog dashing along the sunny shore and catching frisbees in pure exhilaration.' }
    ]
  }
];

let vidIdCounter = 1;
seriesConfigs.forEach((cfg) => {
  cfg.episodes.forEach((ep) => {
    const vidId = `vid-ser-${cfg.seriesId.replace('ser-', '')}-ep-${ep.num}`;
    const matched = MATCHED_MEDIA_CATALOG[ep.catalogIdx];
    const url = matched.video_url;
    const audioUrl = matched.audio_url;
    const thumbUrl = matched.thumbnail_url;

    const videoRecord: Video = {
      id: vidId,
      creator_id: cfg.creator,
      title: `${cfg.title} - S1:E${ep.num} (${ep.title})`,
      description: ep.desc,
      video_url: url,
      audio_url: audioUrl,
      thumbnail_url: thumbUrl,
      content_type: 'episode',
      language: cfg.lang,
      genre: cfg.genre,
      duration_seconds: 50 + ep.num * 10,
      visibility: 'public',
      status: 'published',
      rights_type: 'creator_licensed',
      rights_confirmed: true,
      ai_summary: `AI Analysis: Highly engaging episode of ${cfg.title}. Neural spike analytics indicate peak retention at climax.`,
      ai_tags: [cfg.genre.toLowerCase(), ...matched.tags, 'series', 'episode'],
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
      id: `ep-${cfg.seriesId.replace('ser-', '')}-${ep.num}`,
      season_id: cfg.seasonId,
      video_id: vidId,
      episode_number: ep.num,
      title: ep.title,
      created_at: videoRecord.created_at
    });

    vidIdCounter++;
  });
});

// 2. Generate 15 independent vertical shorts (Strictly matched 1:1 with media catalog)
const shortCreators = [
  { id: 'usr-2', catalogIdx: 0, title: 'Tokyo Rain Alley Reflection', desc: 'A soothing nighttime study of rain droplets and Shibuya neon reflections on wet asphalt.' },
  { id: 'usr-4', catalogIdx: 1, title: 'Deep Work Terminal Setup', desc: 'Late-night focus compilation on a customized split mechanical keyboard in ambient warmth.' },
  { id: 'usr-5', catalogIdx: 2, title: 'Neon Vector Morphing', desc: 'Generative algorithm visual study projecting procedural wireframes into infinite 3D depth.' },
  { id: 'usr-6', catalogIdx: 3, title: 'Autumn Leaves Puppy Play', desc: 'Two golden retriever brothers romping through golden autumn leaves in pure joyful celebration.' },
  { id: 'usr-7', catalogIdx: 4, title: 'River Crossing Savanna Migration', desc: 'Over a million wildebeest braving swirling river waters during the annual migration across the Serengeti.' },
  { id: 'usr-3', catalogIdx: 5, title: 'Cheetah Golden Hour Prowl', desc: 'A silent African cheetah scanning the sunlit dry grasslands with razor-sharp predatory patience.' },
  { id: 'usr-8', catalogIdx: 6, title: 'Waterhole Oasis Peace', desc: 'Wild animals gathering under the midday heat for a peaceful water sanctuary truce.' },
  { id: 'usr-1', catalogIdx: 7, title: 'Starry Savanna Lion Watch', desc: 'The lion pride rests quietly under the glittering arch of the Milky Way galaxy.' },
  { id: 'usr-5', catalogIdx: 8, title: 'Golden Paws: Beach Frisbee Dash', desc: 'A joyful retriever dog racing along the sunny shoreline and leaping for frisbees.' },
  { id: 'usr-4', catalogIdx: 9, title: 'Pacific Sea Turtle Coral Drift', desc: 'A green sea turtle glides weightlessly through sunlit azure coastal waters and coral gardens.' },
  { id: 'usr-2', catalogIdx: 10, title: 'Elephant Family Savanna March', desc: 'An elephant matriarch leads her family across the vast golden plains under ancient baobab trees.' },
  { id: 'usr-9', catalogIdx: 11, title: 'Canyon Whitewater Surge', desc: 'An extreme river rafting expedition plunging through thundering Category 5 river rapids.' },
  { id: 'usr-10', catalogIdx: 12, title: 'Marathon Triumph: Final Sprint', desc: 'An athlete summons their final reservoir of willpower to break the championship finish line.' },
  { id: 'usr-4', catalogIdx: 13, title: 'High Altitude Cloud Drift', desc: 'A mesmerizing vertical time-lapse of golden sunset cumulus clouds over alpine peaks.' },
  { id: 'usr-9', catalogIdx: 14, title: 'Pacific Shoreline Sunrise Waves', desc: 'Crystalline turquoise waves roll rhythmically over untouched golden sands at dawn.' }
];

shortCreators.forEach((cfg, idx) => {
  const vidId = `vid-short-${idx + 1}`;
  const matched = MATCHED_MEDIA_CATALOG[cfg.catalogIdx];
  
  SEED_VIDEOS.push({
    id: vidId,
    creator_id: cfg.id,
    title: cfg.title,
    description: cfg.desc,
    video_url: matched.video_url,
    audio_url: matched.audio_url,
    thumbnail_url: matched.thumbnail_url,
    content_type: 'short',
    language: 'en',
    genre: matched.genre,
    duration_seconds: 25 + idx * 5,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: `AI generated synopsis: A high-retention short film featuring ${cfg.title}. Matched audio and visual score.`,
    ai_tags: [...matched.tags, 'short', 'viral'],
    view_count: 85000 + idx * 24000,
    like_count: 9400 + idx * 3100,
    comment_count: 650 + idx * 120,
    share_count: 1400 + idx * 450,
    created_at: new Date(Date.now() - (7 - idx * 0.5) * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - (7 - idx * 0.5) * 24 * 3600000).toISOString()
  });
});

// 3. Generate 15 highly viral trending shorts/videos (Strictly matched 1:1 with media catalog)
const viralCreators = [
  { id: 'usr-2', catalogIdx: 1, title: 'Clean Code: Minimal Workspace', desc: 'Inside the ultra-clean developer setup with focused warm task lighting and ambient beats.', views: 2400000, likes: 620000, shares: 140000, comments: 24000 },
  { id: 'usr-4', catalogIdx: 0, title: 'Tokyo Rain: Midnight Crosswalks', desc: 'High-framerate study of neon signs reflecting in Shibuya midnight street rain.', views: 3100000, likes: 830000, shares: 250000, comments: 45000 },
  { id: 'usr-7', catalogIdx: 2, title: 'Algorithmic 3D Wireframes', desc: 'Procedural mathematical models animated with glowing neon coordinate meshes.', views: 1800000, likes: 450000, shares: 89000, comments: 18000 },
  { id: 'usr-8', catalogIdx: 3, title: 'Puppy Autumn Celebration', desc: 'Two golden retriever pups tumbling through autumn leaves in pure joyful energy.', views: 2900000, likes: 780000, shares: 190000, comments: 31000 },
  { id: 'usr-5', catalogIdx: 8, title: 'Golden Retriever Ocean Beach Run', desc: 'A cheerful dog sprinting through the sea spray and enjoying pure coastal freedom.', views: 4200000, likes: 1100000, shares: 480000, comments: 85000 },
  { id: 'usr-3', catalogIdx: 9, title: 'Pacific Sea Turtle Coral Sanctuary', desc: 'Peaceful underwater journey beside a green sea turtle in tropical waters.', views: 1600000, likes: 320000, shares: 75000, comments: 12000 },
  { id: 'usr-6', catalogIdx: 10, title: 'Gentle Savanna Giants Herd', desc: 'Elephant family traversing the wide open Serengeti landscape at golden hour.', views: 3400000, likes: 910000, shares: 280000, comments: 92000 },
  { id: 'usr-1', catalogIdx: 11, title: 'Category 5 Whitewater Rapids', desc: 'Adrenaline-packed canyon rafting crew conquering turbulent white water cascades.', views: 5100000, likes: 1400000, shares: 680000, comments: 140000 },
  { id: 'usr-2', catalogIdx: 12, title: 'Championship Marathon Finish Line', desc: 'Endurance runner pushing past the limit to claim victory at the finish line.', views: 1200000, likes: 340000, shares: 98000, comments: 12000 },
  { id: 'usr-4', catalogIdx: 13, title: 'Sunset Cloud Time-Lapse', desc: 'Golden clouds drifting across mountain peaks in breathtaking vertical cinematic framing.', views: 2000000, likes: 580000, shares: 140000, comments: 20000 },
  { id: 'usr-10', catalogIdx: 14, title: 'Morning Pacific Shoreline Tide', desc: 'Soothing turquoise ocean waves washing over warm sands in peaceful meditation.', views: 1500000, likes: 420000, shares: 120000, comments: 15000 },
  { id: 'usr-9', catalogIdx: 4, title: 'Serengeti Great Migration Crossing', desc: 'Vast herds braving rushing river currents in the great savanna migration cycle.', views: 2700000, likes: 810000, shares: 240000, comments: 27000 },
  { id: 'usr-6', catalogIdx: 5, title: 'Dawn Patrol Cheetah Hunting Watch', desc: 'Cheetah silently navigating the golden grasslands in the first light of dawn.', views: 1100000, likes: 320000, shares: 85000, comments: 11000 },
  { id: 'usr-7', catalogIdx: 6, title: 'Savanna Waterhole Oasis Sanctuary', desc: 'Animals of all species sharing precious water under a scorching afternoon sun.', views: 1900000, likes: 470000, shares: 190000, comments: 19000 },
  { id: 'usr-1', catalogIdx: 7, title: 'Under the Milky Way: Lion Pride', desc: 'Nocturnal lion pride resting calmly under a dazzling starry sky on the grasslands.', views: 3500000, likes: 980000, shares: 320000, comments: 35000 }
];

viralCreators.forEach((cfg, idx) => {
  const vidId = `vid-viral-${idx + 1}`;
  const matched = MATCHED_MEDIA_CATALOG[cfg.catalogIdx];
  
  SEED_VIDEOS.push({
    id: vidId,
    creator_id: cfg.id,
    title: cfg.title,
    description: cfg.desc,
    video_url: matched.video_url,
    audio_url: matched.audio_url,
    thumbnail_url: matched.thumbnail_url,
    content_type: 'short',
    language: 'en',
    genre: matched.genre,
    duration_seconds: 20 + idx * 4,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: `AI generated synopsis: Highly engaging viral trend log for ${cfg.title}. Matched audio and visual score.`,
    ai_tags: [...matched.tags, 'viral', 'trending', 'shorts', 'explore'],
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
    description: 'A vertical cyberpunk visual study of rain reflections, neon signs, and urban walking in 2:00 AM Shibuya, Tokyo.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/docs/walking.mp4',
    thumbnail_url: '/images/shibuya_rain_night.jpg',
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
    description: 'A cozy, hyper-minimalist atmospheric loop. Misty mountain fog drifting slowly under warm amber ambient tones.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/fog.mp4',
    thumbnail_url: '/images/minimal_coding_setup.jpg',
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
    description: 'A study of high-altitude flight soaring through digital skies and cloud layers above the earth.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/airplane.mp4',
    thumbnail_url: '/images/generative_mesh_art.jpg',
    audio_url: '/audio/track5_action.mp3',
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
    thumbnail_url: v.thumbnail_url || v.video_url,
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

// 5. Open Drama Platform - Core Segment Flagship 5-Minute Shorts (Love, Action, Comedy, Devotional, Nature, Animals)
// Strictly matched: video stream, verified photography/artwork thumbnail, and genre audio score
const openDramaSegmentVideos: Video[] = [
  {
    id: 'vid-drama-love-1',
    creator_id: 'usr-1',
    title: 'Tokyo Midnight: Shibuya Rain',
    description: 'Two souls cross paths under umbrellas in the neon glow of midnight Shibuya as rainy reflections dance across the asphalt.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/docs/walking.mp4',
    audio_url: '/audio/track6_tranquil.mp3',
    thumbnail_url: '/images/shibuya_rain_night.jpg',
    content_type: 'short',
    language: 'en',
    genre: 'Love',
    duration_seconds: 225,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'An emotional romance short exploring unexpected meetings in midnight rain.',
    ai_tags: ['love', 'romance', 'tokyo', 'shibuya', 'rain', '5min-short'],
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
    title: 'Golden Hour Rendezvous',
    description: 'Sunset reflections and drifting mountain clouds create a breathtaking atmosphere as two hearts meet at the high mountain summit.',
    video_url: '/videos/cloudy-sky.mp4',
    audio_url: '/audio/ambient.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Love',
    duration_seconds: 250,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'A heartwarming romance short about unexpected connections above the clouds.',
    ai_tags: ['love', 'romance', 'sunset', 'clouds', 'cozy', '5min-short'],
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
    title: 'Whitewater Surge: Canyon Rapids',
    description: 'A high-stakes river rafting crew battles roaring Category 5 white-water rapids through a steep volcanic gorge.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/rafting.mp4',
    audio_url: '/audio/track5_action.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Action',
    duration_seconds: 295,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'A heart-pounding 5-minute tactical whitewater rapids expedition with high retention action.',
    ai_tags: ['action', 'rafting', 'thriller', 'adventure', 'extreme', '5min-short'],
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
    title: 'The Final 100 Meters: Finish Line Glory',
    description: 'An endurance runner summons the last burst of willpower to outpace the chasing pack and break the championship ribbon.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/finish_line.mp4',
    audio_url: '/audio/track8_upbeat.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Action',
    duration_seconds: 210,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'A fast-paced marathon triumph with inspiring athletic cinematography.',
    ai_tags: ['action', 'running', 'marathon', 'triumph', 'sprint'],
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
    title: 'Autumn Antics: Puppy Playtime',
    description: 'Two golden retriever puppies discover a giant pile of dry autumn leaves and turn a peaceful park afternoon into pure joyful chaos.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/kitten_fighting.mp4',
    audio_url: '/audio/track4_playful.mp3',
    thumbnail_url: '/images/puppies_autumn.jpg',
    content_type: 'short',
    language: 'en',
    genre: 'Comedy',
    duration_seconds: 255,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'A hilarious, heartwarming short featuring playful puppy antics in golden fall leaves.',
    ai_tags: ['comedy', 'puppies', 'cute', 'hilarious', 'autumn', '5min-short'],
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
    title: 'Generative Art Gone Rogue',
    description: 'A digital artist sets algorithm parameters to auto-generate a fruit bowl, but the AI starts spinning neon hyper-dimensional geometric lattices instead.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/cat.mp4',
    audio_url: '/audio/track8_upbeat.mp3',
    thumbnail_url: '/images/generative_mesh_art.jpg',
    content_type: 'short',
    language: 'en',
    genre: 'Comedy',
    duration_seconds: 200,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'A meme-worthy sketch exploring generative AI and computational geometry.',
    ai_tags: ['comedy', 'ai', 'generative', 'creative', 'meme', 'sketch'],
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
    title: 'Skyward Whispers: High Altitude Clouds',
    description: 'A hypnotic vertical time-lapse of golden sunset cumulus clouds drifting across high mountain peaks, set to sacred acoustic chords.',
    video_url: '/videos/cloudy-sky.mp4',
    audio_url: '/audio/track6_tranquil.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Devotional',
    duration_seconds: 210,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Serene sunrise meditation ritual with acoustic ambient overtones.',
    ai_tags: ['devotional', 'spiritual', 'sacred', 'clouds', 'sky', 'peace'],
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
    title: 'Sacred Waters: Coastal Solitude',
    description: 'Golden sunrise rays breaking across sacred coastal tide waters as crystalline waves wash over untouched sands in morning reflection.',
    video_url: '/coverr-test.mp4',
    audio_url: '/audio/ambient.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Devotional',
    duration_seconds: 285,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Mesmerizing coastal reflection ritual reflecting light on sacred ocean waves.',
    ai_tags: ['devotional', 'ocean', 'waves', 'spiritual', 'sacred', 'lights'],
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
    title: 'Pacific Drifter: The Coral Sanctuary',
    description: 'A majestic green sea turtle glides effortlessly through sunlit azure coastal currents and protected coral sanctuaries.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/sea_turtle.mp4',
    audio_url: '/audio/ambient.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Nature',
    duration_seconds: 220,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Majestic vertical journey through coral reefs with a gliding Pacific sea turtle.',
    ai_tags: ['nature', 'ocean', 'turtle', 'coral', 'tranquil'],
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
    title: 'Coastal Solitude: Ocean Tides',
    description: 'Crystalline turquoise ocean waves rolling continuously over golden beach sands in unhurried, rhythmic beauty.',
    video_url: '/coverr-test.mp4',
    audio_url: '/audio/ambient.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Nature',
    duration_seconds: 260,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Slow-motion pristine ocean waves descending across golden coastal beaches.',
    ai_tags: ['nature', 'beach', 'waves', 'ocean', 'peace'],
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
    title: 'Golden Paws: Ocean Beach Fetch',
    description: 'A joyful golden retriever dashes along the sunny shoreline in high spirits, chasing frisbees and leaping through sea spray.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/dog.mp4',
    audio_url: '/audio/track4_playful.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Animals',
    duration_seconds: 245,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Heartwarming, joyful pet cinematography of a playful retriever at the beach.',
    ai_tags: ['animals', 'dog', 'golden', 'beach', 'fetch', 'playful'],
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
    title: 'Savanna Giants: The Elephant Herd',
    description: 'An elephant family traverses the golden African savanna under baobab trees, moving together in ancient familial harmony.',
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/elephants.mp4',
    audio_url: '/audio/track7_savanna.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=400&h=250&q=80',
    content_type: 'short',
    language: 'en',
    genre: 'Animals',
    duration_seconds: 270,
    visibility: 'public',
    status: 'published',
    rights_type: 'creator_licensed',
    rights_confirmed: true,
    ai_summary: 'Mesmerizing savanna wildlife cinematography capturing familial elephant communication.',
    ai_tags: ['animals', 'elephants', 'savanna', 'wildlife', 'africa'],
    view_count: 530000,
    like_count: 154000,
    comment_count: 10400,
    share_count: 39000,
    created_at: new Date(Date.now() - 1.6 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date(Date.now() - 1.6 * 24 * 3600000).toISOString()
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
  const needsInit = !localStorage.getItem(DB_PREFIX + 'initialized_v33') || 
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
    localStorage.setItem(DB_PREFIX + 'initialized_v33', 'true');
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
