<template>
    <div id="fmw-llm-bar"
        :class="{ home_display_config: dim_store.dimension === 'home', 
        bottom_display_config: dim_store.dimension !== 'home' }">
        <Transition>
            <div v-if="dim_store.show_llm_hist_box" id="shadow-box-container">
                <div @click="close_llm_history" style="width: 100%;justify-items: center;cursor: pointer;">
                    <div>
                        <n-icon :component=DismissCircle20Regular size="24"></n-icon>
                    </div>
                </div>

                <div class="shadow-box">
                    <div v-for="(item, index) in temp_history" :key="index">
                        <div v-if="item.user === 'ai'" style="display: flex;width: 100%;">
                            <div
                                style="width: 0%;background-color: #1F2937;padding-top: 5%;border-radius: 30px;margin-top:10px;margin-bottom:10px">
                            </div>
                            <div style="width: 99.8%;align-items:center;"
                                :class="{ ai_style: item.user === 'ai', human_style: item.user === 'human' }"
                                class="conv_item">
                                {{ item.message }}
                            </div>
                        </div>

                        <div v-if="item.user === 'human'" style="display: flex;width: 100%;">
                            <!-- <div style="width: 10%;background-color: blue">h</div> -->
                            <div style="width: 99.8%;align-items:center;"
                                :class="{ ai_style: item.user === 'ai', human_style: item.user === 'human' }" class="">
                                <div
                                    style="background-color: #eeeae6;border-radius: 5px;padding: 10px;font-weight: 300;">
                                    {{ item.message }}</div>
                            </div>
                            <div
                                style="width: 0%;background-color: #d4af37;padding-top: 5%;border-radius: 30px;margin-top:10px;margin-bottom:10px">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>



        <div>
            <n-grid>
                <n-gi span="24">
                    <n-select 
                    id="fmw-select-clt"
                    :show-checkmark="false"
                    placement="top"
                    size="tiny"
                    placeholder=""
                    v-model:value="dim_store.selected_clt" 
                    @updateShow="on_show_select_clt"
                    :options="clt_options"
                    filterable />
                </n-gi>
                <n-gi span="24" id="fm_input_container">
                    <div style="flex-grow: 1;">
                        <editor-content class="editor" @animationend="handleAnimationEnd" ref="editor_ref"
                            style="padding:10px;padding-left:23px;flex-grow: 1;" :editor="editor" />
                    </div>
                    <div @click="graphql_search_panel"
                        style="cursor: pointer;flex-grow: 0;align-content: center;width: 22px;height:22px;margin:auto;margin-right:3vh;">
                        <svg fill="#4c5467" width="22px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M18.734 3.667l6.578 3.802c1.089-1.146 2.901-1.193 4.047-0.104 0.193 0.188 0.365 0.401 0.5 0.635 0.786 1.37 0.313 3.12-1.063 3.906-0.229 0.13-0.479 0.234-0.745 0.297v7.599c1.531 0.365 2.474 1.896 2.109 3.427-0.063 0.271-0.172 0.531-0.307 0.771-0.792 1.365-2.536 1.833-3.906 1.042-0.26-0.146-0.5-0.344-0.698-0.568l-6.542 3.776c0.495 1.495-0.318 3.109-1.813 3.604-0.292 0.099-0.594 0.146-0.896 0.146-1.573 0-2.854-1.271-2.854-2.849 0-0.271 0.042-0.547 0.12-0.813l-6.583-3.797c-1.089 1.141-2.896 1.188-4.036 0.094-1.135-1.089-1.177-2.891-0.094-4.031 0.38-0.396 0.865-0.677 1.396-0.807v-7.599c-1.531-0.365-2.479-1.906-2.109-3.443 0.063-0.266 0.167-0.521 0.302-0.755 0.786-1.365 2.536-1.833 3.901-1.042 0.234 0.135 0.453 0.302 0.641 0.5l6.583-3.797c-0.448-1.51 0.417-3.099 1.922-3.542 0.26-0.083 0.536-0.12 0.813-0.12 1.573 0 2.854 1.271 2.854 2.844 0 0.281-0.042 0.557-0.12 0.823zM18.047 4.839c-0.026 0.026-0.047 0.052-0.078 0.078l8.615 14.917c0.036-0.010 0.078-0.021 0.109-0.031v-7.609c-1.526-0.375-2.453-1.922-2.073-3.448 0.005-0.031 0.016-0.068 0.021-0.099zM14.026 4.917l-0.078-0.078-6.594 3.802c0.438 1.51-0.438 3.089-1.948 3.526-0.036 0.010-0.068 0.016-0.104 0.026v7.609l0.115 0.031 8.615-14.917zM16.797 5.594c-0.521 0.146-1.073 0.146-1.589 0l-8.615 14.917c0.391 0.375 0.667 0.859 0.802 1.391h17.214c0.13-0.531 0.406-1.016 0.802-1.396zM18.109 27.229l6.552-3.786c-0.021-0.063-0.036-0.125-0.052-0.188h-17.219l-0.031 0.109 6.589 3.802c0.516-0.536 1.245-0.87 2.052-0.87 0.839 0 1.589 0.359 2.109 0.932z" />
                        </svg>
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
import { nextTick } from 'vue';
import { NIcon, NGrid, NGi, NSelect } from 'naive-ui'
import { DismissCircle20Regular } from '@vicons/fluent'
import { useEventBus } from '@/components_shared/event_bus_promise';

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

const clt_options = computed(() => {
    let distinct = Array.from(new Set(dim_store.allowed_clt_fields.map(x => x.clt)))
    let all = distinct.map(item => ({label: item, value: item}))
    return all
})

// dim_store.allowed_clt_fields.map(item=>({label: item['field'], value: item['field']}))

const temp_history = ref([
    { user: 'human', message: 'Hey' },
    { user: 'ai', message: `In Vue 3, to apply different styles based on the value of item.user, you can modify your class binding to include both conditions directly within the template. Here's how you can adjust your <div> to apply a style for when item.user equals 'ai' and another style for when it equals 'human'` },
    { user: 'human', message: 'I am good thansk and you' },
    { user: 'ai', message: 'I\'m alright. How can I help you today?' }
])


function close_llm_history() {
    const clt_menu = document.getElementById('shadow-box-container');

}


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



function submit() {
    if (dim_store.dimension === 'home') {
        let user_input = editor.value.getText()
        dim_store.one_shot_home = user_input
        add_message_to_history(user_input, 'human')
        dim_store.dimension = 'hierarchy'
        dim_store.left_panel = 'markdown'
    } else {
        if (dim_store.selected_clt === '') {
        dim_store.bus_event = 'header.show_clt_options' + Math.random().toString(36).substring(2, 6)
    } else {
        dim_store.right_panel_message = undefined
        up_down_position.value = 0
        toggleAnimation(editor_ref.value.$el, 'blur')
    }
    }
}

function toggleAnimation(element, type) {
    element.classList.remove('blur', 'unblur');
    element.classList.add(type);
}

const handleAnimationEnd = async (role) => {
    let user_input = getTextContent(box_input_html.value).trim()
    editor_ref.value.$el.classList.remove('blur', 'unblur')
    add_message_to_history(user_input, 'human')
    show_new_history_message('box_input.value')
    dim_store.user_input = user_input
    dim_store.set_all_object_dirty()
    dim_store.fetch_data(dim_store.selected_clt, dim_store.user_input)
    editor.value.commands.setContent('');
};

function getTextContent(htmlString) {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlString;
    return tempElement.innerText || tempElement.textContent;
}


const show_new_history_message = async (message) => {
    await nextTick();
    if (message === '') {
        message = '_'
    }
}

const add_message_to_history = async (message, role) => {
    history.value.push({ message: message, user: role, type: 'last' })
    dim_store.conversation_history = history.value
}


const EnterKeyHandler = Extension.create({
    name: 'enterKeyHandler',
    addKeyboardShortcuts() {
        return {
            'Enter': () => {
                if (show_menu.value === false) {
                    submit()
                }
                return true;
            },
        };
    },
});


const ShiftEnterHandler = Extension.create({
    name: 'shiftEnterHandler',

    addKeyboardShortcuts() {
        return {
            'Shift-Enter': () => {
                this.editor.commands.insertContent('\n'); // Inserts a newline at the cursor position
                return true; // Prevents the default handling to only apply this effect
            }
        };
    },
});


const editor = useEditor({
    extensions: [
        StarterKit,
        EnterKeyHandler,
        // UpAndDownKeyHandler,
        ShiftEnterHandler,
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
        const { state } = editor;
        const selection = state.selection;
        const from = selection.from;

        const all = state.doc.textBetween(0, from, ' ');

        dim_store.user_input = all
    }
});




// const UpAndDownKeyHandler = Extension.create({
//     name: 'UpAndDownKeyHandler',
//     addKeyboardShortcuts() {
//   return {
//     'ArrowDown': () => {
//         console.log('editor htlml,', editor.value.getText())
//         if (editor.value.getText() === '') {
//             if (upDownPosition.value >= 1 && dim_store.conversation_history.value.at(up_down_position.value-1)) {
//                 editor.value.commands.setContent(dim_store.conversation_history.value.at(up_down_position.value-1).message)
//                 upDownPosition.value-=1
//             }
//         }
//       return true;
//     },
//     'ArrowUp': () => {
//       console.log('editor htlml,', editor.value.getText())
//         if (editor.value.getText() === '') {
//             // if (upDownPosition.value < conversation_history.value.length && conversation_history.value.at(upDownPosition.value+1)) {
//             console.log('dim_store.conversation_history: ',dim_store.conversation_history)
//             if (upDownPosition.value < dim_store.conversation_history.length && dim_store.conversation_history.at(up_down_position.value).message) {
//                 console.log('toset', dim_store.conversation_history.at(up_down_position.value).message)
//                 editor.value.commands.setContent(dim_store.conversation_history.at(up_down_position.value).message)
//                 upDownPosition.value+=1
//             }
//         }

//       return true;
//     }
//   }
// }
// });


// function focusout() {
//     if (clt_options.value.length > 1) {
//         clt_options.value = [dim_store?.selected_clt || '+']
//     }
// }


// function set_clt(e) {
//     let single_item_showing = clt_options.value.length === 1
//     let no_clt_selected = clt_options.value[0] === '+'
//     let is_selected_different = e.srcElement.innerText !== clt_options.value[0]
//     if (is_selected_different) {
//         clt_options.value = [e.srcElement.innerText]
//         dim_store.selected_clt = e.srcElement.innerText
//     } else if (single_item_showing || no_clt_selected) {

//         const pattern = /^(\w+)([\.:=])/;
//         const is_metal_query = dim_store.user_input.match(pattern);
//         let matching_clt
//         if (is_metal_query) {
//             let first_word = is_metal_query[1]
//             matching_clt = dim_store.allowed_clt_fields.filter(item => item['field'].toLowerCase().startsWith(first_word.toLowerCase()))
//         } else {
//             matching_clt = dim_store.allowed_clt_fields
//         }

//         matching_clt = Array.from(new Set(matching_clt.map(x => x.clt)))
//         let i = 0
//         matching_clt.sort().forEach(item => {
//             if (!clt_options.value.includes(item)) {
//                 clt_options.value.push(item)
//             }
//         });
//     }
// }

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


// watch(() => dim_store.user_input, (n, o) => {
//     const pattern = /^(\w+)([\.:=])/;
//     const is_metal_query = dim_store.user_input.match(pattern);
//     if (is_metal_query && dim_store.selected_clt === '') {
//         let first_word = is_metal_query[1]
//         show_clt_options(first_word)
//     }
// })

// watch(() => dim_store.bus_event, (n, o) => {
//     if (n.startsWith('header.show_clt_options')) {
//         show_clt_options(dim_store.user_input)
//     }
// })

// function show_clt_options(property_string) {
//     let matching_clt = dim_store.allowed_clt_fields.filter(item => item['field'].toLowerCase().startsWith(property_string.toLowerCase()))
//     matching_clt.forEach(item => {
//         if (!clt_options.value.includes(item.clt)) {
//             clt_options.value.push(item.clt)
//         }
//     });
// }


function on_show_select_clt(state) {
    if (state) {
        select_clt_open.value = true
    } else {
        select_clt_open.value = false
    }
}

// function
</script>


<style>

#fmw-select-clt {
    padding-bottom: 10px;
    padding-left: 20px!important;
    height: 30px;
    min-width: 100px;
    /* width: fit-content; */
}


.n-base-selection {
    max-width:100px!important;
}

/* .n-base-selection-input {
    width:10px;
} */

.n-base-selection.n-base-selection--active {
    max-width:200px!important;
}


#fmw-select-clt .n-base-selection {
    text-align: center;
    --n-text-color: white!important;
    /* --n-color: #1f2937!important; */
    --n-border-focus: none!important;
    --n-border-hover: none!important;
    --n-border-active: none!important;
    --n-border-pressed: none !important;
    outline: none!important;
    border: none!important;
    --n-box-shadow-focus: none !important;
    --n-box-shadow-active: none !important;
    --n-padding-single-right: none!important; 
    background-color: #1f2937!important;
    --n-border: none!important;
}

#fmw-select-clt .n-base-selection-label {
    background-color: #1f2937!important;
    --n-text-color: white!important;
    padding-right:10px;
    padding-left:10px;
}

.n-base-selection:not(.n-base-selection--disabled).n-base-selection--active .n-base-selection-label {
    background-color: #1f2937!important;
}

.n-virtual-list.v-vl {
    border-radius: 5px!important;
}

.v-vl-items {
    --n-color: #f9f7f5!important;
    padding:0!important;
    --n-option-color-pending: none!important;
    border-radius: 5px!important;
}

.n-base-select-menu.n-select-menu {
    --n-color: #f9f7f5!important;
    --n-border-radius: 5px!important;
    border-radius: 5px!important;
    /* --n-option-height: 20px!important; */
}

.n-base-select-option {
    padding: 10px!important;
    padding-top:0px!important;
    padding-bottom:0px!important;
    /* height: 10px!important; */
    background-color: #1f2937;
    --n-color: white!important;
    color:white!important;
    /* --n-option-height: 30px!important; */
}

/* .n-base-select-menu .n-base-select-option {
    min-height: 30px!important;
} */


/* --n-option-color-active */
.n-base-select-option.n-base-select-option--pending {
    /* --n-color: rgb(84, 88, 92)!important; */
    color: var(--gold-color)!important;
    /* --n-option-text-color: rgb(84, 88, 92)!important; */
}

.n-base-select-menu .n-base-select-option.n-base-select-option--selected.n-base-select-option--pending::before {
    background-color: var(--n-option-color-pending);
}


#fmw-select-clt .n-base-loading.n-base-suffix {
 display: none;
 width: 0;
}




/* .field-indicator {
  background-color: #1f2937;
  color: white;
  border-radius: 0.1rem;
  position: relative;
  border: none;
  padding: 2px 25px;
  font-size: 16px;
  cursor: pointer;
  outline: none;
  font-size: 12px;
  font-weight: 300;
} */


.conv_item {
    display: flex;
    padding: 10px;
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
}

.tiptap:focus {
    outline: none !important;
}

.home_display_config {
    position: relative;
    width: 50vw;
    top: 50%;
    z-index: 99999999999;
}

.bottom_display_config {
    transition: left 0.3s;
    position: fixed;
    bottom: 20px;
    left: 25vw;
    width: 47vw;
    margin: auto;
    z-index: 99999999999;
}

/* #fmw-llm-bar {
    transition: left 0.3s;
    position: fixed;
    bottom: 20px;
    left: 25vw;
    width: 47vw;
    margin: auto;
    z-index: 99999999999;
} */

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
    width: 100%;
    height: 300px;
    background: #f9f7f5;
    /* background: #eeeae6; */
    border-radius: 10px;
    box-shadow: -14px -10px 20px #FFFFFF, 11px 15px 20px #C8C8C8;
    padding: 10px;
    padding-left: 20px;
    padding-right: 20px;
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
</style>


