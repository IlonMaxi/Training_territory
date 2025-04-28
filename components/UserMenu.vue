<template>
    <div class="user-menu">
        <div class="user-card">
            <div class="user-image"></div>
        </div>
        <div class="progress-card"></div>
        <div class="stats-container">
            <div class="stats-card"></div>
            <div class="stats-card"></div>
            <div class="stats-card"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserMenu',
};
</script>

<style scoped>
.user-menu {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 16px;
    background: var(--background-color);
    padding: 16px;
    border-radius: 12px;
    transition: background-color 0.5s, color 0.5s;
}

.user-card {
    grid-column: span 1;
    background: var(--background-color-white);
    border-radius: 12px;
    height: 200px;
    transition: background-color 0.5s, color 0.5s;
}

.user-image {
    width: 100%;
    height: 100%;
    background: var(--button-border-color);
    border-radius: 12px;
    transition: background-color 0.5s;
}

.progress-card {
    grid-column: span 1;
    background: var(--background-color-white);
    border-radius: 12px;
    height: 200px;
    transition: background-color 0.5s, color 0.5s;
}

.stats-container {
    grid-column: span 2;
    display: flex;
    gap: 16px;
}

.stats-card {
    flex: 1;
    background: var(--background-color-white);
    border-radius: 12px;
    height: 100px;
    transition: background-color 0.5s, color 0.5s;
}
</style>