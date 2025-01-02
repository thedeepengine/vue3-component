<template>
    <node-view-wrapper as="span">
        <span v-if="node.attrs.class === 'field-indicator'" class="content">
            <button :class="node.attrs.class">
                {{ node.attrs.name }}
            </button>
        </span>
        <span v-if="node.attrs.class === 'fmw-field-uuid'" class="content">
            <span :class="[node.attrs.class, hightlight]" @click="copy_text"
            >
                {{ node.attrs.name }}
            </span>
            <!-- <span>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16" width="20px" height="20px"><g fill="none"><path d="M4 4.085V10.5a2.5 2.5 0 0 0 2.336 2.495L6.5 13h4.414A1.5 1.5 0 0 1 9.5 14H6a3 3 0 0 1-3-3V5.5a1.5 1.5 0 0 1 1-1.415zM11.5 2A1.5 1.5 0 0 1 13 3.5v7a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 5 10.5v-7A1.5 1.5 0 0 1 6.5 2h5zm0 1h-5a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5z" fill="currentColor"></path></g></svg>
            </span> -->
            <!-- <span Copy16Regular></span> -->
        </span>
    </node-view-wrapper>
</template>

<script setup>
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { defineProps, onMounted, ref } from 'vue';

const props = defineProps({
    ...nodeViewProps,
});

const hightlight = ref('')

const copy_text = (event) => {
    navigator.clipboard.writeText(event.target.innerText)
        .then(() => {
            hightlight.value = 'fmw-highlight'
            setTimeout(() => {
                hightlight.value = ''
            }, 1000);
        }, (err) => {
            console.error("Failed to copy text: ", err);
        });
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


@keyframes backgroundColorChange2 {
  0% {
    background-color: #f9f7f5;
  }

  50% {
    background-color: #F1E6FF;
  }

  100% {
    background-color: #f9f7f5;
  }
}



.tiptap .fmw-field-uuid.fmw-highlight {
    animation: backgroundColorChange2 1s forwards;
}

.tiptap .fmw-field-uuid {
    position: relative;
    border: none;
    cursor: pointer;
    outline: none;
    transition: background-color 1s;
}
</style>



