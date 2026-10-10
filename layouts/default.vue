<template>
    <div class="app-shell" :class="{ 'chat-open': chat.isOpen }">
        <div class="app-content">
            <Nuxt />
        </div>

        <!-- Затемнение под панелью: только на узких экранах, где панель
             перекрывает содержимое, а не ужимает его -->
        <div class="app-scrim" @click="chat.close()"></div>

        <AiNavigator />
    </div>
</template>

<script>
import AiNavigator from '@/components/chat/AiNavigator.vue';
import aiChat from '@/components/utils/AiChatState.js';

export default {
    name: 'DefaultLayout',
    components: { AiNavigator },
    data() {
        return { chat: aiChat };
    },
    mounted() {
        document.addEventListener('keydown', this.onKeydown);
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.onKeydown);
    },
    methods: {
        onKeydown(event) {
            if (event.key === 'Escape' && this.chat.isOpen) this.chat.close();
        }
    }
};
</script>

<style>
:root {
    --ai-chat-width: 380px;
}

.app-shell {
    min-height: 100vh;
}

/*
  Сайт «уезжает» влево за счёт правого отступа контента, а не transform:
  так содержимое переверстывается под новую ширину и не уходит под панель,
  и не появляется горизонтальная прокрутка.
*/
.app-content {
    transition: margin-right 0.35s cubic-bezier(0.2, 0.7, 0.3, 1);
}

.app-shell.chat-open .app-content {
    margin-right: var(--ai-chat-width);
}

.app-scrim {
    position: fixed;
    inset: 0;
    z-index: 1100;
    background-color: rgba(0, 0, 0, 0.35);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.35s ease;
}

/* На узком экране ужимать нечего — панель ложится поверх с затемнением */
@media screen and (max-width: 900px) {
    :root {
        --ai-chat-width: 100%;
    }

    .app-shell.chat-open .app-content {
        margin-right: 0;
    }

    .app-shell.chat-open .app-scrim {
        opacity: 1;
        pointer-events: auto;
    }
}

@media (prefers-reduced-motion: reduce) {

    .app-content,
    .app-scrim {
        transition: none;
    }
}
</style>
