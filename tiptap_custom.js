import { Heading } from '@tiptap/extension-heading';
import { Extension, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { update_node_property, displayStaticTree } from '@/components_shared/network/network_utils.js'
import { InputRule } from '@tiptap/core';
import { TextSelection } from 'prosemirror-state';
import { wait_for_element, highlight_new_node } from '@/components_shared/utils'



let store = null

function set_store_tiptap(val) {
  store = val
}


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

        const headingNode = type.schema.nodes.heading.create({ ...attrs });
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
        const levels = match[1].length;
        setTimeout(() => {
          store.html_to_hierarchy(store.html_content)
        }, 500);
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
      'data-side': {
        default: null,
        rendered: true,
      },
      'data-order': {
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
      highlight_new_node(node.attrs.id)
    }

    let default_style = 'display: inline; align-items: baseline;'
    HTMLAttributes.id = node.attrs.id;
    HTMLAttributes.class = (node.attrs.class ? `${node.attrs.class} custom-heading fmw-title` : 'custom-heading fmw-title').trim();
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
      text.push(`${'#'.repeat(node.attrs.level)} ${node.attrs.id} ${node.content.size}`)
    }
  });
  return text;
}

function areArraysEqual(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
}

function getTrackHeadingsExtension(store, html_content) {
  const TrackHeadingsExtension =
    Extension.create({
      name: 'trackHeadings',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            appendTransaction(transactions, oldState, newState) {

              if (oldState.doc.eq(newState.doc)) {
                return
              }
              const { $from } = newState.selection;
              const nodeAtPos = $from.node();
              let old_heading = get_all_heading(oldState)
              let new_heading = get_all_heading(newState)
              if (old_heading.length > 0) {
                if (!areArraysEqual(old_heading, new_heading)) {
                  update_node_property(store.w_data, nodeAtPos.attrs.id, store.header_prop_name, nodeAtPos.textContent)
                  displayStaticTree(store) 
                }
              }
            }
          })
        ];
      },
    });

  return TrackHeadingsExtension
}


const TripleBacktickLogger = Extension.create({
  name: 'tripleBacktickLogger',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          transactions.forEach(transaction => {
            if (transaction.docChanged) {
              const firstNode = newState.doc.content.firstChild;
              if (firstNode && firstNode.isTextblock) {
                const text = firstNode.textContent;
                if (text.startsWith("```")) {
                  console.log("hey");
                }
              }
            }
          });
        }
      })
    ];
  },
});


export {
  CustomHeading,
  getTrackHeadingsExtension,
  TripleBacktickLogger,
  set_store_tiptap
}