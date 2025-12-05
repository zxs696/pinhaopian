import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import '@/assets/styles/global.scss'
import { initializeStores } from './stores'

const app = createApp(App)
const pinia = createPinia()

// 安装插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化store后挂载应用
initializeStores(app, router).then(() => {
  app.mount('#app')
}).catch(error => {
  console.error('初始化失败:', error)
  app.mount('#app')
})