<template>
    <n-grid id="datatable_component" cols="1" style="padding-top:70px;padding-right:3em">
        <n-gi>
            <n-space justify="end">
                <button 
                style="z-index:99999999999999999;position:relative"
                class='fm-button' @click="expand" :class="{ shrink: is_shrunk, reverseShrunk: !is_shrunk }"
                    ref="expand_button">
                    <n-icon :component="icon" color="black" size="30"></n-icon>
                </button>
            </n-space>
        </n-gi>
        <n-gi>
            <div id="fmw-datatable" ref="table" :class="[{ 'full-screen': dim_store.is_full_screen }]"></div>
        </n-gi>
    </n-grid>

</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { TabulatorFull as Tabulator } from 'tabulator-tables'; //import Tabulator library
import 'tabulator-tables/dist/css/tabulator.min.css';
// import 'tabulator-tables/dist/css/tabulator_semanticui.min.css'
// import 'tabulator-tables/dist/css/tabulator_materialize.min.css'
import { dimStore } from '@/components_shared/dimStore.js'
import { NButton, NIcon, NGrid, NGi, NSpace } from "naive-ui";
import { Add24Regular, Subtract24Regular } from '@vicons/fluent'

const dim_store = dimStore()
import { shallowRef } from 'vue'

const table = ref(null); //reference to your table element
const tabulator = ref(null); //variable to hold your table
const tableData = reactive([
    { id: 1, name: "Oli Bob", age: "12", col: "red", dob: "" },
    { id: 2, name: "Mary May", age: "1", col: "blue", dob: "14/05/1982" },
    { id: 3, name: "Christine Lobowski", age: "42", col: "green", dob: "22/05/1982" },
    { id: 4, name: "Brendon Philips", age: "125", col: "orange", dob: "01/08/1980" },
    { id: 5, name: "Margret Marmajuke", age: "16", col: "yellow", dob: "31/01/1999" },
]);


const icon = shallowRef(Add24Regular);
const is_shrunk = ref(false);
const expand_button = ref(null);
const full_mode = ref(false)
const initial_table = ref(undefined)

function emToPx(em) {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return em * rootFontSize;
}

const expand = () => {
    console.log('expand')

    is_shrunk.value = true
    full_mode.value = full_mode.value ? false : true

    expand_button.value.addEventListener('animationend', () => {
        console.log('END')
        if (full_mode.value) {
            icon.value = Subtract24Regular
        } else {
            icon.value = Add24Regular
        }

        is_shrunk.value = false;


    }, { once: true });

    const rect = table.value.getBoundingClientRect();  

    if (initial_table.value === undefined) {
        initial_table.value = { 'width': rect.width, 'height': rect.height, 'left': rect.left }
    }
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (!full_mode.value) {
        table.value.style.transition = 'transform 0.5s ease, height 0.5s ease, width 0.5s ease';
        table.value.style.height = `${initial_table.value.height}px`;
        table.value.style.width = `${initial_table.value.width}px`;
        table.value.style.transform = `none`;
    } else {
        table.value.style.height = initial_table.value.height
        table.value.style.width = initial_table.value.width
        setTimeout(() => {
            table.value.style.transition = 'transform 0.5s ease, height 0.5s ease, width 0.5s ease';
            table.value.style.height = `${height - 130}px`;
            table.value.style.width = `${width - 100}px`;
            table.value.style.transform = `translate(${-initial_table.value.left + emToPx(3)}px, 0)`;
        }, 0)
    }
};

onMounted(() => {
    tabulator.value = new Tabulator(table.value, {
        data: dim_store.data_table.data,
        reactiveData: true,
        // frozenRows:1,
        // headerVisible:false,
        layout: "fitColumns",
        columns: dim_store.data_table.column_meta

        // [ 
        //     { title: "Name", field: "name", width: 150 },
        //     { title: "Age", field: "age", hozAlign: "left", formatter: "progress" },
        //     { title: "Favourite Color", field: "col" },
        //     { title: "Date Of Birth", field: "dob", sorter: "date", hozAlign: "center" },
        // ],
    });
})


</script>


<style>
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
}

.fm-button {
    background-color: transparent;
    box-shadow: 0px;
    outline: none;
    border: none;
    align-items: center;
    height: 30px;
    transition: height 0.3s ease;
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
