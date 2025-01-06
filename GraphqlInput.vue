<template>
    <div class="graphql-input-container fmw-transition-graphql-input">
        <Graphql ref="childRef" :dis="'graphql-input'" @change="onChange" :code="code"
            :prop_option="{ mode: 'graphql' }"></Graphql>
        <div class="fmw-graphql-input-button-container">
            <div>
                <span class="fmw-graphql-input-button">
                    <n-icon @click="run_query" :component="PlayCircle48Regular" color="#4c5467" size="40"></n-icon>
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios'
import Graphql from './Graphql.vue'
import { NIcon, NButton } from 'naive-ui'
import { PlayCircle48Regular } from '@vicons/fluent'
import { dimStore } from '@/components_shared/dimStore'
import { ref, watch, onMounted } from 'vue';
import { wait_for_element } from '@/components_shared/utils.js'
import { fmw_transition } from '@/components_shared/utils'


onMounted(() => {
    wait_for_element('#fmw-base-codemirror-graphql-input',
        '#fmw-base-codemirror-graphql-output'
    ).then(() => {
        fmw_transition('.fmw-transition-graphql-input', 'show')
    })
});

const dim_store = dimStore()
const code = ref(`{
  Get {
    NodeTest2 {
        name
        content
    }
  }
}`)
const childRef = ref()

const apiClient = axios.create({
    baseURL: 'https://localhost:8002/',
    headers: {
        'Content-Type': 'application/json'
    }
});


function run_query() {
    dim_store.user_input = childRef.value.getCode().trim()
    dim_store.conversation_history.push({ message: dim_store.user_input, user: 'human', type: 'last', message_type: 'graphql', id: dim_store.conversation_history.length + 1 })
    dim_store.set_all_object_dirty()
    dim_store.fetch_data({
        dimension: dim_store.dimension,
        query_bundle: { query: dim_store.user_input, query_type: 'graphql' }
    })
}

function onChange(val) {
    code.value = val
}

watch(() => dim_store.loading_flag, () => {
    if (dim_store.left_panel === 'graphql_input' && dim_store.loading_flag === true) {
        fmw_transition('.fmw-transition-graphql-input', 'hide')
    }
})

</script>


<style scoped>
.graphql-input-container {
    position: relative;
    padding-left: 30px;
    height: 100vh;
}

.fmw-graphql-input-button-container {
    position: fixed;
    top: 100px;
    right: 0;
    padding-right: 36px;
    padding-top: 50px;

}

.fmw-graphql-input-button {
    cursor: pointer;
}

.fmw-transition-graphql-input {
    opacity: 0.01;
}
</style>


<style>
.graphql-input-container .CodeMirror-lines {
    padding-top: 100px;
    padding-bottom: 120px;
}
/* 
.graphql-input-container .CodeMirror-scroll {
    direction: rtl;
}  */

.graphql-input-container .CodeMirror-vscrollbar {
    visibility: hidden!important;
}


.graphql-input-container .CodeMirror-sizer {
    direction: ltr;
}



</style>