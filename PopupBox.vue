<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <div id="popupbox-content">
        <svg id="popupbox-svg"
        
        :style="{ left: `${dim_store.position.x}px`, top: `${dim_store.position.y}px` }"></svg>
        <div style="height: 100%;position: fixed;"
            :style="{ left: `${dim_store.position.x}px`, top: `${dim_store.position.y}px` }">
            <n-input
            ref="inputRef"
            @input="popup_input_event"
            v-model:value="dim_store.popup_text"
            class="inputrc"
            placeholder="" type="textarea" :autosize="{
                minRows: 1,
                maxRows: 5,
            }" />
        </div>
    </div>
</template>

        <!-- <svg id="popupbox-svg"></svg> -->

<script setup>
import { NInput, NGi, NGrid, NIcon, NDivider } from 'naive-ui'
import { ArrowCircleUp16Regular, ArrowUp28Regular, ArrowCircleUp48Filled, ArrowCircleUp48Regular } from '@vicons/fluent'


import { onMounted, ref, shallowRef } from 'vue'
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
const inputRef = ref(null);





const clientX = dim_store.position.x
const clientY = dim_store.position.y
const x = 1, y = 1, rectWidth = 150, rectHeight = 50, cornerLength = 10;
const stroke_width = 3


onMounted(()=> {
    svg_elt.value = d3select('#popupbox-svg')
    svg_elt.value.setStyles({left:clientX+"px", top:clientY+"px", position: "fixed",opacity:1})
    .attr('width', rectWidth+2)
    .attr('height', rectHeight+2)
    draw_corner_all(x,y,rectWidth,rectHeight,cornerLength)

})

function drawCorner(x, y, horizontal, vertical) {
    svg_elt.value.append('path')
    .attr('d', `M ${x} ${y} L ${x + horizontal} ${y} L ${x} ${y} L ${x} ${y + vertical}`)
    .attr('stroke', 'black')
    .attr('fill', 'none');
}

function draw_corner_all(x,y,width, height, length) {
    drawCorner(x, y, length, length); // Top-left
    drawCorner(x + width, y, -length, length); // Top-right
    drawCorner(x, y + height, length, -length); // Bottom-left
    drawCorner(x + width, y + height, -length, -length); // Bottom-right
}

function popup_input_event(event) {
    console.log('inputRef: ', inputRef.value)
    console.log('inputRef: ', inputRef.value.wrapperElRef.offsetWidth)
    let new_width = inputRef.value.wrapperElRef.offsetWidth
    let new_height = inputRef.value.wrapperElRef.offsetHeight
    
    svg_elt.value.attr('width', new_width+stroke_width+5).attr('height', new_height+stroke_width+5)
    draw_corner_all(1, 1,new_width+stroke_width,new_height+stroke_width,10)
}

</script>

<style>
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

.popupbox {
    top: 0;
    margin: auto;
    /* background-color: transparent; */
    background-color: blue;
    --n-border-hover: none !important;
    --n-border-focus: none !important;
    --n-border: none !important;
    --n-color-focus: none !important;
    box-shadow: 0px !important;
    outline: none !important;
    --n-box-shadow-focus: none !important;
    --n-caret-color: black !important;
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