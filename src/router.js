import { createRouter, createWebHistory } from "vue-router";
import ControlCatalogue from "./components/ControlCatalogue.vue";
import ControlEdit from "./components/ControlEdit.vue";
import ControlResults from "./components/ControlResults.vue";
import ControlMonitor from "./components/ControlMonitor.vue";
import TokenBox from "./components/TokenBox.vue";
import store from "./store";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/controls" },
    {
      name: "controls",
      path: "/controls",
      meta: { hideSearch: false },
      component: ControlCatalogue,
    },
    {
      name: "results",
      path: "/results",
      meta: { hideSearch: false },
      component: ControlResults,
    },
    {
      name: "edit-control",
      path: "/edit-control/:controlId",
      meta: { hideSearch: true },
      component: ControlEdit,
      props: true,
    },
    {
      name: "monitor",
      path: "/monitor",
      meta: { hideSearch: true },
      component: ControlMonitor,
      props: true,
    },
    {
      name: "token",
      path: "/token",
      meta: { hideSearch: true },
      component: TokenBox,
    },    
    { path: "/:notfound(.*)", redirect: "/controls" },
  ],
});

router.beforeEach(function (to, from, next) {
  if (!store.state.tokenIsValid && to.name !== "token") {
    next("/token");
  } else {
    if (to.meta.hideSearch) {
      store.state.hideSearch = true;
    } else {
      store.state.hideSearch = false;
    }
    next();
  }

});

export default router;
