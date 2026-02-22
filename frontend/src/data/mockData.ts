// Mock API responses for Fast demo mode
// These are hardcoded perfect responses that appear instantly

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  completed: boolean;
}

export interface BreakdownResponse {
  tasks: Task[];
  quote: string;
  totalEstimatedTime: string;
}

// Sample assignment for demo
export const DEMO_ASSIGNMENT = `Write a 10-page research paper on the impact of climate change on marine ecosystems. Include at least 8 scholarly sources, create data visualizations, and present findings in both written and presentation formats. Due in 3 weeks.`;

// Mock breakdown responses
export const MOCK_BREAKDOWN_NORMAL: BreakdownResponse = {
  tasks: [
    {
      id: 'task-1',
      title: 'Research and Gather Sources',
      description: 'Find 8+ scholarly articles on climate change impacts on marine life. Use academic databases like JSTOR, Google Scholar, and PubMed.',
      estimatedTime: '3 hours',
      completed: false,
    },
    {
      id: 'task-2',
      title: 'Create Annotated Bibliography',
      description: 'Summarize each source with key findings and relevance to your thesis. Note important quotes and data points.',
      estimatedTime: '2 hours',
      completed: false,
    },
    {
      id: 'task-3',
      title: 'Outline Paper Structure',
      description: 'Draft a detailed outline with introduction, body sections (coral bleaching, ocean acidification, species migration), and conclusion.',
      estimatedTime: '1 hour',
      completed: false,
    },
    {
      id: 'task-4',
      title: 'Write Introduction & Thesis',
      description: 'Craft a compelling introduction with background context and a clear thesis statement about climate impact.',
      estimatedTime: '1.5 hours',
      completed: false,
    },
    {
      id: 'task-5',
      title: 'Write Body Paragraphs',
      description: 'Develop each section with evidence from sources. Aim for 2 pages per major topic (coral, acidification, migration).',
      estimatedTime: '6 hours',
      completed: false,
    },
    {
      id: 'task-6',
      title: 'Create Data Visualizations',
      description: 'Design 2-3 charts/graphs showing temperature rise, pH changes, or species population shifts using Excel or Canva.',
      estimatedTime: '2 hours',
      completed: false,
    },
    {
      id: 'task-7',
      title: 'Write Conclusion',
      description: 'Summarize findings and suggest future research directions or policy implications.',
      estimatedTime: '1 hour',
      completed: false,
    },
    {
      id: 'task-8',
      title: 'Format Citations & Bibliography',
      description: 'Ensure all in-text citations are correct. Create a properly formatted bibliography in required style (APA/MLA).',
      estimatedTime: '1.5 hours',
      completed: false,
    },
    {
      id: 'task-9',
      title: 'Edit and Proofread',
      description: 'Review for grammar, clarity, and flow. Check that all sources are cited properly. Use Grammarly or have a peer review.',
      estimatedTime: '2 hours',
      completed: false,
    },
    {
      id: 'task-10',
      title: 'Create Presentation Slides',
      description: 'Build a 10-12 slide deck summarizing key points. Include your visualizations and practice your delivery.',
      estimatedTime: '3 hours',
      completed: false,
    },
  ],
  quote: 'The journey of a thousand miles begins with a single step. You\'ve got this!',
  totalEstimatedTime: '23 hours over 3 weeks',
};

export const MOCK_BREAKDOWN_WIZARD: BreakdownResponse = {
  tasks: [
    {
      id: 'task-1',
      title: '🔮 Summon Ancient Texts',
      description: 'Journey into the Library of Infinite Knowledge (JSTOR, Google Scholar). Collect 8 mystical scrolls revealing secrets of the Changing Seas.',
      estimatedTime: '3 hours',
      completed: false,
    },
    {
      id: 'task-2',
      title: '📜 Decode the Prophecies',
      description: 'Transcribe wisdom from each scroll into your Tome of Knowledge. Note powerful incantations (quotes) and ancient data runes.',
      estimatedTime: '2 hours',
      completed: false,
    },
    {
      id: 'task-3',
      title: '🗺️ Chart Your Quest',
      description: 'Draw a map of your journey: The Introduction Portal, Three Chambers of Evidence (Coral Bleaching, Ocean Acidification, Species Migration), and The Conclusion Summit.',
      estimatedTime: '1 hour',
      completed: false,
    },
    {
      id: 'task-4',
      title: '⚡ Forge the Opening Spell',
      description: 'Craft an enchanting introduction that captures your reader\'s attention. State your magical thesis about the seas\' transformation.',
      estimatedTime: '1.5 hours',
      completed: false,
    },
    {
      id: 'task-5',
      title: '📖 Weave the Tale',
      description: 'Spin your narrative across 6 pages. Each chamber reveals evidence from your scrolls about how the seas change under climate\'s curse.',
      estimatedTime: '6 hours',
      completed: false,
    },
    {
      id: 'task-6',
      title: '✨ Conjure Visual Magic',
      description: 'Transform raw numbers into enchanted charts and mystical graphs. Show temperature spells, pH potions, and species movements.',
      estimatedTime: '2 hours',
      completed: false,
    },
    {
      id: 'task-7',
      title: '🏰 Seal Your Wisdom',
      description: 'Write your conclusion - a prophecy of what\'s to come and how wizards of the future might break the climate curse.',
      estimatedTime: '1 hour',
      completed: false,
    },
    {
      id: 'task-8',
      title: '🪄 Cast Citation Charms',
      description: 'Ensure every borrowed spell (citation) is properly attributed. Organize your scroll references in the Sacred Bibliography.',
      estimatedTime: '1.5 hours',
      completed: false,
    },
    {
      id: 'task-9',
      title: '🔍 Polish Your Artifact',
      description: 'Examine your work with the Eye of Truth (editing). Banish grammar gremlins and ensure your writing flows like a river.',
      estimatedTime: '2 hours',
      completed: false,
    },
    {
      id: 'task-10',
      title: '🎭 Prepare Your Presentation',
      description: 'Craft a magical slide deck for the Grand Council. Practice your speech so you can present your findings with confidence and flair!',
      estimatedTime: '3 hours',
      completed: false,
    },
  ],
  quote: 'Magic is believing in yourself. If you can do that, you can make anything happen. Now go forth and conquer this quest!',
  totalEstimatedTime: '23 hours over 3 weeks',
};

// For slider values 1-9
export const generateMockBreakdown = (taskCount: number, isWizardMode: boolean): BreakdownResponse => {
  const sourceBreakdown = isWizardMode ? MOCK_BREAKDOWN_WIZARD : MOCK_BREAKDOWN_NORMAL;
  
  return {
    ...sourceBreakdown,
    tasks: sourceBreakdown.tasks.slice(0, taskCount),
  };
};

// Mock calendar events
export interface CalendarEvent {
  id: string;
  taskId: string;
  title: string;
  date: string; // ISO date string
  completed: boolean;
}

export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'event-1',
    taskId: 'task-1',
    title: '🔮 Summon Ancient Texts',
    date: new Date().toISOString(),
    completed: false,
  },
  {
    id: 'event-2',
    taskId: 'task-2',
    title: '📜 Decode the Prophecies',
    date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    completed: false,
  },
  {
    id: 'event-3',
    taskId: 'task-3',
    title: '🗺️ Chart Your Quest',
    date: new Date(Date.now() + 86400000 * 2).toISOString(), // Day after tomorrow
    completed: false,
  },
];
