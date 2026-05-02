'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profileData: null,
  isProfileComplete: false,
  isLoading: true,
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

  const isProfileComplete = !!(
    profileData &&
    profileData.name &&
    profileData.city &&
    profileData.level &&
    profileData.interests &&
    profileData.interests.length > 0
  );

  return (
    <ProfileContext.Provider value={{ profileData, isProfileComplete, isLoading, refreshProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
