import path from 'path';
import { createRouter, createWebHashHistory } from 'vue-router'

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
    path: "/auth",
    name: "login",
    component: () => import(/* webpackChunkName: "auth" */ "@/view/auth/index.vue"),
  },
  {
    path: "/auth/google",
    name: "google",
    component: () => import(/* webpackChunkName: "auth" */ "@/view/auth/GoogleCallback.vue"),
  },
  {
    path: "/demo",
    name: "demo",
    component: () => import(/* webpackChunkName: "demo" */ "@/view/demo/index.vue"),
    meta: { verify: true }
  },{
    path: "/pricing",
    name: "pricing",
    component: () => import("@/view/pay/pricing.vue"),
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
      },
      {
        path: "about",
        component: () => import("@/view/setting/about.vue"),
        meta: { verify: true }
      },{
        path:"usage",
        component: () => import("@/view/auth/usage.vue"),
        meta: { verify: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token');
  const { meta = {} } = to;
  // If route requires authentication and no token exists, redirect to login
  // if (meta.verify && !token) {
  //   console.log("Authentication failed, redirecting to login");
  //   next({ name: 'login' });
  //   return;
  // }
  next();
})

export default router