import { Heading } from '@tiptap/extension-heading';
import { Extension, mergeAttributes } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { Mention } from '@tiptap/extension-mention';

import { update_node_property, compute_tree, displayStaticTree } from '@/components_shared/network/network_utils.js'

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
      'data-clt-name': {
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
      { style: 'display: flex; align-items: baseline;', class: 'fmw-title', 'data-clt-name': node.attrs.clt_name },
      [
        `h${node.attrs.level}`,
        {
          ...HTMLAttributes,
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
      }
    }
    return elements;
  },
  addCommands() {
    return {
      toggle_display_refs: () => ({ tr, dispatch }) => {
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
      setCustomHeading: attributes => ({ commands }) => {
        return commands.setNode('heading', attributes);
      }
    };
  },
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


function get_all_heading(state) {
  let text = []
  state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      text.push(`${'#'.repeat(node.attrs.level)} ${node.attrs.id}`)
    }

    // const hashMatch = node.textContent.match(/^(#+)/);
    // if (node.type.name === 'paragraph' && hashMatch) {
    //   let target = hashMatch[0] + ' ' + '!TEMP_TARGET_FMW_FRONT_!'
    //   text.push(target)
    // }
  });

  return text;
}



function getTrackHeadingsExtension(store, html_content) {
  const TrackHeadingsExtension =
    Extension.create({
      name: 'trackHeadings',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            appendTransaction(transactions, oldState, newState) {
              const { $from } = newState.selection;
              const nodeAtPos = $from.node();
              // this is most likely what should be useed to check to make it ontologically sound
              // const { $to } = oldState.selection;
              // const nodePrev = $to.node();
              // console.log('nodePrev', nodePrev)

              let old_heading = get_all_heading(oldState)
              let new_heading = get_all_heading(newState)
              let is_new_heading_in_html = new_heading.length > old_heading.length
              let is_new_heading_removed_from_html = new_heading.length < old_heading.length
              if (nodeAtPos.type.name === 'heading' || is_new_heading_removed_from_html) {
                  if (is_new_heading_removed_from_html) {
                    store.refresh_map = true
                  } else if (is_new_heading_in_html) {
                    store.refresh_map = true
                  } else { 
                      update_node_property(store.w_data, nodeAtPos.attrs.id, 'name', nodeAtPos.textContent)
                      if (store.dimension === 'hierarchy') {
                        displayStaticTree(store)
                      }
                  }
                return undefined;
              }
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