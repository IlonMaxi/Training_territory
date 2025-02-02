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
    background: #222;
    padding: 16px;
    border-radius: 12px;
}

.user-card {
    grid-column: span 1;
    background: #333;
    border-radius: 12px;
    height: 200px;
}

.user-image {
    width: 100%;
    height: 100%;
    background: #444;
    border-radius: 12px;
}

.progress-card {
    grid-column: span 1;
    background: #333;
    border-radius: 12px;
    height: 200px;
}

.stats-container {
    grid-column: span 2;
    display: flex;
    gap: 16px;
}

.stats-card {
    flex: 1;
    background: #333;
    border-radius: 12px;
    height: 100px;
}
</style>