import { supabase } from './supabaseClient';
import { localDb } from './localDb';
import { Profile, CreatorProfile, Video, Series, Season, Episode, Like, Follow, Comment, WatchHistory, SavedVideo, Report, Subtitle, AIAnalysis, ContentEvent } from '../types/schema';

// Unified Database Client Router
export const dbClient = {
  // --- AUTH METHODS ---
  getCurrentUser: async (): Promise<Profile | null> => {
    if (!supabase) return localDb.getCurrentUser();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error || !data) return null;
      return data as Profile;
    } catch (e) {
      console.error('Supabase error, falling back to localDb:', e);
      return localDb.getCurrentUser();
    }
  },

  signUp: async (username: string, displayName: string, email: string): Promise<Profile> => {
    if (!supabase) return localDb.signUp(username, displayName, email);
    try {
      // Note: In a production Supabase auth environment, auth.signUp will trigger a user creation.
      // We simulate creating a user in profiles table after signup.
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'TemporaryPassword123!', // Simple fallback password for mock login
        options: {
          data: {
            username: username.toLowerCase(),
            display_name: displayName,
          }
        }
      });
      if (error || !data.user) throw error || new Error('Signup failed');

      // Create profile row in profiles table
      const newProfile: Profile = {
        id: data.user.id,
        username: username.toLowerCase().trim(),
        display_name: displayName.trim(),
        bio: '',
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        preferred_language: 'en',
        favorite_genres: [],
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([newProfile]);

      if (insertError) console.error('Error inserting profile row:', insertError);
      return newProfile;
    } catch (e) {
      console.warn('Supabase auth failed, falling back to localDb:', e);
      return localDb.signUp(username, displayName, email);
    }
  },

  signIn: async (usernameOrEmail: string): Promise<Profile> => {
    if (!supabase) return localDb.signIn(usernameOrEmail);
    try {
      // Real Supabase would use email/password auth.
      // For this MVP, if they pass email, we log in, else we query profile first.
      let email = usernameOrEmail;
      if (!usernameOrEmail.includes('@')) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', usernameOrEmail.toLowerCase().trim())
          .single();
        if (error || !data) throw new Error('User not found');
        email = `${data.username}@opendrama.com`; // Mock email structure
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'TemporaryPassword123!'
      });

      if (error || !data.user) throw error || new Error('Sign in failed');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      return (profile as Profile) || localDb.signIn(usernameOrEmail);
    } catch (e) {
      console.warn('Supabase auth failed, falling back to localDb:', e);
      return localDb.signIn(usernameOrEmail);
    }
  },

  signOut: async (): Promise<void> => {
    if (!supabase) return localDb.signOut();
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    localDb.signOut();
  },

  updateProfile: async (profileId: string, updates: Partial<Profile>): Promise<Profile> => {
    if (!supabase) return localDb.updateProfile(profileId, updates);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    } catch (e) {
      console.warn('Supabase update failed, falling back to localDb:', e);
      return localDb.updateProfile(profileId, updates);
    }
  },

  createCreatorProfile: async (userId: string, creatorName: string): Promise<CreatorProfile> => {
    if (!supabase) return localDb.createCreatorProfile(userId, creatorName);
    try {
      const newCreator = {
        user_id: userId,
        creator_name: creatorName,
        is_verified: false,
        followers_count: 0,
        total_views: 0
      };
      const { data, error } = await supabase
        .from('creator_profiles')
        .insert([newCreator])
        .select()
        .single();
      
      if (error) throw error;
      return data as CreatorProfile;
    } catch (e) {
      console.warn('Supabase failed, falling back to localDb:', e);
      return localDb.createCreatorProfile(userId, creatorName);
    }
  },

  getCreatorProfile: async (userId: string): Promise<CreatorProfile | null> => {
    if (!supabase) return localDb.getCreatorByUserId(userId);
    try {
      const { data, error } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) return null;
      return data as CreatorProfile;
    } catch (e) {
      return localDb.getCreatorByUserId(userId);
    }
  },

  // --- VIDEOS METHODS ---
  getVideos: async (): Promise<Video[]> => {
    if (!supabase) return localDb.getVideos();
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Video[];
    } catch (e) {
      console.warn('Supabase getVideos failed, falling back to localDb:', e);
      return localDb.getVideos();
    }
  },

  getVideoById: async (id: string): Promise<Video | null> => {
    if (!supabase) return localDb.getVideoById(id);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as Video;
    } catch (e) {
      return localDb.getVideoById(id);
    }
  },

  createVideo: async (video: Omit<Video, 'id' | 'view_count' | 'like_count' | 'comment_count' | 'share_count' | 'created_at' | 'updated_at'>): Promise<Video> => {
    if (!supabase) return localDb.createVideo(video);
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert([video])
        .select()
        .single();
      if (error) throw error;
      return data as Video;
    } catch (e) {
      console.warn('Supabase failed, falling back to localDb:', e);
      return localDb.createVideo(video);
    }
  },

  updateVideo: async (id: string, updates: Partial<Video>): Promise<Video> => {
    if (!supabase) return localDb.updateVideo(id, updates);
    try {
      const { data, error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Video;
    } catch (e) {
      return localDb.updateVideo(id, updates);
    }
  },

  deleteVideo: async (id: string): Promise<void> => {
    if (!supabase) return localDb.deleteVideo(id);
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      localDb.deleteVideo(id);
    }
  },

  // --- SERIES METHODS ---
  getSeries: async (): Promise<Series[]> => {
    if (!supabase) return localDb.getSeries();
    try {
      const { data, error } = await supabase.from('series').select('*');
      if (error) throw error;
      return data as Series[];
    } catch (e) {
      return localDb.getSeries();
    }
  },

  getSeriesById: async (id: string): Promise<Series | null> => {
    if (!supabase) return localDb.getSeriesById(id);
    try {
      const { data, error } = await supabase.from('series').select('*').eq('id', id).single();
      if (error) return null;
      return data as Series;
    } catch (e) {
      return localDb.getSeriesById(id);
    }
  },

  createSeries: async (series: Omit<Series, 'id' | 'created_at' | 'updated_at'>): Promise<Series> => {
    if (!supabase) return localDb.createSeries(series);
    try {
      const { data, error } = await supabase.from('series').insert([series]).select().single();
      if (error) throw error;
      return data as Series;
    } catch (e) {
      return localDb.createSeries(series);
    }
  },

  getSeasons: async (seriesId: string): Promise<Season[]> => {
    if (!supabase) return localDb.getSeasonsForSeries(seriesId);
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('series_id', seriesId)
        .order('season_number', { ascending: true });
      if (error) throw error;
      return data as Season[];
    } catch (e) {
      return localDb.getSeasonsForSeries(seriesId);
    }
  },

  addSeason: async (seriesId: string, seasonNumber: number, title: string, description: string): Promise<Season> => {
    if (!supabase) return localDb.addSeason(seriesId, seasonNumber, title, description);
    try {
      const newSeason = { series_id: seriesId, season_number: seasonNumber, title, description };
      const { data, error } = await supabase.from('seasons').insert([newSeason]).select().single();
      if (error) throw error;
      return data as Season;
    } catch (e) {
      return localDb.addSeason(seriesId, seasonNumber, title, description);
    }
  },

  getEpisodes: async (seasonId: string): Promise<Episode[]> => {
    if (!supabase) return localDb.getEpisodesForSeason(seasonId);
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('*, video:videos(*)')
        .eq('season_id', seasonId)
        .order('episode_number', { ascending: true });
      if (error) throw error;
      return data as Episode[];
    } catch (e) {
      return localDb.getEpisodesForSeason(seasonId);
    }
  },

  addEpisode: async (seasonId: string, videoId: string, episodeNumber: number, title: string): Promise<Episode> => {
    if (!supabase) return localDb.addEpisode(seasonId, videoId, episodeNumber, title);
    try {
      const newEpisode = { season_id: seasonId, video_id: videoId, episode_number: episodeNumber, title };
      const { data, error } = await supabase.from('episodes').insert([newEpisode]).select().single();
      if (error) throw error;
      return data as Episode;
    } catch (e) {
      return localDb.addEpisode(seasonId, videoId, episodeNumber, title);
    }
  },

  // --- SOCIAL METHODS ---
  getLikes: async (videoId: string): Promise<Like[]> => {
    if (!supabase) return localDb.getLikesForVideo(videoId);
    try {
      const { data, error } = await supabase.from('likes').select('*').eq('video_id', videoId);
      if (error) throw error;
      return data as Like[];
    } catch (e) {
      return localDb.getLikesForVideo(videoId);
    }
  },

  likeVideo: async (userId: string, videoId: string): Promise<Like> => {
    if (!supabase) return localDb.likeVideo(userId, videoId);
    try {
      const { data, error } = await supabase.from('likes').insert([{ user_id: userId, video_id: videoId }]).select().single();
      if (error) throw error;
      return data as Like;
    } catch (e) {
      return localDb.likeVideo(userId, videoId);
    }
  },

  unlikeVideo: async (userId: string, videoId: string): Promise<void> => {
    if (!supabase) return localDb.unlikeVideo(userId, videoId);
    try {
      const { error } = await supabase.from('likes').delete().eq('user_id', userId).eq('video_id', videoId);
      if (error) throw error;
    } catch (e) {
      localDb.unlikeVideo(userId, videoId);
    }
  },

  followCreator: async (followerId: string, followingId: string): Promise<Follow> => {
    if (!supabase) return localDb.followCreator(followerId, followingId);
    try {
      const { data, error } = await supabase.from('follows').insert([{ follower_id: followerId, following_id: followingId }]).select().single();
      if (error) throw error;
      return data as Follow;
    } catch (e) {
      return localDb.followCreator(followerId, followingId);
    }
  },

  unfollowCreator: async (followerId: string, followingId: string): Promise<void> => {
    if (!supabase) return localDb.unfollowCreator(followerId, followingId);
    try {
      const { error } = await supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
      if (error) throw error;
    } catch (e) {
      localDb.unfollowCreator(followerId, followingId);
    }
  },

  getFollows: async (): Promise<Follow[]> => {
    if (!supabase) return localDb.getFollows();
    try {
      const { data, error } = await supabase.from('follows').select('*');
      if (error) throw error;
      return data as Follow[];
    } catch (e) {
      return localDb.getFollows();
    }
  },

  // --- COMMENTS METHODS ---
  getComments: async (videoId: string): Promise<Comment[]> => {
    if (!supabase) return localDb.getCommentsForVideo(videoId);
    try {
      // In Supabase we select approved comments and join profile details
      const { data, error } = await supabase
        .from('comments')
        .select('*, user:profiles(*)')
        .eq('video_id', videoId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Structure nested replies client-side
      const allComments = data as Comment[];
      const rootComments = allComments.filter(c => c.parent_id === null);
      const childComments = allComments.filter(c => c.parent_id !== null);

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
      return rootComments;
    } catch (e) {
      return localDb.getCommentsForVideo(videoId);
    }
  },

  addComment: async (userId: string, videoId: string, parentId: string | null, body: string): Promise<Comment> => {
    if (!supabase) return localDb.addComment(userId, videoId, parentId, body);
    try {
      const newComment = { user_id: userId, video_id: videoId, parent_id: parentId, body, status: 'approved' };
      const { data, error } = await supabase.from('comments').insert([newComment]).select('*, user:profiles(*)').single();
      if (error) throw error;
      return data as Comment;
    } catch (e) {
      return localDb.addComment(userId, videoId, parentId, body);
    }
  },

  deleteComment: async (id: string, userId: string): Promise<void> => {
    if (!supabase) return localDb.deleteComment(id, userId);
    try {
      const { error } = await supabase.from('comments').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
    } catch (e) {
      localDb.deleteComment(id, userId);
    }
  },

  // --- SAVED & HISTORY ---
  getWatchHistory: async (userId: string): Promise<WatchHistory[]> => {
    if (!supabase) return localDb.getWatchHistory(userId);
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*, video:videos(*)')
        .eq('user_id', userId)
        .order('last_watched_at', { ascending: false });
      if (error) throw error;
      return data as WatchHistory[];
    } catch (e) {
      return localDb.getWatchHistory(userId);
    }
  },

  updateWatchHistory: async (userId: string, videoId: string, watchSeconds: number, durationSeconds: number): Promise<WatchHistory> => {
    if (!supabase) return localDb.updateWatchHistory(userId, videoId, watchSeconds, durationSeconds);
    try {
      const completionPercent = durationSeconds > 0 ? (watchSeconds / durationSeconds) * 100 : 0;
      const completed = completionPercent >= 90;
      
      const payload = {
        user_id: userId,
        video_id: videoId,
        watch_seconds: watchSeconds,
        completion_percent: Math.min(100, parseFloat(completionPercent.toFixed(1))),
        completed,
        last_watched_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('watch_history')
        .upsert(payload, { onConflict: 'user_id,video_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data as WatchHistory;
    } catch (e) {
      return localDb.updateWatchHistory(userId, videoId, watchSeconds, durationSeconds);
    }
  },

  getSavedVideos: async (userId: string): Promise<SavedVideo[]> => {
    if (!supabase) return localDb.getSavedVideos(userId);
    try {
      const { data, error } = await supabase
        .from('saved_videos')
        .select('*, video:videos(*)')
        .eq('user_id', userId);
      if (error) throw error;
      return data as SavedVideo[];
    } catch (e) {
      return localDb.getSavedVideos(userId);
    }
  },

  toggleSaveVideo: async (userId: string, videoId: string): Promise<boolean> => {
    if (!supabase) return localDb.toggleSaveVideo(userId, videoId);
    try {
      // Check if already saved
      const { data, error } = await supabase
        .from('saved_videos')
        .select('id')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Delete save
        await supabase.from('saved_videos').delete().eq('id', data.id);
        return false;
      } else {
        // Create save
        await supabase.from('saved_videos').insert([{ user_id: userId, video_id: videoId }]);
        return true;
      }
    } catch (e) {
      return localDb.toggleSaveVideo(userId, videoId);
    }
  },

  // --- MODERATION & REPORTS ---
  getReports: async (): Promise<Report[]> => {
    if (!supabase) return localDb.getReports();
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*, video:videos(*), reporter:profiles(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Report[];
    } catch (e) {
      return localDb.getReports();
    }
  },

  submitReport: async (reporterId: string, videoId: string, commentId: string | null, reason: Report['reason'], details: string): Promise<Report> => {
    if (!supabase) return localDb.submitReport(reporterId, videoId, commentId, reason, details);
    try {
      const payload = { reporter_id: reporterId, video_id: videoId, comment_id: commentId, reason, details };
      const { data, error } = await supabase.from('reports').insert([payload]).select().single();
      if (error) throw error;
      return data as Report;
    } catch (e) {
      return localDb.submitReport(reporterId, videoId, commentId, reason, details);
    }
  },

  updateReportStatus: async (id: string, status: Report['status'], reviewerId: string): Promise<Report> => {
    if (!supabase) return localDb.updateReportStatus(id, status, reviewerId);
    try {
      const payload = { status, reviewer_id: reviewerId, resolved_at: new Date().toISOString() };
      const { data, error } = await supabase.from('reports').update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data as Report;
    } catch (e) {
      return localDb.updateReportStatus(id, status, reviewerId);
    }
  },

  getAiAnalysis: async (videoId: string): Promise<AIAnalysis | null> => {
    if (!supabase) return localDb.getAiAnalysisForVideo(videoId);
    try {
      const { data, error } = await supabase.from('ai_analysis').select('*').eq('video_id', videoId).maybeSingle();
      if (error) return null;
      return data as AIAnalysis;
    } catch (e) {
      return localDb.getAiAnalysisForVideo(videoId);
    }
  },

  saveAiAnalysis: async (analysis: AIAnalysis): Promise<void> => {
    if (!supabase) return localDb.saveAiAnalysis(analysis);
    try {
      await supabase.from('ai_analysis').upsert(analysis, { onConflict: 'video_id' });
    } catch (e) {
      localDb.saveAiAnalysis(analysis);
    }
  },

  getSubtitles: async (videoId: string): Promise<Subtitle[]> => {
    if (!supabase) return localDb.getSubtitlesForVideo(videoId);
    try {
      const { data, error } = await supabase.from('subtitles').select('*').eq('video_id', videoId);
      if (error) throw error;
      return data as Subtitle[];
    } catch (e) {
      return localDb.getSubtitlesForVideo(videoId);
    }
  },

  addSubtitle: async (subtitle: Omit<Subtitle, 'id' | 'created_at'>): Promise<Subtitle> => {
    if (!supabase) return localDb.addSubtitle(subtitle);
    try {
      const { data, error } = await supabase.from('subtitles').insert([subtitle]).select().single();
      if (error) throw error;
      return data as Subtitle;
    } catch (e) {
      return localDb.addSubtitle(subtitle);
    }
  },

  logEvent: async (userId: string | null, videoId: string, eventType: ContentEvent['event_type'], eventValue: Record<string, any> = {}): Promise<void> => {
    // Analytics is non-blocking, we catch errors silently
    localDb.logEvent(userId, videoId, eventType, eventValue);
    if (!supabase) return;
    try {
      const payload = { user_id: userId, video_id: videoId, event_type: eventType, event_value: eventValue };
      await supabase.from('content_events').insert([payload]);
    } catch (e) {
      // Silently capture error
    }
  }
};
export default dbClient;
