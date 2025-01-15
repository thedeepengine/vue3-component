<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <n-grid id="save-container" cols=1 style="padding-right:3em;overflow:scroll">
        <n-gi v-for="item, k in dim_store.transaction_list">
            <div v-if="item.length > 0">
                <div style="font-weight: 600;font-size: 20px">{{ CATEGORY_MAPPING[k] }}</div>
                <div v-for="sub_item in item" style="font-weight: 300">
                    <n-grid cols="10">
                        <n-gi span="10">{{ sub_item }}</n-gi>
                    </n-grid>
                    <n-divider style=""/>
                </div>
            </div>

        </n-gi>
        <n-gi>
            <div style="margin: auto;width: 100%;text-align: center;padding-top:50px">
                        <n-button @click="real_commit">Commit</n-button>
                    </div>
        </n-gi>
    </n-grid>
</template>

<script setup>
import axios from 'axios'
import { dimStore } from '@/components_shared/dimStore.js'
import { NButton, NGrid, NGi, NDivider } from "naive-ui";
import { ref, onMounted, watch } from "vue";
import { md_to_html } from '@/components_shared/utils.js'

const dim_store = dimStore()

const CATEGORY_MAPPING = {changed_prop: 'Updated Properties', 
removed_obj: 'Removed Object', added_obj: 'Added Object',
removed_prop: 'Removed Properties', added_refs: 'Added References',
deleted_refs: 'Deleted References'}

function real_commit() {
    dim_store.commit(false)
    .then(response => {
        console.log('response:::: ', response)
        dim_store.w_data = response.data.hierarchy
        dim_store.is_object_dirty.w_data = false

        dim_store.md_content = response.data.md
        dim_store.html_content = md_to_html(dim_store.md_content)
        dim_store.html_content_original = dim_store.html_content
        
        dim_store.temp_save_content = undefined
        dim_store.transaction_list = []
        window.document.getElementById('fmw-save-back-dimension').click()

    })
}
</script>

<style>
#save-container {
    padding-top: calc(var(--general-padding-top) + var(--fmw-left-selector-height));
}
</style>
