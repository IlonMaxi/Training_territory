<template>
    <div class="settings">
        <!-- Личные данные -->
        <form class="tt-board card" novalidate @submit.prevent="updateUser">
            <h3 class="tt-col-title">
                <span class="tt-col-icon"><i class="fa-solid fa-id-card"></i></span>
                Личные данные
            </h3>

            <div class="photo-row">
                <label class="photo-pick" title="Выбрать фото">
                    <span class="tt-avatar photo-preview">
                        <img v-if="preview" :src="preview" alt="" @error="preview = null" />
                        <template v-else>{{ initials }}</template>
                    </span>
                    <span class="photo-badge" aria-hidden="true"><i class="fa-solid fa-camera"></i></span>
                    <input type="file" accept="image/*" aria-label="Фото профиля" @change="handleImageUpload" />
                </label>
                <div class="photo-text">
                    <b>Фото профиля</b>
                    <span>Нажмите на фото, чтобы выбрать новое. Его увидят {{ isCoach ? 'ваши клиенты' : 'тренер' }}.</span>
                    <span v-if="selectedImage" class="tt-chip">
                        <i class="fa-solid fa-paperclip"></i> {{ selectedImage.name }}
                    </span>
                </div>
            </div>

            <div class="grid grid--3">
                <label class="tt-field">
                    <span class="tt-field-label">Имя</span>
                    <input v-model.trim="user.firstName" class="tt-input" type="text" placeholder="Имя"
                        autocomplete="given-name" />
                </label>
                <label class="tt-field">
                    <span class="tt-field-label">Фамилия</span>
                    <input v-model.trim="user.lastName" class="tt-input" type="text" placeholder="Фамилия"
                        autocomplete="family-name" />
                </label>
                <label class="tt-field">
                    <span class="tt-field-label">Отчество</span>
                    <input v-model.trim="user.middleName" class="tt-input" type="text" placeholder="Отчество"
                        autocomplete="additional-name" />
                </label>
            </div>

            <div class="grid grid--2">
                <label class="tt-field">
                    <span class="tt-field-label">Почта</span>
                    <input v-model.trim="user.email" class="tt-input" type="email" placeholder="primer@mail.com"
                        autocomplete="email" />
                </label>
                <label class="tt-field">
                    <span class="tt-field-label">Телефон</span>
                    <input v-model.trim="user.phone" class="tt-input" type="tel" placeholder="+7-900-900-90-90"
                        autocomplete="tel" />
                </label>
            </div>

            <div class="grid grid--2">
                <label class="tt-field">
                    <span class="tt-field-label">Логин</span>
                    <input v-model.trim="user.login" class="tt-input" type="text" placeholder="Логин"
                        autocomplete="username" />
                </label>
                <div class="tt-field">
                    <span class="tt-field-label">Пол</span>
                    <div class="tt-choice-group" role="radiogroup" aria-label="Пол">
                        <label :class="['tt-choice', { checked: user.gender === 'male' }]">
                            <input v-model="user.gender" type="radio" value="male" />
                            <i class="fa-solid fa-mars"></i> Мужчина
                        </label>
                        <label :class="['tt-choice', { checked: user.gender === 'female' }]">
                            <input v-model="user.gender" type="radio" value="female" />
                            <i class="fa-solid fa-venus"></i> Женщина
                        </label>
                    </div>
                </div>
            </div>

            <div v-if="isCoach" class="grid grid--2">
                <label class="tt-field">
                    <span class="tt-field-label">Специализация</span>
                    <input v-model.trim="user.specialization" class="tt-input" type="text"
                        placeholder="Фитнес, пилатес и т.д." />
                </label>
                <label class="tt-field">
                    <span class="tt-field-label">Опыт</span>
                    <input v-model.trim="user.experience" class="tt-input" type="text"
                        placeholder="5 лет, 10 лет и т.д." />
                </label>
            </div>

            <div class="actions">
                <button type="submit" class="tt-btn tt-btn--primary" :disabled="saving">
                    <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i>
                    {{ saving ? 'Сохраняю…' : 'Сохранить изменения' }}
                </button>
                <transition name="tt-swap">
                    <p v-if="saved" class="tt-note tt-note--ok" role="status">
                        <i class="fa-solid fa-circle-check"></i> Данные сохранены
                    </p>
                </transition>
                <p v-if="saveError" class="tt-note tt-note--error" role="alert">
                    <i class="fa-solid fa-circle-exclamation"></i> {{ saveError }}
                </p>
            </div>
        </form>

        <!-- Профиль здоровья: помощник учитывает его при подборе тренировок и питания -->
        <section v-if="!isCoach" class="tt-board card" aria-labelledby="health-title">
            <h3 id="health-title" class="tt-col-title">
                <span class="tt-col-icon tt-col-icon--blue"><i class="fa-solid fa-heart-pulse"></i></span>
                Здоровье
            </h3>
            <p class="health-hint">
                Травмы убирают опасные упражнения из рекомендаций помощника, аллергии — блюда с этим продуктом
                из плана питания.
            </p>

            <form class="health-add" @submit.prevent="addLimitation">
                <div class="tt-segment" role="group" aria-label="Тип ограничения">
                    <button type="button" :class="{ 'is-active': newLimitation.kind === 'injury' }"
                        @click="newLimitation.kind = 'injury'">
                        <i class="fa-solid fa-bandage"></i> Травма
                    </button>
                    <button type="button" :class="{ 'is-active': newLimitation.kind === 'allergy' }"
                        @click="newLimitation.kind = 'allergy'">
                        <i class="fa-solid fa-triangle-exclamation"></i> Аллергия
                    </button>
                </div>
                <input v-model="newLimitation.value" class="tt-input" type="text" aria-label="Что именно"
                    :placeholder="newLimitation.kind === 'injury' ? 'колено, поясница, плечо…' : 'орехи, молоко, рыба…'" />
                <button type="submit" class="tt-btn tt-btn--primary tt-btn--sm" :disabled="!newLimitation.value.trim()">
                    <i class="fa-solid fa-plus"></i> Добавить
                </button>
            </form>

            <p v-if="limitationError" class="tt-note tt-note--error" role="alert">
                <i class="fa-solid fa-circle-exclamation"></i> {{ limitationError }}
            </p>

            <ul v-if="limitations.length" class="limits">
                <li v-for="item in limitations" :key="item.limitationid" :class="['limit', `limit--${item.kind}`]">
                    <i :class="item.kind === 'injury' ? 'fa-solid fa-bandage' : 'fa-solid fa-triangle-exclamation'"></i>
                    <span class="limit-kind">{{ item.kind === 'injury' ? 'Травма' : 'Аллергия' }}</span>
                    <span class="limit-value">{{ item.value }}</span>
                    <button type="button" class="limit-remove" :aria-label="`Убрать: ${item.value}`"
                        @click="removeLimitation(item.limitationid)">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </li>
            </ul>
            <p v-else class="limits-empty">
                <i class="fa-solid fa-shield-heart"></i> Ограничений не указано — рекомендации подбираются без
                исключений.
            </p>
        </section>
    </div>
</template>

<script>
import { readCookie, readUser } from '@/components/utils/cabinet.js';
import { initialsOf } from '@/components/utils/format.js';

// Поля формы → поля cookie user: после сохранения обновляем cookie,
// чтобы шапка и меню сразу показали новое имя
const COOKIE_FIELDS = {
    firstName: 'first_name',
    lastName: 'last_name',
    middleName: 'patronymic',
    email: 'email',
    phone: 'phone_number',
    login: 'username',
    gender: 'gender',
    specialization: 'specialization',
    experience: 'experience'
};

export default {
    name: 'SettingsMenu',
    data() {
        return {
            user: {
                id: null,
                role: '',
                firstName: '',
                lastName: '',
                middleName: '',
                email: '',
                phone: '',
                login: '',
                image: '',
                specialization: '',
                experience: '',
                gender: ''
            },
            selectedImage: null,
            preview: null,
            saving: false,
            saved: false,
            saveError: null,
            limitations: [],
            newLimitation: { kind: 'injury', value: '' },
            limitationError: null
        };
    },
    computed: {
        isCoach() {
            return this.user.role === 'coach';
        },
        initials() {
            return initialsOf(this.user.firstName, this.user.lastName) || 'TT';
        }
    },
    mounted() {
        this.loadUserFromCookies();
        if (!this.isCoach) this.loadLimitations();
    },
    beforeDestroy() {
        clearTimeout(this.savedTimer);
        this.revokePreview();
    },
    methods: {
        loadUserFromCookies() {
            const userData = readUser();
            if (!userData) return;

            const role = readCookie('accountType') === 'trainer' ? 'coach' : 'client';
            this.user = {
                id: userData.clientid || userData.coachid,
                role,
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                middleName: userData.patronymic || '',
                email: userData.email || '',
                phone: userData.phone_number || '',
                login: userData.username || '',
                gender: (userData.gender || '').toLowerCase(),
                image: userData.image || '',
                specialization: userData.specialization || '',
                experience: userData.experience || ''
            };
            this.preview = this.user.image && this.user.image !== 'default.jpg'
                ? `/api/uploads/${this.user.image}`
                : null;
        },
        revokePreview() {
            if (this.preview && this.preview.startsWith('blob:')) URL.revokeObjectURL(this.preview);
        },
        handleImageUpload(event) {
            const file = event.target.files && event.target.files[0];
            if (!file) return;
            this.revokePreview();
            this.selectedImage = file;
            this.preview = URL.createObjectURL(file);
        },
        // Сохранённые поля переносим в cookie user — оттуда имя берут шапка и меню
        syncCookie(image) {
            const cookieUser = readUser();
            if (!cookieUser) return;
            Object.entries(COOKIE_FIELDS).forEach(([field, key]) => {
                if (field === 'specialization' || field === 'experience') {
                    if (this.isCoach) cookieUser[key] = this.user[field];
                    return;
                }
                cookieUser[key] = this.user[field];
            });
            if (image) cookieUser.image = image;
            document.cookie = `user=${encodeURIComponent(JSON.stringify(cookieUser))}; path=/; max-age=86400;`;
        },
        async updateUser() {
            if (!this.user.id || this.saving) return;
            this.saving = true;
            this.saved = false;
            this.saveError = null;

            const formData = new FormData();
            formData.append('first_name', this.user.firstName);
            formData.append('last_name', this.user.lastName);
            formData.append('patronymic', this.user.middleName);
            formData.append('username', this.user.login);
            formData.append('phone_number', this.user.phone);
            formData.append('email', this.user.email);
            formData.append('gender', this.user.gender);

            if (this.isCoach) {
                formData.append('specialization', this.user.specialization);
                formData.append('experience', this.user.experience);
            }

            formData.append('image', this.selectedImage || this.user.image);

            const endpoint = this.isCoach
                ? `/api/coaches/${this.user.id}`
                : `/api/clients/${this.user.id}`;

            try {
                const response = await fetch(endpoint, { method: 'PUT', body: formData });
                const result = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(result.error || 'Не удалось сохранить данные');

                const image = result.user && result.user.image;
                if (image) this.user.image = image;
                this.selectedImage = null;
                this.syncCookie(image);
                this.saved = true;
                clearTimeout(this.savedTimer);
                this.savedTimer = setTimeout(() => { this.saved = false; }, 4000);
            } catch (error) {
                console.error('Ошибка сохранения профиля:', error);
                this.saveError = error.message === 'Failed to fetch'
                    ? 'Нет связи с сервером. Проверьте соединение.'
                    : error.message;
            } finally {
                this.saving = false;
            }
        },
        async loadLimitations() {
            if (!this.user.id) return;
            try {
                const response = await fetch(`/api/clients/${this.user.id}/limitations`);
                if (!response.ok) return;
                const data = await response.json();
                this.limitations = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('Не удалось загрузить ограничения:', error);
            }
        },
        async addLimitation() {
            const value = this.newLimitation.value.trim();
            if (!value) return;
            this.limitationError = null;

            try {
                const response = await fetch(`/api/clients/${this.user.id}/limitations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ kind: this.newLimitation.kind, value })
                });
                const data = await response.json();

                if (!response.ok) {
                    this.limitationError = data.error || 'Не удалось сохранить';
                    return;
                }

                this.limitations.push(data);
                this.newLimitation.value = '';
            } catch (error) {
                console.error('Не удалось добавить ограничение:', error);
                this.limitationError = 'Нет связи с сервером';
            }
        },
        async removeLimitation(id) {
            this.limitationError = null;
            try {
                const response = await fetch(`/api/clients/${this.user.id}/limitations/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Не удалось убрать ограничение');
                this.limitations = this.limitations.filter(item => item.limitationid !== id);
            } catch (error) {
                console.error('Не удалось удалить ограничение:', error);
                this.limitationError = error.message === 'Failed to fetch' ? 'Нет связи с сервером' : error.message;
            }
        }
    }
};
</script>

<style scoped>
.settings {
    display: grid;
    gap: 24px;
}

.card {
    display: grid;
    gap: 20px;
}

/* ---------- фото ---------- */

.photo-row {
    display: flex;
    align-items: center;
    gap: 18px;
}

.photo-pick {
    position: relative;
    flex: none;
    margin: 0;
    cursor: pointer;
}

.photo-pick input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
}

/* Аватар — круглый .tt-avatar, здесь крупнее */
.photo-preview {
    width: 88px;
    height: 88px;
    font-size: 28px;
    transition: transform 0.35s var(--tt-ease), box-shadow 0.35s ease;
}

.photo-pick:hover .photo-preview {
    box-shadow: var(--tt-shadow-hover);
    transform: translateY(-2px);
}

.photo-pick:focus-within .photo-preview {
    box-shadow: 0 0 0 4px rgba(248, 80, 10, 0.25);
}

.photo-badge {
    position: absolute;
    right: -6px;
    bottom: -6px;
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border: 3px solid var(--tt-surface);
    border-radius: 50%;
    background-color: var(--tt-ink);
    color: var(--tt-surface);
    font-size: 13px;
    transition: transform 0.35s cubic-bezier(0.2, 1.3, 0.3, 1);
}

.photo-pick:hover .photo-badge {
    transform: rotate(-12deg) scale(1.08);
}

.photo-text {
    display: grid;
    justify-items: start;
    gap: 4px;
    min-width: 0;
    color: var(--tt-muted);
    font-size: 14px;
    line-height: 1.5;
}

.photo-text b {
    color: var(--tt-ink);
    font-size: 16px;
}

/* ---------- поля ---------- */

.grid {
    display: grid;
    gap: 0 14px;
}

.grid--2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.grid--3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
}

.grid .tt-field {
    margin-bottom: 4px;
}

.actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 16px;
    padding-top: 18px;
    border-top: 1px solid var(--tt-line);
}

/* ---------- здоровье ---------- */

.health-hint {
    max-width: 640px;
    margin: -6px 0 0;
    color: var(--tt-soft);
    font-size: 15px;
    line-height: 1.6;
}

.health-add {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

.health-add .tt-input {
    flex: 1 1 220px;
    width: auto;
    height: 46px;
}

.limits {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
}

.limit {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 6px 6px 14px;
    border-radius: var(--tt-radius-pill);
    font-size: 14px;
    animation: limit-in 0.35s var(--tt-ease) both;
}

@keyframes limit-in {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
}

.limit--injury {
    background-color: var(--tt-brand-tint);
    color: var(--tt-brand-deep);
}

.limit--allergy {
    background-color: var(--tt-blue-tint);
    color: var(--tt-blue-deep);
}

.limit-kind {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.8;
}

.limit-value {
    color: var(--tt-ink);
    font-weight: 600;
}

.limit-remove {
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background-color: var(--tt-surface);
    color: currentColor;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.3s var(--tt-ease);
}

.limit-remove:hover {
    background-color: #dc2626;
    color: #ffffff;
    transform: rotate(90deg);
}

.limits-empty {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    color: var(--tt-muted);
    font-size: 14px;
}

.limits-empty i {
    color: var(--tt-blue);
}

@media (max-width: 760px) {
    .grid--3 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .grid--3 .tt-field:last-child {
        grid-column: 1 / -1;
    }
}

@media (max-width: 560px) {

    .grid--2,
    .grid--3 {
        grid-template-columns: minmax(0, 1fr);
    }

    .photo-preview {
        width: 72px;
        height: 72px;
        font-size: 24px;
    }

    .actions .tt-btn {
        width: 100%;
    }
}

@media (prefers-reduced-motion: reduce) {

    .photo-preview,
    .photo-badge,
    .limit-remove {
        transition: none;
    }

    .photo-pick:hover .photo-preview,
    .photo-pick:hover .photo-badge,
    .limit-remove:hover {
        transform: none;
    }

    .limit {
        animation: none;
    }
}
</style>
