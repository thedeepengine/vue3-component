import { Node, mergeAttributes } from '@tiptap/core';

const RefBadge = Node.create({
  name: 'RefBadge',  // Name of the custom node
  group: 'inline',   // It is an inline node
  inline: true,      // It's an inline element
  content: 'text*',  // It contains text content

  // Define the attributes for the node
  addAttributes() {
    return {
      text: {
        default: '',
      },
    };
  },


  renderHTML({ node }) {
    return [
      'button', // The HTML tag
      mergeAttributes(this.options.HTMLAttributes, { class: 'ref-badge' }), // Merge any additional attributes with class
      node.attrs.text,  // Render the text inside the badge
    ];
  },

  // Parse the HTML to extract the node content
  parseHTML() {
    return [
      {
        tag: 'span.ref-badge',  // Parse from 'span' or 'button' tag
        getAttrs: (dom) => ({
          text: dom.textContent, // Get the text from the badge element
        }),
      },
    ];
  },
});

export default RefBadge;
