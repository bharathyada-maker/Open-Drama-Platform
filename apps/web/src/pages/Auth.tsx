import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Film, User, Mail, Sparkles, Check, ChevronRight } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login, signup, updateUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1); // 1 = Creds, 2 = Preferences Wizard
  
  // Form values
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  
  // Wizard values
  const [bio, setBio] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(Math.random().toString(36).substring(7));
  const [lang, setLang] = useState('en');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const genresList = ['Drama', 'Thriller', 'Comedy', 'Mystery', 'Romance', 'Animation', 'Documentary', 'Adventure', 'Family'];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!email) {
          setError('Email is required');
          setLoading(false);
          return;
        }
        await signup(username, displayName || username, email);
        setStep(2); // Go to preferences wizard
      } else {
        await login(username);
        // Logged in successfully, App.tsx will handle routing
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async () => {
    setLoading(true);
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;
      await updateUser({
        bio,
        avatar_url: avatarUrl,
        preferred_language: lang,
        favorite_genres: selectedGenres
      });
      // Force page reload or trigger updates
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Saving preferences failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const randomizeAvatar = () => {
    setAvatarSeed(Math.random().toString(36).substring(7));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark relative p-6 overflow-hidden">
      {/* Cinematic ambient background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-rose/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-purple/10 blur-[120px]" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl relative z-10 animate-slide-up">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent-rose to-accent-purple flex items-center justify-center shadow-lg shadow-accent-rose/25 mb-4">
            <Film className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            OpenDrama
          </h1>
          <p className="text-text-secondary text-sm mt-1">Stories worth discovering.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Login / Sign Up Credentials */
          <div>
            <form onSubmit={handleAuthSubmit} className="space-y-5">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-text-muted" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="Enter unique username"
                    className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              {isSignUp && (
                <>
                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-2">Display Name</label>
                    <div className="relative">
                      <Sparkles className="absolute left-4 top-3.5 w-5 h-5 text-text-muted" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your public name"
                        className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-secondary text-sm font-medium mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-text-muted" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-semibold text-sm shadow-lg shadow-accent-rose/20 hover:opacity-95 transition-opacity disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Enter OpenDrama'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-text-muted">
                {isSignUp ? 'Already have an account?' : "New to the platform?"}
              </span>{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-accent-rose font-medium hover:underline ml-1"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
            
            <div className="mt-8 text-center text-xs text-text-muted border-t border-border-dark pt-4">
              Tip: You can log in with <code className="text-accent-rose">alex_rivera</code> to view seeded creator panel.
            </div>
          </div>
        ) : (
          /* Step 2: Preferences Seeding Wizard */
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold text-center text-white mb-2">Configure Your Profile</h2>
            <p className="text-text-secondary text-xs text-center mb-4">Customize your stream preferences to find matching stories.</p>

            {/* Avatar customization */}
            <div className="flex flex-col items-center gap-3">
              <img
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl bg-bg-card p-2 border border-border-dark shadow-inner"
              />
              <button
                onClick={randomizeAvatar}
                className="px-3 py-1 rounded-lg text-xs bg-bg-card border border-border-dark hover:border-accent-rose transition-colors text-text-secondary"
              >
                Randomize Avatar
              </button>
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1">Short Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
              />
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-1">Preferred Language</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="te">Telugu (తెలుగు)</option>
              </select>
            </div>

            {/* Genre Selection chips */}
            <div>
              <label className="block text-text-secondary text-sm font-medium mb-2">Favorite Genres</label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {genresList.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-accent-rose/25 border-accent-rose text-accent-rose'
                          : 'bg-bg-card border-border-dark text-text-secondary hover:border-text-secondary'
                      }`}
                    >
                      {genre}
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handlePreferencesSubmit}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-rose to-accent-purple text-white font-semibold text-sm shadow-lg shadow-accent-rose/25 mt-4 hover:opacity-95"
            >
              {loading ? 'Saving Preferences...' : 'Complete Profile Setup'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default Auth;
