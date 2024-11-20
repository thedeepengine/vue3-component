import { Heading } from '@tiptap/extension-heading';
import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { select as d3select, selectAll as d3selectAll } from 'd3-selection'

import { updateNestedObjectByKey, compute_and_draw_tree, displayStaticTree } from '@/components_shared/network/network_utils.js'

// const CustomHeading = Heading.extend({
//   addAttributes() {
//     return {
//       ...this.parent?.(),
//       id: {
//         default: null,
//         rendered: true,
//       },
//     };
//   },

//   renderHTML({ node, HTMLAttributes }) {
//     return [
//       `h${node.attrs.level}`,
//       {
//         ...HTMLAttributes,
//         id: node.attrs.id ? node.attrs.id : undefined,
//       },
//       0,
//     ];
//   },

//   addCommands() {
//     return {
//       setCustomHeading: attributes => ({ commands }) => {
//         return commands.setNode('heading', attributes);
//       }
//     };
//   }
// });




// const CustomHeading = Heading.extend({
//   addAttributes() {
//     return {
//       ...this.parent?.(),
//       id: {
//         default: null,
//         rendered: true,
//       },
//     };
//   },

//   renderHTML({ node, HTMLAttributes }) {
//     return [
//       'div',
//       { style: 'display: flex; align-items: baseline;' },
//       [
//         `h${node.attrs.level}`,
//         {
//           ...HTMLAttributes,
//           id: node.attrs.id ? node.attrs.id : undefined,
//         },
//         0
//       ],
//       ['button', { type: 'button' }, 'Click Me']
//     ];
//   },

//   addCommands() {
//     return {
//       setCustomHeading: attributes => ({ commands }) => {
//         return commands.setNode('heading', attributes);
//       }
//     };
//   }
// });


// const CustomHeading = Heading.extend({
//   addAttributes() {
//     return {
//       ...this.parent?.(),
//       id: {
//         default: null,
//         rendered: true,
//       },
//       showButton: {
//         default: false,
//         rendered: false
//       }
//     };
//   },

//   renderHTML({ node, HTMLAttributes }) {
//     const elements = [
//       'div',
//       { style: 'display: flex; align-items: baseline;' },
//       [
//         `h${node.attrs.level}`,
//         {
//           ...HTMLAttributes,
//           id: node.attrs.id ? node.attrs.id : undefined,
//         },
//         0
//       ]
//     ];

//     if (node.attrs.showButton) {
//       console.log('pusheddd')
//       elements.push(['button', { type: 'button' }, 'Click Me']);
//     }

//     return elements;
//   },

//   addCommands() {
//     return {
//       toggleButton: attributes => ({ commands }) => {
//         console.log('commands', commands)
//         if (attributes.showButton) {
//           console.log('attributes', attributes)
//           return commands.updateAttributes('heading', { showButton: true });
//         } else {
//           return commands.updateAttributes('heading', { showButton: false });
//         }
//       },
//       setCustomHeading: attributes => ({ commands }) => {
//         return commands.setNode('heading', attributes);
//       }
//     };
//   }
// });

const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        rendered: true,
      },
      showButton: {
        default: false,
        rendered: false  // Ensure this attribute does not need to be rendered in HTML but does control behavior
      }
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const elements = [
      'div',
      { style: 'display: flex; align-items: baseline;' },
      [
        `h${node.attrs.level}`,
        {
          ...HTMLAttributes,
          id: node.attrs.id ? node.attrs.id : undefined,
        },
        0
      ]
    ];

    // Conditionally append the button if showButton attribute is true
    if (node.attrs.showButton) {
      elements.push(['button', { type: 'button' }, 'Click Me']);
    }

    return elements;
  },

  addCommands() {
    return {
      toggleButton: () => ({ tr, dispatch }) => {
        if (dispatch) {
          const { doc } = tr;
          let updated = false;

          doc.descendants((node, pos) => {
            if (node.type.name === 'heading') {
              const newAttrs = {
                ...node.attrs,
                showButton: !node.attrs.showButton
              };
              tr.setNodeMarkup(pos, null, newAttrs);
              updated = true;
            }
          });

          if (updated) {
            dispatch(tr);
          }
          return updated;
        }
        return false;
      },
      removeAllButtons: () => ({ tr, dispatch }) => {
        if (dispatch) {
          const { doc } = tr;
          let updated = false;

          doc.descendants((node, pos) => {
            if (node.type.name === 'heading' && node.attrs.showButton) {
              const newAttrs = { ...node.attrs, showButton: false };
              tr.setNodeMarkup(pos, null, newAttrs);
              updated = true;
            }
          });

          if (updated) {
            dispatch(tr);
          }
          return updated;
        }
        return false;
      },
      setCustomHeading: attributes => ({ commands }) => {
        return commands.setNode('heading', attributes);
      }
    };
  }

  
});





function getHeadingsInRange(doc, from, to) {
  let headings = [];
  doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === 'heading') {
      headings.push({ level: node.attrs.level, content: node.textContent, id: node.attrs.id });
    }
  });
  return headings;
}

function getTrackHeadingsExtension(store, html_content) {
  const TrackHeadingsExtension =
    Extension.create({
      name: 'trackHeadings',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            appendTransaction(transactions, oldState, newState) {
              const { $head } = newState.selection;
              const { $from } = newState.selection;

              const nodeAtPos = $from.node();
  
              if (!nodeAtPos.type.name === 'heading') {
                return null; // Stop the transaction if it's not a markdown title
              }
              transactions.forEach(transaction => {
                transaction.steps.forEach(step => {
                  const stepMap = step.getMap();
                  stepMap.forEach((oldStart, oldEnd, newStart, newEnd) => {

                    const oldHeadings = getHeadingsInRange(oldState.doc, oldStart, oldEnd);
                    const newHeadings = getHeadingsInRange(newState.doc, newStart, newEnd);

                    if (newHeadings.length === 1 && oldHeadings.length === 1 && oldHeadings[0].content !== newHeadings[0].content) {

                      if (newHeadings[0]?.id !== null) {
                        const updatedDataItem = {
                          uuid_front: newHeadings[0].id,
                          data: { name: newHeadings[0].content }
                        };
                        updateNestedObjectByKey(store.w_data, updatedDataItem.uuid_front, 'name', newHeadings[0].content)
                        displayStaticTree(store)
                      } else {

                        setTimeout(() => {
                          let md = store.turndownService.turndown(store.html_content)
                          store.md_to_hierarchy(md)
                          displayStaticTree(store)

                        }, 100);
                      }
                    }
                  });
                });
              });
              return undefined;
            }
          })
        ];
      },
    });

  return TrackHeadingsExtension
}

export {
  CustomHeading,
  getTrackHeadingsExtension
}