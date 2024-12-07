<template>
    <div class="graphql-input-container">
        <Graphql ref="childRef" @change="onChange"
        :code="code" :prop_option="{ mode: 'graphql' }"></Graphql>
        <div class="fmw-graphql-input-button-container">
            <div>
                <span class="fmw-graphql-input-button" >
                    <n-icon 
                    @click="run_graphql_query"
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

function run_graphql_query() {
    console.log('aaaa', childRef.value.getCode().trim())
    apiClient
      .post("https://localhost:8002/v1/api/graphql/", {query: childRef.value.getCode().trim()})
      .then(response => {
        console.log('response.data', response.data)
        dim_store.graphql_output = response.data
      })
    
}

function onChange(val) {
    code.value = val
}

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