import { Heading } from '@tiptap/extension-heading';
import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { select as d3select, selectAll as d3selectAll } from 'd3-selection'

import { updateNestedObjectByKey, compute_and_draw_tree, displayStaticTree } from '@/components_shared/network/network_utils.js'

const CustomHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        rendered: true,
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    // Extend the default render method to include the custom `id`
    return [
      `h${node.attrs.level}`,
      {
        ...HTMLAttributes,
        id: node.attrs.id,
      },
      0,
    ];
  },

  addCommands() {
    return {
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


function getHeadings(doc) {
  let headings = [];
  doc.descendants((node, pos) => {
    if (/^heading$/.test(node.type.name)) {
      headings.push({
        level: node.attrs.level,
        content: node.textContent,
        id: node.attrs.id
      });
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
            transactions.forEach(transaction => {
              transaction.steps.forEach(step => {
                const stepMap = step.getMap();
                stepMap.forEach((oldStart, oldEnd, newStart, newEnd) => {
                  const oldHeadings = getHeadingsInRange(oldState.doc, oldStart, oldEnd);
                  const newHeadings = getHeadingsInRange(newState.doc, newStart, newEnd);

                  if (newHeadings.length === 1 && oldHeadings.length === 1 && oldHeadings[0].content !== newHeadings[0].content) {

                    if (newHeadings[0]?.id !== null) {
                      const updatedDataItem = { uuid: newHeadings[0].id, data: { name: newHeadings[0].content } };
                      const specificElement = d3select(`[data-pathid="${updatedDataItem.uuid}"]`);
                      let a = specificElement.select('input')

                      a.property('value', updatedDataItem.data.name)
                        .style('width', `400px`);
  
                      updateNestedObjectByKey(store.w_data, updatedDataItem.uuid.substring(1), 'name', newHeadings[0].content)
                      displayStaticTree(store)
                    } else {

                      setTimeout(()=> {
                        let md = store.turndownService.turndown(store.html_content)
                        store.md_to_hierarchy(md)
                        displayStaticTree(store)

                        // const headers = getHeadings(newState.doc);
                        // headers.forEach(item => {
                        //   if (item.id === null) {
                        //     item.id = `temp${Math.floor(Math.random() * 1e10)}`;
                        //   }
                        // });

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