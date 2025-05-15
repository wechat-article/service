import { createMemoryHistory, createRouter } from 'vue-router'

import AboutView from '@renderer/pages/About.vue'
import ProxyView from '@renderer/pages/Proxy.vue'
// import FormatterView from '@renderer/pages/Formatter.vue'
import CredentialsView from '@renderer/pages/Credentials.vue'

const routes = [
  { path: '/', redirect: '/proxy' },
  {
    path: '/proxy',
    component: ProxyView,
    meta: {
      title: '代理设置',
      sort: 1
    }
  },
  { path: '/credentials', component: CredentialsView, meta: { title: 'Credentials', sort: 2 } },
  // { path: '/formatter', component: FormatterView, meta: { title: '格式转换', sort: 3 } },
  { path: '/about', component: AboutView, meta: { title: '关于', sort: 4 } }
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes
})
