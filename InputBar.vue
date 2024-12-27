<template>
    <div id="fmw-llm-bar" :class="{
        home_display_config: dim_store.dimension === 'home',
        bottom_display_config: dim_store.dimension !== 'home'
    }">
        <div style="position: fixed;left: 300px;top:300px;">
            <n-button @click="switch_llm_history(is_llm_chat_context_open ? 'close' : 'open')">aaa</n-button>
        </div>
        <div>
            <n-grid>

                <n-gi span="24">
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <div style="align-self: flex-start;">
                            <!-- collection selector -->
                            <n-select style="z-index: 999999999" id="fmw-select-clt" :show-checkmark="false"
                                placement="top" size="tiny" placeholder="" v-model:value="dim_store.selected_clt"
                                @updateShow="on_show_select_clt" :options="clt_options" filterable />
                        </div>
                    </div>

                    <!-- <n-select style="z-index: 999999999" id="fmw-select-clt" :show-checkmark="false" placement="top"
                        size="tiny" placeholder="" v-model:value="dim_store.selected_clt"
                        @updateShow="on_show_select_clt" :options="clt_options" filterable /> -->
                    <!-- <span>
                        <n-icon :component="ChevronUp28Regular" color="#4c5467" size="24"></n-icon>
                    </span> -->
                </n-gi>
                <!-- input bar -->
                <n-gi span="24">
                    <div id="fm_input_container">
                        <!-- divider -->
                        <!-- <div v-if="is_llm_chat_context_open"
                            style="width:auto;display:block;flex-grow: 24;z-index: 99999;height:2px;margin-right:20px;margin-left:20px;background-color: #f9f7f5;border-radius: 5px;">
                        </div> -->
                        <!-- tiptap or codemirror editor -->
                        <div style="display:flex">
                            <div style="flex-grow: 1;">
                                <div v-if="editor_type === 'tiptap'" style="padding:12px 10px 12px 30px;flex-grow: 1;">
                                    <!-- tiptap editor -->
                                    <editor-content class="editor" @animationend="handleAnimationEnd" ref="editor_ref"
                                        :editor="editor" />
                                </div>
                                <div v-else-if="editor_type === 'codemirror'"
                                    style="padding:10px 10px 9px 30px;flex-grow: 1;">
                                    <!-- codemirror editor -->
                                    <div style="display: flex;">
                                        <GraphqlBar @editor_change_request="editor_type = 'tiptap'"
                                            class="graphql_bar_id" ref="graphql_ref" @change="onChange" :code="code"
                                            :prop_option="{ mode: 'graphql' }" :height="auto"></GraphqlBar>
                                    </div>
                                </div>
                            </div>
                            <!-- icon pushed at the end -->
                            <div style="cursor: pointer;flex-grow: 0;align-content: center;width: 22px;height:22px;margin:auto;margin-right:3vh;"
                                @click="graphql_search_panel">
                                <svg fill="#4c5467" width="22px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M18.734 3.667l6.578 3.802c1.089-1.146 2.901-1.193 4.047-0.104 0.193 0.188 0.365 0.401 0.5 0.635 0.786 1.37 0.313 3.12-1.063 3.906-0.229 0.13-0.479 0.234-0.745 0.297v7.599c1.531 0.365 2.474 1.896 2.109 3.427-0.063 0.271-0.172 0.531-0.307 0.771-0.792 1.365-2.536 1.833-3.906 1.042-0.26-0.146-0.5-0.344-0.698-0.568l-6.542 3.776c0.495 1.495-0.318 3.109-1.813 3.604-0.292 0.099-0.594 0.146-0.896 0.146-1.573 0-2.854-1.271-2.854-2.849 0-0.271 0.042-0.547 0.12-0.813l-6.583-3.797c-1.089 1.141-2.896 1.188-4.036 0.094-1.135-1.089-1.177-2.891-0.094-4.031 0.38-0.396 0.865-0.677 1.396-0.807v-7.599c-1.531-0.365-2.479-1.906-2.109-3.443 0.063-0.266 0.167-0.521 0.302-0.755 0.786-1.365 2.536-1.833 3.901-1.042 0.234 0.135 0.453 0.302 0.641 0.5l6.583-3.797c-0.448-1.51 0.417-3.099 1.922-3.542 0.26-0.083 0.536-0.12 0.813-0.12 1.573 0 2.854 1.271 2.854 2.844 0 0.281-0.042 0.557-0.12 0.823zM18.047 4.839c-0.026 0.026-0.047 0.052-0.078 0.078l8.615 14.917c0.036-0.010 0.078-0.021 0.109-0.031v-7.609c-1.526-0.375-2.453-1.922-2.073-3.448 0.005-0.031 0.016-0.068 0.021-0.099zM14.026 4.917l-0.078-0.078-6.594 3.802c0.438 1.51-0.438 3.089-1.948 3.526-0.036 0.010-0.068 0.016-0.104 0.026v7.609l0.115 0.031 8.615-14.917zM16.797 5.594c-0.521 0.146-1.073 0.146-1.589 0l-8.615 14.917c0.391 0.375 0.667 0.859 0.802 1.391h17.214c0.13-0.531 0.406-1.016 0.802-1.396zM18.109 27.229l6.552-3.786c-0.021-0.063-0.036-0.125-0.052-0.188h-17.219l-0.031 0.109 6.589 3.802c0.516-0.536 1.245-0.87 2.052-0.87 0.839 0 1.589 0.359 2.109 0.932z" />
                                </svg>
                            </div>
                        </div>

                    </div>





                    <div id="llm_chat_context"
                        style="height:48px;flex-grow: 1;position: absolute;background-color: #eeeae6;width: 100%;border-radius:30px;z-index: 9;bottom:0;left:0;right:0">
                        <!-- chevron open llm history -->
                        <div style="position: absolute; left: 50%; transform: translate(-50%,-85%);">
                            <span class="chevron-llm-history"
                                @click="switch_llm_history(is_llm_chat_context_open ? 'close' : 'open')">
                                <n-icon
                                    :component="is_llm_chat_context_open ? ChevronDown28Regular : ChevronUp28Regular"
                                    color="#4c5467" size="24"></n-icon>
                            </span>
                        </div>

                        <!-- llm chat box -->
                        <div id="llm_chat_context_child" class="shadow-box"
                            style="display:none;opacity:0;height:100%;flex-grow: 1;position: absolute;background-color: #eeeae6;width: 100%;border-radius:30px;z-index: 9;bottom:0;left:0;right:0;overflow: hidden;">



                            <div id="temp_history_text" style="height: fit-content;width: 100%;">
                                <div v-for="(item, index) in dim_store.conversation_history" :key="item.id">

                                    <div style="display: flex;width: 100%;padding:16px 16px 0px 16px;overflow-wrap: anywhere;"
                                    :class="with_last_transition && index === dim_store.conversation_history.length-1 ? item.user === 'human' ? 'last human-item' : 'last ai-item' : undefined">
                                        <div v-if="item.user === 'ai'" style="display: flex;width:100%">
                                            <div style="width: 99.8%;align-items:center;"
                                                :class="{ ai_style: item.user === 'ai', human_style: item.user === 'human' }"
                                                class="conv_item">
                                                {{ item.message }}
                                            </div>
                                        </div>
                                        <div v-if="item.user === 'human'"
                                            style="display: flex;width:100%;padding-right:15px">
                                            <div style="width: 99.8%;align-items:center;"
                                                :class="{ ai_style: item.user === 'ai', human_style: item.user === 'human' }"
                                                class="">
                                                <div
                                                    style="background-color: #eeeae6;border-radius: 5px;font-weight: 300;">
                                                    {{ item.message }}</div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </n-gi>
            </n-grid>
        </div>
    </div>
</template>


<script setup>
import { dimStore } from '@/components_shared/dimStore.js'
import { useEditor, Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { markdownToHtml } from '@/components_shared/utils.js'
import { onMounted, onUnmounted, ref, watch, onBeforeUnmount, computed } from 'vue';
import { Extension } from '@tiptap/core'
import { nextTick, reactive, watchEffect } from 'vue';
import { NIcon, NGrid, NGi, NSelect, NDivider, NButton } from 'naive-ui'
import { DismissCircle20Regular } from '@vicons/fluent'
import { useEventBus } from '@/components_shared/event_bus';
import GraphqlBar from './GraphqlBar.vue'
import { ChevronUp28Regular, ChevronDown28Regular } from '@vicons/fluent'
import TiptapCodemirrorExtension from '@/components_shared/TiptapCodemirrorExtension.js';
import { TextSelection } from 'prosemirror-state';
import axios from 'axios'


const { on, emit } = useEventBus();


const dim_store = dimStore()
const editor_ref = ref()
const box_input_html = ref('')
// const clt_options = ref(['+'])
const box_input_md = ref('')
const show_menu = ref(false);
const history = ref([])
const up_down_position = ref(0)
const temp_save = ref('')
const select_clt_open = ref(false)
const is_llm_chat_context_open = ref(false)
const editor_type = ref('tiptap')
// const editor_type = ref('codemirror')
const code = ref(``)
const should_display_llm_context = ref(false)
const with_last_transition = ref(true)

on('should_display_llm_context', (val) => {
    if (is_llm_chat_context_open.value === false) {
        switch_llm_history()
        should_display_llm_context.value = val
    }
})

const clt_options = computed(() => {
    let distinct = Array.from(new Set(dim_store.allowed_clt_fields.map(x => x.clt)))
    let all = distinct.map(item => ({ label: item, value: item }))
    return all
})


function onChange(val) {
    code.value = val
}

const apiClient = axios.create({
    baseURL: 'https://localhost:8002/',
    headers: {
        'Content-Type': 'application/json'
    }
});

watch(() => editor_type.value, () => {
    setTimeout(() => {
        if (editor_type.value === 'tiptap') {
            editor.value.commands.focus()
        }
    }, 400);
})

onMounted(() => {
    watch(() => box_input_md, (newValue) => {
        if (editor.value && editor.value.getHTML() !== newValue.value && newValue.value !== '') {
            box_input_html.value = markdownToHtml(newValue.value)
            editor.value.commands.setContent(box_input_html.value);
        }
    }, { immediate: true });
});

onBeforeUnmount(() => {
    if (editor) {
        setTimeout(() => {
            editor.value.destroy();
        }, 500);
    }
});




function submit(user_input, type_input) {
    if (user_input === '') return
    dim_store.user_input = user_input
    dim_store.set_all_object_dirty()

    if (dim_store.dimension === 'home') {
        let user_input = editor.value.getText()
        dim_store.one_shot_home = user_input
        add_message_to_history(user_input, 'human')
        dim_store.dimension = 'hierarchy'
        dim_store.left_panel = 'markdown'
    } else {
        if (type_input === 'graphql') {
            add_message_to_history(user_input, 'human', 'graphql')
            dim_store.fetch_data({
                dimension: dim_store.dimension,
                query_type: 'graphql',
                query_bundle: { query: dim_store.user_input }
            })
            emit('clean_graphql_input')
        } if (user_input.startsWith('::')) {
            dim_store.fetch_data({
                dimension: dim_store.dimension,
                query_type: 'fmw',
                query_bundle: { clt_name: dim_store.selected_clt, request: dim_store.user_input.replace('::', '') }
            })
            editor.value.commands.setContent('')
        } if (user_input.startsWith('llm::')) {
            apiClient.post("https://localhost:8002/v1/api/set_llm_url/", { url: user_input.replace('llm::', '') })
            //   .then(response => {})
        } else {
            add_message_to_history(user_input, 'human')
            dim_store.fetch_data({
                dimension: dim_store.dimension,
                query_type: 'unknown',
                query_bundle: { clt_name: dim_store.selected_clt, request: dim_store.user_input }
            })
            editor.value.commands.setContent('')
        }
    }
}


function switch_llm_history(way = 'open') {
    const llm_chat_context = document.getElementById('llm_chat_context'); // Select the div by its ID
    const llm_chat_context_child = document.getElementById('llm_chat_context_child'); // Select the div by its ID

    let current_heigth = window.getComputedStyle(llm_chat_context).height

    if (way === 'close') {
        let close_anim = llm_chat_context.animate([
            { height: current_heigth },
            { height: `48px` }
        ], {
            duration: 500,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4, 0.3, 0.2, 1)'
        });

        llm_chat_context.animate([
            { 'paddingBottom': `100px` },
            { 'paddingBottom': `0px` }
        ], {
            duration: 500,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4, 0.3, 0.2, 1)'
        });

        llm_chat_context_child.animate([
            { 'opacity': 1 },
            { 'opacity': 0 }
        ], {
            duration: 100,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4, 0.3, 0.2, 1)'
        });


        close_anim.onfinish = function () {
            // llm_chat_context_child.style.display = 'none'
            is_llm_chat_context_open.value = false
        };


    } else {
        with_last_transition.value = false
        const temp_history_text = document.getElementById('temp_history_text');


        llm_chat_context_child.style.display = 'flex'
        // llm_chat_context_child.style.opacity = 1
        let rect = temp_history_text.getBoundingClientRect()

        llm_chat_context.animate([
            { height: current_heigth },
            { height: `${100 + rect.height}px` }
        ], {
            duration: 500,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4, 0.3, 0.2, 1)'
        });

        llm_chat_context.animate([
            { 'paddingBottom': `0px` },
            { 'paddingBottom': `100px` }
        ], {
            duration: 500,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4, 0.3, 0.2, 1)'
        });


        llm_chat_context_child.animate([
            { 'opacity': 0 },
            { 'opacity': 1 }
        ], {
            duration: 50,
            fill: 'forwards',
            easing: 'cubic-bezier(0.1, 0.7, 0.9, 1)'
        });


        is_llm_chat_context_open.value = true

    }
}


function update_llm_context_position() {
    setTimeout(() => {
        const llm_chat_context = document.getElementById('llm_chat_context'); // Select the div by its ID
        const temp_history_text = document.getElementById('temp_history_text');
        let rect = temp_history_text.getBoundingClientRect()
        let current_heigth = window.getComputedStyle(llm_chat_context).height

        // if ((100 + rect.height) < (window.innerHeight - 200))

        llm_chat_context.animate([
            { height: current_heigth },
            { height: `${100 + rect.height}px` }
        ], {
            duration: 500,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4, 0.3, 0.2, 1)'
            // easing: 'cubic-bezier(0.7, 0.7, 0.1, 0.1)'
        });

        llm_chat_context.animate([
            { 'paddingBottom': `0px` },
            { 'paddingBottom': `100px` }
        ], {
            duration: 500,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4, 0.3, 0.2, 1)'
            // easing: 'cubic-bezier(0.7, 0.7, 0.1, 0.1)'
        });
    }, 0);
}


function update_llm_last_item_opacity(elt) {

        let opacity_animation = elt.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], {
            duration: 350,
            fill: 'forwards',
            easing: 'cubic-bezier(0.4, 0.3, 0.2, 1)'
        });

        opacity_animation.onfinish = function () {
            elt.classList.remove("last", "human-item")
        };

}


on('submit_graphql_query', (idx) => {
    submit(idx, 'graphql')
})



const add_message_to_history = async (message, role, message_type) => {
    history.value.push({ message: message, user: role, type: 'last', message_type: message_type })
    dim_store.conversation_history.push({ message: message, user: role, type: 'last', message_type: message_type, id: dim_store.conversation_history.length + 1 })
}

const last_item_elt = ref()
const last_item_height = ref(0)

function waitForElement(selector) {
    return new Promise(resolve => {
        function check() {
            const element = document.getElementsByClassName(selector)[0];
            if (element) {
                resolve(element);
            } else {
                requestAnimationFrame(check);
            }
        }
        check();
    });
}

watch(dim_store.conversation_history, (new_val, old_val) => {
    if (dim_store.conversation_history.at(-1).user === 'human') {
        with_last_transition.value = true
        waitForElement('human-item').then((elt) => {
            update_llm_last_item_opacity(elt)
        }) 
    } else {
        if (last_item_elt.value === null || last_item_elt.value === undefined) {
            with_last_transition.value = true
            waitForElement('ai-item').then((elt) => {
                last_item_elt.value = elt
                last_item_height.value = 0
            })
        } else {
            if (last_item_height.value < last_item_elt.value.clientHeight) {
                update_llm_context_position()
            }
            last_item_height.value = last_item_elt.value.clientHeight
        }        
    }
})


watch(() => dim_store.stream_status, () => {
    if (dim_store.stream_status === 'end') {
        let elt = document.getElementsByClassName("last");
        if (elt.length > 0) {
            elt[0].classList.remove("last", "ai-item", "human-item")
        }
        last_item_elt.value = undefined
        dim_store.stream_status = 'ready'
    }
})

const KeyHandler = Extension.create({
    name: 'KeyHandler',
    addKeyboardShortcuts() {
        return {
            'Cmd-Enter': ({ editor }) => {
                const { tr, selection, schema } = editor.state;
                const { $from } = selection;
                const pos = $from.end();
                const paragraphNode = schema.nodes.paragraph.create();
                const transaction = tr.insert(pos, paragraphNode);
                const newSelection = TextSelection.create(transaction.doc, pos + 1);
                editor.view.dispatch(transaction.setSelection(newSelection).scrollIntoView());
                return true;
            },
            'Enter': () => {
                if (show_menu.value === false) {
                    let user_input = editor.value.getText()
                    submit(user_input)
                }
                return true;
            }
        }
    },
});





function graphql_search_panel() {
    // :class="{'full-screen': dim_store.conv_full_screen}"
    // :style="{ height: computedHeight + 'px' }"
    let conv_elt = window.document.getElementById('fmw-llm-bar')
    let menu_elt = window.document.getElementById('clt-menu')

    dim_store.conv_full_screen = (dim_store.conv_full_screen ? false : true)
    if (dim_store.conv_full_screen) {
        dim_store.content_type = 'graphql'
    } else {
        dim_store.loading_flag = true
    }
}


const editor = useEditor({
    extensions: [
        StarterKit.configure({ codeBlock: false }),
        KeyHandler,
        // EnterKeyHandler,
        // UpAndDownKeyHandler,
        TiptapCodemirrorExtension,
    ],
    content: box_input_html.value,
    editorProps: {
        attributes: {
            spellcheck: "false"
        }
    },
    attributes: {
        spellcheck: "false"
    },
    onUpdate: ({ editor }) => {

        let html = editor.getHTML()
        if (html !== box_input_html.value) {
            box_input_html.value = html
        }
    },
    onBlur({ event }) {
    },
    onTransaction: ({ editor, transaction }) => {
    }
});


function on_show_select_clt(state) {
    if (state) {
        select_clt_open.value = true
    } else {
        select_clt_open.value = false
    }
}

</script>


<style>
#fmw-select-clt {
    padding-bottom: 10px;
    padding-left: 20px !important;
    height: 40px;
    min-width: 100px;
    /* width: fit-content; */
}

.CodeMirror-hints.dracula {
    z-index: 999999999999;
}

.n-base-selection {
    max-width: 100px !important;
}

/* .n-base-selection-input {
    width:10px;
} */

.n-base-selection.n-base-selection--active {
    max-width: 200px !important;
}


#fmw-select-clt .n-base-selection {
    text-align: center;
    --n-text-color: white !important;
    /* --n-color: #1f2937!important; */
    --n-border-focus: none !important;
    --n-border-hover: none !important;
    --n-border-active: none !important;
    --n-border-pressed: none !important;
    outline: none !important;
    border: none !important;
    --n-box-shadow-focus: none !important;
    --n-box-shadow-active: none !important;
    --n-padding-single-right: none !important;
    background-color: #1f2937 !important;
    --n-border: none !important;
}

#fmw-select-clt .n-base-selection-label {
    background-color: #1f2937 !important;
    --n-text-color: white !important;
    padding-right: 10px;
    padding-left: 10px;
}

.n-base-selection:not(.n-base-selection--disabled).n-base-selection--active .n-base-selection-label {
    background-color: #1f2937 !important;
}

.n-virtual-list.v-vl {
    border-radius: 5px !important;
}

.v-vl-items {
    --n-color: #f9f7f5 !important;
    padding: 0 !important;
    --n-option-color-pending: none !important;
    border-radius: 5px !important;
}

.n-base-select-menu.n-select-menu {
    --n-color: #f9f7f5 !important;
    --n-border-radius: 5px !important;
    border-radius: 5px !important;
    /* --n-option-height: 20px!important; */
}

.n-base-select-option {
    padding: 10px !important;
    padding-top: 0px !important;
    padding-bottom: 0px !important;
    /* height: 10px!important; */
    background-color: #1f2937;
    --n-color: white !important;
    color: white !important;
    /* --n-option-height: 30px!important; */
}


.n-base-select-option.n-base-select-option--pending {
    /* --n-color: rgb(84, 88, 92)!important; */
    color: var(--gold-color) !important;
    /* --n-option-text-color: rgb(84, 88, 92)!important; */
}

.n-base-select-menu .n-base-select-option.n-base-select-option--selected.n-base-select-option--pending::before {
    background-color: var(--n-option-color-pending);
}


#fmw-select-clt .n-base-loading.n-base-suffix {
    display: none;
    width: 0;
}



.conv_item {
    display: flex;
    /* padding: 10px; */
    font-weight: 300;
}

.human_style {
    display: flex;
    justify-content: flex-end;
}

.ai_style {
    padding-left: 20px;
}

#fm_input_container {
    background-color: rgba(238, 234, 230, 1);
    display: flex;
    border-radius: 30px;
    position: relative;
    z-index: 10;
    width: 100%;
    flex-direction: column;
}

.tiptap:focus {
    outline: none !important;
}

.home_display_config {
    position: relative;
    width: 50vw;
    top: 50%;
    z-index: 999999;
}

.bottom_display_config {
    transition: left 0.3s;
    position: fixed;
    bottom: 30px;
    left: 25vw;
    width: 47vw;
    margin: auto;
    z-index: 99999999999;
}

#clt-menu {
    transition: left 0.3s;
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


.blur {
    animation: moveAndBlur 0.5s ease-in forwards;
}

.unblur {
    animation: moveAndUnblur 0.5s ease-out forwards;
}


.list-enter-active,
.list-leave-active {
    transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    /* width: fit-content; */
}

.reverse-order {
    display: flex;
    flex-direction: column-reverse;
    /* This reverses the visual order of flex items */
}

.shadow-box {
    background: #f9f7f5;
    border-radius: 10px;
}


#shadow-box-container {
    position: fixed;
    bottom: 90px;
    left: 25vw;
    width: 47vw;
    height: auto;
}


.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}



.chevron-llm-history {
    opacity: 0.1;
    transition: opacity 1s;
}

.chevron-llm-history:hover {
    opacity: 1;
}

.human-item {
    opacity: 0;
}
</style>
