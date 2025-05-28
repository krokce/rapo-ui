<template>
  <div class="col q-gutter-y-md">
    <q-card class="q-pa-sm" flat bordered>
      <q-item-section class="q-ma-xs">
        <q-item-label>Discrepancies</q-item-label>
      </q-item-section>

      <q-card-section class="row q-gutter-sm">
        <q-checkbox color="blue" label="Write A not in B discrepancies" v-model="ruleConfigObject.need_issues_a" />

        <q-checkbox color="blue" label="Write B not in A discrepancies" v-model="ruleConfigObject.need_issues_b" />

        <q-checkbox color="blue" label="Write A matches" v-model="ruleConfigObject.need_recons_a" />

        <q-checkbox color="blue" label="Write B matches" v-model="ruleConfigObject.need_recons_b" />

        <q-checkbox color="blue" label="Allow duplicates" v-model="ruleConfigObject.allow_duplicates">
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]"> If active, duplicate records won't be treated as discrepancies </q-tooltip>
        </q-checkbox>

        <q-checkbox color="blue" label="Force correlation limit" v-model="ruleConfigObject.correlation_limit">
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
            If active, the correlation dataset will be limited to x2.5 times of the larger datasource record-count to prevent huge resultsets caused by weak or missing match criteria (cross join)
            <br />Note that activating the correlation limit will likely result in up to 30% slower performance
            <br />Recomended to be used only during the initial testing phase
          </q-tooltip>
        </q-checkbox>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  props: ["modelValue"],
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
};
</script>

<style></style>
