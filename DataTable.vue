<template>
    <n-grid id="datatable_component" cols="1">
        <n-gi>
            <n-space justify="end">
                <button style="z-index:99999999999999999;position:relative" class='fm-button' @click="expand"
                    :class="{ shrink: is_shrunk, reverseShrunk: !is_shrunk }" ref="expand_button">
                    <!-- <n-icon :component="icon" color="rgb(76, 84, 103)" size="30"></n-icon> -->
                </button>
            </n-space>
        </n-gi>
        <n-gi>
            <div id="fmw-datatable-container" ref="table_wrapper"
                style="border-radius: 10px;background-color: #eeeae6;opacity: 0.01;"
                :style="{ padding: dim_store.data_table ? '5px' : '0' }"
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
import { wait_for_element, find_differences, fmw_transition } from '@/components_shared/utils'

const dim_store = dimStore()
import { shallowRef } from 'vue'

const table = ref(null);
const table_wrapper = ref(null);
const tabulator = ref(undefined);
const tableData = ref([]);
const icon = shallowRef(Add24Regular);
const is_shrunk = ref(false);
const expand_button = ref(null);
const initial_table = ref(undefined)
const buffer_modified_uuids = ref([])
const table_scroller = ref()
const cell_box_elt = ref()
const original_data = ref()

function emToPx(em) {
    const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return em * rootFontSize;
}

function preventScrollPropagate(el) {
    el.addEventListener('wheel', (event) => {
        const { scrollTop, scrollHeight, clientHeight } = table_scroller.value;
        const { scrollLeft, scrollWidth, clientWidth } = table_scroller.value;

        if (cell_box_elt.value !== undefined) {
            cell_box_elt.value.style.opacity = 0;
            setTimeout(() => {
                cell_box_elt.value.remove()
            }, 300);

        }

        let shouldPrevent = false;

        const isVerticalScrolling = Math.abs(event.deltaY) > Math.abs(event.deltaX);

        if (isVerticalScrolling) {
            if ((scrollTop === 0 && event.deltaY < 0) || // Trying to scroll up when at the top
                (scrollTop + clientHeight >= scrollHeight && event.deltaY > 0)) { // Trying to scroll down when at the bottom
                shouldPrevent = true;
            }
        }

        if (!isVerticalScrolling) {
            if ((scrollLeft === 0 && event.deltaX < 0) || // Trying to scroll left when at the left edge
                (scrollLeft + clientWidth >= scrollWidth && event.deltaX > 0)) { // Trying to scroll right when at the right edge
                shouldPrevent = true;
            }
        }

        if (shouldPrevent) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, { passive: false });
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

        var data = row.getData();

        if (data.uuid.startsWith('temp_uuid_')) {
            let elt = row.getElement()
            elt.style.height = 0;
            elt.style.minHeight = 0;
            elt.style.borderBottom = 0;
            elt.style.transition = 'height 0.5s, min-height 0.5s'
        }

        if (ref_row.ref) {
            ref_row.ref.forEach(ref_name => {
                let with_callback = add_cell_editing_callback(ref_row[ref_name].meta)
                add_ref_row(row, ref_name, with_callback, ref_row[ref_name])
            });
        }
    }
    return f
}

// onActivated(() => {
//     console.log('aAACCCCCCC')
// });


watch(() => dim_store.refresh_save_page, () => {
    if (dim_store.dimension === 'data_table') {

        let differences = find_differences(original_data.value, tabulator.value.getData(), buffer_modified_uuids.value);
        dim_store.transaction_list = differences

        dim_store.dimension = 'save';
    }
})


function set_mgnt_column(original_meta) {
    let mgnt_meta = {
        title: " ", width: 5, field: "fmw___info", formatter: function (cell, formatterParams) {
            return '<div style="display: grid;justify-self: center;opacity: 0.1"><svg width="20" height="20" viewBox="0 0 24 24"><path d="M5 6a1 1 0 0 1 1-1h2a1 1 0 0 0 0-2H6a3 3 0 0 0-3 3v2a1 1 0 0 0 2 0V6ZM5 18a1 1 0 0 0 1 1h2a1 1 0 1 1 0 2H6a3 3 0 0 1-3-3v-2a1 1 0 1 1 2 0v2ZM18 5a1 1 0 0 1 1 1v2a1 1 0 1 0 2 0V6a3 3 0 0 0-3-3h-2a1 1 0 1 0 0 2h2ZM19 18a1 1 0 0 1-1 1h-2a1 1 0 1 0 0 2h2a3 3 0 0 0 3-3v-2a1 1 0 1 0-2 0v2Z" fill="#222F3D"/></svg></div>';
        }
    }

    original_meta = [mgnt_meta, ...original_meta]
    original_meta = add_cell_editing_callback(original_meta)
    return original_meta
}

function init_tabulator_obj() {
    original_data.value = JSON.parse(JSON.stringify(dim_store.data_table.data));

    let column_meta = set_mgnt_column(dim_store.data_table.column_meta.meta)
    tabulator.value = new Tabulator(table.value, {
        height: `${window.innerHeight - 100 - 100}px`,
        layout: "fitColumns",
        columnDefaults: {
            resizable: true,
        },
        // tableBuilt: 
    });

    tabulator.value.on("tableBuilt", function () {
        tabulator.value.setColumns(column_meta);
        tabulator.value.replaceData(dim_store.data_table.data);
        tabulator.value.options.rowFormatter = add_row_formatter(dim_store.data_table.column_meta)
        fmw_transition('#fmw-datatable-container', 'show')
    });

    wait_for_element('#fmw-datatable .tabulator-tableholder').then((elt) => {
        setTimeout(() => {
            table_scroller.value = elt
        }, 1000);
    })

    preventScrollPropagate(table.value);
}

watch(() => dim_store.data_table, () => {
    if (dim_store.dimension !== 'data_table') return


    if (tabulator.value === undefined) {
        init_tabulator_obj()
    } else {
        setTimeout(() => {
            let column_meta = set_mgnt_column(dim_store.data_table.column_meta.meta)
            tabulator.value.setColumns(column_meta);
            tabulator.value.replaceData(dim_store.data_table.data);
            tabulator.value.options.rowFormatter = add_row_formatter(dim_store.data_table.column_meta)
        }, 300);
    }
})

function add_cell_editing_callback(meta) {
    meta = meta.map(column => ({
        ...column,
        cellMouseEnter: function (e, cell) {
            if (cell._cell.column.field === 'fmw___info') {
                let c = cell._cell.row.element?.firstChild?.firstChild
                c.style.opacity = 1
            }
        },
        cellMouseLeave: function (e, cell) {
            if (cell._cell.column.field === 'fmw___info') {
                let c = cell._cell.row.element?.firstChild?.firstChild
                c.style.opacity = 0.1
            }
        },
        cellClick: function (e, cell) {
            if (cell._cell.column.field === 'fmw___info') {
                document.querySelector('.cell-mgnt')?.remove();

                let elt = cell._cell.element.firstChild.firstChild
                cell._cell.row.element.style.backgroundColor = '#DDDDDD'
                let position = elt.getBoundingClientRect()
                var box = document.createElement('div');
                box.setAttribute('tabindex', '0');


                var svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg1.setAttribute("width", "24");
                svg1.setAttribute("height", "24");
                svg1.classList.add("fmw-cell-icon");
                svg1.innerHTML = '<path d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75Zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5ZM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75Zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75Zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25Z"/>';
                svg1.addEventListener('click', function (e) {
                    delete_row(cell)
                });

                var svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg2.setAttribute("width", "24");
                svg2.setAttribute("height", "24");
                svg2.classList.add("fmw-cell-icon");
                svg2.setAttribute("viewBox", "0 0 20 20");

                svg2.innerHTML = '<g><path d="M6 3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H6zM4 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4zm2 13a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H6zm-2-1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2zm-2-6a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1h-15A.5.5 0 0 1 2 10z"></path></g>';

                svg2.addEventListener('click', function () {
                    add_row(cell)
                });

                box.appendChild(svg1);
                box.appendChild(svg2);

                box.className = 'cell-mgnt';
                box.style.left = `${position.left - position.width / 4}px`;
                box.style.top = position.top + 'px';
                document.body.appendChild(box);
                box.focus();

                setTimeout(() => {
                    box.style.opacity = 1;
                }, 10);
                box.addEventListener('blur', () => {
                    box.style.opacity = 0;
                    cell._cell.row.element.style.backgroundColor = ''
                    setTimeout(() => {
                        box.remove();
                    }, 300);

                });
                cell_box_elt.value = box
            }
        },
        cellEdited: function (cell) {
            dim_store.is_dirty = true
            let uuid = cell._cell.row.data.uuid
            console.log('dim_store.data_table', dim_store.data_table.data)
            if (!buffer_modified_uuids.value.includes(uuid)) {
                buffer_modified_uuids.value.push(uuid)
            }
        }
    }));
    return meta
}


function delete_row(cell) {
    let deleted_uuid = cell._cell.row.data.uuid

    cell._cell.row.element.style.transition = 'height 0.5s, min-height 0.5s'
    cell._cell.row.element.style.minHeight = '0'
    cell._cell.row.element.style.height = '0'
    cell._cell.row.element.style.borderBottom = '0'

    remove_cell_menu()

    if (!buffer_modified_uuids.value.includes(deleted_uuid)) {
        buffer_modified_uuids.value.push(deleted_uuid)
    }

    setTimeout(() => {
        cell._cell.row.delete()
    }, 500);
    dim_store.is_dirty = true
}

function add_row(cell) {
    let new_row;
    let new_obj = { uuid: 'temp_uuid_' + Math.random().toString(36).substring(2, 6) }
    tabulator.value.addRow(new_obj, false, cell._cell.row).then((row) => { new_row = row })

    if (!buffer_modified_uuids.value.includes(new_obj.uuid)) {
        buffer_modified_uuids.value.push(new_obj.uuid)
    }

    setTimeout(() => {
        new_row._row.element.style.minHeight = '28px'
        new_row._row.element.style.height = '28px'
        new_row._row.element.style.borderBottom = '1px solid #ddd'
        // let select_row_uuid = cell._cell.row.data.uuid
        remove_cell_menu()
    }, 50);

    dim_store.is_dirty = true
}


function remove_cell_menu() {
    cell_box_elt.value.style.opacity = 0;
    setTimeout(() => {
        cell_box_elt.value.remove()
    }, 300);
}

onMounted(() => {
    if (dim_store.data_table === undefined) {
        return;
    }

    setTimeout(() => {
        init_tabulator_obj()
    }, 300);
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


watch(() => dim_store.loading_flag, () => {
    if (dim_store.dimension === 'data_table' && dim_store.loading_flag === true) {
        fmw_transition('#fmw-datatable-container', 'hide')
    }
})


</script>


<style>
#datatable_component {
    /* padding-top: var(--general-padding-top) */
    z-index: 999999999999999;
    padding-top: calc(var(--general-padding-top));
}

#fmw-datatable .tabulator-col,
#fmw-datatable .tabulator-header,
#fmw-datatable .tabulator-row {
    background-color: #eeeae6;
    cursor: text;
}

#fmw-datatable .tabulator-row .tabulator-cell.tabulator-editing {
    border: none !important;
    cursor: none;
}

#fmw-datatable .tabulator-row-even {
    /* background-color: #eeeae6; */
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

.cell-mgnt {
    position: fixed;
    background-color: #DDDDDD;
    width: 30px;
    height: 70px;
    z-index: 99999999999999999;
    backdrop-filter: blur(10px);
    border-radius: 4px;
    border: 1px solid #DDDDDD;
    text-align: center;
    align-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    cursor: pointer;
}

.fmw-cell-icon:hover {
    fill: var(--gold-color)
}
</style>
<!-- 427 -->