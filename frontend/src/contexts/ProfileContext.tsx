'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';

interface ProfileData {
  name?: string;
  city?: string;
  level?: string;
  interests?: string[];
  strengths?: string[];
  [key: string]: any;
}

interface ProfileContextType {
  profileData: ProfileData | null;
  isProfileComplete: boolean;
  completionPercentage: number;
  isLoading: boolean;
  updateProfileLocally: (data: Partial<ProfileData>) => void;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profileData: null,
  isProfileComplete: false,
  completionPercentage: 0,
  isLoading: true,
  updateProfileLocally: () => {},
  refreshProfile: async () => {},
});

export function useProfile() {
  return useContext(ProfileContext);
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id;
      if (!uid) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/${uid}`);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          setProfileData(json.data);
        }
      }
    } catch {
      // Profile doesn't exist yet — that's expected for new users
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const completionPercentage = useMemo(() => {
    if (!profileData) return 0;
    
    let score = 0;
    // Identité (30%)
    if (profileData.name) score += 10;
    if (profileData.city) score += 10;
    if (profileData.level) score += 10;
    
    // Intérêts (20%)
    if (profileData.interests && profileData.interests.length > 0) score += 20;
    
    // Profil Cognitif / Jeux (50%)
    if (profileData.strengths && profileData.strengths.length > 0) {
      score += 50;
    } else if (profileData.temp_game_progress) {
      // Progression temporaire pendant les jeux (stockée en local ou via API)
      score += Math.floor(profileData.temp_game_progress * 50);
    }
    
    return Math.min(100, score);
  }, [profileData]);

  const updateProfileLocally = useCallback((data: Partial<ProfileData>) => {
    setProfileData(prev => prev ? { ...prev, ...data } : data as ProfileData);
  }, []);

  const isProfileComplete = completionPercentage === 100;

  return (
    <ProfileContext.Provider value={{ 
      profileData, 
      isProfileComplete, 
      completionPercentage,
      isLoading, 
      updateProfileLocally,
      refreshProfile: fetchProfile 
    }}>
      {children}
    </ProfileContext.Provider>
  );
}
