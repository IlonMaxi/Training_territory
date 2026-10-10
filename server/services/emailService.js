const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FEEDBACK_TO = process.env.FEEDBACK_TO || EMAIL_USER;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

const sendFeedbackEmail = async ({ rating, comment, clientEmail, clientName }) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('EMAIL_USER / EMAIL_PASS не заданы в .env');
  }

  await transporter.sendMail({
    from: `"Training Territory" <${EMAIL_USER}>`,
    to: FEEDBACK_TO,
    subject: 'Новый отзыв от клиента',
    text: `
Новый отзыв от клиента:

Имя: ${clientName}
Email: ${clientEmail}
Оценка: ${rating}
Комментарий:
${comment}
      `
  });
};

module.exports = { sendFeedbackEmail };
