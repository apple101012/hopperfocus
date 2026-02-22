/**
 * ActiveWager Component
 * High-stakes task view with countdown timer
 * This is the hyper-focus accessibility UI
 */

import React, { useState, useEffect, useRef } from 'react'
import { Clock, Trophy, AlertTriangle, X } from 'lucide-react'
import { api, MicroTask } from '../services/api'

interface ActiveWagerProps {
  task: MicroTask
  balance: number
  onComplete: (won: boolean) => void
  onCancel: () => void
}

export const ActiveWager: React.FC<ActiveWagerProps> = ({
  task,
  balance,
  onComplete,
  onCancel
}) => {
  const [status, setStatus] = useState<'ready' | 'active' | 'finished'>('ready')
  const [timeLeft, setTimeLeft] = useState(task.duration_minutes * 60) // in seconds
  const [stakeDeducted, setStakeDeducted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isUrgent = timeLeft <= 60 && status === 'active'
  const progress = (timeLeft / (task.duration_minutes * 60)) * 100

  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - auto-lose
            handleTimerEnd()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status])

  const handleStart = async () => {
    if (balance < task.required_stake) {
      alert('Insufficient Mana!')
      return
    }

    try {
      // Deduct stake from balance
      await api.startWager(task.id, task.required_stake)
      setStakeDeducted(true)
      setStatus('active')
    } catch (err) {
      alert('Failed to start wager. Check backend.')
      console.error(err)
    }
  }

  const handleClaim = async () => {
    if (timerRef.current) clearInterval(timerRef.current)

    try {
      // Award bounty for completing on time
      await api.completeWager(task.id, task.reward_bounty, task.required_stake, true)
      setStatus('finished')
      onComplete(true)
    } catch (err) {
      alert('Failed to claim bounty')
      console.error(err)
    }
  }

  const handleTimerEnd = async () => {
    if (timerRef.current) clearInterval(timerRef.current)

    try {
      // Record stake loss
      await api.completeWager(task.id, task.reward_bounty, task.required_stake, false)
      setStatus('finished')
      onComplete(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`max-w-2xl w-full contract-card relative ${
          isUrgent ? 'urgent-pulse wager-border border-red-500' : 'wager-border'
        }`}
      >
        {/* Close button */}
        {status === 'ready' && (
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Ready state */}
        {status === 'ready' && (
          <div className="text-center">
            <div className="mb-6">
              <Trophy className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-amber-900 mb-2">Accept the Wager?</h2>
              <p className="text-lg text-gray-700 font-semibold">{task.title}</p>
            </div>

            <div className="bg-amber-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-4 italic">
                "{task.encouragement_quote}"
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-600">Time Limit</p>
                  <p className="text-2xl font-bold text-gray-800">{task.duration_minutes}m</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Stake Required</p>
                  <p className="text-2xl font-bold text-red-600">{task.required_stake}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Bounty</p>
                  <p className="text-2xl font-bold text-green-600">{task.reward_bounty}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-300 rounded p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-red-800">High-Stakes Warning</p>
                  <p className="text-xs text-red-700">
                    If the timer reaches 00:00 before you claim your bounty, you will lose your {task.required_stake} Mana stake permanently.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition"
            >
              Accept Contract (Stake {task.required_stake} Mana)
            </button>
          </div>
        )}

        {/* Active timer state */}
        {status === 'active' && (
          <div className="text-center">
            <div className="mb-6">
              <Clock className={`w-16 h-16 mx-auto mb-4 ${isUrgent ? 'text-red-600' : 'text-amber-600'}`} />
              <h2 className="text-2xl font-bold text-amber-900 mb-2">{task.title}</h2>
            </div>

            {/* Countdown timer */}
            <div className={`mb-6 ${isUrgent ? 'animate-pulse' : ''}`}>
              <div className={`text-8xl font-bold mb-4 ${isUrgent ? 'text-red-600' : 'text-amber-900'}`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isUrgent ? 'bg-red-600' : 'bg-amber-600'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {isUrgent && (
              <div className="bg-red-50 border border-red-300 rounded p-3 mb-6">
                <p className="text-sm font-semibold text-red-800">⚠️ TIME RUNNING OUT!</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-amber-50 rounded">
              <div>
                <p className="text-xs text-gray-600">At Risk</p>
                <p className="text-xl font-bold text-red-600">{task.required_stake} Mana</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">To Win</p>
                <p className="text-xl font-bold text-green-600">
                  {task.reward_bounty + task.required_stake} Mana
                </p>
              </div>
            </div>

            <button
              onClick={handleClaim}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition"
            >
              <Trophy className="inline w-6 h-6 mr-2" />
              Claim Bounty (I'm Done!)
            </button>
          </div>
        )}

        {/* Finished state (handled by parent) */}
      </div>
    </div>
  )
}
