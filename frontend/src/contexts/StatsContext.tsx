import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface RPGStats {
  endurance: number; // 0-100
  focus: number; // 0-100
  magic: number; // 0-100
  level: number;
  xp: number;
  xpToNextLevel: number;
  title: string;
  badges: string[];
  currentStreak: number;
  lastCompletedDate: string | null;
}

interface StatsContextType {
  stats: RPGStats;
  addXP: (amount: number) => void;
  refreshStats: () => Promise<void>;
  completeTaskForDay: () => void;
  isLoading: boolean;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

const TITLES = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Fifth Year",
  "Prefect",
  "Head Student",
  "Auror",
  "Wizard Extraordinaire",
  "Master of Tasks",
];

const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const calculateXPForNextLevel = (level: number): number => {
  return (level * level) * 100;
};

export const StatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<RPGStats>({
    endurance: 10,
    focus: 10,
    magic: 10,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    title: "First Year",
    badges: [],
    currentStreak: 0,
    lastCompletedDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = async () => {
    setIsLoading(true);
    try {
      // Try to load from backend
      const response = await axios.get('http://127.0.0.1:8004/api/stats');
      setStats(response.data);
    } catch (error) {
      // Fallback to localStorage if backend is unavailable
      const saved = localStorage.getItem('rpgStats');
      if (saved) {
        setStats(JSON.parse(saved));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addXP = (amount: number) => {
    setStats(prevStats => {
      const newXP = prevStats.xp + amount;
      const newLevel = calculateLevel(newXP);
      const leveledUp = newLevel > prevStats.level;

      let newEndurance = prevStats.endurance;
      let newFocus = prevStats.focus;
      let newMagic = prevStats.magic;
      const newBadges = [...prevStats.badges];

      if (leveledUp) {
        // Increase random stat on level up
        const statToIncrease = Math.floor(Math.random() * 3);
        if (statToIncrease === 0) newEndurance = Math.min(100, newEndurance + 5);
        else if (statToIncrease === 1) newFocus = Math.min(100, newFocus + 5);
        else newMagic = Math.min(100, newMagic + 5);

        // Award badge every 5 levels
        if (newLevel % 5 === 0 && !newBadges.includes(`Level ${newLevel}`)) {
          newBadges.push(`Level ${newLevel}`);
        }
      }

      const newStats = {
        ...prevStats,
        endurance: newEndurance,
        focus: newFocus,
        magic: newMagic,
        level: newLevel,
        xp: newXP,
        xpToNextLevel: calculateXPForNextLevel(newLevel),
        badges: newBadges,
      };

      // Save to localStorage
      localStorage.setItem('rpgStats', JSON.stringify(newStats));

      // Try to sync with backend
      axios.post('http://127.0.0.1:8004/api/stats', newStats).catch(() => {
        // Silently fail if backend is unavailable
      });

      return newStats;
    });
  };

  const completeTaskForDay = () => {
    setStats(prevStats => {
      const today = new Date().toDateString();
      const lastCompleted = prevStats.lastCompletedDate;

      let newStreak = prevStats.currentStreak;
      let newEndurance = prevStats.endurance;

      // Check if already completed today
      if (lastCompleted === today) {
        return prevStats; // No change
      }

      // Check if streak should continue or reset
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastCompleted === yesterdayStr) {
        // Streak continues!
        newStreak += 1;
        newEndurance = Math.min(100, newEndurance + 2); // +2 Endurance per day
      } else if (lastCompleted === null) {
        // First task ever
        newStreak = 1;
        newEndurance = Math.min(100, newEndurance + 2);
      } else {
        // Streak broken
        newStreak = 1;
        newEndurance = Math.max(0, newEndurance - 5); // -5 Endurance for breaking streak
      }

      const newBadges = [...prevStats.badges];
      
      // Award badges for streaks
      if (newStreak === 7 && !newBadges.includes('7-Day Streak')) {
        newBadges.push('7-Day Streak');
      }
      if (newStreak === 30 && !newBadges.includes('30-Day Streak')) {
        newBadges.push('30-Day Streak');
      }
      if (newStreak === 100 && !newBadges.includes('100-Day Streak')) {
        newBadges.push('100-Day Streak');
      }

      const newStats = {
        ...prevStats,
        endurance: newEndurance,
        currentStreak: newStreak,
        lastCompletedDate: today,
        badges: newBadges,
      };

      // Save to localStorage
      localStorage.setItem('rpgStats', JSON.stringify(newStats));

      // Try to sync with backend
      axios.post('http://127.0.0.1:8004/api/stats', newStats).catch(() => {
        // Silently fail if backend is unavailable
      });

      return newStats;
    });
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <StatsContext.Provider value={{ stats, addXP, completeTaskForDay, refreshStats, isLoading }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};
