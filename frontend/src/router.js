import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";
import Semesters from "./views/Semesters.vue";
import Students from "./views/Students.vue";
import Utils from "./config/utils.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/register",
      name: "register",
      component: Register,
    },
    {
      path: "/semesters",
      name: "semesters",
      component: Semesters,
      meta: { requiresAuth: true },
    },
    {
      path: "/students",
      name: "students",
      component: Students,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "home" },
    },
  ],
});

router.beforeEach((to) => {
  const signedIn = Utils.getStore("user");
  if (to.meta.requiresAuth && !signedIn?.token) {
    return { name: "login" };
  }
  if (to.meta.adminOnly && signedIn?.role !== "admin") {
    return { name: "home" };
  }
});

export default router;
