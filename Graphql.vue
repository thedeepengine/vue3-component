<template>
    <Codemirror :id="`fmw-base-codemirror-${props.dis}`" class="fmw-codemirror " ref="cm_ref"
    @ready="onReady"
    v-model:value="props.code" :options="cmOptions" placeholder="" :height="props.height || '100vh'" />
</template>

<script setup>
import Codemirror from "codemirror-editor-vue3";
import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/dracula.css';
import 'codemirror/theme/yeti.css';
import "codemirror/mode/javascript/javascript.js";


import { ref, watch, defineProps } from 'vue';
import { onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { dimStore } from '@/components_shared/dimStore.js'



import "codemirror/addon/display/placeholder.js";
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import "codemirror/addon/lint/lint.css";
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/edit/closebrackets.js';
import "codemirror/theme/dracula.css";
import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';


const dim_store = dimStore()
const cm_ref = ref()
const cmOptions = ref()
// const code = ref(``);
const props = defineProps({
    prop_option: Object,
    code: String,
    height: Number,
    dis: String
});

function getCode() {
    return props.code
}

function get_cm_instance() {
    return cm_ref.value.cminstance
}


defineExpose({ getCode, get_cm_instance });


const onReady = (cm) => {
    // is_cm_ready.value = true
//   console.log(cm.focus());
};

onMounted(() => {

    function showAutocomplete() {
        cm_ref.value.cminstance.showHint({ completeSingle: false });
    }

    cm_ref.value.cminstance.on("inputRead", showAutocomplete);

    let base_option = {
        mode: props.mode,
        autoCloseBrackets: true,
        lineNumbers: false,
        gutters: [],
        lint: {
            schema: dim_store.myGraphqlSchema,
        },
        hintOptions: {
            schema: dim_store.myGraphqlSchema
        },
        theme: "yeti",
    }
    const merged_object = Object.assign({}, base_option, props.prop_option);
    cmOptions.value = merged_object
    cm_ref.value.cminstance.getWrapperElement().style.opacity = 1
    cm_ref.value.cminstance.focus()
})

watch(() => dim_store.conv_full_screen, () => {
    cm_ref.value.cminstance.focus()
})

</script>


<style>

.cm-s-yeti.CodeMirror {
    background-color: transparent!important;
}
.fmw-codemirror .CodeMirror {
    opacity: 0;
    transition: opacity 0.3s;
    padding: 14px;
    padding-top: 0px;
}

.CodeMirror-scroll {
    font-family: monospace !important;
    /* padding-top: 100px; */
    height: 100vh;
    /* padding-bottom: 120px; */
}

</style>
