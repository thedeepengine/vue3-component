import { Marked } from "marked";
import markedKatex from "marked-katex-extension";
import customHeadingId from "marked-custom-heading-id";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import graphql from 'highlight.js/lib/languages/graphql';
// import 'highlight.js/styles/monokai-sublime.css';


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


export {
    md_to_html,
    md_to_html_llm,
    find_path,
    add_children_at_path,
    insert_object_at_uuid,
    find_parent_uuid,
    f_log
}