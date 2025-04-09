<template>
  <q-page>
    <h1>{{ filteredControlCatalogueLen }} Control<span v-if="filteredControlCatalogueLen != 1">s</span></h1>

    <q-btn class="q-my-lg" size="lg" color="primary" icon="fas fa-plus" label="New control" :to="{ name: 'edit-control', params: { controlId: 'new' } }" />

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
                <small class="text-grey-7">
                  <router-link
                    :to="{
                      name: 'edit-control',
                      params: { controlId: control.control_id },
                    }">
                    v.{{ toDateTimeString(control.updated_date) }}
                  </router-link>
                </small>
              </div>
            </td>
            <td style="width: 100px">
              <div class="row justify-start items-center">
                <schedule-present-box :schedule="control.schedule_config"></schedule-present-box>             
              </div>
            </td>
            <td class="text-left">
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
                  + {{ JSON.parse(control.iteration_config).length }} Iterations
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
                      text="Do you really want to delete this control?"
                      :action="deleteControl"
                      :argument="control.control_id">
                      <q-item dense clickable>
                        <q-item-section> Delete </q-item-section>
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
    };
  },
  methods: {
    ...mapActions(["updateControlCatalogue"]),
    deleteControl(control_id) {
      this.$q.loadingBar.start();

      this.$router.push({ name: "controls" });

      fetch("/api/delete-control?control_id=" + control_id, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${this.$store.getters.getToken}`, "Content-Type": "application/json" },
      })
        .then((response) => {
          if (response.ok) {
            this.$q.notify({ type: "positive", message: "Control deleted" });
            return response.json();
          } else {
            this.$q.notify({ type: "negative", message: "Unable to delete control" });
          }
        })
        .then(() => {
          this.$q.loadingBar.stop();
          this.updateControlCatalogue();
        });
    },
    toDateTimeString(val) {
      var ret = new Date(val).toISOString("de-DE").substring(0, 19).replace("T", " ");
      return ret;
    },
  },
  computed: {
    ...mapGetters(["filteredControlCatalogue"]),
    filteredControlCatalogueLen() {
      return this.filteredControlCatalogue.length;
    },
  },
  mounted() {
    this.updateControlCatalogue();
  },
};
</script>

<style scoped></style>
