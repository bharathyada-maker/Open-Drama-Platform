// TypeScript Definitions for OpenDrama Schema

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  preferred_language: string;
  favorite_genres: string[];
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  creator_name: string;
  is_verified: boolean;
  followers_count: number;
  total_views: number;
  created_at: string;
}

export interface Video {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  video_url: string;
  audio_url?: string;
  thumbnail_url: string | null;
  content_type: 'short' | 'short_film' | 'episode' | string;
  language: string;
  genre: string | null;
  duration_seconds: number;
  visibility: 'public' | 'unlisted' | 'private';
  status: 'draft' | 'processing' | 'published' | 'rejected';
  rights_type: 'all_rights_reserved' | 'creator_licensed' | 'creative_commons' | 'public_domain' | 'authorized';
  rights_confirmed: boolean;
  ai_summary: string | null;
  ai_tags: string[];
  embedding?: number[];
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface Series {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  language: string;
  genre: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Season {
  id: string;
  series_id: string;
  season_number: number;
  title: string | null;
  description: string | null;
  created_at: string;
}

export interface Episode {
  id: string;
  season_id: string;
  video_id: string;
  episode_number: number;
  title: string;
  created_at: string;
  // Dynamic join helper:
  video?: Video;
}

export interface Like {
  id: string;
  user_id: string;
  video_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  video_id: string;
  parent_id: string | null;
  body: string;
  status: 'approved' | 'flagged' | 'hidden';
  created_at: string;
  updated_at: string;
  // Dynamic join helper:
  user?: Profile;
  replies?: Comment[];
}

export interface WatchHistory {
  id: string;
  user_id: string;
  video_id: string;
  watch_seconds: number;
  completion_percent: number;
  completed: boolean;
  last_watched_at: string;
  // Join helper:
  video?: Video;
}

export interface SavedVideo {
  id: string;
  user_id: string;
  video_id: string;
  created_at: string;
  // Join helper:
  video?: Video;
}

export interface Report {
  id: string;
  reporter_id: string;
  video_id: string;
  comment_id: string | null;
  reason: 'copyright' | 'spam' | 'harassment' | 'misleading' | 'inappropriate' | 'other';
  details: string | null;
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  reviewer_id: string | null;
  created_at: string;
  resolved_at: string | null;
  // Join helper:
  video?: Video;
  reporter?: Profile;
}

export interface Subtitle {
  id: string;
  video_id: string;
  language: string;
  subtitle_url: string;
  source: 'ai' | 'community' | 'creator';
  status: 'pending' | 'approved';
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  video_id: string;
  summary: string | null;
  transcript: string | null;
  genres: string[];
  topics: string[];
  scenes: { timestamp: string; description: string }[];
  safety_flags: Record<string, boolean>;
  confidence: number;
  created_at: string;
}

export interface ContentEvent {
  id: string;
  user_id: string | null;
  video_id: string;
  event_type: 'impression' | 'play' | 'pause' | '25_percent' | '50_percent' | '75_percent' | 'complete' | 'replay' | 'like' | 'share' | 'comment' | 'follow' | 'save' | 'skip';
  event_value: Record<string, any>;
  created_at: string;
}
