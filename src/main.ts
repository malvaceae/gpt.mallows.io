// Vue.js
import { createApp } from 'vue';

// Quasar
import { useQuasar } from '@/plugins/quasar';

// App
import App from '@/App.vue';

// create the root component
const app = createApp(App);

// use the quasar
useQuasar(app);

// mount the app
app.mount('#app');
