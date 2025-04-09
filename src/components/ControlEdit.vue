<template>
  <q-page>
    <div>
      <h2 class="row">
        <q-chip
          size="xl"
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
        &nbsp;
        {{ control.control_name ? control.control_name : "New control" }}
      </h2>

      {{ this.iterationConfigObject }}

      <q-card>
        <q-tabs
          v-model="tab"
          class="text-white"
          :class="{
            'bg-pink-8': control.control_type === 'ANL',
            'bg-teal-8': control.control_type === 'REC',
            'bg-lime-8': control.control_type === 'CMP',
            'bg-indigo-6': control.control_type === 'REP',
          }"
          active-color="light-blue-1"
          indicator-color="light-blue-1"
          align="justify"
          inline-label
          narrow-indicator
          no-caps>
          <q-tab name="main" label="Main" icon="fas fa-window-maximize" />
          <q-tab name="data" label="Data" icon="fas fa-database" />
          <q-tab name="sql" label="SQL" icon="fas fa-code" />
          <q-tab v-if="control.control_type !== 'REP' && control.control_type !== 'REC'" name="case" label="Case config" icon="fas fa-tag" />
          <q-tab name="scheduler" label="Scheduler" icon="fas fa-clock" />
        </q-tabs>

        <q-separator />

        <q-form @submit="validateAndSave" @reset="cancel" ref="myForm">
          <q-tab-panels v-model="tab" animated keep-alive>
            <q-tab-panel name="main">
              <div class="q-ma-lg q-gutter-y-md">
                <div class="row q-gutter-md">
                  <q-input
                    class="col"
                    outlined
                    v-model="control.control_name"
                    label="Control name"
                    maxlength="45"
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

                <div class="row q-gutter-md">
                  <q-input class="col" v-model="control.control_description" label="Control description" maxlength="500" outlined autogrow />
                </div>

                <div class="row q-gutter-md">
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
                    v-model="control.need_postrun_hook"
                    :options="[
                      { label: 'Yes', value: 'Y' },
                      { label: 'No', value: 'N' },
                    ]"
                    label="Post-run hook" />
                </div>

                <div class="row q-my-md q-gutter-md">
                  <q-input class="col" v-model.number="control.parallelism" type="number" outlined label="Parallelism">
                    <template v-slot:prepend>
                      <q-icon name="fas fa-microchip" @click.stop.prevent />
                    </template>
                  </q-input>

                  <q-input class="col" v-model.number="control.instance_limit" type="number" outlined label="Instance limit">
                    <template v-slot:prepend>
                      <q-icon name="fas fa-stream" @click.stop.prevent />
                    </template>
                  </q-input>

                  <q-input class="col" v-model.number="control.timeout" type="number" outlined label="Timeout (sec.)">
                    <template v-slot:prepend>
                      <q-icon name="fas fas fa-stopwatch" @click.stop.prevent />
                    </template>
                  </q-input>

                  <q-input class="col" v-model.number="control.output_limit" type="number" outlined label="Output limit">
                    <template v-slot:prepend>
                      <q-icon name="fas fa-list-ol" @click.stop.prevent />
                    </template>
                  </q-input>

                  <q-select
                    class="col"
                    outlined
                    emit-value
                    map-options
                    v-model="withDeleteionDrop"
                    :options="[
                      { label: 'Yes', value: 'N' },
                      { label: 'No, delete results table on each run', value: 'deletion' },
                      { label: 'No, drop results table on each run', value: 'drop' },
                    ]"
                    label="Keep past results"
                    @update:model-value="deletionDropChanged" />

                  <q-input
                    class="col"
                    v-model.number="control.days_retention"
                    v-if="withDeleteionDrop === 'N'"
                    type="number"
                    outlined
                    label="Retention period (days)">
                    <template v-slot:prepend>
                      <q-icon name="fas fa-trash-alt" @click.stop.prevent />
                    </template>
                  </q-input>
                </div>

                <div class="row q-my-md q-gutter-md">
                  <q-btn label="Save" type="submit" color="primary" />
                  <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm" />
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="data">
              <div class="q-ma-lg q-gutter-y-md">
                <div class="row q-gutter-md" v-if="control.control_type === 'ANL' || control.control_type === 'REP'">
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
                    @filter="filterDatasourceList">
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

                <div class="row q-gutter-md" v-if="control.control_type === 'REC' || control.control_type === 'CMP'">
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
                    @filter="filterDatasourceList">
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
                    class="col"
                    outlined
                    v-model="control.source_name_b"
                    use-input
                    hide-selected
                    fill-input
                    input-debounce="0"
                    label="Datasource B"
                    :options="datasourceListOptions"
                    @filter="filterDatasourceList">
                    <template v-slot:prepend>
                      <q-icon name="fas fa-table" @click.stop.prevent />
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey"> No datasources found </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div class="row q-gutter-md" v-if="control.control_type === 'REC' || control.control_type === 'CMP'">
                  <q-select
                    class="col-2"
                    outlined
                    v-model="control.source_date_field_a"
                    label="Date column A"
                    :options="datasourceADateColumns"
                    behavior="menu">
                    <template v-slot:prepend>
                      <q-icon name="far fa-calendar-alt" @click.stop.prevent />
                    </template>
                  </q-select>

                  <q-icon class="q-py-md" name="fas fa-equals" size="20px" color="blue-grey-3" />

                  <q-select
                    class="col-2"
                    outlined
                    v-model="control.source_date_field_b"
                    label="Date column B"
                    :options="datasourceBDateColumns"
                    behavior="menu">
                    <template v-slot:prepend>
                      <q-icon name="far fa-calendar-alt" @click.stop.prevent />
                    </template>
                  </q-select>

                  <q-icon v-if="control.control_type === 'REC'" class="q-py-md" name="fas fa-circle" size="15px" color="blue-grey-3" />

                  <q-input
                    v-if="control.control_type === 'REC'"
                    outlined
                    class="col"
                    v-model.number="ruleConfigObject.time_tolerance_from"
                    type="number"
                    label="Time tolerance from">
                    <template v-slot:prepend>
                      <q-icon name="fas fa-long-arrow-alt-left" @click.stop.prevent />
                    </template>
                  </q-input>

                  <q-input
                    v-if="control.control_type === 'REC'"
                    outlined
                    class="col"
                    v-model.number="ruleConfigObject.time_tolerance_to"
                    type="number"
                    label="Time tolerance to">
                    <template v-slot:prepend>
                      <q-icon name="fas fa-long-arrow-alt-right" @click.stop.prevent />
                    </template>
                  </q-input>

                  <q-icon v-if="control.control_type === 'REC'" class="q-py-md" name="fas fa-circle" size="15px" color="blue-grey-3" />

                  <q-input
                    v-if="control.control_type === 'REC'"
                    outlined
                    class="col"
                    v-model.number="ruleConfigObject.time_shift_from"
                    type="number"
                    label="Time shift from">
                    <template v-slot:prepend>
                      <q-icon name="far fa-clock" @click.stop.prevent />
                    </template>
                  </q-input>

                  <q-input
                    v-if="control.control_type === 'REC'"
                    outlined
                    class="col"
                    v-model.number="ruleConfigObject.time_shift_to"
                    type="number"
                    label="Time shift to">
                    <template v-slot:prepend>
                      <q-icon name="far fa-clock" @click.stop.prevent />
                    </template>
                  </q-input>
                </div>

                <div class="row q-gutter-md">
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

                <div class="row q-my-sm q-gutter-md">
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

                <div class="row q-my-xs q-gutter-md">
                  <div class="col" v-if="control.control_type == 'CMP'">
                    <code-box label="Match criteria (Rule config)" v-model="control.rule_config"> </code-box>
                  </div>
                  <div class="col" v-if="control.control_type !== 'REC' && control.control_type !== 'REP'">
                    <code-box label="Mismatch criteria (Error definition)" v-model="control.error_definition"> </code-box>
                  </div>
                </div>

                <div class="row q-gutter-md" v-if="control.control_type === 'REC'">
                  <reconciliation-match-criteria-box
                    class="col"
                    v-model="this.ruleConfigObject"
                    :datasource-a-columns="this.datasourceAColumns"
                    :datasource-b-columns="this.datasourceBColumns">
                  </reconciliation-match-criteria-box>
                </div>

                <div class="row q-gutter-md" v-if="control.control_type === 'REC'">
                  <reconciliation-mis-match-criteria-box
                    class="col"
                    v-model="this.ruleConfigObject"
                    :datasource-a-columns="this.datasourceANumColumns"
                    :datasource-b-columns="this.datasourceBNumColumns">
                  </reconciliation-mis-match-criteria-box>
                </div>

                <div class="row q-my-md q-gutter-md">
                  <q-btn label="Save" type="submit" color="primary" />
                  <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm" />
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="sql">
              <div class="q-ma-lg q-gutter-y-md">
                <div class="row q-gutter-md">
                  <div class="col">
                    <code-box label="Preparation SQL" v-model="control.preparation_sql"> </code-box>
                  </div>
                </div>

                <div class="row q-gutter-md">
                  <div class="col">
                    <code-box label="Prerequisite SQL" v-model="control.prerequisite_sql"> </code-box>
                  </div>
                </div>

                <div class="row q-gutter-md">
                  <div class="col">
                    <code-box label="Completion SQL" v-model="control.completion_sql"> </code-box>
                  </div>
                </div>

                <div class="row q-my-md q-gutter-md">
                  <q-btn label="Save" type="submit" color="primary" />
                  <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm" />
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="case">
              <div class="q-ma-lg q-gutter-y-md">
                <div class="row q-gutter-md">
                  <div class="col">
                    <!-- <code-box label="Case config" v-model="control.case_config"> </code-box> -->
                    <case-config-box class="col" v-model="this.caseConfigObject"> </case-config-box>
                    <br />
                    <code-box label="Result config" v-model="control.case_definition"> </code-box>
                  </div>
                </div>

                <div class="row q-my-md q-gutter-md">
                  <q-btn label="Save" type="submit" color="primary" />
                  <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm" />
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="scheduler">
              <div class="q-ma-lg q-gutter-y-md">
                <div class="row q-gutter-md">
                  <q-select
                    class="col-2"
                    outlined
                    emit-value
                    map-options
                    v-model="control.status"
                    :options="[
                      { label: 'Active', value: 'Y' },
                      { label: 'Inactive', value: 'N' },
                    ]"
                    label="Scheduler status" />

                  <schedule-edit-box class="col" v-model="scheduleObject"></schedule-edit-box>
                </div>

                <div class="row q-gutter-md">
                  <q-select
                    class="col-2"
                    outlined
                    emit-value
                    map-options
                    v-model="control.period_type"
                    :options="[
                      { label: 'Days', value: 'D' },
                      { label: 'Weeks', value: 'W' },
                      { label: 'Months', value: 'M' },
                    ]"
                    label="Period type" />

                  <q-input outlined class="col-2" v-model.number="control.period_back" type="number" label="Periods back">
                    <template v-slot:prepend>
                      <q-icon name="fas fa-history" @click.stop.prevent />
                    </template>
                  </q-input>

                  <q-input class="col-2" v-model.number="control.period_number" type="number" outlined label="For # of periods">
                    <template v-slot:prepend>
                      <q-icon name="fas fa-calendar-day" @click.stop.prevent />
                    </template>
                  </q-input>
                </div>

                <div class="row q-gutter-md">
                  <iteration-config-box class="col" v-model="iterationConfigObject"> </iteration-config-box>
                </div>

                <div class="row q-gutter-md">
                  <q-btn label="Save" type="submit" color="primary" />
                  <q-btn label="Cancel" type="reset" color="primary" flat class="q-ml-sm" />
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-form>
      </q-card>
    </div>

    <!-- <p class="q-ma-xl">{{ control }}</p> -->
  </q-page>
</template>

<script>
import { useQuasar } from "quasar";
import { mapGetters } from "vuex";
import CodeBox from "./CodeBox.vue";
import ScheduleEditBox from "./ScheduleEditBox.vue";
import ReconciliationMatchCriteriaBox from "./ReconciliationMatchCriteriaBox.vue";
import ReconciliationMisMatchCriteriaBox from "./ReconciliationMisMatchCriteriaBox.vue";
import CaseConfigBox from "./CaseConfigBox.vue";
import IterationConfigBox from "./IterationConfigBox.vue";

export default {
  components: {
    CodeBox,
    ScheduleEditBox,
    ReconciliationMatchCriteriaBox,
    ReconciliationMisMatchCriteriaBox,
    CaseConfigBox,
    IterationConfigBox,
  },
  props: {
    controlId: {
      type: String,
      default: "new",
    },
  },
  data() {
    return {
      tab: "main",
      control: {},
      controlVersions: [],
      controlVersion: "ACTUAL",
      datasourceColumns: null,
      datasourceDateColumns: null,
      datasourceAColumns: null,
      datasourceADateColumns: null,
      datasourceANumColumns: null,
      datasourceBColumns: null,
      datasourceBDateColumns: null,
      datasourceBNumColumns: null,
      datasourceList: null,
      datasourceListOptions: null,
      datasourceListAOptions: null,
      datasourceListBOptions: null,
      withDeleteionDrop: "N",
      scheduleObject: {
        mday: null,
        wday: null,
        hour: "8",
        min: "15",
        sec: "0",
      },
      ruleConfigObject: {},
      caseConfigObject: [],
      iterationConfigObject: [],
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
    async getDatasourceColumns(datasource_name, which) {
      const response = await fetch("/api/get-datasource-columns?datasource_name=" + datasource_name, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.$store.getters.getToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        var ret;
        // data is array of objects {column_name, data_type}. Create an array containing only the columns from type `which`: NUMBER, VARCHAR2, DATE
        if (which === "numeric") {
          ret = data.filter((item) => item.data_type === "NUMBER").map((item) => item.column_name);
        } else if (which === "string") {
          ret = data.filter((item) => item.data_type === "VARCHAR2" || item.data_type === "VARCHAR").map((item) => item.column_name);
        } else if (which === "date") {
          ret = data.filter((item) => item.data_type === "DATE" || item.data_type === "TIMESTAMP").map((item) => item.column_name);
        } else {
          ret = data.map((item) => item.column_name);
        }

        return ret;
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
    controlTypeChanged(newValue) {
      this.control.source_name = null;
      this.control.source_name_a = null;
      this.control.source_name_b = null;
      this.control.source_date_field = null;
      this.control.source_date_field_a = null;
      this.control.source_key_field_a = null;
      this.control.source_date_field_b = null;
      this.control.source_key_field_b = null;
      this.control.rule_config = null;
      this.control.error_definition = null;
      this.control.source_filter = null;
      this.control.source_filter_a = null;
      this.control.source_filter_b = null;
      this.control.case_config = null;
      this.control.timeout = 3600;
      this.control.result_config = null;
      this.control.output_table = null;
      this.control.output_table_a = null;
      this.control.output_table_b = null;
      this.control.output_table_columns = [];
      this.control.output_table_a_columns = [];
      this.control.output_table_b_columns = [];

      if (newValue === "REC") {
        this.ruleConfigObject = {
          need_issues_a: true,
          need_issues_b: true,
          need_recons_a: false,
          need_recons_b: false,
          allow_duplicates: false,
          time_shift_from: 0,
          time_shift_to: 0,
          time_tolerance_from: 0,
          time_tolerance_to: 0,
          correlation_config: [],
          discrepancy_config: [],
        };

        this.control.source_key_field_a = "TAG";
        this.control.source_key_field_b = "TAG";
      } else if (newValue === "CMP") {
        this.ruleConfigObject = {};
      } else if (newValue === "REP") {
        this.ruleConfigObject = {};
      } else if (newValue === "ANL") {
        this.ruleConfigObject = {};
      }
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

      this.scheduleObject = this.toScheduleObject(this.control.schedule_config);

      try {
        if (this.control.control_type === "ANL" || this.control.control_type === "REP") {
          this.control.output_table_columns = JSON.parse(this.control["output_table"]).columns;
          this.getDatasourceColumns(this.control.source_name).then((data) => (this.datasourceColumns = data));
          this.getDatasourceColumns(this.control.source_name, "date").then((data) => (this.datasourceDateColumns = data));
        } else {
          this.control.output_table_a_columns = JSON.parse(this.control["output_table_a"]).columns;
          this.getDatasourceColumns(this.control.source_name_a).then((data) => (this.datasourceAColumns = data));
          this.getDatasourceColumns(this.control.source_name_a, "date").then((data) => (this.datasourceADateColumns = data));
          this.getDatasourceColumns(this.control.source_name_a, "numeric").then((data) => (this.datasourceANumColumns = data));
          this.control.output_table_b_columns = JSON.parse(this.control["output_table_b"]).columns;
          this.getDatasourceColumns(this.control.source_name_b).then((data) => (this.datasourceBColumns = data));
          this.getDatasourceColumns(this.control.source_name_b, "date").then((data) => (this.datasourceBDateColumns = data));
          this.getDatasourceColumns(this.control.source_name_b, "numeric").then((data) => (this.datasourceBNumColumns = data));
        }
      } catch (err) {
        console.log(err);
      }

      if (this.control.rule_config) {
        this.ruleConfigObject = JSON.parse(this.control.rule_config);
      }
      if (this.control.case_config) {
        this.caseConfigObject = JSON.parse(this.control.case_config);
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
    toScheduleString(scheduleObject) {
      var ret = {
        mday: scheduleObject.mday ? String(scheduleObject.mday) : null,
        wday: scheduleObject.wday ? String(scheduleObject.wday) : null,
        hour: String(scheduleObject.hour),
        min: String(scheduleObject.min),
        sec: String(scheduleObject.sec),
      };
      return JSON.stringify(ret);
    },
    toScheduleObject(scheduleString) {
      var ret = {
        mday: null,
        wday: null,
        hour: "8",
        min: "15",
        sec: "0",
      };

      var scheduleType = null;

      if (scheduleString) {
        ret = JSON.parse(scheduleString);
        // Determine schedule type
        if (!scheduleType) {
          if (
            String(scheduleString).indexOf("/") > -1 ||
            String(scheduleString).indexOf("-") > -1 ||
            (String(ret.mday).indexOf(",") > -1 && String(ret.wday).indexOf(",") > -1) ||
            (String(ret.hour) + String(ret.min) + String(ret.sec)).indexOf(",") > -1
          ) {
            scheduleType = "X";
          } else if (ret.mday) {
            scheduleType = "M";
          } else if (ret.wday) {
            scheduleType = "W";
          } else {
            scheduleType = "D";
          }

          // Convert components to arrays in case of simple scheduler
          if (scheduleType !== "X") {
            if (ret.mday) {
              ret.mday = String(ret.mday)
                .split(",")
                .map((i) => Number(i));
            }

            if (ret.wday) {
              ret.wday = String(ret.wday)
                .split(",")
                .map((i) => Number(i));
            }
          }
        }
      }

      return ret;
    },    
    save() {
      // Add new line if last line contains a comment to avoid RAPO SQL builder issue
      this.control.source_filter = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.source_filter);
      this.control.source_filter_a = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.source_filter_a);
      this.control.source_filter_b = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.source_filter_b);

      this.control.schedule_config = this.toScheduleString(this.scheduleObject);

      // this.control.rule_config = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.rule_config);
      // this.control.error_config = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.error_config);
      // this.control.case_config = this.addNewLineIfLastLineStartsWithDoubleDash(this.control.case_config);

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
        this.control.rule_config = JSON.stringify(this.ruleConfigObject);
      }

      if (this.caseConfigObject.length > 0) {
        this.control.case_config = JSON.stringify(this.caseConfigObject);
      } else {
        this.control.case_config = null;
      }

      if (this.iterationConfigObject.length > 0) {
        this.control.iteration_config = JSON.stringify(this.iterationConfigObject);
      } else {
        this.control.iteration_config = null;
      }

      // Set key columns to 'TAG' if they are not set
      if (this.control.control_type === "REC") {
        if (!this.control.source_key_field_a) {
          this.control.source_key_field_a = "TAG";
        }
        if (!this.control.source_key_field_b) {
          this.control.source_key_field_b = "TAG";
        }
      }

      if (this.control.control_type === "CMP") {
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
    validateAndSave() {
      var errorTab = null;
      if (!this.control.control_name) {
        this.$q.notify({
          type: "negative",
          message: "Please enter a control name.",
        });
        errorTab = "main";
      } else if (this.control.with_drop === "N" && this.control.with_deletion === "N" && !this.control.days_retention) {
        // validate if data source is selected

        this.$q.notify({
          type: "negative",
          message: "Please select data retention period",
        });
        errorTab = "main";
      } else if (this.control.control_type === "REC" || this.control.control_type === "CMP") {
        // validate if data source is selected
        if (!this.control.source_name_a || !this.control.source_name_b) {
          this.$q.notify({
            type: "negative",
            message: "Please select a data source for both A and B.",
          });
          errorTab = "data";
        } else if (!this.control.source_date_field_a || !this.control.source_date_field_b) {
          this.$q.notify({
            type: "negative",
            message: "Please select a date columns for both A and B datasources.",
          });
          errorTab = "data";
        }
      } else if (this.control.control_type === "ANL" || this.control.control_type === "REP") {
        // validate if data source is selected
        if (!this.control.source_name) {
          this.$q.notify({
            type: "negative",
            message: "Please select a data source.",
          });
          errorTab = "data";
        }
      } else if (!this.control.period_back || !this.control.period_number) {
        this.$q.notify({
          type: "negative",
          message: "Please enter a period back and number of periods.",
        });
        errorTab = "scheduler";
      }

      if (!errorTab) {
        this.save(); // Call your save method
      } else {
        this.tab = errorTab;
      }
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
          // this.control.source_filter = "-- Columns:" + JSON.stringify(data) + "\n";
        }
      });

      this.getDatasourceColumns(newDatasource, "date").then((data) => {
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
          // this.control.source_filter_a = "-- Columns:" + JSON.stringify(data) + "\n";
          this.control.output_table_a_columns = null;
        }
      });

      this.getDatasourceColumns(newDatasource, "date").then((data) => {
        this.datasourceADateColumns = data;
        this.control.source_date_field_a = data[0];
      });

      this.getDatasourceColumns(newDatasource, "numeric").then((data) => {
        this.datasourceANumColumns = data;
      });
    },
    "control.source_name_b": function (newDatasource, oldDatasource) {
      console.log("Datasource changed from", oldDatasource, "to", newDatasource);

      // this.control.source_filter_b = "";

      this.getDatasourceColumns(newDatasource).then((data) => {
        this.datasourceBColumns = data;
        if (oldDatasource && oldDatasource !== newDatasource) {
          // this.control.source_filter_b = "-- Columns: " + JSON.stringify(data) + "\n";
          this.control.output_table_b_columns = null;
        }
      });

      this.getDatasourceColumns(newDatasource, "date").then((data) => {
        this.datasourceBDateColumns = data;
        this.control.source_date_field_b = data[0];
      });

      this.getDatasourceColumns(newDatasource, "numeric").then((data) => {
        this.datasourceBNumColumns = data;
      });
    },
  },
  mounted() {
    this.getDatasources();

    const controlData = this.controlCatalogueById(this.controlId);

    if (controlData) {
      this.control = controlData;
      this.getControlVersions(this.controlId);

      this.scheduleObject = this.toScheduleObject(this.control.schedule_config);

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
          this.getDatasourceColumns(this.control.source_name, "date").then((data) => (this.datasourceDateColumns = data));
        } else if (this.control.control_type === "REC" || this.control.control_type === "CMP") {
          if (this.control["output_table_a"]) {
            this.control.output_table_a_columns = JSON.parse(this.control["output_table_a"]).columns;
          }
          this.getDatasourceColumns(this.control.source_name_a).then((data) => (this.datasourceAColumns = data));
          this.getDatasourceColumns(this.control.source_name_a, "date").then((data) => (this.datasourceADateColumns = data));
          this.getDatasourceColumns(this.control.source_name_a, "numeric").then((data) => (this.datasourceANumColumns = data));

          if (this.control["output_table_b"]) {
            this.control.output_table_b_columns = JSON.parse(this.control["output_table_b"]).columns;
          }
          this.getDatasourceColumns(this.control.source_name_b).then((data) => (this.datasourceBColumns = data));
          this.getDatasourceColumns(this.control.source_name_b, "date").then((data) => (this.datasourceBDateColumns = data));
          this.getDatasourceColumns(this.control.source_name_b, "numeric").then((data) => (this.datasourceBNumColumns = data));
        }

        if (this.control.rule_config) {
          this.ruleConfigObject = JSON.parse(this.control.rule_config);
        }
        if (this.control.case_config) {
          this.caseConfigObject = JSON.parse(this.control.case_config);
        }
        if (this.control.iteration_config) {
          this.iterationConfigObject = JSON.parse(this.control.iteration_config);
        }
      } catch (err) {
        console.log(err);
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
        timeout: 3600,
        instance_limit: 1,
        period_type: "D",
        period_back: 1,
        period_number: 1,
        output_limit: 0,
      };
    }

  },
};
</script>

<style lang="scss" scoped></style>
