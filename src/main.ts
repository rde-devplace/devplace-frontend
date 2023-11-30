import { createApp } from 'vue';
import App from './App.vue';
import './assets/index.css';

// router를 가져옵니다.
import router from './router';

// 앱을 생성하고, 라우터를 추가합니다.
createApp(App).use(router).mount('#app');





