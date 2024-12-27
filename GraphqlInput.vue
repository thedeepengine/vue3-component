<template>
    <div class="graphql-input-container">
        <Graphql ref="childRef" @change="onChange"
        :code="code" :prop_option="{ mode: 'graphql' }"></Graphql>
        <div class="fmw-graphql-input-button-container">
            <div>
                <span class="fmw-graphql-input-button" >
                    <n-icon 
                    @click="run_query"
                    :component="PlayCircle48Regular" 
                    color="#4c5467" size="40"></n-icon>
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
import { ref, watch } from 'vue';
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
    dim_store.fetch_data({dimension: dim_store.dimension, 
            query_type: 'graphql',
            query_bundle: {query: dim_store.user_input}})
}

function onChange(val) {
    code.value = val
}


watch(() => dim_store.loading_flag, (old_content_type, new_content_type) => {
    if (dim_store.content_type === 'graphql' && dim_store.loading_flag === true) {
      childRef.value.get_cm_instance().getWrapperElement().style.opacity = 0
        dim_store.loading_flag = false
        setTimeout(() => {
            dim_store.content_type = 'tiptap'
        }, 300);
    }
})
</script>


<style scoped>
.graphql-input-container {
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