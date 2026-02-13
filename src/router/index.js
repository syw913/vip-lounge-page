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
  },
  // 新增报表页路由
  {
    path: '/report',
    name: 'ReportPage',
    component: () => import(/* webpackChunkName: "about" */ '../views/ReportPage.vue')
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
// git add .
// git commit -m "更新：修改二维码样式"
// git push
// 第三步：Vercel 一键部署（永久免费）
// 1. 登录 Vercel
// 打开：https://vercel.com → 点击 Sign Up → 用 GitHub 账号登录（授权即可）。
// 2. 导入项目
// 登录后点击 New Project → Import Git Repository
// 找到你刚上传的仓库（比如 vip-lounge-page）→ 点击 Import
// 配置部署参数（自动识别，不用改）：
// Framework Preset：自动选 Vue.js
// Root Directory：留空
// Build Command：自动填充 npm run build
// Output Directory：自动填充 dist
// 点击 Deploy，等待 30 秒左右，部署完成！
// 3. 获取永久访问链接
// 部署完成后，Vercel 会生成一个域名，格式如下：
