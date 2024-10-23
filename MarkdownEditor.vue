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
import { CustomHeading, getTrackHeadingsExtension } from '@/components_shared/tiptap_custom.js'
import { dimStore } from '@/components_shared/dimStore'
import { markdownToHtml, augmentedRawMarkdown } from '@/components_shared/utils.js'

const dim_store = dimStore()

const editor = useEditor({
    extensions: [
        StarterKit.configure({
            heading: false,
        }),
        CustomHeading,
        getTrackHeadingsExtension(dim_store),

    ],
    content: dim_store.html_content,

    onUpdate: ({ editor }) => {
        let html = editor.getHTML()
        if (html !== dim_store.html_content.value) {
            dim_store.html_content = html// NOT USED !!!!!?????
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
