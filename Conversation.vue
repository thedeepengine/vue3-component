<template>
    <div id="conversation_panel"  style="border-bottom: 2px solid #d4af37;transition: transform 0.3s ease;" class="parent" @keydown.esc="onClickoutside">
        <div style="backdrop-filter: blur(10px);background-color: transparent;">
            <div style="background-color: transparent;display:flex">
                <div style="flex-grow: 1">
                    <editor-content class="editor" @animationend="handleAnimationEnd" ref="editor_ref"
                        id="conversation_tiptap" style="padding:10px;" :editor="editor" />
                </div>
                <div 
                @click="graphql_search_panel"
                style="cursor: pointer;flex-grow: 0;align-content: center;width: 22px;height:22px;margin:auto;margin-right:3vh;">
                    <svg fill="#4c5467" width="22px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M18.734 3.667l6.578 3.802c1.089-1.146 2.901-1.193 4.047-0.104 0.193 0.188 0.365 0.401 0.5 0.635 0.786 1.37 0.313 3.12-1.063 3.906-0.229 0.13-0.479 0.234-0.745 0.297v7.599c1.531 0.365 2.474 1.896 2.109 3.427-0.063 0.271-0.172 0.531-0.307 0.771-0.792 1.365-2.536 1.833-3.906 1.042-0.26-0.146-0.5-0.344-0.698-0.568l-6.542 3.776c0.495 1.495-0.318 3.109-1.813 3.604-0.292 0.099-0.594 0.146-0.896 0.146-1.573 0-2.854-1.271-2.854-2.849 0-0.271 0.042-0.547 0.12-0.813l-6.583-3.797c-1.089 1.141-2.896 1.188-4.036 0.094-1.135-1.089-1.177-2.891-0.094-4.031 0.38-0.396 0.865-0.677 1.396-0.807v-7.599c-1.531-0.365-2.479-1.906-2.109-3.443 0.063-0.266 0.167-0.521 0.302-0.755 0.786-1.365 2.536-1.833 3.901-1.042 0.234 0.135 0.453 0.302 0.641 0.5l6.583-3.797c-0.448-1.51 0.417-3.099 1.922-3.542 0.26-0.083 0.536-0.12 0.813-0.12 1.573 0 2.854 1.271 2.854 2.844 0 0.281-0.042 0.557-0.12 0.823zM18.047 4.839c-0.026 0.026-0.047 0.052-0.078 0.078l8.615 14.917c0.036-0.010 0.078-0.021 0.109-0.031v-7.609c-1.526-0.375-2.453-1.922-2.073-3.448 0.005-0.031 0.016-0.068 0.021-0.099zM14.026 4.917l-0.078-0.078-6.594 3.802c0.438 1.51-0.438 3.089-1.948 3.526-0.036 0.010-0.068 0.016-0.104 0.026v7.609l0.115 0.031 8.615-14.917zM16.797 5.594c-0.521 0.146-1.073 0.146-1.589 0l-8.615 14.917c0.391 0.375 0.667 0.859 0.802 1.391h17.214c0.13-0.531 0.406-1.016 0.802-1.396zM18.109 27.229l6.552-3.786c-0.021-0.063-0.036-0.125-0.052-0.188h-17.219l-0.031 0.109 6.589 3.802c0.516-0.536 1.245-0.87 2.052-0.87 0.839 0 1.589 0.359 2.109 0.932z" />
                    </svg>
                </div>
            </div>
        </div>
    </div>

    <n-dropdown placement="bottom-start" trigger="manual" style="z-index: 999999999999999999;" :x="menuPosition.left"
        :y="menuPosition.top" :options="menu_options" :show="show_menu" :on-clickoutside="onClickoutside"
        @select="selectOption" @keydown.esc="onClickoutside" />

</template>

<script setup>
import { NDropdown } from 'naive-ui'
import { onMounted, onUnmounted, ref, watch, onBeforeUnmount, computed } from 'vue';
import { nextTick } from 'vue';
import { dimStore } from '@/components_shared/dimStore.js'

import { useEditor, Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { md_to_html } from '@/components_shared/utils.js'
import { Underline as OriginalUnderline } from '@tiptap/extension-underline'


const gg = ref(null)
const history_ref = ref(null)
const conv_menu = ref(null)
const box_input = ref('')
const box_input_html = ref('')
const box_input_md = ref('')
const history = ref([])
const dim_store = dimStore()
const textarea_element = ref(null)
const trick_empty_string = ref(1)
const streaming_mode = ref('opacity')
const words = ref(['_']);
const llm_model = ref(undefined)
const editor_ref = ref()

const parent = ref('parent')

// Reactive state for menu 
const menu_options = ref([])
const show_menu = ref(false);
const menuPosition = ref({ top: 0, left: 0 });
const selected_option = ref(null);
const last_index = ref(null);


import { useEventBus } from '@/components_shared/event_bus';
const { on, emit } = useEventBus();
import { Extension } from '@tiptap/core'


const screenHeight = ref(window.innerHeight);

const computedHeight = computed(() => {
    console.log('recomputed')
    if (dim_store.conv_full_screen) {
        return `translate(-46%,${screenHeight.value-70}px)`
    } else {
        return 50;
    }
});


function updateHeight() {
    console.log('aaajjjjj', window.innerHeight)
    screenHeight.value = window.innerHeight;
  }

onMounted(() => {
  window.addEventListener('resize', updateHeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateHeight);
});

function graphql_search_panel() {
    // :class="{'full-screen': dim_store.conv_full_screen}"
    // :style="{ height: computedHeight + 'px' }"
    let conv_elt = window.document.getElementById('conversation_panel')

    dim_store.conv_full_screen = (dim_store.conv_full_screen ? false : true)
    if (dim_store.conv_full_screen) {
        
        console.log('aaaaa', screenHeight.value)

    console.log('computedHeight', computedHeight.value)
    // conv_elt.style.height = screenHeight.value-100
    // conv_elt.style.transform = computedHeight.value;
    // conv_elt.style.
    // element.style.transform = 'translate(50px, 50px)';

    dim_store.content_type = 'graphql'
    } else {
        // conv_elt.style.transform = 'translate(0, 0)';
        dim_store.content_type = 'hierarchy'
    }

}

function onClickoutside() {
    show_menu.value = false
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

const selectOption = (key, option) => {
    if (!editor) return;
    editor.value.commands.deleteRange({ from: last_index.value + 1, to: editor.value.state.selection.from })
    editor.value.commands.insertContent(option['field'])
    editor.value.commands.focus();
    selected_option.value = option['field']
    show_menu.value = false;
};

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
        editor.value.destroy();
    }
});

onMounted(() => {
    on('need_history', (idx) => {
        let message = history.value[history.value.length - idx]?.message
        emit('history', message)
    });
});

onMounted(() => {
    // textarea_element.value = gg.value?.$el.querySelector('.n-input__textarea.n-scrollbar');
    // editor_ref.value = gg.value?.$el.querySelector('.n-input__textarea.n-scrollbar');

    watch(() => dim_store.stream_status, (newValue, oldValue) => {
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

    watch(() => dim_store.shared_popup_text, () => {
        add_message_to_history(dim_store.shared_popup_text, 'human')
    })
})

function submit() {
    if (dim_store.selected_clt === '') {
        dim_store.bus_event = 'header.show_clt_options' + Math.random().toString(36).substring(2, 6)
    } else {
        toggleAnimation(editor_ref.value.$el, 'blur')
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
    dim_store.conversation_history.value = history.value
}


const handleAnimationEndNewItem = (role) => {
    history.value[history.value.length - 1]['type'] = 'regular'
    if (role === 'human' && llm_model.value !== undefined) {
        add_message_to_history('_', 'ai')
        show_new_history_message('')
    }
}



function measureTextHeightWithinContainer(text) {
    const container = document.querySelector('#conversation_tiptap');
    // const tempElement = document.createElement('div');
    // tempElement.textContent = text;
    // Object.assign(tempElement.style, { visibility: 'hidden', position: 'absolute', top: '0', left: '0', width: '100%' });
    // container.appendChild(tempElement);
    // const height = tempElement.getBoundingClientRect().height;
    // container.removeChild(tempElement);
    let height = container.offsetHeight
    return height;
}
</script>

<style>
#conversation_tiptap {
    width: 100%;
}

#conversation_tiptap .tiptap {
    width: 100%;
    /* backdrop-filter: blur(10px);
background-color: transparent; */
}

#conversation_tiptap .tiptap:focus {
    outline: none !important;
}

.suggestion-menu-active {
    background-color: grey;
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

.parent {
    z-index: 999;
    width: 50%;
    left: 25vw;
    position: fixed;
    top: 0;
    margin: 0 auto;
}

.child {
    background-color: transparent;
    position: absolute;
    width: 100%;
    bottom: 0;
    box-sizing: border-box;
}

.green-underline {
    text-decoration-color: #9fd698
        /* Custom color for the underline */
}


.red-underline {
    text-decoration-color: red
        /* Custom color for the underline */
}


.mention {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    box-decoration-break: clone;
    color: var(--purple);
    padding: 0.1rem 0.3rem;
}



.full-screen {
  background-color: lightblue; 
  transition: height 1s ease;
}



</style>