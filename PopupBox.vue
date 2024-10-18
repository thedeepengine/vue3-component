<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <div id="popupbox-content">
        <svg id="popupbox-svg" style="position: fixed"
            :style="{ left: `${dim_store.position.x}px`, top: `${dim_store.position.y}px` }">
            <path ref="path_elt" stroke="black" fill="none" />
        </svg>
        <div style="position: fixed;"
            :style="{ 'max-width': `${max_box_width}px`, left: `${dim_store.position.x}px`, top: `${dim_store.position.y}px` }">
            <n-input ref="input_ref" @input="popup_input_event" v-model:value="dim_store.popup_text" class="popupbox"
                placeholder="" type="textarea" :autosize="{
                    minRows: 1,
                    maxRows: 5,
                }" />
        </div>
    </div>
</template>

<!-- , height: `${input_height}px` -->

<!-- <svg id="popupbox-svg"></svg> -->

<script setup>
import { NInput, NGi, NGrid, NIcon, NDivider } from 'naive-ui'
import { ArrowCircleUp16Regular, ArrowUp28Regular, ArrowCircleUp48Filled, ArrowCircleUp48Regular } from '@vicons/fluent'


import { onMounted, ref, shallowRef, computed } from 'vue'
import { dimStore } from '@/components_shared/dimStore.js'
import { select as d3select } from 'd3-selection'


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

const cornerLength = 10;
const stroke_width = 3
const input_width = ref()
const input_height = ref()
const max_box_width = ref(350)
const min_box_width = ref(100)


onMounted(() => {
    svg_elt.value = d3select('#popupbox-svg')
    console.log('input_ref.value', input_ref.value)
    input_ref.value.focus()

    update_corners()
    input_ref.value.wrapperElRef.style.height = 'auto'
})

function update_corners() {
    input_width.value = input_ref.value.wrapperElRef.offsetWidth
    input_height.value = input_ref.value.wrapperElRef.offsetHeight

    console.log('height.value', input_ref.value.wrapperElRef.offsetHeight)

    if (input_width.value < min_box_width.value) {
        input_width.value = min_box_width.value
    }

    if (input_width.value > max_box_width.value) {
        input_width.value = max_box_width.value
    }

    svg_elt.value
        .attr('width', input_width.value + stroke_width)
        .attr('height', input_height.value + stroke_width)

    const pathData = drawAllCorners(1, 1, input_width.value, input_height.value, cornerLength);
    path_elt.value.setAttribute('d', pathData);

}

function popup_input_event(event) {
    update_corners()
}

const drawCorner = (x, y, horizontal, vertical) => {
    return `M ${x} ${y} L ${x + horizontal} ${y} L ${x} ${y} L ${x} ${y + vertical} `;
};

const drawAllCorners = (x, y, width, height, length) => {
    let pathData = '';
    pathData += drawCorner(x, y, length, length); // Top-left
    pathData += drawCorner(x + width, y, -length, length); // Top-right
    pathData += drawCorner(x, y + height, length, -length); // Bottom-left
    pathData += drawCorner(x + width, y + height, -length, -length); // Bottom-right
    return pathData;
};



</script>

<style>

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

.card {
    min-width: 450px;
    max-width: 450px;
    backdrop-filter: blur(10px);
    background-color: transparent;
    /* background-color: #ECEDF1; */
    box-shadow:
        -10px -10px 20px #FFFFFF,
        /* Light shadow */
        10px 10px 20px #A6ABB0;
    /* Dark shadow */
    border-radius: 20px;
    display: flex;
    /* justify-content: center; */
    /* align-items: center; */
    font-family: Arial, sans-serif;
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
</style>