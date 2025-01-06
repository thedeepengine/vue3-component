<template>
    <div class="graphql-output-container fmw-transition-graphql-output">
        <Graphql ref="graphql_elt" :dis="'graphql-output'" :code="graphql_output_computed" :prop_option="{ mode: 'application/json' }"></Graphql>
    </div>
</template>

<script setup>
import Graphql from './Graphql.vue'
import { ref, onMounted, watch, computed } from "vue";
import { dimStore } from '@/components_shared/dimStore'
import { wait_for_element, fmw_transition } from '@/components_shared/utils.js'


const dim_store = dimStore()
const graphql_output_computed = ref()
const graphql_elt = ref()

onMounted(() => {
    graphql_output_computed.value = JSON.stringify(dim_store.graphql_output, null, 2)
    
    wait_for_element('#fmw-base-codemirror-graphql-output',
    '#fmw-base-codemirror-graphql-input'
    ).then(() => {
        fmw_transition('.fmw-transition-graphql-output', 'show')
    })
});

watch(() => [dim_store.graphql_output, dim_store.dimension], () => {
    graphql_output_computed.value = JSON.stringify(dim_store.graphql_output, null, 2)
})


watch(() => dim_store.loading_flag, () => {
  if (dim_store.dimension === 'graphql_output' && dim_store.loading_flag === true) {
    fmw_transition('.fmw-transition-graphql-output', 'hide')
  }
})

</script>


<style scoped>
.graphql-output-container {
    position: relative;
    height: 100vh;
    width: 50vw;
    padding-right: 30px;
    /* padding-top: var(--fmw-left-selector-height); */
}

.fmw-transition-graphql-output {
    opacity: 0.01;
}
</style>


<style>
.graphql-output-container .CodeMirror-lines {
    padding-top: 100px;
    padding-bottom: 120px;
    padding-right: 30px;
}

.graphql-output-container .CodeMirror-vscrollbar {
    visibility: hidden!important;
}

</style>