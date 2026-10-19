// Мелкие помощники для подписей — раньше каждый компонент держал свою копию

// Склонение: plural(5, ['тренировка', 'тренировки', 'тренировок']) → «тренировок»
export function plural(n, forms) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

// joinName('Мария', 'Иванова') → «Мария Иванова»; пустые части пропускаются
export function joinName(...parts) {
  return parts.filter(Boolean).join(' ');
}

// initialsOf('Мария', 'Иванова') → «МИ»
export function initialsOf(...parts) {
  return parts
    .filter(Boolean)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

const format = { plural, capitalize, joinName, initialsOf };

export default format;
