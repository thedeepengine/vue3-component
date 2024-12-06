<template>

        <textarea ref="myTextarea" placeholder="Enter your GraphQL query"></textarea>

</template>

<!-- <Codemirror ref="cm_ref" v-model:value="code" :options="cmOptions" border placeholder="test placeholder"
:height="200" @change="change" /> -->

<script setup>
// import type { ValidationContext, SDLValidationContext } from 'graphql';

// import Codemirror from "codemirror-editor-vue3";
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';

import { ref } from 'vue';
import { onMounted, onUnmounted } from 'vue'
import axios from 'axios'
// language and theme imports
import "codemirror/addon/display/placeholder.js";
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror/addon/hint/show-hint.css';



import 'codemirror/addon/edit/closebrackets.js';
import "codemirror/theme/dracula.css";

import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';

import { buildClientSchema, printSchema, buildSchema } from 'graphql';

const myTextarea = ref(null);

const cm_ref = ref()
const cmOptions = ref()
// Declare the reactive data
const code = ref(`
  var i = 0;
  for (; i < 9; i++) {
    console.log(i);
    // more statements
  }`);

const externalFragments = /* GraphQL */ `
  fragment MyFragment on Example {
    id: ID!
    name: String!
  }
   fragment AnotherFragment on Example {
    id: ID!
    title: String!
  }
`;

const change = (newValue) => {


    // console.log("New value:", newValue);
};


function fetchSchema(url) {
    return axios.get(url, {
        headers: { 'Content-Type': 'application/json' }
    }).then(response => {
        console.log(response.data)
        const schema = buildClientSchema(response.data);
        return schema;
    });
}




onMounted(() => {
    console.log('cm_ref', cm_ref.value)


      setTimeout(() => {
        console.log('33333')


    fetchSchema('https://localhost:8002/v1/api/schema3/').then(
        myGraphqlSchema => {
            // console.log('myGrapfhqlSchema------', myGraphqlSchema);
            myGraphqlSchema = myGraphqlSchema



//             const schemaString = `
// type Query {
//   books: [Book]
//   books2: [Book2]
// }
// type Book {
//   title: String
//   author: String
// }

// type Book2 {
//   title: String
//   author: String
// }
// `;

//  myGraphqlSchema = buildSchema(schemaString);


            console.log('ExampleRule======')
            // console.log('ExampleRule', ExampleRule)
            console.log('ExampleRule======')
            let a = CodeMirror.fromTextArea(myTextarea.value, {
      mode: 'graphql',
      autoCloseBrackets: true,
      lint: {
        schema: myGraphqlSchema,
        // validationRules: [ExampleRule],
      },
      hintOptions: {
        schema: myGraphqlSchema,
      },
      theme: 'dracula'
    });


    function showAutocomplete() {
  a.showHint({completeSingle: false});
}

// Event listener for input changes
a.on("inputRead", showAutocomplete);

    console.log('aaaaaa', a)

            // cmOptions.value = {
            //     mode: 'graphql',
            //     lint: {
            //         schema: myGraphqlSchema,
            //         // validationRules: [ExampleRule],
            //     },
            //     hintOptions: {
            //         schema: myGraphqlSchema,
            //         externalFragments
            //     },
            //     // theme: "dracula", // Optionally include theme
            // }

        })


        // cm_ref.value?.cminstance.isClean();
      }, 1000);


})



</script>
