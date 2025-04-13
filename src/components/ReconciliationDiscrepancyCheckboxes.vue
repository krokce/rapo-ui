<template>
  <div class="col q-gutter-y-md">
    <q-card class="q-pa-sm" flat bordered>
      <q-item-section class="q-ma-xs">
        <q-item-label>Discrepancies</q-item-label>
      </q-item-section>

      <q-card-section class="q-gutter-xs">
        <q-checkbox color="blue" label="Write A not in B discrepancies" v-model="ruleConfigObject.need_issues_a" />
        <q-checkbox color="blue" label="Write B not in A discrepancies" v-model="ruleConfigObject.need_issues_b" />
        <q-checkbox color="blue" label="Write A match" v-model="ruleConfigObject.need_recons_a" />
        <q-checkbox color="blue" label="Write B match" v-model="ruleConfigObject.need_recons_b" />
        <q-checkbox color="blue" label="Allow duplicates" v-model="ruleConfigObject.allow_duplicates" />
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
