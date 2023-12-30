<template>
  <q-page>
    <h1>{{ filteredControlResultsLen }} Control result<span v-if="filteredControlResultsLen != 1">s</span></h1>

    <div class="q-pa-md">
      <q-markup-table dense="true">
        <thead>
          <tr class="bg-blue-grey-2">
            <th class="text-left">Run timestamp</th>
            <th class="text-center">Run duration</th>
            <th class="text-left">PID</th>
            <th class="text-left">Processname</th>
            <th class="text-left">Run from</th>
            <th class="text-left">Run to</th>
            <th class="text-right">Fetched A</th>
            <th class="text-right">Fetched B</th>
            <th class="text-right">Discr. A</th>
            <th class="text-right">Discr. B</th>
            <th class="text-right">Err. lvl A [%]</th>
            <th class="text-right">Err. lvl B [%]</th>
            <th class="text-right">Prerequisite</th>
            <th class="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="control in filteredControlResults" :key="control.process_id">
            <td class="text-left">
              <strong>{{ toDateTimeString(control.start_date) }}</strong>
            </td>
            <td class="text-center">{{ round(control.duration_minutes, 2) }} min</td>
            <td class="text-left text-weight-bold text-blue-grey-7">{{ control.process_id }}</td>
            <td class="text-left text-weight-bold text-teal">
              <router-link
                :to="{
                  name: 'edit-control',
                  params: { controlId: control.control_id },
                }">
                {{ control.control_name }}
              </router-link>
            </td>
            <td class="text-left">{{ toDateString(control.date_from) }}</td>
            <td class="text-left">{{ toDateString(control.date_to) }}</td>
            <td class="text-right">{{ control.fetched_a }}</td>
            <td class="text-right">{{ control.fetched_b }}</td>
            <td class="text-right">{{ control.errors_a }}</td>
            <td class="text-right">{{ control.errors_b }}</td>
            <td class="text-right text-red">{{ round(control.error_level_a, 2) }}%</td>
            <td class="text-right text-red">{{ round(control.error_level_b, 2) }}%</td>
            <td class="text-right">{{ control.prerequisite_value }}</td>
            <td class="text-left">
              <q-chip class="cursor-pointer">
                <q-avatar
                  v-if="control.status == 'Error'"
                  icon="fas fa-exclamation-circle"
                  color="deep-orange"
                  text-color="white"
                  @click="showErrorDialog(control)" />
                <q-avatar v-if="control.status == 'Success'" icon="fas fa-check-circle" color="green" text-color="white" />
                <q-avatar v-if="control.status == 'Initiated'" icon="fas fa-play-circle" color="blue" text-color="white" />
                <q-avatar v-if="control.status == 'Deleted'" icon="fas fa-times-circle" color="grey" text-color="white" />
                <q-avatar v-if="control.status == 'Running'" icon="fas fa-sync fa-spin" color="blue" text-color="white" />
                {{ control.status }}
              </q-chip>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </q-page>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { useQuasar } from "quasar";

export default {
  data() {
    return {
      $q: useQuasar(),
      pagination: {
        rowsPerPage: 0,
      },
      refreshTimer: null,
    };
  },
  methods: {
    ...mapActions(["updateControlResults"]),
    toDateString(val) {
      var ret = new Date(val).toISOString("de-DE").substring(0, 10);
      return ret;
    },
    toDateTimeString(val) {
      var ret = new Date(val).toISOString("de-DE").substring(0, 19).replace("T", " ");
      return ret;
    },
    round(val, places) {
      return Math.round(val * Math.pow(10, places)) / Math.pow(10, places);
    },
    showErrorDialog(control) {
      this.$q.dialog({
        title: control.control_name,
        message: control.text_error,
      });
    },
    startRefreshTimer() {
      this.refreshTimer = setInterval(this.updateControlResults, 10000);
    },
    stopRefreshTimer() {
      clearInterval(this.refreshTimer);
    },
  },
  computed: {
    ...mapGetters(["filteredControlResults"]),
    filteredControlResultsLen() {
      return this.filteredControlResults.length;
    },
  },
  mounted() {
    this.updateControlResults();
    this.startRefreshTimer();
  },
  unmounted() {
    this.stopRefreshTimer();
  },
};
</script>

<style lang="css" scoped>
/* Override the default link styles */
a {
  color: #009688;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

a:visited {
  color: #009688;
}
</style>
