<template>
    <div style="padding: 14px;">
        <NGrid :cols="1">
            <NGi style="padding: 6px;">
                <div style="display: inline-flex;cursor: pointer;"
                @click="click_parent()">
                    <div style="display: flex;align-items:center">
                        <n-icon color="#676767" size="20">
                            <ChevronLeft48Regular />
                        </n-icon>
                        <div 
                            style="padding-left:8px;font-weight: bold;">{{
                                current_level?.at(-2) || 'Doc' }}
                        </div>
                    </div>
                </div>
            </NGi>
            <NGi style="padding: 6px;">
                <div class="fmw-schema-item" @click="click_name(item?.name)" style="font-weight: bold;">{{
                    current_doc?.name }}</div>
            </NGi>
            <NGi style="padding: 6px;">
                <div style="font-weight: 400;">{{ current_doc?.description }}</div>
            </NGi>
            <NGi style="padding: 0px 6px 6px 6px;">
                <n-divider title-placement="left" style="font-weight: 200;margin-top:12px">
                    Fields
                </n-divider>
                <div v-for="(item, index) in current_doc?._fields" style="padding-left: 12px;padding-bottom: 12px">
                    <span class="fmw-schema-item" style="color:#5F89D8" @click="click_field(item?.name)">
                        {{ item?.name }}
                    </span>
                    <span>: </span>
                    <span class="fmw-schema-item" style="color:#EB9C00" @click="click_type(item?.type)">
                        {{ item?.type }}
                    </span>
                </div>
            </NGi>
        </NGrid>
    </div>
</template>


<script setup>
import { dimStore } from '@/components_shared/dimStore.js'
import { NIcon, NGrid, NGi, NSelect, NDivider, NButton } from 'naive-ui'
import { computed, ref, onMounted, onUnmounted, shallowRef } from 'vue'
import { ChevronLeft48Regular } from '@vicons/fluent'


const dim_store = dimStore()
const current_level = ref(['_queryType'])
const current_doc = ref()

// const current_doc = computed(() => {
//     if (dim_store.graphql_shema) {
//         let new_value = get_value_at_path(dim_store.graphql_shema, current_level.value)
//     if (new_value !== undefined) {
//         return new_value
//     } else {
//         current_level.value.pop()
//         return current_doc.value
//     }
//     } else {
//         return undefined
//     }
// })

onMounted(() => {
    setTimeout(() => { //TODO: quick fix to be changed
        let new_doc = get_value_at_path(dim_store.graphql_shema, current_level.value)
        current_doc.value = new_doc
    }, 1000);
})

function click_field(field_name) {
    if (dim_store.graphql_shema) {
        let new_level = [...current_level.value, field_name]
        let new_doc = get_value_at_path(dim_store.graphql_shema, new_level)
        if (new_doc !== undefined) {
            current_doc.value = new_doc
            current_level.value = new_level
            console.log('current_doc.value', current_doc.value)
        }
    }
}

function click_name(name) {

}

function click_parent() {
    if (current_level.value.length > 1) {
        current_level.value.pop()
        let new_doc = get_value_at_path(dim_store.graphql_shema, current_level.value)
        current_doc.value = new_doc
    }
}

function hack_key(current) {
    if ('_fields' in current) {
        current = current._fields
    }

    if ('type' in current && '_fields' in current.type) {
        current = current.type._fields
    }

    if ('type' in current && 'ofType' in current.type) {
        current = current.type.ofType
    }
    return current
}

function get_value_at_path(json, path) {
    let to_return = {}
    let current = json;

    for (const key of path) {
        current = hack_key(current)
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else if (Array.isArray(current) && typeof key === 'number' && key < current.length) {
            current = current[key];
        } else {
            return undefined;
        }
    }

    console.log('current', current)

    to_return['name'] = current?.name
    to_return['description'] = current?.description
    // if ('type' in current) {
    //     current = current['type']
    // }
    let _fields;
    if ('_fields' in current) {
        _fields = current._fields
    }

    if ('type' in current && '_fields' in current.type) {
        _fields = current.type._fields
    }

    if ('type' in current && 'ofType' in current.type) {
        _fields = current.type.ofType._fields
    }

    console.log('_fields', _fields)
    let fields = Object.keys(_fields).reduce((acc, key) => {
        acc[key] = get_field(_fields[key]);
        return acc;
    }, {});
    to_return['_fields'] = fields

    return to_return;
}



function get_field(obj) {
    const result = {};
    const fields = ['name', 'description', 'type', '_fields', 'ofType'];
    for (const field of fields) {
        if (field in obj) {
            result[field] = obj[field];
        }
    }
    return result
}


</script>

<style>
.fmw-schema-item {}

.fmw-schema-item:hover {
    text-decoration: underline;
}
</style>