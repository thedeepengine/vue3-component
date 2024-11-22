import { Heading } from '@tiptap/extension-heading';
import { Extension, mergeAttributes } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { select as d3select, selectAll as d3selectAll } from 'd3-selection'
import { Mention } from '@tiptap/extension-mention';

import { updateNestedObjectByKey, compute_and_draw_tree, displayStaticTree } from '@/components_shared/network/network_utils.js'

const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        rendered: true,
      },
      'data-parent-ref': {
        default: null,
        rendered: true,
      },
      w_opp_ref: {
        default: null,
        rendered: true,
      },
      showButton: {
        default: false,
        rendered: false
      }
    };
  },

  renderHTML({ node, HTMLAttributes }) {

    if (!node.attrs.id) {
      node.attrs.id = `X_TEM_${Math.random().toString(36).substr(2, 9)}`;
    }
    HTMLAttributes.id = node.attrs.id;

    const elements = [
      'div',
      { style: 'display: flex; align-items: baseline;', class: 'fmw-title' },
      [
        `h${node.attrs.level}`,
        {
          ...HTMLAttributes,
          // id: node.attrs.id || `X_TEM_${Math.random().toString(36).substr(2, 9)}`
          // id: node.attrs.id ? node.attrs.id : || X_TEM_${Math.random().toString(36).substr(2, 9)},
        },
        0
      ]
    ];

    if (node.attrs.showButton) {

      if (node.attrs['data-parent-ref'] !== '') {
        const mentionAttributes = {
          id: '1',
          label: node.attrs['data-parent-ref'],
        };

        const mentionElement = [
          'span',
          mergeAttributes(
            {
              class: 'mention',
              contenteditable: 'false',
            },
            mentionAttributes
          ),
          `@${mentionAttributes.label}`,
        ];

        elements.splice(elements.length - 1, 0, mentionElement);
        // elements.push(mentionElement);

      }
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
                        let is_uuid_existing = updateNestedObjectByKey(store.w_data, updatedDataItem.uuid_front, 'name', newHeadings[0].content)
                        if (!is_uuid_existing) {
                          store.html_to_hierarchy(store.html_content)
                        } else {
                          displayStaticTree(store)
                        }
                      } else {

                        setTimeout(() => {
                          store.html_to_hierarchy(store.html_content)
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