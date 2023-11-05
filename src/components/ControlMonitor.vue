<template>
  <q-page>
    <h1>
      {{ filteredControlResultsLen }} Control<span v-if="filteredControlResultsLen != 1">s</span>
      running
    </h1>
    <p>{{ filteredControlResults }}</p>
  </q-page>
</template>

<script>
import { useQuasar } from "quasar";

export default {
  data() {
    return {
      filteredControlResults: [],
      $q: useQuasar(),
    };
  },
  computed: {
    filteredControlResultsLen() {
      return this.filteredControlResults.length;
    },
  },
  mounted() {
    const _this = this;
    this.$q.loadingBar.start();

    fetch("/api/get-running-controls", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.$store.getters.getToken}`,
        "Content-Type": "application/json",
      },
    })
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
      })
      .then(function (data) {
        _this.filteredControlResults = data;
        _this.$q.loadingBar.stop();
      });
  },
};
</script>

<style scoped></style>
