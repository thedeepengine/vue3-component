<template>
    <node-view-wrapper>
        <div class="content">
            <button class="field-indicator" @click="increase">
                {{ node.attrs.name }}
            </button>
        </div>
    </node-view-wrapper>
</template>

<script>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'

export default {
    components: {
        NodeViewWrapper,
    },

    props: nodeViewProps,

    methods: {
        increase() {
            this.updateAttributes({
                name: this.node.attrs.count + 1,
            })
        },
    },
}
</script>

<style>
.tiptap .field-indicator {
        background-color: #1f2937;
        /* background-color: #4c5467; */
        color: white;
        /* border: 2px solid var(--purple); */
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
    }
</style>