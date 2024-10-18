<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
    <div>
        <div id="popupbox"></div>
    </div>
    <!-- <n-grid :cols="1">
        <n-gi>
            <div style="position: absolute;">
                <ul class="custom-dots">
                    <li v-for="index of total" :key="index" :class="{ ['is-active']: currentIndex === index - 1 }"
                        @click="to(index - 1)"></li>
                </ul>
            </div>
        </n-gi>
        <n-gi style="position: relative; height: 100%;">
            <n-input class="popupbox" 
            style="position: absolute; top: 0; min-width: 200px; max-width: 450px; width: 100%;"
            placeholder="" type="textarea"
                :autosize="{
                    minRows: 1,
                    maxRows: 10,
                }" />
        </n-gi>
    </n-grid> -->


<!-- 
    <n-grid style="width:470px;background-color: transparent;backdrop-filter: blur(10px);">
        <n-gi style="margin:auto">
            <p style="text-align:center;font-size:40px;line-height: 1">&#8226;</p>
            <n-divider vertical />
        </n-gi>
        <n-gi style="margin:auto;">
                <n-input
            style="min-width: 450px;max-width: 450px;"
            class="popupbox"
            placeholder="" type="textarea"
                :autosize="{
                    minRows: 1,
                    maxRows: 10,
                }" />
        </n-gi>
    </n-grid> -->

</template>



<!-- <div>
        <div>
            <div style="position: absolute;">
                <ul class="custom-dots">
                    <li v-for="index of total" :key="index" :class="{ ['is-active']: currentIndex === index - 1 }"
                        @click="to(index - 1)"></li>
                </ul>
            </div>
        </div>
        <div style="background-color:transparent;position: relative; 
        height: 100%;border: 0px solid rgba(52, 109, 127, 0.5);border-radius:8px">
            <div>
                <n-input
            style="min-width: 450px;max-width: 450px;"
            class="popupbox"
            placeholder="" type="textarea"
                :autosize="{
                    minRows: 1,
                    maxRows: 10,
                }" />
            </div>
        </div>
    </div> -->

<!-- <div class="svg-container-corner-rect"></div> -->

<!-- <div>
    <div class="card">

        <n-input style="min-width: 450px;max-width: 450px;" class="popupbox" placeholder="" type="textarea"
            :autosize="{
                minRows: 1,
                maxRows: 10,
            }" />
        <div style="display:flex;justify-content: flex-end;">
            <n-icon :component="ArrowCircleUp48Regular" color="black" size="26"></n-icon>
        </div>
    </div>

</div> -->

<script setup>
import { computed, ref, onMounted } from 'vue'
import { NInput, NGi, NGrid, NIcon, NDivider } from 'naive-ui'
import { ArrowCircleUp16Regular, ArrowUp28Regular, ArrowCircleUp48Filled, ArrowCircleUp48Regular } from '@vicons/fluent'

const total = ref(2)
const currentIndex = ref(0)


function to(index) {
    currentIndex.value = index
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