import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../data/mockData';
import { WaxSeal } from './WaxSeal';
import { Confetti } from './Confetti';
import { useStats } from '../contexts/StatsContext';
import { voiceService } from '../services/elevenlabs';
import axios from 'axios';

interface HyperFocusModeProps {
  task: Task & { estimatedMinutes?: number; stake?: number; bounty?: number };
  onComplete: (won: boolean) => void;
  onCancel: () => void;
}

export const HyperFocusMode: React.FC<HyperFocusModeProps> = ({ task, onComplete, onCancel }) => {
  const [timeLeft, setTimeLeft] = useState((task.estimatedMinutes || 5) * 60); // Convert to seconds
  const [isPaused, setIsPaused] = useState(false);
  const [showWaxSeal, setShowWaxSeal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasSpokenEncouragement, setHasSpokenEncouragement] = useState(false);
  const [hasSpokenWarning, setHasSpokenWarning] = useState(false);
  const hasSpokenStartRef = useRef(false);
  const { addXP, completeTaskForDay } = useStats();

  const totalTime = (task.estimatedMinutes || 5) * 60;
  const stake = task.stake || 20;
  const bounty = task.bounty || 50;

  // Speak task start on mount (only once)
  useEffect(() => {
    if (!hasSpokenStartRef.current) {
      hasSpokenStartRef.current = true;
      const estimatedTime = task.estimatedTime || `${task.estimatedMinutes || 5} minutes`;
      voiceService.speakTaskStart(task.title, estimatedTime);
    }
    
    return () => {
      voiceService.stop();
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - lost the wager
          handleTimerExpired();
          return 0;
        }
        
        // Voice encouragement at 50% mark
        const percentRemaining = (prev / totalTime) * 100;
        if (percentRemaining <= 50 && percentRemaining > 49 && !hasSpokenEncouragement) {
          voiceService.speakEncouragement(prev);
          setHasSpokenEncouragement(true);
        }
        
        // Voice warning at 25% mark
        if (percentRemaining <= 25 && percentRemaining > 24 && !hasSpokenWarning) {
          voiceService.speakWarning();
          setHasSpokenWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft, hasSpokenEncouragement, hasSpokenWarning]);

  const handleTimerExpired = async () => {
    // Lost the wager
    voiceService.speakDefeat(stake);
    try {
      await axios.post('http://127.0.0.1:8004/api/wager/complete', {
        task_id: task.id,
        bounty: 0,
        stake,
        won: false,
      });
    } catch (error) {
      console.error('Failed to record loss:', error);
    }
    onComplete(false);
  };

  const handleCompleteTask = async () => {
    if (timeLeft <= 0) return;

    // Won the wager!
    voiceService.speakVictory(bounty);
    setShowWaxSeal(true);
    setShowConfetti(true);

    // Award XP
    addXP(bounty);
    
    // Update daily streak and Endurance
    completeTaskForDay();

    // Record win on backend
    try {
      await axios.post('http://127.0.0.1:8004/api/wager/complete', {
        task_id: task.id,
        bounty,
        stake,
        won: true,
      });
    } catch (error) {
      console.error('Failed to record win:', error);
    }

    // Increase Focus stat if completed quickly
    const timeUsed = totalTime - timeLeft;
    if (timeUsed < totalTime * 0.8) {
      // Completed in less than 80% of time - bonus!
      addXP(10);
    }

    setTimeout(() => {
      setShowWaxSeal(false);
      setShowConfetti(false);
      onComplete(true);
    }, 3000);
  };

  const handleAbandon = async () => {
    if (window.confirm('Are you sure? You will lose your staked Mana.')) {
      try {
        await axios.post('http://127.0.0.1:8004/api/wager/complete', {
          task_id: task.id,
          bounty: 0,
          stake,
          won: false,
        });
      } catch (error) {
        console.error('Failed to record abandon:', error);
      }
      onComplete(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (timeLeft / totalTime) * 100;
  const isUrgent = timeLeft < 60; // Less than 1 minute

  return (
    <div className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center ${isUrgent ? 'animate-pulse-red' : ''}`}>
      {/* Header */}
      <div className="absolute top-8 right-8 flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm text-neutral-400">Stake</p>
          <p className="text-xl font-bold text-red-500">{stake} Mana</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-neutral-400">Bounty</p>
          <p className="text-xl font-bold text-green-500">+{bounty} Mana</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl w-full px-8 text-center">
        {/* Task Title */}
        <h1 className="text-4xl font-fantasy text-white mb-8">
          {task.title}
        </h1>

        {/* Timer Circle */}
        <div className="relative w-80 h-80 mx-auto mb-12">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="currentColor"
              strokeWidth="20"
              fill="none"
              className="text-neutral-800"
            />
            <circle
              cx="160"
              cy="160"
              r="140"
              stroke="currentColor"
              strokeWidth="20"
              fill="none"
              className={isUrgent ? 'text-red-500' : 'text-house-primary'}
              strokeDasharray={`${2 * Math.PI * 140}`}
              strokeDashoffset={`${2 * Math.PI * 140 * (1 - progressPercent / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>

          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`text-7xl font-bold ${isUrgent ? 'text-red-500' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </p>
            <p className="text-neutral-400 mt-2">
              {Math.round(progressPercent)}% remaining
            </p>
          </div>
        </div>

        {/* Task Description */}
        <p className="text-xl text-neutral-300 mb-8 italic">
          "{task.description}"
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleAbandon}
            className="px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-all"
          >
            🏳️ Abandon Quest
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-all"
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>

          <button
            onClick={handleCompleteTask}
            disabled={timeLeft <= 0}
            className={`px-12 py-6 rounded-lg font-bold text-2xl transition-all shadow-2xl ${
              timeLeft <= 0
                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white hover:scale-105'
            }`}
          >
            ✨ Complete Quest
          </button>
        </div>

        {/* Warning Text */}
        {isUrgent && (
          <p className="text-red-500 font-bold text-lg mt-6 animate-pulse">
            ⚠️ LESS THAN 1 MINUTE LEFT!
          </p>
        )}
      </div>

      {/* Animations */}
      <WaxSeal show={showWaxSeal} />
      <Confetti active={showConfetti} />
    </div>
  );
};
