<template>
    <footer class="footer">
        <div class="tt-container footer-grid">
            <div class="brand-column">
                <BrandLogo light />
                <p class="brand-text">
                    Платформа для тренера и клиента: тренировки, расписание, питание и прогресс — в одном месте.
                </p>
                <div class="social-icons">
                    <a v-for="social in socials" :key="social.label" href="#" target="_blank" rel="noopener noreferrer"
                        :aria-label="social.label">
                        <i :class="social.icon"></i>
                    </a>
                </div>
            </div>

            <nav v-for="column in columns" :key="column.title" class="column" :aria-label="column.title">
                <h2 class="column-title">{{ column.title }}</h2>
                <ul class="footer-links">
                    <li v-for="link in column.links" :key="link.key">
                        <a href="#" :class="{ active: link.active }" @click.prevent="$emit('select', link.key)">
                            <i :class="link.icon"></i> {{ link.label }}
                        </a>
                    </li>
                </ul>
            </nav>
        </div>

        <div class="tt-container footer-bottom">
            <p>© {{ year }} TRAINING TERRITORY, All Rights Reserved.</p>
        </div>
    </footer>
</template>

<script>
import BrandLogo from '@/components/common/BrandLogo.vue';

/*
  Общий тёмный подвал. Колонки ссылок приходят данными:
  [{ title, links: [{ key, label, icon, active }] }],
  а по клику подвал только сообщает key — что делать, решает страница.
*/
export default {
    name: 'SiteFooter',
    components: { BrandLogo },
    props: {
        columns: { type: Array, default: () => [] }
    },
    data() {
        return {
            year: new Date().getFullYear(),
            socials: [
                { label: 'Facebook', icon: 'fa-brands fa-facebook-f' },
                { label: 'Instagram', icon: 'fa-brands fa-instagram' },
                { label: 'X', icon: 'fa-brands fa-x-twitter' },
                { label: 'LinkedIn', icon: 'fa-brands fa-linkedin-in' },
                { label: 'YouTube', icon: 'fa-brands fa-youtube' }
            ]
        };
    }
};
</script>

<style scoped>
/* Тёмный подвал: оранжевое и синее свечение по углам */
.footer {
    position: relative;
    z-index: 1;
    padding: 56px 0 28px;
    border-radius: var(--tt-radius-xl) var(--tt-radius-xl) 0 0;
    background:
        radial-gradient(1100px 560px at 0% 100%, rgba(248, 80, 10, 0.24), transparent 60%),
        radial-gradient(900px 480px at 100% 0%, rgba(55, 96, 231, 0.2), transparent 60%),
        linear-gradient(180deg, #1b1412 0%, #0f1427 100%);
    color: #ffffff;
}

.footer-grid {
    display: grid;
    grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr));
    gap: 40px;
}

.brand-text {
    max-width: 380px;
    margin: 20px 0 0;
    color: rgba(255, 255, 255, 0.68);
    font-size: 15px;
    line-height: 1.6;
}

.social-icons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 24px;
}

.social-icons a {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.85);
    font-size: 16px;
    text-decoration: none;
    transition:
        transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
        background-color 0.3s ease,
        border-color 0.3s ease,
        color 0.3s ease;
}

.social-icons a:hover {
    border-color: transparent;
    background-color: #f8500a;
    color: #ffffff;
    transform: translateY(-3px);
}

.column-title {
    margin: 0 0 16px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.footer-links {
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.footer-links a {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    transition: color 0.3s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.footer-links a i {
    width: 16px;
    color: rgba(255, 255, 255, 0.45);
    font-size: 13px;
    transition: color 0.3s ease;
}

.footer-links a:hover {
    color: #ffffff;
    transform: translateX(4px);
}

.footer-links a:hover i,
.footer-links a.active i {
    color: #ff7a3d;
}

.footer-links a.active {
    color: #ff9a66;
    font-weight: 600;
}

/* На тёмном подвале рамка фокуса светлее */
.footer {
    --tt-focus-ring: rgba(255, 122, 61, 0.6);
}

.footer-bottom {
    margin-top: 48px;
    padding-top: 22px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-bottom p {
    margin: 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
}

@media (max-width: 820px) {
    .footer-grid {
        grid-template-columns: 1fr 1fr;
    }

    .brand-column {
        grid-column: 1 / -1;
    }
}

@media (max-width: 640px) {
    .footer {
        padding-top: 40px;
    }

    .footer-grid {
        gap: 28px;
    }
}

@media (prefers-reduced-motion: reduce) {

    .social-icons a,
    .footer-links a {
        transition: none;
    }

    .social-icons a:hover,
    .footer-links a:hover {
        transform: none;
    }
}
</style>
