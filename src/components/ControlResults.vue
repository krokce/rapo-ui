<template>
  <q-page>
    <h1>
      {{ filteredControlResultsLen }} Control result<span
        v-if="filteredControlResultsLen != 1"
        >s</span
      >
    </h1>

    <div class="q-pa-md">
      <q-table
        class="my-sticky-header-table"
        flat
        bordered
        dense
        :rows="filteredControlResults"
        :columns="resColumns"
        row-key="process_id"
        virtual-scroll
        :rows-per-page-options="[0]"
        v-model:pagination="pagination">
      </q-table>
    </div>

  </q-page>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      pagination: {
        rowsPerPage: 0,
      },
    };
  },
  methods: {
    ...mapActions(["updateControlResults"]),
    toDateString(val) {
      var ret = new Date(val).toISOString("de-DE").substring(0, 10);
      return ret;
    },
    toDateTimeString(val) {
      var ret = new Date(val).toISOString("de-DE").substring(0, 10);
      return ret;
    },
  },
  computed: {
    ...mapGetters(["filteredControlResults"]),
    filteredControlResultsLen() {
      return this.filteredControlResults.length;
    },
    resColumns() {
      return [
        {
          name: "process_id",
          align: "left",
          label: "PROCESS ID",
          field: "process_id",
          classes: "text-weight-bold text-blue-grey-7",
          sortable: true,
        },
        {
          name: "start_date",
          align: "right",
          label: "START TIMSTAMP",
          field: "start_date",
          format: (val) =>
            new Date(val)
              .toISOString("de-DE")
              .substring(0, 19)
              .replace("T", " "),
          classes: "text-weight-bold",
          sortable: true,
        },
        {
          name: "date_from",
          align: "right",
          label: "FROM",
          field: "date_from",
          format: (val) =>
            new Date(val)
              .toISOString("de-DE")
              .substring(0, 10)
              .replace("T", " "),
        },
        {
          name: "date_to",
          align: "right",
          label: "TO",
          field: "date_to",
          format: (val) =>
            new Date(val)
              .toISOString("de-DE")
              .substring(0, 10)
              .replace("T", " "),
        },
        {
          name: "duration_minutes",
          align: "right",
          label: "DURATION",
          field: "duration_minutes",
          format: (val) => `${val} min.`,
        },
        {
          name: "control_name",
          align: "left",
          label: "CONTROL NAME",
          field: "control_name",
          classes: "text-weight-bold text-teal",
          sortable: false,
        },
        {
          name: "fetched_a",
          align: "right",
          label: "FETCHED A",
          field: "fetched_a",
          sortable: false,
        },
        {
          name: "fetched_b",
          align: "right",
          label: "FETCHED B",
          field: "fetched_b",
          sortable: false,
        },
        {
          name: "errors_a",
          align: "right",
          label: "ERRORS A",
          field: "errors_a",
          sortable: false,
        },
        {
          name: "errors_b",
          align: "right",
          label: "ERRORS B",
          field: "errors_b",
          sortable: false,
        },
        {
          name: "error_level",
          align: "right",
          label: "ERRORS [%]",
          field: "error_level_a",
          format: (val) => `${val}%`,
          classes: "text-red",
          sortable: false,
        },
        {
          name: "status",
          align: "center",
          label: "STATUS",
          field: "status",
          sortable: true,
        },
        {
          name: "prerequisite_value",
          align: "right",
          label: "PREREQUISITE",
          field: "prerequisite_value",
          sortable: false,
        },
        {
          name: "error",
          align: "left",
          label: "ERROR",
          field: "text_error",
          sortable: true,
        },
      ];
    },
    resRows() {
      let rows = [];
      for (let i = 0; i < this.filteredControlResults.length; i++) {
        var ctrl = this.filteredControlResults[i];
        rows.push({
          process_id: ctrl.process_id,
          control_name: ctrl.control_name,
          start_date: ctrl.start_date,
          date_from: ctrl.date_from,
          date_to: ctrl.date_to,
          error_level: ctrl.error_level ? ctrl.error_level : "0",
          status: ctrl.status,
        });
      }
      rows.forEach((row, index) => {
        row.index = index;
      });
      return rows;
    },
  },
  mounted() {
    this.updateControlResults();
  },
};
</script>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 550px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #ccc

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
