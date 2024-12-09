import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import customHeadingId from "marked-custom-heading-id";
marked.use(customHeadingId());
marked.use(markedKatex({throwOnError: false,displayMode: true}));

const renderer = {
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

marked.use({ renderer });


function test_click_utils() {
  const lexer = new marked.Lexer();
  const originalLex = lexer.lex; 
  
  lexer.lex = function (src) {
    const tokens = originalLex.call(this, src);    
    // tokens.forEach(token => {
    // });
    
    return tokens;
  };

  const markdown = `
# Main Heading
## Subheading with **bold** text
This is a paragraph with a [link](https://example.com).
`;
  const tokens = lexer.lex(markdown);

}


  
function markdownToHtml(rawMarkdown) {  
  marked.setOptions({
    // renderer: renderer,
    highlight: function (code, lang) {
      const hljs = highlight.HighlightJS;
      const language = lang;
      return hljs.highlight(code, { language }).value;
    },
    langPrefix: "hljs language-",
  });
  return marked.parse(rawMarkdown);
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


function insert_object_at_uuid(simpleObj, nestedObj, uuidFront, position) {
    // Helper function to recursively find the target object and its path
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

    // Finding the target object by UUID
    const found = find_object_by_uuid(nestedObj, uuidFront);

    if (!found) {
        console.error('UUID not found');
        return;
    }

    const { target, parent } = found;

    if (position === 'children') {
        // Ensure there is a children array
        target.children = target.children || [];
        // Append to the children array of the found object
        target.children.push(simpleObj);
    } else if (position === 'sibling') {
        if (parent) {
            // Finding the index of the target object within its parent's children array
            const index = parent.children.findIndex(child => child.uuid_front === uuidFront);
            // Insert the simpleObj right after the target object in the parent's children array
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


export {
    markdownToHtml,
    test_click_utils,
    find_path,
    add_children_at_path,
    insert_object_at_uuid,
    find_parent_uuid,
    f_log
}