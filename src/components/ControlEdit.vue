<template>
  <q-page>
    <div>
      <h1>{{ control.control_name ? control.control_name : "New control" }}</h1>

      <q-form @submit="save" @reset="cancel">
        <div class="row q-mx-xl q-mb-xs q-gutter-md">
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

        <div class="row q-mx-xl q-mb-md q-gutter-md">
          <q-input class="col" v-model="control.control_desc" label="Control description" outlined autogrow />
        </div>

        <div class="row q-mx-xl q-mb-lg q-gutter-md">
          <q-select
            class="col"
            outlined
            emit-value
            map-options
            v-model="control.control_type"
            :options="[
              { label: 'Analysis', value: 'ANL' },
              { label: 'Reconciliation', value: 'REC' },
              // { label: 'Report', value: 'REP' },
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
              { label: 'No', value: 'N' },
              { label: 'Yes, with deletion', value: 'deletion' },
              { label: 'Yes, with drop', value: 'drop' },
            ]"
            label="Remove past results"
            @update:model-value="deletionDropChanged" />
        </div>

        <div class="row q-mx-xl q-mb-xs q-gutter-md" v-if="control.control_type === 'ANL'">
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
            @update:model-value="datasourceChanged"
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
            v-model="control.source_date_field"
            label="Date column"
            :options="datasourceDateColumns"
            behavior="menu"
            :rules="[(val) => (val && val.length > 0) || 'No date column to select!']">
            <template v-slot:prepend>
              <q-icon name="far fa-calendar-alt" @click.stop.prevent />
            </template>
          </q-select>
        </div>

        <div class="row q-mx-xl q-mb-md q-gutter-md" v-if="control.control_type === 'REC'">
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
            @update:model-value="datasourceAChanged"
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
            @update:model-value="datasourceBChanged"
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

        <div class="row q-mx-xl q-mb-xs q-gutter-md">
          <q-select
            v-if="control.control_type === 'ANL'"
            class="col"
            outlined
            clearable
            v-model="control.output_table_columns"
            multiple
            :options="datasourceColumns"
            use-chips
            stack-label
            label="Select columns"
            :rules="[(val) => (val && val.length > 0) || 'You must select at least one column']">
            <template v-slot:prepend>
              <q-icon name="fas fa-columns" @click.stop.prevent />
            </template>
          </q-select>
        </div>

        <div class="row q-mx-xl q-mb-xs q-gutter-md">
          <q-select
            v-if="control.control_type === 'REC'"
            class="col"
            outlined
            clearable
            v-model="control.output_table_a_columns"
            multiple
            :options="datasourceAColumns"
            use-chips
            stack-label
            label="Select columns A"
            :rules="[(val) => (val && val.length > 0) || 'You must select at least one column']">
            <template v-slot:prepend>
              <q-icon name="fas fa-columns" @click.stop.prevent />
            </template>
          </q-select>

          <q-select
            v-if="control.control_type === 'REC'"
            class="col"
            outlined
            clearable
            v-model="control.output_table_b_columns"
            multiple
            :options="datasourceBColumns"
            use-chips
            stack-label
            label="Select columns B">
            <template v-slot:prepend>
              <q-icon name="fas fa-columns" @click.stop.prevent />
            </template>
          </q-select>
        </div>

        <div class="row q-mx-xl q-mb-md q-gutter-md">
          <div class="col" v-if="control.control_type === 'REC'">
            <sql-box label="Matching criteria (Rule config)" v-model="control.rule_config"> </sql-box>
          </div>
          <div class="col">
            <sql-box label="Missmatch criteria (Error config)" v-model="control.error_config"> </sql-box>
          </div>
        </div>

        <div class="row q-mx-xl q-mb-md q-gutter-md" v-if="inputs.includes('filter')">
          <div class="col" v-if="control.control_type === 'ANL'">
            <sql-box label="Filter" v-model="control.source_filter"> </sql-box>
          </div>
          <div class="col" v-if="control.control_type === 'REC'">
            <sql-box label="Filter (Datasource A)" v-model="control.source_filter_a"> </sql-box>
          </div>
          <div class="col" v-if="control.control_type === 'REC'">
            <sql-box label="Filter (Datasource B)" v-model="control.source_filter_b"> </sql-box>
          </div>
        </div>

        <div class="row q-mx-xl q-mb-md q-gutter-md" v-if="inputs.includes('case_config')">
          <div class="col">
            <sql-box label="Case config" v-model="control.case_config"> </sql-box>
          </div>
          <div class="col">
            <sql-box label="Result config" v-model="control.result_config"> </sql-box>
          </div>
        </div>

        <div class="row q-mx-xl q-mb-md q-gutter-md" v-if="inputs.includes('preparation_sql')">
          <div class="col">
            <sql-box label="Preparation SQL" v-model="control.preparation_sql"> </sql-box>
          </div>
        </div>

        <div class="row q-mx-xl q-mb-lg q-gutter-md" v-if="inputs.includes('prerequisite_sql')">
          <div class="col">
            <sql-box label="Prerequisite SQL" v-model="control.prerequisite_sql"> </sql-box>
          </div>
        </div>

        <div class="row q-mx-xl q-mb-lg q-gutter-md" v-if="inputs.includes('completion_sql')">
          <div class="col">
            <sql-box label="Completion SQL" v-model="control.completion_sql"> </sql-box>
          </div>
        </div>

        <div class="row q-mx-xl q-mb-md q-gutter-md">
          <q-toggle color="blue" label="Datasource filter" v-model="inputs" val="filter" />
          <q-toggle color="blue" label="Case config" v-model="inputs" val="case_config" />
          <q-toggle color="blue" label="Preparation SQL" v-model="inputs" val="preparation_sql" />
          <q-toggle color="blue" label="Prerequisite SQL" v-model="inputs" val="prerequisite_sql" />
          <q-toggle color="blue" label="Completion SQL" v-model="inputs" val="completion_sql" />
        </div>

        <div class="row q-mx-xl q-mb-md q-gutter-md">
          <schedule-edit-box class="col" v-model="control.schedule"></schedule-edit-box>

          <q-input
            class="col-auto"
            v-model.number="control.days_back"
            type="number"
            outlined
            label="Run days back"
            :rules="[(val) => ((val || val === 0 || val < 5) && val >= 0) || 'Not a valid value']">
            <template v-slot:prepend>
              <q-icon name="fas fa-history" @click.stop.prevent />
            </template>
          </q-input>

          <q-input
            class="col-auto"
            v-model.number="control.days_retention"
            type="number"
            outlined
            label="Results retention (days)"
            :rules="[(val) => ((val || val === 0) && val >= 0) || 'Not a valid value']">
            <template v-slot:prepend>
              <q-icon name="fas fa-calendar-alt" @click.stop.prevent />
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
import SqlBox from "./SqlBox.vue";
import ScheduleEditBox from "./ScheduleEditBox.vue";

export default {
  components: {
    SqlBox,
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
    controlTypeChanged() {
      this.control.source_name = "";
      this.control.source_name_a = "";
      this.control.source_name_b = "";
      this.control.source_filter = "";
      this.control.source_filter_a = "";
      this.control.source_filter_b = "";
      this.control.source_date_field = "";
      this.control.source_date_field_a = "";
      this.control.source_date_field_b = "";
      this.control.output_table_columns = [];
      this.control.output_table_a_columns = [];
      this.control.output_table_b_columns = [];
    },
    datasourceChanged(newDatasource) {
      this.control.source_filter = "";

      this.getDatasourceColumns(newDatasource).then((data) => {
        this.datasourceColumns = data;
        this.control.output_table_columns = data;
      });

      this.getDatasourceDateColumns(newDatasource).then((data) => {
        this.datasourceDateColumns = data;
        this.control.source_date_field = data[0];
      });
    },
    datasourceAChanged(newDatasource) {
      this.control.source_filter_a = "";

      this.getDatasourceColumns(newDatasource).then((data) => {
        this.datasourceAColumns = data;
        this.control.output_table_a_columns = data;
      });

      this.getDatasourceDateColumns(newDatasource).then((data) => {
        this.datasourceADateColumns = data;
        this.control.source_date_field_a = data[0];
      });
    },
    datasourceBChanged(newDatasource) {
      this.control.source_filter_b = "";

      this.getDatasourceColumns(newDatasource).then((data) => {
        this.datasourceBColumns = data;
        this.control.output_table_b_columns = data;
      });

      this.getDatasourceDateColumns(newDatasource).then((data) => {
        this.datasourceBDateColumns = data;
        this.control.source_date_field_b = data[0];
      });
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
        if (this.control.control_type === "ANL") {
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
      if (this.control.output_table_columns && this.control.output_table_columns.length) {
        this.control.output_table = JSON.stringify({
          columns: this.control.output_table_columns,
        });
      } else {
        this.control.output_table_a = JSON.stringify({
          columns: this.control.output_table_a_columns,
        });
        this.control.output_table_b = JSON.stringify({
          columns: this.control.output_table_b_columns,
        });
      }

      if (this.control.control_type === "REC") {
        // Reconciliation must be of subtype MA
        this.control.control_subtype = "MA";

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
        if (this.control.control_type === "ANL") {
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
        schedule: "",
      };
    }

    // console.log(this.control);
  },
};
</script>

<style lang="scss" scoped></style>
