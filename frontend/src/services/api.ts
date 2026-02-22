/**
 * ChronoCharm API Service
 * Handles all backend communication
 */

import axios from 'axios'

const API_BASE = 'http://localhost:8004/api'

export interface MicroTask {
  id: string
  title: string
  duration_minutes: number
  required_stake: number
  reward_bounty: number
  encouragement_quote: string
}

export interface QuestLog {
  tasks: MicroTask[]
}

export interface UserBalance {
  user_id: string
  balance: number
  total_earned: number
  total_lost: number
  quests_completed: number
}

export interface BreakdownResponse {
  quest_log: QuestLog
  current_balance: number
}

export interface WagerStartResponse {
  success: boolean
  task_id: string
  stake_deducted: number
  new_balance: number
}

export interface WagerCompleteResponse {
  success: boolean
  outcome: 'won' | 'lost'
  bounty_awarded?: number
  stake_returned?: number
  total_gain?: number
  stake_lost?: number
  new_balance: number
}

class ChronoCharmAPI {
  /**
   * Get user's current Mana balance and stats
   */
  async getBalance(userId: string = 'default'): Promise<UserBalance> {
    const response = await axios.get<UserBalance>(`${API_BASE}/balance`, {
      params: { user_id: userId }
    })
    return response.data
  }

  /**
   * Break down an assignment into micro-tasks using AI
   */
  async breakdownAssignment(assignmentText: string, userId: string = 'default'): Promise<BreakdownResponse> {
    const response = await axios.post<BreakdownResponse>(`${API_BASE}/breakdown`, {
      assignment_text: assignmentText,
      user_id: userId
    })
    return response.data
  }

  /**
   * Start a wager - deduct stake from balance
   */
  async startWager(taskId: string, stake: number, userId: string = 'default'): Promise<WagerStartResponse> {
    const response = await axios.post<WagerStartResponse>(`${API_BASE}/wager/start`, {
      task_id: taskId,
      stake: stake,
      user_id: userId
    })
    return response.data
  }

  /**
   * Complete a wager - award bounty or record loss
   */
  async completeWager(
    taskId: string,
    bounty: number,
    stake: number,
    won: boolean,
    userId: string = 'default'
  ): Promise<WagerCompleteResponse> {
    const response = await axios.post<WagerCompleteResponse>(`${API_BASE}/wager/complete`, {
      task_id: taskId,
      bounty: bounty,
      stake: stake,
      won: won,
      user_id: userId
    })
    return response.data
  }

  /**
   * Reset user balance (for testing)
   */
  async resetBalance(userId: string = 'default'): Promise<void> {
    await axios.post(`${API_BASE}/reset`, null, {
      params: { user_id: userId }
    })
  }
}

export const api = new ChronoCharmAPI()
