/**
 * Contract Customizer - Edit task details before accepting
 * Allows customization of title, due date, timer, stake, and bounty
 */

import React, { useState } from 'react'
import { MicroTask } from '../services/api'

interface ContractCustomizerProps {
  task: MicroTask
  finalDeadline: Date | null
  onAccept: (customizedTask: MicroTask & { dueDate?: Date }) => void
  onCancel: () => void
}

export function ContractCustomizer({ task, finalDeadline, onAccept, onCancel }: ContractCustomizerProps) {
  const [title, setTitle] = useState(task.title)
  const [durationMinutes, setDurationMinutes] = useState(task.duration_minutes)
  const [stake, setStake] = useState(task.required_stake)
  const [bounty, setBounty] = useState(task.reward_bounty)
  const [dueDateInput, setDueDateInput] = useState('')

  const handleAccept = () => {
    const customized = {
      ...task,
      title,
      duration_minutes: durationMinutes,
      required_stake: stake,
      reward_bounty: bounty,
      dueDate: dueDateInput ? new Date(dueDateInput) : undefined
    }
    onAccept(customized)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">
            📜 Customize Your Contract
          </h2>
          
          <p className="text-sm text-gray-600 mb-6">
            The AI has made a suggestion. Edit any details before accepting this contract.
          </p>

          {/* Task Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contract Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="What will you accomplish?"
            />
          </div>

          {/* Timer Duration */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Timer Duration (minutes)
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDurationMinutes(Math.max(1, durationMinutes - 5))}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
              >
                -5
              </button>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 text-center px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-lg"
                min="1"
              />
              <button
                onClick={() => setDurationMinutes(durationMinutes + 5)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
              >
                +5
              </button>
              <span className="text-sm text-gray-600">minutes</span>
            </div>
          </div>

          {/* Due Date on Timeline */}
          {finalDeadline && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assign to Specific Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                max={finalDeadline.toISOString().slice(0, 16)}
                className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Place this task on your Time Turner timeline
              </p>
            </div>
          )}

          {/* Stake & Bounty */}
          <div className="mb-4 p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
            <div className="mb-3">
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Mana Stake (Risk)
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setStake(Math.max(5, stake - 5))}
                  className="px-4 py-2 bg-red-200 rounded-lg hover:bg-red-300 font-bold"
                >
                  -5
                </button>
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Math.max(5, parseInt(e.target.value) || 5))}
                  className="w-24 text-center px-4 py-2 border-2 border-amber-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-bold text-lg"
                  min="5"
                />
                <button
                  onClick={() => setStake(stake + 5)}
                  className="px-4 py-2 bg-red-200 rounded-lg hover:bg-red-300 font-bold"
                >
                  +5
                </button>
                <span className="text-sm text-gray-600">Mana at risk</span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                ⚠️ Higher stakes = More adrenaline = Better focus
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Bounty Reward (Win)
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setBounty(Math.max(stake + 5, bounty - 5))}
                  className="px-4 py-2 bg-green-200 rounded-lg hover:bg-green-300 font-bold"
                >
                  -5
                </button>
                <input
                  type="number"
                  value={bounty}
                  onChange={(e) => setBounty(Math.max(stake + 5, parseInt(e.target.value) || stake + 10))}
                  className="w-24 text-center px-4 py-2 border-2 border-amber-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-bold text-lg"
                  min={stake + 5}
                />
                <button
                  onClick={() => setBounty(bounty + 5)}
                  className="px-4 py-2 bg-green-200 rounded-lg hover:bg-green-300 font-bold"
                >
                  +5
                </button>
                <span className="text-sm text-gray-600">Mana reward</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                ✨ You'll earn this + your stake back if you complete on time
              </p>
            </div>
          </div>

          {/* Encouragement Quote */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <p className="text-sm italic text-blue-900">
              "{task.encouragement_quote}"
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors shadow-lg"
            >
              Accept Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
