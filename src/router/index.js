import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  // 新增：机场贵宾室权益页路由
  {
    path: '/',
    name: 'VipLounge',
    component: () => import(/* webpackChunkName: "about" */ '../views/VipLoungePage.vue')
  },
  {
    path: '/vip-loungePage',
    name: 'VipLounge',
    component: () => import(/* webpackChunkName: "about" */ '../views/VipLoungePage.vue')
  },
  // 新增：行程信息生成器路由
  {
    path: '/trip-generator',
    name: 'TripGenerator',
    component: () => import(/* webpackChunkName: "about" */ '../views/TripGeneratorPage.vue')
  }
]

const router = new VueRouter({
  // 重点1：必须用 hash 模式（history 模式需要额外配置）
  mode: 'hash',
  // 重点2：添加 base 适配部署路径
  base: process.env.BASE_URL,
  routes
})

export default router
// npm run lint -- --fix