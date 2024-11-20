<template>
    <div 
        style="z-index:10;padding-top:12vh;padding-left:3vh">
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
// import { Markdown } from 'tiptap-markdown';
import Link from '@tiptap/extension-link'
import ButtonNode from '@/components_shared/ButtonExtension.js';
import RefBadge from '@/components_shared/RefBadgeExtension.js';
// import InputRules from '@tiptap/extension-input-rules';
import { Plugin } from 'prosemirror-state';

const dim_store = dimStore()
const lowlight = createLowlight(all)


const editor = useEditor({
    extensions: [
    ButtonNode,
    RefBadge,
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
    // content: 'fsf ds dsfdsfdfds',
    // content: 'ss<button-node name="content"></button-node>',
    content: dim_store.html_content,
    onUpdate: ({ editor }) => {
        let html = editor.getHTML()
        if (html !== dim_store.html_content) {
            dim_store.html_content = html
        }
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
  console.log('ddd')
  editor.value.commands.toggleButton();

  // if (dim_store.show_refs) {
  //   console.log('aaaa')
  //   editor.value.commands.toggleButton();
  // } else {
  //   editor.value.commands.toggleButton({ showButton: false });
  // }
})




// const addButtons = () => {
//       editor.commands.toggleButton({ showButton: true });
//     };

//     const removeButtons = () => {
//       editor.commands.toggleButton({ showButton: false });
//     };



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
</style>









<!-- Markdown.configure({
  html: true,                  // Allow HTML input/output
  tightLists: true,            // No <p> inside <li> in markdown output
  tightListClass: 'tight',     // Add class to <ul> allowing you to remove <p> margins when tight
  bulletListMarker: '-',       // <li> prefix in markdown output
  linkify: true,              // Create links from "https://..." text
  breaks: true,               // New lines (\n) in markdown input are converted to <br>
  transformPastedText: true,  // Allow to paste markdown text in the editor
  transformCopiedText: true,  // Copied text is transformed to markdown
})


import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DOMParser } from '@tiptap/pm/model';

const MarkdownClipboard = Extension.create({
    name: 'markdownClipboard',
    addOptions() {
        return {
            transformPastedText: true,
            transformCopiedText: true,
        }
    },
    addProseMirrorPlugins() {

      function elementFromString(value) {
    // add a wrapper to preserve leading and trailing whitespace
    const wrappedValue = `<body>${value}</body>`

    return new window.DOMParser().parseFromString(wrappedValue, 'text/html').body
}

      return [
            new Plugin({
                key: new PluginKey('markdownClipboard'),
                props: {
                    clipboardTextParser: (text, context, plainText) => {
                      console.log('JJJJJ')
                        // if(plainText || !this.options.transformPastedText) {
                        //     return null; // pasting with shift key prevents formatting
                        // }
                        const parsed = this.editor.storage.markdown.parser.parse(text, { inline: true });
                        return DOMParser.fromSchema(this.editor.schema)
                            .parseSlice(elementFromString(parsed), {
                                preserveWhitespace: true,
                                context,
                            });
                    },
                    /**
                     * @param {import('prosemirror-model').Slice} slice
                     */
                    clipboardTextSerializer: (slice) => {
                        // if(!this.options.transformCopiedText) {
                        //   console.log()
                        //     return null;
                        // }
                        console.log('slice.content', slice.content)
                        return this.editor.storage.markdown.serializer.serialize(slice.content);
                    },
                },
            })
        ]
    }
}) -->
