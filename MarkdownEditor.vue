<template>
    <div class="markdown-container">
        <Graphql ref="childRef" @change="onChange"
        :code="code" :prop_option="{ mode: 'markdown' }"></Graphql>
    </div>
</template>

<script setup>
import axios from 'axios'
import Graphql from './Graphql.vue'
import { NIcon, NButton } from 'naive-ui'
import { PlayCircle48Regular } from '@vicons/fluent'
import { dimStore } from '@/components_shared/dimStore'
import { ref, watch, onMounted } from 'vue';
import "codemirror/mode/markdown/markdown.js";
const dim_store = dimStore()
const code = ref(``)
const childRef = ref()

function onChange(val) {
    code.value = val
}

onMounted(() => {
    console.log('dim_store.md_content', dim_store.md_content)
    code.value = dim_store.md_content
    watch(() => dim_store.md_content, () => {
        console.log('aaa')
        code.value = dim_store.md_content
    })
})


</script>


<style scoped>
.markdown-container {
    position: relative;
    /* padding-top: var(--fmw-left-selector-height); */
}

.fmw-graphql-input-button-container {
    position: absolute;
    top: 0;
    right: 0;
    padding: 10px;
}

.fmw-graphql-input-button {
    cursor: pointer;
}



</style>