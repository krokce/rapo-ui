<template>
  <div class="col q-gutter-y-md">
    <q-card class="q-pa-sm" flat bordered>
      <q-item-section class="q-ma-xs">
        <q-item-label>Match criteria (correlation config)</q-item-label>
      </q-item-section>

      <q-card-section class="q-gutter-xs">
        <div class="row q-gutter-xs items-center" v-for="(item, index) in ruleConfigObject.correlation_config" v-bind:key="index">
          <q-select
            use-input
            hide-selected
            fill-input
            class="col-2"
            outlined
            @filter="filterFieldListA"
            v-model="ruleConfigObject.correlation_config[index].field_a"
            :options="datasourceAList"
            label="Field A" />

          <q-icon name="fas fa-equals" size="20px" color="blue-grey-3" />

          <q-select
            use-input
            hide-selected
            fill-input
            class="col-2"
            outlined
            @filter="filterFieldListB"
            v-model="ruleConfigObject.correlation_config[index].field_b"
            :options="datasourceBList"
            label="Field B" />

          <q-icon name="fas fa-circle" size="15px" color="blue-grey-3" />

          <q-select
            class="col-1"
            outlined
            emit-value
            map-options
            v-model="ruleConfigObject.correlation_config[index].allow_null"
            :options="[
              { label: 'Yes', value: true },
              { label: 'No', value: false },
            ]"
            label="Allow null">
            <q-tooltip anchor="top left" self="bottom left" :offset="[0, 5]">
              If set to "Yes" records with null keys will be included in the reconciliation and marked as discrepancies
            </q-tooltip>
          </q-select>
          <q-btn size="sm" color="primary" flat round icon="fas fa-minus" @click="removeCorrelationConfig(index)" />
          <q-btn
            v-if="index == ruleConfigObject.correlation_config.length - 1"
            size="sm"
            color="primary"
            flat
            round
            icon="fas fa-plus"
            @click="addCorrelationConfig" />
        </div>
        <q-btn
          v-if="ruleConfigObject.correlation_config.length == 0"
          size="md"
          color="primary"
          icon="fas fa-plus"
          label="Add match criteria"
          @click="addCorrelationConfig" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  props: ["modelValue", "datasourceAColumns", "datasourceBColumns"],
  emits: ["update:modelValue"],
  data() {
    return {
      ruleConfigObject: this.modelValue,
      datasourceAList: null,
      datasourceBList: null,
    };
  },
  methods: {
    addCorrelationConfig() {
      this.ruleConfigObject.correlation_config.push({
        field_a: this.datasourceAColumns[0],
        field_b: this.datasourceBColumns[0],
        allow_null: false,
      });
    },
    removeCorrelationConfig(index) {
      this.ruleConfigObject.correlation_config.splice(index, 1);
    },
    filterFieldListA(val, update, abort) {
      if (val.length < 0) {
        abort();
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        this.datasourceAList = this.datasourceAColumns.filter((v) => v.toLowerCase().indexOf(needle) > -1);
      });
    },
    filterFieldListB(val, update, abort) {
      if (val.length < 0) {
        abort();
        return;
      }

      update(() => {
        const needle = val.toLowerCase();
        this.datasourceBList = this.datasourceBColumns.filter((v) => v.toLowerCase().indexOf(needle) > -1);
      });
    },
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
