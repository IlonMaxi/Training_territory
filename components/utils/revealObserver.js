// Общие IntersectionObserver для всех <Reveal> — по одному на порог,
// как ScrollRevealObserver на лендинге. Сотня блоков на странице не плодит
// сотню наблюдателей.

const observers = new Map(); // порог -> IntersectionObserver
const handlers = new WeakMap(); // элемент -> { threshold, onChange }

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function getObserver(threshold) {
    const existing = observers.get(threshold);
    if (existing) return existing;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const handler = handlers.get(entry.target);
            if (handler) handler.onChange(entry.isIntersecting);
        });
    }, { threshold });

    observers.set(threshold, observer);
    return observer;
}

// Блок уже в окне: его верх выше линии срабатывания, низ ещё не ушёл за верх
export function isInView(el, amount) {
    const rect = el.getBoundingClientRect();
    const triggerLine = (window.innerHeight || 0) * (1 - amount);
    return rect.top <= triggerLine && rect.bottom >= 0;
}

export function observeReveal(el, amount, onChange) {
    const threshold = clamp(amount, 0, 1);

    if (typeof IntersectionObserver === 'undefined') {
        onChange(true);
        return;
    }

    handlers.set(el, { threshold, onChange });
    getObserver(threshold).observe(el);
}

export function unobserveReveal(el) {
    const handler = handlers.get(el);
    if (!handler) return;

    const observer = observers.get(handler.threshold);
    if (observer) observer.unobserve(el);
    handlers.delete(el);
}

const revealObserver = { isInView, observeReveal, unobserveReveal };

export default revealObserver;
