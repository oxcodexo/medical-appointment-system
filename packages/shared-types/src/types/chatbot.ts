/**
 * Represents a message in the chatbot conversation
 */
export interface ChatbotMessage {
  message: string;
  isUser: boolean;
  timestamp: string | Date;
  followUpQuestions?: string[];
}

/**
 * Response from the chatbot API
 */
export interface ChatbotResponse {
  response: string;
  sessionId: string;
  followUpQuestions?: string[];
}

/**
 * Request to the chatbot API
 */
export interface ChatbotRequest {
  message: string;
  sessionId?: string;
  userId?: string | number;
}

/**
 * Conversation history for a chatbot session
 */
export interface ChatbotConversationHistory {
  messages: ChatbotMessage[];
}
