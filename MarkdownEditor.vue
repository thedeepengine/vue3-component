<template>
    <div 
        style="z-index:10;padding-top:12vh;padding-left:3vh">
        <editor-content :editor="editor" />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEditor, Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { CustomHeading, getTrackHeadingsExtension } from '@/components_shared/tiptap_custom.js'

import { marked } from "marked";
import markedKatex from "marked-katex-extension";

import { dimStore } from '@/components_shared/dimStore'

const dim_store = dimStore()

const editor = useEditor({
    extensions: [
        StarterKit.configure({
            heading: false,
        }),
        CustomHeading,
        getTrackHeadingsExtension(dim_store)
    ],
    content: dim_store.html_content,
    onUpdate: ({ editor }) => {
        if (editor.getHTML() !== dim_store.html_content.value) {
            dim_store.html_content = editor.getHTML()
        }
    },
});

onMounted(() => {
    watch(() => dim_store.md_content, (newValue) => {
        console.log('newValue: ', newValue)
        if (editor.value && editor.value.getHTML() !== newValue) {
            dim_store.html_content = markdownToHtml(augmentedRawMarkdown(newValue))
            editor.value.commands.setContent(dim_store.html_content);
        }
    }, { immediate: true });
});

function augmentedRawMarkdown(rawMarkdown) {
    return rawMarkdown.replace(/(^#+.*\{#.*?\})/gm, (match) => match.replace('{#', '{#X'))
} 

onBeforeUnmount(() => {
    if (editor) {
        editor.value.destroy();
    }
});

import customHeadingId from "marked-custom-heading-id";
marked.use(customHeadingId());
marked.use(markedKatex({throwOnError: false,displayMode: true}));

function translate(data) {
  marked.setOptions({
    // renderer: renderer,
    highlight: function (code, lang) {
      const hljs = highlight.HighlightJS;
      const language = lang;
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: "hljs language-",
  });
  return marked(data);
}

function markdownToHtml(rawMarkdown) {
  const cssURL = 'pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{color:#abb2bf;background:#282c34}.hljs-comment,.hljs-quote{color:#5c6370;font-style:italic}.hljs-doctag,.hljs-formula,.hljs-keyword{color:#c678dd}.hljs-deletion,.hljs-name,.hljs-section,.hljs-selector-tag,.hljs-subst{color:#e06c75}.hljs-literal{color:#56b6c2}.hljs-addition,.hljs-attribute,.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#98c379}.hljs-attr,.hljs-number,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-pseudo,.hljs-template-variable,.hljs-type,.hljs-variable{color:#d19a66}.hljs-bullet,.hljs-link,.hljs-meta,.hljs-selector-id,.hljs-symbol,.hljs-title{color:#61aeee}.hljs-built_in,.hljs-class .hljs-title,.hljs-title.class_{color:#e6c07b}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}.hljs-link{text-decoration:underline}'

  let cssString = `
  <style>${cssURL}</style>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.2/dist/katex.min.css" integrity="sha384-bYdxxUwYipFNohQlHt0bjN/LCpueqWz13HufFEV1SUatKs1cm4L6fFgCi1jT643X" crossorigin="anonymous">
  <style>
body {
font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
color:#2c3e50;
font-size: 15px;
text-rendering: optimizeLegibility;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
line-height: 1.6;
font-weight: normal;
overflow: hidden;
}

strong { font-weight: bold; }

blockquote {
margin: 0 0 1rem;
padding: .625rem 1.25rem;
border-left: .25rem solid #e9ecef;
}

blockquote p:last-child,blockquote ul:last-child,blockquote ol:last-child {
margin-bottom: 0
}

p {
margin-top: 0;
margin-bottom: 1rem;
}
</style>
`


  // let html_content = cssString + translate(rawMarkdown)
  let html_content = translate(rawMarkdown)
  return html_content
}


</script>