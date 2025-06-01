import { AxiosResponse, AxiosError } from 'axios';
import apiService from './api.service';
import { ApiResponse, ApiError } from '@medical-appointment-system/shared-types';

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
  private baseUrl = '/chatbot';

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
   * Handle API errors consistently
   */
  private handleError(error: unknown, defaultMessage: string): ApiError {
    let errorMessage = defaultMessage;
    let errorStatus: number | undefined = undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    if (error instanceof AxiosError && error.response) {
      errorMessage = error.response.data?.message as string || errorMessage;
      errorStatus = error.response.status;
    }
    
    return {
      message: errorMessage,
      status: errorStatus
    };
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

      const response: AxiosResponse<ApiResponse<ChatbotResponse>> = await apiService.post(
        `${this.baseUrl}/message`,
        request
      );

      return response.data;
    } catch (error) {
      console.error('Error in chatbot service sendMessage:', error);
      return {
        success: false,
        error: this.handleError(error, 'Failed to get response from chatbot').message
      };
    }
  }

  /**
   * Get conversation history for a session
   * @param sessionId The session ID
   */
  public async getConversationHistory(sessionId: string): Promise<ApiResponse<ChatbotMessage[]>> {
    try {
      const response: AxiosResponse<ApiResponse<ChatbotMessage[]>> = await apiService.get(
        `${this.baseUrl}/history/${sessionId}`
      );

      return response.data;
    } catch (error) {
      console.error('Error in chatbot service getConversationHistory:', error);
      return {
        success: false,
        error: this.handleError(error, 'Failed to get conversation history').message
      };
    }
  }

  /**
   * Clear conversation history for a session
   * @param sessionId The session ID
   */
  public async clearConversationHistory(sessionId: string): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiService.delete(
        `${this.baseUrl}/history/${sessionId}`
      );

      return response.data;
    } catch (error) {
      console.error('Error in chatbot service clearConversationHistory:', error);
      return {
        success: false,
        error: this.handleError(error, 'Failed to clear conversation history').message
      };
    }
  }
}

export default ChatbotService.getInstance();
