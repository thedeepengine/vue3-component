import { Heading } from '@tiptap/extension-heading';
import { Extension, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state'

import { update_node_property, displayStaticTree } from '@/components_shared/network/network_utils.js'

const CustomHeading = Heading.extend({
  content: 'inline*',
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
      
      class: {
        default: null, 
        renderHTML: attributes => {
          return {
            class: attributes.class,
          }
        },
        parseHTML: element => 
          element.getAttribute('class')
      }
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    if (!node.attrs.id) {
      node.attrs.id = `X_TEM_${Math.random().toString(36).substr(2, 9)}`;
    }

    let default_style = 'display: inline; align-items: baseline;'
    HTMLAttributes.id = node.attrs.id;
    HTMLAttributes.class = (node.attrs.class ? `${node.attrs.class} fmw-title` : 'fmw-title').trim();
    HTMLAttributes.style = (node.attrs.style ? `${node.attrs.style};${default_style}` : `${default_style}`).trim();

    const elements = [
      `h${node.attrs.level}`,
      HTMLAttributes,
      0
    ];
    return elements;
  },
  addCommands() {
    return {
      setCustomHeading: attributes => ({ commands }) => {
        return commands.setNode('heading', attributes);
      }
    };
  },
});

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
  getTrackHeadingsExtension,
  
}