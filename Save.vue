<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <n-grid cols=1 style="padding-top:120px;padding-right:3em">
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
            <div style="margin: auto;width: 100%;text-align: center;padding-top:14px">
                        <n-button>Commit</n-button>
                    </div>
        </n-gi>
    </n-grid>
</template>

<script setup>
import { dimStore } from '@/components_shared/dimStore.js'
import { NButton, NGrid, NGi } from "naive-ui";
import { ref, onMounted, watch } from "vue";

const dim_store = dimStore()

const CATEGORY_MAPPING = {changed_prop: 'Updated Properties', 
removed_obj: 'Removed Object', added_obj: 'Added Object',
removed_prop: 'Removed Properties', added_refs: 'Added References',
deleted_refs: 'Deleted References'}

console.log('dim_store.transaction_list', dim_store.transaction_list)
// function format_transaction() {
//     return dim_store.
// }

// watch(() => bus_event.value, (new_value, old_value) => {
//     if (new_value.id === 'return_save_dry_run') {

//     }
// })
</script>