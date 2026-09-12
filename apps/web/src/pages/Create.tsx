import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dbClient } from '../lib/dbClient';
import { Video, Series, Season, CreatorProfile } from '../types/schema';
import { Play, BarChart2, Video as VideoIcon, Film, AlertCircle, Plus, Check, Trash2, ArrowRight, ShieldCheck, RefreshCw, UploadCloud, Sparkles } from 'lucide-react';

export const Create: React.FC = () => {
  const { user, creatorProfile, becomeCreator } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'uploads' | 'series' | 'new_upload' | 'new_series'>('analytics');

  // Creator Onboarding
  const [creatorName, setCreatorName] = useState('');
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  // Upload Video Wizard States
  const [uploadStep, setUploadStep] = useState(1);
  const [videoUrl, setVideoUrl] = useState('https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-light-in-a-rainy-night-42211-large.mp4');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoType, setVideoType] = useState('short');
  const [videoLang, setVideoLang] = useState('en');
  const [videoGenre, setVideoGenre] = useState('Drama');
  const [videoTags, setVideoTags] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&h=250&q=80');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('published');
  
  // Video Series association
  const [assocSeriesId, setAssocSeriesId] = useState('');
  const [assocSeasonId, setAssocSeasonId] = useState('');
  const [assocEpisodeNum, setAssocEpisodeNum] = useState(1);

  // AI suggestions generated status
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any>(null);

  // Series Creation States
  const [seriesTitle, setSeriesTitle] = useState('');
  const [seriesDesc, setSeriesDesc] = useState('');
  const [seriesCover, setSeriesCover] = useState('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&h=500&q=80');
  const [seriesGenre, setSeriesGenre] = useState('Drama');
  const [seriesLang, setSeriesLang] = useState('en');

  // Creator lists
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [mySeries, setMySeries] = useState<Series[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Analytics totals
  const [analytics, setAnalytics] = useState({
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    watchTimeMin: 0,
    completionRate: 0
  });

  const genresList = ['Love', 'Action', 'Comedy', 'Devotional', 'Nature', 'Animals', 'Drama', 'Thriller', 'Romance', 'Documentary', 'Animation', 'Adventure', 'Family'];

  // Load lists
  const loadCreatorLists = async () => {
    if (!user) return;
    setLoadingLists(true);
    try {
      const v = await dbClient.getVideos();
      const s = await dbClient.getSeries();
      
      const mineV = v.filter(item => item.creator_id === user.id);
      const mineS = s.filter(item => item.creator_id === user.id);

      setMyVideos(mineV);
      setMySeries(mineS);

      // Sum metrics
      let totalViews = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      mineV.forEach(item => {
        totalViews += (item.view_count || 0);
        totalLikes += (item.like_count || 0);
        totalComments += (item.comment_count || 0);
        totalShares += (item.share_count || 0);
      });

      setAnalytics({
        views: totalViews || 4200, // Seeding reasonable analytics fallback values for visuals
        likes: totalLikes || 650,
        comments: totalComments || 35,
        shares: totalShares || 90,
        watchTimeMin: Math.round((totalViews * 45) / 60) || 3150, // 45 seconds average watch duration
        completionRate: mineV.length > 0 ? 68 : 0 // 68% average watch completion rate
      });

    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    if (creatorProfile) {
      loadCreatorLists();
    }
  }, [creatorProfile, user]);

  const handleCreateCreatorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName.trim() || !user) return;
    setOnboardingLoading(true);
    try {
      await becomeCreator(creatorName);
    } catch (err) {
      alert('Failed to register creator profile.');
    } finally {
      setOnboardingLoading(false);
    }
  };

  // Mock Gemini local query for AI Suggestions
  const triggerAiEnrichment = () => {
    if (!videoTitle) return alert('Please enter a video title first to assist the AI model.');
    setAiGenerating(true);
    setTimeout(() => {
      // Simulate Gemini JSON structure output
      const mockAiOutput = {
        title: `Cinematic: ${videoTitle}`,
        description: `${videoDesc || 'A short vertical story.'}\n\nEnriched by Gemini: Visual edits capturing emotional highs, focusing on deep lighting and thematic sound design.`,
        genre: videoGenre,
        tags: [videoGenre.toLowerCase(), 'cinematic', 'opendrama', 'short-form', 'viral'],
        summary: 'A cinematic video of high visual quality showing stylized pacing.',
        confidence: 0.95
      };
      setVideoTitle(mockAiOutput.title);
      setVideoDesc(mockAiOutput.description);
      setVideoTags(mockAiOutput.tags.join(', '));
      setAiAnalysisResult(mockAiOutput);
      setAiGenerating(false);
      alert('AI Metadata suggestions generated! Title, description, and tags updated below.');
    }, 1500);
  };

  const handleVideoUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !videoTitle || !videoUrl) return;
    if (!rightsConfirmed) return alert('You must confirm content rights to upload.');

    try {
      // Create Video Record
      const newVideo = await dbClient.createVideo({
        creator_id: user.id,
        title: videoTitle,
        description: videoDesc,
        video_url: videoUrl,
        thumbnail_url: videoThumbnail,
        content_type: videoType,
        language: videoLang,
        genre: videoGenre,
        duration_seconds: videoType === 'short' ? 30 : 180,
        visibility: 'public',
        status: publishStatus,
        rights_type: 'creator_licensed',
        rights_confirmed: true,
        ai_summary: aiAnalysisResult?.summary || 'Standard visual upload.',
        ai_tags: videoTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        published_at: publishStatus === 'published' ? new Date().toISOString() : null
      });

      // Series ep attachment
      if (videoType === 'episode' && assocSeriesId) {
        // Fetch seasons for series
        const seasons = await dbClient.getSeasons(assocSeriesId);
        let seasonId = assocSeasonId;
        if (seasons.length === 0) {
          // Auto create season 1 if missing
          const s1 = await dbClient.addSeason(assocSeriesId, 1, 'Season 1', 'First Season');
          seasonId = s1.id;
        } else if (!seasonId) {
          seasonId = seasons[0].id;
        }
        await dbClient.addEpisode(seasonId, newVideo.id, assocEpisodeNum, videoTitle);
      }

      alert('Video successfully published!');
      
      // Reset form & reload lists
      setVideoTitle('');
      setVideoDesc('');
      setUploadStep(1);
      setActiveSubTab('uploads');
      loadCreatorLists();
    } catch (err) {
      console.error(err);
      alert('Error publishing video.');
    }
  };

  const handleCreateSeriesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !seriesTitle) return;

    try {
      const newSeries = await dbClient.createSeries({
        creator_id: user.id,
        title: seriesTitle,
        description: seriesDesc,
        cover_url: seriesCover,
        language: seriesLang,
        genre: seriesGenre,
        status: 'published'
      });

      // Auto create season 1
      await dbClient.addSeason(newSeries.id, 1, 'Season 1', 'Season 1 Episodes');

      alert('Series successfully created! You can now link upload episodes.');
      
      // Reset & route
      setSeriesTitle('');
      setSeriesDesc('');
      setActiveSubTab('series');
      loadCreatorLists();
    } catch (e) {
      console.error(e);
      alert('Error creating series.');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This cannot be undone.')) return;
    try {
      await dbClient.deleteVideo(videoId);
      loadCreatorLists();
    } catch (e) {
      console.error(e);
    }
  };

  // RENDER: ONBOARDING REGISTER PANEL IF PROFILE NOT CREATED YET
  if (!creatorProfile) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 text-slate-100">
        <div className="w-full max-w-md bg-bg-surface border border-border-dark rounded-3xl p-8 text-center animate-slide-up">
          <div className="w-14 h-14 rounded-2xl bg-accent-rose/10 text-accent-rose flex items-center justify-center mx-auto mb-6">
            <VideoIcon className="w-7 h-7" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">Start Publishing Stories</h2>
          <p className="text-xs text-text-secondary leading-relaxed mb-6">
            Create your creator profile to unlock the OpenDrama studio. Upload shorts, group episodes, track views, and access Gemini visual analysis.
          </p>

          <form onSubmit={handleCreateCreatorProfile} className="space-y-4">
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Studio/Creator name"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm text-center"
              required
            />
            <button
              type="submit"
              disabled={onboardingLoading}
              className="w-full py-3 bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-semibold rounded-xl hover:opacity-95 shadow-md shadow-accent-rose/15 transition-opacity"
            >
              {onboardingLoading ? 'Registering Studio...' : 'Activate Studio Channel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark pb-24 text-slate-100 p-6 animate-fade-in">
      {/* Creator Header banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-dark/60 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-white leading-none">{creatorProfile.creator_name}</h1>
            {creatorProfile.is_verified && (
              <span className="bg-accent-rose text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><ShieldCheck className="w-3 h-3" />Verified</span>
            )}
          </div>
          <p className="text-xs text-text-secondary">OpenDrama Studio Dashboard</p>
        </div>

        {/* Action Toggles */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pr-2 pb-2 md:pb-0">
          <button
            onClick={() => setActiveSubTab('new_upload')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeSubTab === 'new_upload'
                ? 'bg-accent-rose text-white shadow-lg shadow-accent-rose/25'
                : 'bg-bg-surface border border-border-dark text-text-secondary hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Upload Video</span>
          </button>
          <button
            onClick={() => setActiveSubTab('new_series')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeSubTab === 'new_series'
                ? 'bg-accent-rose text-white shadow-lg'
                : 'bg-bg-surface border border-border-dark text-text-secondary hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Series</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-dark mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-4 py-3 text-xs font-bold tracking-wide border-b-2 transition-all flex items-center gap-1.5 flex-shrink-0 ${
            activeSubTab === 'analytics' ? 'border-accent-rose text-accent-rose' : 'border-transparent text-text-secondary hover:text-white'
          }`}
        >
          <BarChart2 className="w-4.5 h-4.5" />
          <span>Analytics</span>
        </button>
        <button
          onClick={() => setActiveSubTab('uploads')}
          className={`px-4 py-3 text-xs font-bold tracking-wide border-b-2 transition-all flex items-center gap-1.5 flex-shrink-0 ${
            activeSubTab === 'uploads' ? 'border-accent-rose text-accent-rose' : 'border-transparent text-text-secondary hover:text-white'
          }`}
        >
          <VideoIcon className="w-4.5 h-4.5" />
          <span>My Videos ({myVideos.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('series')}
          className={`px-4 py-3 text-xs font-bold tracking-wide border-b-2 transition-all flex items-center gap-1.5 flex-shrink-0 ${
            activeSubTab === 'series' ? 'border-accent-rose text-accent-rose' : 'border-transparent text-text-secondary hover:text-white'
          }`}
        >
          <Film className="w-4.5 h-4.5" />
          <span>Series ({mySeries.length})</span>
        </button>
      </div>

      {/* PANEL 1: ANALYTICS PANEL */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* Metrics summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-surface border border-border-dark p-5 rounded-2xl">
              <span className="block text-[10px] uppercase font-extrabold tracking-wider text-text-muted mb-1">Total Views</span>
              <span className="text-2xl font-extrabold text-white">{analytics.views.toLocaleString()}</span>
            </div>
            <div className="bg-bg-surface border border-border-dark p-5 rounded-2xl">
              <span className="block text-[10px] uppercase font-extrabold tracking-wider text-text-muted mb-1">Watch Time</span>
              <span className="text-2xl font-extrabold text-white">{analytics.watchTimeMin.toLocaleString()}m</span>
            </div>
            <div className="bg-bg-surface border border-border-dark p-5 rounded-2xl">
              <span className="block text-[10px] uppercase font-extrabold tracking-wider text-text-muted mb-1">Total Likes</span>
              <span className="text-2xl font-extrabold text-white">{analytics.likes.toLocaleString()}</span>
            </div>
            <div className="bg-bg-surface border border-border-dark p-5 rounded-2xl">
              <span className="block text-[10px] uppercase font-extrabold tracking-wider text-text-muted mb-1">Followers</span>
              <span className="text-2xl font-extrabold text-white">{creatorProfile.followers_count}</span>
            </div>
          </div>

          {/* Retention graph card placeholder */}
          <div className="bg-bg-surface border border-border-dark rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4">Audience Retention Score</h3>
            <div className="h-44 flex items-end justify-between gap-1 pt-6 border-b border-border-dark">
              {[80, 75, 71, 68, 62, 59, 58, 55, 54, 52, 51, 48].map((pct, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] text-accent-rose font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {pct}%
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-accent-rose/40 to-accent-rose rounded-t-sm transition-all group-hover:to-accent-purple"
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-[9px] text-text-muted font-mono mb-1">{idx * 5}s</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-text-secondary">
              <AlertCircle className="w-4 h-4 text-accent-rose" />
              <span>Completion rate peaks at <strong className="text-white">68%</strong> within the first 15 seconds.</span>
            </div>
          </div>
        </div>
      )}

      {/* PANEL 2: MY VIDEOS LIST */}
      {activeSubTab === 'uploads' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-bg-surface border border-border-dark rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-dark text-text-muted uppercase font-extrabold tracking-wider bg-bg-card">
                  <th className="p-4">Title / Video</th>
                  <th className="p-4">Format</th>
                  <th className="p-4">Genre</th>
                  <th className="p-4 text-right">Views</th>
                  <th className="p-4 text-right">Likes</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {myVideos.map((vid) => (
                  <tr key={vid.id} className="hover:bg-bg-card/50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={vid.thumbnail_url || ''} alt="" className="w-12 h-8 object-cover rounded bg-bg-card" />
                      <div>
                        <p className="font-bold text-white line-clamp-1">{vid.title}</p>
                        <p className="text-[9px] text-text-muted">{new Date(vid.created_at).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="p-4 uppercase text-text-secondary font-semibold">{vid.content_type}</td>
                    <td className="p-4 text-text-secondary">{vid.genre}</td>
                    <td className="p-4 text-right font-semibold text-white">{vid.view_count}</td>
                    <td className="p-4 text-right text-text-secondary">{vid.like_count}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteVideo(vid.id)}
                        className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {myVideos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-secondary">
                      No video uploads published. Click "Upload Video" to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PANEL 3: SERIES MANAGER */}
      {activeSubTab === 'series' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mySeries.map((series) => (
            <div key={series.id} className="bg-bg-surface border border-border-dark rounded-2xl p-4 flex gap-4">
              <img src={series.cover_url || ''} alt="" className="w-20 h-24 object-cover rounded-xl bg-bg-card flex-shrink-0" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{series.title}</h4>
                  <p className="text-xs text-text-muted mb-1">Genre: {series.genre}</p>
                  <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed font-light">{series.description}</p>
                </div>
                
                <span className="text-[9px] uppercase tracking-wider text-accent-rose font-bold block mt-2">
                  Season 1 active
                </span>
              </div>
            </div>
          ))}
          {mySeries.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary bg-bg-surface border border-dashed border-border-dark rounded-2xl">
              No episodic series set up. Click "Create Series" to build dynamic show playlists.
            </div>
          )}
        </div>
      )}

      {/* PANEL 4: UPLOAD VIDEO WIZARD */}
      {activeSubTab === 'new_upload' && (
        <div className="max-w-2xl mx-auto bg-bg-surface border border-border-dark rounded-3xl p-6 shadow-xl animate-fade-in">
          {/* Upload Wizard Header Tracker */}
          <div className="flex items-center justify-between border-b border-border-dark pb-4 mb-6">
            <h3 className="font-bold text-white text-md">Publish New Video</h3>
            <span className="text-xs text-text-muted">Step {uploadStep} of 4</span>
          </div>

          <form onSubmit={handleVideoUploadSubmit} className="space-y-6">
            {uploadStep === 1 && (
              /* Step 1: Video File Selection */
              <div className="space-y-4 text-center">
                <div className="border-2 border-dashed border-border-dark rounded-2xl py-12 px-6 bg-bg-card/30 flex flex-col items-center gap-3">
                  <div className="p-4 rounded-full bg-accent-rose/10 text-accent-rose">
                    <UploadCloud className="w-8 h-8 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Select Video File</p>
                    <p className="text-[10px] text-text-muted mt-0.5">MP4 formats supported. Vertical aspect ratios recommended.</p>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Simulated Source URL</label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white focus:outline-none focus:border-accent-rose"
                    placeholder="Enter raw video mp4 url"
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-waves-breaking-on-the-shore-from-above-1416-large.mp4')}
                      className="px-2 py-1 rounded bg-bg-card text-[9px] text-text-secondary hover:text-white border border-border-dark"
                    >
                      Preset: Ocean Vertical
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4')}
                      className="px-2 py-1 rounded bg-bg-card text-[9px] text-text-secondary hover:text-white border border-border-dark"
                    >
                      Preset: Forest Horizontal
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setUploadStep(2)}
                  className="w-full py-3 bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {uploadStep === 2 && (
              /* Step 2: Metadata and Gemini Analysis */
              <div className="space-y-4">
                {/* AI Assistant button */}
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-accent-rose/10 to-accent-purple/10 border border-accent-rose/20 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-accent-rose animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-white">Gemini Metadata Assistant</p>
                      <p className="text-[10px] text-text-secondary">AI can auto-generate cinematic summaries, genres, and tag recommendations.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={triggerAiEnrichment}
                    disabled={aiGenerating}
                    className="px-4 py-2 bg-gradient-to-r from-accent-rose to-accent-purple text-white font-bold rounded-lg text-[10px] shadow flex items-center gap-1"
                  >
                    {aiGenerating ? 'Analyzing...' : 'Enrich with Gemini'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Title</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
                    placeholder="E.g. The Call"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Description</label>
                  <textarea
                    value={videoDesc}
                    onChange={(e) => setVideoDesc(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white resize-none"
                    placeholder="Provide a short synopsis..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Format</label>
                    <select
                      value={videoType}
                      onChange={(e) => setVideoType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
                    >
                      <option value="short">Vertical Short</option>
                      <option value="episode">Series Episode</option>
                      <option value="short_film">Short Film</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Genre</label>
                    <select
                      value={videoGenre}
                      onChange={(e) => setVideoGenre(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
                    >
                      {genresList.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Language</label>
                    <select
                      value={videoLang}
                      onChange={(e) => setVideoLang(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="te">Telugu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Tags (Comma Separated)</label>
                    <input
                      type="text"
                      value={videoTags}
                      onChange={(e) => setVideoTags(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
                      placeholder="neon, thriller, rain"
                    />
                  </div>
                </div>

                {/* Conditional Series select */}
                {videoType === 'episode' && (
                  <div className="p-4 rounded-2xl bg-bg-card border border-border-dark space-y-3">
                    <p className="text-xs font-bold text-white">Series Link Details</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-[10px] text-text-secondary mb-1">Select Series</label>
                        <select
                          value={assocSeriesId}
                          onChange={(e) => setAssocSeriesId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-dark text-xs text-white"
                          required
                        >
                          <option value="">-- Choose Series --</option>
                          {mySeries.map(s => (
                            <option key={s.id} value={s.id}>{s.title}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-text-secondary mb-1">Episode Number</label>
                        <input
                          type="number"
                          min={1}
                          value={assocEpisodeNum}
                          onChange={(e) => setAssocEpisodeNum(parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 rounded-xl bg-bg-surface border border-border-dark text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setUploadStep(1)}
                    className="flex-1 py-3 bg-bg-card border border-border-dark text-xs text-text-secondary rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadStep(3)}
                    className="flex-1 py-3 bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-semibold rounded-xl"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {uploadStep === 3 && (
              /* Step 3: Thumbnail & Rights */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-2">Select Cover Thumbnail</label>
                  <div className="flex gap-4 items-start">
                    <img src={videoThumbnail} alt="" className="w-28 h-20 object-cover rounded-xl border border-border-dark bg-bg-card" />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={videoThumbnail}
                        onChange={(e) => setVideoThumbnail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
                        placeholder="Image URL"
                      />
                      <button
                        type="button"
                        onClick={() => setVideoThumbnail(`https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 5000000)}?auto=format&fit=crop&w=400&h=250&q=80`)}
                        className="px-3 py-1.5 rounded-lg bg-bg-card border border-border-dark text-[10px] text-text-secondary hover:text-white"
                      >
                        Randomize Cover
                      </button>
                    </div>
                  </div>
                </div>

                {/* Rights declaration checkbox */}
                <div className="p-4 rounded-2xl bg-bg-card/45 border border-border-dark/60 mt-4 space-y-3">
                  <p className="text-xs font-bold text-white">Rights Confirmation</p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rightsConfirmed}
                      onChange={(e) => setRightsConfirmed(e.target.checked)}
                      className="mt-1 accent-accent-rose h-4 w-4 bg-bg-surface border-border-dark rounded"
                    />
                    <span className="text-[11px] text-text-secondary leading-relaxed">
                      I confirm that I own this content or have explicit written authorization from the copyright holder to distribute it on OpenDrama.
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setUploadStep(2)}
                    className="flex-1 py-3 bg-bg-card border border-border-dark text-xs text-text-secondary rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadStep(4)}
                    className="flex-1 py-3 bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-semibold rounded-xl"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {uploadStep === 4 && (
              /* Step 4: Publish Status & Finalize */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-bg-card border border-border-dark text-center">
                  <Check className="w-8 h-8 text-green-400 mx-auto mb-3 animate-ping" />
                  <p className="text-sm font-bold text-white">All Set!</p>
                  <p className="text-[11px] text-text-muted mt-1">Specify your final visibility settings below to publish.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Status</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPublishStatus('published')}
                      className={`flex-1 py-3.5 rounded-xl border text-xs font-semibold transition-all ${
                        publishStatus === 'published'
                          ? 'bg-accent-rose/25 border-accent-rose text-accent-rose'
                          : 'bg-bg-card border-border-dark text-text-secondary hover:text-white'
                      }`}
                    >
                      Publish Publicly
                    </button>
                    <button
                      type="button"
                      onClick={() => setPublishStatus('draft')}
                      className={`flex-1 py-3.5 rounded-xl border text-xs font-semibold transition-all ${
                        publishStatus === 'draft'
                          ? 'bg-accent-rose/25 border-accent-rose text-accent-rose'
                          : 'bg-bg-card border-border-dark text-text-secondary hover:text-white'
                      }`}
                    >
                      Save as Draft
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setUploadStep(3)}
                    className="flex-1 py-3 bg-bg-card border border-border-dark text-xs text-text-secondary rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-bold rounded-xl"
                  >
                    Publish Video
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* PANEL 5: NEW SERIES BUILDER */}
      {activeSubTab === 'new_series' && (
        <div className="max-w-xl mx-auto bg-bg-surface border border-border-dark rounded-3xl p-6 shadow-xl animate-fade-in">
          <h3 className="font-bold text-white text-md border-b border-border-dark pb-3 mb-5">Create New Episodic Series</h3>
          
          <form onSubmit={handleCreateSeriesSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Series Title</label>
              <input
                type="text"
                value={seriesTitle}
                onChange={(e) => setSeriesTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
                placeholder="E.g. The Last Message"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Description</label>
              <textarea
                value={seriesDesc}
                onChange={(e) => setSeriesDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white resize-none"
                placeholder="Provide a detailed storyline summary..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Cover Image URL</label>
              <input
                type="text"
                value={seriesCover}
                onChange={(e) => setSeriesCover(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Genre</label>
                <select
                  value={seriesGenre}
                  onChange={(e) => setSeriesGenre(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
                >
                  {genresList.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Language</label>
                <select
                  value={seriesLang}
                  onChange={(e) => setSeriesLang(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="te">Telugu</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-bold rounded-xl shadow-lg mt-4"
            >
              Build Series Playlist
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default Create;
