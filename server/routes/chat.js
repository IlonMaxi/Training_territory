const express = require('express');

const { getMessages, addMessage } = require('../services/chatService');
const { currentUser } = require('../middlewares/auth');

const router = express.Router();

// Читать и писать можно только от своего имени — id отправителя берём из сессии
router.get('/chat', (req, res) => {
  const { recipientId } = req.query;

  if (!recipientId) {
    return res.status(400).json({ error: 'Необходим recipientId' });
  }

  const sId = currentUser(req).id;
  const rId = parseInt(recipientId);

  const messages = getMessages(sId, rId);

  res.json(messages);
});

router.post('/chat/send', (req, res) => {
  const { recipient_id, text, timestamp } = req.body;

  if (!recipient_id || !text || !timestamp) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  const newMessage = { sender_id: currentUser(req).id, recipient_id, text, timestamp };
  addMessage(newMessage);

  res.json({ success: true, message: newMessage });
});

module.exports = router;
