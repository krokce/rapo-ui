<template>
  <div class="col q-gutter-y-md">
    <q-card class="q-pa-sm" flat bordered>
      <q-item-section class="q-ma-xs">
        <q-item-label>Discrepancies</q-item-label>
      </q-item-section>

      <q-card-section class="row q-gutter-sm">
        <q-checkbox
          size="lg"
          color="blue"
          class="col-2"
          label="Write A not in B discrepancies"
          v-model="ruleConfigObject.need_issues_a"
          @click="
            ruleConfigObject.output_limit_a = ruleConfigObject.need_issues_a || ruleConfigObject.need_recons_a ? ruleConfigObject.output_limit_a : null
          " />

        <q-checkbox
          size="lg"
          color="blue"
          class="col-2"
          label="Write A matches"
          v-model="ruleConfigObject.need_recons_a"
          @click="
            ruleConfigObject.output_limit_a = ruleConfigObject.need_issues_a || ruleConfigObject.need_recons_a ? ruleConfigObject.output_limit_a : null
          " />

        <q-input
          v-if="ruleConfigObject.need_issues_a || ruleConfigObject.need_recons_a"
          class="col-2"
          v-model.number="ruleConfigObject.output_limit_a"
          type="number"
          outlined
          label="Output limit A">
          <template v-slot:prepend>
            <q-icon name="fas fa-list-ol" @click.stop.prevent />
          </template>
          <q-tooltip anchor="top left" self="bottom left" :offset="[0, 5]">
            Limit the number of records in the output table. <br />Leave empty for no limit.
          </q-tooltip>
        </q-input>
      </q-card-section>

      <q-card-section class="row q-gutter-sm">
        <q-checkbox
          size="lg"
          color="blue"
          class="col-2"
          label="Write B not in A discrepancies"
          v-model="ruleConfigObject.need_issues_b"
          @click="
            ruleConfigObject.output_limit_b = ruleConfigObject.need_issues_b || ruleConfigObject.need_recons_b ? ruleConfigObject.output_limit_b : null
          " />

        <q-checkbox
          size="lg"
          color="blue"
          class="col-2"
          label="Write B matches"
          v-model="ruleConfigObject.need_recons_b"
          @click="
            ruleConfigObject.output_limit_b = ruleConfigObject.need_issues_b || ruleConfigObject.need_recons_b ? ruleConfigObject.output_limit_b : null
          " />

        <q-input
          v-if="ruleConfigObject.need_issues_b || ruleConfigObject.need_recons_b"
          class="col-2"
          v-model.number="ruleConfigObject.output_limit_b"
          type="number"
          outlined
          label="Output limit B">
          <template v-slot:prepend>
            <q-icon name="fas fa-list-ol" @click.stop.prevent />
          </template>
          <q-tooltip anchor="top left" self="bottom left" :offset="[0, 5]">
            Limit the number of records in the output table. <br />Leave empty for no limit.
          </q-tooltip>
        </q-input>
      </q-card-section>

      <q-card-section class="row q-gutter-sm">
        <q-checkbox size="lg" class="col-2" color="blue" label="Allow duplicates" v-model="ruleConfigObject.allow_duplicates">
          <q-tooltip anchor="top left" self="bottom left" :offset="[0, 0]"> If active, duplicate records won't be treated as discrepancies </q-tooltip>
        </q-checkbox>

        <q-checkbox size="lg" class="col-2" color="blue" label="Discrepancy matching" v-model="ruleConfigObject.discrepancy_matching">
          <q-tooltip anchor="top left" self="bottom left" :offset="[0, 0]">
            Reconciliation parameter that allows to classify duplicates as losses if there is a numeric discrapancy with the<br />
            record on the other side of the control. It is useful to use this extension together with the "Allow Duplicates" feature <br />
            so that you identify duplicates that are actually errors from the results, and only ignore those that are successfully matched <br />Default is
            "No".
          </q-tooltip>
        </q-checkbox>
      </q-card-section>
    </q-card>

    <q-card class="q-pa-sm" flat bordered>
      <q-item-section class="q-ma-xs">
        <q-item-label>Advanced</q-item-label>
      </q-item-section>

      <q-card-section class="row q-gutter-sm">
        <q-select
          class="col-2"
          outlined
          emit-value
          map-options
          v-model="ruleConfigObject.fuzzy_optimization"
          :options="[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ]"
          label="Fuzzy optimization">
          <q-tooltip anchor="top left" self="bottom left" :offset="[0, 5]">
            Reconciliation parameter that allows to join records within a correlation cluster of the same dimension (1k1, 2k2, 3k3, etc.) using a simple
            positional method with sorting by the sum of numerical values.
            <br />Such clusters are formed if the correlation keys do not provide a unique connection and several records on one side are connected to several
            records on the other. <br />Default is "Yes".
          </q-tooltip>
        </q-select>

        <q-select
          class="col-2"
          outlined
          emit-value
          map-options
          v-model="ruleConfigObject.normalization_type"
          :options="[
            { label: 'None', value: 'none' },
            { label: 'Rank', value: 'rank' },
            { label: 'Min-Max', value: 'minmax' },
            { label: 'Z-Score', value: 'z_norm' },
          ]"
          label="Normalization">
          <q-tooltip anchor="top left" self="bottom left" :offset="[0, 5]">
            Useful in cases where correlation keys do not guarantee a unique connection, <br />while numerics have a narrow spread and can produce similar or
            identical values when summed. <br />Default is "None".
            <ul>
              <li>Rank: Replaces numerical values with their rank (order) within the sorted dataset</li>
              <li>Min-Max: Scales numerical values to a 0-1 range based on the minimum and maximum values in the dataset</li>
              <li>Z-Score: Normalizes numerical values based on their distance from the mean in terms of standard deviations</li>
            </ul>
          </q-tooltip>
        </q-select>

        <q-select
          class="col-2"
          outlined
          emit-value
          map-options
          v-model="ruleConfigObject.correlation_limit"
          :options="[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ]"
          label="Correlation limit">
          <q-tooltip anchor="top left" self="bottom left" :offset="[0, 5]">
            If active, the correlation dataset will be limited to x2.5 times of the larger datasource record-count to prevent huge resultsets caused by weak or
            missing match criteria (cross join)
            <br />Note that activating the correlation limit will likely result in up to 30% slower performance. Recomended to be used only during the
            development phase.
          </q-tooltip>
        </q-select>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  props: ["modelValue", "control"],
  emits: ["update:modelValue"],
  data() {
    return {
      ruleConfigObject: this.modelValue,
    };
  },
  watch: {
    ruleConfigObject(newValue) {
      this.$emit("update:modelValue", newValue);
    },
    modelValue(newValue) {
      this.ruleConfigObject = newValue;
    },
  },
  mounted() {
    if (!this.ruleConfigObject.output_limit_a) {
      this.ruleConfigObject.output_limit_a = this.control.output_limit;
    }
    if (!this.ruleConfigObject.output_limit_b) {
      this.ruleConfigObject.output_limit_b = this.control.output_limit;
    }
    if (this.ruleConfigObject.fuzzy_optimization == null || this.ruleConfigObject.fuzzy_optimization == undefined) {
      this.ruleConfigObject.fuzzy_optimization = true;
    }
  },
};
</script>

<style></style>
