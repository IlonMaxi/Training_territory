<template>
  <div>
    <HeaderAfterLogin />
    <ScheduleComponent :user="user" />
    <section id="progress">
      <AddMeasurements v-if="accountType === 'client'" :client="user" />
    </section>
    <FooterLastComponent />
  </div>
</template>

<script>
import HeaderAfterLogin from '~/components/common/Header.vue';
import ScheduleComponent from '~/components/client/Schedule.vue';
import FooterLastComponent from '~/components/common/FooterLast.vue';
import AddMeasurements from '~/components/client/AddMeasurements.vue';

export default {
    components: {
        HeaderAfterLogin,
        ScheduleComponent,
        FooterLastComponent,
        AddMeasurements
    },
    data() {
        return {
            user: null, // РҐСЂР°РЅРёРј РґР°РЅРЅС‹Рµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
            accountType: null // РўРёРї Р°РєРєР°СѓРЅС‚Р°
        };
    },
    methods: {
        // Р¤СѓРЅРєС†РёСЏ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РєСѓРєРё
        getCookie(name) {
            if (process.client) { // РЈР±РµРґРёРјСЃСЏ, С‡С‚Рѕ РєРѕРґ РІС‹РїРѕР»РЅСЏРµС‚СЃСЏ РЅР° РєР»РёРµРЅС‚Рµ
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) {
                    return decodeURIComponent(parts.pop().split(';').shift());
                }
            }
            return null;
        },

        // Р’РѕСЃСЃС‚Р°РЅРѕРІР»РµРЅРёРµ РґР°РЅРЅС‹С… РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РёР· РєСѓРєРё
        restoreUserData() {
            const userCookie = this.getCookie('user');
            const accountTypeCookie = this.getCookie('accountType');

            if (userCookie && accountTypeCookie) {
                this.user = JSON.parse(userCookie); // РџСЂРµРѕР±СЂР°Р·СѓРµРј СЃС‚СЂРѕРєСѓ JSON РІ РѕР±СЉРµРєС‚
                this.accountType = accountTypeCookie;
            } else {
                // Р•СЃР»Рё РґР°РЅРЅС‹С… РЅРµС‚, РїРµСЂРµРЅР°РїСЂР°РІР»СЏРµРј РЅР° СЃС‚СЂР°РЅРёС†Сѓ РІС…РѕРґР°
                this.$router.push({ name: 'LoginPage' });
            }
        },

        // РЈРґР°Р»РµРЅРёРµ РєСѓРєРё Рё РІС‹С…РѕРґ
        logout() {
            if (process.client) { // РЈР±РµРґРёРјСЃСЏ, С‡С‚Рѕ РєРѕРґ РІС‹РїРѕР»РЅСЏРµС‚СЃСЏ РЅР° РєР»РёРµРЅС‚Рµ
                document.cookie = 'user=; path=/; max-age=0;';
                document.cookie = 'accountType=; path=/; max-age=0;';
                this.$router.push({ name: 'LoginPage' });
            }
        }
    },
    created() {
        this.restoreUserData(); // Р’РѕСЃСЃС‚Р°РЅР°РІР»РёРІР°РµРј РґР°РЅРЅС‹Рµ РїСЂРё Р·Р°РіСЂСѓР·РєРµ СЃС‚СЂР°РЅРёС†С‹
    }
};
</script>

<style scoped>
body {
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color 0.5s ease, color 0.5s ease;
}
</style>
