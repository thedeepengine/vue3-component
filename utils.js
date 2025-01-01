import { Marked } from "marked";
import markedKatex from "marked-katex-extension";
import customHeadingId from "marked-custom-heading-id";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import graphql from 'highlight.js/lib/languages/graphql';
// import 'highlight.js/styles/monokai-sublime.css';
import { select as d3select } from 'd3-selection'


const marked_1 = new Marked(markedHighlight({
  emptyLangClass: 'hljs',
  langPrefix: 'hljs language-',
  highlight(code, lang, info) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));


const renderer_1 = {
  heading({ tokens, depth }) {
    let split_text_uuid = tokens[0].text.split('{#')
    let text = split_text_uuid[0]
    let uuid = split_text_uuid[1]
    let parent_ref = split_text_uuid[2]
    let clt_name = split_text_uuid[3]
    return `<h${depth} class="custom-heading" id="${uuid}" data-parent-ref="${parent_ref}" data-clt-name="${clt_name}">${text}</h${depth}>`;
  },
  paragraph(token) {

    if (token.text.startsWith('<button-node')) {
      return token.text; 
    }
    return `<p>${token.text}</p>`; 

  }
};


marked_1.use(customHeadingId());
marked_1.use(markedKatex({throwOnError: false,displayMode: true}));
marked_1.use({ renderer: renderer_1 });


const marked_2 = new Marked(markedHighlight({
	  emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  }));

  const renderer_2 = {
    strong(token) {
      if (token.text.startsWith('!!:')) {
        const modifiedText = token.text.replace('!!:', ''); 
        return `<span class="code-like-inline" style="background-color:#afb8c133;padding:.2em .4em;border-radius:6px">${modifiedText}</span>`;
      }
      return `<strong>${token.text}</strong>`; 
    }
  };

  marked_2.use({ renderer: renderer_2 });

function md_to_html(rawMarkdown) {  
  return marked_1.parse(rawMarkdown);
}

function md_to_html_llm(rawMarkdown) {  
  return marked_2.parse(rawMarkdown);
}

function add_children_at_path(root, path, newObj) {

        function find_and_update(current, pathIndex) {
            if (pathIndex < path.length) {
                let nextNode = current.children.find(child => child.uuid_front === path[pathIndex]);
                find_and_update(nextNode, pathIndex + 1); 
            } else {
                if (!current.children) {
                    current.children = []; 
                }
                current.children.push(newObj);
                return true
            }
        }
    
      let pathIndex = 0
      if (root.uuid_front === path[pathIndex]) {
          return find_and_update(root, pathIndex+1); 
      }
      return false
}


function find_path(headings, target) {
  const path = [];
  let currentDepth = 0;

  for (const heading of headings) {
    const depth = heading.lastIndexOf('#') + 1;

    if (depth <= currentDepth) {
      path.splice(depth);
    }

    currentDepth = depth;
    const headingText = heading.slice(depth + 1).trim();
    path[depth - 1] = headingText;

    
    if (headingText === target) {
      return path
    }
  }

  return 'Title not found';
}


function insert_object_at_uuid(simpleObj, nestedObj, uuid_front, position) {
    function find_object_by_uuid(obj, uuid, parent = null) {
        if (obj.uuid_front === uuid) {
            return { target: obj, parent: parent };
        }
        if (obj.children) {
            for (let child of obj.children) {
                const found = find_object_by_uuid(child, uuid, obj);
                if (found) return found;
            }
        }
        return null; 
    }

    const found = find_object_by_uuid(nestedObj, uuid_front);

    if (!found) {
        console.error('UUID not found');
        return;
    }

    const { target, parent } = found;

    if (position === 'children') {
        // Ensure there is a children array
        target.children = target.children || [];
        // Append to the children array of the found object
        simpleObj  = {...simpleObj, parent_ref: uuid_front}
        target.children.push(simpleObj);
    } else if (position === 'sibling') {
        if (parent) {
          let parent_uuid = find_parent_uuid(nestedObj, uuid_front);
          simpleObj  = {...simpleObj, parent_ref: parent_uuid}
          const index = parent.children.findIndex(child => child.uuid_front === uuid_front);
          parent.children.splice(index + 1, 0, simpleObj);
        } else {
            console.error('Sibling insertion not possible at root level.');
        }
    } else {
        console.error('Invalid position. Use "children" or "sibling".');
    }
}


function find_parent_uuid(nestedObj, uuidFront) {
  function findParent(obj, uuid, parentUuid = null) {
      if (obj.uuid_front === uuid) {
          return parentUuid; 
      }
      if (obj.children) {
          for (let child of obj.children) {
              const result = findParent(child, uuid, obj.uuid_front);
              if (result !== null) {
                  return result;
              }
          }
      }
      return null; 
  }

  return findParent(nestedObj, uuidFront);
}

function f_log(tag, message) {
  const now = new Date().toISOString();
  console.log(`[${now}] [${tag}]`, message);
}



function wait_for_element(selector, parent = document, useQuerySelectorAll = false, timeout = 10000) {
  return new Promise((resolve, reject) => {
      const startTime = Date.now();

      function check() {
          const elements = useQuerySelectorAll ? parent.querySelectorAll(selector) : parent.querySelector(selector);
          if ((useQuerySelectorAll && elements.length > 0) || (!useQuerySelectorAll && elements)) {
              resolve(elements);
          } else if (Date.now() - startTime >= timeout) {
              reject(new Error(`Element(s) "${selector}" not found within ${timeout}ms`));
          } else {
              requestAnimationFrame(check);
          }
      }
      check();
  });
}




function insert_node(mindMap, existingUuid, newNode, insertionType) {
    
  function findNode(node, targetUuid) {
      if (!node) return null; 

      
      if (node.uuid === targetUuid) {
          return node;
      }

      
      if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
              const found = findNode(child, targetUuid);
              if (found) return found;
          }
      }

      return null; 
  }

  
  function findParent(node, targetUuid) {
      if (!node) return null; 

      
      if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
              if (child.uuid === targetUuid) {
                  return node; 
              }
          }

          
          for (const child of node.children) {
              const parent = findParent(child, targetUuid);
              if (parent) return parent;
          }
      }

      return null; 
  }

  
  if (!newNode.uuid) {
      throw new Error("The new node must have a uuid");
  }

  
  const existingNode = findNode(mindMap, existingUuid);
  if (!existingNode) {
      throw new Error("Node with the given uuid not found");
  }

  if (insertionType === "child") {
      
      if (!existingNode.children) {
          existingNode.children = [];
      }
      newNode.side = existingNode.side; 
      newNode.order = existingNode.children.length; 
      existingNode.children.push(newNode);
  } else if (insertionType === "sibling") {
      
      const parent = findParent(mindMap, existingUuid);
      if (!parent) {
          throw new Error("Parent of the existing node not found");
      }

      newNode.side = existingNode.side; 
      newNode.order = existingNode.order + 1; 

      
      parent.children.forEach((child) => {
          if (child.order > existingNode.order) {
              child.order++;
          }
      });

      
      parent.children.splice(existingNode.order + 1, 0, newNode);
  } else {
      throw new Error("Invalid insertion type. Use 'child' or 'sibling'.");
  }
}


function assign_tree_side_and_order(tree) {
  // Helper function to recursively assign side and order
  function assignSideAndOrderRecursive(node, parentSide = "center") {
      if (!node) return; // Base case: if the node is null or undefined

      // Assign side based on parent's side
      node.side = parentSide;

      // If the node has children, assign side and order to each child
      if (node.children && Array.isArray(node.children)) {
          let leftOrder = 0; // Order counter for left side
          let rightOrder = 0; // Order counter for right side

          node.children.forEach((child, index) => {
              // Assign side for children of the center node (odd-even fashion)
              if (node.side === "center") {
                  child.side = index % 2 === 0 ? "right" : "left";
              } else {
                  // For deeply nested children, inherit the parent's side
                  child.side = node.side;
              }

              // Assign order based on the side
              if (child.side === "left") {
                  child.order = leftOrder++;
              } else if (child.side === "right") {
                  child.order = rightOrder++;
              }

              // Recursively process the child
              assignSideAndOrderRecursive(child, child.side);
          });
      }
  }

  // Start the recursion from the root of the tree
  assignSideAndOrderRecursive(tree);
}


function physically_order_tree(tree) {
  const left = [];
  const right = [];

  // Helper function to recursively process the tree
  function processNode(node) {
      if (!node) return; // Base case: if the node is null or undefined

      // Create a new node object with the same data and side
      const newNode = {
          data: node.data,
          side: node.side,
          order: node.order,
          children: [], // Initialize children array
      };

      // Add the node to the appropriate side array
      if (node.side === "left") {
          left.push(newNode);
      } else if (node.side === "right") {
          right.push(newNode);
      }

      // Recursively process children and add them to the new node's children array
      if (node.children && Array.isArray(node.children)) {
          node.children.forEach((child) => {
              const childNode = processNode(child);
              if (childNode) {
                  newNode.children.push(childNode);
              }
          });
      }

      return newNode;
  }

  processNode(tree);
  left.sort((a, b) => a.order - b.order);
  right.sort((a, b) => a.order - b.order);

  return { left, right };
}



function highlight_new_node(id, origin) {
  console.log('origin originoriginorigin', origin)
  wait_for_element(`[data-pathid="${id}"]`).then((e_map) => {
    let elt = d3select(`[data-pathid="${id}"]`)
    elt.style('transition', 'background-color 1s');
    elt.style('background-color', '#F1E6FF');
    if (origin === 'map') {
      let input_elt = elt.select("body input");
      console.log('input_elt: ', input_elt)
      input_elt.node().focus();        
    }

    const handleKeyPress = (event) => {
        requestAnimationFrame(() => {
          
          elt.style('background-color', '');
        })
        window.document.removeEventListener('keydown', handleKeyPress);
    };
      window.document.addEventListener('keydown', handleKeyPress);  
})
}





export {
    md_to_html,
    md_to_html_llm,
    find_path,
    add_children_at_path,
    insert_object_at_uuid,
    find_parent_uuid,
    f_log,
    wait_for_element,
    insert_node,
    assign_tree_side_and_order,
    physically_order_tree,
    highlight_new_node
}