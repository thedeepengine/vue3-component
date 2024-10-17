<!-- TEMPLATE MUST HAVE A SINGLE CHILD EVEN COMMENT NOT ACCEPTED -->
<template>
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


    <div>
        <div>
            <div style="position: absolute;">
                <ul class="custom-dots">
                    <li v-for="index of total" :key="index" :class="{ ['is-active']: currentIndex === index - 1 }"
                        @click="to(index - 1)"></li>
                </ul>
            </div>
        </div>
        <div style="position: relative; height: 100%;">
            <div>
                <n-input
            style="min-width: 200px;max-width: 450px;"
            class="popupbox"
            placeholder="" type="textarea"
                :autosize="{
                    minRows: 1,
                    maxRows: 10,
                }" />
            </div>
            <div>
                <!-- <n-icon v-if="store.header_mode == 'icon'" 
                :component="ArrowCircleUp16Regular" color="black" size="16"></n-icon> -->
            </div>
        </div>
    </div>

    <!-- <div class="svg-container-corner-rect"></div> -->
</template>


<script setup>
import { computed, ref, onMounted } from 'vue'
import { NInput, NGi, NGrid, NIcon } from 'naive-ui'
import { ArrowCircleUp16Regular } from '@vicons/fluent'

const total = ref(2)
const currentIndex = ref(0)


function to(index) {
    currentIndex.value = index
}
</script>

<style>
.popupbox {
    top: 0; 
    margin: auto;
    background-color: transparent;
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