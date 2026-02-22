import React, { createContext, useContext, useState, ReactNode } from 'react';

export type DemoMode = 'live' | 'fast';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  action?: () => void;
}

interface DemoContextType {
  demoMode: DemoMode;
  setDemoMode: (mode: DemoMode) => void;
  isDemoActive: boolean;
  setIsDemoActive: (active: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  demoSteps: DemoStep[];
  nextStep: () => void;
  prevStep: () => void;
  resetDemo: () => void;
  spotlightElement: string | null;
  setSpotlightElement: (element: string | null) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const DEMO_STEPS: DemoStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to HopperFocus',
    description: 'Transform your overwhelming assignments into manageable quests with AI-powered task breakdown and RPG-style motivation.',
  },
  {
    id: 'paste-assignment',
    title: 'Paste Your Assignment',
    description: 'Copy any assignment description and paste it here. Our AI will analyze it and break it down into actionable tasks.',
    targetElement: 'assignment-input',
  },
  {
    id: 'choose-difficulty',
    title: 'Choose Task Count',
    description: 'Select how many tasks you want (1-10). Perfect for both quick assignments and semester-long projects.',
    targetElement: 'task-slider',
  },
  {
    id: 'select-tone',
    title: 'Pick Your Vibe',
    description: 'Normal mode = straightforward tasks. Wizard mode = magical quest descriptions for extra motivation!',
    targetElement: 'tone-toggle',
  },
  {
    id: 'ai-breakdown',
    title: 'AI Task Breakdown',
    description: 'Watch our AI instantly generate a personalized breakdown with task titles, descriptions, and estimated time.',
    targetElement: 'breakdown-result',
  },
  {
    id: 'drag-to-calendar',
    title: 'Drag to Calendar',
    description: 'Drag and drop tasks into your 7-day calendar to schedule when you\'ll tackle each one.',
    targetElement: 'calendar-grid',
  },
  {
    id: 'complete-task',
    title: 'Complete Tasks & Earn XP',
    description: 'Mark tasks complete to earn experience points, level up your RPG stats, and unlock achievement badges!',
    targetElement: 'task-complete',
  },
  {
    id: 'rpg-stats',
    title: 'Track Your Progress',
    description: 'View your Endurance, Focus, and Magic stats. Earn titles like "Procrastination Slayer" as you level up!',
    targetElement: 'rpg-card',
  },
];

export const DemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [demoMode, setDemoMode] = useState<DemoMode>('fast');
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightElement, setSpotlightElement] = useState<string | null>(null);

  const nextStep = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      setSpotlightElement(DEMO_STEPS[nextStepIndex].targetElement || null);
    } else {
      resetDemo();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      setSpotlightElement(DEMO_STEPS[prevStepIndex].targetElement || null);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsDemoActive(false);
    setSpotlightElement(null);
  };

  return (
    <DemoContext.Provider
      value={{
        demoMode,
        setDemoMode,
        isDemoActive,
        setIsDemoActive,
        currentStep,
        setCurrentStep,
        demoSteps: DEMO_STEPS,
        nextStep,
        prevStep,
        resetDemo,
        spotlightElement,
        setSpotlightElement,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
