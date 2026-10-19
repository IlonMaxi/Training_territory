<template>
    <div class="tt-board crud">
        <div class="crud-head">
            <div class="crud-title">
                <span class="tt-icon-tile"><i :class="icon"></i></span>
                <div>
                    <h2>{{ title }}</h2>
                    <span class="crud-count">{{ countLabel }}</span>
                </div>
            </div>
            <div class="crud-tools">
                <label class="tt-search crud-search">
                    <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                    <input v-model.trim="query" type="search" placeholder="Поиск по записям" aria-label="Поиск по записям" />
                </label>
                <button type="button" class="tt-btn tt-btn--primary tt-btn--sm" @click="openCreate">
                    <i class="fa-solid fa-plus"></i> Новая запись
                </button>
            </div>
        </div>

        <!-- Форма добавления и изменения -->
        <transition name="tt-swap">
            <form v-if="formOpen" ref="form" class="crud-form" @submit.prevent="submitForm">
                <div class="crud-form-head">
                    <b>{{ isEditing ? `Изменение записи #${currentId}` : 'Новая запись' }}</b>
                    <button type="button" class="tt-icon-btn" aria-label="Закрыть форму" @click="cancelEdit">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="crud-fields">
                    <label v-for="field in fields" :key="field.name" class="tt-field">
                        <span class="tt-field-label">{{ field.label }}</span>
                        <select v-if="field.type === 'select'" v-model.number="form[field.name]" class="tt-input" required>
                            <option disabled value="">Выберите</option>
                            <option v-for="opt in selectOptions[field.source]" :key="opt.value" :value="opt.value">
                                {{ opt.label }}
                            </option>
                        </select>
                        <input v-else v-model="form[field.name]" class="tt-input" :type="inputType(field)" :step="field.step"
                            :placeholder="placeholderOf(field)" :required="isRequired(field)" autocomplete="off" />
                    </label>
                </div>
                <p v-if="formError" class="tt-form-error"><i class="fa-solid fa-circle-exclamation"></i> {{ formError }}</p>
                <div class="crud-form-actions">
                    <button type="submit" class="tt-btn tt-btn--primary tt-btn--sm" :disabled="saving">
                        <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i>
                        {{ isEditing ? 'Сохранить' : 'Добавить' }}
                    </button>
                    <button type="button" class="tt-btn tt-btn--ghost tt-btn--sm" @click="cancelEdit">Отмена</button>
                </div>
            </form>
        </transition>

        <transition name="tt-swap">
            <p v-if="notice" class="tt-note tt-note--ok" role="status"><i class="fa-solid fa-circle-check"></i> {{ notice }}</p>
        </transition>
        <p v-if="loadError" class="tt-note tt-note--error"><i class="fa-solid fa-circle-exclamation"></i> {{ loadError }}</p>

        <!-- Записи -->
        <div v-if="loading" class="crud-skeleton">
            <span v-for="n in 6" :key="n" class="tt-skeleton"></span>
        </div>
        <div v-else-if="!filteredItems.length && !loadError" class="tt-empty">
            <i :class="query ? 'fa-solid fa-magnifying-glass' : 'fa-solid fa-database'"></i>
            {{ query ? 'Ничего не нашлось — попробуйте другой запрос' : 'Записей пока нет' }}
        </div>
        <div v-else-if="filteredItems.length" class="crud-table-wrap">
            <table class="crud-table">
                <thead>
                    <tr>
                        <th class="col-id">#</th>
                        <th v-for="field in visibleFields" :key="field.name">{{ field.label }}</th>
                        <th class="col-actions"><span class="tt-sr-only">Действия</span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in paginatedItems" :key="item[primaryKey]"
                        :class="{ editing: isEditing && currentId === item[primaryKey] }">
                        <td class="col-id">{{ item[primaryKey] }}</td>
                        <td v-for="field in visibleFields" :key="field.name" :title="cellTitle(field, item)">
                            {{ formatValue(field, item[field.name]) }}
                        </td>
                        <td class="col-actions">
                            <button type="button" class="row-btn" title="Изменить"
                                :aria-label="`Изменить запись ${item[primaryKey]}`" @click="editRecord(item)">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button type="button" class="row-btn row-btn--danger" title="Удалить"
                                :aria-label="`Удалить запись ${item[primaryKey]}`" @click="pendingDelete = item">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Страницы -->
        <div v-if="totalPages > 1" class="crud-pages">
            <button type="button" class="tt-icon-btn" aria-label="Предыдущая страница" :disabled="currentPage === 1"
                @click="prevPage">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <template v-for="(page, index) in pageList">
                <span v-if="page === '…'" :key="`gap-${index}`" class="page-gap">…</span>
                <button v-else :key="page" type="button" :class="['page', { 'is-active': page === currentPage }]"
                    :aria-current="page === currentPage ? 'page' : null" @click="currentPage = page">
                    {{ page }}
                </button>
            </template>
            <button type="button" class="tt-icon-btn" aria-label="Следующая страница"
                :disabled="currentPage === totalPages" @click="nextPage">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
            <span class="page-range">{{ rangeLabel }}</span>
        </div>

        <ConfirmDialog :open="Boolean(pendingDelete)" danger icon="fa-solid fa-trash" title="Удалить запись?"
            confirm-label="Удалить" cancel-label="Оставить" :busy="deleting" @confirm="deleteRecord"
            @cancel="pendingDelete = null">
            <template v-if="pendingDelete">
                Запись <b>#{{ pendingDelete[primaryKey] }}</b> из таблицы «{{ title }}» будет удалена без возможности
                восстановления.
                <p v-if="deleteError" class="tt-note tt-note--error delete-error">
                    <i class="fa-solid fa-circle-exclamation"></i> {{ deleteError }}
                </p>
            </template>
        </ConfirmDialog>
    </div>
</template>

<script>
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import { plural } from '@/components/utils/format.js';

const PER_PAGE = 10;

// Ответ API с ошибкой: { error } или текст
const errorOf = async (response, fallback) => {
    const data = await response.json().catch(() => ({}));
    return (data && data.error) || fallback;
};

export default {
    name: 'CrudManager',
    components: { ConfirmDialog },
    props: {
        title: { type: String, default: '' },
        icon: { type: String, default: 'fa-solid fa-database' },
        endpoint: { type: String, required: true },
        fields: { type: Array, required: true },
        primaryKey: { type: String, default: 'id' }
    },
    data() {
        return {
            items: [],
            loading: true,
            loadError: null,
            query: '',
            form: {},
            formOpen: false,
            formError: null,
            isEditing: false,
            currentId: null,
            saving: false,
            pendingDelete: null,
            deleting: false,
            deleteError: null,
            notice: null,
            currentPage: 1,
            selectOptions: {
                clients: [], coaches: [], recipes: [], workouts: [], schedule: [], exercises: [],
                measurements_in_units: [], measurements_in_kilograms: [],
                measurements_in_centimeters: [], measurements_in_percentage: [], weights_on_machine: []
            }
        };
    },
    computed: {
        // Пароль в таблице не показываем: сервер его и не отдаёт
        visibleFields() {
            return this.fields.filter(field => field.name !== 'password');
        },
        filteredItems() {
            const query = this.query.toLowerCase();
            if (!query) return this.items;
            return this.items.filter(item =>
                [item[this.primaryKey], ...this.visibleFields.map(field => this.formatValue(field, item[field.name]))]
                    .some(value => String(value).toLowerCase().includes(query)));
        },
        totalPages() {
            return Math.ceil(this.filteredItems.length / PER_PAGE);
        },
        paginatedItems() {
            const start = (this.currentPage - 1) * PER_PAGE;
            return this.filteredItems.slice(start, start + PER_PAGE);
        },
        // 1 … 4 5 6 … 20
        pageList() {
            const total = this.totalPages;
            const current = this.currentPage;
            if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
            const pages = [1];
            const from = Math.max(2, current - 1);
            const to = Math.min(total - 1, current + 1);
            if (from > 2) pages.push('…');
            for (let page = from; page <= to; page += 1) pages.push(page);
            if (to < total - 1) pages.push('…');
            pages.push(total);
            return pages;
        },
        rangeLabel() {
            const start = (this.currentPage - 1) * PER_PAGE + 1;
            const end = Math.min(this.currentPage * PER_PAGE, this.filteredItems.length);
            return `${start}–${end} из ${this.filteredItems.length}`;
        },
        countLabel() {
            if (this.loading) return 'Загрузка…';
            const n = this.items.length;
            return `${n} ${plural(n, ['запись', 'записи', 'записей'])}`;
        }
    },
    watch: {
        fields: {
            immediate: true,
            handler(newFields) {
                if (Array.isArray(newFields)) {
                    this.resetForm();
                    this.fetchRelatedOptions();
                }
            }
        },
        query() {
            this.currentPage = 1;
        }
    },
    mounted() {
        this.fetchItems();
    },
    beforeDestroy() {
        clearTimeout(this.noticeTimer);
    },
    methods: {
        getLabel(entry) {
            return entry.name || `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || entry.date || 'Без названия';
        },
        getId(entry) {
            return entry.clientid || entry.measurementid || entry.kilogramid || entry.centimetreid ||
                entry.percentageid || entry.weightid || entry.id;
        },
        inputType(field) {
            if (field.name === 'password') return 'password';
            return field.type || 'text';
        },
        // Пустой пароль при изменении записи сервер понимает как «не менять»
        isRequired(field) {
            if (field.optional) return false;
            return !(field.name === 'password' && this.isEditing);
        },
        placeholderOf(field) {
            if (field.name === 'password' && this.isEditing) return 'Оставьте пустым, чтобы не менять';
            return field.label;
        },
        showNotice(text) {
            this.notice = text;
            clearTimeout(this.noticeTimer);
            this.noticeTimer = setTimeout(() => { this.notice = null; }, 4000);
        },
        async fetchItems() {
            try {
                const res = await fetch(`/api/${this.endpoint}`);
                const data = await res.json();

                // При 401/403/500 сервер отвечает объектом {error}, а не массивом
                if (!Array.isArray(data)) {
                    console.error('Ошибка при получении данных:', data && data.error);
                    this.items = [];
                    this.loadError = (data && data.error) || 'Не удалось загрузить данные';
                    return;
                }

                this.items = data;
                this.loadError = null;
                if (this.currentPage > this.totalPages) this.currentPage = Math.max(1, this.totalPages);
            } catch (err) {
                console.error('Ошибка при получении данных:', err);
                this.items = [];
                this.loadError = 'Не удалось загрузить данные';
            } finally {
                this.loading = false;
            }
        },
        async fetchRelatedOptions() {
            const map = {
                clients: 'admin/clients', coaches: 'admin/coaches', recipes: 'admin/recipes',
                workouts: 'admin/workouts', schedule: 'admin/schedule', exercises: 'admin/exercises',
                measurements_in_units: 'admin/unit-measurements',
                measurements_in_kilograms: 'admin/kg-measurements',
                measurements_in_centimeters: 'admin/cm-measurements',
                measurements_in_percentage: 'admin/percentage-measurements',
                weights_on_machine: 'admin/weights-on-machines'
            };

            for (const [key, url] of Object.entries(map)) {
                if (!this.fields.some(f => f.source === key)) continue;
                try {
                    const res = await fetch(`/api/${url}`);
                    const data = await res.json();
                    if (!Array.isArray(data)) {
                        console.error(`Ошибка загрузки ${key}:`, data && data.error);
                        continue;
                    }
                    this.selectOptions[key] = data.map(entry => ({
                        value: this.getId(entry),
                        label: this.getLabel(entry)
                    }));
                } catch (err) {
                    console.error(`Ошибка загрузки ${key}:`, err);
                }
            }
        },
        formatValue(field, value) {
            if (value === null || value === undefined || value === '') return '—';
            if (field.type === 'select') {
                const options = this.selectOptions[field.source] || [];
                const match = options.find(opt => opt.value === value);
                return match ? match.label : value;
            }
            // «2026-10-12» или «2026-10-12T00:00:00.000Z» → «12.10.2026»
            if (field.type === 'date') {
                const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
                if (match) return `${match[3]}.${match[2]}.${match[1]}`;
            }
            if (field.type === 'time') return String(value).slice(0, 5);
            if (typeof value === 'object') return JSON.stringify(value);
            return value;
        },
        cellTitle(field, item) {
            const text = String(this.formatValue(field, item[field.name]));
            return text.length > 30 ? text : null;
        },
        async submitForm() {
            this.saving = true;
            this.formError = null;
            try {
                if (this.isEditing) await this.updateItem();
                else await this.createItem();
            } catch (err) {
                this.formError = err.message === 'Failed to fetch' ? 'Нет связи с сервером.' : err.message;
            } finally {
                this.saving = false;
            }
        },
        async createItem() {
            const res = await fetch(`/api/${this.endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.form)
            });
            if (!res.ok) throw new Error(await errorOf(res, 'Не удалось добавить запись'));
            await this.fetchItems();
            this.resetForm();
            this.showNotice('Запись добавлена');
        },
        async updateItem() {
            const id = this.currentId;
            const res = await fetch(`/api/${this.endpoint}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.form)
            });
            if (!res.ok) throw new Error(await errorOf(res, 'Не удалось сохранить запись'));
            await this.fetchItems();
            this.resetForm();
            this.showNotice(`Запись #${id} сохранена`);
        },
        async deleteRecord() {
            const item = this.pendingDelete;
            if (!item) return;
            const id = item[this.primaryKey];
            this.deleting = true;
            this.deleteError = null;
            try {
                const res = await fetch(`/api/${this.endpoint}/${id}`, { method: 'DELETE' });
                if (!res.ok) throw new Error(await errorOf(res, 'Не удалось удалить запись'));
                if (this.isEditing && this.currentId === id) this.resetForm();
                await this.fetchItems();
                this.pendingDelete = null;
                this.showNotice(`Запись #${id} удалена`);
            } catch (err) {
                this.deleteError = err.message === 'Failed to fetch' ? 'Нет связи с сервером.' : err.message;
            } finally {
                this.deleting = false;
            }
        },
        openCreate() {
            this.resetForm();
            this.formOpen = true;
            this.scrollToForm();
        },
        editRecord(item) {
            const form = {};
            this.fields.forEach((field) => {
                let value = item[field.name];
                if (field.name === 'password') value = '';
                // <input type="date"> понимает только «2026-10-12»
                else if (field.type === 'date' && value) value = String(value).slice(0, 10);
                form[field.name] = value === null || value === undefined ? '' : value;
            });
            this.form = { ...item, ...form };
            this.currentId = item[this.primaryKey];
            this.isEditing = true;
            this.formOpen = true;
            this.formError = null;
            this.scrollToForm();
        },
        scrollToForm() {
            this.$nextTick(() => {
                const form = this.$refs.form;
                if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        },
        cancelEdit() {
            this.resetForm();
        },
        resetForm() {
            this.form = {};
            if (this.fields) {
                this.fields.forEach((field) => {
                    this.$set(this.form, field.name, '');
                });
            }
            this.currentId = null;
            this.isEditing = false;
            this.formOpen = false;
            this.formError = null;
        },
        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage += 1;
        },
        prevPage() {
            if (this.currentPage > 1) this.currentPage -= 1;
        }
    }
};
</script>

<style scoped>
/* Панель — .tt-board */
.crud {
    display: grid;
    gap: 18px;
}

/* ---------- шапка ---------- */

.crud-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px 20px;
}

.crud-title {
    display: flex;
    align-items: center;
    gap: 14px;
}

.crud-title h2 {
    margin: 0;
    color: var(--tt-ink);
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
}

.crud-count {
    color: var(--tt-muted);
    font-size: 13px;
}

.crud-tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

/* Поиск — .tt-search, здесь только ширина */
.crud-search {
    width: 240px;
}

/* ---------- форма ---------- */

.crud-form {
    display: grid;
    gap: 14px;
    padding: 18px;
    border: 1px solid var(--tt-line-brand);
    border-radius: var(--tt-radius-lg);
    background-color: var(--tt-brand-50);
}

.crud-form-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: var(--tt-ink);
    font-size: 16px;
}

.crud-fields {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0 12px;
}

.crud-fields .tt-field {
    margin-bottom: 10px;
}

.crud-fields .tt-input {
    height: 44px;
    background-color: var(--tt-surface);
}

.crud-form .tt-form-error {
    margin: 0;
}

.crud-form-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

/* ---------- таблица ---------- */

.crud-skeleton {
    display: grid;
    gap: 8px;
}

.crud-skeleton .tt-skeleton {
    height: 44px;
    border-radius: var(--tt-radius-md);
}

.crud-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--tt-line);
    border-radius: var(--tt-radius-md);
}

.crud-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.crud-table th,
.crud-table td {
    max-width: 260px;
    padding: 12px 14px;
    overflow: hidden;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.crud-table th {
    position: sticky;
    top: 0;
    background-color: var(--tt-bg-soft);
    color: var(--tt-muted);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.crud-table td {
    border-top: 1px solid var(--tt-line);
    color: var(--tt-soft);
    font-variant-numeric: tabular-nums;
}

.crud-table tbody tr {
    transition: background-color 0.15s ease;
}

.crud-table tbody tr:hover {
    background-color: var(--tt-brand-50);
}

.crud-table tbody tr.editing {
    background-color: var(--tt-brand-tint);
}

.col-id {
    width: 1%;
    color: var(--tt-muted) !important;
    font-weight: 600;
}

/* Действия прилипают к правому краю, даже когда таблица шире блока */
.col-actions {
    position: sticky;
    right: 0;
    width: 1%;
    background-color: var(--tt-surface);
    text-align: right !important;
    box-shadow: -10px 0 12px -10px rgba(15, 20, 39, 0.15);
}

th.col-actions {
    background-color: var(--tt-bg-soft);
}

.crud-table tbody tr:hover .col-actions {
    background-color: var(--tt-brand-50);
}

.crud-table tbody tr.editing .col-actions {
    background-color: #ffeee5;
}

body.dark-theme .crud-table tbody tr.editing .col-actions {
    background-color: #2a1d17;
}

.row-btn {
    display: inline-grid;
    place-items: center;
    width: 32px;
    height: 32px;
    margin: 0 0 0 4px;
    padding: 0;
    border: 1px solid var(--tt-line-brand);
    border-radius: 50%;
    background-color: var(--tt-surface);
    color: var(--tt-soft);
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.row-btn:hover {
    border-color: var(--tt-brand);
    background-color: var(--tt-brand);
    color: #ffffff;
}

.row-btn--danger:hover {
    border-color: #dc2626;
    background-color: #dc2626;
}

/* ---------- страницы ---------- */

.crud-pages {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
}

.crud-pages .tt-icon-btn {
    width: 36px;
    height: 36px;
    font-size: 12px;
}

.crud-pages .tt-icon-btn:hover {
    transform: none;
}

.crud-pages .tt-icon-btn:disabled {
    cursor: default;
    opacity: 0.4;
}

.page {
    min-width: 36px;
    height: 36px;
    margin: 0;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: var(--tt-radius-pill);
    background: transparent;
    color: var(--tt-soft);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.page:hover {
    border-color: var(--tt-line-brand);
    color: var(--tt-brand-deep);
}

.page.is-active {
    background: var(--tt-gradient-brand);
    color: #ffffff;
}

.page-gap {
    padding: 0 4px;
    color: var(--tt-muted);
}

.page-range {
    margin-left: auto;
    color: var(--tt-muted);
    font-size: 13px;
}

.delete-error {
    margin: 12px 0 0;
    text-align: left;
}

@media (max-width: 640px) {
    .crud-tools,
    .crud-search {
        width: 100%;
    }

    .crud-tools .tt-btn {
        width: 100%;
    }

    .page-range {
        width: 100%;
        margin: 4px 0 0;
    }
}

@media (prefers-reduced-motion: reduce) {

    .crud-table tbody tr,
    .row-btn,
    .page {
        transition: none;
    }
}
</style>
