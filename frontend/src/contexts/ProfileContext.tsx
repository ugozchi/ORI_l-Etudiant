'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { apiUrl } from '@/utils/api';

interface ProfileData {
  name?: string;
  city?: string;
  level?: string;
  interests?: string[];
  strengths?: string[];
  strengths_data?: { name: string; val: number }[];
  scores?: { logic: number; math: number; softSkills: any };
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
  const PROFILE_CACHE_KEY = 'ori_profile_cache';
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

      const res = await fetch(apiUrl(`/api/profile/${uid}`));
      let profile: any = { email: session?.user?.email };
      
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          profile = { ...profile, ...json.data };
        }
      }

      // Récupérer le nom de l'inscription si manquant
      if (!profile.name) {
        const meta = session?.user?.user_metadata;
        if (meta?.first_name) {
          profile.name = `${meta.first_name} ${meta.last_name || ''}`.trim();
        }
      }

      setProfileData(profile);
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    } catch {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        try {
          setProfileData(JSON.parse(cached));
        } catch {
          // ignore corrupted cache
        }
      }
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
    setProfileData(prev => {
      const next = prev ? { ...prev, ...data } : data as ProfileData;
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(next));
      return next;
    });
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
