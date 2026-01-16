const express = require('express');

const { getMessages, addMessage } = require('../services/chatService');

const router = express.Router();

router.get('/chat', (req, res) => {
  const { senderId, recipientId } = req.query;

  if (!senderId || !recipientId) {
    return res.status(400).json({ error: 'Необходимы senderId и recipientId' });
  }

  const sId = parseInt(senderId);
  const rId = parseInt(recipientId);

  const messages = getMessages(sId, rId);

  res.json(messages);
});

router.post('/chat/send', (req, res) => {
  const { sender_id, recipient_id, text, timestamp } = req.body;

  if (!sender_id || !recipient_id || !text || !timestamp) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  const newMessage = { sender_id, recipient_id, text, timestamp };
  addMessage(newMessage);

  res.json({ success: true, message: newMessage });
});

module.exports = router;
