<template>
    <div class="tt-page error-page">
        <div class="tt-backdrop" aria-hidden="true"></div>

        <SiteHeader menu-label="Меню">
            <template #brand>
                <nuxt-link :to="home.path" class="brand-link" aria-label="Training Territory — на главную">
                    <BrandLogo />
                </nuxt-link>
            </template>
            <template #actions>
                <nuxt-link :to="home.path" class="tt-btn tt-btn--primary tt-btn--sm">
                    <i :class="home.icon"></i> {{ home.label }}
                </nuxt-link>
            </template>
            <template #menu>
                <nuxt-link :to="home.path" class="tt-menu-item">
                    <i :class="home.icon"></i> {{ home.label }}
                </nuxt-link>
            </template>
        </SiteHeader>

        <main class="tt-main error-main">
            <section class="tt-container error" aria-labelledby="error-title">
                <!-- «404»: ноль — блин от штанги, он катится и крутится -->
                <div class="code" aria-hidden="true">
                    <template v-for="(char, index) in codeChars">
                        <svg v-if="char === '0'" :key="`plate-${index}`" class="plate" viewBox="0 0 120 120">
                            <g class="plate-spin">
                                <circle class="plate-rim" cx="60" cy="60" r="54" />
                                <circle class="plate-ring" cx="60" cy="60" r="42" />
                                <circle class="plate-hub" cx="60" cy="60" r="14" />
                                <circle class="plate-hole" cx="60" cy="60" r="6" />
                                <path class="plate-grip" d="M60 9 L60 18 M60 102 L60 111 M9 60 L18 60 M102 60 L111 60" />
                                <text class="plate-label" x="60" y="36" text-anchor="middle">20 KG</text>
                            </g>
                        </svg>
                        <span v-else :key="`char-${index}`" class="code-char">{{ char }}</span>
                    </template>
                </div>
                <span class="plate-shadow" aria-hidden="true"></span>

                <span class="tt-eyebrow">
                    <i :class="isNotFound ? 'fa-solid fa-route' : 'fa-solid fa-triangle-exclamation'"></i>
                    {{ isNotFound ? 'Страница не найдена' : `Ошибка ${statusCode}` }}
                </span>
                <h1 id="error-title" class="error-title">
                    {{ isNotFound ? 'Такой страницы нет' : 'Что-то пошло не так' }}
                </h1>
                <p class="error-lead">
                    <template v-if="isNotFound">
                        Похоже, она ушла на кардио и не вернулась. Проверьте адрес или вернитесь
                        {{ home.isCabinet ? 'в кабинет' : 'на главную' }}.
                    </template>
                    <template v-else>
                        Сервер ответил ошибкой. Обновите страницу через минуту — если не поможет, напишите в поддержку.
                    </template>
                </p>

                <div class="error-actions">
                    <nuxt-link :to="home.path" class="tt-btn tt-btn--primary">
                        <i :class="home.icon"></i> {{ home.label }}
                    </nuxt-link>
                    <button type="button" class="tt-btn tt-btn--ghost" @click="goBack">
                        <i class="fa-solid fa-arrow-left"></i> Назад
                    </button>
                </div>
            </section>
        </main>
    </div>
</template>

<script>
import SiteHeader from '@/components/common/SiteHeader.vue';
import BrandLogo from '@/components/common/BrandLogo.vue';
import { readCookie, homeRoute } from '@/components/utils/cabinet.js';

// Страница ошибки Nuxt: 404 и всё остальное. Вошедшего ведём в кабинет, гостя — на главную
export default {
    name: 'ErrorPage',
    components: { SiteHeader, BrandLogo },
    props: {
        error: { type: Object, default: () => ({}) }
    },
    data() {
        // Кабинет узнаём только в браузере: на сервере cookie нет
        return { cabinet: null };
    },
    head() {
        return { title: this.isNotFound ? 'Страница не найдена — TRAINING TERRITORY' : 'Ошибка — TRAINING TERRITORY' };
    },
    computed: {
        statusCode() {
            return (this.error && this.error.statusCode) || 500;
        },
        isNotFound() {
            return this.statusCode === 404;
        },
        codeChars() {
            return String(this.statusCode).split('');
        },
        home() {
            if (this.cabinet) {
                return { path: `/${this.cabinet}`, label: 'В кабинет', icon: 'fa-solid fa-house-user', isCabinet: true };
            }
            return { path: '/', label: 'На главную', icon: 'fa-solid fa-house', isCabinet: false };
        }
    },
    mounted() {
        this.cabinet = homeRoute(readCookie('accountType'));
    },
    methods: {
        goBack() {
            if (window.history.length > 1) this.$router.back();
            else this.$router.push(this.home.path);
        }
    }
};
</script>

<style scoped>
.brand-link {
    display: inline-flex;
    text-decoration: none;
}

/* Содержимое — по центру экрана под шапкой */
.error-main {
    justify-content: center;
    min-height: calc(100vh - 80px);
    padding-bottom: 80px;
}

.error {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0 20px;
    text-align: center;
}

/* ---------- 4 [блин] 4 ---------- */

.code {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    line-height: 1;
}

.code-char {
    background: linear-gradient(160deg, #ff7a3d 0%, #f8500a 55%, #c2410c 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-size: 168px;
    font-weight: 800;
    letter-spacing: -0.04em;
}

.plate {
    width: 150px;
    height: 150px;
    margin: 0 6px;
    overflow: visible;
    animation: plate-roll 1s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* Блин вкатывается и потом медленно крутится */
@keyframes plate-roll {
    from {
        opacity: 0;
        transform: translateX(-120px) rotate(-180deg);
    }
}

.plate-spin {
    transform-origin: 60px 60px;
    animation: plate-spin 14s linear 1s infinite;
}

@keyframes plate-spin {
    to {
        transform: rotate(360deg);
    }
}

.plate circle,
.plate path {
    fill: none;
    stroke-linecap: round;
}

.plate-rim {
    stroke: var(--tt-brand);
    stroke-width: 5;
}

.plate-ring {
    stroke: var(--tt-brand);
    stroke-width: 2;
    opacity: 0.55;
}

.plate-hub {
    stroke: var(--tt-blue);
    stroke-width: 3;
}

.plate .plate-hole {
    fill: var(--tt-brand);
    stroke: none;
}

.plate-grip {
    stroke: var(--tt-brand);
    stroke-width: 3;
    opacity: 0.4;
}

.plate-label {
    fill: var(--tt-brand-deep);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
}

.plate-shadow {
    width: 280px;
    height: 14px;
    margin: 6px 0 30px;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(248, 80, 10, 0.18), rgba(248, 80, 10, 0));
}

/* ---------- текст ---------- */

.error-title {
    margin: 16px 0 0;
    color: var(--tt-ink);
    font-size: 44px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.03em;
}

.error-lead {
    max-width: 520px;
    margin: 14px 0 0;
    color: var(--tt-soft);
    font-size: 17px;
    line-height: 1.6;
}

.error-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 28px;
}

@media (max-width: 640px) {
    .code-char {
        font-size: 104px;
    }

    .plate {
        width: 92px;
        height: 92px;
    }

    .plate-shadow {
        width: 200px;
    }

    .error-title {
        font-size: 32px;
    }

    .error-lead {
        font-size: 16px;
    }

    .error-actions {
        width: 100%;
    }

    .error-actions .tt-btn {
        width: 100%;
    }
}

@media (prefers-reduced-motion: reduce) {

    .plate,
    .plate-spin {
        animation: none;
    }
}
</style>
