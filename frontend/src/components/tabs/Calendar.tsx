import React, { useState } from 'react';
import { WaxSeal } from '../WaxSeal';
import { Confetti } from '../Confetti';
import { useStats } from '../../contexts/StatsContext';
import { useDemo } from '../../contexts/DemoContext';
import { HyperFocusMode } from '../HyperFocusMode';
import axios from 'axios';

interface CalendarTask {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  estimatedMinutes: number;
  stake: number;
  bounty: number;
  completed: boolean;
}

interface TimeSlot {
  hour: number;
  task: CalendarTask | null;
  isBlocked: boolean;
}

interface DaySchedule {
  [dayIndex: number]: TimeSlot[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0-23

export const Calendar: React.FC = () => {
  const [draggedTask, setDraggedTask] = useState<CalendarTask | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule>(() => {
    // Initialize with empty time slots
    const init: DaySchedule = {};
    for (let day = 0; day < 7; day++) {
      init[day] = HOURS.map(hour => ({ hour, task: null, isBlocked: false }));
    }
    return init;
  });
  const [showWaxSeal, setShowWaxSeal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [activeTask, setActiveTask] = useState<CalendarTask | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    estimatedMinutes: 60,
    stake: 10,
    bounty: 30,
  });
  const { addXP, completeTaskForDay } = useStats();
  const { demoMode } = useDemo();

  // Sample tasks - now editable
  const [availableTasks, setAvailableTasks] = useState<CalendarTask[]>([
    {
      id: 'task-1',
      title: '🔮 Research Sources',
      description: 'Find 8+ scholarly articles',
      estimatedTime: '3 hours',
      estimatedMinutes: 180,
      stake: 20,
      bounty: 60,
      completed: false,
    },
    {
      id: 'task-2',
      title: '📜 Create Bibliography',
      description: 'Summarize each source',
      estimatedTime: '2 hours',
      estimatedMinutes: 120,
      stake: 15,
      bounty: 45,
      completed: false,
    },
    {
      id: 'task-3',
      title: '🗺️ Outline Paper',
      description: 'Draft detailed outline',
      estimatedTime: '1 hour',
      estimatedMinutes: 60,
      stake: 10,
      bounty: 30,
      completed: false,
    },
    {
      id: 'task-4',
      title: '⚡ Write Introduction',
      description: 'Craft compelling intro',
      estimatedTime: '1.5 hours',
      estimatedMinutes: 90,
      stake: 12,
      bounty: 36,
      completed: false,
    },
    {
      id: 'task-5',
      title: '📖 Write Body',
      description: 'Develop main sections',
      estimatedTime: '6 hours',
      estimatedMinutes: 360,
      stake: 30,
      bounty: 90,
      completed: false,
    },
  ]);

  const days = [
    { index: 0, name: 'Monday', date: new Date(Date.now()) },
    { index: 1, name: 'Tuesday', date: new Date(Date.now() + 86400000) },
    { index: 2, name: 'Wednesday', date: new Date(Date.now() + 86400000 * 2) },
    { index: 3, name: 'Thursday', date: new Date(Date.now() + 86400000 * 3) },
    { index: 4, name: 'Friday', date: new Date(Date.now() + 86400000 * 4) },
    { index: 5, name: 'Saturday', date: new Date(Date.now() + 86400000 * 5) },
    { index: 6, name: 'Sunday', date: new Date(Date.now() + 86400000 * 6) },
  ];

  const handleAddTask = () => {
    if (!newTask.title.trim()) {
      alert('Task title is required!');
      return;
    }

    const task: CalendarTask = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      estimatedTime: `${Math.ceil(newTask.estimatedMinutes / 60)} hour${newTask.estimatedMinutes > 60 ? 's' : ''}`,
      estimatedMinutes: newTask.estimatedMinutes,
      stake: newTask.stake,
      bounty: newTask.bounty,
      completed: false,
    };

    setAvailableTasks(prev => [...prev, task]);
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      estimatedMinutes: 60,
      stake: 10,
      bounty: 30,
    });
    setShowTaskForm(false);
  };

  const handleDeleteTask = (taskId: string) => {
    // Remove from available tasks
    setAvailableTasks(prev => prev.filter(t => t.id !== taskId));
    
    // Remove from schedule if it was placed
    setSchedule(prev => {
      const newSchedule = { ...prev };
      Object.keys(newSchedule).forEach(dayIndex => {
        newSchedule[parseInt(dayIndex)] = newSchedule[parseInt(dayIndex)].map(slot =>
          slot.task?.id === taskId ? { ...slot, task: null } : slot
        );
      });
      return newSchedule;
    });
  };

  const handleBreakDownTask = (task: CalendarTask) => {
    // Store task info for ActiveBoard to pick up
    const breakdownData = {
      title: task.title,
      description: task.description,
      timestamp: Date.now(),
    };
    localStorage.setItem('pendingTaskBreakdown', JSON.stringify(breakdownData));
    
    // Notify user to switch tabs
    alert('📋 Task ready for breakdown! Switch to the "Active Board" tab to break it down with AI.');
  };

  const handleDragStart = (task: CalendarTask) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSlot = (dayIndex: number, hour: number) => {
    if (!draggedTask) return;

    const slot = schedule[dayIndex][hour];
    if (slot.isBlocked || slot.task) {
      alert('This time slot is already occupied!');
      setDraggedTask(null);
      return;
    }

    // Calculate how many hours this task needs
    const hoursNeeded = Math.ceil(draggedTask.estimatedMinutes / 60);
    
    // Check if there's enough consecutive free slots
    let canFit = true;
    for (let i = 0; i < hoursNeeded; i++) {
      const checkHour = hour + i;
      if (checkHour >= 24 || schedule[dayIndex][checkHour].task || schedule[dayIndex][checkHour].isBlocked) {
        canFit = false;
        break;
      }
    }

    if (!canFit) {
      alert(`This task needs ${hoursNeeded} consecutive hours. Not enough space here!`);
      setDraggedTask(null);
      return;
    }

    // Place task in the required slots
    setSchedule(prev => {
      const newSchedule = { ...prev };
      for (let i = 0; i < hoursNeeded; i++) {
        newSchedule[dayIndex][hour + i] = {
          ...newSchedule[dayIndex][hour + i],
          task: { ...draggedTask },
        };
      }
      return newSchedule;
    });

    setDraggedTask(null);
  };

  const handleToggleBlock = (dayIndex: number, hour: number) => {
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: prev[dayIndex].map(slot =>
        slot.hour === hour
          ? { ...slot, isBlocked: !slot.isBlocked, task: null }
          : slot
      ),
    }));
  };

  const handleStartTask = (dayIndex: number, hour: number) => {
    const slot = schedule[dayIndex][hour];
    if (!slot.task || slot.task.completed) return;

    // Launch HyperFocusMode with this task
    setActiveTask(slot.task);
  };

  const handleTaskComplete = (won: boolean) => {
    if (!activeTask) return;

    if (won) {
      // Mark all slots with this task as completed
      setSchedule(prev => {
        const newSchedule = { ...prev };
        Object.keys(newSchedule).forEach(dayIndex => {
          newSchedule[parseInt(dayIndex)] = newSchedule[parseInt(dayIndex)].map(s =>
            s.task?.id === activeTask.id
              ? { ...s, task: { ...s.task!, completed: true } }
              : s
          );
        });
        return newSchedule;
      });

      // Award XP and update streak
      addXP(activeTask.bounty);
      completeTaskForDay();

      // Show celebration
      setShowWaxSeal(true);
      setShowConfetti(true);

      setTimeout(() => {
        setShowWaxSeal(false);
        setShowConfetti(false);
      }, 3000);
    }

    setActiveTask(null);
  };

  const handleRemoveTask = (dayIndex: number, hour: number) => {
    const task = schedule[dayIndex][hour].task;
    if (!task) return;

    // Remove all slots with this task
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: prev[dayIndex].map(slot =>
        slot.task?.id === task.id ? { ...slot, task: null } : slot
      ),
    }));
  };

  const handleOrganizeDay = async () => {
    setIsOrganizing(true);

    if (demoMode === 'fast') {
      // Demo mode: Perfect hardcoded schedule
      setTimeout(() => {
        setSchedule(prev => {
          const newSchedule = { ...prev };
          
          // Monday: Task 1 (3 hours) at 9 AM
          for (let i = 0; i < 3; i++) {
            newSchedule[0][9 + i] = { hour: 9 + i, task: availableTasks[0], isBlocked: false };
          }
          
          // Tuesday: Task 2 (2 hours) at 2 PM
          for (let i = 0; i < 2; i++) {
            newSchedule[1][14 + i] = { hour: 14 + i, task: availableTasks[1], isBlocked: false };
          }
          
          // Wednesday: Task 3 (1 hour) at 10 AM
          newSchedule[2][10] = { hour: 10, task: availableTasks[2], isBlocked: false };
          
          // Thursday: Task 4 (1.5 hours → 2 slots) at 3 PM
          for (let i = 0; i < 2; i++) {
            newSchedule[3][15 + i] = { hour: 15 + i, task: availableTasks[3], isBlocked: false };
          }
          
          // Friday: Task 5 (6 hours) at 9 AM
          for (let i = 0; i < 6; i++) {
            newSchedule[4][9 + i] = { hour: 9 + i, task: availableTasks[4], isBlocked: false };
          }
          
          return newSchedule;
        });
        setIsOrganizing(false);
      }, 1500);
    } else {
      // Live mode: Use AI scheduler
      try {
        // Build available hours list
        const availableHours: Array<{ dayIndex: number; hour: number; isBlocked: boolean }> = [];
        Object.entries(schedule).forEach(([dayIndex, slots]) => {
          slots.forEach((slot: TimeSlot) => {
            if (!slot.task && !slot.isBlocked) {
              availableHours.push({
                dayIndex: parseInt(dayIndex),
                hour: slot.hour,
                isBlocked: false,
              });
            }
          });
        });

        // Call AI scheduler API
        const response = await axios.post('http://127.0.0.1:8004/api/schedule', {
          tasks: availableTasks.map(task => ({
            title: task.title,
            description: task.description,
            estimatedMinutes: task.estimatedMinutes,
            stake: task.stake,
            bounty: task.bounty,
          })),
          available_hours: availableHours,
        });

        const aiSchedule = response.data.schedule;

        // Apply AI schedule
        setSchedule(prev => {
          const newSchedule = { ...prev };
          
          aiSchedule.forEach((item: any) => {
            const task = availableTasks[item.taskIndex];
            if (!task) return;
            
            const hoursNeeded = Math.ceil(task.estimatedMinutes / 60);
            for (let i = 0; i < hoursNeeded; i++) {
              const hour = item.startHour + i;
              if (hour < 24 && newSchedule[item.dayIndex][hour]) {
                newSchedule[item.dayIndex][hour] = {
                  hour,
                  task: { ...task },
                  isBlocked: false,
                };
              }
            }
          });
          
          return newSchedule;
        });
      } catch (error) {
        console.error('AI scheduling failed:', error);
        alert('AI scheduling failed. Try demo mode or schedule manually.');
      } finally {
        setIsOrganizing(false);
      }
    }
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}${period}`;
  };

  // Check if schedule is too full
  const getTotalScheduledHours = () => {
    let total = 0;
    Object.values(schedule).forEach(day => {
      day.forEach((slot: TimeSlot) => {
        if (slot.task || slot.isBlocked) total++;
      });
    });
    return total;
  };

  const totalHours = 7 * 24;
  const scheduledHours = getTotalScheduledHours();
  const isTooFull = scheduledHours > totalHours * 0.8; // Warning if >80% full

  // If in HyperFocus mode, render only that
  if (activeTask) {
    return <HyperFocusMode task={activeTask} onComplete={handleTaskComplete} onCancel={() => handleTaskComplete(false)} />;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2 font-fantasy">
            📅 Your Quest Calendar
          </h2>
          <p className="text-var-text-dim">
            Drag tasks to specific time slots • Right-click to block busy times
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {isTooFull && (
            <div className="px-4 py-2 bg-red-900/30 border border-red-500 rounded-lg text-sm">
              ⚠️ Schedule nearly full! ({scheduledHours}/{totalHours} hours)
            </div>
          )}
          
          <button
            onClick={handleOrganizeDay}
            disabled={isOrganizing}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {isOrganizing ? '🪄 Organizing...' : '✨ Organize My Day'}
          </button>
        </div>
      </div>

      {/* Available Tasks */}
      <div className="mb-6 p-4 card rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold font-fantasy">Available Quests</h3>
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition-colors text-sm"
          >
            {showTaskForm ? '✕ Cancel' : '+ Add Custom Quest'}
          </button>
        </div>

        {/* Task Creation Form */}
        {showTaskForm && (
          <div className="mb-4 p-4 bg-var-surface-secondary rounded-lg border border-var-border-subtle">
            <h4 className="font-bold mb-3">Create New Quest</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm mb-1 text-var-text-primary">Quest Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="🔮 My Custom Quest"
                  className="w-full px-3 py-2 bg-neutral-900 text-white border border-neutral-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm mb-1 text-var-text-primary">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="What do you need to accomplish?"
                  className="w-full px-3 py-2 bg-neutral-900 text-white border border-neutral-700 rounded h-20 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-var-text-primary">Duration (minutes)</label>
                <input
                  type="number"
                  value={newTask.estimatedMinutes}
                  onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: Math.max(1, parseInt(e.target.value) || 0) })}
                  min="1"
                  step="15"
                  className="w-full px-3 py-2 bg-neutral-900 text-white border border-neutral-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-var-text-primary">Stake (coins to risk)</label>
                <input
                  type="number"
                  value={newTask.stake}
                  onChange={(e) => setNewTask({ ...newTask, stake: Math.max(0, parseInt(e.target.value) || 0) })}
                  min="0"
                  className="w-full px-3 py-2 bg-neutral-900 text-white border border-neutral-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-var-text-primary">Bounty (coins to earn)</label>
                <input
                  type="number"
                  value={newTask.bounty}
                  onChange={(e) => setNewTask({ ...newTask, bounty: Math.max(0, parseInt(e.target.value) || 0) })}
                  min="0"
                  className="w-full px-3 py-2 bg-neutral-900 text-white border border-neutral-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={handleAddTask}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors"
                >
                  ✨ Create Quest
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {availableTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={() => handleDragStart(task)}
              className="p-3 bg-var-surface-secondary rounded cursor-move hover:bg-var-surface-hover transition-colors border border-var-border-subtle relative"
            >
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-sm"
                title="Delete task"
              >
                ✕
              </button>
              <div className="flex items-center justify-between mb-2 pr-6">
                <h4 className="font-bold text-sm">{task.title}</h4>
                <span className="text-xs text-var-accent-primary bg-var-surface-tertiary px-2 py-1 rounded">
                  {task.estimatedTime}
                </span>
              </div>
              <p className="text-xs text-var-text-dim mb-2">{task.description}</p>
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">Stake: {task.stake}🔮</span>
                  <span className="text-green-400">Bounty: {task.bounty}🔮</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBreakDownTask(task);
                  }}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition-colors"
                  title="Break down this task with AI"
                >
                  🤖 Break Down
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Calendar Grid */}
      <div className="card rounded-lg p-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-var-border-subtle p-2 bg-var-surface-secondary sticky left-0 z-10 w-20">
                Time
              </th>
              {days.map((day) => (
                <th key={day.index} className="border border-var-border-subtle p-2 bg-var-surface-secondary min-w-[140px]">
                  <div className="font-bold text-var-accent-primary">{day.name}</div>
                  <div className="text-xs text-var-text-dim">{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} className={hour % 2 === 0 ? 'bg-var-surface-primary' : 'bg-var-surface-secondary/50'}>
                <td className="border border-var-border-subtle p-2 text-center font-bold sticky left-0 z-10 bg-var-surface-secondary">
                  {formatHour(hour)}
                </td>
                {days.map((day) => {
                  const slot = schedule[day.index][hour];
                  const isBlocked = slot.isBlocked;
                  const task = slot.task;
                  const isFirstSlotOfTask = task && (hour === 0 || schedule[day.index][hour - 1].task?.id !== task.id);

                  return (
                    <td
                      key={`${day.index}-${hour}`}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropOnSlot(day.index, hour)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (!task) handleToggleBlock(day.index, hour);
                      }}
                      className={`border border-var-border-subtle p-1 cursor-pointer transition-colors ${
                        isBlocked
                          ? 'bg-gray-800/50 hover:bg-gray-700/50'
                          : task
                          ? task.completed
                            ? 'bg-green-900/30 border-green-500'
                            : 'bg-blue-900/30 border-blue-500 hover:bg-blue-800/40'
                          : 'hover:bg-var-surface-hover'
                      }`}
                      style={{ minHeight: '60px' }}
                    >
                      {isBlocked && (
                        <div className="text-center text-xs text-gray-500">
                          🚫 Blocked
                        </div>
                      )}
                      
                      {task && isFirstSlotOfTask && (
                        <div className="p-1">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-bold flex-1">{task.title}</span>
                            <button
                              onClick={() => handleRemoveTask(day.index, hour)}
                              className="text-red-400 hover:text-red-300 text-xs ml-1"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="text-xs text-var-text-dim mb-1">
                            {task.estimatedTime}
                          </div>
                          <button
                            onClick={() => handleStartTask(day.index, hour)}
                            disabled={task.completed}
                            className={`w-full px-2 py-1 rounded text-xs ${
                              task.completed
                                ? 'bg-green-600/50 cursor-not-allowed'
                                : 'bg-var-accent-primary hover:brightness-110'
                            }`}
                          >
                            {task.completed ? '✓ Done' : '⚡ Start Task'}
                          </button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 card rounded-lg">
        <h4 className="font-bold mb-2">How to Use:</h4>
        <ul className="text-sm text-var-text-dim space-y-1">
          <li>• <strong>Drag tasks</strong> from "Available Quests" to time slots</li>
          <li>• <strong>Right-click</strong> empty slots to mark as busy/blocked</li>
          <li>• Tasks automatically span multiple hours based on duration</li>
          <li>• Click <strong>"✨ Organize My Day"</strong> for AI-powered scheduling</li>
          <li>• Click <strong>"⚡ Start Task"</strong> on scheduled tasks to begin the timer</li>
        </ul>
      </div>

      {/* Effects */}
      {<WaxSeal show={showWaxSeal} />}
      {<Confetti active={showConfetti} />}
    </div>
  );
};
