import { Node, mergeAttributes } from '@tiptap/core';

const RefBadge = Node.create({
  name: 'RefBadge',  // Name of the custom node
  group: 'inline',   // It is an inline node
  inline: true,      // It's an inline element
  content: 'text*',  // It contains text content
  atom: true,      

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
      'span', // The HTML tag
      mergeAttributes(this.options.HTMLAttributes, { class: 'ref-badge', 
        contenteditable: 'true' }), // Merge any additional attributes with class
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
  

  addNodeView() {
    return ({ node, view, getPos }) => {
        console.log('vfdsfd')
      const dom = document.createElement('span');
      dom.className = 'ref-badge';
      dom.contentEditable = 'true';
      dom.textContent = node.attrs.text;

      console.log('dom', dom)

      dom.addEventListener('input', () => {
        const newText = dom.textContent;
        const pos = getPos();
        const transaction = view.state.tr.setNodeMarkup(pos, null, {
          text: newText,
        });
        view.dispatch(transaction);
      });

      return {
        dom,
        update(updatedNode) {
          if (updatedNode.type !== node.type) {
            return false;
          }
          if (updatedNode.attrs.text !== dom.textContent) {
            dom.textContent = updatedNode.attrs.text;
          }
          return true;
        },
      };
    };
  },
});

export default RefBadge;
