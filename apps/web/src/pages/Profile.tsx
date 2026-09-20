import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dbClient } from '../lib/dbClient';
import { Video, Series } from '../types/schema';
import { testRunner, TestCaseResult } from '../lib/testRunner';
import { User, Settings, ShieldCheck, Heart, Eye, Play, Sparkles, Loader2 } from 'lucide-react';
import { resolveMediaUrl, handleImageError, DEFAULT_THUMBNAIL } from '../lib/mediaUtils';

interface ProfileProps {
  userId: string;
  onVideoSelect: (videoId: string) => void;
  onSeriesSelect?: (seriesId: string) => void;
  onBack?: () => void;
}

export const ProfilePage: React.FC<ProfileProps> = ({ userId, onVideoSelect, onSeriesSelect, onBack }) => {
  const { user: currentUser, creatorProfile: currentCreator, updateUser } = useAuth();
  
  // States for target profile
  const [profile, setProfile] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'uploads' | 'series' | 'settings' | 'tests'>('uploads');

  // Edit fields
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [lang, setLang] = useState('en');

  // Test suite states
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const rawProfiles = JSON.parse(localStorage.getItem('opendrama_db_profiles') || '[]');
        const targetProfile = rawProfiles.find((p: any) => p.id === userId);
        setProfile(targetProfile);

        if (targetProfile) {
          setDisplayName(targetProfile.display_name || '');
          setBio(targetProfile.bio || '');
          setLang(targetProfile.preferred_language || 'en');

          // Creator profile check
          const rawCreators = JSON.parse(localStorage.getItem('opendrama_db_creator_profiles') || '[]');
          const targetCreator = rawCreators.find((c: any) => c.user_id === targetProfile.id);
          setCreator(targetCreator);

          // Fetch uploads
          const allVids = await dbClient.getVideos();
          setVideos(allVids.filter(v => v.creator_id === targetProfile.id && v.status === 'published'));

          // Fetch series playlists
          const allSeries = await dbClient.getSeries();
          setSeriesList(allSeries.filter(s => s.creator_id === targetProfile.id));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [userId, currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        display_name: displayName,
        bio,
        preferred_language: lang
      });
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile settings.');
    }
  };

  const handleRunSystemTests = async () => {
    setTesting(true);
    setTestResults([]);
    try {
      const results = await testRunner.runSuite();
      setTestResults(results);
    } catch (e) {
      alert('Error running automated suite.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-rose animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-bg-dark text-center py-20">
        <p className="text-text-secondary text-xs">Profile not found.</p>
        {onBack && <button onClick={onBack} className="mt-4 px-4 py-2 bg-accent-rose text-white text-xs font-semibold rounded-xl">Go Back</button>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-slate-100 pb-24 p-6 animate-fade-in max-w-4xl mx-auto">
      {/* Back button */}
      {onBack && (
        <button onClick={onBack} className="mb-4 text-xs text-text-secondary hover:text-white font-semibold transition-colors">
          &larr; Back
        </button>
      )}

      {/* Profile Card Summary Header */}
      <div className="bg-bg-surface border border-border-dark rounded-3xl p-6 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 mb-8 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent-rose/5 blur-3xl pointer-events-none" />
        
        <img
          src={resolveMediaUrl(profile.avatar_url) || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`}
          alt=""
          onError={handleImageError}
          className="w-20 h-20 rounded-2xl bg-bg-card border border-border-dark p-1 object-cover"
        />

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2 justify-center md:justify-start">
            <h2 className="text-xl font-extrabold text-white leading-none">{profile.display_name || profile.username}</h2>
            <span className="text-xs text-text-muted">@{profile.username}</span>
            {creator?.is_verified && (
              <span className="bg-accent-rose/10 border border-accent-rose/25 text-accent-rose text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 w-fit mx-auto md:mx-0">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Creator
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-light leading-relaxed mb-4 max-w-md">
            {profile.bio || 'This user has not set a bio yet.'}
          </p>

          {/* Social Stats if Creator */}
          {creator && (
            <div className="flex gap-6 justify-center md:justify-start text-xs border-t border-border-dark/40 pt-4 w-full">
              <div>
                <span className="block font-bold text-white text-md">{creator.followers_count}</span>
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Followers</span>
              </div>
              <div>
                <span className="block font-bold text-white text-md">{creator.total_views.toLocaleString()}</span>
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Total views</span>
              </div>
              <div>
                <span className="block font-bold text-white text-md">{videos.length}</span>
                <span className="text-[10px] text-text-secondary uppercase font-semibold">Videos</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-dark mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('uploads')}
          className={`px-4 py-3 text-xs font-bold tracking-wide border-b-2 transition-all flex-shrink-0 ${
            activeTab === 'uploads' ? 'border-accent-rose text-accent-rose' : 'border-transparent text-text-secondary hover:text-white'
          }`}
        >
          {creator ? 'Creator Uploads' : 'Public Videos'}
        </button>
        {creator && (
          <button
            onClick={() => setActiveTab('series')}
            className={`px-4 py-3 text-xs font-bold tracking-wide border-b-2 transition-all flex-shrink-0 ${
              activeTab === 'series' ? 'border-accent-rose text-accent-rose' : 'border-transparent text-text-secondary hover:text-white'
            }`}
          >
            Series ({seriesList.length})
          </button>
        )}
        {isOwnProfile && (
          <>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 text-xs font-bold tracking-wide border-b-2 transition-all flex-shrink-0 ${
                activeTab === 'settings' ? 'border-accent-rose text-accent-rose' : 'border-transparent text-text-secondary hover:text-white'
              }`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-4 py-3 text-xs font-bold tracking-wide border-b-2 transition-all flex-shrink-0 ${
                activeTab === 'tests' ? 'border-accent-rose text-accent-rose' : 'border-transparent text-text-secondary hover:text-white'
              }`}
            >
              Developer Tests
            </button>
          </>
        )}
      </div>

      {/* TAB 1: CREATOR UPLOADS */}
      {activeTab === 'uploads' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {videos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => onVideoSelect(vid.id)}
              className="bg-bg-surface border border-border-dark/60 rounded-2xl overflow-hidden hover:border-slate-500 transition-all cursor-pointer group shadow-sm flex flex-col h-full"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img src={resolveMediaUrl(vid.thumbnail_url) || DEFAULT_THUMBNAIL} alt="" onError={handleImageError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute bottom-1 right-1.5 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono text-slate-100 border border-white/5">
                  {Math.floor(vid.duration_seconds / 60)}:{(vid.duration_seconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <h4 className="text-xs font-bold text-white line-clamp-1 leading-snug">{vid.title}</h4>
                <div className="flex items-center gap-3 text-[10px] text-text-muted mt-2 border-t border-border-dark/30 pt-2">
                  <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{vid.view_count}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{vid.like_count}</span>
                </div>
              </div>
            </div>
          ))}
          {videos.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary bg-bg-surface border border-dashed border-border-dark rounded-2xl text-xs">
              This creator has no public uploads published.
            </div>
          )}
        </div>
      )}

      {/* TAB 1.5: SERIES & PLAYLISTS */}
      {activeTab === 'series' && creator && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {seriesList.map((series) => (
            <div
              key={series.id}
              onClick={() => onSeriesSelect && onSeriesSelect(series.id)}
              className="bg-bg-surface border border-border-dark/60 rounded-2xl p-4 flex gap-4 hover:border-slate-500 transition-all cursor-pointer group"
            >
              <img src={resolveMediaUrl(series.cover_url) || DEFAULT_THUMBNAIL} alt="" onError={handleImageError} className="w-16 h-20 object-cover rounded-xl bg-bg-card flex-shrink-0" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs line-clamp-1 leading-snug group-hover:text-accent-rose transition-colors">{series.title}</h4>
                  <p className="text-[10px] text-text-muted mt-0.5">Genre: {series.genre}</p>
                  <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed mt-1 font-light">{series.description}</p>
                </div>
              </div>
            </div>
          ))}
          {seriesList.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-secondary bg-bg-surface border border-dashed border-border-dark rounded-2xl text-xs">
              This creator has not created any series playlist yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE SETTINGS */}
      {activeTab === 'settings' && isOwnProfile && (
        <div className="bg-bg-surface border border-border-dark rounded-3xl p-6 max-w-lg mx-auto">
          <h3 className="font-bold text-white text-md border-b border-border-dark pb-3 mb-5">Edit Profile Info</h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">Preferred Language</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-bg-card border border-border-dark text-xs text-white"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-semibold rounded-xl shadow-lg mt-4"
            >
              Save Profile Updates
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: DEVELOPER TESTS RUNNER */}
      {activeTab === 'tests' && isOwnProfile && (
        <div className="bg-bg-surface border border-border-dark rounded-3xl p-6 max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-border-dark pb-3">
            <div>
              <h3 className="font-bold text-white text-md">System Health Tests</h3>
              <p className="text-[10px] text-text-muted mt-0.5">Executes local suite checking Database inserts, RLS bounds, and Social queries.</p>
            </div>
            <button
              onClick={handleRunSystemTests}
              disabled={testing}
              className="px-4 py-2 bg-gradient-to-r from-accent-rose to-accent-purple text-white font-bold rounded-xl text-xs flex items-center gap-1.5 hover:opacity-95"
            >
              {testing ? 'Running Suite...' : 'Run Diagnostics'}
            </button>
          </div>

          <div className="space-y-2">
            {testResults.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-bg-card border border-border-dark text-xs">
                <span className="font-semibold text-white">{t.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold ${t.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {t.passed ? 'PASSED' : 'FAILED'}
                  </span>
                  <span className="text-[9px] text-text-muted font-light">{t.message}</span>
                </div>
              </div>
            ))}

            {testResults.length === 0 && !testing && (
              <div className="py-8 text-center text-xs text-text-muted border border-dashed border-border-dark rounded-xl">
                System tests have not been executed. Click "Run Diagnostics" to verify mock APIs.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfilePage;
