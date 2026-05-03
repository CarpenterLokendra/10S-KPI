import axios from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'

export const lobbyChatService = {
  async sendMessage(code: string, message: string): Promise<any> {
    const response = await axios.post(
      `${API_ENDPOINTS.LOBBIES}/${code}/chat`,
      null,
      {
        params: { message },
      }
    )
    return response.data
  },

  async getMessages(code: string, limit: number = 50): Promise<any> {
    const response = await axios.get(
      `${API_ENDPOINTS.LOBBIES}/${code}/chat`,
      {
        params: { limit },
      }
    )
    return response.data
  },
}
