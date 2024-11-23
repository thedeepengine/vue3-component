<template>
  <div style="z-index:10;padding-top:12vh;padding-left:3vh">
    <editor-content id="dimension_tiptap" :editor="editor" />
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

// import { update_node_property, compute_and_draw_tree, displayStaticTree } from '@/components_shared/network/network_utils.js'


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
