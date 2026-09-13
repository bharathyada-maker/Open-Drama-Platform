import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { dbClient } from './lib/dbClient';
import { initializeLocalDb } from './lib/localDb';
import { Video } from './types/schema';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Create from './pages/Create';
import Saved from './pages/Saved';
import Notifications from './pages/Notifications';
import Admin from './pages/Admin';
import SeriesDetail from './pages/SeriesDetail';
import ProfilePage from './pages/Profile';
import DramaHub from './pages/DramaHub';
import Comments from './components/Comments';
import { VerticalFeed } from './components/VerticalFeed';
import { Film, Users, Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  
  // Tab Routing States
  const [currentTab, setTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Detail navigation states
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [detailBackTab, setDetailBackTab] = useState<string>('home');

  // Multi-video player playlist sequencing
  const [activePlayId, setActivePlayId] = useState<string | null>(null);
  const [playlistVideoIds, setPlaylistVideoIds] = useState<string[]>([]);
  const [playlistVideos, setPlaylistVideos] = useState<Video[]>([]);

  // Comments drawer state
  const [activeCommentsVideoId, setActiveCommentsVideoId] = useState<string | null>(null);

  // Social Following Feed
  const [followingVideos, setFollowingVideos] = useState<Video[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  // Guarantee clean local database initialization on app mount
  useEffect(() => {
    initializeLocalDb();
  }, []);

  // Fetch following videos when on Following tab
  useEffect(() => {
    if (currentTab === 'following' && user) {
      const loadFollowing = async () => {
        setLoadingFollowing(true);
        try {
          const follows = await dbClient.getFollows();
          const followedCreatorUserIds = follows
            .filter(f => f.follower_id === user.id)
            .map(f => f.following_id);
          
          const vids = await dbClient.getVideos();
          const mine = vids.filter(v => followedCreatorUserIds.includes(v.creator_id) && v.status === 'published');
          setFollowingVideos(mine);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingFollowing(false);
        }
      };
      loadFollowing();
    }
  }, [currentTab, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-accent-rose animate-spin" />
        <span className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Loading OpenDrama...</span>
      </div>
    );
  }

  // Auth Protection redirect Gate
  if (!user) {
    return <Auth />;
  }

  const handleVideoSelect = (videoId: string, playlistIds: string[] = []) => {
    setActivePlayId(videoId);
    dbClient.getVideos().then(allVideos => {
      const published = allVideos.filter(v => v.status === 'published');
      let feedList: Video[] = [];

      if (playlistIds && playlistIds.length > 1) {
        // Multi-item playlist specified (e.g., from series episodes)
        feedList = playlistIds
          .map(id => published.find(item => item.id === id))
          .filter(Boolean) as Video[];
      }

      // If playlist is empty or has only 1 item, expand to all published videos with clicked video prioritized first
      if (feedList.length <= 1) {
        const selected = published.find(v => v.id === videoId);
        if (selected) {
          const others = published.filter(v => v.id !== videoId);
          feedList = [selected, ...others];
        } else {
          feedList = published;
        }
      }

      setPlaylistVideoIds(feedList.map(v => v.id));
      setPlaylistVideos(feedList);
      setTab('play_feed');
    });
  };

  const handleCreatorSelect = (creatorUserId: string) => {
    setSelectedCreatorId(creatorUserId);
    setDetailBackTab(currentTab);
    setTab('creator-detail');
  };

  const handleSeriesSelect = (seriesId: string) => {
    setSelectedSeriesId(seriesId);
    setDetailBackTab(currentTab);
    setTab('series-detail');
  };

  const handleSearchTrigger = (query: string) => {
    setSearchQuery(query);
    setTab('discover');
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'home':
        return (
          <Home
            setTab={setTab}
            onVideoSelect={handleVideoSelect}
            onCreatorSelect={handleCreatorSelect}
            onSeriesSelect={handleSeriesSelect}
            onCommentsClick={setActiveCommentsVideoId}
            onGenreSelect={(genre) => {
              setSearchQuery(genre);
              setTab('discover');
            }}
          />
        );
      case 'drama-hub':
        return (
          <DramaHub
            setTab={setTab}
            onVideoSelect={handleVideoSelect}
            onCreatorSelect={handleCreatorSelect}
            onGenreSelect={(genre) => {
              setSearchQuery(genre);
              setTab('discover');
            }}
          />
        );
      case 'discover':
        return (
          <Discover
            initialSearchQuery={searchQuery}
            setTab={setTab}
            onVideoSelect={handleVideoSelect}
            onCreatorSelect={handleCreatorSelect}
            onSeriesSelect={handleSeriesSelect}
          />
        );
      case 'create':
        return <Create />;
      case 'following':
        return (
          <div className="h-full">
            {loadingFollowing ? (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-accent-rose animate-spin" />
              </div>
            ) : followingVideos.length > 0 ? (
              <VerticalFeed
                videos={followingVideos}
                onCommentsClick={setActiveCommentsVideoId}
                onCreatorClick={handleCreatorSelect}
              />
            ) : (
              <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-6 text-center text-text-secondary" style={{ height: 'calc(100vh - 64px)' }}>
                <div className="w-14 h-14 rounded-full bg-bg-surface flex items-center justify-center mb-4 border border-border-dark">
                  <Users className="w-6 h-6 text-text-muted" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">No followed activity</h3>
                <p className="text-xs max-w-xs leading-relaxed">
                  Start following creators on the discover page or home feed to populate your personal channel.
                </p>
                <button
                  onClick={() => setTab('discover')}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-semibold rounded-xl"
                >
                  Explore Creators
                </button>
              </div>
            )}
          </div>
        );
      case 'saved':
        return <Saved onVideoSelect={handleVideoSelect} onSeriesSelect={handleSeriesSelect} />;
      case 'notifications':
        return <Notifications />;
      case 'admin':
        return <Admin />;
      case 'profile':
        return (
          <ProfilePage
            userId={user.id}
            onVideoSelect={handleVideoSelect}
            onSeriesSelect={handleSeriesSelect}
          />
        );
      
      // Dynamic details views
      case 'series-detail':
        return selectedSeriesId ? (
          <SeriesDetail
            seriesId={selectedSeriesId}
            onBack={() => setTab(detailBackTab)}
            onEpisodeSelect={handleVideoSelect}
            onCreatorSelect={handleCreatorSelect}
          />
        ) : null;
      case 'creator-detail':
        return selectedCreatorId ? (
          <ProfilePage
            userId={selectedCreatorId}
            onVideoSelect={handleVideoSelect}
            onSeriesSelect={handleSeriesSelect}
            onBack={() => setTab(detailBackTab)}
          />
        ) : null;

      // Fullscreen snap vertical playlist player
      case 'play_feed':
        return (
          <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] w-full">
            <VerticalFeed
              videos={playlistVideos}
              initialVideoId={activePlayId}
              onCommentsClick={setActiveCommentsVideoId}
              onCreatorClick={handleCreatorSelect}
            />
          </div>
        );
      default:
        return <Home setTab={setTab} onVideoSelect={handleVideoSelect} onCreatorSelect={handleCreatorSelect} onSeriesSelect={handleSeriesSelect} onCommentsClick={setActiveCommentsVideoId} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col md:pl-64">
      {/* Top navbar Header */}
      <Header setTab={setTab} onSearch={handleSearchTrigger} />

      {/* Navigation bars (Left Sidebar / Mobile Bottom tabs) */}
      <Navigation currentTab={currentTab} setTab={setTab} notificationsCount={1} />

      {/* Central Viewport main grid wrapper */}
      <main className="flex-1 w-full bg-bg-dark relative">
        {renderActiveTab()}
      </main>

      {/* Slide-over Comments drawer overlay */}
      {activeCommentsVideoId && (
        <Comments
          videoId={activeCommentsVideoId}
          onClose={() => setActiveCommentsVideoId(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
