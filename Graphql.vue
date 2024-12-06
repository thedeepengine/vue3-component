<template>
    <Codemirror ref="cm_ref" v-model:value="code" :options="cmOptions" placeholder="test placeholder"
:height="200" @change="change" />
</template>

<script setup>
import Codemirror from "codemirror-editor-vue3";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';

import { ref } from 'vue';
import { onMounted, onUnmounted } from 'vue'
import axios from 'axios'

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

const cm_ref = ref()
const cmOptions = ref()
// Declare the reactive data
const code = ref(`
  var i = 0;
  for (; i < 9; i++) {
    console.log(i);
    // more statements
  }`);


function fetchSchema(url) {
    return axios.get(url, {
        headers: { 'Content-Type': 'application/json' }
    }).then(response => {
        const schema = buildClientSchema(response.data);
        return schema;
    });
}




onMounted(() => {
    setTimeout(() => {
        fetchSchema('https://localhost:8002/v1/api/schema3/').then(
            myGraphqlSchema => {

                function showAutocomplete() {
                    cm_ref.value.cminstance.showHint({ completeSingle: false });
                }

                cm_ref.value.cminstance.on("inputRead", showAutocomplete);

                cmOptions.value = {
                    mode: 'graphql',
                    autoCloseBrackets: true,
                    lint: {
                        schema: myGraphqlSchema,
                    },
                    hintOptions: {
                        schema: myGraphqlSchema
                    },
                    // theme: "dracula", 
                }

            })
    }, 300);
})
</script>
