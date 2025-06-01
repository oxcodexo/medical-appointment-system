const chatbot = require('../models/chatbot');
const { v4: uuidv4 } = require('uuid');

exports.processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    let { sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }
    
    if (!sessionId) {
      sessionId = uuidv4();
    }
    
    chatbot.addToConversationHistory(sessionId, message, true);
    
    const responseData = await chatbot.getResponse(message);
    
    chatbot.addToConversationHistory(sessionId, responseData.response, false);
    
    return res.status(200).json({
      success: true,
      data: {
        sessionId: sessionId,
        intent: responseData.intent,
        response: responseData.response,
        followUpQuestions: responseData.followUpQuestions
      }
    });
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error processing message'
    });
  }
};

exports.getConversationHistory = (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }
    
    const history = chatbot.getConversationHistory(sessionId);
    
    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error getting conversation history'
    });
  }
};

exports.clearConversation = (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }
    
    chatbot.addToConversationHistory(sessionId, '', true, true);
    
    return res.status(200).json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    console.error('Error clearing conversation:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error clearing conversation'
    });
  }
};
