<template>
  <q-card
    :key="control.control_id"
    class="my-card q-my-lg column shadow-1 justify-between"
    :class="{ 'shadow-3': isHovered }"
    style="width: 520px; height: 300px"
    @mouseover="isHovered = true"
    @mouseout="isHovered = false">
    <q-card-section class="col-auto bg-blue-grey-2">
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="row items-center justify-start text-h6">
            <q-chip v-if="control.status !== 'Y'" text-color="white" class="text-weight-bold bg-red-4"> Inactive </q-chip>
            <q-chip text-color="white" class="text-weight-bold q-mr-md bg-teal">
              {{ control.control_type }}
            </q-chip>
            {{ control.control_name }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn color="grey-7" round flat icon="more_vert">
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
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section class="col">
      {{ control.control_desc }}
    </q-card-section>

    <q-separator />

    <q-card-section class="col-auto q-pa-sm">
      <div class="row justify-start">
        <schedule-present-box :schedule="control.schedule"></schedule-present-box>
        <q-chip square color="blue-grey-7" text-color="white" icon="fas fa-history fa-sm">
          {{ control.days_back }} day<span v-if="control.days_back > 1">s&nbsp;</span>
          back
        </q-chip>
        <q-chip square color="blue-grey-7" text-color="white" icon="far fa-calendar-alt fa-sm">
          {{ control.days_retention }} day<span v-if="control.days_retention > 1">s</span>
        </q-chip>
      </div>
    </q-card-section>

    <q-separator />

    <div class="col-auto">
      <div class="row justify-start q-pa-sm">
        <q-chip
          clickable
          v-if="control.case_config"
          size="sm"
          color="indigo-4"
          text-color="white"
          icon="fas fa-tag fa-sm"
          @click="$q.notify(control.case_config)">
          Case config
        </q-chip>
        <q-chip
          clickable
          v-if="control.prerequisite_sql"
          size="sm"
          color="indigo-4"
          text-color="white"
          icon="fas fa-database fa-sm"
          @click="$q.notify(control.prerequisite_sql)">
          Prerequisite SQL
        </q-chip>
        <q-chip
          clickable
          v-if="control.preparation_sql"
          size="sm"
          color="indigo-4"
          text-color="white"
          icon="fas fa-database fa-sm"
          @click="$q.notify(control.preparation_sql)">
          Preparation SQL
        </q-chip>
        <q-chip clickable v-if="control.with_drop === 'Y'" size="sm" color="indigo-4" text-color="white" icon="fas fa-trash-alt fa-sm"> With Drop </q-chip>
        <q-chip clickable v-if="control.with_deletion === 'Y'" size="sm" color="indigo-4" text-color="white" icon="fas fa-trash-alt fa-sm">
          With Delete
        </q-chip>
        <q-chip clickable v-if="control.need_prerun_hook === 'Y'" size="sm" color="indigo-4" text-color="white" icon="fas fa-bolt fa-sm"> Pre HOOK </q-chip>
        <q-chip clickable v-if="control.need_postrun_hook === 'Y'" size="sm" color="indigo-4" text-color="white" icon="fas fa-bolt fa-sm"> Post HOOK </q-chip>
      </div>
    </div>
    <q-separator />

  </q-card>
</template>

<script>
import RunControlDialog from "./RunControlDialog.vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import SchedulePresentBox from "./SchedulePresentBox.vue";
import { useQuasar } from "quasar";

export default {
  props: ["control"],
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
          this.$emit("control:deleted", control_id);
        });
    },
  },
};
</script>

<style scoped></style>
