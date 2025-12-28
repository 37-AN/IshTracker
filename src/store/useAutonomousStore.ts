// src/store/useAutonomousStore.ts
import { create } from 'zustand';

interface DomainHealth {
  score: number;
  rate: number; // Events per minute
  status: 'optimal' | 'warning' | 'critical';
}

interface AutonomousState {
  health: {
    mes: DomainHealth;
    sql: DomainHealth;
    network: DomainHealth;
  };
  lastResolutions: any[];
  // Actions to update state
  updateMetric: (domain: 'mes' | 'sql' | 'network', score: number, rate: number) => void;
  addResolution: (resolution: any) => void;
}

export const useAutonomousStore = create<AutonomousState>((set) => ({
  health: {
    mes: { score: 100, rate: 0, status: 'optimal' },
    sql: { score: 100, rate: 0, status: 'optimal' },
    network: { score: 100, rate: 0, status: 'optimal' },
  },
  lastResolutions: [],

  updateMetric: (domain, score, rate) => set((state) => {
    const status = score < 50 ? 'critical' : score < 80 ? 'warning' : 'optimal';
    return {
      health: {
        ...state.health,
        [domain]: { score, rate, status }
      }
    };
  }),

  addResolution: (res) => set((state) => ({
    lastResolutions: [res, ...state.lastResolutions].slice(0, 10) // Keep last 10
  })),
}));
