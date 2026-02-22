import React, { useState } from 'react';
import { useStats } from '../../contexts/StatsContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HomeProps {
  onNavigate: (tab: 'home' | 'active' | 'calendar' | 'pitch' | 'about') => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { stats, isLoading } = useStats();
  const { house } = useTheme();
  const [workType, setWorkType] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading your stats...</div>
      </div>
    );
  }

  const progressPercentage = (stats.xp / stats.xpToNextLevel) * 100;

  // Check if streak is in danger
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const streakInDanger = stats.lastCompletedDate !== today && stats.currentStreak > 0;

  return (
    <div className="min-h-screen bg-neutral-950 p-8" id="rpg-card">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-fantasy text-white mb-2">
            Welcome back, {stats.title}
          </h1>
          <p className="text-neutral-400">
            Continue your quest to conquer procrastination
          </p>
          
          {/* Work Type Input */}
          <div className="mt-4">
            <label className="text-sm font-medium text-neutral-300 block mb-2">
              What are you working on today?
            </label>
            <input
              type="text"
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              placeholder="e.g., History Essay, Math Homework, Coding Project"
              className="w-full px-4 py-3 bg-black border border-neutral-700 rounded-lg text-white placeholder-neutral-600 focus:border-house-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Streak Warning */}
        {streakInDanger && (
          <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-white font-bold text-lg">Your {stats.currentStreak}-Day Streak is in Danger!</h3>
                <p className="text-red-200">Complete a task today to maintain your streak and keep your Endurance bonus.</p>
              </div>
            </div>
          </div>
        )}

        {/* Player Card */}
        <div className="bg-black border-2 border-house-primary rounded-lg p-8 mb-8 shadow-2xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-3xl font-fantasy text-white">{stats.title}</h2>
                <span className="px-4 py-1 bg-house-primary text-white rounded-full text-sm font-medium">
                  Level {stats.level}
                </span>
              </div>
              <p className="text-neutral-400 capitalize">House {house}</p>
              
              {/* Streak Display */}
              {stats.currentStreak > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-orange-600/30 border border-orange-500 rounded-full">
                  <span className="text-orange-400 text-xl">🔥</span>
                  <span className="text-orange-300 font-bold">{stats.currentStreak} Day Streak!</span>
                </div>
              )}
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-neutral-800 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-house-primary to-house-secondary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2 text-center">
              {Math.round(progressPercentage)}% to next level
            </p>
          </div>

          {/* RPG Stats */}
          <div className="grid grid-cols-3 gap-6">
            {/* Endurance */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-2xl">
                  ❤️
                </div>
                <div>
                  <h3 className="text-white font-medium">Endurance</h3>
                  <p className="text-xs text-neutral-400">Task stamina</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{ width: `${stats.endurance}%` }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-white text-center">{stats.endurance}</p>
            </div>

            {/* Focus */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <h3 className="text-white font-medium">Focus</h3>
                  <p className="text-xs text-neutral-400">Concentration power</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${stats.focus}%` }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-white text-center">{stats.focus}</p>
            </div>

            {/* Magic */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-2xl">
                  ✨
                </div>
                <div>
                  <h3 className="text-white font-medium">Magic</h3>
                  <p className="text-xs text-neutral-400">Productivity spells</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-500"
                    style={{ width: `${stats.magic}%` }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-white text-center">{stats.magic}</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        {stats.badges.length > 0 && (
          <div className="bg-black border border-neutral-800 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-fantasy text-white mb-4 flex items-center gap-2">
              🏆 Achievement Badges
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.badges.map((badge, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-house-primary bg-opacity-20 border border-house-primary rounded-lg text-house-secondary font-medium flex items-center gap-2"
                >
                  <span>⭐</span>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => onNavigate('active')}
            className="bg-black border border-neutral-800 rounded-lg p-6 hover:border-house-primary transition-all cursor-pointer group text-left"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div>
            <h3 className="text-xl font-fantasy text-white mb-2">Active Tasks</h3>
            <p className="text-neutral-400 text-sm">
              View and manage your current quests
            </p>
          </button>

          <button
            onClick={() => onNavigate('calendar')}
            className="bg-black border border-neutral-800 rounded-lg p-6 hover:border-house-primary transition-all cursor-pointer group text-left"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📅</div>
            <h3 className="text-xl font-fantasy text-white mb-2">Calendar</h3>
            <p className="text-neutral-400 text-sm">
              Schedule tasks across your week
            </p>
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-house-primary bg-opacity-10 border border-house-primary rounded-lg p-6">
          <h3 className="text-lg font-fantasy text-white mb-3 flex items-center gap-2">
            💡 Level Up Tips
          </h3>
          <ul className="space-y-2 text-neutral-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-house-secondary">•</span>
              <span>Complete tasks daily to build your streak and increase Endurance (+2 per day)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-house-secondary">•</span>
              <span>Breaking your streak will decrease Endurance by 5 points</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-house-secondary">•</span>
              <span>Use Mana to stake on tasks - win the bounty if you complete them on time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-house-secondary">•</span>
              <span>Earn streak badges at 7, 30, and 100 consecutive days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-house-secondary">•</span>
              <span>Each level randomly increases Endurance, Focus, or Magic</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-house-secondary">•</span>
              <span>Change your House theme to match your personality</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
