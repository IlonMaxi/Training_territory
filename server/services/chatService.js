const chatMessages = [];

const getMessages = (senderId, recipientId) => {
  return chatMessages.filter(msg =>
    (msg.sender_id === senderId && msg.recipient_id === recipientId) ||
    (msg.sender_id === recipientId && msg.recipient_id === senderId)
  );
};

const addMessage = (message) => {
  chatMessages.push(message);
  return message;
};

module.exports = {
  getMessages,
  addMessage
};
