<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <div>
        <div ref="popupbox_content_ref" id="popupbox-content" style="z-index: 99999999999;" draggable="true">
            <div v-if="dim_store.popup_event?.target.tagName !== 'INPUT'">
                <svg id="popupbox-svg"
                    style="position: fixed;background-color: transparent;backdrop-filter: blur(10px);"
                    :style="{ left: `${position?.x}px`, top: `${position?.y}px` }">
                    <path ref="path_elt" stroke="black" fill="none" />
                </svg>
                <div style="position: fixed;"
                    :style="{ 'min-width': `${min_box_width}px`, 'max-width': `${max_box_width}px`, left: `${position.x}px`, top: `${position.y}px` }">
                    <n-input ref="input_ref" v-model:value="popup_text" class="popupbox" @input="popup_input_event"
                        @keydown.enter.prevent="popup_enter_event" @keydown.up="event => popup_arrow_event(event, 'up')"
                        @keydown.down="event => popup_arrow_event(event, 'down')" placeholder="" type="textarea"
                        :autosize="{
                            minRows: 1,
                            maxRows: 5,
                        }" />
                </div>
            </div>
            <div v-else>
                <div id="fmw-popup-display-prop" style="position: fixed;padding-top:10px;padding-left:10px"
                    :style="{ 'min-width': `${position?.width}px`, 'max-width': `${position?.width}px`, left: `${position?.x}px`, top: `${position?.y}px` }">
                    <div style="text-align: center;">
                        {{ obj_to_display?.properties[dim_store.header_prop_name] }}
                    </div>
                    <div style="padding-top: 10px;padding-left: 14px;padding-bottom: 14px;">
                        <div v-for="(value, key) in obj_to_display?.properties">
                            <div v-if="key !== dim_store.header_prop_name">
                                {{item}}
                                {{ key }}
                            </div>
                        </div>
                    </div>
                    <!-- {{ obj_to_display }} -->
                </div>
            </div>
        </div>
    </div>
</template>


<!-- style="background-color: transparent;backdrop-filter: blur(10px);" -->

<script setup>
import { NInput, NGi, NGrid, NIcon, NDivider } from 'naive-ui'
import { ArrowCircleUp16Regular, ArrowUp28Regular, ArrowCircleUp48Filled, ArrowCircleUp48Regular, XboxConsole20Filled } from '@vicons/fluent'


import { onMounted, ref, shallowRef, computed, onUnmounted, watch } from 'vue'
import { dimStore } from '@/components_shared/dimStore.js'
import { select as d3select } from 'd3-selection'
import { find_object_by_UUID } from '@/components_shared/utils.js'
import { useEventBus } from '@/components_shared/event_bus';


const { on, emit } = useEventBus();

const MONACO_EDITOR_OPTIONS = {
    automaticLayout: true,
    formatOnType: true,
    formatOnPaste: true,
}

const code = ref('{"test": "aaaa", "test2": {"jjjj": "sssss", "ppp":"aaaa"}}')
const editor = shallowRef()
const handleMount = editorInstance => (editor.value = editorInstance)
const dim_store = dimStore()
const svg_elt = ref(undefined)
const path_elt = ref(null);
const input_ref = ref(null);

const corner_len_w = 20;
const corner_len_h = 10;
const stroke_width = 2
const input_width = ref()
const input_height = ref()
const max_box_width = ref(350)
const min_box_width = ref(150)
const popup_text = ref('')

const history_idx = ref(0)
const obj_to_display = ref()
const position = ref()
const popupbox_content_ref = ref()

onMounted(() => {

    if (dim_store.popup_event.target.tagName !== 'INPUT') {
        svg_elt.value = d3select('#popupbox-svg')
        input_ref.value.focus()

        position.value = { x: dim_store.popup_event.clientX, y: dim_store.popup_event.clientY } 

        setTimeout(() => {
            update_corners()
        }, 0);

        input_ref.value.wrapperElRef.style.margin = '1px'
        input_ref.value.wrapperElRef.scrollTop = input_ref.value.wrapperElRef.scrollHeight

    } else {
        let {left, width, top} = dim_store.popup_event.target.getBoundingClientRect()
        let EXTRA = 100
        position.value = { x: left - EXTRA, y: top, width: width + 2*EXTRA} 
        let uuid = dim_store.popup_event.target.__data__.data.uuid
        obj_to_display.value = find_object_by_UUID(dim_store.graphql_output, uuid)
    }

    requestAnimationFrame(() => {
        window.document.getElementById('popupbox-content').classList.add('show')
    })
    

    watch(() => [dim_store.popup_event], () => {
        if (dim_store.isVisible) {
            setTimeout(() => {
                let {left, width, top} = dim_store.popup_event.target.getBoundingClientRect()
                let EXTRA = 100
                position.value = { x: left - EXTRA, y: top, width: width + 2*EXTRA} 
                let uuid = dim_store.popup_event.target.__data__.data.uuid
                obj_to_display.value = find_object_by_UUID(dim_store.graphql_output, uuid)
                window.document.getElementById('popupbox-content').classList.add('show')
                
            }, 200);
        }
    })

    watch(() => dim_store.popup_uuid, () => {
        obj_to_display.value = find_object_by_UUID(dim_store.graphql_output, dim_store.popup_uuid)
    })

})


on('should_close_popup_box', (event) => {
    if (popupbox_content_ref.value && !popupbox_content_ref.value.contains(event.target)) {
    window.document.getElementById('popupbox-content').classList.remove('show')
    setTimeout(() => {
        dim_store.isVisible = false
    }, 200)
  }
})


function update_corners() {
    input_width.value = input_ref.value.wrapperElRef.offsetWidth
    input_height.value = input_ref.value.wrapperElRef.offsetHeight

    input_width.value = input_width.value < min_box_width.value ? min_box_width.value : input_width.value
    input_width.value = input_width.value > max_box_width.value ? max_box_width.value : input_width.value

    svg_elt.value
        .attr('width', input_width.value + stroke_width)
        .attr('height', input_height.value + stroke_width)

    const pathData = drawAllCorners(1, 1, input_width.value, input_height.value, corner_len_w, corner_len_h);
    path_elt.value.setAttribute('d', pathData);

}


on('history', (message) => {
    popup_text.value = message
});


function popup_arrow_event(event, way) {
    way = way === 'up' ? 1 : -1
    if (history_idx.value + way > 0) {
        emit('need_history', history_idx.value + way)
        history_idx.value += way
    }
}

function popup_input_event(event) {
    update_corners()
}

function popup_enter_event(event) {
    dim_store.isVisible = false
    dim_store.user_input = popup_text.value
    dim_store.shared_popup_text = popup_text.value
    popup_text.value = ''
}

const drawCorner = (x, y, horizontal, vertical) => {
    return `M ${x} ${y} L ${x + horizontal} ${y} L ${x} ${y} L ${x} ${y + vertical} `;
};

const drawAllCorners = (x, y, width, height, length_w, length_h) => {
    let pathData = '';
    pathData += drawCorner(x, y, length_w, length_h); // Top-left
    pathData += drawCorner(x + width, y, -length_w, length_h); // Top-right
    pathData += drawCorner(x, y + height, length_w, -length_h); // Bottom-left
    pathData += drawCorner(x + width, y + height, -length_w, -length_h); // Bottom-right
    return pathData;
};



</script>

<style>
#popupbox-content {
    transition: opacity 0.2s;
    opacity: 0.01;
    cursor: text;
}

#popupbox-content.show {
    opacity: 1;
}


.popupbox {
    background-color: transparent;
    --n-border-hover: none !important;
    --n-border-focus: none !important;
    --n-border: none !important;
    --n-color-focus: none !important;
    box-shadow: 0px !important;
    outline: none !important;
    --n-box-shadow-focus: none !important;
    --n-caret-color: black !important;
    border-radius: 0;
    align-items: center;
}


.custom-dots {
    display: flex;
    margin: 0;
    padding: 0;
    position: absolute;
    bottom: 20px;
    left: 20px;
}

.custom-dots li {
    display: inline-block;
    width: 12px;
    height: 4px;
    margin: 0 3px;
    /* border-radius: 4px; */
    /* background-color: rgba(255, 255, 255, 0.4); */
    background-color: rgba(0, 0, 0, 0.4);
    transition:
        width 0.3s,
        background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
}

.custom-dots li.is-active {
    width: 40px;
    background: #d4af37;
}

#fmw-popup-display-prop {
    /* background-color: #f9f7f5; */
    background-color:#eeeae6;
    backdrop-filter: blur(10px);
    border: 1px solid #9c9894;;
    border-radius: 3px;
}
</style>