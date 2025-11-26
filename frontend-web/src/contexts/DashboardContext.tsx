import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface DashboardContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []); // Sin dependencias - función estable

  return (
    <DashboardContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

