'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Store, UserRole } from '@/types';
import { retailDataStore } from './data-store';
import { DEMO_PROFILES, DEMO_STORES } from './demo-data';

interface AuthContextType {
  currentProfile: Profile;
  currentRole: UserRole;
  stores: Store[];
  selectedStoreId: string;
  isDemoMode: boolean;
  isHydrated: boolean;
  switchProfile: (profileId: string) => void;
  switchStore: (storeId: string) => void;
  allProfiles: Profile[];
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use deterministic default SSR state focused on Plaza Senayan (Store Manager Diana Putri)
  const [currentProfile, setCurrentProfile] = useState<Profile>(DEMO_PROFILES[1]);
  const [stores, setStores] = useState<Store[]>([DEMO_STORES[2]]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('10000000-0000-0000-0000-000000000003');
  const [allProfiles, setAllProfiles] = useState<Profile[]>(
    DEMO_PROFILES.filter(p => p.role === 'store_manager' || p.role === 'sales_associate')
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [, setTick] = useState(0);

  const refreshData = () => {
    setCurrentProfile(retailDataStore.getCurrentProfile());
    setStores(retailDataStore.getStores());
    setSelectedStoreId(retailDataStore.getSelectedStoreId());
    setAllProfiles(
      retailDataStore
        .getProfiles()
        .filter(p => p.role === 'store_manager' || p.role === 'sales_associate')
    );
    setTick(t => t + 1);
  };

  useEffect(() => {
    // Only load persisted state from localStorage on client mount to eliminate SSR hydration mismatches
    retailDataStore.loadFromStorage();
    refreshData();
    setIsHydrated(true);
  }, []);

  const switchProfile = (profileId: string) => {
    retailDataStore.setCurrentProfile(profileId);
    refreshData();
  };

  const switchStore = (storeId: string) => {
    retailDataStore.setSelectedStoreId(storeId);
    refreshData();
  };

  return (
    <AuthContext.Provider
      value={{
        currentProfile,
        currentRole: currentProfile.role,
        stores,
        selectedStoreId,
        isDemoMode: true,
        isHydrated,
        switchProfile,
        switchStore,
        allProfiles,
        refreshData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
