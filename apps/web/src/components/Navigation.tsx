import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Home, Compass, PlusCircle, Users, Bookmark, Bell, Shield, LogOut, User, Sparkles } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  setTab: (tab: string) => void;
  notificationsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab, notificationsCount }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.is_admin || false;

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'drama-hub', label: 'Drama Hub', icon: Sparkles },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'create', label: 'Create Hub', icon: PlusCircle },
    { id: 'following', label: 'Following', icon: Users },
    { id: 'saved', label: 'Watchlist', icon: Bookmark },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notificationsCount },
    ...(isAdmin ? [{ id: 'admin', label: 'Moderation', icon: Shield }] : []),
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 h-screen bg-bg-surface border-r border-border-dark py-6 px-4 z-20">
        {/* Logo */}
        <div className="flex items-center gap-3 px-3 mb-8 cursor-pointer" onClick={() => setTab('home')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-rose to-accent-purple flex items-center justify-center shadow-lg shadow-accent-rose/10">
            <span className="text-white font-extrabold text-lg">OD</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">OpenDrama</span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-rose/20 to-accent-purple/10 border-l-4 border-accent-rose text-accent-rose'
                    : 'text-text-secondary hover:bg-bg-card hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-accent-rose' : 'text-text-muted'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="bg-accent-rose text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        {user && (
          <div className="border-t border-border-dark pt-4 mt-auto">
            <div className="flex items-center gap-3 px-2 mb-3">
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={user.display_name || user.username}
                className="w-10 h-10 rounded-xl bg-bg-card border border-border-dark p-1"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.display_name || user.username}</p>
                <p className="text-xs text-text-muted truncate">@{user.username}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* MOBILE BOTTOM NAVIGATION TAB BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-bg-surface/90 backdrop-blur-md border-t border-border-dark px-2 py-1.5 flex items-center justify-around z-30 shadow-lg">
        {/* We map a subset of tabs for space restrictions: Home, Discover, Create, Following, Profile */}
        {navItems
          .filter(item => ['home', 'drama-hub', 'discover', 'create', 'profile'].includes(item.id))
          .map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
                  isActive ? 'text-accent-rose' : 'text-text-secondary hover:text-white'
                }`}
              >
                <Icon className="w-5.5 h-5.5" />
                <span className="text-[10px] font-semibold">{item.label.split(' ')[0]}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-0.5 right-2 bg-accent-rose text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
      </nav>
    </>
  );
};
export default Navigation;
