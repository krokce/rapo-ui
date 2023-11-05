<template>
  <q-page>
    <h1>{{ filteredControlCatalogueLen }} Control<span v-if="filteredControlCatalogueLen != 1">s</span></h1>

    <q-btn
      class="q-my-lg"
      size="lg"
      color="primary"
      icon="fas fa-plus"
      label="New control"
      :to="{ name: 'edit-control', params: { controlId: 'new' } }" />

    <div class="row items-start q-gutter-lg">
      <control-box
        v-for="ctrl in filteredControlCatalogue"
        :key="ctrl.control_id"
        :control="ctrl" @control:deleted="updateControlCatalogue">
      </control-box>
    </div>
  </q-page>
</template>

<script>
import { mapActions, mapGetters} from 'vuex';
import ControlBox from "./ControlBox.vue";

export default {
  components: {
    ControlBox,
  },
  methods: {
    ...mapActions(['updateControlCatalogue'])
  },
  computed: {
    ...mapGetters(['filteredControlCatalogue']),
    filteredControlCatalogueLen() {
      return this.filteredControlCatalogue.length;
    }  
  },
  mounted() {
    this.updateControlCatalogue();
  },
};
</script>

<style scoped></style>
