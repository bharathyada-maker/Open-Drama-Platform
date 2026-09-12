import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Search, Film, Bell, Plus, Shield, LogOut, Sparkles } from 'lucide-react';

interface HeaderProps {
  setTab: (tab: string) => void;
  onSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ setTab, onSearch }) => {
  const { user, logout } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
    setTab('discover');
  };

  return (
    <header className="h-16 border-b border-border-dark bg-bg-dark/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10 w-full">
      {/* Mobile Brand Name */}
      <div className="flex items-center gap-2 md:hidden cursor-pointer" onClick={() => setTab('home')}>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-accent-rose to-accent-purple flex items-center justify-center">
          <Film className="w-4 h-4 text-white" />
        </div>
        <span className="text-md font-bold text-white tracking-tight">OpenDrama</span>
      </div>

      {/* Desktop Search */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex relative w-96">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search stories, creators or series..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-surface border border-border-dark text-sm text-white placeholder-text-muted focus:outline-none focus:border-accent-rose focus:ring-1 focus:ring-accent-rose/25 transition-all"
        />
      </form>

      {/* Top right buttons */}
      <div className="flex items-center gap-3">
        {/* Drama Hub Quick Link */}
        <button
          onClick={() => setTab('drama-hub')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-purple-500/10 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all hover:scale-105"
          title="Open Drama Hub - Love, Action, Comedy"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-rose" />
          <span className="hidden sm:inline">Drama Hub</span>
        </button>

        {/* Upload Shortcut */}
        <button
          onClick={() => setTab('create')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-semibold shadow-md shadow-accent-rose/10 hover:opacity-95 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* Notifications Icon Shortcut */}
        <button
          onClick={() => setTab('notifications')}
          className="p-2 rounded-xl bg-bg-surface border border-border-dark text-text-secondary hover:text-white transition-colors relative"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-rose rounded-full animate-ping" />
        </button>

        {/* Profile Avatar Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center rounded-xl overflow-hidden bg-bg-surface border border-border-dark p-0.5 hover:border-accent-rose transition-colors"
            >
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                alt={user.username}
                className="w-8 h-8 rounded-lg bg-bg-card object-cover"
              />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-bg-surface border border-border-dark py-2 shadow-xl z-40 animate-fade-in">
                  <div className="px-4 py-2 border-b border-border-dark">
                    <p className="text-xs text-text-muted">Logged in as</p>
                    <p className="text-sm font-semibold text-white truncate">@{user.username}</p>
                  </div>
                  <button
                    onClick={() => {
                      setTab('profile');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-text-secondary hover:bg-bg-card hover:text-white transition-colors"
                  >
                    My Profile
                  </button>
                  {user.is_admin && (
                    <button
                      onClick={() => {
                        setTab('admin');
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-accent-rose hover:bg-bg-card transition-colors flex items-center gap-1.5 font-medium"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Moderation
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
export default Header;
