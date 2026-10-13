'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, Store, UserRole } from '@/types';
import { retailDataStore } from './data-store';

interface AuthContextType {
  currentProfile: Profile;
  currentRole: UserRole;
  stores: Store[];
  selectedStoreId: string;
  isDemoMode: boolean;
  switchProfile: (profileId: string) => void;
  switchStore: (storeId: string) => void;
  allProfiles: Profile[];
  refreshData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<Profile>(retailDataStore.getCurrentProfile());
  const [stores, setStores] = useState<Store[]>(retailDataStore.getStores());
  const [selectedStoreId, setSelectedStoreId] = useState<string>(retailDataStore.getSelectedStoreId());
  const [allProfiles, setAllProfiles] = useState<Profile[]>(retailDataStore.getProfiles());
  const [, setTick] = useState(0);

  const refreshData = () => {
    setCurrentProfile(retailDataStore.getCurrentProfile());
    setStores(retailDataStore.getStores());
    setSelectedStoreId(retailDataStore.getSelectedStoreId());
    setAllProfiles(retailDataStore.getProfiles());
    setTick(t => t + 1);
  };

  useEffect(() => {
    refreshData();
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
