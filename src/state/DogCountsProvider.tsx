/**
 * DogCountsProvider - Lightweight context for tracking dog counts
 * Provides myDogsCount for smart pluralization in TopNav
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getMyDogs } from '../storage/dogs';
import { logEvent, logError } from '../utils/logger';

interface DogCounts {
  myDogsCount: number;
}

interface DogCountsContextValue extends DogCounts {
  refreshCounts: () => Promise<void>;
}

const DogCountsContext = createContext<DogCountsContextValue | undefined>(undefined);

interface DogCountsProviderProps {
  children: ReactNode;
}

export function DogCountsProvider({ children }: DogCountsProviderProps) {
  const [myDogsCount, setMyDogsCount] = useState(0);

  const refreshCounts = async () => {
    logEvent('Counts:refresh:start');
    try {
      const myDogs = await getMyDogs();
      const count = myDogs.length;
      setMyDogsCount(count);
      logEvent('Counts:refresh:success', { myDogsCount: count });
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { context: 'Counts:refresh:error' }
      );
    }
  };

  // Load counts on mount
  useEffect(() => {
    refreshCounts();
  }, []);

  const value: DogCountsContextValue = {
    myDogsCount,
    refreshCounts,
  };

  return (
    <DogCountsContext.Provider value={value}>
      {children}
    </DogCountsContext.Provider>
  );
}

/**
 * Hook to access dog counts
 */
export function useDogCounts(): DogCountsContextValue {
  const context = useContext(DogCountsContext);
  if (context === undefined) {
    throw new Error('useDogCounts must be used within a DogCountsProvider');
  }
  return context;
}
