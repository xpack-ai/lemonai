import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: "/",
    name: "app",
    component: () => import(/* webpackChunkName: "lemon" */ "@/view/lemon/index.vue"),
    meta: { verify: true }
  },
  {
    path:"/share/:id?",
    name: "share",
    component: () => import(/* webpackChunkName: "lemon" */ "@/view/share/index.vue"),
    meta: { verify: true }
  },
  {
    path: "/lemon/:id?",
    name: "lemon",
    component: () => import(/* webpackChunkName: "lemon" */ "@/view/lemon/index.vue"),
    meta: { verify: true }
  },
  {
    path: "/demo",
    name: "demo",
    component: () => import(/* webpackChunkName: "demo" */ "@/view/demo/index.vue"),
    meta: { verify: true }
  },
  {
    path: "/setting",
    component: () => import("@/view/setting/index.vue"),
    meta: { verify: true },
    children: [
      {
        path: "basic",
        component: () => import("@/view/setting/basic.vue"),
        meta: { verify: true }
      },
      {
        path: "default-model",
        component: () => import("@/view/setting/default-model.vue"),
        meta: { verify: true }
      },
      {
        path: "default-model-setting",
        component: () => import("@/view/setting/defaultModelSetting.vue"),
        meta: { verify: true }
      },
      {
        path: "model-service",
        component: () => import("@/view/setting/model.vue"),
        meta: { verify: true }
      },
      {
        path: "search-service",
        component: () => import("@/view/setting/search.vue"),
        meta: { verify: true }

      },
      {
        path: "mcp-service",
        component: () => import("@/view/setting/mcp.vue"),
        meta: { verify: true }
      },
      {
        path: "experience",
        component: () => import("@/view/setting/experience.vue"),
        meta: { verify: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});


router.beforeEach((to, from, next) => {

  next();
})

export default router