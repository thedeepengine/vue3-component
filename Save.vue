<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <n-grid id="save-container" cols=1 style="padding-right:3em;">
        <n-gi v-for="item, k in dim_store.transaction_list">
            <div v-if="item.length > 0">
                <div style="font-weight: 600;font-size: 20px">{{ CATEGORY_MAPPING[k] }}</div>
                <div v-for="sub_item in item" style="font-weight: 300">
                    <n-grid cols="10">
                        <n-gi span="10">{{ sub_item }}</n-gi>
                    </n-grid>
                </div>
            </div>

        </n-gi>
        <n-gi>
            <div style="margin: auto;width: 100%;text-align: center;padding-top:50px">
                        <n-button @click="commit">Commit</n-button>
                    </div>
        </n-gi>
    </n-grid>
</template>

<script setup>
import axios from 'axios'
import { dimStore } from '@/components_shared/dimStore.js'
import { NButton, NGrid, NGi } from "naive-ui";
import { ref, onMounted, watch } from "vue";

const dim_store = dimStore()

const CATEGORY_MAPPING = {changed_prop: 'Updated Properties', 
removed_obj: 'Removed Object', added_obj: 'Added Object',
removed_prop: 'Removed Properties', added_refs: 'Added References',
deleted_refs: 'Deleted References'}

const apiClient = axios.create({
    baseURL: 'https://localhost:8002/',
    headers: {
        'Content-Type': 'application/json'
    }
});


function commit() {

    let bundle = { old_html: dim_store.html_content_original, 
    new_html: dim_store.html_content, 
    header_prop_name: dim_store.header_prop_name, 
    dry_run: false,
    selected_clt: dim_store.selected_clt }

  apiClient
    .post("https://localhost:8002/v1/api/commit/", bundle)
    .then(response => {
        if (bundle.dry_run === false) {
            dim_store.transaction_list = response.data
        }
    })

}

</script>

<style>
#save-container {
    padding-top: calc(var(--general-padding-top) + var(--fmw-left-selector-height));
}
</style>
