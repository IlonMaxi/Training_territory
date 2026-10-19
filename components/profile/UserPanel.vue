<template>
    <nav class="tt-board tt-board--sm panel" aria-label="Разделы профиля">
        <div class="panel-user">
            <span class="tt-avatar panel-avatar">
                <img v-if="photo && !photoFailed" :src="photo" alt="" @error="photoFailed = true" />
                <template v-else>{{ initials }}</template>
            </span>
            <div class="panel-who">
                <b class="panel-name">{{ fullName }}</b>
                <span :class="['tt-chip', { 'tt-chip--blue': role === 'client' }]">
                    <i :class="role === 'trainer' ? 'fa-solid fa-clipboard-user' : 'fa-solid fa-user'"></i>
                    {{ role === 'trainer' ? 'Тренер' : 'Клиент' }}
                </span>
            </div>
        </div>

        <div ref="menu" class="panel-menu">
            <button v-for="item in items" :key="item.key" type="button"
                :class="['tt-nav-item', 'panel-item', { 'is-active': item.key === active }]"
                :aria-current="item.key === active ? 'page' : null" @click="$emit('select', item.key)">
                <span class="tt-icon-tile tt-icon-tile--sm panel-icon"><i :class="item.icon"></i></span>
                <span class="panel-label">{{ item.label }}</span>
                <i class="fa-solid fa-chevron-right panel-arrow" aria-hidden="true"></i>
            </button>
        </div>

        <button type="button" class="panel-help" @click="aiChat.open()">
            <span class="tt-icon-tile tt-icon-tile--sm panel-help-icon"><i class="fa-solid fa-compass"></i></span>
            <span class="panel-help-text">
                <b>Не нашли нужное?</b>
                <small>Спросите помощника — он откроет раздел</small>
            </span>
        </button>
    </nav>
</template>

<script>
import aiChat from '@/components/utils/AiChatState.js';
import { joinName, initialsOf } from '@/components/utils/format.js';

// Боковое меню профиля: кто вошёл и разделы. Какой раздел открыт, решает страница
export default {
    name: 'UserPanel',
    props: {
        user: { type: Object, required: true },
        // client | trainer
        role: { type: String, default: 'client' },
        // [{ key, label, icon }]
        items: { type: Array, default: () => [] },
        active: { type: String, default: null }
    },
    data() {
        return { aiChat, photoFailed: false };
    },
    watch: {
        active() {
            this.$nextTick(this.revealActive);
        }
    },
    mounted() {
        this.revealActive();
    },
    computed: {
        fullName() {
            return joinName(this.user.first_name, this.user.last_name) || 'Профиль';
        },
        initials() {
            return initialsOf(this.user.first_name, this.user.last_name) || 'TT';
        },
        photo() {
            const image = this.user.image;
            return image && image !== 'default.jpg' ? `/api/uploads/${image}` : null;
        }
    },
    methods: {
        // На узком экране меню — горизонтальная лента: докручиваем её к открытому разделу
        revealActive() {
            const menu = this.$refs.menu;
            const item = menu && menu.querySelector('.is-active');
            if (!item || menu.scrollWidth <= menu.clientWidth) return;
            menu.scrollLeft = item.offsetLeft - (menu.clientWidth - item.offsetWidth) / 2;
        }
    }
};
</script>

<style scoped>
/* Панель — .tt-board--sm, пункты — .tt-nav-item */
.panel {
    display: grid;
    gap: 18px;
}

.panel-user {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 6px 6px 18px;
    border-bottom: 1px solid var(--tt-line);
}

.panel-avatar {
    width: 56px;
    height: 56px;
    font-size: 19px;
}

.panel-who {
    display: grid;
    justify-items: start;
    gap: 6px;
    min-width: 0;
}

.panel-name {
    max-width: 100%;
    overflow: hidden;
    color: var(--tt-ink);
    font-size: 17px;
    line-height: 1.25;
    white-space: nowrap;
    text-overflow: ellipsis;
}

/* relative — чтобы offsetLeft пунктов считался от ленты (см. revealActive) */
.panel-menu {
    position: relative;
    display: grid;
    gap: 4px;
}


.panel-label {
    flex: 1 1 auto;
    min-width: 0;
}

.panel-arrow {
    color: var(--tt-muted);
    font-size: 11px;
    opacity: 0;
    transform: translateX(-4px);
    transition: opacity 0.25s ease, transform 0.3s var(--tt-ease);
}

.panel-item:hover .panel-arrow {
    opacity: 1;
    transform: none;
}

.panel-item.is-active .panel-arrow {
    color: var(--tt-brand);
    opacity: 1;
    transform: none;
}

/* Подсказка про помощника — синяя, это дополнительный цвет */
.panel-help {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    margin: 0;
    padding: 14px;
    border: 1px dashed rgba(55, 96, 231, 0.35);
    border-radius: var(--tt-radius-md);
    background-color: var(--tt-blue-tint);
    color: var(--tt-ink);
    text-align: left;
    cursor: pointer;
    transition: border-color 0.25s ease, transform 0.3s var(--tt-ease);
}

.panel-help:hover {
    border-color: var(--tt-blue);
    transform: translateY(-2px);
}

.panel-help-icon {
    background-color: var(--tt-blue);
    color: #ffffff;
}

.panel-help:hover .panel-help-icon i {
    animation: help-seek 0.9s ease-in-out;
}

@keyframes help-seek {
    30% {
        transform: rotate(-30deg);
    }

    65% {
        transform: rotate(20deg);
    }
}

.panel-help-text {
    display: grid;
    gap: 2px;
    font-size: 14px;
}

.panel-help-text small {
    color: var(--tt-muted);
    font-size: 12px;
    line-height: 1.4;
}

/* На узком экране меню — горизонтальная лента разделов */
@media (max-width: 1000px) {
    .panel {
        gap: 14px;
    }

    .panel-user {
        padding: 2px 2px 14px;
    }

    .panel-menu {
        display: flex;
        gap: 6px;
        margin: 0 -14px;
        padding: 0 14px 2px;
        overflow-x: auto;
        scrollbar-width: none;
    }

    .panel-menu::-webkit-scrollbar {
        display: none;
    }

    .panel-item {
        flex: none;
        width: auto;
        padding: 6px 14px 6px 6px;
        border-color: var(--tt-line);
        border-radius: var(--tt-radius-pill);
    }

    .panel-icon {
        width: 30px;
        height: 30px;
        font-size: 12px;
    }

    .panel-arrow,
    .panel-help {
        display: none;
    }
}

@media (prefers-reduced-motion: reduce) {

    .panel-arrow,
    .panel-help {
        transition: none;
    }

    .panel-help:hover {
        transform: none;
    }

    .panel-help:hover .panel-help-icon i {
        animation: none;
    }
}
</style>
