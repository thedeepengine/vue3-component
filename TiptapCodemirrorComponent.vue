<template>
    <node-view-wrapper>
        <span class="content">
            <button @click="increase">
                {{ node.attrs.name }}
            </button>
        </span>
    </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import GraphqlBar from './GraphqlBar.vue'


export default {
    components: {
        NodeViewWrapper,
    },
    props: nodeViewProps,
    methods: {
    },
}
</script>

<style>
/* .tiptap .field-indicator {
        background-color: #1f2937;
        color: white;
        border-radius: 0.1rem;
        position: relative;
        border: none;
    padding: 4px 30px;
    font-size: 16px;
    cursor: pointer;
    outline: none;
    font-size: 12px;
    font-weight: bold;
    pointer-events: none;
    } */
</style>