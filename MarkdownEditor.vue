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
