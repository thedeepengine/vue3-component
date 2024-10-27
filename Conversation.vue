<template>
    <div class="parent">
        <div style="backdrop-filter: blur(10px);background-color: transparent;border-bottom: 2px solid #d4af37;">
            <div style="background-color: transparent;">
                <editor-content class="editor" @animationend="handleAnimationEnd" ref="editor_ref"
                    id="conversation_tiptap" style="padding:10px;" :editor="editor" />
            </div>
        </div>
    </div>



    <!-- <div ref="parent" class="parent">
        <div class='child'>
            <n-grid class="conv-container" :cols="1">
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

                </n-gi>
            </n-grid>
        </div>
    </div>
     -->
</template>

<script setup>
import { NInput, NGi, NGrid, NButton, NSpace, NButtonGroup, NIcon, NPopover } from 'naive-ui'
import { onMounted, ref, watch, onBeforeUnmount } from 'vue';
import { nextTick } from 'vue';
import { dimStore } from '@/components_shared/dimStore.js'

import { useEditor, Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { markdownToHtml } from '@/components_shared/utils.js'
import { Underline as OriginalUnderline } from '@tiptap/extension-underline'
import Mention from '@tiptap/extension-mention'
// import { get_mention_options } from '@/components_shared/suggestion.js'
import suggestion from '@/components_shared/suggestion.js'

const gg = ref(null)
const history_ref = ref(null)
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


import { useEventBus } from '@/components_shared/event_bus';
const { on, emit } = useEventBus();
import { Extension } from '@tiptap/core'


function matching_clt(str, clt_ctx) {
  const result = [];
  for (const key in clt_ctx) {
    if (clt_ctx[key].includes(str)) {
      result.push(key);
    }
  }
  return result.length > 0 ? result : undefined;
}

const EnterKeyHandler = Extension.create({
    name: 'enterKeyHandler',

    addKeyboardShortcuts() {
        return {
            'Enter': () => {
                submit()
                return true; // Return false to let the editor handle the Enter key normally
            }
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

const Underline = OriginalUnderline.extend({
    addAttributes() {
        return {
            style: {
                default: "text-decoration: underline; text-decoration-color: lightgreen;",
                parseHTML: element => element.style.cssText,
                renderHTML: attributes => {
                    return { style: attributes.style }
                },
            }
        };
    }
});

// const editor = useEditor({
//     extensions: [
//         StarterKit,
//         EnterKeyHandler,
//         ShiftEnterHandler,
//         Underline.configure({
//             HTMLAttributes: {
//                 class: 'light-green-underline'
//             },
//         }),
//     ],
//     content: '<u>aaaaa</u>',
//     editorProps: {
//     attributes: {
//       spellcheck: "false"
//     }
//   },
//     // content: box_input_html.value,
// //     editorProps: {
// //     attributes: {
// //       spellcheck: "false"
// //     }
// //   },
//     // onUpdate: ({ editor }) => {
//     //     let html = editor.getHTML()
//     //     if (html !== box_input_html.value) {
//     //         box_input_html.value = html
//     //     }
//     // },
// });



const editor = useEditor({
    extensions: [
        StarterKit,
        

        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
        // ...get_mention_options(dim_store.allowed_clt_fields)
          suggestion,
        }),


        Underline.extend({
            addAttributes() {
                return {
                    class: {
                        default: 'green-underline',
                        renderHTML: attributes => {
                            return {
                                class: attributes.class,
                            }
                        }
                    }
                }
            }
        })
    ],
    // content: `
    //     <p>
    //         <u class="green-underline">Green underlined text</u> 
    //         <u class="red-underline">Red underlined text</u>
    //     </p>
    // `,
    content: '',
    editorProps: {
        attributes: {
            spellcheck: "false"
        }
    },
    onUpdate: ({ editor }) => {
        console.log('dddd', editor.getText())
        let input = editor.getText()
        let m = matching_clt(input, dim_store.allowed_clt_fields)
        console.log('m----- ', m)

        

        // let html = editor.getHTML()
        // if (html !== box_input_html.value) {
        //     box_input_html.value = html
        // }
    },
});


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

    watch(() => dim_store.shared_popup_text, () => {
        add_message_to_history(dim_store.shared_popup_text, 'human')
    })
})

function submit() {
    toggleAnimation(editor_ref.value.$el, 'blur')
}

function toggleAnimation(element, type) {
    element.classList.remove('blur', 'unblur');
    element.classList.add(type);
}

const handleAnimationEnd = async (role) => {
    editor_ref.value.$el.classList.remove('blur', 'unblur')
    add_message_to_history('box_input.value', 'human')
    show_new_history_message('box_input.value')
    dim_store.user_input = getTextContent(box_input_html.value).trim()
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
    // const element2 = history_ref.value?.querySelector('.history-context > div:last-child > .n-space');
    // let height = measureTextHeightWithinContainer(message);
    // document.documentElement.style.setProperty('--item-height', '40px');
    // toggleAnimation(element2, 'unblur')
}

const handleAnimationEndNewItem = (role) => {
    history.value[history.value.length - 1]['type'] = 'regular'
    if (role === 'human' && llm_model.value !== undefined) {
        add_message_to_history('_', 'ai')
        show_new_history_message('')
    }
}

const add_message_to_history = async (message, role) => {
    history.value.push({ message: message, user: role, type: 'last' })
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


.inputrc {
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

.parent {
    z-index: 999999999999999999999;
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

</style>