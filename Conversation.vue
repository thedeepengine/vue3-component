<template>
    <div class="parent">
        <div class='child'>
            <n-grid class="conv-container" :cols="1">
                <!-- <n-gi style="position:relative;height: 50px"> -->
                    <n-gi>
                    <div ref="history_ref" class="history-container">
                        <div class="history-context">
                            <div v-for="(item, index) in history" :key="index">

                                <n-space v-if="item.type === 'last'" style="opacity:0;align-content:center"
                                    @animationend="handleAnimationEndNewItem(item.user)"
                                    :justify="item.user === 'human' ? 'end' : 'start'">
                                    <div class="conversation-elt">{{ item.message }}</div>
                                </n-space>

                                <n-space v-else :justify="item.user === 'human' ? 'end' : 'start'"
                                    style="align-content:center">

                                    <div class="conversation-elt" v-if="streaming_mode === 'normal'">
                                        <div v-if="history.length === index + 1"
                                            :style="{ opacity: trick_empty_string }" style="padding: 0px;">{{
                                                item.message }}</div>
                                        <div v-else style="padding: 0px;">{{ item.message }}</div>
                                    </div>

                                    <div class="conversation-elt" v-if="streaming_mode === 'opacity'">
                                        <div v-if="(history.length === index + 1) && llm_model !== undefined"
                                            :justify="item.user === 'human' ? 'end' : 'start'">
                                            <transition-group name="fade" tag="div">
                                                <span v-for="(word, index) in words" :key="index" class="word">
                                                    {{ word }}
                                                </span>
                                            </transition-group>
                                        </div>
                                        <div v-else :justify="item.user === 'human' ? 'end' : 'start'">{{
                                            item.message }}
                                        </div>
                                    </div>
                                </n-space>
                            </div>
                        </div>
                    </div>
                </n-gi>

                <n-gi>
                    <div id="lll" style="margin-top: auto;margin-bottom: 0vh;height:50px">
                        <n-input v-model:value="box_input" @animationend="handleAnimationEnd" ref="gg"
                            class="inputrc" round placeholder="" type="textarea" :autosize="{
                                minRows: 1,
                                maxRows: 5,
                            }" @keydown.enter.prevent="submit" />
                    </div>
                </n-gi>
            </n-grid>
        </div>

    </div>
    <!-- </div> -->

</template>

<!-- <style>

</style> -->

<script setup>
import { NInput, NGi, NGrid, NButton, NSpace, NButtonGroup, NIcon, NPopover } from 'naive-ui'
import { onMounted, ref, watch } from 'vue';
import { nextTick } from 'vue';
import { dimStore } from '@/components_shared/dimStore.js'

const gg = ref(null)
const history_ref = ref(null)
const box_input = ref('')
const history = ref([])
const dim_store = dimStore()
const textarea_element = ref(null)
const trick_empty_string = ref(1)
const streaming_mode = ref('opacity')
const words = ref(['_']);
const llm_model = ref(undefined)

onMounted(() => {
    textarea_element.value = gg.value?.$el.querySelector('.n-input__textarea.n-scrollbar');

    watch(() => dim_store.stream_status, (newValue, oldValue) => {
        console.log('newValuenewValue', newValue)
        if (newValue === 'start') {
            words.value = ['_']
        } else if (newValue === 'end') {
            history.value[history.value.length - 1] = { message: words.value.join(''), user: 'ai' }
        }
    })


    watch(() => dim_store.stream_content, (newValue, oldValue) => {
        let h = history.value[history.value.length - 1]
        if (h['message'].charAt(0) === '_') {
            h['message'] = h['message'].substring(1)
        }

        if (streaming_mode.value === 'normal') {
            h['message'] = h['message'] + newValue
        } else if (streaming_mode.value === 'opacity') {
            words.value.push(newValue)

        }
    });

})

function submit() {
    toggleAnimation(textarea_element.value, 'blur')
}

function toggleAnimation(element, type) {
    element.classList.remove('blur', 'unblur');
    element.classList.add(type);
}

const handleAnimationEnd = async (role) => {
    textarea_element.value.classList.remove('blur', 'unblur')
    add_message_to_history(box_input.value, 'human')
    show_new_history_message(box_input.value)
    dim_store.user_input = box_input.value
    box_input.value = ''
};


const handleAnimationEndNewItem = (role) => {
    history.value[history.value.length - 1]['type'] = 'regular'
    console.log('history.value: ', history.value)
    if (role === 'human' && llm_model.value !== undefined) {
        add_message_to_history('_', 'ai')
        show_new_history_message('')
    }
}

const add_message_to_history = async (message, role) => {
    history.value.push({ message: message, user: role, type: 'last' })
}

const show_new_history_message = async (message) => {
    await nextTick();
    if (message === '') {
        message = '_'
    }
    const element2 = history_ref.value?.querySelector('.history-context > div:last-child > .n-space');
    let height = measureTextHeightWithinContainer(message, '.history-context');
    document.documentElement.style.setProperty('--item-height', '40px');
    toggleAnimation(element2, 'unblur')
}

function measureTextHeightWithinContainer(text, containerSelector) {
    const container = document.querySelector(containerSelector);
    const tempElement = document.createElement('div');
    tempElement.textContent = text;
    Object.assign(tempElement.style, { visibility: 'hidden', position: 'absolute', top: '0', left: '0', width: '100%' });
    container.appendChild(tempElement);
    const height = tempElement.getBoundingClientRect().height;
    container.removeChild(tempElement);
    return height;
}
</script>

<style>
.inputrc {
    /* position: absolute; */
    /* bottom: 4px; */
    width: 75%;
    left: 0;
    right: 0;
    margin: auto;
    height: 50px;
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

.conversation-elt {
    padding-top: 14px;
    padding-bottom: 14px;
}

@keyframes moveAndBlur {
    0% {
        transform: translateY(0);
        filter: blur(0);
        opacity: 1
    }

    20% {
        transform: translateY(5px);
        filter: blur(0);
        opacity: 1
    }

    100% {
        transform: translateY(-50px);
        filter: blur(8px);
        opacity: 0
    }
}

@keyframes moveAndUnblur {
    from {
        filter: blur(8px);
        height: 0;
        opacity: 0
    }

    to {
        filter: blur(0);
        height: 52px;
        opacity: 1;
    }
}

.blur {
    animation: moveAndBlur 0.5s ease-in forwards;
}

.unblur {
    animation: moveAndUnblur 0.5s ease-out forwards;
}

.history-container {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100%;
    overflow: hidden;
}

.history-context {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}

.trick_empty_string {
    opacity: 0.01;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 1s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}


/* .conv-container {
    backdrop-filter: blur(10px);
    z-index: 999999999999999999999;
    width: 50% !important;
    left: 25vw !important;
    position: fixed;
    top: 0;
    overflow-y: scroll;
    border-radius: 0;
    background-color: transparent !important;
    margin: 0px;
    height: auto
} */


.sub-container {
    position: relative;
    padding: 0;
    list-style-type: none;
    margin: 0;
    height: fit-content;
    /* border-bottom: 2px solid #d4af37; */
    /* backdrop-filter: blur(10px); */
    overflow: hidden;
}

.speak-easy-wrapper {
    z-index: 999999999999999999999;
    width: 50% !important;
    left: 25vw !important;
    position: fixed;
    top: 0;
    height: 5vh;
    border-radius: 0;
    /* backdrop-filter: blur(10px); */
    background-color: transparent !important;
}

.parent {
    z-index: 999999999999999999999;
    backdrop-filter: blur(10px);
    width: 50%;
    left: 25vw;
    position: fixed;
    top: 0;
    height: 50px;
    margin: 0 auto;
    overflow: scroll;
    border-bottom: 2px solid #d4af37;
}

.child {
    background-color: transparent;
    position: absolute;
    width: 100%;
    bottom: 0;
    box-sizing: border-box;
}
</style>