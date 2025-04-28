<template>
    <div class="crud-manager">
        <h2>{{ title }}</h2>

        <!-- Форма -->
        <form @submit.prevent="submitForm" class="form-grid">
            <div v-for="field in fields" :key="field.name" class="form-row">
                <label :for="field.name" class="form-label">{{ field.label }}</label>
                <select v-if="field.type === 'select'" v-model.number="form[field.name]" class="form-input" required>
                    <option disabled value="">Выберите</option>
                    <option v-for="opt in selectOptions[field.source]" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                    </option>
                </select>
                <input v-else v-model="form[field.name]" :type="field.type || 'text'" :step="field.step"
                    :placeholder="field.label" :id="field.name" class="form-input" required />
            </div>
            <div class="button-row">
                <button type="submit" class="form-button orange">{{ isEditing ? 'Обновить' : 'Добавить' }}</button>
                <button v-if="isEditing" type="button" @click="cancelEdit" class="form-button gray">Отмена</button>
            </div>
        </form>

        <!-- Список -->
        <ul>
            <li v-for="item in paginatedItems" :key="item[primaryKey]">
                <div class="record">
                    <div v-for="field in fields" :key="field.name" class="record-field">
                        <span class="field-label">{{ field.label }}:</span>
                        <span class="field-value">{{ formatValue(field, item[field.name]) }}</span>
                    </div>
                </div>
                <div class="record-actions">
                    <button @click="editRecord(item)">Изменить</button>
                    <button @click="deleteRecord(item[primaryKey])">Удалить</button>
                </div>
            </li>
        </ul>

        <!-- Пагинация -->
        <div class="pagination-controls" v-if="totalPages > 1">
            <button @click="prevPage" :disabled="currentPage === 1">← Назад</button>
            <span>Страница {{ currentPage }} из {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Вперёд →</button>

            <div class="go-to-page">
                <input v-model.number="goToPageInput" type="number" :min="1" :max="totalPages" />
                <button @click="goToPage">Перейти</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: String,
        endpoint: String,
        fields: Array,
        primaryKey: { type: String, default: 'id' },
    },
    data() {
        return {
            items: [],
            form: {},
            isEditing: false,
            currentId: null,
            currentPage: 1,
            itemsPerPage: 10,
            goToPageInput: 1,
            selectOptions: {
                clients: [], coaches: [], recipes: [], workouts: [], schedule: [], exercises: [],
                measurements_in_units: [], measurements_in_kilograms: [],
                measurements_in_centimeters: [], measurements_in_percentage: [], weights_on_machine: []
            }
        };
    },
    computed: {
        paginatedItems() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.items.slice(start, start + this.itemsPerPage);
        },
        totalPages() {
            return Math.ceil(this.items.length / this.itemsPerPage);
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
        }
    },
    mounted() {
        this.fetchItems();
    },
    methods: {
        getLabel(entry) {
            return entry.name || `${entry.first_name || ''} ${entry.last_name || ''}`.trim() || entry.date || 'Без названия';
        },
        getId(entry) {
            return entry.clientid || entry.measurementid || entry.kilogramid || entry.centimetreid ||
                entry.percentageid || entry.weightid || entry.id;
        },
        async fetchItems() {
            try {
                const res = await fetch(`/api/${this.endpoint}`);
                this.items = await res.json();
                this.currentPage = 1;
            } catch (err) {
                console.error('Ошибка при получении данных:', err);
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
            if (field.type === 'select') {
                const options = this.selectOptions[field.source] || [];
                const match = options.find(opt => opt.value === value);
                return match ? match.label : value;
            }
            return value;
        },
        async submitForm() {
            this.isEditing ? await this.updateItem() : await this.createItem();
        },
        async createItem() {
            try {
                await fetch(`/api/${this.endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.form)
                });
                this.fetchItems();
                this.resetForm();
            } catch (err) {
                console.error('Ошибка создания:', err);
            }
        },
        async updateItem() {
            try {
                await fetch(`/api/${this.endpoint}/${this.currentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.form)
                });
                this.fetchItems();
                this.resetForm();
            } catch (err) {
                console.error('Ошибка обновления:', err);
            }
        },
        async deleteRecord(id) {
            try {
                await fetch(`/api/${this.endpoint}/${id}`, { method: 'DELETE' });
                this.fetchItems();
            } catch (err) {
                console.error('Ошибка удаления:', err);
            }
        },
        editRecord(item) {
            this.form = { ...item };
            this.currentId = item[this.primaryKey];
            this.isEditing = true;
            window.scrollTo({ top: 0, behavior: 'smooth' }); // ⬆️ Автопрокрутка наверх
        },
        cancelEdit() {
            this.resetForm();
        },
        resetForm() {
            this.form = {};
            if (!this.fields) return;
            this.fields.forEach(field => {
                this.form[field.name] = '';
            });
            this.currentId = null;
            this.isEditing = false;
        },
        nextPage() {
            if (this.currentPage < this.totalPages) this.currentPage++;
        },
        prevPage() {
            if (this.currentPage > 1) this.currentPage--;
        },
        goToPage() {
            if (this.goToPageInput >= 1 && this.goToPageInput <= this.totalPages) {
                this.currentPage = this.goToPageInput;
            }
        }
    }
};
</script>

<style scoped>
.pagination-controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
}

.pagination-controls button {
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
    background-color: var(--background-color);
    color: var(--text-color);
    border: 1px solid var(--button-border-color);
    border-radius: 8px;
    transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.pagination-controls button:hover {
    background-color: var(--button-hover-color);
    color: var(--button-hover-color-white);
}

.go-to-page {
    display: flex;
    align-items: center;
    gap: 8px;
}

.go-to-page input {
    width: 60px;
    padding: 4px;
    background-color: var(--background-color);
    color: var(--text-color);
    border: 1px solid var(--button-border-color);
    border-radius: 6px;
    transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}

.crud-manager {
    background: var(--background-color-white);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.07);
    padding: 32px;
    max-width: 800px;
    margin: 40px auto;
    font-family: 'Segoe UI', sans-serif;
    color: var(--text-color);
    transition: background-color 0.5s, color 0.5s;
}

.crud-manager h2 {
    color: var(--button-hover-color);
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 24px;
}

.form-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 32px;
}

.form-row {
    display: flex;
    align-items: center;
    gap: 16px;
}

.form-label {
    min-width: 100px;
    font-weight: 500;
    font-size: 14px;
    color: var(--text-color);
    transition: color 0.5s;
}

.form-input {
    flex: 1;
    padding: 10px 14px;
    font-size: 14px;
    border: 1px solid var(--button-border-color);
    border-radius: 12px;
    background: var(--background-color);
    color: var(--text-color);
    transition: 0.3s;
}

.form-input:focus {
    outline: none;
    border-color: var(--button-hover-color);
}

.button-row {
    display: flex;
    gap: 12px;
    margin-top: 8px;
}

.form-button {
    padding: 8px 18px;
    font-size: 14px;
    border-radius: 12px;
    font-weight: 600;
    border: 1.5px solid var(--button-border-color);
    background-color: var(--background-color);
    color: var(--text-color);
    box-sizing: border-box;
    cursor: pointer;
    transition: 0.3s;
}

.form-button.orange {
    border-color: var(--button-hover-color);
    color: var(--button-hover-color);
}

.form-button.orange:hover {
    background: var(--button-hover-color);
    color: var(--button-hover-color-white);
}

.form-button.gray {
    border-color: #bbb;
    color: #555;
}

.form-button.gray:hover {
    background: #eee;
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

li {
    padding: 14px 0;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    flex-wrap: wrap;
    transition: background-color 0.3s, color 0.3s;
}

li button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    margin-left: 12px;
    padding: 4px 8px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
}

li button:first-of-type {
    color: #1e88e5;
}

li button:last-of-type {
    color: #e53935;
}

li button:hover {
    background-color: var(--background-color);
}

.record {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 8px;
}

.record-field {
    display: flex;
    gap: 6px;
    font-size: 15px;
}

.field-label {
    font-weight: 600;
    color: var(--text-color);
}

.field-value {
    color: var(--text-color);
    word-break: break-word;
}
</style>