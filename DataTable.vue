<template>
    <n-grid id="datatable_component" cols="1">
        <n-gi>
            <n-space justify="end">
                <button style="z-index:99999999999999999;position:relative" class='fm-button' @click="expand"
                    :class="{ shrink: is_shrunk, reverseShrunk: !is_shrunk }" ref="expand_button">
                    <n-icon :component="icon" color="rgb(76, 84, 103)" size="30"></n-icon>
                </button>
            </n-space>
        </n-gi>
        <n-gi>
            <div ref="table_wrapper" style="border-radius: 10px;background-color: #eeeae6;padding:5px"
                :class="[{ 'full-screen': dim_store.is_full_screen }]">
                <div id="fmw-datatable" ref="table"></div>
            </div>
        </n-gi>
    </n-grid>
</template>

<script setup>
import { ref, reactive, onMounted, watch, onActivated, onDeactivated } from 'vue';
import { TabulatorFull as Tabulator } from 'tabulator-tables'; //import Tabulator library
// import 'tabulator-tables/dist/css/tabulator.min.css';
import 'tabulator-tables/dist/css/tabulator_simple.min.css'
// import 'tabulator-tables/dist/css/tabulator_semanticui.min.css'
// import 'tabulator-tables/dist/css/tabulator_materialize.min.css'
import { dimStore } from '@/components_shared/dimStore.js'
import { NButton, NIcon, NGrid, NGi, NSpace } from "naive-ui";
import { Add24Regular, Subtract24Regular } from '@vicons/fluent'

const dim_store = dimStore()
import { shallowRef } from 'vue'

const table = ref(null); 
const table_wrapper = ref(null);
const tabulator = ref(null); 
const tableData = ref([]);
const icon = shallowRef(Add24Regular);
const is_shrunk = ref(false);
const expand_button = ref(null);
const initial_table = ref(undefined)

function emToPx(em) {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return em * rootFontSize;
}

function add_ref_row(row, col_name, col_meta, child_ref_row) {

    if (row.getData()[col_name]) {
        var holderEl = document.createElement("div");
        var tableEl = document.createElement("div");

        holderEl.style.boxSizing = "border-box";
        holderEl.style.padding = "10px 30px 10px 10px";
        holderEl.style.borderTop = "1px solid #333";
        //    holderEl.style.borderBotom = "1px solid #333";

        holderEl.appendChild(tableEl);

        row.getElement().appendChild(holderEl);

        new Tabulator(tableEl, {
            layout: "fitColumns",
            data: row.getData()[col_name],
            columns: col_meta,
            rowFormatter: add_row_formatter(child_ref_row)
        })
    }
    }

function add_row_formatter(ref_row) {
    let f = function (row) {
        if (ref_row.ref) {
            ref_row.ref.forEach(ref_name => {
                add_ref_row(row, ref_name, ref_row[ref_name].meta, ref_row[ref_name])
            });
        }
    }
    return f
}



// onActivated(() => {
//     console.log('aAACCCCCCC')
// });



// onDeactivated(() => {
//     console.log('DEACC')
// });





watch(() => dim_store.data_table, () => {

    if (!tabulator.value) {
        tabulator.value = new Tabulator(table.value, {
        reactiveData: true,
        layout: "fitColumns",
        });
    }

    setTimeout(() => {
        tabulator.value.setColumns(dim_store.data_table.column_meta.meta);
        tabulator.value.replaceData(dim_store.data_table.data);
        tabulator.value.options.rowFormatter = add_row_formatter(dim_store.data_table.column_meta)
        tabulator.value.redraw(true);
    }, 500);

})

onMounted(() => {
    tabulator.value = new Tabulator(table.value, {
        height: "611px",
        layout: "fitColumns",
        columnDefaults: {
            resizable: true,
        },
        data: dim_store.data_table.data,
        columns: dim_store.data_table.column_meta.meta,
        rowFormatter: add_row_formatter(dim_store.data_table.column_meta),        
    });
})


const expand = () => {

    is_shrunk.value = true
    dim_store.full_mode = dim_store.full_mode ? false : true

    expand_button.value.addEventListener('animationend', () => {
        if (dim_store.full_mode) {
            icon.value = Subtract24Regular
        } else {
            icon.value = Add24Regular
        }

        is_shrunk.value = false;


    }, { once: true });

    const rect = table_wrapper.value.getBoundingClientRect();

    if (initial_table.value === undefined) {
        initial_table.value = { 'width': rect.width, 'height': rect.height, 'left': rect.left }
    }
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (!dim_store.full_mode) {
        table_wrapper.value.style.transition = 'transform 0.5s ease, height 0.5s ease, width 0.5s ease';
        table_wrapper.value.style.height = `${initial_table.value.height}px`;
        table_wrapper.value.style.width = `${initial_table.value.width}px`;
        table_wrapper.value.style.transform = `none`;
    } else {
        table_wrapper.value.style.height = initial_table.value.height
        table_wrapper.value.style.width = initial_table.value.width
        setTimeout(() => {
            table_wrapper.value.style.transition = 'transform 0.5s ease, height 0.5s ease, width 0.5s ease';
            table_wrapper.value.style.height = `${height - 130}px`;
            table_wrapper.value.style.width = `${width - 100}px`;
            table_wrapper.value.style.transform = `translate(${-initial_table.value.left + emToPx(3)}px, 0)`;
        }, 0)
    }
};

</script>


<style>
#datatable_component {
    /* padding-top: var(--general-padding-top) */
    z-index: 999999999999999;
}

#fmw-datatable .tabulator-col,
#fmw-datatable .tabulator-header,
#fmw-datatable .tabulator-row {
    background-color: #eeeae6;
}

#fmw-datatable .tabulator-row-even {
    background-color: #eeeae6;
}

#fmw-datatable .tabulator-row:hover {
    background-color: #DDDDDD;
}


#fmw-datatable .tabulator-col-sorter {
    display: none;
}

#fmw-datatable .tabulator-header {
    position: relative;
    z-index: 10;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

#fmw-datatable .tabulator-tableHolder {
    margin-top: 2px;
    z-index: 5;
}

#fmw-datatable {
    transition: transform 0.5s ease;
    font-family: monospace;
    font-size: 12px;
    align-content: center;
}

#fmw-datatable .tabulator-cell {
    align-content: center;
}

.fm-button {
    background-color: transparent;
    box-shadow: 0px;
    outline: none;
    border: none;
    align-items: center;
    height: 30px;
    transition: height 0.3s ease;
    cursor: pointer;
}

.fm-button.shrink {
    animation: shrinkAnimation 0.3s forwards;
}

.fm-button.reverseShrunk {
    animation: reverseShrinkAnimation 0.3s forwards;
}

@keyframes shrinkAnimation {
    0% {
        transform: scale(1);
    }

    100% {
        transform: scale(0.5);
    }
}

@keyframes reverseShrinkAnimation {
    0% {
        transform: scale(0.5);
    }

    100% {
        transform: scale(1);
    }
}
</style>
 <!-- 427 -->