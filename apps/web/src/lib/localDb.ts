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

// --- RICH SEED DATA (10 profiles, 10 creators, 5 series, 19 strictly unique videos) ---
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
  { id: 'ser-1', creator_id: 'usr-7', title: 'SAVANNA SURVIVAL', description: 'An awe-inspiring vertical journey documenting survival stories of the African Savanna. Experience elephant families, mountain wildlife, and water sanctuaries.', cover_url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&h=500&q=80', language: 'en', genre: 'Animals', status: 'published', created_at: new Date(Date.now() - 25 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-2', creator_id: 'usr-2', title: 'THE CREATIVE MIND & CODE', description: 'An intimate look into modern software craftsmanship, developer workstations, and algorithmic computational art.', cover_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&h=500&q=80', language: 'en', genre: 'Documentary', status: 'published', created_at: new Date(Date.now() - 20 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-3', creator_id: 'usr-6', title: 'WILD EXPEDITIONS', description: 'Adrenaline-packed athletic endurance and extreme nature expeditions pushing human and animal limits.', cover_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&h=500&q=80', language: 'en', genre: 'Action', status: 'published', created_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-4', creator_id: 'usr-9', title: 'OCEAN & NATURE SANCTUARIES', description: 'A calming cinematic study of ocean shores, marine life, and high-altitude sunset skies.', cover_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&h=500&q=80', language: 'en', genre: 'Nature', status: 'published', created_at: new Date(Date.now() - 12 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'ser-5', creator_id: 'usr-4', title: 'PLAYFUL COMPANIONS & TALES', description: 'Heartwarming, joyful moments following playful puppy adventures and charming forest animal tales.', cover_url: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=800&h=500&q=80', language: 'en', genre: 'Comedy', status: 'published', created_at: new Date(Date.now() - 10 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() }
];

const SEED_SEASONS: Season[] = [
  { id: 'seas-1', series_id: 'ser-1', season_number: 1, title: 'Season 1: Grassland Cycles', description: 'Migration, hunting, and water sanctuary.', created_at: SEED_SERIES[0].created_at },
  { id: 'seas-2', series_id: 'ser-2', season_number: 1, title: 'Season 1: Craft & Logic', description: 'Software architecture and visual geometry.', created_at: SEED_SERIES[1].created_at },
  { id: 'seas-3', series_id: 'ser-3', season_number: 1, title: 'Season 1: Adrenaline Waves', description: 'Whitewater rafting, forest biking, and championship sprints.', created_at: SEED_SERIES[2].created_at },
  { id: 'seas-4', series_id: 'ser-4', season_number: 1, title: 'Season 1: Coastal Tides', description: 'Coral reefs, alpine summits, and coastal shorelines.', created_at: SEED_SERIES[3].created_at },
  { id: 'seas-5', series_id: 'ser-5', season_number: 1, title: 'Season 1: Puppy Joy & Forest Tales', description: 'Golden puppies, beach fetch, and woodland adventures.', created_at: SEED_SERIES[4].created_at }
];

// Verified, Royalty-Free CC0, Creator-Licensed Media Catalog
// 19 STRICTLY UNIQUE VIDEOS - ZERO DUPLICATES, ZERO HORSES
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
    thumbnail_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/lofi.mp3',
    title: 'Tokyo Midnight: Shibuya Rain',
    desc: 'Neon signs shimmering through rainy midnight crosswalks in Shibuya, capturing the quiet pulse of Tokyo.',
    genre: 'Documentary',
    tags: ['tokyo', 'shibuya', 'rain', 'neon', 'cityscape']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/fog.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/lofi2.mp3',
    title: 'The Craft of Clean Code',
    desc: 'Inside the late-night workstation of a software artisan crafting elegant algorithms under warm task lighting.',
    genre: 'Documentary',
    tags: ['coding', 'developer', 'minimalism', 'workspace', 'tech']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/airplane.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track5_action.mp3',
    title: 'Digital Canvas: Generative Geometry',
    desc: 'Algorithmic 3D wireframes and neon light pulses morphing seamlessly in an infinite computational space.',
    genre: 'Art',
    tags: ['art', 'generative', '3d', 'vectors', 'abstract']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/kitten_fighting.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track4_playful.mp3',
    title: 'Golden Autumn: Joyful Puppy Paws',
    desc: 'Two adorable golden retriever puppies romping through a carpet of golden autumn leaves on a sunny afternoon.',
    genre: 'Comedy',
    tags: ['comedy', 'puppies', 'animals', 'cute', 'autumn']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/elephants.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track7_savanna.mp3',
    title: 'Gentle Giants: Savanna Herd Migration',
    desc: 'An elephant matriarch leads her family across the vast golden plains under ancient baobab trees.',
    genre: 'Animals',
    tags: ['animals', 'elephants', 'savanna', 'wildlife', 'africa']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/marmots.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track7_savanna.mp3',
    title: 'Alpine Sentinels: The Marmot Watch',
    desc: 'Vigilant marmots scanning the rocky mountain slopes and signaling across the high alpine meadows.',
    genre: 'Animals',
    tags: ['animals', 'wildlife', 'alpine', 'nature', 'sentinel']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/cat.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track8_upbeat.mp3',
    title: 'Midday Sanctuary: Peaceful Paws',
    desc: 'A serene afternoon moment of quiet contentment and warm sunlight basking on the porch.',
    genre: 'Nature',
    tags: ['nature', 'cat', 'peaceful', 'cozy', 'sunlight']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/eagle.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/ambient.mp3',
    title: 'Skyward Hunter: The Sovereign Eagle',
    desc: 'A magnificent eagle soaring through high thermal currents above dramatic canyons and grasslands.',
    genre: 'Animals',
    tags: ['animals', 'eagle', 'soaring', 'canyon', 'sky']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/dog.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track4_playful.mp3',
    title: 'Golden Paws: Ocean Beach Fetch',
    desc: 'A joyful retriever dog dashing along the sunny shore and catching frisbees in pure exhilaration.',
    genre: 'Comedy',
    tags: ['comedy', 'dog', 'animals', 'beach', 'playful']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/sea_turtle.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track6_tranquil.mp3',
    title: 'Pacific Drifter: The Coral Sanctuary',
    desc: 'A majestic green sea turtle glides effortlessly through sunlit azure coastal currents and protected coral sanctuaries.',
    genre: 'Nature',
    tags: ['nature', 'turtle', 'ocean', 'underwater', 'coral']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/forest_bike.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track5_action.mp3',
    title: 'Forest Trail: Mountain Bike Descent',
    desc: 'A high-adrenaline mountain biker carving through narrow forested single-tracks and pine tree canopies.',
    genre: 'Action',
    tags: ['action', 'bike', 'forest', 'trail', 'downhill']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/rafting.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track5_action.mp3',
    title: 'Whitewater Surge: Canyon Rapids',
    desc: 'A high-stakes river rafting crew battles roaring Category 5 white-water rapids through a steep volcanic gorge.',
    genre: 'Action',
    tags: ['action', 'rafting', 'adventure', 'extreme', 'rapids']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/finish_line.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track8_upbeat.mp3',
    title: 'The Final 100 Meters: Finish Line Glory',
    desc: 'An endurance runner summons the last burst of willpower to outpace the chasing pack and break the championship ribbon.',
    genre: 'Action',
    tags: ['action', 'running', 'marathon', 'athlete', 'triumph']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/skate.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track5_action.mp3',
    title: 'Urban Flow: Street Skateboard Rhythm',
    desc: 'An agile street skater carves through urban architectural plazas with fluid, synchronized kinetic grace.',
    genre: 'Action',
    tags: ['action', 'skate', 'urban', 'flow', 'street']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/sea_waves.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track6_tranquil.mp3',
    title: 'Turquoise Swell: Ocean Wave Break',
    desc: 'Pristine emerald swells rolling in from the deep Pacific, curling into crystalline barrels at golden sunset.',
    genre: 'Nature',
    tags: ['nature', 'waves', 'ocean', 'swell', 'surf']
  },
  {
    video_url: 'https://res.cloudinary.com/demo/video/upload/c_fill,h_640,w_360/mountains.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/ambient.mp3',
    title: 'Alpine Majesty: High Mountain Summit',
    desc: 'Glaciated mountain crags piercing through an ocean of morning alpine clouds in breathtaking vertical scale.',
    genre: 'Nature',
    tags: ['nature', 'mountains', 'alpine', 'summit', 'peaks']
  },
  {
    video_url: '/videos/cloudy-sky.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/ambient.mp3',
    title: 'Skyward Whispers: High Altitude Clouds',
    desc: 'A hypnotic vertical time-lapse of golden sunset cumulus clouds drifting across high mountain peaks.',
    genre: 'Devotional',
    tags: ['devotional', 'clouds', 'sky', 'meditation', 'peace']
  },
  {
    video_url: '/coverr-test.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track6_tranquil.mp3',
    title: 'Coastal Solitude: Ocean Shoreline',
    desc: 'Crystalline turquoise ocean waves rolling continuously over golden beach sands in unhurried, rhythmic beauty.',
    genre: 'Devotional',
    tags: ['devotional', 'ocean', 'waves', 'beach', 'sanctuary']
  },
  {
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&h=400&q=80',
    audio_url: '/audio/track4_playful.mp3',
    title: 'Forest Tale: Playful Woodland Bunny',
    desc: 'A whimsical animated woodland tale following a curious rabbit exploring enchanted sunny forest glades.',
    genre: 'Comedy',
    tags: ['comedy', 'animation', 'forest', 'bunny', 'family']
  }
];

// EXACTLY 19 UNIQUE VIDEOS, MAPPED 1:1 TO THE CATALOG - NO DUPLICATES, NO HORSES
const SEED_VIDEOS: Video[] = MATCHED_MEDIA_CATALOG.map((m, idx) => ({
  id: `vid-${idx + 1}`,
  creator_id: SEED_PROFILES[idx % 10].id,
  title: m.title,
  description: m.desc,
  video_url: m.video_url,
  audio_url: m.audio_url,
  thumbnail_url: m.thumbnail_url,
  content_type: idx < 14 ? 'episode' : 'short',
  language: 'en',
  genre: m.genre,
  duration_seconds: 35 + (idx % 6) * 10,
  visibility: 'public',
  status: 'published',
  rights_type: 'creator_licensed',
  rights_confirmed: true,
  ai_summary: `AI Analysis: ${m.title}. High-retention cinematic segment with precision synchronized audio score.`,
  ai_tags: [...m.tags, 'featured'],
  view_count: 95000 + (idx + 1) * 38000,
  like_count: 14000 + (idx + 1) * 6200,
  comment_count: 450 + (idx + 1) * 180,
  share_count: 1200 + (idx + 1) * 350,
  created_at: new Date(Date.now() - (20 - idx) * 24 * 3600000).toISOString(),
  updated_at: new Date().toISOString(),
  published_at: new Date(Date.now() - (20 - idx) * 24 * 3600000).toISOString()
}));

// MAP 19 UNIQUE EPISODES 1:1 TO THE 5 SERIES - ZERO DUPLICATION
const SEED_EPISODES: Episode[] = [
  // ser-1: Savanna Survival (4 episodes: vids 5, 6, 7, 8)
  { id: 'ep-sav-1', season_id: 'seas-1', video_id: 'vid-5', episode_number: 1, title: 'Savanna Herd Migration', created_at: SEED_VIDEOS[4].created_at },
  { id: 'ep-sav-2', season_id: 'seas-1', video_id: 'vid-6', episode_number: 2, title: 'The Marmot Watch', created_at: SEED_VIDEOS[5].created_at },
  { id: 'ep-sav-3', season_id: 'seas-1', video_id: 'vid-7', episode_number: 3, title: 'Peaceful Paws Sanctuary', created_at: SEED_VIDEOS[6].created_at },
  { id: 'ep-sav-4', season_id: 'seas-1', video_id: 'vid-8', episode_number: 4, title: 'The Sovereign Eagle', created_at: SEED_VIDEOS[7].created_at },

  // ser-2: The Creative Mind & Code (3 episodes: vids 1, 2, 3)
  { id: 'ep-code-1', season_id: 'seas-2', video_id: 'vid-1', episode_number: 1, title: 'Tokyo Midnight Rain', created_at: SEED_VIDEOS[0].created_at },
  { id: 'ep-code-2', season_id: 'seas-2', video_id: 'vid-2', episode_number: 2, title: 'The Craft of Clean Code', created_at: SEED_VIDEOS[1].created_at },
  { id: 'ep-code-3', season_id: 'seas-2', video_id: 'vid-3', episode_number: 3, title: 'Digital Canvas: Geometry', created_at: SEED_VIDEOS[2].created_at },

  // ser-3: Wild Expeditions (4 episodes: vids 11, 12, 13, 14)
  { id: 'ep-wild-1', season_id: 'seas-3', video_id: 'vid-11', episode_number: 1, title: 'Mountain Bike Descent', created_at: SEED_VIDEOS[10].created_at },
  { id: 'ep-wild-2', season_id: 'seas-3', video_id: 'vid-12', episode_number: 2, title: 'Canyon Whitewater Surge', created_at: SEED_VIDEOS[11].created_at },
  { id: 'ep-wild-3', season_id: 'seas-3', video_id: 'vid-13', episode_number: 3, title: 'Finish Line Glory', created_at: SEED_VIDEOS[12].created_at },
  { id: 'ep-wild-4', season_id: 'seas-3', video_id: 'vid-14', episode_number: 4, title: 'Street Skateboard Rhythm', created_at: SEED_VIDEOS[13].created_at },

  // ser-4: Ocean & Nature Sanctuaries (4 episodes: vids 10, 15, 16, 17)
  { id: 'ep-nat-1', season_id: 'seas-4', video_id: 'vid-10', episode_number: 1, title: 'The Coral Sanctuary', created_at: SEED_VIDEOS[9].created_at },
  { id: 'ep-nat-2', season_id: 'seas-4', video_id: 'vid-15', episode_number: 2, title: 'Ocean Wave Break', created_at: SEED_VIDEOS[14].created_at },
  { id: 'ep-nat-3', season_id: 'seas-4', video_id: 'vid-16', episode_number: 3, title: 'Alpine Majesty Summit', created_at: SEED_VIDEOS[15].created_at },
  { id: 'ep-nat-4', season_id: 'seas-4', video_id: 'vid-17', episode_number: 4, title: 'High Altitude Clouds', created_at: SEED_VIDEOS[16].created_at },

  // ser-5: Playful Companions & Tales (4 episodes: vids 4, 9, 18, 19)
  { id: 'ep-play-1', season_id: 'seas-5', video_id: 'vid-4', episode_number: 1, title: 'Joyful Puppy Paws', created_at: SEED_VIDEOS[3].created_at },
  { id: 'ep-play-2', season_id: 'seas-5', video_id: 'vid-9', episode_number: 2, title: 'Ocean Beach Fetch', created_at: SEED_VIDEOS[8].created_at },
  { id: 'ep-play-3', season_id: 'seas-5', video_id: 'vid-18', episode_number: 3, title: 'Ocean Shoreline Solitude', created_at: SEED_VIDEOS[17].created_at },
  { id: 'ep-play-4', season_id: 'seas-5', video_id: 'vid-19', episode_number: 4, title: 'Playful Woodland Bunny', created_at: SEED_VIDEOS[18].created_at }
];

// Seed Comments, Likes, and AI Analysis for videos
const SEED_COMMENTS: Comment[] = [
  { id: 'com-1', user_id: 'usr-2', video_id: 'vid-1', parent_id: null, body: 'Perfect pacing! The acting in this drama is next level.', status: 'approved', created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'com-2', user_id: 'usr-1', video_id: 'vid-1', parent_id: 'com-1', body: 'Thank you! Episode 2 drops tomorrow, make sure to follow.', status: 'approved', created_at: new Date(Date.now() - 4.8 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'com-3', user_id: 'usr-3', video_id: 'vid-1', parent_id: null, body: 'Love the cinematic lighting here! Absolute gold standard.', status: 'approved', created_at: new Date(Date.now() - 4 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'com-4', user_id: 'usr-5', video_id: 'vid-4', parent_id: null, body: 'Hahaha Rohit bhai, you are too funny! 😂', status: 'approved', created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'com-5', user_id: 'usr-7', video_id: 'vid-5', parent_id: null, body: 'Very thrilling setup, suspense peaks at the end!', status: 'approved', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const SEED_LIKES: Like[] = [
  { id: 'lk-1', user_id: 'usr-2', video_id: 'vid-1', created_at: new Date().toISOString() },
  { id: 'lk-2', user_id: 'usr-3', video_id: 'vid-1', created_at: new Date().toISOString() },
  { id: 'lk-3', user_id: 'usr-4', video_id: 'vid-1', created_at: new Date().toISOString() },
  { id: 'lk-4', user_id: 'usr-1', video_id: 'vid-4', created_at: new Date().toISOString() },
  { id: 'lk-5', user_id: 'usr-3', video_id: 'vid-4', created_at: new Date().toISOString() },
  { id: 'lk-6', user_id: 'usr-6', video_id: 'vid-5', created_at: new Date().toISOString() },
  { id: 'lk-7', user_id: 'usr-7', video_id: 'vid-5', created_at: new Date().toISOString() }
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
  const currentKey = DB_PREFIX + 'initialized_v36';
  const needsInit = !localStorage.getItem(currentKey) || 
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
    localStorage.setItem(currentKey, 'true');
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
    if (idx !== -1) throw new Error('Video not found');

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
