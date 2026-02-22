import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDemo } from '../../contexts/DemoContext';
import { useStats } from '../../contexts/StatsContext';
import { HyperFocusMode } from '../HyperFocusMode';
import { voiceService } from '../../services/elevenlabs';
import {
  Task,
  DEMO_ASSIGNMENT,
  generateMockBreakdown,
} from '../../data/mockData';

export const ActiveBoard: React.FC = () => {
  const [assignment, setAssignment] = useState('');
  const [taskCount, setTaskCount] = useState(10);
  const [isWizardMode, setIsWizardMode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<Task & { estimatedMinutes?: number; stake?: number; bounty?: number } | null>(null);
  const [manaBalance, setManaBalance] = useState(1000);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const { demoMode } = useDemo();
  const { addXP } = useStats();

  // Load Mana balance
  useEffect(() => {
    loadBalance();
  }, []);

  // Auto-fill demo assignment in Fast mode
  useEffect(() => {
    if (demoMode === 'fast' && !assignment) {
      setAssignment(DEMO_ASSIGNMENT);
    }
  }, [demoMode, assignment]);

  // Check for pending task breakdown from Calendar
  useEffect(() => {
    const checkPendingBreakdown = () => {
      const pendingData = localStorage.getItem('pendingTaskBreakdown');
      if (pendingData) {
        try {
          const { title, description, timestamp } = JSON.parse(pendingData);
          // Only use if less than 5 minutes old
          if (Date.now() - timestamp < 5 * 60 * 1000) {
            const taskText = `${title}\n\n${description}`;
            setAssignment(taskText);
            // Clear the pending breakdown
            localStorage.removeItem('pendingTaskBreakdown');
          } else {
            // Clear old pending breakdown
            localStorage.removeItem('pendingTaskBreakdown');
          }
        } catch (error) {
          console.error('Error loading pending breakdown:', error);
          localStorage.removeItem('pendingTaskBreakdown');
        }
      }
    };

    checkPendingBreakdown();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8004/api/balance');
      setManaBalance(response.data.balance);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  const handleBreakdown = async () => {
    if (!assignment || assignment.trim() === '') {
      alert('Please enter an assignment!');
      return;
    }

    setIsLoading(true);
    setTasks([]);

    try {
      if (demoMode === 'fast') {
        // Demo mode: use mock data
        setTimeout(() => {
const mockData = {
            tasks: [
              { id: 'task-1', title: 'Read the assignment prompt carefully', description: 'Every quest begins with a single step', estimatedTime: '5 min', completed: false },
              { id: 'task-2', title: 'Create an outline', description: 'Structure brings clarity', estimatedTime: '10 min', completed: false },
              { id: 'task-3', title: 'Draft introduction', description: 'Begin with confidence', estimatedTime: '15 min', completed: false }
            ],
            quote: 'Magic is believing in yourself'
          };
          // Add stake and bounty to each task
          const tasksWithWager = mockData.tasks.map((task, index) => ({
            ...task,
            estimatedMinutes: 5,
            stake: 10 + (index * 5), // Increasing stakes
            bounty: 30 + (index * 10), // Increasing bounties
          }));
          setTasks(tasksWithWager);
          setQuote(mockData.quote);
          setIsLoading(false);
          // Award Magic stat for using AI
          addXP(10);
          // Voice narration
          voiceService.speakBreakdownComplete(mockData.tasks.length);
        }, 500);
      } else {
        // Live API call
        const response = await axios.post('http://127.0.0.1:8004/api/breakdown', {
          assignment,
          taskCount,
          isWizardMode,
        });
        const tasksWithWager = response.data.tasks.map((task: Task, index: number) => ({
          ...task,
          estimatedMinutes: parseInt(task.estimatedTime) || 5,
          stake: 10 + (index * 5),
          bounty: 30 + (index * 10),
        }));
        setTasks(tasksWithWager);
        setQuote(response.data.quote);
        setIsLoading(false);
        addXP(10);
        // Voice narration
        voiceService.speakBreakdownComplete(tasksWithWager.length);
      }
    } catch (error) {
      console.error('Breakdown error:', error);
      alert('Failed to generate breakdown. Make sure the backend is running!');
      setIsLoading(false);
    }
  };

  const handleStartTask = async (task: Task & { estimatedMinutes?: number; stake?: number; bounty?: number }) => {
    const stake = task.stake || 20;
    
    if (manaBalance < stake) {
      alert('Insufficient Mana! Complete more tasks to earn Mana.');
      return;
    }

    // Deduct stake
    try {
      await axios.post('http://127.0.0.1:8004/api/wager/start', {
        task_id: task.id,
        stake,
      });
      setManaBalance(prev => prev - stake);
      setActiveTask(task);
    } catch (error) {
      console.error('Failed to start wager:', error);
      alert('Failed to start task. Try again!');
    }
  };

  const handleTaskComplete = (won: boolean) => {
    if (activeTask) {
      if (won) {
        // Return stake + bounty
        const totalEarned = (activeTask.stake || 20) + (activeTask.bounty || 50);
        setManaBalance(prev => prev + totalEarned);
        
        // Mark task as completed
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(t => 
            t.id === activeTask.id ? { ...t, completed: true } : t
          );
          
          // Sequential flow: Find next incomplete task
          const nextTask = updatedTasks.find(t => !t.completed);
          
          if (nextTask) {
            // Auto-advance to next task after a brief delay
            setTimeout(() => {
              handleStartTask(nextTask as Task & { estimatedMinutes?: number; stake?: number; bounty?: number });
            }, 2000); // 2-second delay for celebration
          } else {
            // All tasks complete!
            setTimeout(() => {
              alert('🎉 All Quests Complete! You are victorious!');
            }, 2000);
          }
          
          return updatedTasks;
        });
      }
    }
    setActiveTask(null);
    loadBalance(); // Refresh from backend
  };

  const handleEditTask = (taskId: string, currentTitle: string) => {
    setEditingTaskId(taskId);
    setEditText(currentTitle);
  };

  const handleSaveEdit = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, title: editText } : task
      )
    );
    setEditingTaskId(null);
    setEditText('');
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }
  };

  if (activeTask) {
    return <HyperFocusMode task={activeTask} onComplete={handleTaskComplete} onCancel={() => handleTaskComplete(false)} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-fantasy text-white mb-2">Active Board</h1>
            <p className="text-neutral-400">
              Paste your assignment and let AI break it down into manageable tasks
            </p>
          </div>
          {/* Mana Balance */}
          <div className="bg-black border-2 border-house-primary rounded-lg px-8 py-4">
            <p className="text-sm text-neutral-400 text-center mb-1">Your Mana</p>
            <p className="text-4xl font-bold text-house-secondary text-center">{manaBalance}</p>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-black border border-neutral-800 rounded-lg p-6 mb-6">
          <label className="block text-white font-medium mb-3">
            Paste your assignment or task description:
          </label>
          <textarea
            value={assignment}
            onChange={(e) => setAssignment(e.target.value)}
            placeholder="e.g., Write a 5-page essay on climate change, due Friday..."
            className="w-full h-32 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-600 focus:border-house-primary focus:outline-none resize-none"
          />
          
          <div className="mt-4">
            <label className="block text-white font-medium mb-2">
              Number of tasks: <span className="text-house-secondary font-bold">{taskCount}</span>
            </label>
            <input
              type="range"
              min="3"
              max="20"
              value={taskCount}
              onChange={(e) => setTaskCount(parseInt(e.target.value))}
              className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--house-primary) 0%, var(--house-primary) ${((taskCount - 3) / 17) * 100}%, #404040 ${((taskCount - 3) / 17) * 100}%, #404040 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>3 tasks</span>
              <span>20 tasks</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handleBreakdown}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                  : 'bg-house-primary text-white hover:bg-house-secondary'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Feeding to Gemini AI...
                </span>
              ) : (
                '✨ Break Down Tasks'
              )}
            </button>
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length > 0 && (
          <div className="bg-black border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-fantasy text-white">Your Quest Log</h2>
              <button
                onClick={() => { if (window.confirm('Generate a completely new task list?')) handleBreakdown(); }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                🔄 Reroll
              </button>
            </div>
            
            {quote && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/50 rounded-lg">
                <p className="text-purple-200 italic text-center">"{quote}"</p>
              </div>
            )}

            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div key={task.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {editingTaskId === task.id ? (
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:border-house-primary focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(task.id)}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setEditingTaskId(null);
                              setEditText('');
                            }}
                            className="px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className={`flex-1 text-xl font-medium ${task.completed ? 'text-neutral-500 line-through' : 'text-white'}`}>
                            {task.title}
                          </h3>
                          {!task.completed && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditTask(task.id, task.title)}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                                title="Edit task title"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                                title="Delete task"
                              >
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <p className={`mb-3 ${task.completed ? 'text-neutral-600' : 'text-neutral-300'}`}>
                        {task.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-500">⏱️</span>
                          <button
                            onClick={() => {
                              const newMinutes = Math.max(1, ((task as any).estimatedMinutes || 5) - 1);
                              setTasks(tasks.map(t => 
                                t.id === task.id 
                                  ? { ...t, estimatedMinutes: newMinutes, estimatedTime: `${newMinutes} min` }
                                  : t
                              ));
                            }}
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-xs"
                            title="Decrease time"
                          >
                            -
                          </button>
                          <span className="text-white font-medium min-w-[60px] text-center">{task.estimatedTime}</span>
                          <button
                            onClick={() => {
                              const newMinutes = ((task as any).estimatedMinutes || 5) + 1;
                              setTasks(tasks.map(t => 
                                t.id === task.id 
                                  ? { ...t, estimatedMinutes: newMinutes, estimatedTime: `${newMinutes} min` }
                                  : t
                              ));
                            }}
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-xs"
                            title="Increase time"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-neutral-500">Stake: <span className="text-red-400">{(task as any).stake || 20} Mana</span></span>
                        <span className="text-neutral-500">Bounty: <span className="text-green-400">{(task as any).bounty || 50} Mana</span></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    {!task.completed && (
                      <button
                        onClick={() => handleStartTask(task as Task & { estimatedMinutes?: number; stake?: number; bounty?: number })}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-house-primary to-house-secondary text-white rounded-lg font-medium hover:shadow-lg transition-all"
                      >
                        ⚡ Start Quest
                      </button>
                    )}
                    {task.completed && (
                      <div className="flex-1 px-6 py-3 bg-green-900/30 border border-green-500 text-green-300 rounded-lg font-medium text-center">
                        ✓ Completed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
