<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <div id="graphql-container" style="height:2000px">
        <VueMonacoEditor v-model:value="dim_store.code" ref="monacoEditor" theme="transparentTheme"
            :options="MONACO_EDITOR_OPTIONS" :language="dim_store.content_type" @beforeMount="onBeforeEditorMounted"
            @mount="onEditorMounted">
            <slot></slot>
        </VueMonacoEditor>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { dimStore } from '@/components_shared/dimStore.js';
import { VueMonacoEditor, useMonaco } from '@guolao/vue-monaco-editor';

const MONACO_EDITOR_OPTIONS = {
    automaticLayout: true,
    formatOnType: true,
    formatOnPaste: true,
    fixedOverflowWidgets: true,
    scrollbar: {
        alwaysConsumeMouseWheel: false,
        vertical: 'hidden',
        horizontal: 'hidden'
    },
    scrollBeyondLastLine: false,
    minimap: {
        enabled: false
    }
}

const editorRef = ref(null);
const dim_store = dimStore();

onMounted(() => {
});


function onBeforeEditorMounted(editor) {
    editorRef.value = editor;
    const { monacoRef } = useMonaco();

    monacoRef.value.editor.defineTheme('transparentTheme', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
            'editor.background': '#00000000'
        }
    });
}


function onEditorMounted(editor) {
    setTimeout(() => {
        editor.getAction('editor.action.formatDocument').run();

        setTimeout(() => {
            const element = document.querySelector('.overflow-guard');
            element.style.opacity = 1
        }, 100)
    }, 300);
}

</script>


<style>
canvas.decorationsOverviewRuler {
    display: none !important;
}

.monaco-scrollable-element>.scrollbar>.slider {
    background-color: #EEEEEE !important;
}


.overflow-guard {
    opacity: 0;
    transition: opacity 0.3s;
}
</style>
