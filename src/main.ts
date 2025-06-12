import { createApp } from 'vue'

import App from './App.vue'
import '@yike-design/ui/es/index.less'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// 引入全局方法
import { YkMessage, YkNotification } from '@yike-design/ui'
import Icon from '@yike-design/ui/es/components/svg-icon'
import './style.less'
//路由
import router from './router'
const app= createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.config.globalProperties.$notification = YkNotification
app.config.globalProperties.$message = YkMessage
app.use(router)
.use(Icon)
.use(pinia)
app.mount('#app')
