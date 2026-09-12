import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbClient } from '../lib/dbClient';
import { Profile, CreatorProfile } from '../types/schema';

interface AuthContextType {
  user: Profile | null;
  creatorProfile: CreatorProfile | null;
  loading: boolean;
  login: (username: string) => Promise<Profile>;
  signup: (username: string, displayName: string, email: string) => Promise<Profile>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Profile>) => Promise<Profile>;
  becomeCreator: (creatorName: string) => Promise<CreatorProfile>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    try {
      const currentUser = await dbClient.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const creator = await dbClient.getCreatorProfile(currentUser.id);
        setCreatorProfile(creator);
      } else {
        setCreatorProfile(null);
      }
    } catch (e) {
      console.error('Error refreshing auth:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (username: string) => {
    setLoading(true);
    try {
      const u = await dbClient.signIn(username);
      setUser(u);
      const creator = await dbClient.getCreatorProfile(u.id);
      setCreatorProfile(creator);
      return u;
    } catch (e) {
      setLoading(false);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username: string, displayName: string, email: string) => {
    setLoading(true);
    try {
      const u = await dbClient.signUp(username, displayName, email);
      setUser(u);
      setCreatorProfile(null);
      return u;
    } catch (e) {
      setLoading(false);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await dbClient.signOut();
      setUser(null);
      setCreatorProfile(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('Not logged in');
    const updated = await dbClient.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  const becomeCreator = async (creatorName: string) => {
    if (!user) throw new Error('Not logged in');
    const profile = await dbClient.createCreatorProfile(user.id, creatorName);
    setCreatorProfile(profile);
    return profile;
  };

  return (
    <AuthContext.Provider value={{ user, creatorProfile, loading, login, signup, logout, updateUser, becomeCreator, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
