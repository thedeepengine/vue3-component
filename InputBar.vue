<template>
    <div id="fmw-llm-bar" @click.stop :class="{
        home_display_config: dim_store.dimension === 'home',
        bottom_display_config: dim_store.dimension !== 'home'
    }">



    <div v-if="search_results.length > 0" style="height:70vh;overflow:scroll;backdrop-filter: blur(10px);">
        <div v-for="(i,index) in search_results" :key="index">
            <div class="fmw-search-list-item" 
            style="padding: 14px 0 14px 0;font-weight: 300;"
            @click="event=>click_search_item(event, i.uuid)">
                <div style="padding-left: 12px;">
                    <div v-for="(v,k) in i" :key="k">
                        <span style="font-weight: bold;">{{ k }}: </span>
                        <span v-for="(parts,k) in v" :key="k"
                        style="border-radius: 4px;" :style="{'background-color': parts.highlight === true ? '#F1E6FF': 'transparent'}">
                            <!-- <span ></span> -->
                            {{ parts.text }}
                        </span>
                    </div>
                </div>
            </div>
            <!-- <n-divider style="margin-top:0px;margin-bottom:0px"/> -->
        </div>
    </div>



        <div>
            <n-grid>
                <n-gi span="24">
                    <div
                        style="display: flex; justify-content: space-between; align-items: center; width: 100%;padding-bottom:10px">
                        <div style="height: 100%;">
                            <!-- COLLECTION SELECTOR -->
                            <n-select style="z-index: 999999999" id="fmw-select-clt" :show-checkmark="false"
                                placement="top" size="tiny" placeholder="" v-model:value="dim_store.selected_clt"
                                @updateShow="on_show_select_clt" :options="clt_options" filterable />
                        </div>

                        <!-- ICON BOOK OPEN INFORMATION DOCUMENTATION -->
                        <div style="flex:auto;width: 20px;cursor: pointer;">
                            <div @click="switch_left_drawer"
                                style="flex:auto;padding-left: 10px;width: 20px;height:28px">
                                <!-- <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="background-color: #f9f7f5;" viewBox="4 5 12 10" width="20px" height="28px"><g fill="none"><path d="M4 4v12a2 2 0 0 0 2 2h9.5a.5.5 0 0 0 0-1H6a1 1 0 0 1-1-1h10a1 1 0 0 0 1-1V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2zm10-1a1 1 0 0 1 1 1v11H5V4a1 1 0 0 1 1-1h8zm-3.25 2.75a.75.75 0 1 0-1.5 0a.75.75 0 0 0 1.5 0zm-.25 6.75a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 1 0v4z" fill="currentColor"></path></g></svg> -->
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                    style="background-color: #f9f7f5;" viewBox="4 2 12 16" width="20px" height="28px">
                                    <g fill="none">
                                        <path
                                            d="M4 4v12a2 2 0 0 0 2 2h9.5a.5.5 0 0 0 0-1H6a1 1 0 0 1-1-1h10a1 1 0 0 0 1-1V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2zm10-1a1 1 0 0 1 1 1v11H5V4a1 1 0 0 1 1-1h8zm-3.25 2.75a.75.75 0 1 0-1.5 0a.75.75 0 0 0 1.5 0zm-.25 6.75a.5.5 0 0 1-1 0v-4a.5.5 0 0 1 1 0v4z"
                                            fill="currentColor"></path>
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                </n-gi>
                <!-- INPUT BAR -->
                <n-gi span="24">
                    <!-- TYPE SIGNAL ICON -->
                    <div id="fm_input_container">
                        <div id="type-signal-icon"
                        @click="switch_editor_type"
                        style="position:absolute;height:100%;left:-40px;align-content: center;">
                        <n-icon v-if="editor_type_active === ''" size="20">
                            <Sparkle20Regular style="height:100%;color:#676767"/>
                        </n-icon>
                        <n-icon v-else-if="editor_type_active === 'ai'" size="20">
                            <Sparkle20Regular style="height:100%;color:var(--gold-color)"/>
                        </n-icon>
                        <n-icon v-else-if="editor_type_active === 'search'" size="20">
                            <Search20Filled style="height:100%;color:var(--gold-color)"/>
                        </n-icon>
                    </div>
                        <!-- divider -->
                        <!-- <div v-if="is_llm_chat_context_open"
                            style="width:auto;display:block;flex-grow: 24;z-index: 99999;height:2px;margin-right:20px;margin-left:20px;background-color: #f9f7f5;border-radius: 5px;">
                        </div> -->


                        <!-- <div v-if="editor_type_active === ''" style="height:24px;cursor: text;text-align:center" @click="search_editor_active = 'ai'">
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" width="24px" height="24px" color="#BBBBBB"><g fill="none"><path d="M8.664 15.735c.245.173.537.265.836.264v-.004a1.442 1.442 0 0 0 1.327-.872l.613-1.864a2.872 2.872 0 0 1 1.817-1.812l1.778-.578a1.442 1.442 0 0 0-.052-2.74l-1.755-.57a2.876 2.876 0 0 1-1.822-1.823l-.578-1.777a1.446 1.446 0 0 0-2.732.022l-.583 1.792a2.877 2.877 0 0 1-1.77 1.786l-1.777.57a1.444 1.444 0 0 0 .017 2.735l1.754.569a2.887 2.887 0 0 1 1.822 1.826l.578 1.775c.099.283.283.527.527.7zm-.374-4.25a4.054 4.054 0 0 0-.363-.413h.003a4.393 4.393 0 0 0-1.72-1.063L4.61 9.5l1.611-.524a4.4 4.4 0 0 0 1.69-1.065a4.448 4.448 0 0 0 1.041-1.708l.515-1.582l.516 1.587a4.374 4.374 0 0 0 2.781 2.773l1.62.522l-1.59.515a4.379 4.379 0 0 0-2.774 2.775l-.515 1.582l-.515-1.585a4.368 4.368 0 0 0-.7-1.306zm8.041 9.297a1.123 1.123 0 0 1-.41-.55l-.328-1.006a1.292 1.292 0 0 0-.821-.823l-.991-.323A1.148 1.148 0 0 1 13 16.997a1.143 1.143 0 0 1 .771-1.08l1.006-.326a1.3 1.3 0 0 0 .8-.82l.324-.991a1.143 1.143 0 0 1 2.157-.021l.329 1.014a1.3 1.3 0 0 0 .82.816l.992.323a1.141 1.141 0 0 1 .039 2.165l-1.014.329a1.3 1.3 0 0 0-.818.822l-.322.989c-.078.23-.226.43-.425.57a1.14 1.14 0 0 1-1.328-.005zm-1.03-3.783A2.79 2.79 0 0 1 17 18.708a2.793 2.793 0 0 1 1.7-1.7a2.813 2.813 0 0 1-1.718-1.708a2.808 2.808 0 0 1-1.682 1.699z" fill="#BBBBBB"></path></g></svg>
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" width="24px" height="24px" color="#BBBBBB"><g fill="none"><path d="M8.664 15.735c.245.173.537.265.836.264v-.004a1.442 1.442 0 0 0 1.327-.872l.613-1.864a2.872 2.872 0 0 1 1.817-1.812l1.778-.578a1.442 1.442 0 0 0-.052-2.74l-1.755-.57a2.876 2.876 0 0 1-1.822-1.823l-.578-1.777a1.446 1.446 0 0 0-2.732.022l-.583 1.792a2.877 2.877 0 0 1-1.77 1.786l-1.777.57a1.444 1.444 0 0 0 .017 2.735l1.754.569a2.887 2.887 0 0 1 1.822 1.826l.578 1.775c.099.283.283.527.527.7zm7.667 5.047a1.123 1.123 0 0 1-.41-.55l-.328-1.006a1.292 1.292 0 0 0-.821-.823l-.991-.323A1.148 1.148 0 0 1 13 16.997a1.143 1.143 0 0 1 .771-1.08l1.006-.326a1.3 1.3 0 0 0 .8-.82l.324-.991a1.143 1.143 0 0 1 2.157-.021l.329 1.014a1.3 1.3 0 0 0 .82.816l.992.323a1.141 1.141 0 0 1 .039 2.165l-1.014.329a1.3 1.3 0 0 0-.818.822l-.322.989c-.078.23-.226.43-.425.57a1.14 1.14 0 0 1-1.328-.005z" fill="#BBBBBB"></path></g></svg>
                                </div> -->

                        <!-- tiptap or codemirror editor -->
                        <div style="display:flex;">
                            <div id="ai-editor-container" 
                            :style="{width: editor_type_active === 'ai' ? '100%' : editor_type_active === 'search' ? '0%' : '50%'}"
                            style="transition: width 0.4s;" 
                            @click="editor_type_active = 'ai';console.log('kkkkk')">
                                <div>

                                <div v-if="editor_type_active === 'ai' || editor_type_active === '' && editor_type === 'tiptap'" 
                                style="padding:12px 10px 12px 30px;flex-grow: 1;">
                                    <!-- TIPTAP EDITOR -->
                                    <editor-content class="editor" ref="editor_ref" :editor="editor" />
                                </div>
                                <div v-else-if="editor_type_active === 'ai' || editor_type_active === '' && editor_type === 'codemirror'"
                                    style="padding:10px 10px 9px 30px;flex-grow: 1;">
                                    <!-- CODEMIRRROR EDITOR -->
                                    <div style="display: flex;">
                                        <GraphqlBar @editor_change_request="editor_type = 'tiptap'"
                                            class="graphql_bar_id" ref="graphql_ref" @change="onChange" :code="code"
                                            :prop_option="{ mode: 'graphql' }" :height="auto"></GraphqlBar>
                                    </div>
                                </div>
                            </div>
                            </div>
                            <div id="search-editor-container" 
                            :style="{width: editor_type_active === 'search' ? '100%' : '44%'}">
                                <div style="padding:12px 10px 12px 30px;background-color: transparent;transition: width 0.4s;">
                                    <!-- SEARCH ICON -->
                                    <div
                                    :style="{opacity: editor_type_active === 'search' || editor_type_active === 'ai' ? 0 : 1}"
                                    style="position:absolute;width:40%;height:24px;cursor: text;text-align:center;transition: opacity 0s;" 
                                    @click="editor_type_active = 'search';console.log('AAAA')">
                                        <n-icon :component="Search20Regular" color="#BBBBBB" size="24"></n-icon>
                                    </div>
                                    <!-- TIPTAP EDITOR SEARCH-->
                                    <div v-if="editor_type_active === 'search'">
                                        <editor-content class="editor" ref="editor_ref_search" :editor="editor2" />
                                    </div>
                                    
                                </div>
                            </div>
                            <!-- GRAPHQL ICON -->
                            <div style="cursor: pointer;position: absolute;right:0;top:25%;align-content: center;width: 22px;height:22px;margin:auto;margin-right:3vh;"
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
                            style="padding:14px;display:none;opacity:0;height:100%;flex-grow: 1;position: absolute;background-color: #eeeae6;width: 100%;border-radius:30px;z-index: 9;bottom:0;left:0;right:0;">
                            <div id="fmw-scroll-div"
                                style="position:absolute;border-radius: 30px; overflow: scroll;display: flex;left:14px;right:14px;bottom:100px;top:14px;">


                                <div id="temp_history_text" style="height: fit-content;width: 100%;">
                                    <div v-for="(item, index) in dim_store.conversation_history" :key="item.id">

                                        <div style="display: flex;width: 100%;padding:16px 16px 0px 16px;overflow-wrap: anywhere;"
                                            :class="with_last_transition && index === dim_store.conversation_history.length - 1 ? item.user === 'human' ? 'last human-item' : 'last ai-item' : undefined">
                                            <div v-if="item.user === 'ai'" style="display: flex;width:100%">
                                                <div style="width: 99.8%;align-items:center;"
                                                    :class="{ ai_style: item.user === 'ai', human_style: item.user === 'human' }"
                                                    class="conv_item">
                                                    <div id="ai_generated_data" v-html="md_to_html_llm(item.message)">
                                                    </div>
                                                    <!-- {{ item.message }} -->
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
import { md_to_html, md_to_html_llm, wait_for_element, debounce } from '@/components_shared/utils.js'
import { onMounted, onUnmounted, ref, watch, onBeforeUnmount, computed } from 'vue';
import { Extension } from '@tiptap/core'
import { nextTick, reactive, watchEffect } from 'vue';
import { NIcon, NGrid, NGi, NSelect, NDivider, NButton } from 'naive-ui'
import { DismissCircle20Regular } from '@vicons/fluent'
import { useEventBus } from '@/components_shared/event_bus';
import GraphqlBar from './GraphqlBar.vue'
import { ChevronUp28Regular, ChevronDown28Regular, Search20Regular } from '@vicons/fluent'
import TiptapCodemirrorExtension from '@/components_shared/TiptapCodemirrorExtension.js';
import { TextSelection } from 'prosemirror-state';
import axios from 'axios'
import { Sparkle20Regular, Search20Filled } from '@vicons/fluent'


const { on, emit } = useEventBus();


const dim_store = dimStore()
const editor_ref = ref()
const editor_ref_search = ref()
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
const with_last_transition = ref(true)
const editor_type_active = ref('')

const search_results = ref([])
const buffer_editor_content = ref('')

on('should_display_llm_context', () => {
    if (is_llm_chat_context_open.value === false) {
        switch_llm_history()
    }
})

on('should_close_llm_context', () => {
    if (is_llm_chat_context_open.value === true) {
        switch_llm_history('close')
    }
})

const clt_options = computed(() => {
    let distinct = Array.from(new Set(dim_store.allowed_clt_fields.map(x => x.clt)))
    let all = distinct.map(item => ({ label: item, value: item }))
    return all
})


// function hh() {
//     console.e
// }

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
            box_input_html.value = md_to_html(newValue.value)
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


function click_search_item(event, uuid) {
    console.log('uuid: ', uuid)
}

function switch_editor_type() {
    console.log('editor_type_active.value+++++', editor_type_active.value)
    let buffer_content;
    let editor_temp;
    let wait_for;
    if (editor_type_active.value === 'ai') {
        buffer_content = editor_ref.value.editor.getHTML()
        wait_for = '#ai-editor-container .tiptap.ProseMirror'
    } else if (editor_type_active.value === 'search') {
        buffer_content = editor_ref_search.value.editor.getHTML()
        wait_for = '#search-editor-container .tiptap.ProseMirror'
    }

    editor_type_active.value = editor_type_active.value === 'ai' ? 'search' : 'ai'

    wait_for_element(wait_for).then((elt) => {
        setTimeout(() => {
        if (editor_type_active.value === 'search') {
            editor_ref_search.value.editor.commands.setContent(buffer_content)
        } else if (editor_type_active.value === 'ai') {
            editor_ref.value.editor.commands.setContent(buffer_content)
        }
    }, 200);
    })
}

const isPDF = async (url) => {
    if (url.endsWith('.pdf')) return true

    try {
        const response = await axios.head(url);
        return response.headers['content-type'] === 'application/pdf';
    } catch (error) {
        console.error('Error checking URL:', error);
        return false;
    }
};

async function submit(user_input, type_input) {
    // user_input = 'https://arxiv.org/pdf/2409.04701v2'
    if (user_input === '') return

    dim_store.user_input = user_input
    dim_store.set_all_object_dirty()

    if (user_input === '!help') {
        emit('should_display_llm_context', true)

        setTimeout(() => {

            dim_store.conversation_history.push({ message: '', user: 'ai', id: dim_store.conversation_history.length + 1 })
            let index = 0;
            let to_send = test_help.split(' ')
            const interval = setInterval(() => {
                if (index < to_send.length) {
                    dim_store.conversation_history[dim_store.conversation_history.length - 1].message += to_send[index] + ' '
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 50);

        }, 700);

        return
    }


    if (user_input.startsWith('www.') || user_input.startsWith('http') || user_input.endsWith('.pdf')) {
        await input_html_manager(user_input)
        return
    }


    if (dim_store.dimension === 'home') {
        let user_input = editor.value.getText()
        dim_store.one_shot_home = user_input
        add_message_to_history(user_input, 'human')
        dim_store.dimension = 'hierarchy'
        dim_store.left_panel = 'editor'
    } else {
        if (type_input === 'graphql') {
            add_message_to_history(user_input, 'human', 'graphql')
            dim_store.fetch_data({
                dimension: dim_store.dimension,
                query_bundle: { query_type: 'graphql', query: dim_store.user_input }
            })
            emit('clean_graphql_input')
        } if (user_input.startsWith('::')) {
            dim_store.fetch_data({
                dimension: dim_store.dimension,
                query_bundle: { query_type: 'fmw', clt_name: dim_store.selected_clt, query: dim_store.user_input.replace('::', '') }
            })
            editor.value.commands.setContent('')
        } if (user_input.startsWith('llm::')) {
            apiClient.post("https://localhost:8002/v1/api/set_llm_url/", { url: user_input.replace('llm::', '') })
            //   .then(response => {})
        } else {
            add_message_to_history(user_input, 'human')
            dim_store.fetch_data({
                dimension: dim_store.dimension,
                query_bundle: { query_type: 'unknown', clt_name: dim_store.selected_clt, query: dim_store.user_input }
            })
            editor.value.commands.setContent('')
        }
    }
}



async function input_html_manager(user_input) {
    if (user_input.includes('lesswrong.com')) {
        apiClient.post("https://localhost:8002/v1/api/get_html/", { url: user_input }).then((res) => {
            emit('set_editor_content', res.data.md_content)
            dim_store.header_prop_name = 'name'
            dim_store.w_data = res.data.hierarchy
            dim_store.is_object_dirty.w_data = false
            dim_store.md_content = res.data.hierarchy
        })
    } else if (user_input.includes('arxiv.org')) {

        let is_pdf = await isPDF(user_input)

        if (is_pdf) {
            // dim_store.left_panel = 'pdfViewer'
            dim_store.download_pdf(user_input)
        } else if (user_input.includes('/html/')) {
            let pdf_url = user_input.replace('/html/', '/pdf/')
            let is_pdf_existing = await isPDF(pdf_url)

            if (is_pdf_existing) {
                // dim_store.left_panel = 'pdfViewer'
                dim_store.download_pdf(pdf_url)
            }
        }

        let html_url = user_input.replace('/pdf/', '/html/')
        apiClient.post(`https://localhost:8002/v1/api/get_doc_hierarchy/`, { url: html_url, selected_clt: dim_store.selected_clt }).then(response => {
            dim_store.dimension = 'hierarchy'
            dim_store.w_data = response.data.hierarchy
            dim_store.md_content = response.data.md_content
            dim_store.is_object_dirty.w_data = false
            dim_store.is_object_dirty.md = false
            dim_store.header_prop_name = 'name'
        })


    }
    editor.value.commands.setContent('')
}

function switch_left_drawer() {
    dim_store.is_left_drawer_open = dim_store.is_left_drawer_open ? false : true
}




const test_help = `
This is a help message, type **!!:!help** to display it again.
You can query data using 3 different ways:  
<br>
#### GraphQL syntax
<br>


Type **!!:\`\`\`+Enter** to start a terminal with syntax highlighting and hints  
  <br>

\`\`\`graphql
{
  Query {...}
}
\`\`\`  
<br>

#### Full Metal Weaviate  


For simple queries, Full Metal query syntax comes handy and intuitive:

- <a onclick="console.log('aaaa')">name,hasChildren:name,content</a> returns **!!:name**
 and references **!!:hasChildren** along with children **!!:name** and **!!:content**
 <br>

#### AI generated queries  
<br>

If you need **AI query** generation assistance or **Weaviate Gorilla**, set up your API keys.  
<br>
`


function switch_llm_history(way = 'open') {
    const llm_chat_context = document.getElementById('llm_chat_context'); // Select the div by its ID
    const llm_chat_context_child = document.getElementById('llm_chat_context_child'); // Select the div by its ID
    llm_chat_context_child.style.display = 'flex'
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
            is_llm_chat_context_open.value = false
        };


    } else {
        with_last_transition.value = false
        const temp_history_text = document.getElementById('temp_history_text');

        let rect;
        wait_for_element('#temp_history_text').then((elt) => {
            rect = temp_history_text.getBoundingClientRect()
            let height = rect.height


            wait_for_element('#fmw-scroll-div').then((elt) => {
                elt.scrollTop = elt.scrollHeight
            })

            const screenHeight = window.innerHeight;
            let MAX_HEIGHT_OFFSET = screenHeight - 250
            if (height > MAX_HEIGHT_OFFSET) {
                height = MAX_HEIGHT_OFFSET
            }

            let PADDING = 14
            let EXTRA = 10

            let open_anim = llm_chat_context.animate([
                { height: current_heigth },
                { height: `${100 + PADDING + EXTRA + height}px` }
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


            open_anim.onfinish = function () {
                is_llm_chat_context_open.value = true
            };
        })

    }
}


function update_llm_context_position() {
    setTimeout(() => {
        const llm_chat_context = document.getElementById('llm_chat_context'); // Select the div by its ID
        const temp_history_text = document.getElementById('temp_history_text');
        let current_heigth = window.getComputedStyle(llm_chat_context).height
        let rect = temp_history_text.getBoundingClientRect()

        const screenHeight = window.innerHeight;
        let MAX_HEIGHT_OFFSET = screenHeight - 300

        let height = rect.height > MAX_HEIGHT_OFFSET ? MAX_HEIGHT_OFFSET : rect.height

        let PADDING = 14
        let EXTRA = 50
        let total_height = PADDING + EXTRA + height

        total_height = total_height > MAX_HEIGHT_OFFSET ? MAX_HEIGHT_OFFSET : total_height

        if (total_height === MAX_HEIGHT_OFFSET) {
            last_item_elt.value.scrollIntoView({ behavior: 'auto' });
        }

        llm_chat_context.animate([
            { height: current_heigth },
            { height: `${100 + PADDING + EXTRA + height}px` }
        ], {
            duration: 200,
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

watch(dim_store.conversation_history, (new_val, old_val) => {
    if (dim_store.conversation_history.at(-1).user === 'human') {
        with_last_transition.value = true
        wait_for_element('.human-item').then((elt) => {
            update_llm_last_item_opacity(elt)
        })
    } else {
        if (last_item_elt.value === null || last_item_elt.value === undefined) {
            with_last_transition.value = true
            wait_for_element('.ai-item').then((elt) => {
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
    onBlur({ editor, event }) {
        // editor_type_active.value = ''
        // temp_save_editor_content.value = editor.getHTML()
    },
    onTransaction: ({ editor, transaction }) => {
    },
});


const debounced_search = debounce((request) => {
    apiClient.post("https://localhost:8002/v1/api/search_weaviate/", 
    { selected_clt: dim_store.selected_clt, request: request })
    .then(response => {
        console.log('response: ', response)
        search_results.value = response.data
    })
  }, 600);

  

const editor2 = useEditor({
    extensions: [
        StarterKit.configure({ codeBlock: false }),
        KeyHandler,
        // EnterKeyHandler,
        // UpAndDownKeyHandler,
        TiptapCodemirrorExtension,
    ],
    content: '',
    editorProps: {
        attributes: {
            spellcheck: "false"
        }
    },
    attributes: {
        spellcheck: "false"
    },
    onUpdate: ({ editor }) => {

        let html = editor.getText()
        if (html !== '') {
            debounced_search(html)
        } else {
            search_results.value = []
        }
    },
    onBlur({ editor, event }) {
        // temp_save_editor_content.value = editor.getHTML()
        // if (editor.getText() === '') {
        //     editor_type_active.value = ''
        // }
    },
    onTransaction: ({ editor, transaction }) => {
    },
});


watch(() => editor_type_active.value, ()=> {
    
    if (editor_type_active.value === 'search') {
        requestAnimationFrame(()=> {
            editor_ref_search.value.editor.commands.focus()
        })
    } else if (editor_type_active.value === 'ai') {
        requestAnimationFrame(()=> {
            editor_ref.value.editor.commands.focus()
        })
    }
})

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
    /* padding-bottom: 10px; */
    padding-left: 20px !important;
    height: 40px;
    min-width: 100px;
    align-content: center;
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
    cursor: pointer;
}

.chevron-llm-history:hover {
    opacity: 1;
}

.human-item {
    opacity: 0;
}







#fmw-scroll-div::-webkit-scrollbar {
    display: none;
}

#fmw-scroll-div {
    scrollbar-width: none;
}

#fmw-scroll-div {
    -ms-overflow-style: none;
}


.fmw-search-list-item {
    transition: background-color 0.2s;
}

.fmw-search-list-item:hover {
    /* background-color: #F1E6FF; */
    background-color: rgba(238, 234, 230, 0.4);
    /* border-radius: 10px; */
}
</style>
