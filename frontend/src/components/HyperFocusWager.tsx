/**
 * HyperFocusWager - Full-screen immersive mode with visual timer
 * Hides everything else to combat executive dysfunction
 */

import React, { useState, useEffect } from 'react'
import { api, MicroTask } from '../services/api'

interface HyperFocusWagerProps {
  task: MicroTask
  balance: number
  onComplete: (won: boolean) => void
  onCancel: () => void
}

export function HyperFocusWager({ task, balance, onComplete, onCancel }: HyperFocusWagerProps) {
  const [timeLeft, setTimeLeft] = useState(task.duration_minutes * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleLoss()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleWin = async () => {
    try {
      await api.completeWager(task.id, task.reward_bounty, task.required_stake, true)
      onComplete(true)
    } catch (err) {
      console.error('Failed to complete wager:', err)
    }
  }

  const handleLoss = async () => {
    try {
      await api.completeWager(task.id, task.reward_bounty, task.required_stake, false)
      onComplete(false)
    } catch (err) {
      console.error('Failed to record loss:', err)
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = (timeLeft / (task.duration_minutes * 60)) * 100

  // Visual urgency colors
  const getBackgroundGradient = () => {
    if (progress > 66) return 'from-blue-900 via-purple-900 to-indigo-900'
    if (progress > 33) return 'from-orange-900 via-red-900 to-pink-900'
    return 'from-red-950 via-black to-gray-900'
  }

  const getAuraColor = () => {
    if (progress > 66) return 'shadow-blue-500/50'
    if (progress > 33) return 'shadow-orange-500/50'
    return 'shadow-red-500/50'
  }

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${getBackgroundGradient()} flex items-center justify-center z-50 transition-colors duration-1000`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl w-full px-8">
        
        {/* Task title */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-8 drop-shadow-lg">
          {task.title}
        </h1>

        {/* Visual Timer - Shrinking Magical Aura */}
        <div className="relative mb-12">
          {/* Outer glow ring */}
          <div 
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-2xl ${getAuraColor()} transition-all duration-1000`}
            style={{
              width: `${Math.max(200, 400 * (progress / 100))}px`,
              height: `${Math.max(200, 400 * (progress / 100))}px`,
              boxShadow: `0 0 ${Math.max(40, 120 * (progress / 100))}px currentColor`
            }}
          ></div>

          {/* Inner circle with timer */}
          <div className="relative mx-auto w-64 h-64 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
            <div>
              <div className={`text-7xl font-black text-white drop-shadow-2xl transition-all ${
                timeLeft < 60 ? 'animate-pulse scale-110' : ''
              }`}>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-white/70 text-sm font-semibold mt-2 uppercase tracking-widest">
                Time Remaining
              </div>
            </div>
          </div>

          {/* Draining hourglass effect - particles falling */}
          {timeLeft < 120 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-60 animate-bounce"
                  style={{
                    left: `${Math.random() * 60 - 30}px`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s'
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        {/* Stakes display */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-red-400 text-sm font-bold uppercase tracking-wider mb-1">
              ⚠️ At Risk
            </div>
            <div className="text-5xl font-black text-red-300 drop-shadow-lg">
              {task.required_stake}
            </div>
            <div className="text-white/50 text-xs mt-1">Mana</div>
          </div>

          <div className="text-white/30 text-5xl font-thin self-center">
            |
          </div>

          <div className="text-center">
            <div className="text-green-400 text-sm font-bold uppercase tracking-wider mb-1">
              ✨ To Win
            </div>
            <div className="text-5xl font-black text-green-300 drop-shadow-lg">
              {task.reward_bounty}
            </div>
            <div className="text-white/50 text-xs mt-1">Mana</div>
          </div>
        </div>

        {/* Encouragement quote */}
        <p className="text-xl italic text-white/80 mb-12 max-w-2xl mx-auto drop-shadow">
          "{task.encouragement_quote}"
        </p>

        {/* Action buttons */}
        <div className="flex gap-6 justify-center">
          <button
            onClick={onCancel}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white/70 font-bold rounded-lg hover:bg-white/20 transition-all border-2 border-white/20"
          >
            Forfeit
          </button>
          <button
            onClick={handleWin}
            className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-xl rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-2xl shadow-green-500/50 animate-pulse"
          >
            TASK COMPLETE! 🎉
          </button>
        </div>

        {/* Urgency warning */}
        {timeLeft < 60 && (
          <div className="mt-8 animate-pulse">
            <p className="text-red-300 font-black text-2xl uppercase tracking-wider drop-shadow-lg">
              ⚠️ FINAL MINUTE ⚠️
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
