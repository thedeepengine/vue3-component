import { Heading } from '@tiptap/extension-heading';
import { Extension, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { update_node_property, displayStaticTree } from '@/components_shared/network/network_utils.js'
import { InputRule } from '@tiptap/core';
import { TextSelection } from 'prosemirror-state'; // Correct import from ProseMirror


class CustomInputRule extends InputRule {
  constructor(type, getAttrs) {
    super({
      find: /^(#{1,6})\s(.*)$/,
      handler: ({ state, range, match }) => {
        const attrs = getAttrs(match);
        if (!attrs) return null; // No attributes, no heading

        const { tr } = state;
        const start = range.from;
        const end = range.to;

        
        // const paragraphNode = type.schema.nodes.paragraph.create();
        // const headingNode = type.schema.nodes.heading.create({...attrs, class: 'fmw-title'});
        // const headingPosition = start + paragraphNode.nodeSize;
        // state.tr.delete(range.from, range.to)
        // tr.insert(start, paragraphNode);
        // tr.insert(start + paragraphNode.nodeSize, headingNode);
        // const posInHeading = headingPosition + 1; 
        // tr.setSelection(TextSelection.create(tr.doc, posInHeading));


        // const headingNode = type.schema.nodes.heading.create({...attrs, class: 'fmw-title'});
        // const headingPosition = start 
        // tr.delete(range.from, range.to)
        // tr.insert(start, headingNode);
        // const posInHeading = headingPosition+1; 
        // tr.setSelection(TextSelection.create(tr.doc, posInHeading));

        const headingNode = type.schema.nodes.heading.create({...attrs, class: 'fmw-title'});
const headingPosition = start;
tr.delete(range.from, range.to)  // Delete the specified range
  .insert(headingPosition, headingNode)  // Insert the new heading node at the start position
  .setSelection(TextSelection.create(tr.doc, headingPosition + 2));  // Set cursor position inside the heading


        return tr;
      }
    });

    this.getAttrs = getAttrs;
  }
}

const CustomHeading = Heading.extend({
  content: 'inline*',
  addInputRules() {
    return [
      new CustomInputRule(this.type, (match) => {
        const levels = match[1].length; // Calculate heading level from number of '#'
        return { level: levels };
      })
    ];
  },
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
              
              // console.log('is_new_heading_in_html', is_new_heading_in_html)
              // console.log('is_new_heading_removed_from_html', is_new_heading_removed_from_html)

              // console.log('store.html_content', store.html_content)
              // console.log('new_heading', new_heading)
              // console.log('nodeAtPos', nodeAtPos)
              if (is_new_heading_in_html) {
                console.log('NEW HEADING')
                setTimeout(() => {
                  store.html_to_hierarchy(store.html_content)
                }, 500);
              } else {
                update_node_property(store.w_data, nodeAtPos.attrs.id, store.header_prop_name, nodeAtPos.textContent)
                displayStaticTree(store)
              }

              // if (nodeAtPos.type.name === 'heading' || is_new_heading_removed_from_html) {
              //     if (is_new_heading_removed_from_html) {
              //       store.refresh_map = true
              //     } else if (is_new_heading_in_html) {
              //       store.refresh_map = true
              //     } else { 
              //         update_node_property(store.w_data, nodeAtPos.attrs.id, store.header_prop_name, nodeAtPos.textContent)
              //         if (store.dimension === 'hierarchy') {
              //           displayStaticTree(store)
              //         }
              //     }
              //   return undefined;
              // }

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