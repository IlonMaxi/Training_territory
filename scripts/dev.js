// Запуск для разработки одной командой: платформа (Nuxt) и ML-сервис (FastAPI).
//
//   npm run dev                  — оба процесса
//   npm run dev -- --port 3100   — аргументы после «--» уходят в nuxt
//   npm run dev:web              — только платформа
//   npm run ml                   — только ML-сервис
//
// ML-сервис необязателен: если его окружение не создано (см. README) или он
// уже запущен отдельно, поднимается одна платформа. Ctrl+C останавливает оба.
require('dotenv').config();

const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');
const readline = require('readline');

const root = path.resolve(__dirname, '..');
const python = process.platform === 'win32'
  ? path.join(root, 'ml_service', '.venv', 'Scripts', 'python.exe')
  : path.join(root, 'ml_service', '.venv', 'bin', 'python');

// Порт берём из ML_URL — на этот же адрес ходит сервер (server/routes/ml.js)
const mlUrl = new URL(process.env.ML_URL || 'http://127.0.0.1:8001');
const mlPort = mlUrl.port || '8001';
const LOCAL_HOSTS = ['127.0.0.1', 'localhost', '0.0.0.0'];

const nuxtArgs = process.argv.slice(2);
const children = [];
let mlProcess = null;
let stopping = false;

// Nuxt при старте очищает терминал, а во время сборки перерисовывает
// прогресс-бар: чужие строки посреди сборки он стирает или ломает.
// Поэтому всё, что пишет ML-сервис, придерживаем до конца сборки.
let nuxtReady = false;
const pending = [];

function print(target, line) {
  if (nuxtReady) target.write(`${line}\n`);
  else pending.push([target, line]);
}

function flushPending() {
  nuxtReady = true;
  pending.splice(0).forEach(([target, line]) => target.write(`${line}\n`));
}

const mlLog = (message) => print(process.stdout, `[ml] ${message}`);

function nuxtPort() {
  for (let i = 0; i < nuxtArgs.length; i += 1) {
    if (nuxtArgs[i] === '--port' || nuxtArgs[i] === '-p') return nuxtArgs[i + 1];
    if (nuxtArgs[i].startsWith('--port=')) return nuxtArgs[i].slice('--port='.length);
  }
  return process.env.NUXT_PORT || process.env.PORT || '3000';
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Порт уже кто-то слушает — например, ML-сервис запущен отдельно через npm run ml
function isPortBusy(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ port: Number(port), host: '127.0.0.1' }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

// Пока Nuxt собирается, он отдаёт заставку (тоже с кодом 200), а настоящую
// страницу можно узнать по состоянию, которое Nuxt вписывает при рендере
function nuxtPageReady(port) {
  return new Promise((resolve) => {
    const request = http.get({ host: '127.0.0.1', port: Number(port), path: '/', timeout: 10000 }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => resolve(body.includes('window.__NUXT__')));
      response.on('aborted', () => resolve(false));
      response.on('error', () => resolve(false));
    });
    request.on('timeout', () => request.destroy());
    request.on('error', () => resolve(false));
  });
}

async function waitForNuxt() {
  const port = nuxtPort();
  // Сборка с нуля занимает десятки секунд; дольше 5 минут не ждём
  for (let attempt = 0; attempt < 300 && !stopping; attempt += 1) {
    if (await nuxtPageReady(port)) break;
    await delay(1000);
  }
  if (stopping) return;
  flushPending();

  if (!mlProcess) return;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (await isPortBusy(mlPort)) {
      mlLog(`ML-сервис работает: ${mlUrl.origin}`);
      return;
    }
    if (mlProcess.exitCode !== null) return;
    await delay(500);
  }
  mlLog(`ML-сервис запущен, но пока не отвечает на ${mlUrl.origin}`);
}

// Вывод ML-сервиса — построчно с префиксом, чтобы не путать с логами Nuxt
function pipeWithPrefix(stream, target) {
  readline.createInterface({ input: stream }).on('line', (line) => print(target, `[ml] ${line}`));
}

async function startMl() {
  if (!LOCAL_HOSTS.includes(mlUrl.hostname)) {
    mlLog(`ML_URL указывает на ${mlUrl.host} — локальный ML-сервис не запускаю`);
    return;
  }
  if (!fs.existsSync(python)) {
    mlLog('не запущен: нет окружения ml_service/.venv (как создать — в README). Платформа работает и без него');
    return;
  }
  if (await isPortBusy(mlPort)) {
    mlLog(`порт ${mlPort} уже занят — похоже, ML-сервис запущен отдельно, второй не запускаю`);
    return;
  }

  // --log-level warning: без журнала каждого запроса, только предупреждения и ошибки
  const ml = spawn(python, [
    '-m', 'uvicorn', 'main:app', '--app-dir', 'ml_service', '--port', mlPort, '--log-level', 'warning'
  ], {
    cwd: root,
    // Без буфера и в UTF-8: иначе логи приходят пачками, а кириллица — кракозябрами
    env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8' },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  pipeWithPrefix(ml.stdout, process.stdout);
  pipeWithPrefix(ml.stderr, process.stderr);

  ml.on('error', (error) => mlLog(`не удалось запустить: ${error.message}`));
  ml.on('exit', (code) => {
    if (!stopping) mlLog(`остановился (код ${code}). Платформа продолжает работать без него`);
  });

  mlProcess = ml;
  children.push(ml);
}

function startNuxt() {
  const nuxtBin = require.resolve('nuxt/bin/nuxt.js');
  const nuxt = spawn(process.execPath, [nuxtBin, ...nuxtArgs], {
    cwd: root,
    stdio: 'inherit'
  });

  // Платформа завершилась — гасим и ML-сервис
  nuxt.on('exit', (code) => stop(code === null ? 1 : code));
  children.push(nuxt);
}

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  flushPending();
  children.forEach((child) => {
    if (child.exitCode === null && !child.killed) child.kill();
  });
  process.exit(code);
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

// Что бы ни случилось с ML-сервисом, платформа стартует
startMl()
  .catch((error) => mlLog(`не удалось запустить: ${error.message}`))
  .then(() => {
    startNuxt();
    waitForNuxt();
  });
