<template>
    <node-view-wrapper>
        <Codemirror class="fmw-graphql-bar-codemirror" ref="cm_ref" @ready="onReady" @change="onChange"
            v-model:value="code" placeholder="" :height="props.height" />
    </node-view-wrapper>
</template>

<script setup>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import Codemirror from "codemirror-editor-vue3";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/yeti.css';
import "codemirror/mode/javascript/javascript.js";
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

import { ref, watch, defineProps } from 'vue';
import { onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { dimStore } from '@/components_shared/dimStore.js'
import { useEventBus } from '@/components_shared/event_bus';

import { buildClientSchema } from 'graphql';
// import { makeExecutableSchema } from '@graphql-tools/schema';
// import { pruneSchema, filterSchema } from '@graphql-tools/utils';
// import { printSchema } from 'graphql';
const { on, emit } = useEventBus();

const dim_store = dimStore()
const cm_ref = ref()
const cmOptions = ref()
const code = ref('')


const props = defineProps({
    prop_option: Object,
    height: Number || String,
    ...nodeViewProps,
});

// function onChange(val) {
//     code.value = val
// }
on('clean_graphql_input', (idx) => {
    code.value = ''
})

function get_cm_instance() {
    return cm_ref.value.cminstance
}


// import { defineEmits } from "vue";

// const emit = defineEmits(['editor_change_request']);

// console.log('emitrr', emit)



function onChange() {

}



defineExpose({ get_cm_instance });


function fetchSchema(url) {
    return axios.get(url, {
        headers: { 'Content-Type': 'application/json' }
    }).then(response => {
        const schema = buildClientSchema(response.data);
        return schema;
    });
}


const onReady = (cm) => {
    // is_cm_ready.value = true
    //   console.log(cm.focus());
};


onMounted(() => {


    // setTimeout(() => {
    fetchSchema('https://localhost:8002/v1/api/schema3/').then(
        myGraphqlSchema => {

            // const typeDefs = printSchema(myGraphqlSchema);
            // const schema = makeExecutableSchema(myGraphqlSchema)
            // const schema = makeExecutableSchema({typeDefs: typeDefs});
            // const prunedSchema = pruneSchema(schema);
            // const filteredSchema = filterSchema({
            // schema: prunedSchema,
            // typeFilter: (typeName, type) => typeName === 'NodeTest2', // Remove 'Product' type
            // });

            function showAutocomplete() {
                console.log('autocomplete SHOW', cm_ref.value.cminstance)
                cm_ref.value.cminstance.showHint({ completeSingle: false });
            }

            cm_ref.value.cminstance.on("inputRead", showAutocomplete);

            // let base_option = {
            //     mode: props.mode,
            //     autoCloseBrackets: true,
            //     lineNumbers: false,
            //     gutters: [],
            //     lint: {
            //         schema: filteredSchema,
            //     },
            //     hintOptions: {
            //         schema: filteredSchema
            //     },
            //     theme: "dracula",
            // }
            // const merged_object = Object.assign({}, base_option, props.prop_option);
            // // cmOptions.value = merged_object

            cm_ref.value.cminstance.setOption('mode', 'graphql')
            cm_ref.value.cminstance.setOption('theme', 'dracula')
            cm_ref.value.cminstance.setOption('autoCloseBrackets', true)
            cm_ref.value.cminstance.setOption('lineNumbers', false)
            cm_ref.value.cminstance.setOption('gutters', [])
            cm_ref.value.cminstance.setOption('lint', { schema: myGraphqlSchema })
            cm_ref.value.cminstance.setOption('hintOptions', { schema: myGraphqlSchema })

            cm_ref.value.cminstance.getWrapperElement().style.opacity = 1
            cm_ref.value.cminstance.focus()


            // cm_ref.value.cminstance.setOption("extraKeys", {
            //     "Cmd-Enter": function (cm) {
            //         let user_input = cm_ref.value.cminstance.getValue()
            //         dim_store.conversation_history.push({ message: user_input, user: 'human' })
            //         dim_store.user_input = user_input
            //         dim_store.set_all_object_dirty()
            //         dim_store.fetch_data(dim_store.selected_clt, dim_store.user_input)
            //         code.value = ''

            //     }
            // });


            cm_ref.value.cminstance.setOption("extraKeys", {
                "Cmd-Enter": function () {
                    let user_input = cm_ref.value.cminstance.getValue()
                    emit('submit_graphql_query', user_input)
                    return false
                },
                "Down": function (cm) {

                    const lastLine = cm.lineCount() - 1; // Get the index of the last line
                    const cursor = cm.getCursor(); // Get the current cursor position


                    if (cursor.line === lastLine) {
                        // emit('back_to_tiptap', '');
                        // You can return CodeMirror.Pass to let the default behavior proceed after your custom code
                        return CodeMirror.Pass;
                    } else {
                        // Let the default behavior handle other cases
                        return CodeMirror.Pass;
                    }


                    // const { state } = view;
                    // const lastLine = state.doc.lines;
                    // const { head } = state.selection.main;
                    // const line = state.doc.lineAt(head);

                    // if (line.number === lastLine) {
                    //     // Custom behavior here
                    //     console.log('Last line, arrow down pressed');
                    //     // Prevent the default behavior
                    //     event.preventDefault();
                    //     return true;
                    // }
                }
            })


        })
})

watch(() => dim_store.conv_full_screen, () => {
    cm_ref.value.cminstance.focus()
})




</script>


<style>
.fmw-graphql-bar-codemirror .CodeMirror {
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: 5px;
    /* padding: 14px; */
}

.CodeMirror-scroll {
    font-family: monospace !important;
}

/* .fmw-graphql-bar-codemirror .cm-s-yeti.CodeMirror-activeline-background {
    background: none!important;
} */

.fmw-graphql-bar-codemirror .CodeMirror-activeline-background.CodeMirror-linebackground {
    background: none !important;
}
</style>
