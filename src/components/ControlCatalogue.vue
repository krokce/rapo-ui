<template>
  <q-page>
    <h2 class="row q-gutter-lg">
      <div>{{ filteredControlCatalogueLen }} Control<span v-if="filteredControlCatalogueLen != 1">s</span></div>
      <div v-if="controlCatalogue.length === 0">
        <q-avatar size="lg" color="grey-5">
          <q-icon name="fas fa-sync fa-spin" />
        </q-avatar>
      </div>
    </h2>

    <div class="row items-center q-mb-md">
      <q-btn
        class="col-2 q-mb-md q-pa-sm"
        size="lg"
        color="primary"
        icon="fas fa-plus"
        label="New control"
        :to="{ name: 'edit-control', params: { controlId: 'new' } }" />

      <q-select
        v-model="filter.type"
        class="col-2 q-mb-md q-pa-sm"
        clearable
        outlined
        options-dense
        emit-value
        map-options
        :options="[
          { label: 'ANL - Analysis', value: 'ANL' },
          { label: 'REC - Reconciliation', value: 'REC' },
          { label: 'CMP - Comparison', value: 'CMP' },
          { label: 'REP - Reporting', value: 'REP' },
        ]"
        label="Filter by type">
      </q-select>

      <q-input clearable class="col q-mb-md q-pa-sm" outlined v-model="filter.control_name" label="Filter by name" maxlength="45" />

      <q-select
        v-model="filter.status"
        class="col-2 q-mb-md q-pa-sm"
        clearable
        outlined
        options-dense
        emit-value
        map-options
        :options="[
          { label: 'Active', value: 'Y' },
          { label: 'Inactive', value: 'N' },
        ]"
        label="Filter by scheduler status">
      </q-select>

      <q-select
        v-model="filter.other_attributes"
        class="col-3 q-mb-md q-pa-sm"
        clearable
        outlined
        options-dense
        emit-value
        map-options
        multiple
        :options="['Preparation SQL', 'Prerequisite SQL', 'Completion SQL', 'Iterations', 'Case definitions', 'Pre-run hook', 'No Post-run hook']"
        label="Filter by any other attributes">
      </q-select>

      <q-btn flat round color="grey" class="q-mb-md q-pa-sm" icon="fas fa-times-circle" @click="clearFilters" />
    </div>

    <div>
      <q-markup-table>
        <thead>
          <tr class="bg-blue-grey-2">
            <th class="text-center" style="width: 50px">Type</th>
            <th class="text-left">Name</th>
            <th class="text-left">Schedule</th>
            <th class="text-left">Description</th>
            <th class="text-left"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="control in filteredControlCatalogue" :key="control.control_id">
            <td>
              <q-chip
                size="12px"
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
            <td class="text-left" style="width: 300px">
              <div>
                <div class="text-weight-bold text-grey-9 text-subtitle1">
                  {{ control.control_name }}
                </div>
                <router-link
                  :to="{
                    name: 'edit-control',
                    params: { controlId: control.control_id },
                  }">
                  <small class="text-grey-7"> v.{{ toDateTimeString(control.updated_date) }} </small>
                </router-link>
              </div>
            </td>
            <td style="width: 100px">
              <div class="row justify-start items-center">
                <schedule-present-box :schedule="control.schedule_config"></schedule-present-box>
              </div>
            </td>
            <td class="text-left" style="width: 100%">
              <div style="white-space: normal; word-wrap: break-word">
                {{ control.control_description }}
              </div>

              <div class="row justify-start items-center">
                <q-chip
                  clickable
                  v-if="control.case_config"
                  size="sm"
                  color="indigo-4"
                  text-color="white"
                  icon="fas fa-tag"
                  @click="$q.notify(control.case_config)">
                  Case config
                </q-chip>
                <q-chip
                  clickable
                  v-if="control.prerequisite_sql"
                  size="sm"
                  color="indigo-4"
                  text-color="white"
                  icon="fas fa-database"
                  @click="$q.notify(control.prerequisite_sql)">
                  Prerequisite SQL
                </q-chip>
                <q-chip
                  clickable
                  v-if="control.preparation_sql"
                  size="sm"
                  color="indigo-4"
                  text-color="white"
                  icon="fas fa-database"
                  @click="$q.notify(control.preparation_sql)">
                  Preparation SQL
                </q-chip>
                <q-chip
                  clickable
                  v-if="control.completion_sql"
                  size="sm"
                  color="indigo-4"
                  text-color="white"
                  icon="fas fa-database"
                  @click="$q.notify(control.completion_sql)">
                  Completion SQL
                </q-chip>
                <q-chip clickable v-if="control.need_prerun_hook === 'Y'" size="sm" color="indigo-4" text-color="white" icon="fas fa-bolt"> Pre HOOK </q-chip>
                <q-chip clickable v-if="control.need_postrun_hook != 'Y'" size="sm" color="red-4" text-color="white" icon="fas fa-bolt">
                  Post HOOK inactive</q-chip
                >
                <q-chip clickable v-if="control.status !== 'Y'" size="sm" color="red-4" text-color="white" icon="fas fa-clock"> Scheduler inactive </q-chip>
                <q-chip
                  clickable
                  v-if="control.iteration_config && JSON.parse(control.iteration_config).length > 0"
                  size="sm"
                  color="indigo-4"
                  text-color="white"
                  icon="fas fa-history"
                  @click="$q.notify(control.iteration_config)">
                  +{{ JSON.parse(control.iteration_config).length }} Iteration{{ JSON.parse(control.iteration_config).length > 1 ? "s" : "" }}
                </q-chip>
              </div>
            </td>

            <td>
              <q-btn size="sm" color="grey-7" round flat icon="fas fa-ellipsis-v">
                <q-menu>
                  <q-list dense class="text-no-wrap">
                    <run-control-dialog :control="control">
                      <q-item dense clickable class="col items-center">
                        <q-item-section> Run </q-item-section>
                      </q-item>
                    </run-control-dialog>
                    <q-separator />
                    <q-item
                      clickable
                      :to="{
                        name: 'edit-control',
                        params: { controlId: control.control_id },
                      }">
                      <q-item-section> Edit control </q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      :to="{
                        name: 'edit-control',
                        params: { controlId: control.control_id },
                        query: { clone: true },
                      }"
                      v-close-popup>
                      <q-item-section> Clone control</q-item-section>
                    </q-item>
                    <q-separator />
                    <confirm-dialog
                      icon="fas fa-trash-alt"
                      text="Recreate result tables? Past discrepancies will be deleted!"
                      :action="recreateSchema"
                      :argument="control.control_name">
                      <q-item dense clickable>
                        <q-item-section> Recreate schema </q-item-section>
                      </q-item>
                    </confirm-dialog>
                    <confirm-dialog
                      icon="fas fa-trash-alt"
                      text="Do you really want to delete this control?"
                      :action="deleteControl"
                      :argument="control.control_id">
                      <q-item dense clickable>
                        <q-item-section> Delete control </q-item-section>
                      </q-item>
                    </confirm-dialog>
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
import SchedulePresentBox from "./SchedulePresentBox.vue";
import RunControlDialog from "./RunControlDialog.vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import { useQuasar } from "quasar";

export default {
  components: {
    RunControlDialog,
    ConfirmDialog,
    SchedulePresentBox,
  },
  data() {
    return {
      isHovered: false,
      confirmDialog: false,
      $q: useQuasar(),
      controlCatalogue: [],
      filter: {
        control_name: "",
        type: null,
        status: null,
        other_attributes: null,
      },
    };
  },
  methods: {
    ...mapActions(["updateControlCatalogue"]),
    async deleteControl(control_id) {
      this.$q.loadingBar.start();

      const response = await fetch("/api/delete-control?control_id=" + control_id, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${this.$store.getters.getToken}`, "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      this.controlCatalogue = await this.updateControlCatalogue();
      this.$q.loadingBar.stop();
      this.$router.push({ name: "controls" });
    },
    recreateSchema(control_name) {
      this.$q.loadingBar.start();

      fetch("/api/delete-control-output-tables?name=" + control_name, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${this.$store.getters.getToken}`, "Content-Type": "application/json" },
      })
        .then((response) => {
          if (response.ok) {
            this.$q.notify({ type: "positive", message: "Schema for " + control_name + " was deleted. It will be recreated on the next run." });
          } else {
            this.$q.notify({ type: "negative", message: "Schema deletion for " + control_name + "' failed" });
          }
        })
        .then(() => {
          this.$q.loadingBar.stop();
        });
    },
    toDateTimeString(val) {
      var ret = new Date(val).toISOString("de-DE").substring(0, 19).replace("T", " ");
      return ret;
    },
    clearFilters() {
      this.filter.control_name = null;
      this.filter.type = null;
      this.filter.status = null;
      this.filter.other_attributes = [];
      this.$store.commit("updateSearch", "");
    },
  },
  computed: {
    ...mapGetters(["getSearch"]),
    filteredControlCatalogue() {
      const s = this.getSearch;
      var data = this.controlCatalogue;
      if (s) {
        data = this.controlCatalogue.filter((item) => (item.control_name ? item.control_name.toUpperCase().indexOf(s.toUpperCase()) > -1 : false));
      }
      if (this.filter.control_name) {
        data = data.filter((item) => item.control_name.toUpperCase().indexOf(this.filter.control_name.toUpperCase()) > -1);
      }

      if (this.filter.type) {
        data = data.filter((item) => item.control_type === this.filter.type);
      }
      if (this.filter.status) {
        data = data.filter((item) => item.status === this.filter.status);
      }
      // iterate over other attributes and filter for each
      if (this.filter.other_attributes && this.filter.other_attributes.length > 0) {
        data = data.filter((item) => {
          const attributes = this.filter.other_attributes;
          return (
            (attributes.includes("Preparation SQL") && item.preparation_sql) ||
            (attributes.includes("Prerequisite SQL") && item.prerequisite_sql) ||
            (attributes.includes("Completion SQL") && item.completion_sql) ||
            (attributes.includes("Iterations") && item.iteration_config && JSON.parse(item.iteration_config).length > 0) ||
            (attributes.includes("Case definitions") && item.case_config) ||
            (attributes.includes("Pre-run hook") && item.need_prerun_hook === "Y") ||
            (attributes.includes("No Post-run hook") && item.need_postrun_hook !== "Y")
          );
        });
      }

      return data;
    },
    filteredControlCatalogueLen() {
      return this.controlCatalogue.length;
    },
  },
  async mounted() {
    this.controlCatalogue = await this.updateControlCatalogue();
  },
};
</script>

<style scoped></style>
