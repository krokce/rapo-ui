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
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]"> If active, duplicate records won't be treated as discrepancies </q-tooltip>
        </q-checkbox>

        <q-checkbox size="lg" class="col-2" color="blue" label="Force correlation limit" v-model="ruleConfigObject.correlation_limit">
          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 8]">
            If active, the correlation dataset will be limited to x2.5 times of the larger datasource record-count to prevent huge resultsets caused by weak or
            missing match criteria (cross join)
            <br />Note that activating the correlation limit will likely result in up to 30% slower performance <br />Recomended to be used only during the
            initial testing phase
          </q-tooltip>
        </q-checkbox>
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
  },
};
</script>

<style></style>
