import { ApiResponse } from '@medical-appointment-system/shared-types';

// Import chatbot types directly from the source since there seems to be an issue with the package exports
interface ChatbotRequest {
  message: string;
  sessionId?: string;
  userId?: string | number;
}

interface ChatbotResponse {
  response: string;
  sessionId: string;
  followUpQuestions?: string[];
}

interface ChatbotMessage {
  message: string;
  isUser: boolean;
  timestamp: string | Date;
  followUpQuestions?: string[];
}

/**
 * Service for handling chatbot API interactions
 */
export class ChatbotService {
  private static instance: ChatbotService;
  private baseUrl = '/api/chatbot';

  private constructor() {}

  /**
   * Get singleton instance of ChatbotService
   */
  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  /**
   * Send a message to the chatbot
   * @param message The message text
   * @param sessionId Optional session ID for continuing a conversation
   * @param userId Optional user ID for personalized responses
   */
  public async sendMessage(
    message: string,
    sessionId?: string,
    userId?: string | number
  ): Promise<ApiResponse<ChatbotResponse>> {
    try {
      const request: ChatbotRequest = {
        message,
        sessionId,
        userId: userId?.toString()
      };

      const response = await fetch(`${this.baseUrl}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response from chatbot');
      }

      return data;
    } catch (error) {
      console.error('Error in chatbot service sendMessage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get conversation history for a session
   * @param sessionId The session ID
   */
  public async getConversationHistory(sessionId: string): Promise<ApiResponse<ChatbotMessage[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get conversation history');
      }

      return data;
    } catch (error) {
      console.error('Error in chatbot service getConversationHistory:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Clear conversation history for a session
   * @param sessionId The session ID
   */
  public async clearConversationHistory(sessionId: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/history/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear conversation history');
      }

      return data;
    } catch (error) {
      console.error('Error in chatbot service clearConversationHistory:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export default ChatbotService.getInstance();
