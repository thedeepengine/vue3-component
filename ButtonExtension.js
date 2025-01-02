import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'

import Component from './ButtonComponent.vue'
import { nodeInputRule } from '@tiptap/core';
import { TextSelection } from 'prosemirror-state';

export default Node.create({
  name: 'vueComponent',
  inline: true,
  group: 'inline', 
  atom: true,
  addAttributes() {
    return {
      name: {
        default: '',
      },
      class: {
        default: null,
        renderHTML: (attributes) => {
          if (attributes.class) {
            return { class: attributes.class };
          }
          return {};
        },
        parseHTML: (element) => element.getAttribute('class'), // Parse the class from HTML
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'button-node',
        getAttrs: (element) => {
          return {
            class: element.getAttribute('class')
          };
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['button-node', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(Component)
  },

addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state, view } = editor;
        const { selection } = state;
        const { $from } = selection;
        if ($from.pos > 0) {
            const lineText = state.doc.textBetween($from.before(), $from.pos, '\n', '\n');
            if (lineText.startsWith('::')) {
            
                const start = $from.before(); 
                const text = state.doc.textBetween(start, selection.to, '\n'); // Extract current block text
          
                const match = text.match(/::(\w+)$/); 
                if (match) {
                  const tr = state.tr.replaceWith(
                    start,
                    selection.to,
                    this.type.create({ name: match[1] }) 
                  );
            
                  view.dispatch(tr);
                  return true; 
                }
          
                return false; 
            }
        }

      },
    };
  },
  

})