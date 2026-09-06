import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  demoSignIn: (name?: string, email?: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'kavora_demo_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  // Fetch or create profile row
  const fetchProfile = async (currentUser: User) => {
    try {
      if (!configured) {
        setProfile({
          id: currentUser.id,
          email: currentUser.email || 'user@kavora.app',
          full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Kartik',
          avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '',
        });
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (data && !error) {
        setProfile(data as UserProfile);
      } else {
        // Create initial profile if missing
        const newProfile: UserProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'KAVORA User',
          avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '',
        };
        await supabase.from('profiles').upsert(newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (configured) {
          // Check active Supabase session
          const { data: { session: initialSession } } = await supabase.auth.getSession();
          if (mounted && initialSession) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(initialSession.user);
          }
        } else {
          // Check if local demo login was stored
          const savedDemo = localStorage.getItem(DEMO_USER_KEY);
          if (savedDemo && mounted) {
            try {
              const parsed = JSON.parse(savedDemo);
              setUser(parsed as unknown as User);
              setProfile({
                id: parsed.id,
                email: parsed.email,
                full_name: parsed.user_metadata?.full_name || 'Kartik',
                avatar_url: parsed.user_metadata?.avatar_url || '',
              });
            } catch {
              localStorage.removeItem(DEMO_USER_KEY);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen to Supabase auth events
    if (configured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user || null);
        if (newSession?.user) {
          await fetchProfile(newSession.user);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [configured]);

  // Google OAuth Sign In
  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      if (!configured) {
        return { 
          error: new Error('Supabase credentials not configured in .env. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') 
        };
      }

      const redirectUrl = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // Demo Sign-In (fallback for instant preview / when .env is pending)
  const demoSignIn = (name: string = 'Kartik', email: string = 'kartik@kavora.app') => {
    const mockUser: Partial<User> = {
      id: 'demo-user-kartik-1234',
      email,
      user_metadata: {
        full_name: name,
        avatar_url: '',
      },
      app_metadata: { provider: 'google' },
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
    setUser(mockUser as User);
    setProfile({
      id: mockUser.id!,
      email,
      full_name: name,
      avatar_url: '',
    });
  };

  // Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      if (configured) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(DEMO_USER_KEY);
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...(profile || {}), ...updates } as UserProfile;
    setProfile(updated);

    if (configured) {
      await supabase.from('profiles').update(updates).eq('id', user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: configured,
        signInWithGoogle,
        signOut,
        demoSignIn,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
