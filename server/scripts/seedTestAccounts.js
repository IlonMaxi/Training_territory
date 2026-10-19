/*
  Тестовые аккаунты для ручной проверки кабинетов: один клиент и один тренер,
  клиент привязан к тренеру. Только для локальной базы — пароли лежат здесь
  открытым текстом.

  Скрипт идемпотентный: если логин уже есть, обновляет пароль и данные,
  иначе создаёт запись. Запуск: npm run seed:test-accounts
*/
require('dotenv').config();

const bcrypt = require('bcrypt');
const Client = require('../../models/Client');
const Coach = require('../../models/Coach');

const PASSWORD = 'Test1234!';

const CLIENT = {
  username: 'test_client',
  last_name: 'Тестов',
  first_name: 'Иван',
  patronymic: 'Петрович',
  email: 'client@training-territory.test',
  phone_number: '89990000001',
  birth_date: '1995-05-15',
  gender: 'male'
};

const COACH = {
  username: 'test_trainer',
  last_name: 'Тренерова',
  first_name: 'Анна',
  patronymic: 'Сергеевна',
  email: 'trainer@training-territory.test',
  phone_number: '89990000002',
  birth_date: '1990-03-20',
  gender: 'female',
  specialization: 'Силовые тренировки',
  experience: '5 лет'
};

// Логины в БД не уникальны, а вход берёт самую старую запись — её и обновляем
const upsert = async (Model, idField, data, password) => {
  const existing = await Model.findOne({ where: { username: data.username }, order: [[idField, 'ASC']] });
  if (existing) {
    await existing.update({ ...data, password });
    return { id: existing[idField], created: false };
  }
  const created = await Model.create({ ...data, password });
  return { id: created[idField], created: true };
};

(async () => {
  try {
    const password = await bcrypt.hash(PASSWORD, 10);

    const client = await upsert(Client, 'clientid', CLIENT, password);
    console.log(`клиент ${CLIENT.username}: clientid ${client.id} (${client.created ? 'создан' : 'обновлён'})`);

    const coach = await upsert(Coach, 'coachid', COACH, password);
    console.log(`тренер ${COACH.username}: coachid ${coach.id} (${coach.created ? 'создан' : 'обновлён'})`);

    // То же, что делает POST /clients/:clientId/coach при выборе тренера
    await Client.update({ coach_id: coach.id }, { where: { clientid: client.id } });
    console.log(`клиент ${CLIENT.username} привязан к тренеру ${COACH.username}`);

    process.exit(0);
  } catch (error) {
    console.error('ошибка:', error.message);
    process.exit(1);
  }
})();
