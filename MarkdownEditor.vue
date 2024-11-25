<template>
  <div style="z-index:10;padding-top:12vh;padding-left:3vh">
    <div style="width: 100%;transform: translate(0,25%)">
      <div class="editor-content-type" style="width:fit-content;margin:auto">
        <span class="fmw-button-icon" :class="{selected: dim_store.content_type === 'tiptap'}" 
        @click="dim_store.content_type = 'tiptap'">
          <n-icon :component="DrinkToGo24Regular" color="#4c5467" size="24"></n-icon>
        </span>
        <span class="fmw-button-icon" :class="{selected: dim_store.content_type === 'html'}" 
        @click="dim_store.content_type = 'html'">
          <n-icon :component="DocumentChevronDouble24Regular" color="#4c5467" size="24"></n-icon>
        </span>
        <span class="fmw-button-icon" :class="{selected: dim_store.content_type === 'graphql'}" 
        @click="dim_store.content_type = 'graphql'">
          <svg fill="#4c5467" width="24px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18.734 3.667l6.578 3.802c1.089-1.146 2.901-1.193 4.047-0.104 0.193 0.188 0.365 0.401 0.5 0.635 0.786 1.37 0.313 3.12-1.063 3.906-0.229 0.13-0.479 0.234-0.745 0.297v7.599c1.531 0.365 2.474 1.896 2.109 3.427-0.063 0.271-0.172 0.531-0.307 0.771-0.792 1.365-2.536 1.833-3.906 1.042-0.26-0.146-0.5-0.344-0.698-0.568l-6.542 3.776c0.495 1.495-0.318 3.109-1.813 3.604-0.292 0.099-0.594 0.146-0.896 0.146-1.573 0-2.854-1.271-2.854-2.849 0-0.271 0.042-0.547 0.12-0.813l-6.583-3.797c-1.089 1.141-2.896 1.188-4.036 0.094-1.135-1.089-1.177-2.891-0.094-4.031 0.38-0.396 0.865-0.677 1.396-0.807v-7.599c-1.531-0.365-2.479-1.906-2.109-3.443 0.063-0.266 0.167-0.521 0.302-0.755 0.786-1.365 2.536-1.833 3.901-1.042 0.234 0.135 0.453 0.302 0.641 0.5l6.583-3.797c-0.448-1.51 0.417-3.099 1.922-3.542 0.26-0.083 0.536-0.12 0.813-0.12 1.573 0 2.854 1.271 2.854 2.844 0 0.281-0.042 0.557-0.12 0.823zM18.047 4.839c-0.026 0.026-0.047 0.052-0.078 0.078l8.615 14.917c0.036-0.010 0.078-0.021 0.109-0.031v-7.609c-1.526-0.375-2.453-1.922-2.073-3.448 0.005-0.031 0.016-0.068 0.021-0.099zM14.026 4.917l-0.078-0.078-6.594 3.802c0.438 1.51-0.438 3.089-1.948 3.526-0.036 0.010-0.068 0.016-0.104 0.026v7.609l0.115 0.031 8.615-14.917zM16.797 5.594c-0.521 0.146-1.073 0.146-1.589 0l-8.615 14.917c0.391 0.375 0.667 0.859 0.802 1.391h17.214c0.13-0.531 0.406-1.016 0.802-1.396zM18.109 27.229l6.552-3.786c-0.021-0.063-0.036-0.125-0.052-0.188h-17.219l-0.031 0.109 6.589 3.802c0.516-0.536 1.245-0.87 2.052-0.87 0.839 0 1.589 0.359 2.109 0.932z" />
          </svg>
        </span>
      </div>
    </div>
    <Transition name="component-fade" mode="out-in">
      <editor-content v-if="dim_store.content_type === 'tiptap'" id="dimension_tiptap" :editor="editor" key="tiptap-editor" />
      <Graphql v-else-if="dim_store.content_type === 'html'" key="html"></Graphql>
      <Graphql v-else-if="dim_store.content_type === 'graphql'" key="graphql"></Graphql>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEditor, Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { all, createLowlight } from 'lowlight'
import { CustomHeading, getTrackHeadingsExtension } from '@/components_shared/tiptap_custom.js'
import { dimStore } from '@/components_shared/dimStore'
import { markdownToHtml } from '@/components_shared/utils.js'
import Link from '@tiptap/extension-link'
import ButtonNode from '@/components_shared/ButtonExtension.js';
import Mention from '@tiptap/extension-mention'
import suggestion from '@/components_shared/suggestion.js'
import { NIcon } from 'naive-ui'
import { DocumentChevronDouble24Regular, DrinkToGo24Regular } from '@vicons/fluent'
import Graphql from '@/components_shared/Graphql.vue'

const dim_store = dimStore()
const lowlight = createLowlight(all)


const debounceTimer = ref(null);

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
  ],
  content: dim_store.html_content,
  onUpdate: ({ editor }) => {

    let html = editor.getHTML()
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
  editorProps: {
    handlePaste(view, event, slice) {
      const markdownContent = event.clipboardData.getData('text/plain');
      const htmlContent = markdownToHtml(markdownContent)
      editor.value.commands.insertContent(htmlContent);
      return true;
    }
  }
});

onMounted(() => {
  watch(() => dim_store.md_content, (newValue) => {
    if (editor.value && editor.value.getHTML() !== newValue) {
      dim_store.html_content = markdownToHtml(newValue)
      editor.value.commands.setContent(dim_store.html_content);
    }
  }, { immediate: true });

  watch(() => dim_store.show_refs, () => {
    editor.value.commands.toggleButton();
  })

});


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

</script>

<style>
#dimension_tiptap .tiptap {
  height: 100vh;
}

#dimension_tiptap .tiptap:focus {
  outline: none !important;
}
</style>



<style lang="scss">
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
}

.fmw-button-icon.selected {
  opacity: 1;
}



.editor-content-type {
  opacity: 0.2;
  transition: opacity 0.25s;
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
// displayStaticTree(dim_store)




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
//   displayStaticTree(dim_store)
// }
 -->
