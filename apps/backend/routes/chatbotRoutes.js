const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.post('/message', chatbotController.processMessage);

router.get('/history/:sessionId', chatbotController.getConversationHistory);

router.delete('/history/:sessionId', chatbotController.clearConversation);

module.exports = router;
