import axios from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'

interface QueueStatus {
  in_queue: boolean
  position: number | null
  queue_size: number
  estimated_wait_seconds: number | null
  status: string | null
  offer_game_id?: string | null
  offer_expires_at?: string | null
}

interface JoinQueueResponse {
  position: number
  queue_size: number
  message: string
  status: string
}

interface AcceptOfferResponse {
  message: string
  game_id: string
  status: string
}

export const quickMatchService = {
  async joinQueue(): Promise<JoinQueueResponse> {
    console.log('📡 Joining quick match queue')
    try {
      const response = await axios.post(`${API_ENDPOINTS.QUICKMATCH}/join`)
      console.log('✅ Joined queue:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Failed to join queue:', error.response?.data)
      throw error
    }
  },

  async leaveQueue(): Promise<any> {
    console.log('📡 Leaving quick match queue')
    try {
      const response = await axios.post(`${API_ENDPOINTS.QUICKMATCH}/leave`)
      console.log('✅ Left queue')
      return response.data
    } catch (error: any) {
      console.error('❌ Failed to leave queue:', error.response?.data)
      throw error
    }
  },

  async getQueueStatus(): Promise<QueueStatus> {
    console.log('📡 Getting queue status')
    try {
      const response = await axios.get(`${API_ENDPOINTS.QUICKMATCH}/status`)
      console.log('✅ Queue status:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Failed to get queue status:', error.response?.data)
      throw error
    }
  },

  async acceptReplacement(gameId: string): Promise<AcceptOfferResponse> {
    console.log('📡 Accepting replacement offer for game:', gameId)
    try {
      const response = await axios.post(`${API_ENDPOINTS.QUICKMATCH}/accept/${gameId}`)
      console.log('✅ Replacement accepted:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Failed to accept offer:', error.response?.data)
      throw error
    }
  },

  async declineReplacement(): Promise<any> {
    console.log('📡 Declining replacement offer')
    try {
      const response = await axios.post(`${API_ENDPOINTS.QUICKMATCH}/decline`)
      console.log('✅ Declined offer')
      return response.data
    } catch (error: any) {
      console.error('❌ Failed to decline offer:', error.response?.data)
      throw error
    }
  },
}
