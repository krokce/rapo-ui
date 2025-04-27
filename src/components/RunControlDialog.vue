<template>
  <span @click="visible = true">
    <slot></slot>
  </span>

  <q-dialog v-model="visible">
    <q-card class="column my-card" style="width: 400px">
      <q-card-section class="col bg-blue-grey-2">
        <div class="row no-wrap items-center">
          <div class="text-h6 ellipsis">{{ control.control_name }}</div>
        </div>
      </q-card-section>

      <q-card-section class="column items-center">
        <div class="q-pa-md">
          Run for <span v-if="!range">date</span> <span v-else>range</span>:
          <p>{{ selectDate }}</p>

          <div class="row items-start">
            <q-date v-model="selectDate" :range="range" today-btn mask="YYYY-MM-DD" color="teal" flat />
          </div>

          <div class="column">
            <q-toggle label="Run for date range" color="teal" :false-value="false" :true-value="true" v-model="range" @update:model-value="rangeChange" />

            <q-toggle color="blue" label="Run in debug mode" v-model="debug_mode">
              <q-tooltip anchor="top left" self="bottom left" :offset="[0, 5]"> Leave RAPO_TEMP% tables after execution </q-tooltip>
            </q-toggle>

          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn v-close-popup="-1" flat color="primary" label="Run" icon="fas fa-play" @click="runControl" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useQuasar } from "quasar";

export default {
  props: ["control", "hook"],
  data() {
    return {
      visible: false,
      range: false,
      debug_mode: false,
      selectDate: new Date().toISOString().substring(0, 10),
      $q: useQuasar(),
    };
  },
  methods: {
    rangeChange() {
      var date = new Date();
      var toDate = new Date(date.setDate(date.getDate() - 2)).toISOString().substring(0, 10);
      var fromDate = new Date(date.setDate(date.getDate() - 1)).toISOString().substring(0, 10);
      if (this.range) {
        this.selectDate = {
          from: fromDate,
          to: toDate,
        };
      } else {
        this.selectDate = fromDate;
      }
    },
    runControl() {
      this.$q.loadingBar.start();

      var url = "";
      if (this.range) {
        url = "/api/run-control?name=" + this.control.control_name + "&date_from=" + this.selectDate.from + "&date_to=" + this.selectDate.to + (this.debug_mode?"&debug_mode=true":"");
      } else {
        url = "/api/run-control?name=" + this.control.control_name + "&date=" + this.selectDate + (this.debug_mode?"&debug_mode=true":"");
      }

      fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.$store.getters.getToken}`, "Content-Type": "application/json" },
      })
        .then((response) => {
          if (response.ok) {
            this.$q.notify({ type: "positive", message: "Control " + this.control.control_name + " queued for execution" });
            return response.json();
          } else {
            this.$q.notify({ type: "negative", message: "Control " + this.control.control_name + " failed" });
          }
        })
        .then(() => {
          this.$q.loadingBar.stop();
          if (this.hook) {
            this.hook();
          } else {
            this.$router.push({ name: "results" });
          }
        });
    },
  },
};
</script>
