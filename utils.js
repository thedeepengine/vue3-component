import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import customHeadingId from "marked-custom-heading-id";
marked.use(customHeadingId());
marked.use(markedKatex({throwOnError: false,displayMode: true}));



const renderer = new marked.Renderer();

// Override the rendering for specific elements
renderer.title = function(text) {
  console.log("Paragraph detected:", text);  // Notify when paragraph is detected
  const result = `<p>${text}</p>`;
  console.log("Finished rendering paragraph");  // Notify when paragraph rendering is finished
  return result;
};

renderer.heading = function(text, level) {
  console.log('texttexttext', JSON.stringify(text, null, 2))
  console.log('level',JSON.stringify(level, null, 2))
  console.log(`Heading detected: Level ${level} - ${String(text)}`);  // Ensure text is a string

  console.log(`Heading detected: Level ${level} - ${text}`);  // Log when a heading is detected
  // You can customize the HTML here. For example, adding a class based on the level.
  const result = `<h${level} class="custom-heading">${text}</h${level}>`;
  console.log("Finished rendering heading");  // Log when the heading rendering is finished
  return result;
};


renderer.paragraph = function(text) {
  console.log("Paragraph detected:", text);  // Notify when paragraph is detected
  const result = `<p>${text}</p>`;
  console.log("Finished rendering paragraph");  // Notify when paragraph rendering is finished
  return result;
};

renderer.list = function(body, ordered) {
  console.log("List detected:", body);  // Notify when list is detected
  console.log("List detected ordered:", ordered);  // Notify when list is detected
  const result = `<ul>${body}</ul>`;
  console.log('body---- ', body)
  console.log("Finished rendering list");  // Notify when list rendering is finished
  return result;
};

renderer.listitem = function(text) {
  console.log("List item detected:", text);  // Notify when list item is detected
  const result = `<li>${text}</li>`;
  console.log("Finished rendering list item");  // Notify when list item rendering is finished
  return result;
};



function test_click_utils() {
  const lexer = new marked.Lexer();
  const originalLex = lexer.lex; 
  
  lexer.lex = function (src) {
    const tokens = originalLex.call(this, src);    
    tokens.forEach(token => {
      console.log('Token:', token);
    });
    
    return tokens;
  };

  const markdown = `
# Main Heading
## Subheading with **bold** text
This is a paragraph with a [link](https://example.com).
`;
  const tokens = lexer.lex(markdown);
  console.log('tokens ', tokens)

}

function translate(data) {
    marked.setOptions({
      // renderer: renderer,
      highlight: function (code, lang) {
        const hljs = highlight.HighlightJS;
        const language = lang;
        return hljs.highlight(code, { language }).value;
      },
      langPrefix: "hljs language-",
    });
    return marked(data);
  }

  
function markdownToHtml(rawMarkdown) {  
    let html_content = translate(rawMarkdown)
    return html_content
  }
  


export {
    markdownToHtml,
    test_click_utils
}