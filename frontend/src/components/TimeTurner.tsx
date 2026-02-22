/**
 * Time Turner Timeline - Visual deadline countdown for time blindness
 * Shows horizontal progress from Today to Final Deadline
 */

import React, { useState, useEffect } from 'react'

interface TimeTurnerProps {
  finalDeadline: Date | null
  onSetDeadline: (date: Date) => void
}

export function TimeTurner({ finalDeadline, onSetDeadline }: TimeTurnerProps) {
  const [dateInput, setDateInput] = useState('')
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    percentRemaining: 100
  })

  useEffect(() => {
    if (!finalDeadline) return

    const updateCountdown = () => {
      const now = new Date()
      const diff = finalDeadline.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, percentRemaining: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      // Calculate percent remaining (assume 30 days max for visual)
      const totalTime = 30 * 24 * 60 * 60 * 1000 // 30 days in ms
      const remainingTime = diff
      const percentRemaining = Math.min(100, (remainingTime / totalTime) * 100)

      setTimeLeft({ days, hours, minutes, percentRemaining })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [finalDeadline])

  const handleSetDeadline = () => {
    if (!dateInput) return
    const deadline = new Date(dateInput)
    if (deadline > new Date()) {
      onSetDeadline(deadline)
    }
  }

  // Visual urgency color
  const getUrgencyColor = () => {
    if (timeLeft.percentRemaining > 66) return 'from-green-500 to-emerald-600'
    if (timeLeft.percentRemaining > 33) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-rose-700'
  }

  const getTextColor = () => {
    if (timeLeft.percentRemaining > 66) return 'text-green-700'
    if (timeLeft.percentRemaining > 33) return 'text-orange-700'
    return 'text-red-700'
  }

  if (!finalDeadline) {
    return (
      <div className="contract-card bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-purple-900 mb-2">⏰ The Time Turner</h2>
          <p className="text-sm text-purple-700 mb-4">
            Make time visible. Beat time blindness. Set your final deadline.
          </p>
          
          <div className="flex gap-2 items-center justify-center">
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSetDeadline}
              className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Activate Timeline
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="contract-card bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-purple-900">⏰ The Time Turner</h2>
          <button
            onClick={() => onSetDeadline(null as any)}
            className="text-xs text-purple-600 hover:text-purple-800 underline"
          >
            Reset Deadline
          </button>
        </div>
        
        <div className="flex justify-between text-sm text-purple-700 mb-2">
          <span className="font-semibold">📍 Today</span>
          <span className="font-semibold">🎯 Final Deadline</span>
        </div>

        {/* Visual Timeline */}
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          {/* Remaining time bar */}
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getUrgencyColor()} transition-all duration-1000 ease-linear`}
            style={{ width: `${timeLeft.percentRemaining}%` }}
          >
            <div className="absolute inset-0 opacity-20 bg-white animate-pulse"></div>
          </div>

          {/* "Today" marker that moves */}
          <div
            className="absolute top-0 h-full w-1 bg-black shadow-lg z-10"
            style={{ left: `${100 - timeLeft.percentRemaining}%` }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-black whitespace-nowrap">
              RIGHT NOW
            </div>
          </div>
        </div>

        {/* Countdown numbers */}
        <div className={`mt-4 text-center ${getTextColor()}`}>
          <div className="text-3xl font-black tracking-tight">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </div>
          <div className="text-sm font-semibold uppercase tracking-wider mt-1">
            Until Deadline
          </div>
        </div>

        {/* Urgency message */}
        {timeLeft.percentRemaining < 33 && (
          <div className="mt-3 p-3 bg-red-100 border-2 border-red-400 rounded-lg">
            <p className="text-red-900 font-bold text-center text-sm animate-pulse">
              ⚠️ TIME IS RUNNING OUT! Accept contracts NOW! ⚠️
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
