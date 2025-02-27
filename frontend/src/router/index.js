import { createRouter, createWebHistory } from "vue-router";
// import Home from "../views/Home.vue";
import Editor from "../views/Editor.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";
import Documents from "../views/Documents.vue";
import ProseMirrorTest from "../views/ProseMirrorTest.vue";

const routes = [
  { path: "/", component: Documents, meta: { requiresAuth: true } },
  { path: "/editor/:id", component: Editor, meta: { requiresAuth: true } },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/profile", component: Profile, meta: { requiresAuth: true } },
  { path: "/prosemirror-test", component: ProseMirrorTest },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.path === "/login" || to.path === "/register") {
    return next();
  }

  if (!token) {
    return next("/login");
  }

  try {
    const response = await fetch("http://localhost:3001/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("response", response);

    if (!response.ok) {
      localStorage.removeItem("token");
      return next("/login");
    }
  } catch (err) {
    localStorage.removeItem("token");
    return next("/login");
  }

  next();
});

export default router;
