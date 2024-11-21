<template>
    <span v-once :key="badgeKey" class="ref-badge" contenteditable="true" @input="updateText">
      {{ text }}
    </span>
  </template>
  
  <script>
  export default {
    props: {
      initialText: {
        type: String,
        default: 'Click Me',
      },
    },
    data() {
      return {
        text: this.initialText,
        badgeKey: `ref-badge-${this.generateUniqueId()}`, // Unique key for each instance
      };
    },
    methods: {
      generateUniqueId() {
        // Generate a random unique ID
        return Math.random().toString(36).substr(2, 9);
      },
      updateText(event) {
        console.log('ffd',fds)
        // Update the text from the editable content
        this.text = event.target.textContent;
      }
    },
  };
  </script>
  
  <style scoped>
  .ref-badge {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    display: inline-block;
    min-width: 50px;
  }
  </style>
  