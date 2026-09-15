import './assets/nuxt-ui.css'
import './assets/content.css'
import ui from '@nuxt/ui/vue-plugin'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

const router = createRouter({
  routes: [],
  history: createWebHistory(),
})

createApp(App)
  .use(router)
  .use(ui)
  .mount('#app')
