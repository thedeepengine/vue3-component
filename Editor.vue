<template>
  <div v-if="dim_store.left_panel === 'editor'" 
  id="editor-panel-container"
  style="z-index:10;padding-left:3vw;padding-bottom:120px;opacity: 0.01;padding-top:var(--general-padding-top)">
    <div style="width: 100%;">
      <div class="editor-content-type" style="width:fit-content;margin:auto">

        <!-- tiptap button -->
        <n-popover trigger="hover" placement="top">
          <template #trigger>
            <span class="fmw-button-icon" :class="{ selected: dim_store.content_type === 'tiptap' }"
              @click="dim_store.content_type = 'tiptap'">
              <n-icon :component="AlignLeft24Regular" color="#4c5467" size="24"></n-icon>
            </span>
          </template>
          <template #header>
            <n-text style="z-index: 9999999999;" strong depth="1">
              <n-button @click="dim_store.show_refs = dim_store.show_refs === true ? false : true">refs</n-button>
            </n-text>
          </template>
        </n-popover>

        <!-- html button -->
        <span class="fmw-button-icon" :class="{ selected: dim_store.content_type === 'html' }"
          @click="dim_store.content_type = 'html'">
          <n-icon :component="DocumentChevronDouble24Regular" color="#4c5467" size="24"></n-icon>
        </span>
        <!-- markdown button -->
        <span class="fmw-button-icon" :class="{ selected: dim_store.content_type === 'markdown' }"
          @click="dim_store.content_type = 'markdown'">
          <svg fill="#4c5467" width="24px" height="24px" viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M593.8 59.1H46.2C20.7 59.1 0 79.8 0 105.2v301.5c0 25.5 20.7 46.2 46.2 46.2h547.7c25.5 0 46.2-20.7 46.1-46.1V105.2c0-25.4-20.7-46.1-46.2-46.1zM338.5 360.6H277v-120l-61.5 76.9-61.5-76.9v120H92.3V151.4h61.5l61.5 76.9 61.5-76.9h61.5v209.2zm135.3 3.1L381.5 256H443V151.4h61.5V256H566z" />
          </svg>
        </span>
      </div>
    </div>


    <Transition name="fade" mode="out-in">
      <editor-content v-if="dim_store.content_type === 'tiptap'" id="dimension_tiptap" :editor="editor" key="tiptap-editor" />
      <Graphql v-else-if="dim_store.content_type === 'html'" key="html"></Graphql>
      <MarkdownEditor v-else-if="dim_store.content_type === 'markdown'" key="markdown"></MarkdownEditor>
      <!-- <GraphqlInput v-else-if="dim_store.content_type === 'graphql'" key="graphql"></GraphqlInput> -->
    </Transition>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted, onBeforeUnmount, watch, onUnmounted, onActivated, onDeactivated } from 'vue'
import { useEditor, Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight'
import { CustomHeading, getTrackHeadingsExtension, TripleBacktickLogger } from '@/components_shared/tiptap_custom.js'
import { dimStore } from '@/components_shared/dimStore'
import { md_to_html, fmw_transition } from '@/components_shared/utils.js'
import Link from '@tiptap/extension-link'
import ButtonNode from '@/components_shared/ButtonExtension.js';
import Mention from '@tiptap/extension-mention'
import suggestion from '@/components_shared/suggestion.js'
import { NIcon, NPopover, NButton, NText } from 'naive-ui'
import { DocumentChevronDouble24Regular, AlignLeft24Regular } from '@vicons/fluent'
import Graphql from '@/components_shared/Graphql.vue'
import GraphqlInput from './GraphqlInput.vue';
import { DOMSerializer } from 'prosemirror-model';
// import { Plugin } from 'prosemirror-state';
import { Plugin, PluginKey } from 'prosemirror-state';
import { useEventBus } from '@/components_shared/event_bus';
import MarkdownEditor from './MarkdownEditor.vue';
const { on, emit } = useEventBus();

const dim_store = dimStore()
const lowlight = createLowlight(all)
const debounceTimer = ref(null);

let maxRetries;
let retries;

const is_editor_ready = ref(false);

const checkElement = () => {
    const element = document.querySelector('.tiptap.ProseMirror');
    if (element) {
      is_editor_ready.value = true;
    } else if (retries < maxRetries) {
        retries++;
        setTimeout(checkElement, 100);
    }
};

onActivated(() => {
    maxRetries = 10;
    retries = 0;
    checkElement()

    if (dim_store.temp_save_content !== undefined) {
        dim_store.html_content = dim_store.temp_save_content.html
        editor.value.commands.setContent(dim_store.temp_save_content.html);
        dim_store.temp_save_content = undefined
    }

});


onMounted(() => {
  on('things_space_scroll_to', (message) => {
    addClassToHeadingById(message.uuid_front, message.action_type);
  });

  on('set_editor_content', (message) => {
    editor.value.commands.setContent(md_to_html(message));
  });
});


const findNearestHeading = (editor) => {
  let position = editor.state.selection.$from.pos;

  while (position > 0) {
    const $pos = editor.state.doc.resolve(position);
    const node = $pos.nodeBefore;
    if (node && node.type.name === 'vueComponent') {
    }
    if (node && node.type.name === 'heading') {
      return;
    }
    position--;
  }
};

const add_mention_to_heading = () => {
  const { tr } = editor.value.state;
  const insertions = [];

  editor.value.state.doc.descendants((node, pos) => {    
    if (node.type.name === 'heading' && node.attrs['data-side'] !== 'center' && node.attrs['data-parent-ref'] !== '') {
      const mentionNode = editor.value.schema.nodes.mention.create({
        label: node.attrs['data-parent-ref'] 
      });
      insertions.push({ pos: pos + 1, node: mentionNode }); // +1 to insert at the beginning of the heading content
    }
  });

  for (let i = insertions.length - 1; i >= 0; i--) {
    const { pos, node } = insertions[i];
    tr.insert(pos, node);
  }

  if (!tr.steps.length) return;

  editor.value.view.dispatch(tr);
};


const remove_mention_from_headings = (dispatch_to_front = true) => {
  const { tr } = editor.value.state;
  let deletions = [];
  editor.value.state.doc.descendants((node, pos) => {
    if (node.type.name === 'mention') {
      const parentNode = editor.value.state.doc.resolve(pos).parent;
      const parentPos = editor.value.view.state.doc.resolve(pos).before();

      tr.setNodeMarkup(parentPos, undefined, {
          ...parentNode.attrs,
          'data-parent-ref': node.attrs.label
        });

      if (parentNode.type.name === 'heading') {
        deletions.push({ pos, size: node.nodeSize });
      }
    }
  });

  for (let i = deletions.length - 1; i >= 0; i--) {
    const { pos, size } = deletions[i];
    tr.delete(pos, pos + size);
  }

  if (!tr.steps.length) return;
  if (dispatch_to_front) {
    editor.value.view.dispatch(tr);
  } else {
    return tr
  }
};

const trackMentionDeletionsKey = new PluginKey('trackMentionDeletions');

const trackMentionDeletionsPlugin = new Plugin({
  key: trackMentionDeletionsKey,
  appendTransaction(transactions, oldState, newState) {
    transactions.forEach(transaction => {
      if (!transaction.docChanged) {
        return;
      }
      transaction.steps.forEach(step => {
        step.getMap().forEach((oldStart, oldEnd) => {
          oldState.doc.nodesBetween(oldStart, oldEnd, (node, pos) => {
            if (node.type.name === 'mention') {
              console.log(`Potential mention deletion detected at position ${pos} with content: ${node.textContent}`);
            }
          });
        });
      });
    });
  }
});


const editor = useEditor({
  extensions: [
    Mention.configure({
      HTMLAttributes: {
        class: 'mention',
      },
      suggestion,
    }),
    ButtonNode,
    Link,
    StarterKit.configure({
      heading: false,
      codeBlock: false
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    CustomHeading,
    getTrackHeadingsExtension(dim_store, dim_store.html_content),
    trackMentionDeletionsPlugin,
    
  ],
  content: dim_store.html_content,
  onUpdate: ({ editor }) => {

    if (dim_store.is_dirty === false) {
      dim_store.is_dirty = true
    }

    // let html = editor.getHTML()
    let html = dim_store.show_refs ? clean_html() : editor.getHTML()
    if (html !== dim_store.html_content) {
        dim_store.html_content = html
    }

    if (dim_store.refresh_map) {
      dim_store.html_to_hierarchy(html)
      dim_store.refresh_map = false
    }

    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
    }

    if (editor.state.doc.content.leg)
      debounceTimer.value = setTimeout(() => findNearestHeading(editor), 300);
  },
  // editorProps: {
  //   handlePaste(view, event, slice) {
  //     const markdownContent = event.clipboardData.getData('text/plain');
  //     const htmlContent = md_to_html(markdownContent);
  //     editor.value.commands.insertContent(htmlContent);
  //     return true;
  //   }
  // }
});


onDeactivated(()=> {
  is_editor_ready.value = false
})

onMounted(() => {
  watch(is_editor_ready, () => {
    if (is_editor_ready.value) {
        dim_store.is_comp_mounted.editor = true
        fmw_transition('#editor-panel-container', 'show')
    }
  })

  watch(() => dim_store.md_content, (newValue) => {
    // console.log(' && editor.value.getHTML() !== newValue', editor.value.getHTML() !== newValue)
    // !dim_store.is_dirty && 
    if (editor.value && dim_store.md_content !== '' && dim_store.md_content !== undefined) {
      dim_store.html_content = md_to_html(newValue)
      editor.value.commands.setContent(dim_store.html_content);
    }
  }, { immediate: true });

  watch(() => dim_store.show_refs, (n, o) => {
    if (n) {
      add_mention_to_heading()
    } else {
      remove_mention_from_headings()
    }
  })

  
});

onUnmounted(() => {
  // dim_store.is_comp_mounted.editor = false
})

function addClassToHeadingById(headingId, action_type) {
  const { tr } = editor.value.state;
  let updated = false;

  tr.doc.descendants((node, pos) => {
    if (node.type.name === 'heading' && node.attrs.id === headingId && updated === false) {
      let newAttrs = node.attrs;

      if (action_type === 'add') {
        newAttrs = {
          ...node.attrs,
          class: 'highlight-background'
        }
      } else {
        newAttrs = { ...node.attrs, class: '' }
      }


      tr.setNodeMarkup(pos, null, newAttrs);
      updated = true;
    }
  });

  if (updated) {
    editor.value.view.dispatch(tr);
  }
}











function clean_html() {
  function getHtmlFromState(state) {
    const div = document.createElement('div');
    const serializer = DOMSerializer.fromSchema(editor.value.schema);
    const fragment = serializer.serializeFragment(state.doc.content);
    div.appendChild(fragment);
    return div.innerHTML;
  }

  let tr = remove_mention_from_headings(false)
  const newState = editor.value.state.apply(tr);
  const newHtml = getHtmlFromState(newState);
  return newHtml
}

watch(() => dim_store.refresh_save_page, () => {
  if (dim_store.dimension === 'hierarchy') {
    
    dim_store.temp_save_content = {html: dim_store.html_content}
    
    dim_store.commit(true)
    .then(response => {
        dim_store.transaction_list = response.data.transaction_list
      })
  }

  dim_store.dimension = 'save';
})

onBeforeUnmount(() => {
  if (editor) {
    editor.value.destroy();
  }
});

watch(() => dim_store.content_type, () => {
  if (dim_store.content_type === 'html') {
    dim_store.code = dim_store.html_content
  } else if (dim_store.content_type === 'graphql') {
    dim_store.code = dim_store.graphql
  }
})

watch(() => dim_store.loading_flag, () => {
  if (dim_store.left_panel === 'editor' && dim_store.loading_flag === true) {
    fmw_transition('#editor-panel-container', 'hide')
  }
})

</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
#dimension_tiptap .tiptap {
  height: auto;
  /* backdrop-filter: blur(10px); */
}

#dimension_tiptap .tiptap:focus {
  outline: none !important;
}
</style>



<style lang="scss">
@keyframes backgroundColorChange {
  0% {
    // background-color: #f9f7f5;
    background-color: #f9f7f5;
  }

  50% {
    // background-color: #F1E6FF;
    background-color: #d4af379e;
  }

  100% {
    background-color: #f9f7f5;
  }
}


.highlight-background {
  animation: backgroundColorChange 1s forwards;
}

#dimension_tiptap .tiptap {
  height: 65vh;
}

/* Basic editor styles */
.tiptap {

  :first-child {
    margin-top: 0;
  }

  pre {
    background: black;
    border-radius: 0.5rem;
    color: white;
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }

    /* Code styling */
    .hljs-comment,
    .hljs-quote {
      color: #616161;
    }

    .hljs-variable,
    .hljs-template-variable,
    .hljs-attribute,
    .hljs-tag,
    .hljs-name,
    .hljs-regexp,
    .hljs-link,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class {
      color: #f98181;
    }

    .hljs-number,
    .hljs-meta,
    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-literal,
    .hljs-type,
    .hljs-params {
      color: #fbbc88;
    }

    .hljs-string,
    .hljs-symbol,
    .hljs-bullet {
      color: #b9f18d;
    }

    .hljs-title,
    .hljs-section {
      color: #faf594;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      color: #70cff8;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: 700;
    }
  }
}


.tiptap .mention {
  // :first-child {
  //   margin-top: 0;
  // }

  background-color: #F1E6FF;
  border-radius: 0.4rem;
  box-decoration-break: clone;
  color: #420099;
  padding: 0.1rem 0.3rem;

}

.fmw-button-icon {
  width: fit-content;
  margin: auto;
  padding-right: 8px;
  padding-left: 8px;
  opacity: 0.1;
  transition: opacity 0.25s;
  cursor: pointer;
}

.fmw-button-icon.selected {
  opacity: 1;
}



.editor-content-type {
  opacity: 0.2;
  transition: opacity 0.25s;
  margin: auto;
  align-content: center;
  height: var(--fmw-left-selector-height);
}

.editor-content-type:hover {
  opacity: 1;
}

.fmw-button-icon:hover {
  opacity: 1;
}
</style>


<!-- 
// dim_store.w_data.children.push({uuid: 'ffff', uuid_front: 'X_GHA_ffff', name: 'ddd'}) 




// function find_path(headings, target) {
//   const path = [];
//   let currentDepth = 0;

//   for (const heading of headings) {
//     const depth = heading.lastIndexOf('#') + 1;

//     if (depth <= currentDepth) {
//       path.splice(depth);
//     }

//     currentDepth = depth;
//     console.log('heading', heading)
//     const headingText = heading.slice(depth + 1).trim();
//     path[depth - 1] = headingText;

    
//     if (headingText === target) {
//       return path
//     }
//   }

//   return 'Title not found';
// }

//     headings = [
//   '# Introduction',
//   '## Overview',
//   '### Goals',
//   '### ',
//   '## Background',
//   '# Main Content',
//   '## Section 1',
//   '### Overview',
//   '#### Details',
//   '##### Specifics',
//   '##### Specifics2',
//   '## h',
//   '##### Specifics3',
//   '##### Specifics4',
//   '#### Further Details',
//   '### Conclusion',
//   '## Section 2',
//   '### Introduction', 
//   '### Analysis',
//   '#### Deep Dive',
//   '## Final Thoughts',
//   '# Conclusion',
//   '## Summary',
//   '## Future Work'
// ];
//     find_path(headings, 'NEW')

//     function addObjectAtPath(root, path, newObj) {

//         function findAndUpdate(current, pathIndex) {
//             if (pathIndex < path.length) {
//                 let nextNode = current.children.find(child => child.uuid_front === path[pathIndex]);
//                 findAndUpdate(nextNode, pathIndex + 1); 
//             } else {
//                 if (!current.children) {
//                     current.children = []; 
//                 }
//                 current.children.push(newObj);
//                 return true
//             }
//         }
    
//       let pathIndex = 0
//       if (root.uuid_front === path[pathIndex]) {
//           return findAndUpdate(root, pathIndex+1); 
//       }
//       return false
// }




// console.log('headings', headings)


// let path = find_path(headings, '!TEMP_TARGET_FMW_FRONT_!')
// console.log('FOUND PATH: ', path)
// let is_updated = addObjectAtPath(dim_store.w_data, path.slice(0,-1), {uuid: 'ffff', uuid_front: 'X_GHA_ffff', name: 'ddd'})
// console.log('dim_store.w_ddddata', dim_store.w_data)
// console.log('is_updated', is_updated)
// if (is_updated) {
// }
 -->
