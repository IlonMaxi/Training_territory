<template>
    <nav class="tt-board tt-board--sm admin-panel" aria-label="Таблицы базы данных">
        <label class="tt-search">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input v-model.trim="query" type="search" placeholder="Найти таблицу" aria-label="Найти таблицу" />
        </label>

        <div class="groups">
            <div v-for="group in filteredGroups" :key="group.title" class="group">
                <span class="group-title">{{ group.title }}</span>
                <button v-for="item in group.items" :key="item.id" type="button"
                    :class="['tt-nav-item', 'item', { 'is-active': item.id === active }]"
                    :aria-current="item.id === active ? 'page' : null" @click="$emit('select', item.id)">
                    <span class="tt-icon-tile tt-icon-tile--xs item-icon"><i :class="item.icon"></i></span>
                    <span class="item-label">{{ item.label }}</span>
                </button>
            </div>
            <p v-if="!filteredGroups.length" class="nothing">Таблица не найдена</p>
        </div>
    </nav>
</template>

<script>
// Меню админки: таблицы по группам. Какая открыта, решает страница
export default {
    name: 'AdminPanel',
    props: {
        // [{ title, items: [{ id, label, icon }] }]
        groups: { type: Array, default: () => [] },
        active: { type: String, default: null }
    },
    data() {
        return { query: '' };
    },
    computed: {
        filteredGroups() {
            const query = this.query.toLowerCase();
            if (!query) return this.groups;
            return this.groups
                .map(group => ({
                    ...group,
                    items: group.items.filter(item => item.label.toLowerCase().includes(query))
                }))
                .filter(group => group.items.length);
        }
    }
};
</script>

<style scoped>
/* Панель — .tt-board--sm, поиск — .tt-search, пункты — .tt-nav-item */
.admin-panel {
    display: grid;
    gap: 14px;
}

.groups {
    display: grid;
    gap: 14px;
    max-height: calc(100vh - 230px);
    margin: 0 -6px;
    padding: 0 6px;
    overflow-y: auto;
    scrollbar-width: thin;
}

.group {
    display: grid;
    gap: 2px;
}

.group-title {
    margin: 0 0 4px 10px;
    color: var(--tt-muted);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

/* Таблиц много — пункты плотнее, чем в меню профиля */
.item {
    gap: 10px;
    padding: 6px 10px 6px 6px;
    font-size: 14px;
}

.item-label {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.nothing {
    margin: 4px 10px;
    color: var(--tt-muted);
    font-size: 14px;
}

/* На узком экране — группы лентами, без внутренней прокрутки */
@media (max-width: 1000px) {
    .groups {
        max-height: none;
        overflow: visible;
    }

    .group {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .group-title {
        flex-basis: 100%;
        margin: 0 0 0 4px;
    }

    .item {
        width: auto;
        padding: 4px 12px 4px 4px;
        border-color: var(--tt-line);
        border-radius: var(--tt-radius-pill);
    }

    .item-icon {
        width: 26px;
        height: 26px;
        font-size: 11px;
    }
}
</style>
