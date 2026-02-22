/**
 * ContractBoard Component
 * Assignment upload and quest list display
 */

import React, { useState } from 'react'
import { Scroll, Sparkles, TrendingUp } from 'lucide-react'
import { api, MicroTask, QuestLog } from '../services/api'

interface ContractBoardProps {
  balance: number
  onTaskSelect: (task: MicroTask) => void
  onBalanceUpdate: () => void
}

export const ContractBoard: React.FC<ContractBoardProps> = ({
  balance,
  onTaskSelect,
  onBalanceUpdate
}) => {
  const [assignmentText, setAssignmentText] = useState('')
  const [questLog, setQuestLog] = useState<QuestLog | null>(null)
  const [loading, setLoading] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  const handleBreakdown = async () => {
    if (!assignmentText.trim()) {
      alert('Please enter an assignment to break down')
      return
    }

    setLoading(true)
    try {
      const response = await api.breakdownAssignment(assignmentText)
      setQuestLog(response.quest_log)
      onBalanceUpdate()
    } catch (err) {
      alert('Failed to break down assignment. Check if backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskComplete = (taskId: string) => {
    setCompletedTasks(prev => new Set(prev).add(taskId))
  }

  const totalStakeRequired = questLog?.tasks.reduce((sum, t) => sum + t.required_stake, 0) || 0
  const totalBountyPotential = questLog?.tasks.reduce((sum, t) => sum + t.reward_bounty, 0) || 0
  const completedCount = completedTasks.size
  const totalCount = questLog?.tasks.length || 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with balance */}
      <div className="contract-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <div>
              <h2 className="text-2xl font-bold text-amber-900">ChronoCharm</h2>
              <p className="text-sm text-gray-600">The Wager - High-Stakes Productivity</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Mana Balance</p>
            <p className="text-3xl font-bold mana-display">{balance}</p>
          </div>
        </div>
      </div>

      {/* Assignment input */}
      {!questLog && (
        <div className="contract-card">
          <div className="flex items-center gap-3 mb-4">
            <Scroll className="w-5 h-5 text-amber-700" />
            <h3 className="text-xl font-semibold text-amber-900">Submit Your Quest</h3>
          </div>
          <textarea
            value={assignmentText}
            onChange={(e) => setAssignmentText(e.target.value)}
            placeholder="Paste your assignment here... (essay prompt, math problems, coding challenge, etc.)"
            className="w-full h-48 p-4 border-2 border-amber-300 rounded-lg font-serif text-gray-800 focus:outline-none focus:border-amber-500 bg-amber-50"
          />
          <button
            onClick={handleBreakdown}
            disabled={loading}
            className="mt-4 w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>Processing with AI...</>
            ) : (
              <>
                <TrendingUp className="w-5 h-5" />
                Generate Quest Log
              </>
            )}
          </button>
        </div>
      )}

      {/* Quest log display */}
      {questLog && (
        <>
          <div className="contract-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-amber-900">Quest Log Generated</h3>
                <p className="text-sm text-gray-600">
                  {completedCount} / {totalCount} tasks completed
                </p>
              </div>
              <button
                onClick={() => {
                  setQuestLog(null)
                  setAssignmentText('')
                  setCompletedTasks(new Set())
                }}
                className="text-sm text-amber-600 hover:text-amber-800"
              >
                New Assignment
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-amber-50 rounded">
              <div>
                <p className="text-xs text-gray-600">Total Stakes Required</p>
                <p className="text-lg font-bold text-red-600">{totalStakeRequired} Mana</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Potential Bounty</p>
                <p className="text-lg font-bold text-green-600">{totalBountyPotential} Mana</p>
              </div>
            </div>

            {balance < totalStakeRequired && (
              <div className="bg-red-50 border border-red-300 rounded p-3 mb-4">
                <p className="text-sm text-red-700">
                  ⚠️ Insufficient Mana! You need {totalStakeRequired - balance} more to complete all tasks.
                </p>
              </div>
            )}
          </div>

          {/* Task list */}
          <div className="space-y-3">
            {questLog.tasks.map((task, index) => {
              const isCompleted = completedTasks.has(task.id)
              const canAfford = balance >= task.required_stake

              return (
                <div
                  key={task.id}
                  className={`contract-card transition ${
                    isCompleted ? 'opacity-50 bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-amber-700">
                          Task {index + 1}
                        </span>
                        <span className="text-xs text-gray-500">
                          ~{task.duration_minutes} min
                        </span>
                        {isCompleted && (
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                            ✓ Complete
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {task.title}
                      </h4>
                      <p className="text-sm italic text-gray-600 mb-3">
                        "{task.encouragement_quote}"
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Stake: </span>
                          <span className="font-bold text-red-600">
                            {task.required_stake} Mana
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Bounty: </span>
                          <span className="font-bold text-green-600">
                            {task.reward_bounty} Mana
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onTaskSelect(task)
                        handleTaskComplete(task.id)
                      }}
                      disabled={isCompleted || !canAfford}
                      className={`px-6 py-3 rounded-lg font-semibold transition ${
                        isCompleted
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? 'Done' : canAfford ? 'Accept' : 'Low Mana'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
