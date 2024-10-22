<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <div id="graphql-container" style="height: 100vh;padding-top:120px">
        <vue-monaco-editor v-model:value="dim_store.code" 
        theme="vs-light" 
        :options="MONACO_EDITOR_OPTIONS"
        language="graphql"
        @mount="handleMount" />
    </div>
</template>


<script setup>
import { ref, shallowRef } from 'vue'
import { dimStore } from '@/components_shared/dimStore.js'

const MONACO_EDITOR_OPTIONS = {
    automaticLayout: true,
    formatOnType: true,
    formatOnPaste: true,
    scrollBeyondLastLine: false
}

const code = ref('{"test": "aaaa", "test2": {"jjjj": "sssss", "ppp":"aaaa"}}')
const editor = shallowRef()
const handleMount = editorInstance => (editor.value = editorInstance)
const dim_store = dimStore()

function formatCode() {
    editor.value?.getAction('editor.action.formatDocument').run()
}
</script>