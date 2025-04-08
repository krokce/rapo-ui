<template>
  <q-page>
    <div>
      <h1>{{ control.control_name ? control.control_name : "New control" }}</h1>

      <q-form @submit="save" @reset="cancel">
        <div class="row q-mx-xl q-gutter-md">
          <q-input
            class="col"
            outlined
            v-model="control.control_name"
            label="Control name"
            :rules="[
              (val) => (val && val.length >= 3) || 'Control name should have minimum 3 characters',
              (val) => (val && val.length <= 45) || 'Control name should have maximum 45 characters',
            ]"
            @keyup="control && control.control_name && (control.control_name = control.control_name.toUpperCase())" />

          <q-input class="col" outlined v-model="control.control_alias" label="Control alias" />

          <q-select
            class="col-2"
            outlined
            v-model="controlVersion"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            label="Version"
            :options="controlVersions"
            @filter="filterDatasourceList"
            @update:model-value="controlVersionChanged">
            <template v-slot:prepend>
              <q-icon name="fas fa-tag" size="sm" @click.stop.prevent />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No past versions </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md">
          <q-input
            class="col"
            v-model="control.control_description"
            label="Control description"
            :rules="[(val) => !val || val.length <= 500 || 'Description should have maximum 500 characters']"
            outlined
            autogrow />
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md">
          <q-select
            class="col"
            outlined
            emit-value
            map-options
            v-model="control.control_type"
            :options="[
              { label: 'REC - Reconciliation', value: 'REC' },
              { label: 'ANL - Analysis', value: 'ANL' },
              { label: 'REP - Report', value: 'REP' },
              { label: 'CMP - Comparison', value: 'CMP' },
              // { label: 'Key Performance Indicator', value: 'KPI' },
            ]"
            label="Control type"
            @update:model-value="controlTypeChanged" />

          <q-select
            class="col"
            outlined
            readonly
            emit-value
            map-options
            v-model="control.control_engine"
            :options="[
              { label: 'Database', value: 'DB' },
              { label: 'Python', value: 'PY' },
            ]"
            label="Control engine" />

          <q-select
            class="col"
            outlined
            emit-value
            map-options
            v-model="control.status"
            :options="[
              { label: 'Active', value: 'Y' },
              { label: 'Inactive', value: 'N' },
            ]"
            label="Control status" />

          <q-select
            class="col"
            outlined
            emit-value
            map-options
            v-model="control.need_postrun_hook"
            :options="[
              { label: 'Yes', value: 'Y' },
              { label: 'No', value: 'N' },
            ]"
            label="Post-run hook" />
          <q-select
            class="col"
            outlined
            emit-value
            map-options
            v-model="control.need_prerun_hook"
            :options="[
              { label: 'Yes', value: 'Y' },
              { label: 'No', value: 'N' },
            ]"
            label="Pre-run hook" />

          <q-select
            class="col"
            outlined
            emit-value
            map-options
            v-model="withDeleteionDrop"
            :options="[
              { label: 'After defined period', value: 'N' },
              { label: 'On each run, delete', value: 'deletion' },
              { label: 'On each run, drop', value: 'drop' },
            ]"
            label="Remove past results"
            @update:model-value="deletionDropChanged" />

          <q-input
            class="col-auto"
            v-model.number="control.days_retention"
            v-if="withDeleteionDrop === 'N'"
            type="number"
            outlined
            label="Results retention (days)"
            :rules="[(val) => ((val || val === 0) && val >= 0) || 'Not a valid value']">
            <template v-slot:prepend>
              <q-icon name="fas fa-trash-alt" @click.stop.prevent />
            </template>
          </q-input>
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md" v-if="control.control_type === 'ANL' || control.control_type === 'REP'">
          <q-select
            class="col"
            outlined
            v-model="control.source_name"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            label="Datasource"
            :options="datasourceListOptions"
            @filter="filterDatasourceList"
            :rules="[(val) => (val && val.length > 0) || 'You must select a datasource']">
            <template v-slot:prepend>
              <q-icon name="fas fa-table" @click.stop.prevent />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No datasources found </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            v-if="control.control_type === 'REC' || control.control_type === 'CMP'"
            class="col-2"
            outlined
            v-model="control.source_date_field"
            label="Date column"
            :options="datasourceDateColumns"
            behavior="menu"
            :rules="[(val) => (val && val.length > 0) || 'No date column to select!']">
            <template v-slot:prepend>
              <q-icon name="far fa-calendar-alt" @click.stop.prevent />
            </template>
          </q-select>

          <q-select
            v-if="control.control_type === 'ANL' || control.control_type === 'REP'"
            class="col-2"
            outlined
            v-model="control.source_date_field"
            label="Date column"
            :options="datasourceDateColumns"
            behavior="menu">
            <template v-slot:prepend>
              <q-icon name="far fa-calendar-alt" @click.stop.prevent />
            </template>
          </q-select>
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md" v-if="control.control_type === 'REC' || control.control_type === 'CMP'">
          <q-select
            class="col"
            outlined
            v-model="control.source_name_a"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            label="Datasource A"
            :options="datasourceListOptions"
            @filter="filterDatasourceList"
            :rules="[(val) => (val && val.length > 0) || 'You must select a datasource']">
            <template v-slot:prepend>
              <q-icon name="fas fa-table" @click.stop.prevent />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No datasources found </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-select
            class="col-2"
            outlined
            v-model="control.source_date_field_a"
            label="Date column A"
            :options="datasourceADateColumns"
            behavior="menu"
            :rules="[(val) => (val && val.length > 0) || 'No date column to select!']">
            <template v-slot:prepend>
              <q-icon name="far fa-calendar-alt" @click.stop.prevent />
            </template>
          </q-select>
          <q-select
            class="col"
            outlined
            v-model="control.source_name_b"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            label="Datasource B"
            :options="datasourceListOptions"
            @filter="filterDatasourceList"
            :rules="[(val) => (val && val.length > 0) || 'You must select a datasource']">
            <template v-slot:prepend>
              <q-icon name="fas fa-table" @click.stop.prevent />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No datasources found </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-select
            class="col-2"
            outlined
            v-model="control.source_date_field_b"
            label="Date column B"
            :options="datasourceBDateColumns"
            behavior="menu"
            :rules="[(val) => (val && val.length > 0) || 'No date column to select!']">
            <template v-slot:prepend>
              <q-icon name="far fa-calendar-alt" @click.stop.prevent />
            </template>
          </q-select>
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md">
          <q-select
            v-if="control.control_type === 'ANL' || control.control_type === 'REP'"
            class="col"
            outlined
            clearable
            v-model="control.output_table_columns"
            multiple
            :options="datasourceColumns"
            use-chips
            stack-label
            label="Select output (leave empty for all columns)">
            <template v-slot:prepend>
              <q-icon name="fas fa-columns" @click.stop.prevent="populateColumns()" />
            </template>
          </q-select>

          <q-select
            v-if="control.control_type === 'REC' || control.control_type === 'CMP'"
            class="col"
            outlined
            clearable
            v-model="control.output_table_a_columns"
            multiple
            :options="datasourceAColumns"
            use-chips
            stack-label
            label="Select output A-side (leave empty for all columns)">
            <template v-slot:prepend>
              <q-icon name="fas fa-columns" @click.stop.prevent="populateColumns('A')" />
            </template>
          </q-select>

          <q-select
            v-if="control.control_type === 'REC' || control.control_type === 'CMP'"
            class="col"
            outlined
            clearable
            v-model="control.output_table_b_columns"
            multiple
            :options="datasourceBColumns"
            use-chips
            stack-label
            label="Select output B-side (leave empty for all columns)">
            <template v-slot:prepend>
              <q-icon name="fas fa-columns" @click.stop.prevent="populateColumns('B')" />
            </template>
          </q-select>
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md">
          <div class="col" v-if="control.control_type !== 'REP'">
            <code-box label="Matching criteria (Rule config)" v-model="control.rule_config"> </code-box>
          </div>
          <div class="col" v-if="control.control_type !== 'REC' && control.control_type !== 'REP'">
            <code-box label="Missmatch criteria (Error definition)" v-model="control.error_definition"> </code-box>
          </div>
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md" v-if="inputs.includes('filter')">
          <div class="col" v-if="control.control_type === 'ANL' || control.control_type === 'REP'">
            <code-box label="Filter" v-model="control.source_filter"> </code-box>
          </div>
          <div class="col" v-if="control.control_type === 'REC' || control.control_type === 'CMP'">
            <code-box label="Filter (Datasource A)" v-model="control.source_filter_a"> </code-box>
          </div>
          <div class="col" v-if="control.control_type === 'REC' || control.control_type === 'CMP'">
            <code-box label="Filter (Datasource B)" v-model="control.source_filter_b"> </code-box>
          </div>
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md" v-if="inputs.includes('case_config')">
          <div class="col">
            <code-box label="Case config" v-model="control.case_config"> </code-box>
          </div>
          <div class="col">
            <code-box label="Result config" v-model="control.result_config"> </code-box>
          </div>
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md" v-if="inputs.includes('preparation_sql')">
          <div class="col">
            <code-box label="Preparation SQL" v-model="control.preparation_sql"> </code-box>
          </div>
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md" v-if="inputs.includes('prerequisite_sql')">
          <div class="col">
            <code-box label="Prerequisite SQL" v-model="control.prerequisite_sql"> </code-box>
          </div>
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md" v-if="inputs.includes('completion_sql')">
          <div class="col">
            <code-box label="Completion SQL" v-model="control.completion_sql"> </code-box>
          </div>
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md">
          <q-toggle color="blue" label="Datasource filter" v-model="inputs" val="filter" />
          <q-toggle color="blue" label="Case config" v-model="inputs" val="case_config" />
          <q-toggle color="blue" label="Preparation SQL" v-model="inputs" val="preparation_sql" />
          <q-toggle color="blue" label="Prerequisite SQL" v-model="inputs" val="prerequisite_sql" />
          <q-toggle color="blue" label="Completion SQL" v-model="inputs" val="completion_sql" />
        </div>

        <div class="row q-mx-xl q-my-xs q-gutter-md">
          <schedule-edit-box class="col" v-model="control.schedule_config"></schedule-edit-box>

          <q-input
            class="col-auto"
            v-model.number="control.period_back"
            type="number"
            outlined
            label="Run days back"
            :rules="[(val) => ((val || val === 0 || val < 5) && val >= 0) || 'Not a valid value']">
            <template v-slot:prepend>
              <q-icon name="fas fa-history" @click.stop.prevent />
            </template>
          </q-input>
        </div>
        <q-btn label="Save" type="submit" color="primary" />
        <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm" />
      </q-form>
    </div>

    <!-- <p class="q-ma-xl">{{ control }}</p> -->
  </q-page>
</template>

<script>
import { useQuasar } from "quasar";
import { mapGetters } from "vuex";
import CodeBox from "./CodeBox.vue";
import ScheduleEditBox from "./ScheduleEditBox.vue";

export default {
  components: {
    CodeBox,
    ScheduleEditBox,
  },
  props: {
    controlId: {
      type: String,
      default: "new",
    },
  },
  data() {
    return {
      control: {},
      controlVersions: [],
      controlVersion: "ACTUAL",
      datasourceColumns: null,
      datasourceDateColumns: null,
      datasourceAColumns: null,
      datasourceADateColumns: null,
      datasourceBColumns: null,
      datasourceBDateColumns: null,
      datasourceList: null,
      datasourceListOptions: null,
      datasourceListAOptions: null,
      datasourceListBOptions: null,
      withDeleteionDrop: "N",
      inputs: [],
      $q: useQuasar(),
    };
  },
  computed: {
    ...mapGetters(["controlCatalogueById"]),
  },
  methods: {
    filterDatasourceList(val, update, abort) {
      if (val.length < 0) {
        abort();
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        this.datasourceListOptions = this.datasourceList.filter((v) => v.toLowerCase().indexOf(needle) > -1);
      });

      // setTimeout(() => {
      //   update(() => {
      //     if (val === "") {
      //       this.datasourceListOptions = this.datasourceList;
      //     } else {
      //       const needle = val.toLowerCase();
      //       this.datasourceListOptions = this.datasourceList.filter(
      //         (v) => v.toLowerCase().indexOf(needle) > -1
      //       );
      //     }
      //   });
      // }, 500);
    },
    getDatasources() {
      this.$q.loadingBar.start();

      fetch("/api/get-datasources", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.$store.getters.getToken}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          this.datasourceList = data;
          this.$q.loadingBar.stop();
        });
    },
    async getDatasourceColumns(datasource_name) {
      const response = await fetch("/api/get-datasource-columns?datasource_name=" + datasource_name, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.$store.getters.getToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    },
    async getDatasourceDateColumns(datasource_name) {
      const response = await fetch("/api/get-datasource-date-columns?datasource_name=" + datasource_name, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.$store.getters.getToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    },
    populateColumns(side) {
      if (side === "A") {
        this.control.output_table_a_columns = this.datasourceAColumns;
      } else if (side === "B") {
        this.control.output_table_b_columns = this.datasourceBColumns;
      } else {
        this.control.output_table_columns = this.datasourceColumns;
      }
    },
    controlTypeChanged() {
      this.control.source_name = null;
      this.control.source_name_a = null;
      this.control.source_name_b = null;
      this.control.source_date_field = null;
      this.control.source_date_field_a = null;
      this.control.source_date_field_b = null;
      this.control.rule_config = null;
      this.control.error_definition = null;
      this.control.source_filter = null;
      this.control.source_filter_a = null;
      this.control.source_filter_b = null;
      this.control.case_config = null;
      this.control.result_config = null;
      this.control.output_table_columns = [];
      this.control.output_table_a_columns = [];
      this.control.output_table_b_columns = [];
    },
    async getControlVersions(controlId) {
      const response = await fetch("/api/get-control-versions?control_id=" + controlId, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.$store.getters.getToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        this.controlVersions = data;
        this.controlVersions.forEach((element) => {
          element.label = new Date(element.audit_date).toISOString("de-DE").substring(0, 19).replace("T", " ");
        });
        this.control.label = "ACTUAL";
        this.controlVersions.unshift(this.control);
      }
    },
    controlVersionChanged() {
      this.control = this.controlVersion;

      try {
        if (this.control.control_type === "ANL" || this.control.control_type === "REP") {
          this.control.output_table_columns = JSON.parse(this.control["output_table"]).columns;
          this.getDatasourceColumns(this.control.source_name).then((data) => (this.datasourceColumns = data));
          this.getDatasourceDateColumns(this.control.source_name).then((data) => (this.datasourceDateColumns = data));
        } else {
          this.control.output_table_a_columns = JSON.parse(this.control["output_table_a"]).columns;
          this.getDatasourceColumns(this.control.source_name_a).then((data) => (this.datasourceAColumns = data));
          this.getDatasourceDateColumns(this.control.source_name_a).then((data) => (this.datasourceADateColumns = data));
          this.control.output_table_b_columns = JSON.parse(this.control["output_table_b"]).columns;
          this.getDatasourceColumns(this.control.source_name_b).then((data) => (this.datasourceBColumns = data));
          this.getDatasourceDateColumns(this.control.source_name_b).then((data) => (this.datasourceBDateColumns = data));
        }
      } catch (err) {
        console.log(err);
      }

      // Update UI switch buttons "inputs" based on the present fields
      if (this.control.source_filter || this.control.source_filter_a || this.control.source_filter_b) {
        this.inputs.push("filter");
      }
      if (this.control.case_config || this.control.result_config) {
        this.inputs.push("case_config");
      }
      if (this.control.preparation_sql) {
        this.inputs.push("preparation_sql");
      }
      if (this.control.prerequisite_sql) {
        this.inputs.push("prerequisite_sql");
      }
      if (this.control.completion_sql) {
        this.inputs.push("completion_sql");
      }

      this.withDeleteionDrop = this.control.with_drop === "Y" ? "drop" : this.control.with_deletion === "Y" ? "deletion" : "N";
    },
    deletionDropChanged() {
      if (this.withDeleteionDrop === "N") {
        this.control.with_deletion = "N";
        this.control.with_drop = "N";
      } else if (this.withDeleteionDrop === "deletion") {
        this.control.with_deletion = "Y";
        this.control.with_drop = "N";
      } else if (this.withDeleteionDrop === "drop") {
        this.control.with_deletion = "N";
        this.control.with_drop = "Y";
      }
    },
    addNewLineIfLastLineStartsWithDoubleDash(str) {
      if (str && str.includes("--") && str.substr(str.length - 1) != "\n") {
        return str + "\n";
      }
      return str;
    },
    save() {
      // Add new line if last line contains a comment to avoid RAPO SQL builder issue
      this.control.source_filter = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.source_filter);
      this.control.source_filter_a = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.source_filter_a);
      this.control.source_filter_b = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.source_filter_b);

      this.control.rule_config = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.rule_config);
      this.control.error_config = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.error_config);
      this.control.case_config = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.case_config);

      // Stringify the JSON obejcts holding the columns values
      if (this.control.control_type === "ANL" || this.control.control_type === "REP") {
        if (!this.control.output_table_columns) {
          this.control.output_table = null;
        } else {
          this.control.output_table = JSON.stringify({
            columns: this.control.output_table_columns,
          });
        }
      } else {
        if (!this.control.output_table_a_columns) {
          this.control.output_table_a = null;
        } else {
          this.control.output_table_a = JSON.stringify({
            columns: this.control.output_table_a_columns,
          });
        }

        if (!this.control.output_table_b_columns) {
          this.control.output_table_b = null;
        } else {
          this.control.output_table_b = JSON.stringify({
            columns: this.control.output_table_b_columns,
          });
        }
      }

      if (this.control.control_type === "REC") {
        // Combine OUTPUT from the A and B fields
        this.control.output_table = [];
        if (this.control.output_table_a_columns) {
          for (const out_field of this.control.output_table_a_columns) {
            this.control.output_table.push({ column_a: out_field });
          }
        }

        if (this.control.output_table_b_columns) {
          for (const out_field of this.control.output_table_b_columns) {
            this.control.output_table.push({ column_b: out_field });
          }
        }

        this.control.output_table = JSON.stringify({
          columns: this.control.output_table,
        });
      }

      fetch("/api/save-control", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.$store.getters.getToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.control),
      })
        .then((response) => {
          if (!response.ok) {
            this.$q.notify({
              type: "warning",
              message: "Network response was not ok: " + response,
            });
            this.$router.push({ name: "controls" });
          }
          return response.json();
        })
        // eslint-disable-next-line no-unused-vars
        .then((data) => {
          this.$q.notify({
            type: "positive",
            message: "Control: " + this.control.control_name + " was saved successfully.",
          });
          // reload "Controls" page if control attributes changed
          this.$router.push({ name: "controls" });
        })
        .catch((error) => {
          this.$q.notify({ type: "negative", message: "Error:" + error });
          this.$router.push({ name: "controls" });
        });
    },
    cancel() {
      this.$q.notify({
        type: "warning",
        message: "Changes discarded",
      });
      this.$router.push({ name: "controls" });
    },
  },
  watch: {
    "control.source_name": function (newDatasource, oldDatasource) {
      console.log("Datasource changed from", oldDatasource, "to", newDatasource);

      // this.control.source_filter = "";

      this.getDatasourceColumns(newDatasource).then((data) => {
        this.datasourceColumns = data;
        // this.control.output_table_columns = data;
        if (oldDatasource && oldDatasource !== newDatasource) {
          this.control.output_table_columns = null;
        }
      });

      this.getDatasourceDateColumns(newDatasource).then((data) => {
        this.datasourceDateColumns = data;
        this.datasourceDateColumns.push(null);

        if (oldDatasource && oldDatasource !== newDatasource) {
          this.control.source_date_field = data[0];
          // this.control.source_date_field = null;
        }
      });
    },
    "control.source_name_a": function (newDatasource, oldDatasource) {
      console.log("Datasource changed from", oldDatasource, "to", newDatasource);
      // Call the datasourceChanged method with the new value

      // this.control.source_filter_a = "";

      this.getDatasourceColumns(newDatasource).then((data) => {
        this.datasourceAColumns = data;
        if (oldDatasource && oldDatasource !== newDatasource) {
          this.control.source_filter_a = "-- " + JSON.stringify(data) + "\n";
          this.control.output_table_a_columns = null;
        }
      });

      this.getDatasourceDateColumns(newDatasource).then((data) => {
        this.datasourceADateColumns = data;
        this.control.source_date_field_a = data[0];
      });
    },
    "control.source_name_b": function (newDatasource, oldDatasource) {
      console.log("Datasource changed from", oldDatasource, "to", newDatasource);

      // this.control.source_filter_b = "";

      this.getDatasourceColumns(newDatasource).then((data) => {
        this.datasourceBColumns = data;
        if (oldDatasource && oldDatasource !== newDatasource) {
          this.control.output_table_b_columns = null;
        }
      });

      this.getDatasourceDateColumns(newDatasource).then((data) => {
        this.datasourceBDateColumns = data;
        this.control.source_date_field_b = data[0];
      });
    },
    inputs() {
      if (!this.inputs.includes("filter")) {
        this.control.source_filter = "";
        this.control.source_filter_a = "";
        this.control.source_filter_b = "";
      }

      if (!this.inputs.includes("case_config")) {
        this.control.case_config = "";
        this.control.result_config = "";
      }

      if (!this.inputs.includes("preparation_sql")) {
        this.control.preparation_sql = "";
      }

      if (!this.inputs.includes("prerequisite_sql")) {
        this.control.prerequisite_sql = "";
      }

      if (!this.inputs.includes("completion_sql")) {
        this.control.completion_sql = "";
      }
    },
  },
  mounted() {
    this.getDatasources();

    const controlData = this.controlCatalogueById(this.controlId);

    if (controlData) {
      this.control = controlData;
      this.getControlVersions(this.controlId);

      // Force insert instead of update if clone
      if (this.$route.query.clone) {
        delete this.control.control_id;
        this.control.control_name = this.control.control_name + "_CLONE";
      }

      try {
        if (this.control.control_type === "ANL" || this.control.control_type === "REP") {
          if (this.control["output_table"]) {
            this.control.output_table_columns = JSON.parse(this.control["output_table"]).columns;
          }
          this.getDatasourceColumns(this.control.source_name).then((data) => (this.datasourceColumns = data));
          this.getDatasourceDateColumns(this.control.source_name).then((data) => (this.datasourceDateColumns = data));
        } else if (this.control.control_type === "REC" || this.control.control_type === "CMP") {
          if (this.control["output_table_a"]) {
            this.control.output_table_a_columns = JSON.parse(this.control["output_table_a"]).columns;
          }
          this.getDatasourceColumns(this.control.source_name_a).then((data) => (this.datasourceAColumns = data));
          this.getDatasourceDateColumns(this.control.source_name_a).then((data) => (this.datasourceADateColumns = data));

          if (this.control["output_table_b"]) {
            this.control.output_table_b_columns = JSON.parse(this.control["output_table_b"]).columns;
          }
          this.getDatasourceColumns(this.control.source_name_b).then((data) => (this.datasourceBColumns = data));
          this.getDatasourceDateColumns(this.control.source_name_b).then((data) => (this.datasourceBDateColumns = data));
        }
      } catch (err) {
        console.log(err);
      }

      // Update UI switch buttons "inputs" based on the present fields
      if (this.control.source_filter?.trim() || this.control.source_filter_a?.trim() || this.control.source_filter_b?.trim()) {
        this.inputs.push("filter");
      }
      if (this.control.case_config?.trim() || this.control.result_config?.trim()) {
        this.inputs.push("case_config");
      }
      if (this.control.preparation_sql?.trim()) {
        this.inputs.push("preparation_sql");
      }
      if (this.control.prerequisite_sql?.trim()) {
        this.inputs.push("prerequisite_sql");
      }
      if (this.control.completion_sql?.trim()) {
        this.inputs.push("completion_sql");
      }

      this.withDeleteionDrop = this.control.with_drop === "Y" ? "drop" : this.control.with_deletion === "Y" ? "deletion" : "N";
    } else {
      // NEW CONTROL
      this.control = {
        control_engine: "DB",
        control_type: "ANL",
        status: "Y",
        need_hook: "Y",
        need_postrun_hook: "Y",
        need_prerun_hook: "N",
        with_deletion: "N",
        with_drop: "N",
        days_back: 1,
        days_retention: 90,
        schedule_config: "",
      };
    }

    // console.log(this.control);
  },
};
</script>

<style lang="scss" scoped></style>
