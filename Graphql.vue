<template>
    <Codemirror class="fmw-codemirror" ref="cm_ref" v-model:value="code" :options="cmOptions" placeholder="" :height="600"
        @change="change" />
</template>

<script setup>
import Codemirror from "codemirror-editor-vue3";
import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/dracula.css';
import 'codemirror/theme/yeti.css';

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

import { buildClientSchema } from 'graphql';

const dim_store = dimStore()
const cm_ref = ref()
const cmOptions = ref()

const code = ref(``);

const props = defineProps({
    prop_option: Object  
});


function fetchSchema(url) {
    return axios.get(url, {
        headers: { 'Content-Type': 'application/json' }
    }).then(response => {
        const schema = buildClientSchema(response.data);
        return schema;
    });
}




onMounted(() => {
    // setTimeout(() => {
        fetchSchema('https://localhost:8002/v1/api/schema3/').then(
            myGraphqlSchema => {

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
                        schema: myGraphqlSchema,
                    },
                    hintOptions: {
                        schema: myGraphqlSchema
                    },
                    theme: "yeti",
                }
                const merged_object = Object.assign({}, base_option, props.prop_option);
                cmOptions.value = merged_object
                cm_ref.value.cminstance.getWrapperElement().style.opacity = 1
                cm_ref.value.cminstance.focus()
            })
})

watch(() => dim_store.conv_full_screen, () => {
    cm_ref.value.cminstance.focus()
})

watch(() => dim_store.loading_flag, (old_content_type, new_content_type) => {
    if (dim_store.content_type === 'graphql' && dim_store.loading_flag === true) {
        cm_ref.value.cminstance.getWrapperElement().style.opacity = 0
        dim_store.loading_flag = false
        setTimeout(() => {
            dim_store.content_type = 'tiptap'
        }, 300);
    }
})
</script>


<style>
.fmw-codemirror .CodeMirror {
    opacity: 0.1;
    transition: opacity 0.3s;
    padding: 14px;
}

.CodeMirror-scroll {
    font-family: monospace !important;
}
</style>
