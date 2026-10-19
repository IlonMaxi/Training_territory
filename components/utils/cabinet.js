import aiChat from '@/components/utils/AiChatState.js';

// Общее для шапки, подвала и страниц кабинета: куда вести, как выйти

export function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const row = document.cookie.split('; ').find(cookie => cookie.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.slice(name.length + 1)) : null;
}

export function readUser() {
  const raw = readCookie('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('Ошибка парсинга user cookie:', error);
    return null;
  }
}

export function homeRoute(accountType) {
  if (accountType === 'trainer') return 'TrainerPage';
  if (accountType === 'client') return 'ClientPage';
  return null;
}

// Nuxt подменяет router.push обёрткой, которая не всегда возвращает промис,
// а переход на текущий же адрес (NavigationDuplicated) ошибкой не считаем
export function safePush(router, target) {
  const navigation = router.push(target);
  if (navigation && typeof navigation.catch === 'function') navigation.catch(() => { });
}

// Раздел на своей странице — прокрутка; с чужой — переход с ?section=,
// а страница сама докрутит до него после загрузки (scrollToQuerySection)
export function goToSection(vm, section) {
  const routeName = homeRoute(readCookie('accountType'));
  if (!routeName) return;

  if (vm.$route.name !== routeName) {
    safePush(vm.$router, { name: routeName, query: { section } });
    return;
  }

  vm.$nextTick(() => {
    const element = document.getElementById(section);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// Для страниц кабинета: докрутить до раздела из ?section= после первой отрисовки
export function scrollToQuerySection(vm) {
  const section = vm.$route.query.section;
  if (!section) return;
  // Блоки проявляются анимацией — ждём кадр, чтобы раскладка устоялась
  setTimeout(() => {
    const element = document.getElementById(section);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

export async function logout(router) {
  try {
    await fetch('/api/logout', { method: 'POST' });
  } catch (error) {
    console.error('Ошибка при выходе:', error);
  }
  ['user', 'accountType'].forEach(name => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  aiChat.close();
  router.push('/');
}

const cabinet = { readCookie, readUser, homeRoute, safePush, goToSection, scrollToQuerySection, logout };

export default cabinet;
