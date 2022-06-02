// Edited by: *** ***, *** ***, *** ***
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Group from "../views/Group.vue";
import Automations from "@/views/Automations/Automations.vue";
import Log from "@/views/Log/Log.vue";
import Statistic from "@/views/Statistic/Statistic.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/group/:id",
    name: "Group",
    component: Group
  },
  {
    path: "/automations",
    name: "Automations",
    component: Automations
  },
  {
    path: "/log",
    name: "Log",
    component: Log
  },
  {
    path: "/stats",
    name: "Stats",
    component: Statistic
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
