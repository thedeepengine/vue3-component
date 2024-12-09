<template>
    <div class="graphql-output-container">
        <Graphql :code="graphql_output_computed" :prop_option="{mode: 'application/json'}"></Graphql>
    </div>
</template>

<script setup>
import Graphql from './Graphql.vue'
import { ref, onMounted, watch, computed } from "vue";
import { dimStore } from '@/components_shared/dimStore'

const dim_store = dimStore()

const graphql_output_computed = computed(() => {

    // graphql.value = JSON.stringify(response.data.graphql, null, '\t')

    return JSON.stringify(dim_store.graphql_output, null, 2)
});

</script>


<style scoped>
.graphql-output-container {
    padding-top: var(--fmw-left-selector-height);
}
</style>