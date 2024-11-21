import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import customHeadingId from "marked-custom-heading-id";
marked.use(customHeadingId());
marked.use(markedKatex({throwOnError: false,displayMode: true}));

const renderer = {
  heading({ tokens, depth }) {
    // let split_text_uuid = tokens[0].text.split('{#X')
    let split_text_uuid = tokens[0].text.split('{#')
    let text = split_text_uuid[0]
    let uuid = split_text_uuid[1]
    let parent_ref = split_text_uuid[2]
    return `<h${depth} class="custom-heading" id="${uuid}" data-parent-ref="${parent_ref}">${text}</h${depth}>`;
  },
  paragraph(token) {
    console.log('token', token)

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
  


export {
    markdownToHtml,
    test_click_utils
}