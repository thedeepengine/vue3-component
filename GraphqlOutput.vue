<template>
    <div class="graphql-output-container">
        <Graphql ref="graphql_elt" :code="graphql_output_computed" :prop_option="{mode: 'application/json'}"></Graphql>
    </div>
</template>

<script setup>
import Graphql from './Graphql.vue'
import { ref, onMounted, watch, computed } from "vue";
import { dimStore } from '@/components_shared/dimStore'

const dim_store = dimStore()
const graphql_output_computed = ref()
const graphql_elt = ref()


function animateElement() {
    const box = document.querySelector('.graphql-output-container');
    return box.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration: 200, 
        fill: 'forwards'
    }).finished;
    }

watch(() => dim_store.graphql_output, () => {

animateElement().then(() => {
    graphql_output_computed.value = JSON.stringify(dim_store.graphql_output, null, 2)

    const box = document.querySelector('.graphql-output-container');

    box.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], {
        duration: 200, 
        fill: 'forwards'
    });
  
});

})

</script>


<style scoped>
.graphql-output-container {
    padding-top: var(--fmw-left-selector-height);
}
</style>