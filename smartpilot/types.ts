// Domain Types

export enum Period {
  YEAR = 'YEAR',
  MONTH = 'MONTH',
  WEEK = 'WEEK'
}

export type ObjectiveMode = 'monthlyIncome' | 'annualTurnover' | 'annualSales';

export interface ProspectingChannelDetails {
  actionSmart: string;
  indicators: string[];
  example: string;
  horizon: string;
  tips: string[];
}

// Represents a specific method of prospecting
export interface ProspectingChannel {
  id: string;
  name: string;
  category: string; // New: Relationnel, Terrain, Digital, etc.
  description?: string; // New: Short description for UI tooltips
  details?: ProspectingChannelDetails; // New: Full pedagogical content
  enabled: boolean;
  distributionPercent: number; // Part of the total R1 objective (0-100)
  actionsPerR1: number; // Yield: How many actions to get 1 RDV
  actionUnit: string; // e.g., "appels", "boites", "portes"
}

// The core assumptions/configuration
export interface Assumptions {
  objectiveMode: ObjectiveMode;
  
  // Financials
  monthlyNetSalaryGoal: number; // Used if mode === 'monthlyIncome'
  targetTurnover: number;       // Used if mode === 'annualTurnover' (or calculated)
  targetSales: number;          // Used if mode === 'annualSales' (or calculated)
  
  avgFee: number; // Honoraires Moyens HT per sale
  
  // Funnel Ratios (Inverse logic: How many X to get 1 Y)
  mandatesPerSale: number; // e.g., 5 mandates for 1 sale
  r1PerMandate: number;    // e.g., 4 RDV for 1 mandate
  visitsPerOffer: number;  // e.g., 10 visits for 1 offer
  
  // Time configuration
  monthsWorked: number; // Number of active months (e.g., 10 or 11)
  
  // Strategy
  channels: ProspectingChannel[];
}

// Calculated targets
export interface GlobalTargets {
  annualTurnover: number;
  annualSales: number;
  annualMandates: number;
  annualR1: number;
  monthlyR1: number; 
  weeklyR1: number;
}

export interface ChannelTarget {
  channelId: string;
  channelName: string;
  monthlyActionTarget: number;
  weeklyActionTarget: number;
  monthlyR1Target: number;
  actionUnit: string;
}

// Detailed Weekly Tracking
export interface WeeklyData {
  actionsDone: number;
  contactsObtained: number;
  rdvObtained: number;
}

export interface ChannelTracking {
  channelId: string;
  weeks: [WeeklyData, WeeklyData, WeeklyData, WeeklyData]; // 4 weeks
}

// Actual data input by user (The "Réalisé")
export interface MonthlyTrackingData {
  monthIndex: number; // 0-11
  channelTracking: ChannelTracking[];
  manualTurnover: number; // CA Acté this month
  manualSales: number; // Ventes Actées this month
  manualOffers: number; // Offres d'achat reçues this month (New)
  manualVisits: number; // Visites effectuées this month (New)
  manualMandates: number; // Mandats Rentrés this month
}

export interface AppState {
  isConfigured: boolean; // Flag to trigger Wizard
  assumptions: Assumptions;
  tracking: MonthlyTrackingData[];
  activeDays: string[]; // List of ISO dates (YYYY-MM-DD) where user was active/connected
}

export type ActionType = 'SET_ASSUMPTIONS' | 'UPDATE_TRACKING' | 'COMPLETE_WIZARD';