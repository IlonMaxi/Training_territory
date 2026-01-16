const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'elfimov.maksim1415@gmail.com',
    pass: 'rloi vcvb rnmh ylqz'
  }
});

const sendFeedbackEmail = async ({ rating, comment, clientEmail, clientName }) => {
  await transporter.sendMail({
    from: '"Training Territory" <elfimov.maksim1415@gmail.com>',
    to: 'elfimov.m@gs.donstu.ru',
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
