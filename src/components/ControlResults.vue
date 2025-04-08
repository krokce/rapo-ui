<template>
  <q-page>
    <h1>Last control result<span v-if="filteredControlResultsLen != 1">s</span></h1>

    <div class="q-pa-md">
      <q-markup-table dense>
        <thead>
          <tr class="bg-blue-grey-2">
            <th class="text-left">Type</th>
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
            <th class="text-left"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(control, index) in filteredControlResults" :key="control.process_id">
            <td class="text-center" :class="{ 'new-day-separator': newDaySeparator(index) }">
              <q-chip
                size="sm"
                text-color="white"
                :class="{
                  'bg-pink-8': control.control_type === 'ANL',
                  'bg-teal-8': control.control_type === 'REC',
                  'bg-lime-8': control.control_type === 'CMP',
                  'bg-indigo-6': control.control_type === 'REP',
                }"
                class="text-weight-bold">
                {{ control.control_type }}
              </q-chip>
            </td>
            <td class="text-left" :class="{ 'new-day-separator': newDaySeparator(index) }">
              <strong>{{ toDateTimeString(control.start_date) }}</strong>
            </td>
            <td class="text-center" :class="{ 'new-day-separator': newDaySeparator(index) }">{{ round(control.duration_minutes, 2) }} min</td>
            <td class="text-left text-weight-bold text-blue-grey-7" :class="{ 'new-day-separator': newDaySeparator(index) }">{{ control.process_id }}</td>
            <td class="text-left text-weight-bold text-teal" :class="{ 'new-day-separator': newDaySeparator(index) }">
              <router-link
                :to="{
                  name: 'edit-control',
                  params: { controlId: control.control_id },
                }">
                <span
                  :class="{
                    'text-pink-8': control.control_type === 'ANL',
                    'text-teal-8': control.control_type === 'REC',
                    'text-lime-8': control.control_type === 'CMP',
                    'text-indigo-6': control.control_type === 'REP',
                  }">
                  {{ control.control_name }}
                </span>
              </router-link>
            </td>
            <td class="text-left" :class="{ 'new-day-separator': newDaySeparator(index) }">{{ toDateString(control.date_from) }}</td>
            <td class="text-left" :class="{ 'new-day-separator': newDaySeparator(index) }">{{ toDateString(control.date_to) }}</td>
            <td class="text-right" :class="{ 'new-day-separator': newDaySeparator(index) }">
              <span
                v-if="control.fetched_number_a > 0 && control.control_type === 'REP'"
                class="cursor-pointer text-red"
                @click="copyToClipboard(control, 'A')">
                {{ Number(control.fetched_number_a).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
              </span>
              <span v-else>
                {{ Number(control.fetched_number_a).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
              </span>
            </td>
            <td class="text-right" :class="{ 'new-day-separator': newDaySeparator(index) }">
              {{ Number(control.fetched_number_b).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
            </td>
            <td class="text-right" :class="{ 'new-day-separator': newDaySeparator(index) }">
              <span v-if="control.error_number_a > 0" class="cursor-pointer text-red" @click="copyToClipboard(control, 'A')">
                {{ Number(control.error_number_a).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
              </span>
              <span v-else>
                {{ Number(control.error_number_a).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
              </span>
            </td>
            <td class="text-right" :class="{ 'new-day-separator': newDaySeparator(index) }">
              <span v-if="control.error_number_b > 0" class="cursor-pointer text-red" @click="copyToClipboard(control, 'B')">
                {{ Number(control.error_number_b).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
              </span>
              <span v-else>
                {{ Number(control.error_number_b).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }}
              </span>
            </td>
            <td class="text-right" :class="{ 'new-day-separator': newDaySeparator(index) }">
              <span v-if="control.error_level_a > 0" class="cursor-pointer text-red" @click="copyToClipboard(control, 'A')">
                {{ Number(control.error_level_a).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}%
              </span>
              <span v-else> {{ Number(control.error_level_a).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}% </span>
            </td>
            <td class="text-right" :class="{ 'new-day-separator': newDaySeparator(index) }">
              <span v-if="control.error_level_b > 0" class="cursor-pointer text-red" @click="copyToClipboard(control, 'B')">
                {{ Number(control.error_level_b).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}%
              </span>
              <span v-else> {{ Number(control.error_level_b).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}% </span>
            </td>
            <td class="text-right" :class="{ 'new-day-separator': newDaySeparator(index) }">{{ control.prerequisite_value }}</td>
            <td class="text-left" :class="{ 'new-day-separator': newDaySeparator(index) }">
              <q-chip class="cursor-pointer">
                <q-avatar v-if="control.status == 'Error'" icon="fas fa-exclamation-circle" color="deep-orange" text-color="white" />
                <q-avatar v-if="control.status == 'Running'" icon="fas fa-sync fa-spin" color="blue" text-color="white" />
                <q-avatar v-if="control.status == 'Success'" icon="fas fa-check-circle" color="green" text-color="white" />
                <q-avatar v-if="control.status == 'Initiated'" icon="fas fa-play-circle" color="blue" text-color="white" />
                <q-avatar v-if="control.status == 'Revoked'" icon="fas fa-minus-circle" color="grey" text-color="white" />
                <q-avatar v-if="control.status == 'Canceled'" icon="fas fa-times-circle" color="purple-3" text-color="white" />
                {{ control.status }}
              </q-chip>
            </td>
            <td class="text-left" :class="{ 'new-day-separator': newDaySeparator(index) }">
              <q-btn size="sm" color="grey-7" round flat icon="fas fa-ellipsis-v">
                <q-menu>
                  <q-list dense class="text-no-wrap">
                    <run-control-dialog :control="control" :hook="updateControlResults">
                      <q-item dense clickable class="col items-center">
                        <q-item-section> Run control </q-item-section>
                      </q-item>
                    </run-control-dialog>
                    <q-item dense clickable @click="navigateToEditControl(control)">
                      <q-item-section> Edit control </q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item v-if="control.status != 'Revoked'" dense clickable class="col items-center" @click="showRevokeDialog(control)" v-close-popup>
                      <q-item-section> Revoke run </q-item-section>
                    </q-item>
                    <q-item
                      v-if="control.status == 'Running' || control.status == 'Initiated'"
                      dense
                      clickable
                      class="col items-center"
                      @click="showCancelDialog(control)"
                      v-close-popup>
                      <q-item-section> Cancel run </q-item-section>
                    </q-item>
                    <q-item v-if="control.status == 'Error'" dense clickable class="col items-center" @click="showErrorDialog(control)" v-close-popup>
                      <q-item-section> Show error log </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
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
import RunControlDialog from "./RunControlDialog.vue";
// import ConfirmDialog from "./ConfirmDialog.vue";

export default {
  components: {
    RunControlDialog,
    // ConfirmDialog,
  },
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
    newDaySeparator(index) {
      if (index > 0) {
        const prev_date = this.toDateString(this.filteredControlResults[index - 1].start_date);
        const curr_date = this.toDateString(this.filteredControlResults[index].start_date);
        if (prev_date != curr_date) {
          return true;
        }
      }
      return false;
    },
    copyToClipboard(control, side) {
      var table_suffix = "T";
      if (control.control_type == "REC") {
        table_suffix = side;
      }

      const textarea = document.createElement("textarea");
      textarea.value = "select * from RAPO_RES" + table_suffix + "_" + control.control_name + " where RAPO_PROCESS_ID = " + control.process_id + ";";
      textarea.style.position = "fixed";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
        this.$q.notify({ type: "positive", message: "SQL statement copied to clipboard: " + textarea.value });
      } catch (err) {
        this.$q.notify({ type: "negative", message: "Failed to copy SQL to clipboard" });
      }
      document.body.removeChild(textarea);
    },
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
    navigateToEditControl(control) {
      this.$router.push({ name: "edit-control", params: { controlId: control.control_id } });
    },
    showErrorDialog(control) {
      this.$q.dialog({
        title: control.control_name + " - Error log",
        message: "<div class='text-body2' style='font-family: monospace;'>" + control.text_error.replace(/\n/g, "<br>$&") + "</div>",
        html: true,
        style: {
          width: "800px", // Adjust the width as needed
          maxWidth: "90vw", // Optional: Ensure it doesn't exceed viewport width
        },
      });
    },
    showCancelDialog(control) {
      this.$q
        .dialog({
          title: control.control_name,
          message: "Do you really want to stop the execution of this control?",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          fetch("/api/cancel-control?id=" + control.process_id, {
            method: "POST",
            headers: { Authorization: `Bearer ${this.$store.getters.getToken}`, "Content-Type": "application/json" },
          })
            .then((response) => {
              if (response.ok) {
                this.$q.notify({ type: "positive", message: "Control run '" + control.control_name + " PID:" + control.process_id + "' was canceled" });
                control.status = "Canceled";
              } else {
                this.$q.notify({ type: "negative", message: "Stopping control run '" + control.control_name + " PID:" + control.process_id + "' failed" });
              }
            })
            .then(() => {
              this.$q.loadingBar.stop();
            });
        })
        .onCancel(() => {
          this.$q.notify({ message: "No action taken" });
          // console.log('Cancel')
        });
    },
    showRevokeDialog(control) {
      this.$q
        .dialog({
          title: control.control_name,
          message: "Do you really want to revoke this control run?",
          cancel: true,
          persistent: true,
        })
        .onOk(() => {
          fetch("/api/revoke-control-run?id=" + control.process_id, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${this.$store.getters.getToken}`, "Content-Type": "application/json" },
          })
            .then((response) => {
              if (response.ok) {
                this.$q.notify({ type: "positive", message: "Control run '" + control.control_name + " PID:" + control.process_id + "' was revoked" });
                control.status = "Revoked";
              } else {
                this.$q.notify({ type: "negative", message: "Revoke of control run '" + control.control_name + " PID:" + control.process_id + "' failed" });
              }
            })
            .then(() => {
              this.$q.loadingBar.stop();
            });
        })
        .onCancel(() => {
          this.$q.notify({ message: "No action taken" });
          // console.log('Cancel')
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

.new-day-separator {
  border-top: 2px solid #cfd8dc !important;
}
</style>
