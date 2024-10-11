import { Heading } from '@tiptap/extension-heading';
import { Extension } from '@tiptap/core';
import { Plugin } from 'prosemirror-state';
import { select as d3select, selectAll as d3selectAll } from 'd3-selection'

import { updateNestedObjectByKey, compute_and_draw_tree, displayStaticTree } from '@/components_shared/network/network_utils.js'


const CustomHeading = Heading.extend({
  addAttributes() {
    console.log('sssss', this)
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
    console.log('node.attrs::: ', node.attrs)
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
        console.log('node: ', node)
      headings.push({ level: node.attrs.level, content: node.textContent, id: node.attrs.id });
    }
  });
  return headings;
}



function getTrackHeadingsExtension(store) {
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
                let changes = [];
                stepMap.forEach((oldStart, oldEnd, newStart, newEnd) => {
                  const oldHeadings = getHeadingsInRange(oldState.doc, oldStart, oldEnd);
                  const newHeadings = getHeadingsInRange(newState.doc, newStart, newEnd);
                  console.log('newHeadings: ', newHeadings)
  
                  if (oldHeadings.length !== newHeadings.length || !oldHeadings.every((val, index) => val === newHeadings[index])) {
                    if (newHeadings.length === 1) {
                      const updatedDataItem = { uuid: newHeadings[0].id, data: { name: newHeadings[0].content } };
                      const specificElement = d3select(`[data-pathid="${updatedDataItem.uuid?.substring(1)}"]`);
                      let a = specificElement.select('input')
  
                    //   store.update_network()
                    //   let new_width = a.getComputedTextLength
                      a.property('value', updatedDataItem.data.name)
                        // .style('width', `${updatedDataItem.y_end - updatedDataItem.y_start}px`);
                        // .style('width', `${updatedDataItem.y_end - (updatedDataItem.y_end-new_width)}px`);
                        .style('width', `400px`);
  
                      updateNestedObjectByKey(store.w_data, updatedDataItem.uuid.substring(1), 'name', newHeadings[0].content)
                      // compute_and_draw_tree(store)
                      displayStaticTree(store)
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