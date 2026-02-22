/**
 * HopperFocus - Main App Component
 * Transform overwhelming assignments into manageable quests
 * Features: RPG Stats, AI Breakdown, 7-Day Calendar, Demo Mode
 */

import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeModeProvider } from './contexts/ThemeModeContext';
import { StatsProvider } from './contexts/StatsContext';
import { DemoProvider } from './contexts/DemoContext';
import Navigation from './components/Navigation';
import { Spotlight } from './components/Spotlight';

function App() {
  return (
    <ThemeModeProvider>
      <ThemeProvider>
        <StatsProvider>
          <DemoProvider>
            <Navigation />
            <Spotlight />
          </DemoProvider>
        </StatsProvider>
      </ThemeProvider>
    </ThemeModeProvider>
  );
}

export default App;


