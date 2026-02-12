import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Assumptions, MonthlyTrackingData } from '../types';
import { DEFAULT_ASSUMPTIONS, INITIAL_TRACKING_DATA, DEFAULT_CHANNELS } from '../constants';

interface StoreContextType {
  state: AppState;
  updateAssumptions: (newAssumptions: Assumptions) => void;
  updateTracking: (monthIndex: number, data: Partial<MonthlyTrackingData>) => void;
  updateChannelTracking: (monthIndex: number, channelId: string, weekIndex: number, field: string, value: number) => void;
  completeWizard: () => void;
  resetWizard: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'immoRoadmap:v1';

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure data structure integrity
      if (!parsed.assumptions.channels) parsed.assumptions.channels = DEFAULT_CHANNELS;
      // Migration for visitsPerOffer
      if (parsed.assumptions.visitsPerOffer === undefined) parsed.assumptions.visitsPerOffer = 10;
      // Migration for activeDays
      if (!parsed.activeDays) parsed.activeDays = [];
      return parsed;
    }
    return {
      isConfigured: false,
      assumptions: DEFAULT_ASSUMPTIONS,
      tracking: INITIAL_TRACKING_DATA,
      activeDays: []
    };
  });

  // Helper to log activity
  const logActivity = (currentState: AppState) => {
    const today = new Date().toISOString().split('T')[0];
    if (!currentState.activeDays.includes(today)) {
      return { ...currentState, activeDays: [...currentState.activeDays, today] };
    }
    return currentState;
  };

  // Log activity on mount (App open)
  useEffect(() => {
     setState(prev => logActivity(prev));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateAssumptions = (newAssumptions: Assumptions) => {
    setState(prev => {
        const updated = { ...prev, assumptions: newAssumptions };
        return logActivity(updated);
    });
  };

  const completeWizard = () => {
    setState(prev => {
        const updated = { ...prev, isConfigured: true };
        return logActivity(updated);
    });
  };

  const resetWizard = () => {
     setState(prev => ({ ...prev, isConfigured: false }));
  };

  const updateTracking = (monthIndex: number, data: Partial<MonthlyTrackingData>) => {
    setState(prev => {
      const newTracking = [...prev.tracking];
      newTracking[monthIndex] = { ...newTracking[monthIndex], ...data };
      const updatedState = { ...prev, tracking: newTracking };
      return logActivity(updatedState);
    });
  };

  const updateChannelTracking = (monthIndex: number, channelId: string, weekIndex: number, field: string, value: number) => {
    setState(prev => {
      const newTracking = [...prev.tracking];
      const monthData = { ...newTracking[monthIndex] };
      
      const newChannelTracking = monthData.channelTracking.map(ct => {
        if (ct.channelId !== channelId) return ct;
        const newWeeks = [...ct.weeks] as [any, any, any, any];
        newWeeks[weekIndex] = { ...newWeeks[weekIndex], [field]: value };
        return { ...ct, weeks: newWeeks };
      });

      monthData.channelTracking = newChannelTracking;
      
      // FIX: Réassignation des données du mois modifié dans le tableau principal
      newTracking[monthIndex] = monthData; 

      const updatedState = { ...prev, tracking: newTracking };
      return logActivity(updatedState);
    });
  };

  return (
    <StoreContext.Provider value={{ state, updateAssumptions, updateTracking, updateChannelTracking, completeWizard, resetWizard }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};