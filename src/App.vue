<template>
  <q-layout view="hHh Lpr lff" class="bg-grey-1 rounded-borders">
    <q-header elevated class="bg-white text-grey-8 q-py-xs" height-hint="58">
      <q-toolbar>
        <q-btn flat dense round @click="toggleLeftDrawer" aria-label="Menu" icon="menu" />

        <q-btn flat no-caps no-wrap class="q-ml-xs" v-if="$q.screen.gt.xs" :to="{ name: 'controls' }">
          <q-icon name="fas fa-poll" color="teal" size="40px" />
          <q-toolbar-title shrink class="column text-left">
            <span class="text-weight-bold">Rapo</span>
            <span class="text-caption">
              {{ getEnvInfo && getEnvInfo.instance_name ? getEnvInfo.instance_name : "" }}
              {{ getEnvVersion && getEnvVersion.version ? "v." + getEnvVersion.version : "" }}</span
            >
          </q-toolbar-title>
        </q-btn>

        <q-space class="col-1" />

        <div class="YL__toolbar-input-container row no-wrap" v-if="!hideSearch">
          <q-input dense outlined square v-model="search" placeholder="Search control name" class="bg-white col" @keyup="updateSearch(search)" />
          <q-btn class="YL__toolbar-input-btn" color="grey-3" text-color="grey-8" icon="close" unelevated @click="updateSearch('')" />
        </div>

        <q-space class="col-2" />
        <span class="text-caption text-weight-light text-teal" v-if="getTokenIsValid">Connected</span>
        <span class="text-caption text-weight-light text-red" v-if="!getTokenIsValid">Disconnected</span>
        <q-btn round flat color="teal" icon="fas fa-plug fa-rotate-90" @click="disconnect" v-if="getTokenIsValid">
          <q-tooltip>
            Disconnect from:<br />
            <div><strong>Server:</strong>&nbsp;{{ getEnvInfo && getEnvInfo.database_server ? getEnvInfo.database_server : "N/A" }}</div>
            <div><strong>Database:</strong>&nbsp;{{ getEnvInfo && getEnvInfo.database_name ? getEnvInfo.database_name : "N/A" }}</div>
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2" :width="170" :breakpoint="500" v-if="getTokenIsValid">
      <q-scroll-area class="fit">
        <q-list padding class="menu-list">
          <q-item v-for="link in menuLinks" :key="link.text" v-ripple clickable :to="link.route">
            <q-item-section avatar>
              <q-icon color="grey" :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <div class="q-ma-lg">
          <router-view></router-view>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { useQuasar } from "quasar";

export default {
  data() {
    return {
      leftDrawerOpen: false,
      menuLinks: [
        {
          icon: "fas fa-chart-line",
          text: "Controls",
          route: "/controls",
        },
        {
          icon: "fas fa-tasks",
          text: "Results",
          route: "/results",
        },
      ],
      $q: useQuasar(),
    };
  },
  methods: {
    ...mapActions(["updateControlCatalogue", "updateSearch", "removeToken"]),
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen;
    },
    disconnect() {
      if (this.$q.cookies.has("rapo_token")) {
        this.$q.cookies.remove("rapo_token");
      }
      this.removeToken();
      this.$router.push("token");
    },
  },
  computed: {
    ...mapGetters(["hideSearch", "getSearch", "getTokenIsValid", "getEnvVersion", "getEnvStatus", "getEnvInfo"]),
    search: {
      get() {
        return this.getSearch;
      },
      set(value) {
        return this.updateSearch(value);
      },
    },
  },
};
</script>

<style lang="sass">
.YL

  &__toolbar-input-container
    min-width: 100px
    width: 55%

  &__toolbar-input-btn
    border-radius: 0
    border-style: solid
    border-width: 1px 1px 1px 0
    border-color: rgba(0,0,0,.24)
    max-width: 30px
    width: 100%

  &__drawer-footer-link
    color: inherit
    text-decoration: none
    font-weight: 500
    font-size: .75rem

    &:hover
      color: #000
</style>
