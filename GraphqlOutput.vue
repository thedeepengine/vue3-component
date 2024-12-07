<template>
    <div class="graphql-output-container">
        <Graphql :prop_option="{mode: 'application/json'}"></Graphql>
    </div>
</template>

<script setup>
import Graphql from './Graphql.vue'

</script>


<style scoped>
.graphql-output-container {
    padding-top: var(--fmw-left-selector-height);
}
</style>