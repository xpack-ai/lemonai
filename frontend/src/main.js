import { createApp } from 'vue';
import './style.scss';
//ant
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css'; // 引入重置样式
import App from './App.vue';
const app = createApp(App);

app.use(Antd);

import router from "./router/index.js";
app.use(router);

import store from "./store";
app.use(store);

import i18n from './locals';
app.use(i18n);
// 配置全局 t 函数
app.config.globalProperties.$t = i18n.global.t;

app.mount('#app')
