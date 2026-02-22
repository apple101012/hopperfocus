import React, { useState } from 'react';
import { Home } from './tabs/Home';
import { ActiveBoard } from './tabs/ActiveBoard';
import { Calendar } from './tabs/Calendar';
import { Pitch } from './tabs/Pitch';
import { About } from './tabs/About';
import { useTheme, House } from '../contexts/ThemeContext';
import { useThemeMode } from '../contexts/ThemeModeContext';
import { voiceService } from '../services/elevenlabs';

type Tab = 'home' | 'active' | 'calendar' | 'pitch' | 'about';

const Navigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { house, setHouse } = useTheme();
  const { themeMode, toggleThemeMode } = useThemeMode();
  const [voiceEnabled, setVoiceEnabled] = useState(voiceService.isEnabled());

  const tabs = [
    { id: 'home' as Tab, label: 'Home', icon: '🏠' },
    { id: 'active' as Tab, label: 'Active Board', icon: '⚡' },
    { id: 'calendar' as Tab, label: 'Calendar', icon: '📅' },
    { id: 'pitch' as Tab, label: 'Pitch', icon: '🎭' },
    { id: 'about' as Tab, label: 'About', icon: '🧠' },
  ];

  const houses: { value: House; label: string; emoji: string }[] = [
    { value: 'gryffindor', label: 'Gryffindor', emoji: '🦁' },
    { value: 'slytherin', label: 'Slytherin', emoji: '🐍' },
    { value: 'ravenclaw', label: 'Ravenclaw', emoji: '🦅' },
    { value: 'hufflepuff', label: 'Hufflepuff', emoji: '🦡' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={setActiveTab} />;
      case 'active':
        return <ActiveBoard />;
      case 'calendar':
        return <Calendar />;
      case 'pitch':
        return <Pitch />;
      case 'about':
        return <About />;
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-950">
      {/* Sidebar */}
      <div className="w-64 bg-black border-r border-neutral-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-2xl font-fantasy text-white">HopperFocus</h1>
          <p className="text-sm text-neutral-400 mt-1">Turn chaos into quests</p>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-house-primary text-white shadow-lg'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          {/* Voice Toggle */}
          <div>
            <p className="text-xs text-neutral-500 mb-2 font-medium">VOICE GUIDE</p>
            <button
              onClick={() => {
                const newState = !voiceEnabled;
                setVoiceEnabled(newState);
                voiceService.setEnabled(newState);
              }}
              className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                voiceEnabled
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {voiceEnabled ? '🔊 Voice On' : '🔇 Voice Off'}
            </button>
          </div>

          {/* Theme Mode Toggle */}
          <div>
            <p className="text-xs text-neutral-500 mb-2 font-medium">THEME</p>
            <button
              onClick={toggleThemeMode}
              className="w-full px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-all"
            >
              {themeMode === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>
        </div>

        {/* House Selector */}
        <div className="p-4 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 mb-2 font-medium">YOUR HOUSE</p>
          <select
            value={house}
            onChange={(e) => setHouse(e.target.value as House)}
            className="w-full bg-neutral-900 text-white border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-house-primary"
          >
            {houses.map((h) => (
              <option key={h.value} value={h.value}>
                {h.emoji} {h.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Navigation;
